// BEGIN MODULE: workers/rolls/probe
// Fuehrt fachliche Pool-Berechnungen aus: Popup-Modifikatoren, Spezialisierungen, Kampf/Magie/Matrix/Rigging-Sonderlogik und finale Rollauswertung.
function normalizePopupState(popupState) {
  if (typeof popupState === "number") {
    return { poolMod: popupState, attackValueMod: 0, damageMod: 0, drainMod: 0, poolMultiplier: 1, selectedValues: {}, rows: [] };
  }

  if (!popupState || typeof popupState !== "object") {
    return { poolMod: 0, attackValueMod: 0, damageMod: 0, drainMod: 0, poolMultiplier: 1, selectedValues: {}, rows: [] };
  }

  return {
    poolMod: parseNumber(popupState.poolMod),
    attackValueMod: parseNumber(popupState.attackValueMod),
    damageMod: parseNumber(popupState.damageMod),
    drainMod: parseNumber(popupState.drainMod),
    poolMultiplier: Math.max(1, parseNumber(popupState.poolMultiplier) || 1),
    selectedValues: popupState.selectedValues && typeof popupState.selectedValues === "object" ? popupState.selectedValues : {},
    rows: Array.isArray(popupState.rows) ? popupState.rows : [],
  };
}

function applyTemplateSkillBonusToPopupState(popupState, resolvedFields) {
  const state = normalizePopupState(popupState);
  const rows = Array.isArray(state.rows) ? [...state.rows] : [];
  const selectedValues = state.selectedValues || {};
  const popupSkillBonusSelected =
    `${selectedValues.expertise || ""}`.trim() === "1" ||
    `${selectedValues.specialization || ""}`.trim() === "1" ||
    rows.some((row) => row && (row.label === "Expertise" || row.label === "Spezialisierung"));
  const hasPopupBonusRow = (label, value) => rows.some((row) => (
    row &&
    row.label === label &&
    `${row.value || ""}`.trim() === value
  ));
  const expertiseName = `${(resolvedFields && resolvedFields.Expertise) || ""}`.trim();
  const specializationName = `${(resolvedFields && resolvedFields.Spezialisierung) || ""}`.trim();
  const expertiseRequested = `${(resolvedFields && resolvedFields["Expertise Aktiv"]) || ""}`.trim() === "1" && expertiseName !== "";
  const specializationRequested = `${(resolvedFields && resolvedFields["Spezialisierung Aktiv"]) || ""}`.trim() === "1" && specializationName !== "";

  if (popupSkillBonusSelected) {
    return {
      ...state,
      rows: rows,
    };
  }

  if (expertiseRequested && !hasPopupBonusRow("Expertise", "+3")) {
    return {
      ...state,
      poolMod: state.poolMod + 3,
      rows: [...rows, { label: "Expertise", value: "+3" }],
    };
  }

  if (specializationRequested && !expertiseRequested && !hasPopupBonusRow("Spezialisierung", "+2")) {
    return {
      ...state,
      poolMod: state.poolMod + 2,
      rows: [...rows, { label: "Spezialisierung", value: "+2" }],
    };
  }

  return {
    ...state,
    rows: rows,
  };
}

function resolveMeleePopupAttributePoolOverride(definition, resolvedFields, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.popupPoolAttributeOverride !== "melee_attribute") {
    return null;
  }

  const selectedAttribute = `${(((popupState || {}).selectedValues || {}).attribute_context) || ""}`.trim();
  const currentAttribute = `${(resolvedFields && resolvedFields.Attribut) || ""}`.trim();

  if (!selectedAttribute || !currentAttribute || selectedAttribute === currentAttribute) {
    return null;
  }

  const geschicklichkeit = parseNumber((resolvedFields && resolvedFields["Geschicklichkeit-Wert"]) || 0);
  const staerke = parseNumber((resolvedFields && resolvedFields["Stärke-Wert"]) || 0);
  const currentAttributeValue = currentAttribute === "Stärke" ? staerke : geschicklichkeit;
  const selectedAttributeValue = selectedAttribute === "Stärke" ? staerke : geschicklichkeit;
  const currentPoolBasis = parseNumber(lookupAttr(poolAttribute));

  return {
    selectedAttribute: selectedAttribute,
    currentAttribute: currentAttribute,
    poolBasisOverride: currentPoolBasis - currentAttributeValue + selectedAttributeValue,
  };
}

function resolveSkillProbeAttributePoolOverride(definition, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.probeModel !== "skill_probe") {
    return null;
  }

  const attributeOption = resolveSkillProbeAttributeOption(
    definition,
    (((popupState || {}).selectedValues || {}).skill_attribute) || ""
  );

  if (!attributeOption || !attributeOption.attr) {
    return null;
  }

  const skillValue = parseNumber(lookupAttr(poolAttribute));
  const attributeValue = parseNumber(lookupAttr(attributeOption.attr));

  return {
    selectedAttribute: attributeOption.value,
    skillValue: skillValue,
    attributeValue: attributeValue,
    poolBasisOverride: skillValue + attributeValue,
  };
}

function resolveRollAttributeTotal(attributeKey, lookupAttr) {
  const base = lookupAttr(`sr6_attr_${attributeKey}_grundwert`);
  const modifier = lookupAttr(`sr6_attr_${attributeKey}_modifikator`);
  if (`${base}`.trim() !== "" || `${modifier}`.trim() !== "") {
    return parseNumber(base) + parseNumber(modifier);
  }
  return parseNumber(lookupAttr(`sr6_attr_${attributeKey}_gesamtwert`));
}

function resolveRollSkillTotal(skillKey, lookupAttr) {
  const base = lookupAttr(`sr6_skill_${skillKey}_grundwert`);
  const modifier = lookupAttr(`sr6_skill_${skillKey}_modifikator`);
  if (`${base}`.trim() !== "" || `${modifier}`.trim() !== "") {
    return parseNumber(base) + parseNumber(modifier);
  }
  return parseNumber(lookupAttr(`sr6_skill_${skillKey}_gesamtwert`));
}

const SR6_ATTRIBUTE_DETAIL_KEYS = {
  Konstitution: "konstitution",
  Geschicklichkeit: "geschicklichkeit",
  Reaktion: "reaktion",
  "Stärke": "staerke",
  Staerke: "staerke",
  Willenskraft: "willenskraft",
  Logik: "logik",
  Intuition: "intuition",
  Charisma: "charisma",
  Edge: "edge",
  "Magie/Resonanz": "magie_resonanz",
};

const SR6_SKILL_DETAIL_LABELS = {
  astral: "Astral",
  athletik: "Athletik",
  beschwoeren: "Beschwören",
  biotech: "Biotech",
  cracken: "Cracken",
  einfluss: "Einfluss",
  elektronik: "Elektronik",
  exotische_waffen: "Exotische Waffen",
  feuerwaffen: "Feuerwaffen",
  heimlichkeit: "Heimlichkeit",
  hexerei: "Hexerei",
  mechanik: "Mechanik",
  nahkampf: "Nahkampf",
  natur: "Natur",
  steuern: "Steuern",
  tasken: "Tasken",
  ueberreden: "Überreden",
  verzaubern: "Verzaubern",
  wahrnehmung: "Wahrnehmung",
};

const SR6_FORMULA_COMPONENTS = {
  "Angriff": { type: "matrix", attr: "sr6_matrix_angriff" },
  "Datenverarbeitung": { type: "matrix", attr: "sr6_matrix_datenverarbeitung" },
  "Firewall": { type: "matrix", attr: "sr6_matrix_firewall" },
  "Schleicher": { type: "matrix", attr: "sr6_matrix_schleicher" },
  "Sensor": { type: "rigging", attr: "sr6_rigging_fahrzeug_sensor" },
  "Pilot": { type: "rigging", attr: "sr6_rigging_fahrzeug_pilot" },
  "Rumpf": { type: "rigging", attr: "sr6_rigging_fahrzeug_rumpf" },
  "Panzerung": { type: "rigging", attr: "sr6_rigging_fahrzeug_panzerung" },
  "Riggerkontrolle": { type: "rigging", attr: "sr6_rigging_fahrzeug_riggerkontrolle" },
  "Agentenstufe": { type: "rigging", attr: "sr6_rigging_fahrzeug_agentenstufe" },
  "Manoevrieren": { type: "rigging", attr: "sr6_rigging_fahrzeug_manoevrieren" },
  "Manövrieren": { type: "rigging", attr: "sr6_rigging_fahrzeug_manoevrieren" },
  "Zielerfassung": { type: "rigging", attr: "sr6_rigging_fahrzeug_zielerfassung" },
  "Ausweichen": { type: "rigging", attr: "sr6_rigging_fahrzeug_ausweichen" },
  "Stealth": { type: "rigging", attr: "sr6_rigging_fahrzeug_stealth" },
  "Clearsight": { type: "rigging", attr: "sr6_rigging_fahrzeug_clearsight" },
};

function resolveRiggingVehicleDetail(lookupAttr, attrName) {
  const base = parseNumber(lookupAttr(attrName));
  const modifier = parseNumber(lookupAttr(`${attrName}_modifikator`));
  return {
    base: base,
    modifier: modifier,
    total: base + modifier,
  };
}

function resolveMatrixCoreDetail(lookupAttr, matrixKey) {
  const base = parseNumber(lookupAttr(`sr6_matrix_${matrixKey}`));
  const modifier = parseNumber(lookupAttr(`sr6_matrix_${matrixKey}_modifikator`));
  return {
    base: base,
    modifier: modifier,
    total: base + modifier,
  };
}

function appendMatrixCoreDetailRows(rows, lookupAttr, matrixKey, label, options = {}) {
  const detail = resolveMatrixCoreDetail(lookupAttr, matrixKey);
  appendRowIfMissing(rows, `${label} Basis`, `${detail.base}`, { poolComponent: !!options.poolComponent });
  if (detail.modifier !== 0 || options.includeZeroModifier) {
    appendRowIfMissing(rows, `${label} Modifikator`, `${detail.modifier}`, { poolComponent: !!options.poolComponent });
  }
  appendRowIfMissing(rows, `${label} Gesamtwert`, `${detail.total}`);
}

function getAttributeDetailKey(label) {
  return SR6_ATTRIBUTE_DETAIL_KEYS[`${label || ""}`.trim()] || "";
}

function getSkillDetailLabel(skillKey) {
  return SR6_SKILL_DETAIL_LABELS[skillKey] || `${skillKey || ""}`;
}

function getSkillDetailKey(label) {
  const normalizedLabel = `${label || ""}`.trim();
  const match = Object.keys(SR6_SKILL_DETAIL_LABELS).find((skillKey) => SR6_SKILL_DETAIL_LABELS[skillKey] === normalizedLabel);
  return match || "";
}

function getPoolAttributeDetailKey(poolAttribute) {
  const match = `${poolAttribute || ""}`.match(/^sr6_attr_(.+)_gesamtwert$/);
  return match ? match[1] : "";
}

function getPoolSkillDetailKey(poolAttribute) {
  const match = `${poolAttribute || ""}`.match(/^sr6_skill_(.+)_gesamtwert$/);
  return match ? match[1] : "";
}

function appendAttributeDetailRows(rows, lookupAttr, attributeKey, labelPrefix = "", options = {}) {
  if (!attributeKey) return;
  const base = lookupAttr(`sr6_attr_${attributeKey}_grundwert`);
  const modifier = lookupAttr(`sr6_attr_${attributeKey}_modifikator`);
  const total = resolveRollAttributeTotal(attributeKey, lookupAttr);
  const prefix = labelPrefix ? `${labelPrefix} ` : "";
  const rowOptions = { poolComponent: !!options.poolComponent };

  appendRowIfMissing(rows, `${prefix}Basis`, `${parseNumber(base)}`, rowOptions);
  appendRowIfMissing(rows, `${prefix}Modifikator`, `${parseNumber(modifier)}`, rowOptions);
  appendRowIfMissing(rows, `${prefix}Gesamtwert`, `${total}`);
}

