// BEGIN MODULE: workers/rolls/definitions/builders.js
// Factory-Funktionen fuer Roll-Definitionen und Popup-Felder. Domain-Dateien nutzen diese Builder, damit gleiche Probenmodelle gleich aufgebaut bleiben.
function createPopupField(config) {
  return {
    affects: "display",
    includeInTemplate: true,
    defaultValue: "",
    ...config,
  };
}

function createEdgeBoostPopupField() {
  return {
    id: "edge_boost",
    slot: SR6_EDGE_BOOST_POPUP_SLOT,
    label: "Edge-Boost",
    type: "select",
    optionSet: "edge_boost",
    affects: "display",
    includeInTemplate: false,
    defaultValue: "none",
  };
}

function createFateDicePopupField() {
  return {
    id: "fate_dice",
    slot: SR6_FATE_DICE_POPUP_SLOT,
    label: "Schicksalswürfel",
    type: "number",
    affects: "display",
    includeInTemplate: false,
    defaultValue: "0",
  };
}

function createMatrixLonerPopupField() {
  return {
    id: "matrix_loner",
    slot: SR6_MATRIX_LONER_POPUP_SLOT,
    label: "Einzelgänger",
    type: "checkbox",
    affects: "display",
    checkedDisplayValue: "Ja",
    includeInTemplate: false,
    defaultValue: "0",
  };
}

function addSharedPopupFields(popupFields, definition) {
  const fields = Array.isArray(popupFields) ? popupFields : [];
  const sharedFields = [
    ...fields.filter((field) => !(field && field.id === "edge_boost")),
    createFateDicePopupField(),
    createEdgeBoostPopupField(),
  ];

  if (definition && definition.id === "matrix_action") {
    return [
      ...sharedFields.filter((field) => !(field && field.id === "matrix_loner")),
      createMatrixLonerPopupField(),
    ];
  }

  return sharedFields;
}

function createSpecializationPopupFields(startSlot = 2) {
  return [
    {
      id: "specialization",
      slot: startSlot,
      label: "Spezialisierung",
      type: "checkbox",
      affects: "pool",
      checkedValue: 2,
      checkedDisplayValue: "+2",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "expertise",
      slot: startSlot + 1,
      label: "Expertise",
      type: "checkbox",
      affects: "pool",
      checkedValue: 3,
      checkedDisplayValue: "+3",
      includeInTemplate: true,
      defaultValue: "0",
    },
  ];
}

function createAttributeProbePopupFields() {
  return [
    {
      id: "attribute_mod",
      slot: 1,
      label: "Popup-Modifikator",
      type: "number",
      affects: "pool",
      defaultValue: "0",
      includeInTemplate: true,
    },
    {
      id: "attribute_x2",
      slot: 2,
      label: "Attribut x2",
      type: "checkbox",
      affects: "pool_multiplier",
      checkedValue: 2,
      checkedDisplayValue: "x2",
      defaultValue: "0",
      includeInTemplate: true,
    },
  ];
}

function createAttributeProbeDefinition(config = {}) {
  return {
    probeModel: "attribute_probe",
    matchField: config.matchField || "Attribut",
    matchPoolPrefix: config.matchPoolPrefix || "",
    titleMode: config.titleMode || "field-short",
    titleField: config.titleField || "Attribut",
    primaryFields: config.primaryFields || ["Attribut"],
    extraFields: config.extraFields || [],
    popupFields: config.popupFields || SR6_ATTRIBUTE_PROBE_POPUP_FIELDS,
    poolMultiplier: parseNumber(config.poolMultiplier) || 1,
    poolMultiplierField: config.poolMultiplierField || "",
    poolMultiplierFieldValue: config.poolMultiplierFieldValue || "1",
    internalFields: config.internalFields || [],
    titleFallback: config.titleFallback || "Probe",
  };
}

function createSkillProbePopupFields() {
  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    ...createSpecializationPopupFields(2),
  ];
}

function createMappedSkillProbePopupFields(attributeConfig) {
  if (!attributeConfig || !attributeConfig.optionSet) {
    return createSkillProbePopupFields();
  }

  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    {
      id: "skill_attribute",
      slot: 2,
      label: "Attribut",
      type: "select",
      optionSet: attributeConfig.optionSet,
      affects: "display",
      includeInTemplate: false,
      defaultValue: attributeConfig.defaultValue || "",
    },
    ...createSpecializationPopupFields(3),
  ];
}

