// BEGIN MODULE: workers/rolls/definitions
const SR6_ROLL_TITLE_PREFIXES = [
  { prefix: "sr6_combat_", title: "Kampf" },
  { prefix: "sr6_fernkampf_", title: "Fernkampfwaffen" },
  { prefix: "sr6_nahkampf_", title: "Nahkampfwaffen" },
  { prefix: "sr6_matrix_handlung_", title: "Matrix-Handlungen" },
  { prefix: "sr6_matrix_", title: "Matrix: Kernwerte" },
  { prefix: "sr6_rigging_manoever_", title: "Manöver" },
  { prefix: "sr6_rigging_", title: "Rigging: Kernwerte" },
  { prefix: "sr6_magic_", title: "Magie: Kernwerte" },
  { prefix: "sr6_zauber_", title: "Zauber" },
  { prefix: "sr6_ritual_", title: "Rituale" },
  { prefix: "sr6_verteidigung_", title: "Verteidigung" },
  { prefix: "sr6_schadenswiderstand_", title: "Schadenswiderstand" },
  { prefix: "sr6_skill_", title: "Fertigkeiten" },
  { prefix: "sr6_wissensfertigkeit_", title: "Wissensfertigkeiten" },
  { prefix: "sr6_sprachfertigkeit_", title: "Sprachfertigkeiten" },
  { prefix: "sr6_talentsoft_", title: "Talentsofts" },
  { prefix: "sr6_wissenssprachsoft_", title: "Wissens-/Sprachsofts" },
];

const SR6_DEFAULT_ROLL_ROW_ORDER = [
  "Attribut",
  "Fertigkeit",
  "Wert",
  "Waffe",
  "Schadenswert",
  "Handlung",
  "Reichweite",
  "Munition",
  "Modus",
  "Basis",
  "Gesamt",
];

const SR6_POPUP_FIELD_SLOT_COUNT = 7;

const SR6_POPUP_SELECT_OPTION_SETS = {
  visibility: [
    { value: "clear", label: "Klare Sicht", poolMod: 0, rowValue: "Klare Sicht" },
    { value: "partial", label: "Leicht verdeckt", poolMod: -1, rowValue: "Leicht verdeckt" },
    { value: "heavy", label: "Stark verdeckt", poolMod: -2, rowValue: "Stark verdeckt" },
    { value: "blind", label: "Blindes Feuer", poolMod: -3, rowValue: "Blindes Feuer" },
  ],
  movement: [
    { value: "steady", label: "Ruhiges Ziel", poolMod: 0, rowValue: "Ruhiges Ziel" },
    { value: "walking", label: "Leichte Bewegung", poolMod: -1, rowValue: "Leichte Bewegung" },
    { value: "running", label: "Schnelle Bewegung", poolMod: -2, rowValue: "Schnelle Bewegung" },
  ],
  spell_range: [
    { value: "Selbst", label: "Selbst", rowValue: "Selbst" },
    { value: "Beruehrung", label: "Berührung", rowValue: "Berührung" },
    { value: "Sicht", label: "Sicht", rowValue: "Sicht" },
    { value: "Spezial", label: "Spezial", rowValue: "Spezial" },
  ],
  matrix_access: [
    { value: "Benutzer", label: "Benutzer", rowValue: "Benutzer" },
    { value: "Admin", label: "Admin", rowValue: "Admin" },
    { value: "Root", label: "Root", rowValue: "Root" },
  ],
  ammo: [
    { value: "Standard", label: "Standard", rowValue: "Standard" },
    { value: "Huelsenlos", label: "Hülsenlos", rowValue: "Hülsenlos" },
    {
      value: "APDS",
      label: "APDS",
      rowValue: "APDS",
      attackValueMod: 2,
      damageMod: -1,
      extraRows: [
        { label: "Munitionshinweis", value: "Panzerbrechende Spezialmunition mit hoher Durchschlagskraft." },
      ],
    },
    {
      value: "Explosiv",
      label: "Explosiv",
      rowValue: "Explosiv",
      damageMod: 1,
      extraRows: [
        { label: "Munitionshinweis", value: "Bei kritischem Patzer erleidet der Schütze den Waffenschaden inkl. Explosiv-Mod und die Waffe wird zerstört." },
      ],
    },
    {
      value: "Flechette",
      label: "Flechette",
      rowValue: "Flechette",
      attackValueMod: 1,
      damageMod: -1,
      extraRows: [
        { label: "Munitionshinweis", value: "Streuladung aus Metallsplittern oder Metallkügelchen." },
      ],
    },
    {
      value: "Gel",
      label: "Gel",
      rowValue: "Gel",
      extraRows: [
        { label: "Schadenstyp", value: "Betäubung" },
        { label: "Munitionshinweis", value: "Bei Treffer sofort Geschicklichkeit (2) oder Konstitution (4), sonst Status Liegend." },
        { label: "Munitionshinweis", value: "Salvenfeuer und Vollautomatik erhöhen den Schwellenwert dieser Probe um 1." },
      ],
    },
    {
      value: "Injektionspfeil",
      label: "Injektionspfeil",
      rowValue: "Injektionspfeil",
      extraRows: [
        { label: "Schaden", value: "Speziell" },
        { label: "Munitionshinweis", value: "Benötigt 1 Nettoerfolg gegen ungepanzerte oder 2 gegen gepanzerte Ziele, um die Ladung zu verabreichen." },
      ],
    },
    {
      value: "Schocker",
      label: "Schocker",
      rowValue: "Schocker",
      attackValueMod: 1,
      damageMod: -1,
      extraRows: [
        { label: "Schadenstyp", value: "Betäubung (elektrisch)" },
        { label: "Munitionshinweis", value: "Ziel erhält für 2 Kampfrunden den Status Gebrutzelt." },
      ],
    },
    {
      value: "DMSO-Gelpack",
      label: "DMSO-Gelpack",
      rowValue: "DMSO-Gelpack",
      extraRows: [
        { label: "Schaden", value: "Speziell" },
        { label: "Munitionshinweis", value: "Trägt Wirkstoffe statt regulärem Schaden auf das Ziel auf." },
      ],
    },
  ],
};