function appendSkillDetailRows(rows, lookupAttr, skillKey, labelPrefix = "Fertigkeitswert", options = {}) {
  if (!skillKey) return;
  const base = lookupAttr(`sr6_skill_${skillKey}_grundwert`);
  const modifier = lookupAttr(`sr6_skill_${skillKey}_modifikator`);
  const total = resolveRollSkillTotal(skillKey, lookupAttr);
  const rowOptions = { poolComponent: !!options.poolComponent };

  appendRowIfMissing(rows, "Fertigkeit", getSkillDetailLabel(skillKey));
  appendRowIfMissing(rows, `${labelPrefix} Basis`, `${parseNumber(base)}`, rowOptions);
  appendRowIfMissing(rows, `${labelPrefix} Modifikator`, `${parseNumber(modifier)}`, rowOptions);
  appendRowIfMissing(rows, `${labelPrefix} Gesamtwert`, `${total}`);
}

function appendFormulaAttributeDetailRows(rows, lookupAttr, formula) {
  const formulaParts = `${formula || ""}`.split("+").map((part) => part.trim()).filter(Boolean);
  formulaParts.forEach((part) => {
    const attributeKey = getAttributeDetailKey(part);
    if (!attributeKey) return;
    appendAttributeDetailRows(rows, lookupAttr, attributeKey, part, { poolComponent: true });
  });
}

function appendGenericFormulaComponentRows(rows, lookupAttr, formula, labelPrefix = "", options = {}) {
  const formulaParts = `${formula || ""}`.split("+").map((part) => part.trim()).filter(Boolean);
  const rowOptions = { poolComponent: options.poolComponent !== false };
  formulaParts.forEach((part) => {
    const multiplierMatch = part.match(/\s*x\s*(\d+)$/i);
    const multiplier = multiplierMatch ? Math.max(1, parseNumber(multiplierMatch[1])) : 1;
    const cleanPart = part.replace(/\s*x\s*\d+$/i, "").trim();
    const label = labelPrefix
      ? `${labelPrefix} ${cleanPart}${multiplier > 1 ? ` x${multiplier}` : ""}`
      : `${cleanPart}${multiplier > 1 ? ` x${multiplier}` : ""}`;
    const attributeKey = getAttributeDetailKey(cleanPart);
    if (attributeKey) {
      appendAttributeDetailRows(rows, lookupAttr, attributeKey, label, rowOptions);
      return;
    }

    const skillKey = getSkillDetailKey(cleanPart);
    if (skillKey) {
      appendSkillDetailRows(rows, lookupAttr, skillKey, label, rowOptions);
      return;
    }

    const component = SR6_FORMULA_COMPONENTS[cleanPart];
    if (component && component.attr) {
      if (component.type === "matrix") {
        const matrixKey = `${component.attr || ""}`.replace(/^sr6_matrix_/, "");
        const detail = resolveMatrixCoreDetail(lookupAttr, matrixKey);
        appendRowIfMissing(rows, `${label} Basis`, `${detail.base * multiplier}`, rowOptions);
        appendRowIfMissing(rows, `${label} Modifikator`, `${detail.modifier * multiplier}`, rowOptions);
        appendRowIfMissing(rows, `${label} Gesamtwert`, `${detail.total * multiplier}`);
        return;
      }
      if (component.type === "rigging") {
        const detail = resolveRiggingVehicleDetail(lookupAttr, component.attr);
        appendRowIfMissing(rows, `${label} Basis`, `${detail.base * multiplier}`, rowOptions);
        appendRowIfMissing(rows, `${label} Modifikator`, `${detail.modifier * multiplier}`, rowOptions);
        appendRowIfMissing(rows, `${label} Gesamtwert`, `${detail.total * multiplier}`);
        return;
      }
      appendRowIfMissing(rows, label, `${parseNumber(lookupAttr(component.attr)) * multiplier}`, rowOptions);
    }
  });
}

function appendRowsFormulaDetails(rows, lookupAttr, poolLabels = null) {
  const formulas = [];
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || !row.value || !row.label) return;
    if (["Formel", "Probe", "Verteidigung"].includes(row.label) && !["Keine Probe", "Keine Verteidigungsprobe", "Siehe Beschreibung"].includes(`${row.value}`.trim())) {
      formulas.push({
        label: row.label,
        value: row.value,
      });
    }
  });

  formulas.forEach((formula) => {
    const isPoolFormula = !Array.isArray(poolLabels) || poolLabels.includes(formula.label);
    appendGenericFormulaComponentRows(rows, lookupAttr, formula.value, "", { poolComponent: isPoolFormula });
  });
}

function appendEquipmentSourceDetailRows(rows, lookupAttr, sourceKey, sourceOption) {
  if (!sourceOption) return;

  const normalizedKey = `${sourceKey || ""}`.trim();
  if (normalizedKey.indexOf("attr:") === 0) {
    const attributeKey = normalizedKey.replace(/^attr:/, "");
    appendRowIfMissing(rows, "Attribut", sourceOption.label);
    appendAttributeDetailRows(rows, lookupAttr, attributeKey, sourceOption.label, { poolComponent: true });
    return;
  }

  if (normalizedKey.indexOf("skill:") === 0) {
    const skillKey = normalizedKey.replace(/^skill:/, "");
    appendSkillDetailRows(rows, lookupAttr, skillKey, sourceOption.label, { poolComponent: true });
  }
}

function getMatrixLikeDefenseConfig(definition) {
  const definitionId = definition && definition.id;
  const matrixConfigs = {
    matrix_defense: { prefix: "sr6_matrix", kind: "defense" },
    matrix_damage_resistance: { prefix: "sr6_matrix", kind: "damage_resistance" },
    matrix_biofeedback_damage_resistance: { prefix: "sr6_matrix", kind: "biofeedback_damage_resistance" },
    rigging_matrix_defense: { prefix: "sr6_rigging", kind: "defense" },
    rigging_matrix_damage_resistance: { prefix: "sr6_rigging", kind: "damage_resistance" },
    rigging_biofeedback_damage_resistance: { prefix: "sr6_rigging", kind: "biofeedback_damage_resistance" },
  };

  return matrixConfigs[definitionId] || null;
}

function appendMatrixLikeFirewallPoolRows(rows, lookupAttr, prefix) {
  if (prefix === "sr6_matrix") {
    appendMatrixCoreDetailRows(rows, lookupAttr, "firewall", "Firewall", { poolComponent: true });
    return;
  }
  appendRowIfMissing(rows, "Firewall", `${parseNumber(lookupAttr(`${prefix}_firewall`))}`, { poolComponent: true });
}

function appendMatrixLikeDefenseValueDetailRows(rows, definition, lookupAttr) {
  const config = getMatrixLikeDefenseConfig(definition);
  if (!config) return;

  if (config.prefix === "sr6_matrix") {
    appendMatrixCoreDetailRows(rows, lookupAttr, "datenverarbeitung", "Verteidigungswert Datenverarbeitung");
    appendMatrixCoreDetailRows(rows, lookupAttr, "firewall", "Verteidigungswert Firewall");
  } else {
    appendRowIfMissing(rows, "Verteidigungswert Datenverarbeitung", `${parseNumber(lookupAttr(`${config.prefix}_datenverarbeitung`))}`);
    appendRowIfMissing(rows, "Verteidigungswert Firewall", `${parseNumber(lookupAttr(`${config.prefix}_firewall`))}`);
  }
  appendRowIfMissing(rows, "Verteidigungswert Modifikator", `${parseNumber(lookupAttr(`${config.prefix}_verteidigungswert_modifikator`))}`);
  appendRowIfMissing(rows, "Verteidigungswert Gesamtwert", `${parseNumber(lookupAttr(`${config.prefix}_verteidigungswert`))}`);
}

function appendKnownPoolFormulaRows(rows, definition, lookupAttr, poolAttribute) {
  if (!poolAttribute) return false;
  const matrixCoreMatch = `${poolAttribute || ""}`.match(/^sr6_matrix_(angriff|schleicher|datenverarbeitung|firewall)_gesamtwert$/);
  if (matrixCoreMatch) {
    const labelMap = {
      angriff: "Angriff",
      schleicher: "Schleicher",
      datenverarbeitung: "Datenverarbeitung",
      firewall: "Firewall",
    };
    appendMatrixCoreDetailRows(rows, lookupAttr, matrixCoreMatch[1], labelMap[matrixCoreMatch[1]] || "Matrixwert", {
      poolComponent: true,
      includeZeroModifier: true,
    });
    return true;
  }

  const matrixDefenseConfig = getMatrixLikeDefenseConfig(definition);
  if (matrixDefenseConfig) {
    if (matrixDefenseConfig.kind === "defense") {
      appendAttributeDetailRows(rows, lookupAttr, "intuition", "Intuition", { poolComponent: true });
      appendMatrixLikeFirewallPoolRows(rows, lookupAttr, matrixDefenseConfig.prefix);
      return true;
    }
    if (matrixDefenseConfig.kind === "damage_resistance") {
      appendMatrixLikeFirewallPoolRows(rows, lookupAttr, matrixDefenseConfig.prefix);
      return true;
    }
    if (matrixDefenseConfig.kind === "biofeedback_damage_resistance") {
      appendAttributeDetailRows(rows, lookupAttr, "willenskraft", "Willenskraft", { poolComponent: true });
      return true;
    }
  }
  if (poolAttribute === "sr6_verteidigung_physisch_gesamtwert") {
    appendGenericFormulaComponentRows(rows, lookupAttr, "Reaktion + Intuition");
    return true;
  }
  if (poolAttribute === "sr6_schadenswiderstand_physisch_gesamtwert") {
    appendGenericFormulaComponentRows(rows, lookupAttr, "Konstitution");
    return true;
  }
  if (poolAttribute === "sr6_magic_magie") {
    appendAttributeDetailRows(rows, lookupAttr, "magie_resonanz", "Attributwert", { poolComponent: true });
    return true;
  }
  if (poolAttribute === "sr6_magic_zauberpool") {
    appendSkillDetailRows(rows, lookupAttr, "hexerei", "Fertigkeitswert", { poolComponent: true });
    return true;
  }
  if (poolAttribute === "sr6_magic_spruchzauberei") {
    appendGenericFormulaComponentRows(rows, lookupAttr, "Magie/Resonanz + Hexerei");
    return true;
  }
  if (poolAttribute === "sr6_magic_beschwoeren") {
    appendGenericFormulaComponentRows(rows, lookupAttr, "Magie/Resonanz + Beschwören");
    return true;
  }
  if (poolAttribute === "sr6_magic_waffenloser_kampf") {
    appendAttributeDetailRows(rows, lookupAttr, "willenskraft", "Willenskraft", { poolComponent: true });
    appendSkillDetailRows(rows, lookupAttr, "astral", "Fertigkeitswert", { poolComponent: true });
    return true;
  }
  if (poolAttribute === "sr6_magic_astrale_verteidigung") {
    appendAttributeDetailRows(rows, lookupAttr, "logik", "Logik", { poolComponent: true });
    appendAttributeDetailRows(rows, lookupAttr, "intuition", "Intuition", { poolComponent: true });
    return true;
  }
  if (poolAttribute === "sr6_magic_astraler_schadenswiderstand") {
    appendAttributeDetailRows(rows, lookupAttr, "willenskraft", "Willenskraft", { poolComponent: true });
    return true;
  }
  if (poolAttribute === "sr6_magic_entzug_widerstand") {
    const traditionAttribute = `${lookupAttr("sr6_magic_traditionsattribut_1") || ""}`.trim();
    const traditionKey = mapTraditionsattributToKey(traditionAttribute);
    if (traditionKey) {
      appendAttributeDetailRows(rows, lookupAttr, traditionKey, traditionAttribute || "Traditionsattribut", { poolComponent: true });
    }
    appendGenericFormulaComponentRows(rows, lookupAttr, "Willenskraft");
    return true;
  }
  if (definition && definition.probeModel === "attribute_probe") {
    appendGenericFormulaComponentRows(rows, lookupAttr, (rows.find((row) => row && row.label === "Formel") || {}).value);
  }
  return false;
}

