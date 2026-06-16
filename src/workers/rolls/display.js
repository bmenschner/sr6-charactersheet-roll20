// BEGIN MODULE: workers/rolls/display
// Wandelt berechnete Wuerfe in das gemeinsame sr6probe-Rolltemplate um.
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
  if (row.label === "Probenmodifikator" && parseNumber(value) === 0) return false;
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
  const poolBonusLabels = new Set(["Spezialisierung", "Expertise", "Spezialisierung/Expertise", "Ungeübt"]);
  const markedComponents = detailRows
    .filter((row) => isPoolBonusComponent(row, poolBonusLabels))
    .filter((row) => `${row.value === undefined || row.value === null ? "" : row.value}`.trim() !== "")
    .map((row) => parsePoolComponentValue(row));

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

  return componentLabels
    .map((label) => findLastDetailRowValue(detailRows, label))
    .filter((value) => value !== "")
    .map((value) => parseNumber(value));
}

function buildComputationDebugRows(computation, sourceRows) {
  if (!computation || computation.pool === undefined || computation.pool === null) return [];

  const rows = [];
  const poolBasisRaw = parseNumber(computation.poolBasisRaw);
  const poolMultiplier = Math.max(1, parseNumber(computation.poolMultiplier) || 1);
  const poolBasis = parseNumber(computation.poolBasis);
  const monitorPoolMod = parseNumber(computation.monitorPoolMod);
  const poolPopupMod = parseNumber(computation.poolPopupMod);
  const poolRollMod = parseNumber(computation.poolRollMod);
  const edgePoolBonus = parseNumber(computation.edgePoolBonus);
  const poolBasisComponents = collectPoolBasisComponents(sourceRows);
  const poolFormulaComponents = poolBasisComponents.length > 1 ? poolBasisComponents : [poolBasis];
  const poolFormula = [
    ...poolFormulaComponents.map((value) => `${value}`),
    `${monitorPoolMod}`,
    `${poolPopupMod}`,
    `${poolRollMod}`,
    `${edgePoolBonus}`,
  ].join(" ");

  appendDebugRow(rows, "Pool-Rechnung", `${poolFormula} = ${parseNumber(computation.pool)}`);
  appendDebugRow(rows, "Pool-Basis", `${poolBasis}`);
  if (poolMultiplier !== 1) {
    appendDebugRow(rows, "Pool-Basis vor Multiplikator", `${poolBasisRaw}`);
    appendDebugRow(rows, "Pool-Multiplikator", `x${poolMultiplier}`);
  }
  appendDebugRow(rows, "Pool-Zustandsmodifikator", formatDebugModifier(monitorPoolMod));
  appendDebugRow(rows, "Pool-Probenmodifikator", formatDebugModifier(poolPopupMod));
  appendDebugRow(rows, "Pool-Wert-Modifikator", formatDebugModifier(poolRollMod));
  appendDebugRow(rows, "Pool-Edgebonus", formatDebugModifier(edgePoolBonus));

  if (parseNumber(computation.requestedFateDiceCount) > 0 || parseNumber(computation.fateDiceCount) > 0) {
    appendDebugRow(rows, "Schicksalswürfel angefordert", `${parseNumber(computation.requestedFateDiceCount)}`);
    appendDebugRow(rows, "Schicksalswürfel genutzt", `${parseNumber(computation.fateDiceCount)}`);
    appendDebugRow(rows, "Normale Poolwürfel", `${parseNumber(computation.regularPool)}`);
  }

  return rows;
}

function buildCalcDetails(rows, subjectFieldLabel, payload) {
  const details = [];
  const seen = new Set();
  const debugRows = buildComputationDebugRows(payload && payload.computation, rows);

  [...debugRows, ...(Array.isArray(rows) ? rows : [])].forEach((row) => {
    if (!shouldIncludeCalcDetailRow(row, subjectFieldLabel)) return;
    const label = row.label;
    const value = `${row.value || ""}`.trim();
    const entry = `${label}: ${value}`;
    if (seen.has(entry)) return;
    seen.add(entry);
    details.push(entry);
  });

  return details.join(", ");
}

function buildSr6ProbeMessage(payload) {
  const parts = ["&{template:sr6probe}"];
  const name = payload.name || "Probe";
  parts.push(`{{name=${name}}}`);

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const subjectFieldLabel = getSubjectFieldLabel(payload.resolvedFields, payload.definition);
  const subjectLabel = normalizeSubjectLabel(subjectFieldLabel);
  const subject = getSubjectValue(payload.resolvedFields, subjectFieldLabel, name);
  const calcDetails = buildCalcDetails(rows, subjectFieldLabel, payload);

  if (subjectLabel) parts.push(`{{subject_label=${subjectLabel}}}`);
  if (subject) parts.push(`{{subject=${subject}}}`);

  if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
    parts.push(`{{pool=${payload.pool}}}`);
  }

  if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
    parts.push(`{{erfolge=${payload.erfolge}}}`);
  }

  appendDetailsTemplateFields(parts, payload);
  appendEdgeActionTemplateField(parts, payload);

  if (calcDetails) {
    parts.push(`{{calc_details=${calcDetails}}}`);
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
