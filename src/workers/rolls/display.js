// BEGIN MODULE: workers/rolls/display
// Wandelt berechnete Wuerfe in das gemeinsame sr6probe-Rolltemplate um.
function buildDiceDetails(diceResults) {
  return Array.isArray(diceResults) ? diceResults.join(" + ") : "";
}

function buildDetailsDice(diceResults, fateDiceResults = [], maxDice = 20, diceTrace = []) {
  if (!Array.isArray(diceResults)) return [];

  const fateCount = Array.isArray(fateDiceResults) ? fateDiceResults.length : 0;
  const fateStartIndex = Math.max(0, diceResults.length - fateCount);
  const trace = Array.isArray(diceTrace) ? diceTrace : [];
  const hasTrace = trace.length > 0;

  const detailsDice = diceResults.map((die, index) => {
    const tracedDie = trace[index] || {};
    let tone = "neutral";
    if (die === 1) tone = "fail";
    if (die >= 5) tone = "success";
    return {
      value: `${die}`,
      tone: tone,
      isFate: hasTrace ? !!tracedDie.isFate : (fateCount > 0 && index >= fateStartIndex),
      isExploded: !!tracedDie.isExploded,
      isFateExplosion: !!tracedDie.isFateExplosion,
    };
  });
  const regularDice = detailsDice.filter((die) => !die.isFate && !die.isFateExplosion);
  const fateDice = detailsDice.filter((die) => die.isFate || die.isFateExplosion);
  const visibleFateDice = fateDice.slice(-maxDice);
  const regularLimit = Math.max(0, maxDice - visibleFateDice.length);

  return [...regularDice.slice(0, regularLimit), ...visibleFateDice];
}

function buildNeutralDetailsDice(diceResults, maxDice = 20) {
  if (!Array.isArray(diceResults)) return [];

  return diceResults.slice(0, maxDice).map((die) => ({
    value: `${die}`,
    tone: "neutral",
    isFate: false,
  }));
}