function appendCombatDefenseValueDetailRows(rows, definition, lookupAttr) {
  if (!definition || ![
    "physical_defense",
    "physical_damage_resistance",
    "general_defense",
    "general_damage_resistance",
  ].includes(definition.id)) {
    return;
  }

  const constitutionBase = parseNumber(lookupAttr("sr6_attr_konstitution_grundwert"));
  const constitutionModifier = parseNumber(lookupAttr("sr6_attr_konstitution_modifikator"));
  const constitutionTotal = resolveRollAttributeTotal("konstitution", lookupAttr);
  const primaryArmor = parseNumber(lookupAttr("sr6_combat_primaere_panzerung"));
  const secondaryArmor = parseNumber(lookupAttr("sr6_combat_sekundaere_panzerung"));
  const helmet = parseNumber(lookupAttr("sr6_combat_helm"));
  const shield = parseNumber(lookupAttr("sr6_combat_schild"));
  const defenseValueModifier = parseNumber(lookupAttr("sr6_combat_verteidigungswert_modifikator"));
  const defenseValueTotal = parseNumber(lookupAttr("sr6_combat_verteidigungswert_gesamtwert"));

  appendRowIfMissing(rows, "Verteidigungswert Konstitution Basis", `${constitutionBase}`);
  appendRowIfMissing(rows, "Verteidigungswert Konstitution Modifikator", `${constitutionModifier}`);
  appendRowIfMissing(rows, "Verteidigungswert Konstitution Gesamtwert", `${constitutionTotal}`);
  appendRowIfMissing(rows, "Verteidigungswert Primäre Panzerung", `${primaryArmor}`);
  appendRowIfMissing(rows, "Verteidigungswert Sekundäre Panzerung", `${secondaryArmor}`);
  appendRowIfMissing(rows, "Verteidigungswert Helm", `${helmet}`);
  appendRowIfMissing(rows, "Verteidigungswert Schild", `${shield}`);
  appendRowIfMissing(rows, "Verteidigungswert Modifikator", `${defenseValueModifier}`);
  appendRowIfMissing(rows, "Verteidigungswert Gesamtwert", `${defenseValueTotal}`);
}

function appendDrainResistanceDetailRows(rows, lookupAttr) {
  const traditionAttribute = `${lookupAttr("sr6_magic_traditionsattribut_1") || ""}`.trim();
  const traditionKey = mapTraditionsattributToKey(traditionAttribute);

  if (traditionAttribute) {
    appendRowIfMissing(rows, "Entzug Traditionsattribut", traditionAttribute);
  }
  if (traditionKey) {
    appendAttributeDetailRows(rows, lookupAttr, traditionKey, `Entzug ${traditionAttribute}`);
  }
  appendAttributeDetailRows(rows, lookupAttr, "willenskraft", "Entzug Willenskraft");
  appendRowIfMissing(rows, "Entzugswiderstand Gesamtwert", `${parseNumber(lookupAttr("sr6_magic_entzug_widerstand"))}`);
}

function getCombatPoolAttributeLabel(definition, resolvedFields) {
  if (!definition) return "";
  if (definition.id === "combat_ranged_core_attack" || definition.id === "combat_ranged_weapon" || definition.id === "ranged_weapon") {
    return "Geschicklichkeit";
  }
  if (definition.id === "combat_melee_core_attack" || definition.id === "combat_melee_weapon" || definition.id === "melee_weapon") {
    return `${(resolvedFields && resolvedFields.Attribut) || "Geschicklichkeit"}`.trim();
  }
  return "";
}

function getCombatPoolSkillKey(definition, resolvedFields) {
  if (!definition) return "";
  if (definition.id === "combat_ranged_core_attack" || definition.id === "combat_ranged_weapon" || definition.id === "ranged_weapon") {
    return resolveRangedCombatSkillKey(resolvedFields && resolvedFields.Fertigkeit);
  }
  if (definition.id === "combat_melee_core_attack" || definition.id === "combat_melee_weapon" || definition.id === "melee_weapon") {
    return resolveMeleeCombatSkillKey(resolvedFields && resolvedFields.Fertigkeit);
  }
  return "";
}

function appendCombatSpecializationDetailRows(rows, definition, lookupAttr, skillKey, resolvedFields) {
  if (!skillKey) return;
  const selectedSkill = `${(resolvedFields && resolvedFields.Fertigkeit) || getSkillDetailLabel(skillKey)}`.trim();
  const weaponType = `${(resolvedFields && resolvedFields.Waffentyp) || ""}`.trim();
  const selection = {
    specialization: lookupAttr(`sr6_skill_${skillKey}_spezialisierung`),
    expertise: lookupAttr(`sr6_skill_${skillKey}_expertise`),
  };
  const matchingNames = definition && (
    definition.id === "combat_ranged_core_attack" ||
    definition.id === "combat_ranged_weapon" ||
    definition.id === "ranged_weapon"
  )
    ? getCombatRangedSpecializationMatches(selectedSkill, weaponType)
    : getCombatMeleeSpecializationMatches(selectedSkill, weaponType);
  const bonus = getCombatSpecializationBonus(selection.specialization, selection.expertise, matchingNames);

  appendRowIfMissing(rows, "Spezialisierung Auswahl", selection.specialization || "-");
  appendRowIfMissing(rows, "Expertise Auswahl", selection.expertise || "-");
  if (bonus === 3) {
    appendRowIfMissing(rows, "Expertise", "+3", { poolComponent: true });
  } else if (bonus === 2) {
    appendRowIfMissing(rows, "Spezialisierung", "+2", { poolComponent: true });
  } else {
    appendRowIfMissing(rows, "Spezialisierung/Expertise", "0", { poolComponent: true });
  }
}

function resolveComputedCombatPopupSkillBonusState(definition, resolvedFields, lookupAttr) {
  if (!isComputedCombatPoolDefinition(definition)) {
    return null;
  }

  const skillKey = getCombatPoolSkillKey(definition, resolvedFields);
  if (!skillKey) {
    return null;
  }

  const selectedSkill = `${(resolvedFields && resolvedFields.Fertigkeit) || getSkillDetailLabel(skillKey)}`.trim();
  const weaponType = `${(resolvedFields && resolvedFields.Waffentyp) || ""}`.trim();
  const specialization = lookupAttr(`sr6_skill_${skillKey}_spezialisierung`);
  const expertise = lookupAttr(`sr6_skill_${skillKey}_expertise`);
  const matchingNames = definition && (
    definition.id === "combat_ranged_core_attack" ||
    definition.id === "combat_ranged_weapon" ||
    definition.id === "ranged_weapon"
  )
    ? getCombatRangedSpecializationMatches(selectedSkill, weaponType)
    : getCombatMeleeSpecializationMatches(selectedSkill, weaponType);
  const matches = new Set((matchingNames || []).map(normalizeCombatSpecializationName).filter(Boolean));
  const expertiseActive = matches.has(normalizeCombatSpecializationName(expertise));
  const specializationActive = !expertiseActive && matches.has(normalizeCombatSpecializationName(specialization));

  return {
    specializationActive: specializationActive,
    expertiseActive: expertiseActive,
  };
}

function appendComputedCombatPoolDetailRows(rows, definition, lookupAttr, resolvedFields) {
  if (!isComputedCombatPoolDefinition(definition)) return false;

  const attributeLabel = getCombatPoolAttributeLabel(definition, resolvedFields);
  const attributeKey = getAttributeDetailKey(attributeLabel);
  const skillKey = getCombatPoolSkillKey(definition, resolvedFields);

  appendRowIfMissing(rows, "Attribut", attributeLabel);
  appendAttributeDetailRows(rows, lookupAttr, attributeKey, "Attributwert", { poolComponent: true });
  appendSkillDetailRows(rows, lookupAttr, skillKey, "Fertigkeitswert", { poolComponent: true });
  appendCombatSpecializationDetailRows(rows, definition, lookupAttr, skillKey, resolvedFields);
  return true;
}

function appendBasePoolDetailRows(rows, definition, lookupAttr, poolAttribute, skillAttributeOverride, resolvedFields) {
  if (appendComputedCombatPoolDetailRows(rows, definition, lookupAttr, resolvedFields)) {
    return;
  }

  if (appendKnownPoolFormulaRows(rows, definition, lookupAttr, poolAttribute)) {
    return;
  }

  const attributeKey = getPoolAttributeDetailKey(poolAttribute);
  if (attributeKey) {
    appendAttributeDetailRows(rows, lookupAttr, attributeKey, "", { poolComponent: true });
    return;
  }

  const skillKey = getPoolSkillDetailKey(poolAttribute);
  if (skillKey) {
    if (skillAttributeOverride && skillAttributeOverride.selectedAttribute) {
      const selectedAttributeKey = getAttributeDetailKey(skillAttributeOverride.selectedAttribute);
      appendRowIfMissing(rows, "Attribut", skillAttributeOverride.selectedAttribute);
      appendAttributeDetailRows(rows, lookupAttr, selectedAttributeKey, "Attributwert", { poolComponent: true });
    }
    appendSkillDetailRows(rows, lookupAttr, skillKey, "Fertigkeitswert", { poolComponent: true });
    return;
  }

  if (definition && definition.probeModel === "skill_probe" && skillAttributeOverride) {
    const selectedAttributeKey = getAttributeDetailKey(skillAttributeOverride.selectedAttribute);
    appendRowIfMissing(rows, "Attribut", skillAttributeOverride.selectedAttribute);
    appendAttributeDetailRows(rows, lookupAttr, selectedAttributeKey, "Attributwert", { poolComponent: true });
  }

  appendFormulaAttributeDetailRows(rows, lookupAttr, resolvedFields && resolvedFields.Formel);
}

const SR6_UNTRAINED_SKILL_LABELS = {
  astral: "Astral",
  athletik: "Athletik",
  beschwoeren: "Beschwören",
  biotech: "Biotech",
  cracken: "Cracken",
  einfluss: "Einfluss",
  elektronik: "Elektronik",
  exotische_waffen: "Exotische Waffen",
  feuerwaffen: "Feuerwaffen",
  heimlichkeit: "Heimlichkeit",
  hexerei: "Hexerei",
  mechanik: "Mechanik",
  nahkampf: "Nahkampf",
  natur: "Natur",
  steuern: "Steuern",
  tasken: "Tasken",
  ueberreden: "Überreden",
  verzaubern: "Verzaubern",
  wahrnehmung: "Wahrnehmung",
};

function getUntrainedSkillLabel(skillKey) {
  return SR6_UNTRAINED_SKILL_LABELS[skillKey] || `${skillKey || ""}`;
}

function getUntrainedSkillPenalty(skillKey, lookupAttr) {
  if (!skillKey) return null;
  const baseValue = parseNumber(lookupAttr(`sr6_skill_${skillKey}_grundwert`));
  if (baseValue > 0) return null;

  return {
    skillKey: skillKey,
    label: getUntrainedSkillLabel(skillKey),
    value: -1,
  };
}

