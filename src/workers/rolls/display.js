// BEGIN MODULE: workers/rolls/display
// Wandelt berechnete Wuerfe in Rolltemplate-Felder um, inklusive farbiger Detailwuerfel und spezieller Template-Varianten.
function buildDiceDetails(diceResults) {
  return Array.isArray(diceResults) ? diceResults.join(" + ") : "";
}

function buildDetailsDice(diceResults, fateDiceResults = [], maxDice = 20) {
  if (!Array.isArray(diceResults)) return [];

  const fateCount = Array.isArray(fateDiceResults) ? fateDiceResults.length : 0;
  const fateStartIndex = Math.max(0, diceResults.length - fateCount);

  return diceResults.slice(0, maxDice).map((die, index) => {
    let tone = "neutral";
    if (die === 1) tone = "fail";
    if (die >= 5) tone = "success";
    return {
      value: `${die}`,
      tone: tone,
      isFate: fateCount > 0 && index >= fateStartIndex,
    };
  });
}

function appendDetailsDiceTemplateFields(parts, detailsDice) {
  if (!Array.isArray(detailsDice) || detailsDice.length === 0) return;

  detailsDice.forEach((die, index) => {
    const dieIndex = index + 1;
    const tone = die.tone || "neutral";
    parts.push(`{{d${dieIndex}_v=${die.value}}}`);
    if (die.isFate) {
      parts.push(`{{d${dieIndex}_fate=1}}`);
    } else {
      parts.push(`{{d${dieIndex}_${tone}=1}}`);
    }
    if (index < detailsDice.length - 1) {
      parts.push(`{{d${dieIndex}_plus=1}}`);
    }
  });
}

function appendDetailsTemplateFields(parts, payload) {
  const detailsDice = Array.isArray(payload.detailsDice) ? payload.detailsDice : [];
  if (detailsDice.length > 0) {
    parts.push("{{details=1}}");
    appendDetailsDiceTemplateFields(parts, detailsDice);
    return;
  }

  if (payload.details) {
    parts.push("{{details=1}}");
    parts.push(`{{details_text=${payload.details}}}`);
  }
}

function appendEdgeActionTemplateField(parts, payload) {
  if (payload && payload.edgeAction === false) return;
  const characterId = `${(payload && payload.characterId) || ""}`.trim();
  if (!characterId) return;
  parts.push(`{{edge_action=[Edge einsetzen](~${characterId}|sr6_edge_after_roll)}}`);
}

function buildProbeRows(resolvedFields, definition) {
  const ignoredKeys = new Set(["name", "Pool", "Erfolge", "Details"]);
  getInternalRollFields(definition).forEach((key) => ignoredKeys.add(key));
  const preferredOrder = buildRollRowOrder(definition);

  const rows = [];
  const usedKeys = new Set();

  preferredOrder.forEach((key) => {
    if (!ignoredKeys.has(key) && resolvedFields[key]) {
      rows.push({ label: key, value: resolvedFields[key] });
      usedKeys.add(key);
    }
  });

  Object.keys(resolvedFields).forEach((key) => {
    if (ignoredKeys.has(key) || usedKeys.has(key) || !resolvedFields[key]) return;
    rows.push({ label: key, value: resolvedFields[key] });
  });

  if (hasWeaponTemplateVariant(definition)) {
    return rows;
  }

  return rows.slice(0, 4);
}

