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
  if (row.ignorePoolFormula) return false;
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

  return rows;
}

// Source group labels used to build pool info, context popups, and debug output.
const SR6_DETAIL_GROUP_TITLES = {
  combatContext: "Kampfkontext",
  combatDamage: "Schadensberechnung",
  munitionHint: "Munitionshinweis",
  fireMode: "Feuermodus",
  attackValue: "Angriffswertberechnung",
  combatDefense: "Verteidigungsberechnung",
  combatDefenseValue: "Verteidigungswertberechnung",
  formula: "Formelberechnung",
  language: "Sprachberechnung",
  spellContext: "Zauberkontext",
  magicDrain: "Magie und Entzug",
  spellDamage: "Kampfzauber-Schaden",
  notes: "Notizen",
  summoning: "Beschwörung",
  objectResistance: "Objektwiderstand",
  probeContext: "Probenkontext",
  defenseContext: "Verteidigungsberechnung",
  vehicleContext: "Fahrzeugkontext",
  weaponContext: "Waffenkontext",
  equipmentContext: "Ausrüstungskontext",
  attribute: "Attributsberechnung",
  skill: "Fertigkeitsberechnung",
  popup: "Popup-Modifikatoren",
  edgeBoost: "Edge-Boost",
  fateDice: "Schicksalswürfel",
  hint: "Hinweis",
};

const SR6_POOL_INFO_TITLES = new Set([
  SR6_DETAIL_GROUP_TITLES.language,
  SR6_DETAIL_GROUP_TITLES.formula,
  SR6_DETAIL_GROUP_TITLES.probeContext,
  SR6_DETAIL_GROUP_TITLES.equipmentContext,
  SR6_DETAIL_GROUP_TITLES.attribute,
  SR6_DETAIL_GROUP_TITLES.skill,
  SR6_DETAIL_GROUP_TITLES.popup,
  SR6_DETAIL_GROUP_TITLES.edgeBoost,
  SR6_DETAIL_GROUP_TITLES.fateDice,
]);