function applyUntrainedSkillPenaltyToPopupState(popupState, untrainedPenalty, options) {
  const state = normalizePopupState(popupState);
  if (!untrainedPenalty) return state;

  const rows = Array.isArray(state.rows) ? [...state.rows] : [];
  const rowValue = `${untrainedPenalty.label}: -1`;
  const applyPoolModifier = !options || options.applyPoolModifier !== false;
  const hasUntrainedRow = rows.some((row) => (
    row &&
    row.label === "Ungeübt" &&
    `${row.value || ""}`.trim() === rowValue
  ));

  return {
    ...state,
    poolMod: applyPoolModifier ? state.poolMod + untrainedPenalty.value : state.poolMod,
    rows: hasUntrainedRow ? rows : [...rows, { label: "Ungeübt", value: rowValue }],
  };
}

function resolveRangedCombatSkillKey(selectedSkill) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  if (skill === "Projektilwaffen") return "athletik";
  if (skill === "Exotische Waffen") return "exotische_waffen";
  return "feuerwaffen";
}

function resolveMeleeCombatSkillKey(selectedSkill) {
  return `${selectedSkill || "Nahkampf"}`.trim() === "Exotische Waffen"
    ? "exotische_waffen"
    : "nahkampf";
}

function getCombatUntrainedSkillKey(definition, resolvedFields) {
  if (!definition) return "";

  if (definition.id === "combat_ranged_core_attack" || definition.id === "combat_ranged_weapon" || definition.id === "ranged_weapon") {
    return resolveRangedCombatSkillKey(resolvedFields && resolvedFields.Fertigkeit);
  }

  if (definition.id === "combat_melee_core_attack" || definition.id === "combat_melee_weapon" || definition.id === "melee_weapon") {
    return resolveMeleeCombatSkillKey(resolvedFields && resolvedFields.Fertigkeit);
  }

  return "";
}

function isComputedCombatPoolDefinition(definition) {
  return !!(
    definition &&
    (
      definition.id === "combat_ranged_core_attack" ||
      definition.id === "combat_ranged_weapon" ||
      definition.id === "ranged_weapon" ||
      definition.id === "combat_melee_core_attack" ||
      definition.id === "combat_melee_weapon" ||
      definition.id === "melee_weapon"
    )
  );
}

function getMagicUntrainedSkillKey(definition) {
  if (!definition) return "";
  if (definition.id === "spell") return "hexerei";
  if (definition.id === "summoning") return "beschwoeren";
  return "";
}

function getMatrixUntrainedSkillKey(matrixActionContext) {
  if (!matrixActionContext) return "";
  const component = matrixActionContext.rollMode === "defense"
    ? matrixActionContext.defenseOption
    : matrixActionContext.rule && matrixActionContext.rule.probe;
  return component && component.skill ? component.skill : "";
}

function getRiggingVehicleUntrainedSkillKey(probeKey, mode) {
  const modeKey = normalizeRiggingVehicleMode(mode);
  if (modeKey === "autonomous" || modeKey === "agent") {
    return "";
  }

  if (probeKey === "damage_resistance") return "";
  if (probeKey === "weapon_attack") return "mechanik";
  if (probeKey === "stealth") return "heimlichkeit";
  if (probeKey === "perception") return "wahrnehmung";
  return "steuern";
}

function getRollUntrainedSkillPenalty(definition, resolvedFields, lookupAttr, matrixActionContext) {
  const directSkillKey = definition && definition.probeModel === "skill_probe" ? definition.skillKey : "";
  const combatSkillKey = getCombatUntrainedSkillKey(definition, resolvedFields);
  const matrixSkillKey = getMatrixUntrainedSkillKey(matrixActionContext);
  const skillKey = directSkillKey || combatSkillKey || matrixSkillKey;
  return getUntrainedSkillPenalty(skillKey, lookupAttr);
}

function resolveMatrixActionComponentValue(component, lookupAttr) {
  if (!component || component.type === "none" || component.type === "description") {
    return null;
  }

  if (component.multiplier && component.matrix) {
    const multiplier = parseNumber(component.multiplier);
    const matrixValue = resolveMatrixCoreDetail(lookupAttr, component.matrix).total;
    return {
      label: component.label || component.matrix,
      value: matrixValue * multiplier,
      parts: [{ label: component.matrix, type: "matrix", value: matrixValue }],
      multiplier: multiplier,
    };
  }

  if (component.target) {
    return {
      label: component.label || component.target,
      value: null,
      parts: [],
    };
  }

  const parts = [];
  let total = 0;

  if (component.skill) {
    const value = resolveRollSkillTotal(component.skill, lookupAttr);
    parts.push({ label: component.skill, type: "skill", value: value });
    total += value;
  }
  if (component.attribute) {
    const value = resolveRollAttributeTotal(component.attribute, lookupAttr);
    parts.push({ label: component.attribute, type: "attribute", value: value });
    total += value;
  }
  if (component.matrix) {
    const value = resolveMatrixCoreDetail(lookupAttr, component.matrix).total;
    parts.push({ label: component.matrix, type: "matrix", value: value });
    total += value;
  }
  if (component.matrixSecond) {
    const value = resolveMatrixCoreDetail(lookupAttr, component.matrixSecond).total;
    parts.push({ label: component.matrixSecond, type: "matrix", value: value });
    total += value;
  }

  if (parts.length === 0) {
    return null;
  }

  return {
    label: component.label || parts.map((part) => part.label).join(" + "),
    value: total,
    parts: parts,
  };
}

function resolveMatrixActionRuleContext(definition, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.id !== "matrix_action") {
    return null;
  }

  const actionKey = getMatrixActionKeyFromPoolAttribute(poolAttribute);
  const rollMode = getMatrixActionRollModeFromPoolAttribute(poolAttribute);
  const rule = getMatrixActionRule(actionKey);
  if (!actionKey || !rule) {
    return null;
  }

  const probe = resolveMatrixActionComponentValue(rule.probe, lookupAttr);
  const defense = rule.defense || {};
  const selectedDefense = `${(((popupState || {}).selectedValues || {}).matrix_defense) || lookupAttr(`sr6_matrix_handlung_${actionKey}_verteidigung_auswahl`) || ""}`.trim();
  const defenseOption = Array.isArray(defense.options)
    ? (defense.options.find((option) => `${option.label || ""}`.trim() === selectedDefense) || defense.options[0])
    : defense;
  const defenseValue = resolveMatrixActionComponentValue(defenseOption, lookupAttr);
  const poolBasisOverride = rollMode === "defense"
    ? (defenseValue && defenseValue.value !== null ? defenseValue.value : null)
    : (probe ? probe.value : null);

  return {
    actionKey: actionKey,
    rollMode: rollMode,
    rule: rule,
    probe: probe,
    defense: defense,
    defenseOption: defenseOption,
    defenseValue: defenseValue,
    poolBasisOverride: poolBasisOverride,
  };
}

function formatMatrixActionComponentLabel(label) {
  const componentLabels = {
    angriff: "Angriff",
    cracken: "Cracken",
    datenverarbeitung: "Datenverarbeitung",
    elektronik: "Elektronik",
    firewall: "Firewall",
    intuition: "Intuition",
    logik: "Logik",
    schleicher: "Schleicher",
    willenskraft: "Willenskraft",
  };

  return componentLabels[`${label || ""}`.trim()] || `${label || ""}`.trim();
}

function appendMatrixActionComponentDetailRows(rows, rowPrefix, componentValue, lookupAttr, options = {}) {
  if (!componentValue || componentValue.value === null) return;

  (componentValue.parts || []).forEach((part) => {
    if (options.poolComponent && part.type === "skill") {
      appendSkillDetailRows(rows, lookupAttr, part.label, formatMatrixActionComponentLabel(part.label), {
        poolComponent: true,
      });
    }
    if (options.poolComponent && part.type === "attribute") {
      appendAttributeDetailRows(rows, lookupAttr, part.label, formatMatrixActionComponentLabel(part.label), {
        poolComponent: true,
      });
    }
    if (options.poolComponent && part.type === "matrix") {
      appendRowIfMissing(
        rows,
        `Matrixattribut ${formatMatrixActionComponentLabel(part.label)}`,
        `${parseNumber(part.value)}`,
        { poolComponent: true }
      );
    }
    if (rowPrefix === "Probe" && part.type === "skill") {
      appendSkillDetailRows(rows, lookupAttr, part.label, formatMatrixActionComponentLabel(part.label), {
        poolComponent: !!options.poolComponent,
      });
      return;
    }
    if (rowPrefix === "Probe" && part.type === "attribute") {
      appendAttributeDetailRows(rows, lookupAttr, part.label, formatMatrixActionComponentLabel(part.label), {
        poolComponent: !!options.poolComponent,
      });
      return;
    }
    if (rowPrefix === "Probe" && part.type === "matrix") {
      appendRowIfMissing(
        rows,
        `Matrixattribut ${formatMatrixActionComponentLabel(part.label)}`,
        `${parseNumber(part.value)}`,
        { poolComponent: !!options.poolComponent }
      );
      return;
    }
    appendRowIfMissing(
      rows,
      `${rowPrefix} ${formatMatrixActionComponentLabel(part.label)}`,
      `${parseNumber(part.value)}`,
      { poolComponent: !!options.poolComponent }
    );
  });
  if (parseNumber(componentValue.multiplier) > 1) {
    appendRowIfMissing(rows, `${rowPrefix} Multiplikator`, `x${parseNumber(componentValue.multiplier)}`);
    appendRowIfMissing(
      rows,
      `${rowPrefix} Multiplikator-Bonus`,
      `${parseNumber(componentValue.value) - (componentValue.parts || []).reduce((sum, part) => sum + parseNumber(part.value), 0)}`,
      { poolComponent: !!options.poolComponent }
    );
  }
  appendRowIfMissing(
    rows,
    `${rowPrefix} Gesamtwert`,
    `${parseNumber(componentValue.value)}`
  );
}

function appendMatrixActionRows(rows, matrixActionContext, lookupAttr) {
  if (!matrixActionContext) return;

  const rule = matrixActionContext.rule || {};
  const probe = matrixActionContext.probe;
  const defense = matrixActionContext.defense || {};
  const defenseValue = matrixActionContext.defenseValue;
  const defenseOption = matrixActionContext.defenseOption || {};

  if (rule.probe && rule.probe.type === "none") {
    rows.push({ label: "Probe", value: "Keine Probe" });
  } else if (rule.probe && rule.probe.type === "description") {
    rows.push({ label: "Probe", value: "Siehe Beschreibung" });
  } else if (probe) {
    rows.push({ label: "Probe", value: probe.label });
    if (matrixActionContext.rollMode !== "defense") {
      appendMatrixActionComponentDetailRows(rows, "Probe", probe, lookupAttr, {
        poolComponent: true,
      });
    }
  }

  if (rule.probe && rule.probe.linkedMatrixAttribute) {
    rows.push({ label: "Matrixattribut", value: rule.probe.linkedMatrixAttribute });
  }
  if (rule.probe && rule.probe.specialization) {
    rows.push({ label: "Spezialisierung", value: rule.probe.specialization });
  }

  if (defense.type === "none") {
    rows.push({ label: "Verteidigung", value: "Keine Verteidigungsprobe" });
  } else if (defense.type === "description") {
    rows.push({ label: "Verteidigung", value: "Siehe Beschreibung" });
  } else if (defense.type === "fixed_formula" && defenseValue && defenseValue.value !== null) {
    rows.push({ label: "Verteidigung", value: defenseValue.label });
    rows.push({ label: "Verteidigungswert", value: `${defenseValue.value}` });
    appendMatrixActionComponentDetailRows(rows, "Verteidigungswert", defenseValue, lookupAttr, {
      poolComponent: matrixActionContext.rollMode === "defense",
    });
  } else if (defense.type === "fixed_formula") {
    rows.push({ label: "Verteidigung", value: defense.label || "Zielwert" });
  } else if (defenseValue && defenseValue.value !== null) {
    rows.push({ label: "Verteidigung", value: defenseValue.label });
    rows.push({ label: "Verteidigungswert", value: `${defenseValue.value}` });
    appendMatrixActionComponentDetailRows(rows, "Verteidigungswert", defenseValue, lookupAttr, {
      poolComponent: matrixActionContext.rollMode === "defense",
    });
  } else if (defenseOption && defenseOption.label) {
    rows.push({ label: "Verteidigung", value: defenseOption.label });
  }
}