function getShortLabelValue(value) {
  if (!value) return "";
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function deriveProbeTitle(resolvedFields, poolAttribute, definition) {
  const explicitName = resolvedFields.name;
  const resolvedDefinition = definition || resolveRollDefinition(resolvedFields, poolAttribute);

  if (resolvedDefinition && resolvedDefinition.fixedTitle) {
    return resolvedDefinition.fixedTitle;
  }

  if (resolvedDefinition && resolvedDefinition.titleMode === "field-short" && resolvedDefinition.titleField) {
    const shortFieldValue = getShortLabelValue(resolvedFields[resolvedDefinition.titleField]);
    if (shortFieldValue) {
      return shortFieldValue;
    }
  }

  const titleFromPoolAttribute = findRollTitleByPoolAttribute(poolAttribute);
  if (titleFromPoolAttribute) {
    return titleFromPoolAttribute;
  }

  if (explicitName && resolvedDefinition && resolvedDefinition.titleMode === "explicit-name") {
    return explicitName;
  }

  if (explicitName) return explicitName;
  if (resolvedDefinition && resolvedDefinition.titleFallback) return resolvedDefinition.titleFallback;
  return "Probe";
}

function hasWeaponTemplateVariant(definition) {
  return !!(definition && definition.templateVariant === "weapon");
}

function hasSpellTemplateVariant(definition) {
  return !!(definition && definition.templateVariant === "spell");
}

function findLastRowValue(rows, label) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index] && rows[index].label === label) {
      return `${rows[index].value}`;
    }
  }
  return "";
}

function findAllRowValues(rows, label) {
  return rows
    .filter((row) => row && row.label === label)
    .map((row) => `${row.value}`);
}

function isWeaponPresentationWhipContext(resolvedFields, rows) {
  const candidates = [
    resolvedFields && resolvedFields.Waffentyp,
    findLastRowValue(rows, "Waffentyp"),
  ];

  return candidates.some((value) => normalizeCombatSpecializationName(value) === normalizeCombatSpecializationName("Peitschen"));
}

function resolveWeaponPresentationAttackValue(rows, resolvedFields) {
  const derivedAttackValue = findLastRowValue(rows, "Angriffswert");
  if (derivedAttackValue) {
    return derivedAttackValue;
  }

  if (!isWeaponPresentationWhipContext(resolvedFields, rows)) {
    return "";
  }

  const baseAttackValue = parseNumber((resolvedFields && resolvedFields.Angriffswert) || findLastRowValue(rows, "Angriffswert-Basis"));
  const reactionValue = parseNumber(
    findLastRowValue(rows, "Reaktion-Wert") ||
    ((resolvedFields && resolvedFields["Reaktion-Wert"]) || 0)
  );

  return `${baseAttackValue + reactionValue}`;
}

