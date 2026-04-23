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
  melee_attribute: [
    { value: "Geschicklichkeit", label: "Geschicklichkeit", rowValue: "Geschicklichkeit" },
    { value: "Stärke", label: "Stärke", rowValue: "Stärke" },
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

function createSkillProbeDefinition(config = {}) {
  return {
    probeModel: "skill_probe",
    matchField: config.matchField || "Fertigkeit",
    matchPoolPrefix: config.matchPoolPrefix || "",
    titleMode: config.titleMode || "pool-prefix",
    titleField: config.titleField || "",
    primaryFields: config.primaryFields || ["Fertigkeit"],
    extraFields: config.extraFields || [],
    popupFields: config.popupFields || SR6_SKILL_PROBE_POPUP_FIELDS,
    fixedTitle: config.fixedTitle || "",
    titleFallback: config.titleFallback || "Fertigkeiten",
  };
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

const SR6_ROLL_DEFINITIONS = [
  {
    id: "initiative",
    ...createInitiativeProbeDefinition({
      titleFallback: "Initiative",
    }),
  },
  {
    id: "attribute",
    ...createAttributeProbeDefinition({
      matchField: "Attribut",
      titleField: "Attribut",
      primaryFields: ["Attribut"],
      poolMultiplier: 2,
      poolMultiplierField: "Attribut x2",
      poolMultiplierFieldValue: "1",
      internalFields: ["Attribut x2"],
      titleFallback: "Probe",
    }),
  },
  {
    id: "knowledge_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_wissensfertigkeit_",
      titleFallback: "Wissensfertigkeiten",
    }),
  },
  {
    id: "language_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_sprachfertigkeit_",
      titleFallback: "Sprachfertigkeiten",
    }),
  },
  {
    id: "talentsoft_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_talentsoft_",
      titleFallback: "Talentsofts",
    }),
  },
  {
    id: "knowledge_language_soft_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_wissenssprachsoft_",
      titleFallback: "Wissens-/Sprachsofts",
    }),
  },
  {
    id: "skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_skill_",
      titleFallback: "Fertigkeiten",
    }),
  },
  {
    id: "generic_skill",
    ...createSkillProbeDefinition({
      titleFallback: "Fertigkeiten",
    }),
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
    id: "astral_defense",
    ...createDefenseProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_astrale_verteidigung",
      primaryContextLabel: "Astrale Verteidigung",
      comparisonContextLabel: "Astralkampf Verteidigungswert",
      comparisonContextSourceAttr: "sr6_magic_astralkampf_verteidigungswert",
      fixedTitle: "Astrale Verteidigung",
      titleFallback: "Magie: Kernwerte",
    }),
  },
  {
    id: "astral_damage_resistance",
    ...createDefenseProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_astraler_schadenswiderstand",
      primaryContextLabel: "Astraler Schadenswiderstand",
      comparisonContextLabel: "Astralkampf Verteidigungswert",
      comparisonContextSourceAttr: "sr6_magic_astralkampf_verteidigungswert",
      fixedTitle: "Astraler Schadenswiderstand",
      titleFallback: "Magie: Kernwerte",
    }),
  },
  {
    id: "magic_value",
    ...createValueProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_",
      titleFallback: "Magie: Kernwerte",
    }),
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
    id: "matrix_defense",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_matrix_verteidigung",
      primaryContextLabel: "Matrix Verteidigung",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_matrix_verteidigungswert",
      fixedTitle: "Matrix Verteidigung",
      titleFallback: "Matrix: Kernwerte",
    }),
  },
  {
    id: "matrix_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_matrix_schadenswiderstand",
      primaryContextLabel: "Matrix Schadenswiderstand",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_matrix_verteidigungswert",
      fixedTitle: "Matrix Schadenswiderstand",
      titleFallback: "Matrix: Kernwerte",
    }),
  },
  {
    id: "matrix_biofeedback_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_matrix_biofeedback_schadenswiderstand",
      primaryContextLabel: "Biofeedback Schadenswiderstand",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_matrix_verteidigungswert",
      fixedTitle: "Biofeedback Schadenswiderstand",
      titleFallback: "Matrix: Kernwerte",
    }),
  },
  {
    id: "matrix_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_matrix_",
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
    }),
  },
  {
    id: "rigging_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_rigging_",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
  {
    id: "value",
    ...createValueProbeDefinition({
      titleFallback: "Probe",
    }),
  },
  {
    id: "rigging_matrix_defense",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_rigging_matrix_verteidigung",
      primaryContextLabel: "Matrix Verteidigung",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_rigging_verteidigungswert",
      fixedTitle: "Matrix Verteidigung",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
  {
    id: "rigging_matrix_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_rigging_matrix_schadenswiderstand",
      primaryContextLabel: "Matrix Schadenswiderstand",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_rigging_verteidigungswert",
      fixedTitle: "Matrix Schadenswiderstand",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
  {
    id: "rigging_biofeedback_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_rigging_biofeedback_schadenswiderstand",
      primaryContextLabel: "Biofeedback Schadenswiderstand",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_rigging_verteidigungswert",
      fixedTitle: "Biofeedback Schadenswiderstand",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
  {
    id: "combat_ranged_core_attack",
    probeModel: "combat_attack_probe",
    matchField: "Wert",
    matchPoolPrefix: "sr6_combat_fernkampfangriff",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Wert"],
    extraFields: [],
    templateVariant: "weapon",
    contextFields: [
      { label: "Waffe", attr: "sr6_combat_primaere_fernkampfwaffe" },
      { label: "Fertigkeit", attr: "sr6_combat_fernkampf_fertigkeit" },
      { label: "Munition", attr: "sr6_combat_munition" },
      { label: "Schadenswert", attr: "sr6_combat_fernkampf_schaden" },
    ],
    fixedTitle: "Fernkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
    popupDerivedResults: [
      { kind: "attack_value", label: "Angriffswert", source: "pool" },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_fernkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "combat_melee_core_attack",
    probeModel: "combat_attack_probe",
    matchField: "Wert",
    matchPoolPrefix: "sr6_combat_nahkampfangriff",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Wert"],
    extraFields: [],
    templateVariant: "weapon",
    contextFields: [
      { label: "Waffe", attr: "sr6_combat_primaere_nahkampfwaffe" },
      { label: "Fertigkeit", attr: "sr6_combat_nahkampf_fertigkeit" },
      { label: "Attribut", attr: "sr6_combat_nahkampf_attribut" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Schadenswert", attr: "sr6_combat_nahkampf_schaden" },
      { label: "Schadenstyp", attr: "sr6_combat_nahkampf_schadentyp" },
    ],
    fixedTitle: "Nahkampfangriff",
    popupFields: createCombatMeleePopupFields("sr6_combat_nahkampf_attribut"),
    popupPoolAttributeOverride: "melee_attribute",
    internalFields: ["Geschicklichkeit-Wert", "Stärke-Wert"],
    popupDerivedResults: [
      { kind: "attack_value", label: "Angriffswert", source: "pool" },
      { kind: "damage", label: "Schaden", sourceAttr: "sr6_combat_nahkampf_schaden" },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "physical_defense",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_verteidigung_physisch_",
      primaryContextLabel: "Verteidigung (Physisch)",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_combat_verteidigungswert_gesamtwert",
      titleFallback: "Verteidigung",
    }),
  },
  {
    id: "physical_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_schadenswiderstand_physisch_",
      primaryContextLabel: "Schadenswiderstand (Physisch)",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_combat_verteidigungswert_gesamtwert",
      titleFallback: "Schadenswiderstand",
    }),
  },
  {
    id: "general_defense",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_verteidigung_",
      primaryContextLabel: "Verteidigung",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_combat_verteidigungswert_gesamtwert",
      titleFallback: "Verteidigung",
    }),
  },
  {
    id: "general_damage_resistance",
    ...createDefenseProbeDefinition({
      matchPoolPrefix: "sr6_schadenswiderstand_",
      primaryContextLabel: "Schadenswiderstand",
      comparisonContextLabel: "Verteidigungswert",
      comparisonContextSourceAttr: "sr6_combat_verteidigungswert_gesamtwert",
      titleFallback: "Schadenswiderstand",
    }),
  },
  {
    id: "combat_ranged_weapon",
    probeModel: "combat_attack_probe",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_combat_fernkampf_",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Schadenswert", "Munition", "Reichweite", "Modus"],
    templateVariant: "weapon",
    fixedTitle: "Fernkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
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
    probeModel: "combat_attack_probe",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_combat_nahkampf_",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Fertigkeit", "Attribut", "Schadenswert", "Schadenstyp", "Reichweite"],
    templateVariant: "weapon",
    contextFields: [
      { label: "Fertigkeit", attr: "sr6_combat_nahkampf_fertigkeit" },
      { label: "Attribut", attr: "sr6_combat_nahkampf_attribut" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Schadenswert", attr: "sr6_combat_nahkampf_schaden" },
      { label: "Schadenstyp", attr: "sr6_combat_nahkampf_schadentyp" },
    ],
    fixedTitle: "Nahkampfangriff",
    popupFields: createCombatMeleePopupFields("sr6_combat_nahkampf_attribut"),
    popupPoolAttributeOverride: "melee_attribute",
    internalFields: ["Geschicklichkeit-Wert", "Stärke-Wert"],
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
    probeModel: "combat_attack_probe",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_fernkampf_",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Waffe"],
    extraFields: ["Fertigkeit", "Schadenswert", "Munition", "Reichweite"],
    templateVariant: "weapon",
    fixedTitle: "Fernkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
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
    probeModel: "combat_attack_probe",
    matchField: "Waffe",
    matchPoolPrefix: "sr6_nahkampf_",
    titleMode: "field-short",
    titleField: "Fertigkeit",
    primaryFields: ["Waffe"],
    extraFields: ["Fertigkeit", "Attribut", "Schadenswert", "Schadenstyp", "Reichweite"],
    templateVariant: "weapon",
    contextFields: [
      { label: "Fertigkeit", attr: "sr6_nahkampf_fertigkeit" },
      { label: "Attribut", attr: "sr6_nahkampf_attribut" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Schadenswert", attr: "sr6_nahkampf_schaden" },
      { label: "Schadenstyp", attr: "sr6_nahkampf_schadentyp" },
    ],
    fixedTitle: "Nahkampfangriff",
    popupFields: createCombatMeleePopupFields("sr6_nahkampf_attribut"),
    popupPoolAttributeOverride: "melee_attribute",
    internalFields: ["Geschicklichkeit-Wert", "Stärke-Wert"],
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
    // Legacy safety net for weapon-shaped rolls that are not yet mapped to an explicit domain model.
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
    // Final generic fallback for rolls that do not match any explicit probe model yet.
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
  let bestDefinition = null;
  let bestScore = -1;

  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    const definition = SR6_ROLL_DEFINITIONS[index];
    const fieldMatches = !definition.matchField || fields[definition.matchField];
    const poolMatches = !definition.matchPoolPrefix || poolAttribute.startsWith(definition.matchPoolPrefix);
    if (fieldMatches && poolMatches) {
      let score = 0;
      if (definition.matchPoolPrefix) score += 2;
      if (definition.matchField) score += 1;

      if (score > bestScore) {
        bestDefinition = definition;
        bestScore = score;
      }
    }
  }

  return bestDefinition || SR6_ROLL_DEFINITIONS[SR6_ROLL_DEFINITIONS.length - 1];
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

function getInternalRollFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.internalFields) ? resolvedDefinition.internalFields : [];
}

function getRollPopupFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  if (Array.isArray(resolvedDefinition.popupFields) && resolvedDefinition.popupFields.length > 0) {
    return resolvedDefinition.popupFields;
  }
  return SR6_DEFAULT_POPUP_FIELDS;
}

function getRollContextFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.contextFields) ? resolvedDefinition.contextFields : [];
}

function getRollPoolMultiplier(definition, resolvedFields) {
  const resolvedDefinition = definition || resolveRollDefinition(resolvedFields || {});
  const multiplierField = resolvedDefinition.poolMultiplierField || "";
  if (multiplierField) {
    const fieldValue = `${(resolvedFields && resolvedFields[multiplierField]) || ""}`.trim();
    if (fieldValue && fieldValue === `${resolvedDefinition.poolMultiplierFieldValue || "1"}`) {
      const configuredMultiplier = parseNumber(resolvedDefinition.poolMultiplier);
      return configuredMultiplier > 0 ? configuredMultiplier : 1;
    }
    return 1;
  }
  const configuredMultiplier = parseNumber(resolvedDefinition.poolMultiplier);
  return configuredMultiplier > 0 ? configuredMultiplier : 1;
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
  const selectedValues = {};
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

    if (field.id) {
      selectedValues[field.id] = normalizedValue;
    }

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
    selectedValues: selectedValues,
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