function resolvePopupDerivedSourceAttr(result, resolvedFields) {
  if (!result || !resolvedFields) {
    return "";
  }

  if (result.sourceByRange && resolvedFields.Reichweite) {
    return result.sourceByRange[resolvedFields.Reichweite] || "";
  }

  return result.sourceAttr || "";
}

function normalizeFireMode(mode) {
  const normalizedMode = `${mode || ""}`.trim().toLowerCase();
  if (normalizedMode === "hm") return "HM";
  if (normalizedMode === "sm - eng" || normalizedMode === "sm eng" || normalizedMode === "sm-eng") return "SM - Eng";
  if (normalizedMode === "sm - breit" || normalizedMode === "sm breit" || normalizedMode === "sm-breit") return "SM - Breit";
  if (normalizedMode === "am") return "AM";
  return "EM";
}

function getFireModeModifier(mode) {
  const normalizedMode = normalizeFireMode(mode);
  const modifiers = {
    EM: {
      label: "EM",
      attackValueMod: 0,
      damageMod: 0,
      shots: 1,
      note: "",
    },
    HM: {
      label: "HM",
      attackValueMod: -2,
      damageMod: 1,
      shots: 2,
      note: "",
    },
    "SM - Eng": {
      label: "SM - Eng",
      attackValueMod: -4,
      damageMod: 2,
      shots: 4,
      note: "",
    },
    "SM - Breit": {
      label: "SM - Breit",
      attackValueMod: -2,
      damageMod: 1,
      shots: 4,
      note: "Breite Salve: Pool auf zwei Ziele aufteilen; je Ziel wie Halbautomatischer Modus.",
    },
    AM: {
      label: "AM",
      attackValueMod: -6,
      damageMod: 0,
      shots: 10,
      note: "Vollautomatik: ein Angriffswurf gegen alle gueltigen Ziele im 1-m-Radius.",
    },
  };

  return modifiers[normalizedMode] || modifiers.EM;
}

function shouldApplyFireMode(definition, resolvedFields) {
  if (!definition || definition.id !== "ranged_weapon") {
    return false;
  }

  return !!(resolvedFields && resolvedFields.Modus);
}

function formatSignedModifier(value) {
  const numberValue = parseNumber(value);
  return numberValue > 0 ? `+${numberValue}` : `${numberValue}`;
}

function getRollOnlyPoolModifier(context, lookupAttr) {
  const modifierAttribute = getRollModifierAttribute(context && context.poolAttribute);
  return modifierAttribute ? parseNumber(lookupAttr(modifierAttribute)) : 0;
}

function appendRollOnlyPoolModifierRow(rows, modifier) {
  const rollOnlyModifier = parseNumber(modifier);
  if (rollOnlyModifier === 0) return;
  rows.push({ label: "Wert-Modifikator", value: formatSignedModifier(rollOnlyModifier) });
}

function isMeleeWeaponAttackDefinition(definition) {
  return !!(definition && (definition.id === "melee_weapon" || definition.id === "combat_melee_weapon"));
}

function isUnarmedCombatWeaponType(value) {
  return normalizeCombatSpecializationName(value) === normalizeCombatSpecializationName("Waffenloser Kampf");
}

function isWhipCombatContext(resolvedFields) {
  return normalizeCombatSpecializationName(resolvedFields && resolvedFields.Waffentyp) === normalizeCombatSpecializationName("Peitschen");
}

function isWeaponAttackDefinition(definition) {
  return !!(definition && definition.templateVariant === "weapon");
}

function resolveWeaponAttackValueBase(definition, lookupAttr, resolvedFields, result, sourceAttr, rawBaseValue) {
  if (!result || result.kind !== "attack_value" || !isMeleeWeaponAttackDefinition(definition)) {
    return { value: rawBaseValue, rows: [] };
  }

  const agilityValue = parseNumber(lookupAttr("sr6_attr_geschicklichkeit_gesamtwert"));
  const strengthValue = parseNumber(lookupAttr("sr6_attr_staerke_gesamtwert"));
  const reactionValue = parseNumber(lookupAttr("sr6_attr_reaktion_gesamtwert"));
  const weaponType = `${(resolvedFields && resolvedFields.Waffentyp) || ""}`.trim();
  const selectedAttribute = `${(resolvedFields && resolvedFields.Attribut) || "Geschicklichkeit"}`.trim();

  if (isUnarmedCombatWeaponType(weaponType)) {
    if (selectedAttribute === "Stärke") {
      return {
        value: agilityValue + reactionValue,
        rows: [
          { label: "Angriffswert-Formel", value: "Waffenloser Kampf mit Stärke-Pool: Geschicklichkeit + Reaktion" },
          { label: "Geschicklichkeit-Wert", value: `${agilityValue}` },
          { label: "Reaktion-Wert", value: `${reactionValue}` },
        ],
      };
    }

    return {
      value: reactionValue + strengthValue,
      rows: [
        { label: "Angriffswert-Formel", value: "Waffenloser Kampf: Reaktion + Stärke" },
        { label: "Reaktion-Wert", value: `${reactionValue}` },
        { label: "Stärke-Wert", value: `${strengthValue}` },
      ],
    };
  }

  if (isWhipCombatContext(resolvedFields)) {
    return {
      value: rawBaseValue + reactionValue,
      rows: [
        { label: "Angriffswert-Formel", value: "Peitschen: Waffen-Angriffswert + Reaktion" },
        { label: "Angriffswert-Basis", value: `${rawBaseValue}` },
        { label: "Reaktion-Wert", value: `${reactionValue}` },
      ],
    };
  }

  return {
    value: rawBaseValue + strengthValue,
    rows: [
      { label: "Angriffswert-Basis", value: `${rawBaseValue}` },
      { label: "Stärke-Wert", value: `${strengthValue}` },
    ],
  };
}

function buildPopupDerivedResultRows(definition, lookupAttr, poolAttribute, resolvedFields, popupState, computation = null) {
  const derivedResults = getPopupDerivedResults(definition);
  const rows = [];
  const fireMode = shouldApplyFireMode(definition, resolvedFields)
    ? getFireModeModifier(resolvedFields.Modus)
    : null;

  if (fireMode) {
    rows.push({ label: "Feuermodus", value: fireMode.label });
    rows.push({ label: "Feuermodus-Schuss", value: `${fireMode.shots}` });
    if (fireMode.note) {
      rows.push({ label: "Feuermodus-Hinweis", value: fireMode.note });
    }
  }

  derivedResults.forEach((result) => {
    const resultKind = result.kind || "";
    const popupModifier = resultKind === "attack_value"
      ? parseNumber(popupState.attackValueMod)
      : resultKind === "damage"
        ? parseNumber(popupState.damageMod)
        : 0;
    const fireModeModifier = fireMode && resultKind === "attack_value"
      ? fireMode.attackValueMod
      : fireMode && resultKind === "damage"
        ? fireMode.damageMod
        : 0;
    const modifier = popupModifier + fireModeModifier;

    const shouldAlwaysShowAttackValue = resultKind === "attack_value" && result.sourceByRange;
    const shouldAlwaysShowDamage = resultKind === "damage" && isWeaponAttackDefinition(definition);
    if (modifier === 0 && !shouldAlwaysShowAttackValue && !shouldAlwaysShowDamage) {
      return;
    }

    const sourceAttr = resolvePopupDerivedSourceAttr(result, resolvedFields);
    const resolvedAttackValue = `${(resolvedFields && resolvedFields.Angriffswert) || ""}`.trim();
    const rawBaseValue = result.source === "pool"
      ? parseNumber(lookupAttr(poolAttribute))
      : result.sourceByRange && resolvedAttackValue !== ""
        ? parseNumber(resolvedAttackValue)
        : parseNumber(lookupAttr(sourceAttr));
    const resolvedBase = resolveWeaponAttackValueBase(definition, lookupAttr, resolvedFields, result, sourceAttr, rawBaseValue);
    const baseValue = resolvedBase.value;
    const successDamageBonus = resultKind === "damage" && computation
      ? parseNumber(computation.successCount)
      : 0;
    const totalValue = baseValue + successDamageBonus + modifier;
    const labelBase = result.label || "Wert";

    if (resolvedBase.rows.length > 0) {
      resolvedBase.rows.forEach((row) => rows.push(row));
    } else {
      rows.push({ label: `${labelBase}-Basis`, value: `${baseValue}` });
    }
    if (successDamageBonus !== 0) {
      rows.push({ label: "Erfolge auf Schaden", value: `+${successDamageBonus}` });
    }
    if (fireModeModifier !== 0) {
      rows.push({
        label: resultKind === "attack_value" ? "Feuermodus-Angriffswert" : "Feuermodus-Schaden",
        value: formatSignedModifier(fireModeModifier),
      });
    }
    if (modifier !== 0) {
      rows.push({ label: `${labelBase}-Modifikator`, value: formatSignedModifier(modifier) });
    }
    rows.push({ label: `${labelBase}`, value: `${totalValue}` });
  });

  return rows;
}

function isCombatSpell(resolvedFields) {
  return `${(resolvedFields && resolvedFields.Art) || ""}`.trim() === "Kampf";
}

function resolveCombatSpellType(resolvedFields) {
  const type = `${(resolvedFields && resolvedFields.Typ) || ""}`.trim();
  return type === "Direkt" || type === "Indirekt" ? type : "";
}

function resolveSpellDamageType(resolvedFields) {
  return `${(resolvedFields && resolvedFields.Schadenstyp) || ""}`.trim() || "Körperlich";
}

function getSpellPopupNumber(popupState, key) {
  return parseNumber((((popupState || {}).selectedValues || {})[key]));
}

function appendSpellAttackValueDetailRows(rows, lookupAttr, resolvedFields, popupState, finalAttackValue) {
  const traditionAttribute = `${lookupAttr("sr6_magic_traditionsattribut_1") || ""}`.trim();
  const traditionKey = mapTraditionsattributToKey(traditionAttribute);
  const magicValue = parseNumber(lookupAttr("sr6_magic_magie"));
  const traditionValue = traditionKey ? resolveRollAttributeTotal(traditionKey, lookupAttr) : 0;
  const coreModifier = parseNumber(lookupAttr("sr6_magic_angriffswert_modifikator"));

  rows.push({ label: "Angriffswert-Formel", value: "Magie + Traditionsattribut" });
  rows.push({ label: "Angriffswert Magie", value: `${magicValue}` });
  if (traditionAttribute) {
    rows.push({ label: "Angriffswert Traditionsattribut", value: traditionAttribute });
  }
  rows.push({ label: "Angriffswert Traditionsattribut Wert", value: `${traditionValue}` });
  if (coreModifier !== 0) {
    rows.push({ label: "Angriffswert Kernwert-Modifikator", value: formatSignedModifier(coreModifier) });
  }
  if (popupState.attackValueMod !== 0) {
    rows.push({ label: "Angriffswert-Modifikator", value: formatSignedModifier(popupState.attackValueMod) });
  }
  rows.push({ label: "Angriffswert", value: `${finalAttackValue}` });
}

