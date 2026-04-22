// BEGIN MODULE: workers/rolls/display
function buildDiceDetails(diceResults) {
  return diceResults.join(" + ");
}

function getDieToneStyle(tone) {
  if (tone === "success") {
    return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #9fcb9f;background:#dff3df;color:#1f5f1f;font-weight:700;line-height:1;";
  }
  if (tone === "fail") {
    return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #e3a8af;background:#f8d7da;color:#7a0f1b;font-weight:700;line-height:1;";
  }
  return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #d0d0d0;background:#ececec;color:#111111;font-weight:700;line-height:1;";
}

function buildDetailsDice(diceResults, maxDice = 20) {
  return diceResults.slice(0, maxDice).map((die) => {
    let tone = "neutral";
    if (die === 1) tone = "fail";
    if (die >= 5) tone = "success";
    return { value: `${die}`, tone: tone, style: getDieToneStyle(tone) };
  });
}

function buildProbeRows(resolvedFields, definition) {
  const ignoredKeys = new Set(["name", "Pool", "Erfolge", "Details"]);
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

function buildWeaponProbePresentation(payload) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const resolvedFields = payload.resolvedFields || {};
  const baseAmmo = `${resolvedFields.Munition || ""}`;
  const popupAmmo = findAllRowValues(rows, "Munition").find((value) => value && value !== baseAmmo) || "";
  const damageType = findLastRowValue(rows, "Schadenstyp");
  const attackValue = findLastRowValue(rows, "Angriffswert");
  const finalDamage = findLastRowValue(rows, "Schaden") || `${resolvedFields.Schadenswert || ""}`;
  const baseDamage = `${resolvedFields.Schadenswert || ""}`;
  const attackValueMod = findLastRowValue(rows, "Angriffswert-Modifikator");
  const damageMod = findLastRowValue(rows, "Schadens-Modifikator");
  const attackValueBase = findLastRowValue(rows, "Angriffswert-Basis");
  const damageBase = findLastRowValue(rows, "Schaden-Basis") || baseDamage;
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

  if (specialization) {
    calcParts.push(`Spezialisierung: ${specialization}`);
  }
  if (expertise) {
    calcParts.push(`Expertise: ${expertise}`);
  }
  if (attackValueMod) {
    calcParts.push(`Angriffswert-Modifikator: ${attackValueMod}`);
  }
  if (damageMod) {
    calcParts.push(`Schadens-Modifikator: ${damageMod}`);
  }
  if (attackValueBase) {
    calcParts.push(`Angriffswert-Basis: ${attackValueBase}`);
  }
  if (damageBase) {
    calcParts.push(`Schaden-Basis: ${damageBase}`);
  }

  return {
    weaponLayout: true,
    weapon: `${resolvedFields.Waffe || ""}`,
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

function buildSr6ProbeMessage(payload) {
  const parts = ["&{template:sr6probe}"];
  const name = payload.name || "Probe";
  parts.push(`{{name=${name}}}`);

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

    if (payload.details) {
      parts.push(`{{details=${payload.details}}}`);
    }

    const detailsDice = Array.isArray(payload.detailsDice) ? payload.detailsDice : [];
    if (detailsDice.length > 0) {
      parts.push("{{details_dice=1}}");
      detailsDice.forEach((die, index) => {
        const dieIndex = index + 1;
        parts.push(`{{d${dieIndex}_v=${die.value}}}`);
        parts.push(`{{d${dieIndex}_t=${die.tone}}}`);
        parts.push(`{{d${dieIndex}_s=${die.style}}}`);
      });
    }

    if (payload.isGlitch) {
      parts.push("{{is_glitch=1}}");
    }

    return parts.join(" ");
  }

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const deferredExtraLabels = new Set([
    "Munitionshinweis",
    "Angriffswert-Basis",
    "Angriffswert-Modifikator",
    "Angriffswert",
    "Schaden-Basis",
    "Schadens-Modifikator",
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

  if (payload.details) {
    parts.push(`{{details=${payload.details}}}`);
  }

  const detailsDice = Array.isArray(payload.detailsDice) ? payload.detailsDice : [];
  if (detailsDice.length > 0) {
    parts.push("{{details_dice=1}}");
    detailsDice.forEach((die, index) => {
      const dieIndex = index + 1;
      parts.push(`{{d${dieIndex}_v=${die.value}}}`);
      parts.push(`{{d${dieIndex}_t=${die.tone}}}`);
      parts.push(`{{d${dieIndex}_s=${die.style}}}`);
    });
  }

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function buildEdgeTokenMessage(actionText, edgeCurrent) {
  return `&{template:default} {{name=Edge Token}} {{Details=Hat 1 Edge ${actionText}. <br /> Aktuelles Edge: ${edgeCurrent}.}}`;
}
// END MODULE: workers/rolls/display