const SR6_COMBAT_CONTEXT_LABELS = new Set([
  "Waffe",
  "Fertigkeit",
  "Waffentyp",
  "Munition",
  "Modus",
  "Reichweite",
  "Schadenswert",
  "Schadenstyp",
]);
const SR6_COMBAT_SKILL_LABELS = new Set([
  "Fertigkeitswert Basis",
  "Fertigkeitswert Modifikator",
  "Fertigkeitswert Gesamtwert",
  "Spezialisierung Auswahl",
  "Expertise Auswahl",
]);
const SR6_DAMAGE_LABELS = new Set([
  "Schaden-Basis",
  "Erfolge auf Schaden",
  "Feuermodus-Schaden",
  "Schadens-Modifikator",
  "Schaden-Modifikator",
  "Schaden",
  "Schadenswert",
  "Schadenstyp",
]);
const SR6_ATTACK_VALUE_LABELS = new Set([
  "Angriffswert-Formel",
  "Angriffswert-Basis",
  "Geschicklichkeit-Wert",
  "Stärke-Wert",
  "Reaktion-Wert",
  "Feuermodus-Angriffswert",
  "Angriffswert-Modifikator",
  "Angriffswert Kernwert-Modifikator",
  "Angriffswert Magie",
  "Angriffswert Traditionsattribut",
  "Angriffswert Traditionsattribut Wert",
  "Angriffswert",
]);
const SR6_COMBAT_DEFENSE_LABELS = new Set([
  "Verteidigung",
  "Reaktion Basis",
  "Reaktion Modifikator",
  "Reaktion Gesamtwert",
  "Intuition Basis",
  "Intuition Modifikator",
  "Intuition Gesamtwert",
]);
const SR6_COMBAT_DEFENSE_VALUE_LABELS = new Set([
  "Verteidigungswert",
  "Verteidigungswert Konstitution Basis",
  "Verteidigungswert Konstitution Modifikator",
  "Verteidigungswert Konstitution Gesamtwert",
  "Verteidigungswert Primäre Panzerung",
  "Verteidigungswert Sekundäre Panzerung",
  "Verteidigungswert Helm",
  "Verteidigungswert Schild",
  "Verteidigungswert Modifikator",
  "Verteidigungswert Gesamtwert",
]);
const SR6_ATTRIBUTE_DETAIL_LABELS = new Set([
  "Konstitution Basis",
  "Konstitution Modifikator",
  "Konstitution Gesamtwert",
  "Geschicklichkeit Basis",
  "Geschicklichkeit Modifikator",
  "Geschicklichkeit Gesamtwert",
  "Reaktion Basis",
  "Reaktion Modifikator",
  "Reaktion Gesamtwert",
  "Stärke Basis",
  "Stärke Modifikator",
  "Stärke Gesamtwert",
  "Willenskraft Basis",
  "Willenskraft Modifikator",
  "Willenskraft Gesamtwert",
  "Logik Basis",
  "Logik Modifikator",
  "Logik Gesamtwert",
  "Intuition Basis",
  "Intuition Modifikator",
  "Intuition Gesamtwert",
  "Charisma Basis",
  "Charisma Modifikator",
  "Charisma Gesamtwert",
  "Edge Basis",
  "Edge Modifikator",
  "Edge Gesamtwert",
  "Magie/Resonanz Basis",
  "Magie/Resonanz Modifikator",
  "Magie/Resonanz Gesamtwert",
]);
const SR6_SKILL_DETAIL_LABEL_PREFIXES = new Set([
  "Astral",
  "Athletik",
  "Beschwören",
  "Biotech",
  "Cracken",
  "Einfluss",
  "Elektronik",
  "Exotische Waffen",
  "Feuerwaffen",
  "Heimlichkeit",
  "Hexerei",
  "Mechanik",
  "Nahkampf",
  "Natur",
  "Steuern",
  "Tasken",
  "Überreden",
  "Verzaubern",
  "Wahrnehmung",
]);
const SR6_POPUP_DETAIL_LABELS = new Set([
  "Popup-Modifikator",
  "Skill-Modifikator",
  "Spezialisierung",
  "Expertise",
  "Spezialisierung/Expertise",
  "Ungeübt",
  "Attribut x2",
  "Stufe x2",
]);
const SR6_FATE_DICE_LABELS = new Set([
  "Schicksalswürfel",
  "Schicksalswürfel-Wurf",
  "Schicksalswürfel-Hinweis",
  "Schicksalswürfel-Quelle",
  "Schicksalswürfel begrenzt",
  "Einzelgänger",
  "Einzelgänger-1 ignoriert",
  "Annullierende Schicksalswürfel-1en",
  "Normale 5en annulliert",
]);
const SR6_EDGE_BOOST_LABELS = new Set([
  "Edge-Boost",
  "Edge-Kosten",
  "Edge-Poolbonus",
  "Edge-Hinweis",
]);
const SR6_SPELL_CONTEXT_LABELS = new Set(["Art", "Reichweite", "Typ", "Dauer", "Widerstand"]);
const SR6_MAGIC_DRAIN_LABELS = new Set([
  "Entzug",
  "Entzug-Basis",
  "Fläche Vergrößern-Entzug",
  "Hochdrehen-Entzug",
  "Entzug-Modifikator",
  "Entzugswiderstand",
  "Entzug-Details",
  "Entstandener Entzug",
  "Entzugsschaden",
]);
const SR6_SPELL_DAMAGE_LABELS = new Set([
  "Schaden-Formel",
  "Schaden-Basis",
  "Erfolge auf Schaden",
  "Hochdrehen-Schaden",
  "Schadens-Modifikator",
  "Schaden",
  "Schadenstyp",
]);
const SR6_SUMMONING_LABELS = new Set([
  "Geist",
  "Typ",
  "Stufe",
  "Beschwören-Pool",
  "Beschwören-Erfolge",
  "Geist-Pool",
  "Geist-Erfolge",
  "Nettoerfolge",
  "Erhaltene Dienste",
  "Geist-Details",
]);
const SR6_OBJECT_RESISTANCE_LABELS = new Set([
  "Objektwiderstand-Pool",
  "Objektwiderstand-Erfolge",
  "Objektwiderstand-Nettoerfolge",
  "Objektwiderstand-Details",
]);
const SR6_PROBE_CONTEXT_LABELS = new Set(["Probe", "Probe-Wert", "Matrixattribut", "Zugriff", "Overwatch-Modifikator"]);
const SR6_DEFENSE_CONTEXT_LABELS = new Set(["Verteidigung", "Verteidigungswert"]);
const SR6_VEHICLE_CONTEXT_LABELS = new Set(["Modus", "Fahrzeug", "Gerät", "Geraet", "Zustandsmonitor", "Riggerkontrolle", "Agentenstufe"]);
const SR6_WEAPON_CONTEXT_LABELS = new Set(["Installierte Waffe", "Waffentyp", "Angriffswerte (Reichweite)"]);
const SR6_EQUIPMENT_CONTEXT_LABELS = new Set(["Bezug", "Bezugswert", "Auswahl", "Stufe", "Stufe x2"]);