function appendSpellDrainDetailRows(rows, resolvedFields, popupState) {
  const baseDrain = parseNumber(resolvedFields.Entzug);
  const areaIncrease = getSpellPopupNumber(popupState, "area_increase");
  const overcast = getSpellPopupNumber(popupState, "overcast");
  const drainOnlyMod = getSpellPopupNumber(popupState, "drain_mod");
  const modifiedDrain = Math.max(0, baseDrain + popupState.drainMod);

  rows.push({ label: "Entzug-Basis", value: `${baseDrain}` });
  if (areaIncrease !== 0) {
    rows.push({ label: "Fläche Vergrößern-Entzug", value: formatSignedModifier(areaIncrease) });
  }
  if (overcast !== 0) {
    rows.push({ label: "Hochdrehen-Entzug", value: formatSignedModifier(overcast * 2) });
  }
  if (drainOnlyMod !== 0) {
    rows.push({ label: "Entzug-Modifikator", value: formatSignedModifier(drainOnlyMod) });
  }
  rows.push({ label: "Entzug", value: `${modifiedDrain}` });
}

function appendSpellDamageDetailRows(rows, lookupAttr, resolvedFields, popupState, spellSuccesses) {
  const spellType = resolveCombatSpellType(resolvedFields);
  if (!spellType) return;

  const magicValue = parseNumber(lookupAttr("sr6_magic_magie"));
  const overcast = getSpellPopupNumber(popupState, "overcast");
  const damageOnlyMod = getSpellPopupNumber(popupState, "damage_mod");
  const baseDamage = spellType === "Indirekt" ? Math.ceil(magicValue / 2) : 0;
  const finalDamage = Math.max(0, baseDamage + parseNumber(spellSuccesses) + popupState.damageMod);
  const damageType = resolveSpellDamageType(resolvedFields);

  rows.push({
    label: "Schaden-Formel",
    value: spellType === "Indirekt"
      ? "ceil(Magie / 2) + Erfolge + Hochdrehen"
      : "Erfolge + Hochdrehen",
  });
  rows.push({ label: "Schaden-Basis", value: `${baseDamage}` });
  rows.push({ label: "Erfolge auf Schaden", value: `+${parseNumber(spellSuccesses)}` });
  if (overcast !== 0) {
    rows.push({ label: "Hochdrehen-Schaden", value: formatSignedModifier(overcast) });
  }
  if (damageOnlyMod !== 0) {
    rows.push({ label: "Schadens-Modifikator", value: formatSignedModifier(damageOnlyMod) });
  }
  rows.push({ label: "Schadenstyp", value: damageType });
  rows.push({ label: "Schaden", value: damageType ? `${finalDamage} ${damageType}` : `${finalDamage}` });
}

function resolveDrainDamageType(remainingDrainDamage, magicValue) {
  if (parseNumber(remainingDrainDamage) <= 0) return "";
  return parseNumber(remainingDrainDamage) > parseNumber(magicValue) ? "Körperlich" : "Betäubung";
}

function resolveSummoningSpiritType(resolvedFields, popupState) {
  const selectedSpiritType = `${(((popupState || {}).selectedValues || {}).spirit_type) || ""}`.trim();
  if (selectedSpiritType) return selectedSpiritType;
  return `${(resolvedFields && resolvedFields.Typ) || ""}`.trim();
}

function resolveSummoningSpiritForce(resolvedFields, popupState) {
  const selectedSpiritForce = parseNumber(((popupState || {}).selectedValues || {}).spirit_force);
  if (selectedSpiritForce > 0) return selectedSpiritForce;
  return parseNumber(resolvedFields.Stufe);
}

function isSummoningPossessionCheckEnabled(popupState) {
  return `${(((popupState || {}).selectedValues || {}).possession) || ""}`.trim() === "1";
}

function appendRowIfMissing(rows, label, value, options = {}) {
  const normalizedValue = `${value === undefined || value === null ? "" : value}`.trim();
  if (!normalizedValue) return;
  const existingRow = rows.find((row) => row && row.label === label && `${row.value || ""}`.trim() === normalizedValue);
  if (existingRow) {
    if (options.poolComponent) {
      existingRow.poolComponent = true;
    }
    return;
  }
  rows.push({
    label: label,
    value: normalizedValue,
    poolComponent: !!options.poolComponent,
  });
}

function resolveEdgeBoostOptions(popupState, lookupAttr) {
  const boost = `${(((popupState || {}).selectedValues || {}).edge_boost) || "none"}`.trim();
  const edgeValue = Math.max(0, parseNumber(lookupAttr("sr6_attr_edge_gesamtwert")));
  const popupFateDiceCount = Math.max(0, parseNumber(((popupState || {}).selectedValues || {}).fate_dice));
  const matrixLonerActive = `${(((popupState || {}).selectedValues || {}).matrix_loner) || ""}`.trim() === "1";
  const matrixLonerFateDiceCount = matrixLonerActive ? 1 : 0;
  const baseOptions = {
    boost: boost,
    label: "",
    cost: 0,
    fateDiceCount: popupFateDiceCount,
    popupFateDiceCount: popupFateDiceCount,
    matrixLonerFateDiceCount: matrixLonerFateDiceCount,
    matrixLonerActive: matrixLonerActive,
  };

  switch (boost) {
    case "edge_attribute":
      return {
        ...baseOptions,
        boost: boost,
        label: "Edge-Attribut zum Pool",
        cost: 4,
        poolBonus: edgeValue,
        explodingSixes: true,
      };
    case "fate_1":
      return { ...baseOptions, boost: boost, label: "Jetzt erst recht", cost: 2, fateDiceCount: popupFateDiceCount + 1, edgeFateDiceCount: 1 };
    case "fate_2":
      return { ...baseOptions, boost: boost, label: "Jetzt erst recht", cost: 4, fateDiceCount: popupFateDiceCount + 2, edgeFateDiceCount: 2 };
    case "fate_3":
      return { ...baseOptions, boost: boost, label: "Jetzt erst recht", cost: 6, fateDiceCount: popupFateDiceCount + 3, edgeFateDiceCount: 3 };
    default:
      return { ...baseOptions, boost: "none" };
  }
}

function appendEdgeBoostRows(rows, edgeOptions, computation) {
  if (!edgeOptions || (edgeOptions.boost === "none" && parseNumber(edgeOptions.fateDiceCount) === 0 && !edgeOptions.matrixLonerActive)) return;
  const requestedFateDiceCount = parseNumber(edgeOptions.fateDiceCount) + parseNumber(edgeOptions.matrixLonerFateDiceCount);
  const totalFateDiceCount = computation
    ? parseNumber(computation.fateDiceCount)
    : requestedFateDiceCount;

  if (edgeOptions.boost !== "none") {
    appendRowIfMissing(rows, "Edge-Boost", edgeOptions.label);
    appendRowIfMissing(rows, "Edge-Kosten", `${edgeOptions.cost}`);
  }

  if (parseNumber(edgeOptions.poolBonus) > 0) {
    appendRowIfMissing(rows, "Edge-Poolbonus", `+${edgeOptions.poolBonus}`);
  }
  if (edgeOptions.explodingSixes) {
    appendRowIfMissing(rows, "Edge-Hinweis", "6en explodieren");
  }
  if (totalFateDiceCount > 0) {
    appendRowIfMissing(rows, "Schicksalswürfel", `${totalFateDiceCount}`);
    if (computation && Array.isArray(computation.fateDiceResults) && computation.fateDiceResults.length > 0) {
      appendRowIfMissing(rows, "Schicksalswürfel-Wurf", computation.fateDiceResults.join(" + "));
    }
    const fateDiceSources = [];
    if (parseNumber(edgeOptions.popupFateDiceCount) > 0) fateDiceSources.push(`Popup ${edgeOptions.popupFateDiceCount}`);
    if (parseNumber(edgeOptions.edgeFateDiceCount) > 0) fateDiceSources.push(`Edge ${edgeOptions.edgeFateDiceCount}`);
    if (parseNumber(edgeOptions.matrixLonerFateDiceCount) > 0) fateDiceSources.push(`Einzelgänger ${edgeOptions.matrixLonerFateDiceCount}`);
    if (fateDiceSources.length > 1) {
      appendRowIfMissing(rows, "Schicksalswürfel-Quelle", fateDiceSources.join(" + "));
    }
    if (requestedFateDiceCount > totalFateDiceCount) {
      appendRowIfMissing(rows, "Schicksalswürfel begrenzt", `${totalFateDiceCount} von ${requestedFateDiceCount}`);
    }
    appendRowIfMissing(
      rows,
      "Schicksalswürfel-Hinweis",
      "Schicksalswürfel ersetzen vorhandene Poolwürfel; Erfolg zählt als 3 Erfolge, eine 1 annulliert normale 5en."
    );
  }
  if (computation && parseNumber(computation.ignoredLonerFateOnes) > 0) {
    appendRowIfMissing(rows, "Einzelgänger-1 ignoriert", `${computation.ignoredLonerFateOnes}`);
  }
  if (computation && parseNumber(computation.cancelingFateOnes) > 0) {
    appendRowIfMissing(rows, "Annullierende Schicksalswürfel-1en", `${computation.cancelingFateOnes}`);
  }
  if (computation && parseNumber(computation.canceledNormalFives) > 0) {
    appendRowIfMissing(rows, "Normale 5en annulliert", `${computation.canceledNormalFives}`);
  }
  if (edgeOptions.matrixLonerActive) {
    appendRowIfMissing(rows, "Einzelgänger", "Aktiv (+1 Schicksalswürfel; nur dessen 1 annulliert keine normalen 5en)");
  }
  if (edgeOptions.postRollOnly) {
    appendRowIfMissing(rows, "Edge-Reaktion", "Nach dem Wurf manuell anwenden.");
  }
}

function saveEdgeLastRollContext(name, computation) {
  if (!computation || !Array.isArray(computation.diceResults) || computation.diceResults.length === 0) return;

  setAttrsSilent({
    sr6_edge_last_roll_name: name || "Probe",
    sr6_edge_last_roll_dice: computation.diceResults.join(","),
    sr6_edge_last_roll_successes: `${parseNumber(computation.successCount)}`,
    sr6_edge_last_roll_is_glitch: computation.isGlitch ? "1" : "0",
    sr6_edge_last_roll_is_critical_glitch: computation.isCriticalGlitch ? "1" : "0",
  });
}

function isRolltemplateDebugEnabled(lookupAttr) {
  return `${lookupAttr("sr6_setting_rolltemplate_debug") || "nein"}`.trim() === "ja";
}