function buildWeaponProbePresentation(payload) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const resolvedFields = payload.resolvedFields || {};
  const baseAmmo = `${resolvedFields.Munition || ""}`;
  const popupAmmo = findAllRowValues(rows, "Munition").find((value) => value && value !== baseAmmo) || "";
  const attribute = findLastRowValue(rows, "Attribut") || `${resolvedFields.Attribut || ""}`;
  const damageType = findLastRowValue(rows, "Schadenstyp") || `${resolvedFields.Schadenstyp || ""}`;
  const attackValue = resolveWeaponPresentationAttackValue(rows, resolvedFields);
  const finalDamage = findLastRowValue(rows, "Schaden") || `${resolvedFields.Schadenswert || ""}`;
  const baseDamage = `${resolvedFields.Schadenswert || ""}`;
  const attackValueMod = findLastRowValue(rows, "Angriffswert-Modifikator");
  const damageMod = findLastRowValue(rows, "Schadens-Modifikator") || findLastRowValue(rows, "Schaden-Modifikator");
  const attackValueBase = findLastRowValue(rows, "Angriffswert-Basis");
  const damageBase = findLastRowValue(rows, "Schaden-Basis") || baseDamage;
  const fireMode = findLastRowValue(rows, "Feuermodus");
  const fireModeShots = findLastRowValue(rows, "Feuermodus-Schuss");
  const fireModeAttackValueMod = findLastRowValue(rows, "Feuermodus-Angriffswert");
  const fireModeDamageMod = findLastRowValue(rows, "Feuermodus-Schaden");
  const attributeFallback = findLastRowValue(rows, "Attribut-Fallback");
  const edgeBoost = findLastRowValue(rows, "Edge-Boost");
  const edgeCost = findLastRowValue(rows, "Edge-Kosten");
  const edgePoolBonus = findLastRowValue(rows, "Edge-Poolbonus");
  const fateDice = findLastRowValue(rows, "Schicksalswürfel");
  const fateDiceRoll = findLastRowValue(rows, "Schicksalswürfel-Wurf");
  const fateDiceSource = findLastRowValue(rows, "Schicksalswürfel-Quelle");
  const canceledFives = findLastRowValue(rows, "Normale 5en annulliert");
  const matrixLoner = findLastRowValue(rows, "Einzelgänger");
  const edgeReaction = findLastRowValue(rows, "Edge-Reaktion");
  const extraNotes = [];
  const calcParts = [];
  const specialization = findLastRowValue(rows, "Spezialisierung");
  const expertise = findLastRowValue(rows, "Expertise");

  findAllRowValues(rows, "Munitionshinweis").forEach((hint) => {
    if (!hint || hint.includes("Salvenfeuer und Vollautomatik")) {
      return;
    }
    extraNotes.push(hint);
  });
  findAllRowValues(rows, "Feuermodus-Hinweis").forEach((hint) => {
    if (hint) {
      extraNotes.push(hint);
    }
  });
  findAllRowValues(rows, "Edge-Hinweis").forEach((hint) => {
    if (hint) {
      extraNotes.push(hint);
    }
  });
  findAllRowValues(rows, "Schicksalswürfel-Hinweis").forEach((hint) => {
    if (hint) {
      extraNotes.push(hint);
    }
  });

  if (specialization) {
    calcParts.push(`Spezialisierung: ${specialization}`);
  }
  if (expertise) {
    calcParts.push(`Expertise: ${expertise}`);
  }
  if (attributeFallback) {
    calcParts.push(`Attribut-Fallback: ${attributeFallback}`);
  }
  if (fireMode) {
    calcParts.push(`Feuermodus: ${fireMode}`);
  }
  if (fireModeShots) {
    calcParts.push(`Schuss: ${fireModeShots}`);
  }
  if (fireModeAttackValueMod) {
    calcParts.push(`Feuermodus-Angriffswert: ${fireModeAttackValueMod}`);
  }
  if (fireModeDamageMod) {
    calcParts.push(`Feuermodus-Schaden: ${fireModeDamageMod}`);
  }
  if (attackValueMod) {
    calcParts.push(`Angriffswert-Modifikator: ${attackValueMod}`);
  }
  if (damageMod) {
    calcParts.push(`Schadens-Modifikator: ${damageMod}`);
  }
  const attackValueFormula = findLastRowValue(rows, "Angriffswert-Formel");
  const reactionValue = findLastRowValue(rows, "Reaktion-Wert") || `${resolvedFields["Reaktion-Wert"] || ""}`;
  if (attackValueFormula) {
    calcParts.push(`Angriffswert-Formel: ${attackValueFormula}`);
  }
  if (attackValueBase) {
    calcParts.push(`Angriffswert-Basis: ${attackValueBase}`);
  }
  if (reactionValue && isWeaponPresentationWhipContext(resolvedFields, rows)) {
    calcParts.push(`Reaktion-Wert: ${reactionValue}`);
  }
  if (damageBase) {
    calcParts.push(`Schaden-Basis: ${damageBase}`);
  }
  if (edgeBoost) {
    calcParts.push(`Edge-Boost: ${edgeBoost}`);
  }
  if (edgeCost) {
    calcParts.push(`Edge-Kosten: ${edgeCost}`);
  }
  if (edgePoolBonus) {
    calcParts.push(`Edge-Poolbonus: ${edgePoolBonus}`);
  }
  if (fateDice) {
    calcParts.push(`Schicksalswürfel: ${fateDice}`);
  }
  if (fateDiceRoll) {
    calcParts.push(`Schicksalswürfel-Wurf: ${fateDiceRoll}`);
  }
  if (fateDiceSource) {
    calcParts.push(`Schicksalswürfel-Quelle: ${fateDiceSource}`);
  }
  if (canceledFives) {
    calcParts.push(`Normale 5en annulliert: ${canceledFives}`);
  }
  if (matrixLoner) {
    calcParts.push(`Einzelgänger: ${matrixLoner}`);
  }
  if (edgeReaction) {
    calcParts.push(`Edge-Reaktion: ${edgeReaction}`);
  }

  return {
    weaponLayout: true,
    weapon: `${resolvedFields.Waffe || ""}`,
    attribute: attribute,
    attackValue: `${attackValue || ""}`,
    ammo: popupAmmo || baseAmmo,
    range: `${resolvedFields.Reichweite || ""}`,
    damageSummary: finalDamage
      ? damageType
        ? `<strong>${finalDamage}</strong>, Schadenstyp: ${damageType}`
        : `<strong>${finalDamage}</strong>`
      : "",
    extraRows: extraNotes.join("<br>"),
    calcRows: calcParts.join(" | "),
  };
}