const SR6_GROUP_TITLE_BY_KEY = {
  combat_context: SR6_DETAIL_GROUP_TITLES.combatContext,
  combat_damage: SR6_DETAIL_GROUP_TITLES.combatDamage,
  munition_hint: SR6_DETAIL_GROUP_TITLES.munitionHint,
  fire_mode: SR6_DETAIL_GROUP_TITLES.fireMode,
  combat_attack_value: SR6_DETAIL_GROUP_TITLES.attackValue,
  combat_defense: SR6_DETAIL_GROUP_TITLES.combatDefense,
  combat_defense_value: SR6_DETAIL_GROUP_TITLES.combatDefenseValue,
  formula: SR6_DETAIL_GROUP_TITLES.formula,
  language: SR6_DETAIL_GROUP_TITLES.language,
  spell_context: SR6_DETAIL_GROUP_TITLES.spellContext,
  magic_drain: SR6_DETAIL_GROUP_TITLES.magicDrain,
  spell_damage: SR6_DETAIL_GROUP_TITLES.spellDamage,
  notes: SR6_DETAIL_GROUP_TITLES.notes,
  summoning: SR6_DETAIL_GROUP_TITLES.summoning,
  object_resistance: SR6_DETAIL_GROUP_TITLES.objectResistance,
  probe_context: SR6_DETAIL_GROUP_TITLES.probeContext,
  defense_context: SR6_DETAIL_GROUP_TITLES.defenseContext,
  vehicle_context: SR6_DETAIL_GROUP_TITLES.vehicleContext,
  weapon_context: SR6_DETAIL_GROUP_TITLES.weaponContext,
  attack_value: SR6_DETAIL_GROUP_TITLES.attackValue,
  damage: SR6_DETAIL_GROUP_TITLES.combatDamage,
  equipment_context: SR6_DETAIL_GROUP_TITLES.equipmentContext,
  attribute: SR6_DETAIL_GROUP_TITLES.attribute,
  skill: SR6_DETAIL_GROUP_TITLES.skill,
  popup: SR6_DETAIL_GROUP_TITLES.popup,
  edge_boost: SR6_DETAIL_GROUP_TITLES.edgeBoost,
  fate_dice: SR6_DETAIL_GROUP_TITLES.fateDice,
  hint: SR6_DETAIL_GROUP_TITLES.hint,
};

function isSkillFormulaDetailLabel(label) {
  const match = `${label || ""}`.match(/^(.+) (Basis|Modifikator|Gesamtwert)$/);
  return !!(match && SR6_SKILL_DETAIL_LABEL_PREFIXES.has(match[1]));
}

function isCombatCalcDetailDefinition(payload) {
  const definition = payload && payload.definition;
  const definitionId = `${(payload && payload.definitionId) || (definition && definition.id) || ""}`.trim();
  const combatDefinitionIds = new Set([
    "combat_ranged_core_attack",
    "combat_melee_core_attack",
    "combat_ranged_weapon",
    "combat_melee_weapon",
    "ranged_weapon",
    "melee_weapon",
    "weapon",
    "physical_defense",
    "physical_damage_resistance",
    "general_defense",
    "general_damage_resistance",
  ]);

  return combatDefinitionIds.has(definitionId) || !!(definition && definition.templateVariant === "weapon");
}

function getCombatCalcDetailSourceGroupKey(label) {
  if (SR6_COMBAT_CONTEXT_LABELS.has(label)) return "combat_context";
  if (label === "Attribut" || label.indexOf("Attributwert ") === 0) return "attribute";
  if (SR6_COMBAT_SKILL_LABELS.has(label)) return "skill";
  if (SR6_DAMAGE_LABELS.has(label)) return "combat_damage";
  if (SR6_ATTACK_VALUE_LABELS.has(label)) return "combat_attack_value";
  if (SR6_COMBAT_DEFENSE_LABELS.has(label)) return "combat_defense";
  if (SR6_COMBAT_DEFENSE_VALUE_LABELS.has(label)) return "combat_defense_value";
  if (SR6_ATTRIBUTE_DETAIL_LABELS.has(label)) return "attribute";
  if (SR6_POPUP_DETAIL_LABELS.has(label)) return "popup";
  return "";
}