function appendDetailsDiceTemplateFields(parts, detailsDice) {
  if (!Array.isArray(detailsDice) || detailsDice.length === 0) return;

  detailsDice.forEach((die, index) => {
    const dieIndex = index + 1;
    const tone = die.tone || "neutral";
    parts.push(`{{d${dieIndex}_v=${die.value}}}`);
    if (die.isFate) {
      parts.push(`{{d${dieIndex}_${die.isExploded ? "fate_exploded" : "fate"}=1}}`);
    } else if (die.isExploded) {
      parts.push(`{{d${dieIndex}_${tone}_exploded=1}}`);
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

  return rows;
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

function getSubjectFieldLabel(resolvedFields, definition) {
  const fields = resolvedFields || {};
  const primaryFields = definition && Array.isArray(definition.primaryFields)
    ? definition.primaryFields
    : [];
  const candidates = [
    ...primaryFields,
    "Waffe",
    "Zauber",
    "Geist",
    "Handlung",
    "Fahrzeug",
    "Gerät",
    "Geraet",
    "Ausrüstung",
    "Fertigkeit",
    "Attributsprobe",
    "Attribut",
    "Wert",
    "Probe",
  ];

  for (let index = 0; index < candidates.length; index += 1) {
    const label = candidates[index];
    if (fields[label]) return label;
  }

  if (definition && definition.matchField && fields[definition.matchField]) {
    return definition.matchField;
  }

  return "Name";
}

function normalizeSubjectLabel(label) {
  if (label === "Geraet") return "Gerät";
  if (label === "Fahrzeug") return "Gerät";
  if (label === "Attributsprobe") return "Handlung";
  return label || "Name";
}

function getSubjectValue(resolvedFields, subjectFieldLabel, title) {
  const fields = resolvedFields || {};
  const value = fields[subjectFieldLabel] || "";
  if (value) return value;
  return getShortLabelValue(title || "Probe") || "Probe";
}

function shouldIncludeCalcDetailRow(row, subjectFieldLabel) {
  if (!row || !row.label) return false;
  const value = `${row.value || ""}`.trim();
  if (!value) return false;
  if (row.label === subjectFieldLabel) return false;
  if (row.label === "name" || row.label === "Pool" || row.label === "Erfolge" || row.label === "Details") return false;
  if (row.label === "Popup-Modifikator" && parseNumber(value) === 0) return false;
  return true;
}

function formatDebugModifier(value) {
  const numberValue = parseNumber(value);
  return numberValue > 0 ? `+${numberValue}` : `${numberValue}`;
}

function appendDebugRow(rows, label, value) {
  if (value === undefined || value === null || `${value}` === "") return;
  rows.push({ label: label, value: `${value}` });
}

function appendNonZeroDebugModifierRow(rows, label, value) {
  if (parseNumber(value) === 0) return;
  appendDebugRow(rows, label, formatDebugModifier(value));
}

function findLastDetailRowValue(rows, label) {
  if (!Array.isArray(rows)) return "";
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (row && row.label === label) {
      return `${row.value || ""}`.trim();
    }
  }
  return "";
}

function parsePoolComponentValue(row) {
  const value = `${row && row.value !== undefined && row.value !== null ? row.value : ""}`.trim();
  if (!value) return 0;
  if (row && row.label === "Ungeübt") {
    const match = value.match(/[-+]?\d+/g);
    return match && match.length > 0 ? parseNumber(match[match.length - 1]) : 0;
  }
  return parseNumber(value);
}

function getLanguageLevelBonusFromRows(rows) {
  const languageLevelRow = (Array.isArray(rows) ? rows : []).find((row) => row && row.label === "Sprachniveau");
  const languageLevel = `${languageLevelRow && languageLevelRow.value ? languageLevelRow.value : ""}`.trim();
  const bonusMatch = languageLevel.match(/\(([+-]?\d+)\)/);
  return bonusMatch ? parseNumber(bonusMatch[1]) : 0;
}

function isPoolBonusComponent(row, poolBonusLabels) {
  if (!row) return false;
  if (row.poolComponent) return true;
  if (!poolBonusLabels.has(row.label)) return false;
  const value = `${row.value === undefined || row.value === null ? "" : row.value}`.trim();
  if (row.label === "Ungeübt") return /[-+]?\d+/.test(value);
  return /^[-+]?\d+/.test(value);
}

function collectPoolBasisComponents(rows) {
  const detailRows = Array.isArray(rows) ? rows : [];
  const poolBonusLabels = new Set(["Spezialisierung", "Expertise", "Spezialisierung/Expertise", "Ungeübt", "Sprachbonus"]);
  let markedComponents = [
    ...detailRows.filter((row) => row && row.poolComponent),
    ...detailRows.filter((row) => row && !row.poolComponent && isPoolBonusComponent(row, poolBonusLabels)),
  ]
    .filter((row) => `${row.value === undefined || row.value === null ? "" : row.value}`.trim() !== "")
    .map((row) => parsePoolComponentValue(row));
  const languageLevelBonus = getLanguageLevelBonusFromRows(detailRows);
  if (languageLevelBonus !== 0 && !detailRows.some((row) => row && row.label === "Sprachbonus")) {
    markedComponents.push(languageLevelBonus);
  }

  if (markedComponents.length > 0) {
    return markedComponents;
  }

  const componentLabels = [
    "Attributwert Basis",
    "Attributwert Modifikator",
    "Fertigkeitswert Basis",
    "Fertigkeitswert Modifikator",
    "Spezialisierung",
    "Expertise",
    "Ungeübt",
    "Basis",
    "Modifikator",
  ];

  const fallbackComponents = componentLabels
    .map((label) => findLastDetailRowValue(detailRows, label))
    .filter((value) => value !== "")
    .map((value) => parseNumber(value));
  if (languageLevelBonus !== 0 && !detailRows.some((row) => row && row.label === "Sprachbonus")) {
    fallbackComponents.push(languageLevelBonus);
  }

  return fallbackComponents;
}

function formatPoolFormulaComponent(value, index) {
  const numberValue = parseNumber(value);
  if (numberValue < 0) return `- ${Math.abs(numberValue)}`;
  if (index === 0) return `${numberValue}`;
  return `+ ${numberValue}`;
}

function buildPoolFormulaText(components, fallbackValue) {
  const visibleComponents = (Array.isArray(components) ? components : [])
    .map((value) => parseNumber(value))
    .filter((value) => value !== 0);

  if (visibleComponents.length === 0) {
    return `${parseNumber(fallbackValue)}`;
  }

  return visibleComponents
    .map((value, index) => formatPoolFormulaComponent(value, index))
    .join(" ");
}

function reconcilePoolFormulaComponents(components, poolBasis) {
  const formulaComponents = Array.isArray(components) ? [...components] : [];
  if (formulaComponents.length <= 1) return formulaComponents;

  const componentTotal = formulaComponents.reduce((sum, value) => sum + parseNumber(value), 0);
  const missingComponent = parseNumber(poolBasis) - componentTotal;
  if (missingComponent !== 0) {
    formulaComponents.push(missingComponent);
  }

  return formulaComponents;
}

function buildComputationDebugRows(computation, sourceRows) {
  if (!computation || computation.pool === undefined || computation.pool === null) return [];

  const rows = [];
  const poolBasisRaw = parseNumber(computation.poolBasisRaw);
  const poolMultiplier = Math.max(1, parseNumber(computation.poolMultiplier) || 1);
  const poolPreMultiplier = parseNumber(computation.poolPreMultiplier);
  const poolMultiplierBonus = parseNumber(computation.poolMultiplierBonus);
  const poolBasis = parseNumber(computation.poolBasis);
  const monitorPoolMod = parseNumber(computation.monitorPoolMod);
  const poolPopupMod = parseNumber(computation.poolPopupMod);
  const poolRollMod = parseNumber(computation.poolRollMod);
  const edgePoolBonus = parseNumber(computation.edgePoolBonus);
  const poolBasisComponents = collectPoolBasisComponents(sourceRows);
  const poolFormulaComponents = reconcilePoolFormulaComponents(
    poolBasisComponents.length > 1 ? poolBasisComponents : [poolBasisRaw],
    poolBasisRaw
  );
  const poolFormula = buildPoolFormulaText(
    [
      ...poolFormulaComponents,
      monitorPoolMod,
      poolPopupMod,
      poolRollMod,
      edgePoolBonus,
      poolMultiplierBonus,
    ],
    poolBasis
  );

  appendDebugRow(rows, "Pool-Rechnung", `${poolFormula} = ${parseNumber(computation.pool)}`);
  appendDebugRow(rows, "Pool-Basis", `${poolBasis}`);
  if (poolMultiplier !== 1) {
    appendDebugRow(rows, "Pool-Basis vor Multiplikator", `${poolPreMultiplier}`);
    appendDebugRow(rows, "Pool-Multiplikator", `x${poolMultiplier}`);
    appendDebugRow(rows, "Pool-Multiplikator-Bonus", formatDebugModifier(poolMultiplierBonus));
  }
  appendNonZeroDebugModifierRow(rows, "Pool-Zustandsmodifikator", monitorPoolMod);
  appendNonZeroDebugModifierRow(rows, "Pool-Popup-Modifikator", poolPopupMod);
  appendNonZeroDebugModifierRow(rows, "Pool-Wert-Modifikator", poolRollMod);
  appendNonZeroDebugModifierRow(rows, "Pool-Edgebonus", edgePoolBonus);

  if (parseNumber(computation.requestedFateDiceCount) > 0 || parseNumber(computation.fateDiceCount) > 0) {
    appendDebugRow(rows, "Schicksalswürfel angefordert", `${parseNumber(computation.requestedFateDiceCount)}`);
    appendDebugRow(rows, "Schicksalswürfel genutzt", `${parseNumber(computation.fateDiceCount)}`);
    appendDebugRow(rows, "Normale Poolwürfel", `${parseNumber(computation.regularPool)}`);
  }

  return rows;
}

function getCalcDetailSourceGroupKey(label, subjectFieldLabel) {
  if (label === "Sprachniveau") return "language";
  if (label === "Attributsprobe" || label === "Formel") return "formula";
  if (subjectFieldLabel === "Attribut" && (label === "Basis" || label === "Modifikator" || label === "Gesamtwert")) return "attribute";
  if (label === "Attribut" || label.indexOf("Attributwert ") === 0) return "attribute";
  if (label.indexOf("Fertigkeitswert ") === 0) return "skill";
  if (
    label === "Popup-Modifikator" ||
    label === "Expertise" ||
    label === "Spezialisierung/Expertise" ||
    label === "Ungeübt" ||
    label === "Attribut x2" ||
    label === "Stufe x2" ||
    label === "Edge-Boost" ||
    label === "Edge-Kosten" ||
    label === "Edge-Poolbonus" ||
    label === "Edge-Hinweis" ||
    label === "Schicksalswürfel" ||
    label === "Schicksalswürfel-Wurf" ||
    label === "Schicksalswürfel-Quelle" ||
    label === "Schicksalswürfel begrenzt"
  ) {
    return "popup";
  }
  if (label === "Hinweis" || label.indexOf("-Hinweis") > -1) return "hint";
  const formulaComponentMatch = label.match(/^(.+) (Basis|Modifikator|Gesamtwert)$/);
  if (formulaComponentMatch && formulaComponentMatch[1] !== "Pool") {
    return `component:${formulaComponentMatch[1]}`;
  }
  return "general";
}

function getCalcDetailSourceGroupTitle(groupKey) {
  if (groupKey === "attribute") return "Attributsberechnung";
  if (groupKey === "skill") return "Fertigkeitsberechnung";
  if (groupKey === "popup") return "Popup-Modifikatoren";
  if (groupKey === "hint") return "Hinweis";
  if (groupKey && groupKey.indexOf("component:") === 0) {
    return `${groupKey.slice("component:".length)} Berechnung`;
  }
  return "";
}

function hasLanguageBonusRow(rows) {
  const sourceRows = Array.isArray(rows) ? rows : [];
  return sourceRows.some((row) => (
    row &&
    row.label === "Sprachbonus" &&
    parseNumber(row.value) !== 0
  )) || getLanguageLevelBonusFromRows(sourceRows) !== 0;
}

function shouldSuppressSourceDetailRow(row) {
  return row && row.label === "Sprachbonus";
}

function buildSourceDetailEntry(row, sourceRows) {
  let label = row.label;
  let value = `${row.value || ""}`.trim();
  if (label === "Formel" && hasLanguageBonusRow(sourceRows) && value.indexOf("Sprachbonus") === -1) {
    value = `${value} + Sprachbonus`;
  }
  if (label === "Edge-Hinweis") {
    label = "Schicksalswürfel-Edge-Hinweis";
  } else if (label === "Schicksalswürfel-Hinweis") {
    label = "Hinweis";
  }
  return `${label}: ${value}`;
}

function appendSourceDetailGroup(groups, group) {
  if (!group || group.entries.length === 0) return;
  const title = getCalcDetailSourceGroupTitle(group.key);
  const details = group.entries.join(", ");
  const existingGroup = groups.find((sourceGroup) => sourceGroup.title === title);
  if (existingGroup) {
    existingGroup.details = `${existingGroup.details}, ${details}`;
    return;
  }
  groups.push({ title, details });
}

function buildCalcDetailGroups(rows, subjectFieldLabel, payload) {
  const debugDetails = [];
  const sourceGroups = [];
  let currentSourceGroup = null;
  const seen = new Set();
  const debugRows = buildComputationDebugRows(payload && payload.computation, rows);

  function appendCalcDetail(row, target) {
    if (!shouldIncludeCalcDetailRow(row, subjectFieldLabel)) return;
    const label = row.label;
    const value = `${row.value || ""}`.trim();
    const entry = `${label}: ${value}`;
    if (seen.has(entry)) return;
    seen.add(entry);
    target.push(entry);
  }

  function appendSourceDetail(row) {
    if (!shouldIncludeCalcDetailRow(row, subjectFieldLabel)) return;
    if (shouldSuppressSourceDetailRow(row)) return;
    const label = row.label;
    const entry = buildSourceDetailEntry(row, rows);
    if (seen.has(entry)) return;
    seen.add(entry);

    const groupKey = getCalcDetailSourceGroupKey(label, subjectFieldLabel);
    if (!currentSourceGroup || currentSourceGroup.key !== groupKey) {
      appendSourceDetailGroup(sourceGroups, currentSourceGroup);
      currentSourceGroup = { key: groupKey, entries: [] };
    }

    currentSourceGroup.entries.push(entry);
  }

  debugRows.forEach((row) => appendCalcDetail(row, debugDetails));
  (Array.isArray(rows) ? rows : []).forEach((row) => appendSourceDetail(row));
  appendSourceDetailGroup(sourceGroups, currentSourceGroup);

  return {
    summary: debugDetails.join(", "),
    sourceGroups: sourceGroups,
  };
}

function appendCalcDetailsGroupTemplateFields(parts, prefix, group) {
  if (!group || !group.details) return;
  if (group.title) parts.push(`{{${prefix}_title=${group.title}}}`);
  parts.push(`{{${prefix}=${group.details}}}`);
}

function appendCalcDetailsTemplateFields(parts, rows, subjectFieldLabel, payload) {
  const groups = buildCalcDetailGroups(rows, subjectFieldLabel, payload);

  if (groups.summary) {
    parts.push(`{{calc_details=${groups.summary}}}`);
  }
  if (groups.sourceGroups.length > 0) {
    if (!groups.summary) {
      parts.push(`{{calc_details=${groups.sourceGroups[0].details}}}`);
    } else {
      appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources", groups.sourceGroups[0]);
    }
    appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources_2", groups.sourceGroups[1]);
    appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources_3", groups.sourceGroups[2]);
    appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources_4", groups.sourceGroups[3]);
    appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources_5", groups.sourceGroups[4]);
    if (groups.sourceGroups[5]) {
      appendCalcDetailsGroupTemplateFields(parts, "calc_details_sources_6", {
        title: groups.sourceGroups[5].title,
        details: groups.sourceGroups.slice(5).map((group) => group.details).join(", "),
      });
    }
  }
}

function buildSr6ProbeMessage(payload) {
  const parts = ["&{template:sr6probe}"];
  const name = payload.name || "Probe";
  parts.push(`{{name=${name}}}`);

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const subjectFieldLabel = getSubjectFieldLabel(payload.resolvedFields, payload.definition);
  const subjectLabel = normalizeSubjectLabel(subjectFieldLabel);
  const subject = getSubjectValue(payload.resolvedFields, subjectFieldLabel, name);

  if (!payload.suppressSubject) {
    if (subjectLabel) parts.push(`{{subject_label=${subjectLabel}}}`);
    if (subject) parts.push(`{{subject=${subject}}}`);
  }

  if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
    parts.push(`{{pool=${payload.pool}}}`);
  }

  if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
    parts.push(`{{erfolge=${payload.erfolge}}}`);
  }

  if (payload.resultValue !== undefined && payload.resultValue !== null && `${payload.resultValue}` !== "") {
    parts.push(`{{result_label=${payload.resultLabel || "Ergebnis"}}}`);
    parts.push(`{{result_value=${payload.resultValue}}}`);
  }

  appendDetailsTemplateFields(parts, payload);
  appendEdgeActionTemplateField(parts, payload);

  appendCalcDetailsTemplateFields(parts, rows, subjectFieldLabel, payload);

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function buildEdgeTokenMessage(actionText, edgeCurrent) {
  return `&{template:default} {{name=Edge Token}} {{Details=Hat 1 Edge ${actionText}. <br /> Aktuelles Edge: ${edgeCurrent}.}}`;
}
// END MODULE: workers/rolls/display