function runInitiativeProbeFromContext(context, lookupAttr, resolvedFields) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const basis = parseNumber(resolvedFields.Basis);
  const diceCount = Math.max(0, parseNumber(resolvedFields.W6));
  const diceResults = [];
  let diceTotal = 0;

  for (let index = 0; index < diceCount; index += 1) {
    const die = rollD6();
    diceResults.push(die);
    diceTotal += die;
  }

  const total = basis + diceTotal;
  appendRowIfMissing(rows, "W6-Wurf", diceResults.length > 0 ? diceResults.join(" + ") : "0");
  appendRowIfMissing(rows, "Gesamt", `${total}`);

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    suppressSubject: true,
    pool: `${diceCount}`,
    resultLabel: "Initiative",
    resultValue: `${total}`,
    details: diceResults.join(" + "),
    detailsDice: buildNeutralDetailsDice(diceResults),
    edgeAction: false,
    isGlitch: false,
    characterId: lookupAttr("character_id"),
    debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
  });

  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function runEquipmentProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const usesEquipmentSource = !(context.definition && context.definition.id === "sin");
  const sourceKey = usesEquipmentSource ? `${(resolvedFields && resolvedFields.Auswahl) || ""}`.trim() : "";
  const sourceOption = getEquipmentSourceOption(sourceKey);
  const sourceValue = sourceOption ? parseNumber(lookupAttr(sourceOption.attr)) : 0;
  const rating = parseNumber((resolvedFields && resolvedFields.Stufe) || lookupAttr(context.poolAttribute));
  const ratingMultiplier = `${((popupState.selectedValues || {}).equipment_rating_x2) || ""}`.trim() === "1" ? 2 : 1;
  const ratingValue = rating * ratingMultiplier;
  const poolBasisOverride = sourceValue + ratingValue;
  const edgeOptions = resolveEdgeBoostOptions(popupState, lookupAttr);
  const rollOnlyPoolModifier = getRollOnlyPoolModifier(context, lookupAttr);
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod,
    rollOnlyPoolModifier,
    1,
    poolBasisOverride,
    edgeOptions
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  if (usesEquipmentSource) {
    rows.push({ label: "Bezug", value: sourceOption ? sourceOption.label : "Keine Auswahl" });
  }
  if (sourceOption) {
    rows.push({ label: sourceOption.type, value: sourceOption.label });
    appendEquipmentSourceDetailRows(rows, lookupAttr, sourceKey, sourceOption);
    appendRowIfMissing(rows, "Bezugswert", `${sourceValue}`);
  }
  rows.push({ label: ratingMultiplier === 2 ? "Stufe x2" : "Stufe", value: `${ratingValue}`, poolComponent: true });
  if (computation.monitorPoolMod !== 0) {
    rows.push({ label: "Pool-Basis", value: `${computation.poolBasis}` });
    rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
  }
  appendRollOnlyPoolModifierRow(rows, rollOnlyPoolModifier);
  popupState.rows.forEach((popupRow) => rows.push(popupRow));
  appendEdgeBoostRows(rows, edgeOptions, computation);

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${computation.pool}`,
    erfolge: erfolgeValue,
    details: buildDiceDetails(computation.diceResults, computation.fateDiceResults),
    detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults, 20, computation.diceTrace),
    computation: computation,
    isGlitch: computation.isGlitch,
    characterId: lookupAttr("character_id"),
    debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
  });

  saveEdgeLastRollContext(name, computation);
  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function buildRiggingVehicleRollDataFromLookup(lookupAttr) {
  return {
    reaktion: parseNumber(lookupAttr("sr6_attr_reaktion_gesamtwert")),
    geschicklichkeit: parseNumber(lookupAttr("sr6_attr_geschicklichkeit_gesamtwert")),
    intuition: parseNumber(lookupAttr("sr6_attr_intuition_gesamtwert")),
    logik: parseNumber(lookupAttr("sr6_attr_logik_gesamtwert")),
    steuern: parseNumber(lookupAttr("sr6_skill_steuern_gesamtwert")),
    mechanik: parseNumber(lookupAttr("sr6_skill_mechanik_gesamtwert")),
    mechanikSpezialisierung: lookupAttr("sr6_skill_mechanik_spezialisierung"),
    mechanikExpertise: lookupAttr("sr6_skill_mechanik_expertise"),
    heimlichkeit: parseNumber(lookupAttr("sr6_skill_heimlichkeit_gesamtwert")),
    wahrnehmung: parseNumber(lookupAttr("sr6_skill_wahrnehmung_gesamtwert")),
    handling: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_handling").total,
    beschleunigung: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_beschleunigung").total,
    intervall: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_intervall").total,
    geschwindigkeit: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_geschwindigkeit").total,
    rumpf: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_rumpf").total,
    panzerung: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_panzerung").total,
    pilot: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_pilot").total,
    sensor: resolveRiggingVehicleDetail(lookupAttr, "sr6_rigging_fahrzeug_sensor").total,
    agentenstufe: parseNumber(lookupAttr("sr6_rigging_fahrzeug_agentenstufe")),
    riggerkontrolle: parseNumber(lookupAttr("sr6_rigging_fahrzeug_riggerkontrolle")),
    manoevrieren: parseNumber(lookupAttr("sr6_rigging_fahrzeug_manoevrieren")),
    zielerfassung: parseNumber(lookupAttr("sr6_rigging_fahrzeug_zielerfassung")),
    ausweichen: parseNumber(lookupAttr("sr6_rigging_fahrzeug_ausweichen")),
    stealth: parseNumber(lookupAttr("sr6_rigging_fahrzeug_stealth")),
    clearsight: parseNumber(lookupAttr("sr6_rigging_fahrzeug_clearsight")),
  };
}

function buildRiggingVehicleWeaponRangeText(lookupAttr) {
  const rangeValues = [
    ["S. Nah", lookupAttr("sr6_rigging_fahrzeug_waffe_s_nah")],
    ["Nah", lookupAttr("sr6_rigging_fahrzeug_waffe_nah")],
    ["Mittel", lookupAttr("sr6_rigging_fahrzeug_waffe_mittel")],
    ["Weit", lookupAttr("sr6_rigging_fahrzeug_waffe_weit")],
    ["S. Weit", lookupAttr("sr6_rigging_fahrzeug_waffe_s_weit")],
  ];
  return rangeValues
    .map(([label, value]) => `${label}: ${parseNumber(value)}`)
    .join(" / ");
}

function runRiggingVehicleProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const probeKey = `${resolvedFields.Probe || lookupAttr("sr6_rigging_fahrzeug_probe") || "handling"}`.trim();
  const mode = lookupAttr("sr6_rigging_fahrzeug_modus") || resolvedFields.Modus || "Autonom";
  const data = buildRiggingVehicleRollDataFromLookup(lookupAttr);
  const probe = getRiggingVehicleProbeValue(probeKey, mode, data);
  const baseAttackValue = probeKey === "weapon_attack" && resolvedFields.Angriffswert
    ? resolvedFields.Angriffswert
    : `${getRiggingVehicleAttackValue(mode, data)}`;
  const fireMode = probeKey === "weapon_attack"
    ? getFireModeModifier(resolvedFields.Waffenmodus || lookupAttr("sr6_rigging_fahrzeug_waffe_modus"))
    : null;
  const attackValueModifier = (fireMode ? fireMode.attackValueMod : 0) + parseNumber(popupState.attackValueMod);
  const damageModifier = (fireMode ? fireMode.damageMod : 0) + parseNumber(popupState.damageMod);
  const finalAttackValue = fireMode
    ? Math.max(0, parseNumber(baseAttackValue) + attackValueModifier)
    : parseNumber(baseAttackValue);
  const baseDamage = lookupAttr("sr6_rigging_fahrzeug_waffe_schaden") || resolvedFields.Schadenswert || "";
  const finalDamage = fireMode && baseDamage !== ""
    ? `${Math.max(0, parseNumber(baseDamage) + damageModifier)}`
    : `${baseDamage}`;
  const effectivePopupState = applyUntrainedSkillPenaltyToPopupState(
    popupState,
    getUntrainedSkillPenalty(getRiggingVehicleUntrainedSkillKey(probeKey, mode), lookupAttr)
  );
  const edgeOptions = resolveEdgeBoostOptions(effectivePopupState, lookupAttr);
  const rollOnlyPoolModifier = getRollOnlyPoolModifier(context, lookupAttr);
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
    rollOnlyPoolModifier,
    1,
    probe.value,
    edgeOptions
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  rows.push({ label: "Probe", value: getRiggingVehicleProbeLabel(probeKey) });
  rows.push({ label: "Formel", value: probe.formula });
  appendRowsFormulaDetails(rows, lookupAttr);
  rows.push({ label: "Modus", value: mode });
  if (fireMode && attackValueModifier !== 0) {
    rows.push({ label: "Angriffswert-Basis", value: `${parseNumber(baseAttackValue)}` });
    if (fireMode.attackValueMod !== 0) {
      rows.push({ label: "Feuermodus-Angriffswert", value: formatSignedModifier(fireMode.attackValueMod) });
    }
    if (popupState.attackValueMod !== 0) {
      rows.push({ label: "Angriffswert-Modifikator", value: formatSignedModifier(popupState.attackValueMod) });
    }
  }
  rows.push({ label: "Angriffswert", value: `${finalAttackValue}` });
  rows.push({ label: "Verteidigungswert", value: `${getRiggingVehicleDefenseValue(mode, data)}` });
  rows.push({ label: "Zustandsmonitor", value: `${getRiggingVehicleMonitorValue(data)}` });
  if (probeKey === "weapon_attack") {
    rows.push({ label: "Installierte Waffe", value: lookupAttr("sr6_rigging_fahrzeug_waffe_name") || "-" });
    rows.push({ label: "Waffentyp", value: lookupAttr("sr6_rigging_fahrzeug_waffe") || "-" });
    rows.push({ label: "Feuermodus", value: fireMode ? fireMode.label : "-" });
    rows.push({ label: "Feuermodus-Schuss", value: fireMode ? `${fireMode.shots}` : "-" });
    if (fireMode && damageModifier !== 0) {
      rows.push({ label: "Schaden-Basis", value: `${parseNumber(baseDamage)}` });
      if (fireMode.damageMod !== 0) {
        rows.push({ label: "Feuermodus-Schaden", value: formatSignedModifier(fireMode.damageMod) });
      }
      if (popupState.damageMod !== 0) {
        rows.push({ label: "Schadens-Modifikator", value: formatSignedModifier(popupState.damageMod) });
      }
    }
    rows.push({ label: "Schaden", value: finalDamage || "-" });
    if (fireMode && fireMode.note) {
      rows.push({ label: "Feuermodus-Hinweis", value: fireMode.note });
    }
    rows.push({ label: "Angriffswerte (Reichweite)", value: buildRiggingVehicleWeaponRangeText(lookupAttr) });
  }
  if (normalizeRiggingVehicleMode(mode) === "jumped_in_vr") {
    rows.push({ label: "Riggerkontrolle", value: `${data.riggerkontrolle}` });
  }
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    rows.push({ label: "Agentenstufe", value: `${data.agentenstufe}` });
  }
  appendRollOnlyPoolModifierRow(rows, rollOnlyPoolModifier);
  effectivePopupState.rows.forEach((popupRow) => rows.push(popupRow));
  appendEdgeBoostRows(rows, edgeOptions, computation);

  const chatMessage = buildSr6ProbeMessage({
    name: "Rigging-Fahrzeugprobe",
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${computation.pool}`,
    erfolge: erfolgeValue,
    details: buildDiceDetails(computation.diceResults, computation.fateDiceResults),
    detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults, 20, computation.diceTrace),
    computation: computation,
    isGlitch: computation.isGlitch,
    characterId: lookupAttr("character_id"),
    debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
  });
  saveEdgeLastRollContext("Rigging-Fahrzeugprobe", computation);
  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function runSpellProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const effectivePopupState = applyUntrainedSkillPenaltyToPopupState(
    popupState,
    getUntrainedSkillPenalty(getMagicUntrainedSkillKey(context.definition), lookupAttr)
  );
  const edgeOptions = resolveEdgeBoostOptions(effectivePopupState, lookupAttr);
  const rollOnlyPoolModifier = getRollOnlyPoolModifier(context, lookupAttr);
  const spellComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
    rollOnlyPoolModifier,
    1,
    null,
    edgeOptions
  );
  const baseAttackValue = parseNumber(resolvedFields.Angriffswert);
  const finalAttackValue = isCombatSpell(resolvedFields)
    ? Math.max(0, baseAttackValue + effectivePopupState.attackValueMod)
    : "";

  appendBasePoolDetailRows(rows, context.definition, lookupAttr, context.poolAttribute, null, resolvedFields);
  appendDrainResistanceDetailRows(rows, lookupAttr);
  appendSpellDrainDetailRows(rows, resolvedFields, effectivePopupState);
  if (isCombatSpell(resolvedFields)) {
    appendSpellAttackValueDetailRows(rows, lookupAttr, resolvedFields, effectivePopupState, finalAttackValue);
    appendSpellDamageDetailRows(rows, lookupAttr, resolvedFields, effectivePopupState, spellComputation.successCount);
  }
  effectivePopupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
  appendRollOnlyPoolModifierRow(rows, rollOnlyPoolModifier);
  appendEdgeBoostRows(rows, edgeOptions, spellComputation);

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${spellComputation.pool}`,
    erfolge: `${spellComputation.successCount}`,
    details: buildDiceDetails(spellComputation.diceResults, spellComputation.fateDiceResults),
    detailsDice: buildDetailsDice(spellComputation.diceResults, spellComputation.fateDiceResults, 20, spellComputation.diceTrace),
    computation: spellComputation,
    isGlitch: spellComputation.isGlitch,
    characterId: lookupAttr("character_id"),
    debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
  });

  saveEdgeLastRollContext(name, spellComputation);
  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function runSummoningProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const spiritType = resolveSummoningSpiritType(resolvedFields, popupState);
  const spiritForce = resolveSummoningSpiritForce(resolvedFields, popupState);
  const effectivePopupState = applyUntrainedSkillPenaltyToPopupState(
    popupState,
    getUntrainedSkillPenalty(getMagicUntrainedSkillKey(context.definition), lookupAttr)
  );
  const edgeOptions = resolveEdgeBoostOptions(effectivePopupState, lookupAttr);
  const rollOnlyPoolModifier = getRollOnlyPoolModifier(context, lookupAttr);
  const summonerComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
    rollOnlyPoolModifier,
    1,
    null,
    edgeOptions
  );
  const spiritComputation = buildFixedPoolComputation(spiritForce * 2);
  const netHits = summonerComputation.successCount - spiritComputation.successCount;
  const services = Math.max(0, netHits);
  const modifiedDrain = Math.max(0, spiritComputation.successCount + effectivePopupState.drainMod);
  const drainComputation = buildProbeComputation(
    lookupAttr,
    "sr6_magic_entzug_widerstand",
    0
  );
  const drainDamage = Math.max(0, modifiedDrain - drainComputation.successCount);
  const drainDamageType = resolveDrainDamageType(drainDamage, lookupAttr("sr6_magic_magie"));
  const objectResistancePool = parseNumber((effectivePopupState.selectedValues || {}).object_resistance);
  const objectResistanceComputation = isSummoningPossessionCheckEnabled(effectivePopupState)
    ? buildFixedPoolComputation(objectResistancePool)
    : null;
  const objectResistanceNetHits = objectResistanceComputation
    ? Math.max(0, spiritComputation.successCount - objectResistanceComputation.successCount)
    : null;

  appendBasePoolDetailRows(rows, context.definition, lookupAttr, context.poolAttribute, null, resolvedFields);
  appendDrainResistanceDetailRows(rows, lookupAttr);
  appendRowIfMissing(rows, "Geistertyp", spiritType);
  appendRowIfMissing(rows, "Kraftstufe", `${spiritForce}`);
  effectivePopupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
  appendRollOnlyPoolModifierRow(rows, rollOnlyPoolModifier);
  appendEdgeBoostRows(rows, edgeOptions, summonerComputation);
  rows.push({ label: "Beschwören-Pool", value: `${summonerComputation.pool}` });
  rows.push({ label: "Beschwören-Erfolge", value: `${summonerComputation.successCount}` });
  rows.push({ label: "Geist-Pool", value: `${spiritComputation.pool}` });
  rows.push({ label: "Geist-Erfolge", value: `${spiritComputation.successCount}` });
  if (objectResistanceNetHits !== null) {
    rows.push({ label: "Objektwiderstand-Pool", value: `${objectResistancePool}` });
    rows.push({ label: "Objektwiderstand-Erfolge", value: `${objectResistanceComputation.successCount}` });
    rows.push({ label: "Objektwiderstand-Nettoerfolge", value: `${objectResistanceNetHits}` });
    rows.push({ label: "Objektwiderstand-Details", value: buildDiceDetails(objectResistanceComputation.diceResults) });
  }
  rows.push({ label: "Nettoerfolge", value: `${netHits}` });
  rows.push({
    label: "Erhaltene Dienste",
    value: services > 0 ? `${services}` : "0 (nicht herbeigerufen)",
  });
  rows.push({ label: "Entstandener Entzug", value: `${modifiedDrain}` });
  rows.push({
    label: "Entzugsschaden",
    value: drainDamageType ? `${drainDamage} (${drainDamageType})` : `${drainDamage}`,
  });
  rows.push({ label: "Geist-Details", value: buildDiceDetails(spiritComputation.diceResults) });
  rows.push({ label: "Entzug-Details", value: buildDiceDetails(drainComputation.diceResults) });

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${summonerComputation.pool}`,
    erfolge: `${summonerComputation.successCount}`,
    details: buildDiceDetails(summonerComputation.diceResults, summonerComputation.fateDiceResults),
    detailsDice: buildDetailsDice(summonerComputation.diceResults, summonerComputation.fateDiceResults, 20, summonerComputation.diceTrace),
    computation: summonerComputation,
    isGlitch: summonerComputation.isGlitch,
    characterId: lookupAttr("character_id"),
    debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
  });

  saveEdgeLastRollContext(name, summonerComputation);
  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState = 0) {
  if (!rawTemplate) return;

  const context = buildRequestedAttributes(rawTemplate, repeatingRowPrefix);
  const normalizedPopupState = normalizePopupState(popupState);

  getAttrs(context.requestedAttributes, (values) => {
    const lookupAttr = buildAttrLookup(values, repeatingRowPrefix);
    const resolvedFields = buildResolvedFields(context.fields, lookupAttr);
    getRollContextFields(context.definition).forEach((field) => {
      if (!field || !field.label || !field.attr) return;
      if (resolvedFields[field.label]) return;
      resolvedFields[field.label] = lookupAttr(field.attr);
    });

    if (context.definition && context.definition.probeModel === "initiative_probe") {
      runInitiativeProbeFromContext(context, lookupAttr, resolvedFields);
      return;
    }
    if (context.definition && context.definition.probeModel === "spell_probe") {
      runSpellProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }
    if (context.definition && context.definition.probeModel === "summoning_probe") {
      runSummoningProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }
    if (context.definition && context.definition.probeModel === "equipment_probe") {
      runEquipmentProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }
    if (context.definition && context.definition.probeModel === "rigging_vehicle_probe") {
      runRiggingVehicleProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }

    let effectivePopupState = applyTemplateSkillBonusToPopupState(normalizedPopupState, resolvedFields);

    const rows = buildProbeRows(resolvedFields, context.definition);
    const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);

    if (!context.poolAttribute) {
      const chatMessage = buildSr6ProbeMessage({
        name: name,
        rows: rows,
        resolvedFields: resolvedFields,
        definition: context.definition,
        definitionId: context.definition && context.definition.id,
        pool: resolvedFields.Pool || "",
        erfolge: resolvedFields.Erfolge || "",
        details: resolvedFields.Details || "",
        isGlitch: false,
        characterId: lookupAttr("character_id"),
        debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
      });
      startRoll(chatMessage, (rollResult) => {
        finishRoll(rollResult.rollId);
      });
      return;
    }

    const poolMultiplier = Math.max(
      getRollPoolMultiplier(context.definition, resolvedFields),
      effectivePopupState.poolMultiplier
    );
    const meleeAttributeOverride = resolveMeleePopupAttributePoolOverride(
      context.definition,
      resolvedFields,
      effectivePopupState,
      lookupAttr,
      context.poolAttribute
    );
    const skillAttributeOverride = resolveSkillProbeAttributePoolOverride(
      context.definition,
      effectivePopupState,
      lookupAttr,
      context.poolAttribute
    );
    const matrixActionContext = resolveMatrixActionRuleContext(
      context.definition,
      effectivePopupState,
      lookupAttr,
      context.poolAttribute
    );
    effectivePopupState = applyUntrainedSkillPenaltyToPopupState(
      effectivePopupState,
      getRollUntrainedSkillPenalty(context.definition, resolvedFields, lookupAttr, matrixActionContext),
      { applyPoolModifier: !isComputedCombatPoolDefinition(context.definition) }
    );
    const poolBasisOverride = meleeAttributeOverride
      ? meleeAttributeOverride.poolBasisOverride
      : skillAttributeOverride
        ? skillAttributeOverride.poolBasisOverride
        : matrixActionContext && matrixActionContext.poolBasisOverride !== null
          ? matrixActionContext.poolBasisOverride
          : null;
    const edgeOptions = resolveEdgeBoostOptions(effectivePopupState, lookupAttr);
    const rollOnlyPoolModifier = getRollOnlyPoolModifier(context, lookupAttr);
    const computation = buildProbeComputation(
      lookupAttr,
      context.poolAttribute,
      effectivePopupState.poolMod,
      rollOnlyPoolModifier,
      poolMultiplier,
      poolBasisOverride,
      edgeOptions
    );

    if (meleeAttributeOverride) {
      rows.push({
        label: "Attribut-Fallback",
        value: `${meleeAttributeOverride.currentAttribute} -> ${meleeAttributeOverride.selectedAttribute}`,
      });
      appendRowIfMissing(rows, "Attribut", meleeAttributeOverride.selectedAttribute);
      appendAttributeDetailRows(rows, lookupAttr, getAttributeDetailKey(meleeAttributeOverride.selectedAttribute), "Attributwert");
    }
    appendBasePoolDetailRows(rows, context.definition, lookupAttr, context.poolAttribute, skillAttributeOverride, resolvedFields);
    appendCombatDefenseValueDetailRows(rows, context.definition, lookupAttr);
    appendMatrixLikeDefenseValueDetailRows(rows, context.definition, lookupAttr);
    appendMatrixActionRows(rows, matrixActionContext, lookupAttr);
    if (!matrixActionContext) {
      appendRowsFormulaDetails(rows, lookupAttr);
    }
    const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

    if (computation.poolMultiplier !== 1) {
      rows.push({ label: "Pool-Basis vor Multiplikator", value: `${computation.poolPreMultiplier}` });
      rows.push({ label: "Multiplikator", value: `x${computation.poolMultiplier}` });
    }
    if (computation.monitorPoolMod !== 0) {
      rows.push({
        label: computation.poolMultiplier !== 1 ? "Pool nach Multiplikator" : "Pool-Basis",
        value: `${computation.poolBasis}`,
      });
      rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
    }
    appendRollOnlyPoolModifierRow(rows, rollOnlyPoolModifier);
    effectivePopupState.rows.forEach((popupRow) => rows.push(popupRow));
    buildPopupDerivedResultRows(context.definition, lookupAttr, context.poolAttribute, resolvedFields, effectivePopupState, computation)
      .forEach((popupRow) => rows.push(popupRow));
    appendEdgeBoostRows(rows, edgeOptions, computation);

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      resolvedFields: resolvedFields,
      definition: context.definition,
      definitionId: context.definition && context.definition.id,
      poolAttribute: context.poolAttribute,
      pool: `${computation.pool}`,
      erfolge: erfolgeValue,
      details: buildDiceDetails(computation.diceResults, computation.fateDiceResults),
      detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults, 20, computation.diceTrace),
      computation: computation,
      isGlitch: computation.isGlitch,
      characterId: lookupAttr("character_id"),
      debugDetailsEnabled: isRolltemplateDebugEnabled(lookupAttr),
    });
    saveEdgeLastRollContext(name, computation);
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}
// END MODULE: workers/rolls/probe