const SR6_DEFAULT_POPUP_FIELDS = [
  {
    id: "pool_mod",
    slot: 1,
    label: "Popup-Modifikator",
    type: "number",
    affects: "pool",
    defaultValue: "0",
    includeInTemplate: true,
  },
];

function createPopupField(config) {
  return {
    affects: "display",
    includeInTemplate: true,
    defaultValue: "",
    ...config,
  };
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
      checkedValue: 1,
      checkedDisplayValue: "+1 (gesamt +3)",
      includeInTemplate: true,
      defaultValue: "0",
      requiresCheckedSlot: startSlot,
    },
  ];
}


function createCombatContextPopupFields(config) {
  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    createPopupField({
      id: "attack_context",
      slot: 2,
      label: config.attackLabel,
      type: "number",
      source: config.attackSource,
      sourceAttr: config.attackSourceAttr,
      defaultValue: "0",
    }),
    createPopupField({
      id: "damage_context",
      slot: 3,
      label: "Schaden",
      type: "text",
      source: config.damageSource,
      sourceAttr: config.damageSourceAttr,
      defaultValue: "",
    }),
    createPopupField({
      id: "attack_value_context",
      slot: 4,
      label: "Angriffswert",
      type: "number",
      source: config.attackValueSource || "pool",
      sourceAttr: config.attackValueSourceAttr,
      defaultValue: "0",
    }),
    createPopupField({
      id: "edge_context",
      slot: 5,
      label: "Edge",
      type: "number",
      sourceAttr: "sr6_edge_aktuell",
      defaultValue: "0",
    }),
  ];
}

function createRangedCombatPopupFields(config, options = {}) {
  const includeSpecialization = options.includeSpecialization !== false;
  const specializationFields = includeSpecialization ? createSpecializationPopupFields(2) : [];
  const ammoSlot = includeSpecialization ? 4 : 2;
  const attackValueSlot = includeSpecialization ? 5 : 3;
  const damageSlot = includeSpecialization ? 6 : 4;
  const edgeSlot = includeSpecialization ? 7 : 5;

  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    ...specializationFields,
    {
      id: "ammo_context",
      slot: ammoSlot,
      label: "Munition",
      type: "select",
      optionSet: "ammo",
      sourceAttr: config.ammoSourceAttr,
      affects: ["attack_value", "damage"],
      includeInTemplate: true,
      defaultValue: "Standard",
    },
    {
      id: "attack_value_mod",
      slot: attackValueSlot,
      label: "Angriffswert-Modifikator",
      type: "number",
      affects: "attack_value",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "damage_mod",
      slot: damageSlot,
      label: "Schadens-Modifikator",
      type: "number",
      affects: "damage",
      includeInTemplate: true,
      defaultValue: "0",
    },
    createPopupField({
      id: "edge_context",
      slot: edgeSlot,
      label: "Edge",
      type: "number",
      sourceAttr: "sr6_edge_aktuell",
      defaultValue: "0",
    }),
  ];
}