function createSkillProbeDefinition(config = {}) {
  const attributeConfig = config.skillAttributeConfig || null;
  return {
    probeModel: "skill_probe",
    matchField: config.matchField || "Fertigkeit",
    matchPoolPrefix: config.matchPoolPrefix || "",
    titleMode: config.titleMode || "pool-prefix",
    titleField: config.titleField || "",
    primaryFields: config.primaryFields || ["Fertigkeit"],
    extraFields: config.extraFields || [],
    popupFields: config.popupFields || createMappedSkillProbePopupFields(attributeConfig),
    skillKey: config.skillKey || "",
    skillAttributeConfig: attributeConfig,
    internalFields: config.internalFields || ["Spezialisierung Aktiv", "Expertise Aktiv"],
    fixedTitle: config.fixedTitle || "",
    titleFallback: config.titleFallback || "Fertigkeiten",
  };
}

function createEquipmentPopupFields() {
  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    {
      id: "equipment_rating_x2",
      slot: 2,
      label: "Stufe x2",
      type: "checkbox",
      affects: "display",
      checkedValue: 1,
      checkedDisplayValue: "x2",
      defaultValue: "0",
      includeInTemplate: false,
    },
  ];
}

function createAttackValueSourceByRange(prefix) {
  return {
    "S. Nah": `${prefix}_s_nah`,
    "Nah": `${prefix}_nah`,
    "Mittel": `${prefix}_mittel`,
    "Weit": `${prefix}_weit`,
    "S. Weit": `${prefix}_s_weit`,
  };
}

function createCombatTabPopupFields() {
  return [
    {
      id: "skill_mod",
      slot: 1,
      label: "Skill-Modifikator",
      type: "number",
      affects: "pool",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "attack_value_mod",
      slot: 2,
      label: "Angriffswert-Modifikator",
      type: "number",
      affects: "attack_value",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "damage_mod",
      slot: 3,
      label: "Schadens-Modifikator",
      type: "number",
      affects: "damage",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "ammo_context",
      slot: 4,
      label: "Munition",
      type: "select",
      optionSet: "ammo",
      sourceAttr: "sr6_combat_munition",
      affects: ["attack_value", "damage"],
      includeInTemplate: true,
      defaultValue: "Standard",
    },
    ...createSpecializationPopupFields(5),
  ];
}

const SR6_COMBAT_TAB_POPUP_FIELDS = createCombatTabPopupFields();

function createCombatMeleePopupFields(attributeSourceAttr) {
  return [
    {
      id: "skill_mod",
      slot: 1,
      label: "Skill-Modifikator",
      type: "number",
      affects: "pool",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "attribute_context",
      slot: 2,
      label: "Attribut",
      type: "select",
      optionSet: "melee_attribute",
      sourceAttr: attributeSourceAttr,
      affects: "display",
      includeInTemplate: true,
      defaultValue: "Geschicklichkeit",
    },
    {
      id: "attack_value_mod",
      slot: 3,
      label: "Angriffswert-Modifikator",
      type: "number",
      affects: "attack_value",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "damage_mod",
      slot: 4,
      label: "Schadens-Modifikator",
      type: "number",
      affects: "damage",
      includeInTemplate: true,
      defaultValue: "0",
    },
    ...createSpecializationPopupFields(5),
  ];
}

function createSpellPopupFields() {
  return [
    {
      id: "skill_mod",
      slot: 1,
      label: "Skill-Modifikator",
      type: "number",
      affects: "pool",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "attack_value_mod",
      slot: 2,
      label: "Angriffswert-Modifikator",
      type: "number",
      affects: "attack_value",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "damage_mod",
      slot: 3,
      label: "Schadens-Modifikator",
      type: "number",
      affects: "damage",
      includeInTemplate: true,
      defaultValue: "0",
      visibleWhenField: "Art",
      visibleWhenValue: "Kampf",
      visibleWhenFieldMissing: true,
    },
    {
      id: "area_increase",
      slot: 4,
      label: "Fläche Vergrößern",
      type: "number",
      affects: "drain",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "overcast",
      slot: 5,
      label: "Hochdrehen",
      type: "number",
      affects: ["damage", "drain"],
      affectMultipliers: {
        damage: 1,
        drain: 2,
      },
      includeInTemplate: true,
      defaultValue: "0",
      visibleWhenField: "Art",
      visibleWhenValue: "Kampf",
      visibleWhenFieldMissing: true,
    },
    ...createSpecializationPopupFields(6),
    {
      id: "drain_mod",
      slot: 8,
      label: "Entzug-Modifikator",
      type: "number",
      affects: "drain",
      includeInTemplate: true,
      defaultValue: "0",
    },
  ];
}