function getCalcDetailSourceGroupKey(label, subjectFieldLabel, payload) {
  const definition = payload && payload.definition;
  const probeModel = definition && definition.probeModel;

  if (isCombatCalcDetailDefinition(payload)) {
    if (label === "Munitionshinweis") return "munition_hint";
    if (
      label === "Feuermodus" ||
      label === "Feuermodus-Schuss" ||
      label === "Feuermodus-Hinweis"
    ) {
      return "fire_mode";
    }
    const combatGroupKey = getCombatCalcDetailSourceGroupKey(label);
    if (combatGroupKey) return combatGroupKey;
  }

  if (label === "Sprachniveau") return "language";
  if (label === "Attributsprobe" || label === "Formel") return "formula";
  if (probeModel === "spell_probe" && SR6_SPELL_CONTEXT_LABELS.has(label)) {
    return "spell_context";
  }
  if (probeModel === "spell_probe" && SR6_SPELL_DAMAGE_LABELS.has(label)) {
    return "spell_damage";
  }
  if (
    (probeModel === "spell_probe" || probeModel === "summoning_probe") &&
    SR6_MAGIC_DRAIN_LABELS.has(label)
  ) {
    return "magic_drain";
  }
  if (label === "Notiz" || label === "Notizen") {
    return "notes";
  }
  if (probeModel === "summoning_probe" && SR6_SUMMONING_LABELS.has(label)) {
    return "summoning";
  }
  if (probeModel === "summoning_probe" && SR6_OBJECT_RESISTANCE_LABELS.has(label)) {
    return "object_resistance";
  }
  if (SR6_PROBE_CONTEXT_LABELS.has(label)) {
    return "probe_context";
  }
  if (SR6_DEFENSE_CONTEXT_LABELS.has(label)) {
    return "defense_context";
  }
  if (probeModel === "rigging_vehicle_probe" && SR6_VEHICLE_CONTEXT_LABELS.has(label)) {
    return "vehicle_context";
  }
  if (probeModel === "rigging_vehicle_probe" && SR6_WEAPON_CONTEXT_LABELS.has(label)) {
    return "weapon_context";
  }
  if (SR6_ATTACK_VALUE_LABELS.has(label)) {
    return "attack_value";
  }
  if (SR6_DAMAGE_LABELS.has(label)) {
    return "damage";
  }
  if (probeModel === "equipment_probe" && SR6_EQUIPMENT_CONTEXT_LABELS.has(label)) {
    return "equipment_context";
  }
  if (subjectFieldLabel === "Attribut" && (label === "Basis" || label === "Modifikator" || label === "Gesamtwert")) return "attribute";
  if (label === "Attribut" || label.indexOf("Attributwert ") === 0) return "attribute";
  if (SR6_ATTRIBUTE_DETAIL_LABELS.has(label)) return "attribute";
  if (label === "Fertigkeit") return "skill";
  if (label.indexOf("Fertigkeitswert ") === 0) return "skill";
  if (isSkillFormulaDetailLabel(label)) return "skill";
  if (
    (probeModel === "spell_probe" || probeModel === "summoning_probe") &&
    label.indexOf("Magie/Resonanz ") === 0
  ) {
    return "attribute";
  }
  if (probeModel === "spell_probe" && label.indexOf("Hexerei ") === 0) {
    return "skill";
  }
  if (probeModel === "summoning_probe" && label.indexOf("Beschwören ") === 0) {
    return "skill";
  }
  if (SR6_FATE_DICE_LABELS.has(label)) {
    return "fate_dice";
  }
  if (SR6_EDGE_BOOST_LABELS.has(label)) {
    return "edge_boost";
  }
  if (SR6_POPUP_DETAIL_LABELS.has(label)) {
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
  if (SR6_GROUP_TITLE_BY_KEY[groupKey]) return SR6_GROUP_TITLE_BY_KEY[groupKey];
  if (groupKey && groupKey.indexOf("component:") === 0) {
    return SR6_DETAIL_GROUP_TITLES.formula;
  }
  return "";
}

function buildComputationFateDetailEntries(computation) {
  if (
    !computation ||
    (
      parseNumber(computation.requestedFateDiceCount) <= 0 &&
      parseNumber(computation.fateDiceCount) <= 0
    )
  ) {
    return [];
  }

  return [
    `Schicksalswürfel angefordert: ${parseNumber(computation.requestedFateDiceCount)}`,
    `Schicksalswürfel genutzt: ${parseNumber(computation.fateDiceCount)}`,
    `Normale Poolwürfel: ${parseNumber(computation.regularPool)}`,
  ];
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

function buildSourceDetailEntry(row, sourceRows, groupKey) {
  let label = row.label;
  let value = `${row.value || ""}`.trim();
  if (label === "Formel" && hasLanguageBonusRow(sourceRows) && value.indexOf("Sprachbonus") === -1) {
    value = `${value} + Sprachbonus`;
  }
  if (label === "Schicksalswürfel-Hinweis") {
    label = "Hinweis";
  }
  if (groupKey === "combat_defense_value" && label.indexOf("Verteidigungswert ") === 0) {
    label = label.replace(/^Verteidigungswert\s+/, "");
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
    const groupKey = getCalcDetailSourceGroupKey(label, subjectFieldLabel, payload);
    const entry = buildSourceDetailEntry(row, rows, groupKey);
    if (seen.has(entry)) return;
    seen.add(entry);

    if (!currentSourceGroup || currentSourceGroup.key !== groupKey) {
      appendSourceDetailGroup(sourceGroups, currentSourceGroup);
      currentSourceGroup = { key: groupKey, entries: [] };
    }

    currentSourceGroup.entries.push(entry);
  }

  debugRows.forEach((row) => appendCalcDetail(row, debugDetails));
  (Array.isArray(rows) ? rows : []).forEach((row) => appendSourceDetail(row));
  appendSourceDetailGroup(sourceGroups, currentSourceGroup);
  appendSourceDetailGroup(sourceGroups, {
    key: "fate_dice",
    entries: buildComputationFateDetailEntries(payload && payload.computation),
  });

  return {
    summary: debugDetails.join(", "),
    sourceGroups: sourceGroups,
  };
}

function appendCalcDetailsGroupTemplateFields(parts, prefix, group) {
  if (!group || !group.details) return;
  parts.push(`{{${prefix}_title=${group.title || "Details"}}}`);
  parts.push(`{{${prefix}=${group.details}}}`);
}

function appendPoolInfoGroupTemplateFields(parts, sourceGroups) {
  if (!Array.isArray(sourceGroups) || sourceGroups.length === 0) return;

  appendCalcDetailsGroupTemplateFields(parts, "pool_info_sources", sourceGroups[0]);
  appendCalcDetailsGroupTemplateFields(parts, "pool_info_sources_2", sourceGroups[1]);
  appendCalcDetailsGroupTemplateFields(parts, "pool_info_sources_3", sourceGroups[2]);
  appendCalcDetailsGroupTemplateFields(parts, "pool_info_sources_4", sourceGroups[3]);
  appendCalcDetailsGroupTemplateFields(parts, "pool_info_sources_5", sourceGroups[4]);
}

function getLastRowValue(rows, label) {
  if (!Array.isArray(rows)) return "";
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (row && row.label === label) {
      return `${row.value || ""}`.trim();
    }
  }
  return "";
}

function isCombatWeaponContextDefinition(payload) {
  const definition = payload && payload.definition;
  const definitionId = `${(payload && payload.definitionId) || (definition && definition.id) || ""}`.trim();
  return (
    definitionId === "ranged_weapon" ||
    definitionId === "melee_weapon" ||
    definitionId === "combat_ranged_core_attack" ||
    definitionId === "combat_melee_core_attack" ||
    definitionId === "combat_ranged_weapon" ||
    definitionId === "combat_melee_weapon"
  );
}

function getVisibleCombatDamageType(rows) {
  const explicitType = getLastRowValue(rows, "Schadenstyp");
  if (explicitType) return explicitType;

  const ammunition = getLastRowValue(rows, "Munition");
  if (ammunition === "Schocker") return "Betäubung (elektrisch)";
  if (ammunition === "Gel") return "Betäubung";

  return "Körperlich";
}

function getVisibleCombatDamageValue(rows) {
  const damage = getLastRowValue(rows, "Schaden") || getLastRowValue(rows, "Schadenswert");
  if (!damage) return "";

  const damageType = getVisibleCombatDamageType(rows);
  return damageType ? `${damage} ${damageType}` : damage;
}

function getSourceGroupByTitle(sourceGroups, title) {
  if (!Array.isArray(sourceGroups) || !title) return null;
  return sourceGroups.find((group) => group && group.title === title) || null;
}

function getSourceGroupsByTitle(sourceGroups, titles, usedTitles) {
  const used = usedTitles || new Set();
  return (Array.isArray(titles) ? titles : []).reduce((groups, title) => {
    if (!title || used.has(title)) return groups;
    const group = getSourceGroupByTitle(sourceGroups, title);
    if (!group || !group.details) return groups;
    used.add(title);
    groups.push(group);
    return groups;
  }, []);
}

function buildContextRowsFromLabels(rows, labels, sourceGroups, infoTitleMap = {}, options = {}) {
  const sharedInfoTitles = options.dedupeInfoTitles ? new Set() : null;
  const valueByLabel = options.valueByLabel || {};
  const separatorBeforeLabels = new Set(options.separatorBeforeLabels || []);
  const allowEmptyLabels = new Set(options.allowEmptyLabels || []);

  return (Array.isArray(labels) ? labels : []).reduce((contextRows, label) => {
    const value = valueByLabel[label] !== undefined
      ? `${valueByLabel[label] || ""}`
      : getLastRowValue(rows, label);
    if (!`${value || ""}`.trim() && !allowEmptyLabels.has(label)) return contextRows;
    contextRows.push({
      label: label,
      value: value,
      separatorBefore: separatorBeforeLabels.has(label),
      infoGroups: getSourceGroupsByTitle(sourceGroups, infoTitleMap[label] || [], sharedInfoTitles || new Set()),
    });
    return contextRows;
  }, []);
}

function appendAutomaticNoteContextRow(contextRows, rows, sourceGroups) {
  const resolvedContextRows = Array.isArray(contextRows) ? [...contextRows] : [];
  const hasNoteRow = resolvedContextRows.some((row) => row && row.label === "Notiz");
  const noteValue = getLastRowValue(rows, "Notiz") || getLastRowValue(rows, "Notizen");
  if (hasNoteRow || !noteValue) return resolvedContextRows;

  resolvedContextRows.push({
    label: "Notiz",
    value: " ",
    separatorBefore: true,
    infoGroups: getSourceGroupsByTitle(sourceGroups, [SR6_DETAIL_GROUP_TITLES.notes], new Set()),
  });
  return resolvedContextRows;
}

function appendContextRowsTemplateFields(parts, contextRows) {
  if (contextRows.length === 0) return;

  contextRows.slice(0, 9).forEach((row, index) => {
    const rowIndex = index + 1;
    const infoGroups = Array.isArray(row.infoGroups) ? row.infoGroups : [];
    parts.push(`{{context_${rowIndex}_label=${row.label}}}`);
    parts.push(`{{context_${rowIndex}_value=${row.value}}}`);
    if (row.separatorBefore) {
      parts.push(`{{context_${rowIndex}_separator=1}}`);
    }
    if (infoGroups.length > 0) {
      parts.push(`{{context_${rowIndex}_info_title=${infoGroups[0].title}}}`);
      parts.push(`{{context_${rowIndex}_info=${infoGroups[0].details}}}`);
    }
    if (infoGroups.length > 1) {
      parts.push(`{{context_${rowIndex}_info_2_title=${infoGroups[1].title}}}`);
      parts.push(`{{context_${rowIndex}_info_2=${infoGroups[1].details}}}`);
    }
  });
}

function getPoolInfoGroups(sourceGroups) {
  return (Array.isArray(sourceGroups) ? sourceGroups : []).filter((group) => group && SR6_POOL_INFO_TITLES.has(group.title));
}

function buildDefaultProbeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups) {
  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: getPoolInfoGroups(calcDetailGroups.sourceGroups),
    contextRows: [],
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildInitiativeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups) {
  const initiativeGroup = calcDetailGroups.sourceGroups.find((group) => group && group.title === "") ||
    calcDetailGroups.sourceGroups.find((group) => group && group.title === "Details") ||
    calcDetailGroups.sourceGroups.find((group) => group && group.details);
  const poolInfo = initiativeGroup ? [{ title: "Initiative", details: initiativeGroup.details }] : [];

  return {
    suppressSubject: true,
    subject: { label: subjectLabel, value: subject },
    poolInfo: poolInfo,
    contextRows: [],
    resultLabel: (payload && payload.resultLabel) || "Initiative",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildCombatWeaponView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  const definition = payload && payload.definition;
  const definitionId = `${(payload && payload.definitionId) || (definition && definition.id) || ""}`.trim();
  const isMelee = (
    definitionId === "melee_weapon" ||
    definitionId === "combat_melee_core_attack" ||
    definitionId === "combat_melee_weapon"
  );
  const contextLabels = isMelee
    ? ["Schadenswert", "Angriffswert", "Waffentyp", "Reichweite"]
    : ["Schadenswert", "Angriffswert", "Munition", "Modus", "Reichweite"];

  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: getPoolInfoGroups(calcDetailGroups.sourceGroups),
    contextRows: buildContextRowsFromLabels(rows, contextLabels, calcDetailGroups.sourceGroups, {
      "Schadenswert": [SR6_DETAIL_GROUP_TITLES.combatContext, SR6_DETAIL_GROUP_TITLES.combatDamage],
      "Angriffswert": [SR6_DETAIL_GROUP_TITLES.attackValue],
      "Munition": [SR6_DETAIL_GROUP_TITLES.munitionHint],
      "Modus": [SR6_DETAIL_GROUP_TITLES.fireMode],
      "Reichweite": [SR6_DETAIL_GROUP_TITLES.combatContext],
      "Waffentyp": [SR6_DETAIL_GROUP_TITLES.combatContext],
    }, {
      dedupeInfoTitles: true,
      valueByLabel: {
        "Schadenswert": getVisibleCombatDamageValue(rows),
      },
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildDefenseView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  const defenseGroup = getSourceGroupByTitle(calcDetailGroups.sourceGroups, "Verteidigungsberechnung");
  const defenseValueGroup = getSourceGroupByTitle(calcDetailGroups.sourceGroups, "Verteidigungswertberechnung");
  const comparisonLabel = (payload && payload.definition && payload.definition.comparisonContextLabel) || "Verteidigungswert";
  const contextLabels = comparisonLabel === "Verteidigung"
    ? [comparisonLabel]
    : [comparisonLabel, "Verteidigung"];
  const contextRows = buildContextRowsFromLabels(rows, contextLabels, calcDetailGroups.sourceGroups, {
    [comparisonLabel]: defenseValueGroup ? ["Verteidigungswertberechnung"] : ["Verteidigungsberechnung"],
    "Verteidigung": ["Verteidigungsberechnung"],
  });
  const poolInfo = [
    ...(defenseGroup ? [defenseGroup] : []),
    ...getPoolInfoGroups(calcDetailGroups.sourceGroups),
  ];

  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: poolInfo,
    contextRows: contextRows,
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildSpellView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  const poolInfo = getPoolInfoGroups(calcDetailGroups.sourceGroups)
    .filter((group) => group.title !== SR6_DETAIL_GROUP_TITLES.formula);

  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: poolInfo,
    contextRows: buildContextRowsFromLabels(rows, [
      "Art",
      "Reichweite",
      "Dauer",
      "Widerstand",
      "Entzug",
      "Entzugswiderstand",
      "Angriffswert",
      "Schaden",
      "Notiz",
    ], calcDetailGroups.sourceGroups, {
      "Art": ["Zauberkontext"],
      "Reichweite": ["Zauberkontext"],
      "Dauer": ["Zauberkontext"],
      "Widerstand": ["Zauberkontext"],
      "Entzug": ["Magie und Entzug"],
      "Angriffswert": ["Angriffswertberechnung"],
      "Schaden": ["Kampfzauber-Schaden"],
      "Entzugswiderstand": ["Magie und Entzug"],
      "Notiz": ["Notizen"],
    }, {
      separatorBeforeLabels: ["Entzug", "Angriffswert", "Notiz"],
      allowEmptyLabels: getLastRowValue(rows, "Notiz") ? ["Notiz"] : [],
      valueByLabel: {
        "Notiz": getLastRowValue(rows, "Notiz") ? " " : "",
      },
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildSummoningView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  const poolInfo = getPoolInfoGroups(calcDetailGroups.sourceGroups)
    .filter((group) => group.title !== SR6_DETAIL_GROUP_TITLES.formula);

  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: poolInfo,
    contextRows: buildContextRowsFromLabels(rows, [
      "Typ",
      "Stufe",
      "Geist-Erfolge",
      "Erhaltene Dienste",
      "Entzugsschaden",
      "Objektwiderstand-Nettoerfolge",
    ], calcDetailGroups.sourceGroups, {
      "Geist-Erfolge": ["Beschwörung"],
      "Erhaltene Dienste": ["Beschwörung"],
      "Entzugsschaden": ["Magie und Entzug"],
      "Objektwiderstand-Nettoerfolge": ["Objektwiderstand"],
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildMatrixActionView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: getPoolInfoGroups(calcDetailGroups.sourceGroups),
    contextRows: buildContextRowsFromLabels(rows, [
      "Probe",
      "Probe-Wert",
      "Verteidigung",
      "Verteidigungswert",
      "Zugriff",
      "Overwatch-Modifikator",
    ], calcDetailGroups.sourceGroups, {
      "Probe": ["Probenkontext", "Formelberechnung"],
      "Probe-Wert": ["Probenkontext", "Formelberechnung"],
      "Verteidigung": ["Verteidigungsberechnung"],
      "Verteidigungswert": ["Verteidigungsberechnung"],
      "Zugriff": ["Probenkontext"],
      "Overwatch-Modifikator": ["Probenkontext"],
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildRiggingVehicleView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: getPoolInfoGroups(calcDetailGroups.sourceGroups),
    contextRows: buildContextRowsFromLabels(rows, [
      "Modus",
      "Probe",
      "Angriffswert",
      "Verteidigungswert",
      "Zustandsmonitor",
      "Schaden",
      "Installierte Waffe",
      "Feuermodus",
    ], calcDetailGroups.sourceGroups, {
      "Modus": ["Fahrzeugkontext"],
      "Probe": ["Probenkontext", "Formelberechnung"],
      "Angriffswert": ["Angriffswertberechnung"],
      "Verteidigungswert": ["Fahrzeugkontext"],
      "Zustandsmonitor": ["Fahrzeugkontext"],
      "Schaden": ["Schadensberechnung"],
      "Installierte Waffe": ["Waffenkontext"],
      "Feuermodus": ["Feuermodus"],
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildEquipmentView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  return {
    suppressSubject: !!(payload && payload.suppressSubject),
    subject: { label: subjectLabel, value: subject },
    poolInfo: getPoolInfoGroups(calcDetailGroups.sourceGroups),
    contextRows: buildContextRowsFromLabels(rows, [
      "Bezug",
      "Attribut",
      "Fertigkeit",
      "Stufe",
      "Stufe x2",
    ], calcDetailGroups.sourceGroups, {
      "Bezug": ["Ausrüstungskontext"],
      "Attribut": ["Ausrüstungskontext", "Attributsberechnung"],
      "Fertigkeit": ["Ausrüstungskontext", "Fertigkeitsberechnung"],
      "Stufe": ["Ausrüstungskontext"],
      "Stufe x2": ["Ausrüstungskontext"],
    }),
    resultLabel: (payload && payload.resultLabel) || "Ergebnis",
    resultValue: payload && payload.resultValue,
    debugGroups: calcDetailGroups.sourceGroups,
  };
}

function buildSr6ProbeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows) {
  const definition = payload && payload.definition;
  const definitionId = `${(payload && payload.definitionId) || (definition && definition.id) || ""}`.trim();

  if (definition && definition.probeModel === "initiative_probe") {
    return buildInitiativeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups);
  }

  if (isCombatWeaponContextDefinition(payload)) {
    return buildCombatWeaponView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definition && definition.probeModel === "defense_probe") {
    return buildDefenseView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definition && definition.probeModel === "spell_probe") {
    return buildSpellView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definition && definition.probeModel === "summoning_probe") {
    return buildSummoningView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definitionId === "matrix_action") {
    return buildMatrixActionView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definition && definition.probeModel === "rigging_vehicle_probe") {
    return buildRiggingVehicleView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  if (definition && definition.probeModel === "equipment_probe") {
    return buildEquipmentView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);
  }

  return buildDefaultProbeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups);
}

function appendDebugDetailsTemplateFields(parts, groups) {
  if (!groups) return;
  let hasDebugDetails = false;
  if (groups.summary) {
    parts.push(`{{debug_pool_info=${groups.summary}}}`);
    hasDebugDetails = true;
  }

  const sourceGroups = Array.isArray(groups.sourceGroups) ? groups.sourceGroups : [];
  if (sourceGroups.length > 0) {
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources", sourceGroups[0]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_2", sourceGroups[1]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_3", sourceGroups[2]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_4", sourceGroups[3]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_5", sourceGroups[4]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_6", sourceGroups[5]);
    appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_7", sourceGroups[6]);
    if (sourceGroups[7]) {
      appendCalcDetailsGroupTemplateFields(parts, "debug_details_sources_8", {
        title: sourceGroups[7].title,
        details: sourceGroups.slice(7).map((group) => group.details).join(", "),
      });
    }
    hasDebugDetails = true;
  }

  if (hasDebugDetails) {
    parts.push("{{debug_details_enabled=1}}");
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
  const calcDetailGroups = buildCalcDetailGroups(rows, subjectFieldLabel, payload);
  const view = buildSr6ProbeView(payload, name, subjectFieldLabel, subjectLabel, subject, calcDetailGroups, rows);

  if (!view.suppressSubject) {
    if (view.subject && view.subject.label) parts.push(`{{subject_label=${view.subject.label}}}`);
    if (view.subject && view.subject.value) parts.push(`{{subject=${view.subject.value}}}`);
  }

  if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
    parts.push(`{{pool=${payload.pool}}}`);
  }

  if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
    parts.push(`{{erfolge=${payload.erfolge}}}`);
  }

  if (view.resultValue !== undefined && view.resultValue !== null && `${view.resultValue}` !== "") {
    parts.push(`{{result_label=${view.resultLabel || "Ergebnis"}}}`);
    parts.push(`{{result_value=${view.resultValue}}}`);
  }

  appendDetailsTemplateFields(parts, payload);
  appendEdgeActionTemplateField(parts, payload);
  appendContextRowsTemplateFields(
    parts,
    appendAutomaticNoteContextRow(view.contextRows || [], rows, calcDetailGroups.sourceGroups)
  );
  if (calcDetailGroups.summary) {
    parts.push(`{{pool_info=${calcDetailGroups.summary}}}`);
  }
  appendPoolInfoGroupTemplateFields(parts, view.poolInfo || []);
  if (payload.debugDetailsEnabled) {
    appendDebugDetailsTemplateFields(parts, calcDetailGroups);
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