function buildSpellProbePresentation(payload) {
  const resolvedFields = payload.resolvedFields || {};
  const spellType = `${resolvedFields.Art || ""}`;
  const isCombatSpell = spellType === "Kampf";
  const spellDamage = `${payload.spellDamage || ""}`;

  return {
    spell: `${resolvedFields.Zauber || ""}`,
    attackValue: isCombatSpell ? `${payload.spellAttackValue || resolvedFields.Angriffswert || ""}` : "",
    art: spellType,
    range: `${resolvedFields.Reichweite || ""}`,
    duration: `${resolvedFields.Dauer || ""}`,
    damage: isCombatSpell ? spellDamage : "",
    notes: `${resolvedFields.Notiz || ""}`,
    drainValue: `${payload.drainValue || ""}`,
    drainDamage: `${payload.drainDamage || ""}`,
    drainDamageType: `${payload.drainDamageType || ""}`,
  };
}

function buildSr6ProbeMessage(payload) {
  const parts = ["&{template:sr6probe}"];
  const name = payload.name || "Probe";
  parts.push(`{{name=${name}}}`);

  if (hasSpellTemplateVariant(payload.definition)) {
    const presentation = buildSpellProbePresentation(payload);
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const spellBaseLabels = new Set([
      "Zauber",
      "Art",
      "Reichweite",
      "Dauer",
      "Entzug",
      "Schaden",
      "Notiz",
      "Entzugwiderstand",
    ]);
    const spellExtraRows = rows
      .filter((row) => row && row.label && !spellBaseLabels.has(row.label))
      .filter((row) => !(row.label === "Popup-Modifikator" && parseNumber(row.value) === 0));

    parts.push("{{spell_layout=1}}");
    if (presentation.spell) parts.push(`{{spell=${presentation.spell}}}`);
    if (presentation.attackValue) parts.push(`{{attack_value=${presentation.attackValue}}}`);
    if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
      parts.push(`{{pool=${payload.pool}}}`);
    }
    if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
      parts.push(`{{erfolge=${payload.erfolge}}}`);
    }
    if (presentation.damage) {
      parts.push(`{{spell_damage=${presentation.damage}}}`);
    }
    appendDetailsTemplateFields(parts, payload);
    appendEdgeActionTemplateField(parts, payload);

    if (presentation.drainValue) parts.push(`{{drain_value=${presentation.drainValue}}}`);
    if (presentation.drainDamage) {
      const drainDamageSummary = presentation.drainDamageType
        ? `${presentation.drainDamage} (${presentation.drainDamageType})`
        : presentation.drainDamage;
      parts.push(`{{drain_damage=${drainDamageSummary}}}`);
    }
    if (payload.drainDetails) parts.push(`{{drain_details=${payload.drainDetails}}}`);
    if (presentation.art) parts.push(`{{description_art=${presentation.art}}}`);
    if (presentation.range) parts.push(`{{description_range=${presentation.range}}}`);
    if (presentation.duration) parts.push(`{{description_duration=${presentation.duration}}}`);
    if (presentation.damage) parts.push(`{{description_damage=${presentation.damage}}}`);
    if (presentation.notes) parts.push(`{{description_notes=${presentation.notes}}}`);
    if (spellExtraRows.length > 0) {
      parts.push(`{{extra_rows=${spellExtraRows.map((row) => `${row.label}: ${row.value}`).join(" | ")}}}`);
    }

    if (payload.isGlitch) {
      parts.push("{{is_glitch=1}}");
    }

    return parts.join(" ");
  }

  if (hasWeaponTemplateVariant(payload.definition)) {
    const presentation = buildWeaponProbePresentation(payload);

    parts.push("{{weapon_layout=1}}");
    if (presentation.weapon) parts.push(`{{weapon=${presentation.weapon}}}`);
    if (presentation.attackValue) parts.push(`{{attack_value=${presentation.attackValue}}}`);
    if (presentation.ammo) parts.push(`{{ammo=${presentation.ammo}}}`);
    if (presentation.range) parts.push(`{{range=${presentation.range}}}`);
    if (presentation.damageSummary) parts.push(`{{damage_summary=${presentation.damageSummary}}}`);
    if (presentation.extraRows) parts.push(`{{extra_rows=${presentation.extraRows}}}`);
    if (presentation.calcRows) parts.push(`{{calc_rows=${presentation.calcRows}}}`);

    if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
      parts.push(`{{pool=${payload.pool}}}`);
    }

    if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
      parts.push(`{{erfolge=${payload.erfolge}}}`);
    }

    appendDetailsTemplateFields(parts, payload);
    appendEdgeActionTemplateField(parts, payload);

    if (payload.isGlitch) {
      parts.push("{{is_glitch=1}}");
    }

    return parts.join(" ");
  }

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const deferredExtraLabels = new Set([
    "Munitionshinweis",
    "Feuermodus",
    "Feuermodus-Schuss",
    "Feuermodus-Hinweis",
    "Feuermodus-Angriffswert",
    "Feuermodus-Schaden",
    "Angriffswert-Basis",
    "Angriffswert-Modifikator",
    "Angriffswert",
    "Schaden-Basis",
    "Schadens-Modifikator",
    "Schaden-Modifikator",
    "Schaden",
  ]);
  const primaryCandidateRows = rows.filter((row) => !deferredExtraLabels.has(row.label));
  const primaryRows = primaryCandidateRows.slice(0, 4);
  const primaryRowKeys = new Set(
    primaryRows.map((row) => `${row.label}:::${row.value}`)
  );
  const seenExtraRowKeys = new Set();
  const extraRows = rows.filter((row) => {
    if (row.label === "Popup-Modifikator") {
      return false;
    }
    const rowKey = `${row.label}:::${row.value}`;
    if (primaryRowKeys.has(rowKey) || seenExtraRowKeys.has(rowKey)) {
      return false;
    }
    seenExtraRowKeys.add(rowKey);
    return true;
  });
  const ammoHintRows = extraRows.filter((row) => row.label === "Munitionshinweis");
  const nonHintExtraRows = extraRows.filter((row) => row.label !== "Munitionshinweis");

  primaryRows.forEach((row, index) => {
    const rowNumber = index + 1;
    parts.push(`{{label${rowNumber}=${row.label}}}`);
    parts.push(`{{value${rowNumber}=${row.value}}}`);
  });

  if (ammoHintRows.length > 0) {
    const ammoHintsMarkup = ammoHintRows
      .map((row) => `${row.label}: ${row.value}`)
      .join("<br>");
    parts.push(`{{ammo_hints=${ammoHintsMarkup}}}`);
  }

  if (nonHintExtraRows.length > 0) {
    const extraRowsMarkup = nonHintExtraRows
      .map((row) => `${row.label}: ${row.value}`)
      .join(" | ");
    parts.push(`{{extra_rows=${extraRowsMarkup}}}`);
  }

  if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
    parts.push(`{{pool=${payload.pool}}}`);
  }

  if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
    parts.push(`{{erfolge=${payload.erfolge}}}`);
  }

  appendDetailsTemplateFields(parts, payload);
  appendEdgeActionTemplateField(parts, payload);

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function buildEdgeTokenMessage(actionText, edgeCurrent) {
  return `&{template:default} {{name=Edge Token}} {{Details=Hat 1 Edge ${actionText}. <br /> Aktuelles Edge: ${edgeCurrent}.}}`;
}
// END MODULE: workers/rolls/display