function createMeleeCombatPopupFields(options = {}) {
  const includeSpecialization = options.includeSpecialization !== false;
  const specializationFields = includeSpecialization ? createSpecializationPopupFields(2) : [];
  const attackValueSlot = includeSpecialization ? 4 : 2;
  const damageSlot = includeSpecialization ? 5 : 3;
  const edgeSlot = includeSpecialization ? 6 : 4;

  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    ...specializationFields,
    {
      id: "attack_value_mod",
      slot: attackValueSlot,
      label: "Angriffswert-Modifikator",
      type: "number",
      affects: "attack_value",
      includeInTemplate: true,
      defaultValue: "0",
    },
    {
      id: "damage_mod",
      slot: damageSlot,
      label: "Schadens-Modifikator",
      type: "number",
      affects: "damage",
      includeInTemplate: true,
      defaultValue: "0",
    },
    createPopupField({
      id: "edge_context",
      slot: edgeSlot,
      label: "Edge",
      type: "number",
      sourceAttr: "sr6_edge_aktuell",
      defaultValue: "0",
    }),
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

function createStandardRangedWeaponPopupFields(ammoSourceAttr) {
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
      sourceAttr: ammoSourceAttr,
      affects: ["attack_value", "damage"],
      includeInTemplate: true,
      defaultValue: "Standard",
    },
    ...createSpecializationPopupFields(5),
  ];
}

function createStandardMeleeWeaponPopupFields() {
  return createStandardRangedWeaponPopupFields("");
}

function createDefenseContextPopupFields(config) {
  return [
    SR6_DEFAULT_POPUP_FIELDS[0],
    createPopupField({
      id: "primary_context",
      slot: 2,
      label: config.primaryLabel,
      type: "number",
      source: "pool",
      defaultValue: "0",
    }),
    createPopupField({
      id: "defense_value_context",
      slot: 3,
      label: "Verteidigungswert",
      type: "number",
      sourceAttr: "sr6_combat_verteidigungswert_gesamtwert",
      defaultValue: "0",
    }),
    createPopupField({
      id: "edge_context",
      slot: 4,
      label: "Edge",
      type: "number",
      sourceAttr: "sr6_edge_aktuell",
      defaultValue: "0",
    }),
  ];
}