function createSummoningPopupFields() {
  return [
    {
      id: "spirit_type",
      slot: 1,
      label: "Geistertyp",
      type: "select",
      optionSet: "spirit_type",
      affects: "display",
      includeInTemplate: true,
      defaultValue: "Luftgeister",
    },
    {
      id: "spirit_force",
      slot: 2,
      label: "Kraftstufe",
      type: "number",
      affects: "display",
      includeInTemplate: true,
      defaultValue: "0",
      sourceField: "Stufe",
    },
    {
      id: "pool_mod",
      slot: 3,
      label: "Beschwören-Modifikator",
      type: "number",
      affects: "pool",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "drain_mod",
      slot: 4,
      label: "Entzug-Modifikator",
      type: "number",
      affects: "drain",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "possession",
      slot: 5,
      label: "Besessenheit",
      type: "checkbox",
      affects: "display",
      checkedDisplayValue: "Ja",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "object_resistance",
      slot: 6,
      label: "Objektwiderstand",
      type: "number",
      affects: "display",
      includeInTemplate: true,
      defaultValue: "0",
      requiresCheckedSlot: 5,
    },
  ];
}

function getMagicRollAdditionalAttributes(definition) {
  if (!definition) return [];
  if (definition.id === "spell" || definition.id === "summoning") {
    return ["sr6_magic_magie", "sr6_magic_entzug_widerstand"];
  }
  return [];
}

function createDefenseProbePopupFields(config) {
  const primaryContextLabel = config.primaryContextLabel || config.primaryLabel || "Wert";
  const primaryContextSource = config.primaryContextSource || "pool";
  const comparisonContextLabel = config.comparisonContextLabel || "Verteidigungswert";
  const comparisonContextSourceAttr = config.comparisonContextSourceAttr || "sr6_combat_verteidigungswert_gesamtwert";
  const edgeContextSourceAttr = config.edgeContextSourceAttr || "sr6_edge_aktuell";

  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    createPopupField({
      id: "primary_context",
      slot: 2,
      label: primaryContextLabel,
      type: "number",
      source: primaryContextSource,
      defaultValue: "0",
    }),
    createPopupField({
      id: "comparison_context",
      slot: 3,
      label: comparisonContextLabel,
      type: "number",
      sourceAttr: comparisonContextSourceAttr,
      defaultValue: "0",
    }),
    createPopupField({
      id: "edge_context",
      slot: 4,
      label: "Edge",
      type: "number",
      sourceAttr: edgeContextSourceAttr,
      defaultValue: "0",
    }),
  ];
}

const SR6_ATTRIBUTE_PROBE_POPUP_FIELDS = createAttributeProbePopupFields();
const SR6_SKILL_PROBE_POPUP_FIELDS = createSkillProbePopupFields();

function createDefenseProbeDefinition(config) {
  return {
    probeModel: "defense_probe",
    matchField: config.matchField === undefined ? "Wert" : config.matchField,
    matchPoolPrefix: config.matchPoolPrefix,
    titleMode: config.titleMode || "pool-prefix",
    titleField: config.titleField || "",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: createDefenseProbePopupFields({
      primaryContextLabel: config.primaryContextLabel,
      primaryContextSource: config.primaryContextSource,
      comparisonContextLabel: config.comparisonContextLabel,
      comparisonContextSourceAttr: config.comparisonContextSourceAttr,
      edgeContextSourceAttr: config.edgeContextSourceAttr,
    }),
    fixedTitle: config.fixedTitle || "",
    titleFallback: config.titleFallback || "Probe",
  };
}

function createValueProbeDefinition(config = {}) {
  return {
    probeModel: "value_probe",
    matchField: config.matchField === undefined ? "Wert" : config.matchField,
    matchFieldValue: config.matchFieldValue || "",
    matchPoolPrefix: config.matchPoolPrefix || "",
    titleMode: config.titleMode || "pool-prefix",
    titleField: config.titleField || "",
    primaryFields: config.primaryFields || ["Wert"],
    extraFields: config.extraFields || [],
    popupFields: config.popupFields || SR6_DEFAULT_POPUP_FIELDS,
    fixedTitle: config.fixedTitle || "",
    titleFallback: config.titleFallback || "Probe",
  };
}

function createInitiativeProbeDefinition(config = {}) {
  return {
    probeModel: "initiative_probe",
    matchField: config.matchField || "Basis",
    matchPoolPrefix: config.matchPoolPrefix || "",
    titleMode: config.titleMode || "explicit-name",
    titleField: config.titleField || "",
    primaryFields: config.primaryFields || ["Basis"],
    extraFields: config.extraFields || ["W6", "Gesamt"],
    popupFields: config.popupFields || SR6_DEFAULT_POPUP_FIELDS,
    fixedTitle: config.fixedTitle || "",
    titleFallback: config.titleFallback || "Initiative",
  };
}
// END MODULE: workers/rolls/definitions/builders.js