const SR6_ROLL_DEFINITIONS = [
  {
    id: "attribute",
    matchField: "Attribut",
    titleMode: "field-short",
    titleField: "Attribut",
    primaryFields: ["Attribut"],
    extraFields: [],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
  {
    id: "skill",
    matchField: "Fertigkeit",
    titleMode: "pool-prefix",
    primaryFields: ["Fertigkeit"],
    extraFields: [],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      ...createSpecializationPopupFields(2),
    ],
    titleFallback: "Fertigkeiten",
  },
  {
    id: "spell",
    matchField: "Zauber",
    titleMode: "pool-prefix",
    primaryFields: ["Zauber"],
    extraFields: ["Entzug"],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "spell_range",
        slot: 2,
        label: "Reichweite",
        type: "select",
        optionSet: "spell_range",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Sicht",
      },
      {
        id: "drain_mod",
        slot: 3,
        label: "Entzug-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Zauber",
  },
  {
    id: "matrix_action",
    matchField: "Handlung",
    matchPoolPrefix: "sr6_matrix_handlung_",
    titleMode: "pool-prefix",
    primaryFields: ["Handlung"],
    extraFields: [],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "matrix_access",
        slot: 2,
        label: "Zugriff",
        type: "select",
        optionSet: "matrix_access",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Benutzer",
      },
      {
        id: "matrix_overwatch",
        slot: 3,
        label: "Overwatch-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Matrix-Handlungen",
  },
  {
    id: "matrix_value",
    matchField: "Wert",
    matchPoolPrefix: "sr6_matrix_",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "matrix_access",
        slot: 2,
        label: "Zugriff",
        type: "select",
        optionSet: "matrix_access",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Benutzer",
      },
      {
        id: "matrix_overwatch",
        slot: 3,
        label: "Overwatch-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Matrix: Kernwerte",
  },
  {
    id: "combat_ranged_core_attack",
    matchField: "Wert",
    matchPoolPrefix: "sr6_combat_fernkampfangriff",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: createStandardRangedWeaponPopupFields("sr6_combat_munition"),
    popupDerivedResults: [
      { kind: "attack_value", label: "Angriffswert", source: "pool" },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_fernkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "combat_melee_core_attack",
    matchField: "Wert",
    matchPoolPrefix: "sr6_combat_nahkampfangriff",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: createMeleeCombatPopupFields({
      includeSpecialization: false,
    }),
    popupDerivedResults: [
      { kind: "attack_value", label: "Angriffswert", source: "pool" },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_nahkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "physical_defense",
    matchField: "Wert",
    matchPoolPrefix: "sr6_verteidigung_physisch_",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: createDefenseContextPopupFields({
      primaryLabel: "Verteidigung (Physisch)",
    }),
    titleFallback: "Verteidigung",
  },
  {
    id: "physical_damage_resistance",
    matchField: "Wert",
    matchPoolPrefix: "sr6_schadenswiderstand_physisch_",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: createDefenseContextPopupFields({
      primaryLabel: "Schadenswiderstand (Physisch)",
    }),
    titleFallback: "Schadenswiderstand",
  },
  {
    id: "value",
    matchField: "Wert",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
  {
    id: "combat_ranged_weapon",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_combat_fernkampf_",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Schadenswert", "Munition", "Reichweite", "Modus"],
    popupFields: createStandardRangedWeaponPopupFields("sr6_combat_munition"),
    popupDerivedResults: [
      {
        kind: "attack_value",
        label: "Angriffswert",
        sourceByRange: createAttackValueSourceByRange("sr6_combat_fernkampf"),
      },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_fernkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "combat_melee_weapon",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_combat_nahkampf_",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Schadenswert", "Reichweite"],
    popupFields: createStandardMeleeWeaponPopupFields(),
    popupDerivedResults: [
      {
        kind: "attack_value",
        label: "Angriffswert",
        sourceByRange: createAttackValueSourceByRange("sr6_combat_nahkampf"),
      },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_nahkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "ranged_weapon",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_fernkampf_",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Waffe"],
    extraFields: ["Fertigkeit", "Schadenswert", "Munition", "Reichweite"],
    popupFields: createStandardRangedWeaponPopupFields("sr6_fernkampf_munition"),
    popupDerivedResults: [
      {
        kind: "attack_value",
        label: "Angriffswert",
        sourceByRange: createAttackValueSourceByRange("sr6_fernkampf"),
      },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_fernkampf_schaden" },
    ],
    titleFallback: "Fernkampfwaffen",
  },
  {
    id: "melee_weapon",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_nahkampf_",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Waffe"],
    extraFields: ["Fertigkeit", "Schadenswert", "Reichweite"],
    popupFields: createStandardMeleeWeaponPopupFields(),
    popupDerivedResults: [
      {
        kind: "attack_value",
        label: "Angriffswert",
        sourceByRange: createAttackValueSourceByRange("sr6_nahkampf"),
      },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_nahkampf_schaden" },
    ],
    titleFallback: "Nahkampfwaffen",
  },
  {
    id: "weapon",
    matchField: "Waffe",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Schadenswert", "Munition", "Reichweite", "Modus"],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "visibility",
        slot: 2,
        label: "Sichtverhältnisse",
        type: "select",
        optionSet: "visibility",
        affects: "pool",
        includeInTemplate: true,
        defaultValue: "clear",
      },
      {
        id: "movement",
        slot: 3,
        label: "Bewegung",
        type: "select",
        optionSet: "movement",
        affects: "pool",
        includeInTemplate: true,
        defaultValue: "steady",
      },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "fallback",
    titleMode: "pool-prefix-or-explicit",
    primaryFields: [],
    extraFields: ["Basis", "Gesamt"],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
];

function findRollTitleByPoolAttribute(poolAttribute) {
  if (!poolAttribute) return "";

  for (let index = 0; index < SR6_ROLL_TITLE_PREFIXES.length; index += 1) {
    const entry = SR6_ROLL_TITLE_PREFIXES[index];
    if (poolAttribute.startsWith(entry.prefix)) {
      return entry.title;
    }
  }

  return "";
}

function resolveRollDefinition(fields, poolAttribute = "") {
  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    const definition = SR6_ROLL_DEFINITIONS[index];
    const fieldMatches = !definition.matchField || fields[definition.matchField];
    const poolMatches = !definition.matchPoolPrefix || poolAttribute.startsWith(definition.matchPoolPrefix);
    if (fieldMatches && poolMatches) {
      return definition;
    }
  }

  return SR6_ROLL_DEFINITIONS[SR6_ROLL_DEFINITIONS.length - 1];
}

function getRollDefinitionById(definitionId) {
  if (!definitionId) {
    return resolveRollDefinition({});
  }

  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    if (SR6_ROLL_DEFINITIONS[index].id === definitionId) {
      return SR6_ROLL_DEFINITIONS[index];
    }
  }

  return resolveRollDefinition({});
}

function buildRollRowOrder(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const primaryFields = Array.isArray(resolvedDefinition.primaryFields) ? resolvedDefinition.primaryFields : [];
  const extraFields = Array.isArray(resolvedDefinition.extraFields) ? resolvedDefinition.extraFields : [];
  const combined = [...primaryFields, ...extraFields];

  SR6_DEFAULT_ROLL_ROW_ORDER.forEach((field) => {
    if (!combined.includes(field)) {
      combined.push(field);
    }
  });

  return combined;
}

function getRollPopupFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  if (Array.isArray(resolvedDefinition.popupFields) && resolvedDefinition.popupFields.length > 0) {
    return resolvedDefinition.popupFields;
  }
  return SR6_DEFAULT_POPUP_FIELDS;
}

function getPopupFieldValueAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  if (field && field.type === "select") {
    return `sr6_roll_popup_value_${slot}_select_${field.optionSet || "default"}`;
  }
  if (field && field.type === "text") {
    return `sr6_roll_popup_value_${slot}_text`;
  }
  if (field && field.type === "checkbox") {
    return `sr6_roll_popup_value_${slot}_checkbox`;
  }
  return `sr6_roll_popup_value_${slot}_number`;
}

function getPopupFieldTypeToggleAttr(field, index, type) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_is_${type}`;
}

function getPopupFieldDependencyToggleAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_requires_previous_checkbox`;
}


function getPopupFieldOptionToggleAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_option_${field.optionSet || "none"}`;
}

function getPopupSelectOptions(field) {
  if (!field || field.type !== "select" || !field.optionSet) return [];
  return SR6_POPUP_SELECT_OPTION_SETS[field.optionSet] || [];
}

function buildPopupStateFromValues(values, definition) {
  const popupFields = getRollPopupFields(definition);
  const popupRows = [];
  let poolMod = 0;
  let attackValueMod = 0;
  let damageMod = 0;

  popupFields.forEach((field, index) => {
    const rawValue = values[getPopupFieldValueAttr(field, index)];
    const isNumberField = field.type === "number";
    const isTextField = field.type === "text";
    const isCheckboxField = field.type === "checkbox";
    const dependencySatisfied = !field.requiresCheckedSlot || isCheckedValue(values[`sr6_roll_popup_value_${field.requiresCheckedSlot}_checkbox`]);
    const checkboxChecked = dependencySatisfied && isCheckboxField ? isCheckedValue(rawValue) : false;
    const normalizedValue = isNumberField
      ? parseNumber(rawValue)
      : isCheckboxField
        ? (checkboxChecked ? "1" : "0")
        : `${rawValue || ""}`.trim();
    const selectedOption = (isNumberField || isTextField || isCheckboxField)
      ? null
      : getPopupSelectOptions(field).find((option) => option.value === normalizedValue);
    const displayValue = isNumberField
      ? `${normalizedValue}`
      : isTextField
        ? `${normalizedValue}`
        : isCheckboxField
          ? `${field.checkedDisplayValue || "Ja"}`
          : `${(selectedOption && (selectedOption.rowValue || selectedOption.label)) || normalizedValue}`;
    const affects = Array.isArray(field.affects)
      ? field.affects
      : field.affects
        ? [field.affects]
        : [];

    if (affects.includes("pool")) {
      poolMod += isNumberField
        ? parseNumber(normalizedValue)
        : isCheckboxField
          ? (checkboxChecked ? parseNumber(field.checkedValue) : 0)
          : parseNumber(selectedOption && selectedOption.poolMod);
    }
    if (affects.includes("attack_value")) {
      attackValueMod += isNumberField
        ? parseNumber(normalizedValue)
        : isCheckboxField
          ? (checkboxChecked ? parseNumber(field.checkedValue) : 0)
          : parseNumber(selectedOption && selectedOption.attackValueMod);
    }
    if (affects.includes("damage")) {
      damageMod += isNumberField
        ? parseNumber(normalizedValue)
        : isCheckboxField
          ? (checkboxChecked ? parseNumber(field.checkedValue) : 0)
          : parseNumber(selectedOption && selectedOption.damageMod);
    }

    const shouldInclude =
      field.includeInTemplate &&
      (
        (isNumberField && parseNumber(normalizedValue) !== 0) ||
        (isTextField && normalizedValue !== "" && normalizedValue !== `${field.defaultValue || ""}`) ||
        (isCheckboxField && checkboxChecked) ||
        (!isNumberField && !isTextField && !isCheckboxField && normalizedValue !== "" && normalizedValue !== `${field.defaultValue || ""}`)
      );

    if (shouldInclude) {
      popupRows.push({
        label: field.label,
        value: displayValue,
      });
    }

    if (selectedOption && Array.isArray(selectedOption.extraRows)) {
      selectedOption.extraRows.forEach((extraRow) => {
        if (!extraRow || !extraRow.label || extraRow.value === undefined || extraRow.value === null || `${extraRow.value}` === "") {
          return;
        }
        popupRows.push({
          label: extraRow.label,
          value: `${extraRow.value}`,
        });
      });
    }
  });

  return {
    poolMod: poolMod,
    attackValueMod: attackValueMod,
    damageMod: damageMod,
    rows: popupRows,
  };
}

function buildPopupFormPayload(definition) {
  const popupFields = getRollPopupFields(definition);
  const payload = {};

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_label`] = "";
    payload[`sr6_roll_popup_slot_${slot}_is_number`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_text`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_select`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_requires_previous_checkbox`] = "0";
    payload[`sr6_roll_popup_value_${slot}_number`] = "0";
    payload[`sr6_roll_popup_value_${slot}_text`] = "";
    payload[`sr6_roll_popup_value_${slot}_checkbox`] = "0";
    Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
      payload[`sr6_roll_popup_slot_${slot}_option_${optionSet}`] = "0";
      payload[`sr6_roll_popup_value_${slot}_select_${optionSet}`] = "";
    });
  }

  popupFields.forEach((field, index) => {
    const slot = field.slot || (index + 1);
    if (slot > SR6_POPUP_FIELD_SLOT_COUNT) return;

    payload[`sr6_roll_popup_slot_${slot}_visible`] = "1";
    payload[`sr6_roll_popup_slot_${slot}_label`] = field.label || "";
    const fieldType = field.type === "select"
      ? "select"
      : field.type === "text"
        ? "text"
        : field.type === "checkbox"
          ? "checkbox"
          : "number";
    payload[getPopupFieldTypeToggleAttr(field, index, fieldType)] = "1";
    if (field.type === "select" && field.optionSet) {
      payload[getPopupFieldOptionToggleAttr(field, index)] = "1";
    }
    if (field.requiresCheckedSlot && field.requiresCheckedSlot === slot - 1) {
      payload[getPopupFieldDependencyToggleAttr(field, index)] = "1";
    }
    payload[getPopupFieldValueAttr(field, index)] = field.defaultValue !== undefined ? `${field.defaultValue}` : "0";
  });

  return payload;
}

function getPopupSourceAttrName(field, poolAttribute) {
  if (!field) return "";
  if (field.source === "pool") return poolAttribute || "";
  return field.sourceAttr || "";
}

function buildPopupRequestedAttributes(definition, poolAttribute, repeatingRowPrefix) {
  const popupFields = getRollPopupFields(definition);
  const requestedAttributes = [];

  popupFields.forEach((field) => {
    const sourceAttr = getPopupSourceAttrName(field, poolAttribute);
    if (!sourceAttr) return;
    requestedAttributes.push(sourceAttr);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${sourceAttr}`);
    }
  });

  return [...new Set(requestedAttributes)];
}

function buildPopupPrefillPayload(definition, poolAttribute, repeatingRowPrefix, values) {
  const popupFields = getRollPopupFields(definition);
  const lookupAttr = buildAttrLookup(values || {}, repeatingRowPrefix);
  const payload = buildPopupFormPayload(definition);

  popupFields.forEach((field, index) => {
    const sourceAttr = getPopupSourceAttrName(field, poolAttribute);
    const resolvedValue = sourceAttr ? lookupAttr(sourceAttr) : "";
    if (resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === "") return;
    payload[getPopupFieldValueAttr(field, index)] = `${resolvedValue}`;
  });

  return payload;
}

function getPopupDerivedResults(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.popupDerivedResults) ? resolvedDefinition.popupDerivedResults : [];
}
// END MODULE: workers/rolls/definitions
