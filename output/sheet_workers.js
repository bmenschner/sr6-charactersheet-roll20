// BEGIN BLOCK: Worker Includes (core)
// BEGIN MODULE: workers/core/constants
const SR6_ATTRIBUTES = [
  "konstitution",
  "geschicklichkeit",
  "reaktion",
  "staerke",
  "willenskraft",
  "logik",
  "intuition",
  "charisma",
  "edge",
  "magie_resonanz"
];

const SR6_SKILLS = [
  "astral",
  "athletik",
  "beschwoeren",
  "biotech",
  "cracken",
  "einfluss",
  "elektronik",
  "exotische_waffen",
  "feuerwaffen",
  "heimlichkeit",
  "hexerei",
  "mechanik",
  "nahkampf",
  "natur",
  "steuern",
  "tasken",
  "ueberreden",
  "verzaubern",
  "wahrnehmung"
];

const SR6_MATRIX_ACTIONS = [
  "ausstoepseln",
  "befehl_vortaeuschen",
  "bedrohungsanalyse",
  "brute_force",
  "datei_cracken",
  "datei_editieren",
  "datei_verschluesseln",
  "datenbombe_entschaerfen",
  "datenbombe_legen",
  "datenspike",
  "ersticken",
  "garbage_in_garbage_out",
  "geraet_formatieren",
  "geraet_neu_starten",
  "geraet_steuern",
  "geraetesperre",
  "hineinspringen",
  "hintertuer_benutzen",
  "hintertuer_mit_bekanntem_exploit_benutzen",
  "host_betreten_verlassen",
  "icon_aufspueren",
  "icon_modifizieren",
  "icon_veraendern",
  "infrastruktur_unterwandern",
  "interfacemodus_wechseln",
  "kalibrierung",
  "maskerade",
  "matrixattribute_austauschen",
  "matrixsignatur_loeschen",
  "matrixsuche",
  "matrixwahrnehmung",
  "mittelsmetamensch",
  "nachricht_uebermitteln",
  "overwatch_wert_bestimmen",
  "pop_up",
  "programm_abstuerzen_lassen",
  "pruefsummensuche",
  "signal_stoeren",
  "sondieren",
  "stalking",
  "teergrube",
  "uebertragung_abfangen",
  "verstecken",
  "verzoegerter_befehl",
  "virtuelles_zielen",
  "volle_matrixabwehr"
];
// END MODULE: workers/core/constants

// BEGIN MODULE: workers/core/helpers
function parseNumber(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isCheckedValue(value) {
  const normalized = `${value || ""}`.trim().toLowerCase();
  return normalized === "1" || normalized === "on" || normalized === "true" || normalized === "yes";
}

function mapTraditionsattributToKey(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "charisma") return "charisma";
  if (normalized === "intuition") return "intuition";
  if (normalized === "konstitution") return "konstitution";
  if (normalized === "logik") return "logik";
  if (normalized === "willenskraft") return "willenskraft";
  return "";
}
// END MODULE: workers/core/helpers

// BEGIN MODULE: workers/core/guards
function setAttrsSilent(payload, callback) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  if (typeof callback === "function") {
    setAttrs(payload, { silent: true }, callback);
    return;
  }
  setAttrs(payload, { silent: true });
}
// END MODULE: workers/core/guards

// END BLOCK: Worker Includes (core)

// BEGIN BLOCK: Worker Includes (rolls)
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
    titleFallback: config.titleFallback || "Probe",
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

const SR6_ROLL_DEFINITIONS = [
  {
    id: "attribute",
    ...createAttributeProbeDefinition({
      matchField: "Attribut",
      titleField: "Attribut",
      primaryFields: ["Attribut"],
      poolMultiplier: 1,
      titleFallback: "Probe",
    }),
  },
  {
    id: "skill",
    probeModel: "skill_probe",
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
      { label: "Munition", attr: "sr6_combat_munition" },
      { label: "Schadenswert", attr: "sr6_combat_nahkampf_schaden" },
    ],
    fixedTitle: "Nahkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
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
    extraFields: ["Schadenswert", "Reichweite"],
    templateVariant: "weapon",
    fixedTitle: "Nahkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
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
    extraFields: ["Fertigkeit", "Schadenswert", "Reichweite"],
    templateVariant: "weapon",
    fixedTitle: "Nahkampfangriff",
    popupFields: SR6_COMBAT_TAB_POPUP_FIELDS,
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

// BEGIN MODULE: workers/rolls/context
function parseTemplateFields(template) {
  const fields = {};
  let index = 0;

  while (index < template.length) {
    const start = template.indexOf("{{", index);
    if (start === -1) break;

    let cursor = start + 2;
    let key = "";
    while (cursor < template.length && template[cursor] !== "=") {
      key += template[cursor];
      cursor += 1;
    }
    if (cursor >= template.length) break;
    cursor += 1;

    let value = "";
    let attrDepth = 0;
    while (cursor < template.length) {
      const current = template[cursor];
      const next = template[cursor + 1];

      if (current === "@" && next === "{") {
        attrDepth += 1;
        value += "@{";
        cursor += 2;
        continue;
      }

      if (current === "}" && attrDepth > 0) {
        attrDepth -= 1;
        value += current;
        cursor += 1;
        continue;
      }

      if (current === "}" && next === "}" && attrDepth === 0) {
        cursor += 2;
        break;
      }

      value += current;
      cursor += 1;
    }

    if (key.trim()) {
      fields[key.trim()] = value.trim();
    }

    index = cursor;
  }

  return fields;
}

function collectAttributeReferences(template) {
  const refs = [];
  const attributeRefRegex = /@\{([^}]+)\}/g;
  let match;

  while ((match = attributeRefRegex.exec(template)) !== null) {
    refs.push(match[1]);
  }

  return [...new Set(refs)];
}

function parsePoolAttributeFromFields(fields) {
  const erfolgeField = fields.Erfolge || "";
  const match = erfolgeField.match(/\[\[@\{([^}]+)\}d6(?:cs>|>)5\]\]/);
  return match ? match[1] : "";
}

function extractRepeatingRowPrefix(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^(repeating_[^_]+_[^_]+)_/);
  return match ? match[1] : "";
}

function buildAttrLookup(values, repeatingRowPrefix) {
  return function lookupAttr(key) {
    if (!key) return "";
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return values[key];
    }
    if (repeatingRowPrefix) {
      const repeatingKey = `${repeatingRowPrefix}_${key}`;
      if (Object.prototype.hasOwnProperty.call(values, repeatingKey)) {
        return values[repeatingKey];
      }
    }
    return "";
  };
}

function resolveFieldText(templateValue, lookupAttr) {
  if (!templateValue) return "";
  return templateValue.replace(/@\{([^}]+)\}/g, (_, key) => lookupAttr(key));
}

function buildResolvedFields(fields, lookupAttr) {
  const resolved = {};
  Object.keys(fields).forEach((key) => {
    resolved[key] = resolveFieldText(fields[key], lookupAttr);
  });
  return resolved;
}

function buildRequestedAttributes(rawTemplate, repeatingRowPrefix) {
  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  const definition = resolveRollDefinition(fields, poolAttribute);
  const attributeRefs = collectAttributeReferences(rawTemplate);

  if (poolAttribute && !attributeRefs.includes(poolAttribute)) {
    attributeRefs.push(poolAttribute);
  }

  if (poolAttribute) {
    attributeRefs.push("sr6_monitor_pool_mod");
  }

  const requestedAttributes = [];
  attributeRefs.forEach((attributeRef) => {
    requestedAttributes.push(attributeRef);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${attributeRef}`);
    }
  });

  getRollContextFields(definition).forEach((field) => {
    if (!field || !field.attr) return;
    requestedAttributes.push(field.attr);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${field.attr}`);
    }
  });

  return {
    definition: definition,
    fields: fields,
    poolAttribute: poolAttribute,
    requestedAttributes: requestedAttributes,
  };
}
// END MODULE: workers/rolls/context

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

// BEGIN MODULE: workers/rolls/compute
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildProbeComputation(lookupAttr, poolAttribute, popupPoolMod, poolMultiplier = 1) {
  const poolBasisRaw = parseNumber(lookupAttr(poolAttribute));
  const normalizedPoolMultiplier = Math.max(1, parseNumber(poolMultiplier) || 1);
  const poolBasis = poolBasisRaw * normalizedPoolMultiplier;
  const monitorPoolMod = parseNumber(lookupAttr("sr6_monitor_pool_mod"));
  const poolPopupMod = parseNumber(popupPoolMod);
  const pool = Math.max(0, poolBasis + monitorPoolMod + poolPopupMod);
  const diceResults = [];

  for (let index = 0; index < pool; index += 1) {
    diceResults.push(rollD6());
  }

  const successCount = diceResults.filter((die) => die >= 5).length;
  const glitchState = evaluateGlitch(diceResults, successCount);

  return {
    poolBasisRaw: poolBasisRaw,
    poolMultiplier: normalizedPoolMultiplier,
    poolBasis: poolBasis,
    monitorPoolMod: monitorPoolMod,
    poolPopupMod: poolPopupMod,
    pool: pool,
    diceResults: diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}
// END MODULE: workers/rolls/compute

// BEGIN MODULE: workers/rolls/probe
function normalizePopupState(popupState) {
  if (typeof popupState === "number") {
    return { poolMod: popupState, attackValueMod: 0, damageMod: 0, rows: [] };
  }

  if (!popupState || typeof popupState !== "object") {
    return { poolMod: 0, attackValueMod: 0, damageMod: 0, rows: [] };
  }

  return {
    poolMod: parseNumber(popupState.poolMod),
    attackValueMod: parseNumber(popupState.attackValueMod),
    damageMod: parseNumber(popupState.damageMod),
    rows: Array.isArray(popupState.rows) ? popupState.rows : [],
  };
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

function buildPopupDerivedResultRows(definition, lookupAttr, poolAttribute, resolvedFields, popupState) {
  const derivedResults = getPopupDerivedResults(definition);
  const rows = [];

  derivedResults.forEach((result) => {
    const resultKind = result.kind || "";
    const modifier = resultKind === "attack_value"
      ? parseNumber(popupState.attackValueMod)
      : resultKind === "damage"
        ? parseNumber(popupState.damageMod)
        : 0;

    if (modifier === 0) {
      return;
    }

    const sourceAttr = resolvePopupDerivedSourceAttr(result, resolvedFields);
    const baseValue = result.source === "pool"
      ? parseNumber(lookupAttr(poolAttribute))
      : parseNumber(lookupAttr(sourceAttr));
    const totalValue = baseValue + modifier;
    const labelBase = result.label || "Wert";

    rows.push({ label: `${labelBase}-Basis`, value: `${baseValue}` });
    rows.push({ label: `${labelBase}-Modifikator`, value: `${modifier}` });
    rows.push({ label: `${labelBase}`, value: `${totalValue}` });
  });

  return rows;
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
      });
      startRoll(chatMessage, (rollResult) => {
        finishRoll(rollResult.rollId);
      });
      return;
    }

    const poolMultiplier = getRollPoolMultiplier(context.definition, resolvedFields);
    const computation = buildProbeComputation(
      lookupAttr,
      context.poolAttribute,
      normalizedPopupState.poolMod,
      poolMultiplier
    );
    const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

    if (computation.poolMultiplier !== 1) {
      rows.push({ label: "Pool-Basis", value: `${computation.poolBasisRaw}` });
      rows.push({ label: "Multiplikator", value: `x${computation.poolMultiplier}` });
    }
    if (computation.monitorPoolMod !== 0) {
      rows.push({
        label: computation.poolMultiplier !== 1 ? "Pool nach Multiplikator" : "Pool-Basis",
        value: `${computation.poolBasis}`,
      });
      rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
    }
    normalizedPopupState.rows.forEach((popupRow) => rows.push(popupRow));
    buildPopupDerivedResultRows(context.definition, lookupAttr, context.poolAttribute, resolvedFields, normalizedPopupState)
      .forEach((popupRow) => rows.push(popupRow));

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      resolvedFields: resolvedFields,
      definition: context.definition,
      definitionId: context.definition && context.definition.id,
      pool: `${computation.pool}`,
      erfolge: erfolgeValue,
      details: buildDiceDetails(computation.diceResults),
      detailsDice: buildDetailsDice(computation.diceResults),
      isGlitch: computation.isGlitch,
    });
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}
// END MODULE: workers/rolls/probe

// BEGIN MODULE: workers/rolls/popup
function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  const parsedFields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(parsedFields);
  const definition = resolveRollDefinition(parsedFields, poolAttribute);

  getAttrs(["sr6_setting_popup_mods"], (values) => {
    const popupSetting = (values.sr6_setting_popup_mods || "eigen").toLowerCase();
    const useRoll20Fallback = popupSetting === "roll20";

    if (!useRoll20Fallback) {
      const popupRequestedAttributes = buildPopupRequestedAttributes(definition, poolAttribute, repeatingRowPrefix);
      getAttrs(popupRequestedAttributes, (popupValues) => {
        const popupFormPayload = buildPopupPrefillPayload(definition, poolAttribute, repeatingRowPrefix, popupValues);
        setAttrsSilent({
          ...popupFormPayload,
          sr6_roll_popup_definition: definition.id,
          sr6_roll_popup_template: rawTemplate,
          sr6_roll_popup_row_prefix: repeatingRowPrefix || "",
          sr6_roll_popup_open: "1",
        });
      });
      return;
    }

    startRoll(
      "&{template:default} {{name=Probenmodifikator}} {{Wert=[[?{Modifikator|0}]]}}",
      (queryResult) => {
        const queryRoll = queryResult && queryResult.results && queryResult.results.Wert;
        const popupState = {
          poolMod: parseNumber(queryRoll && queryRoll.result),
          rows: parseNumber(queryRoll && queryRoll.result) !== 0
            ? [{ label: "Popup-Modifikator", value: `${parseNumber(queryRoll && queryRoll.result)}` }]
            : [],
        };
        if (queryResult && queryResult.rollId) {
          finishRoll(queryResult.rollId);
        }
        runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
      }
    );
  });
}

function runTestPopupProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  getAttrs(["sr6_test_roll_popup_mod"], (values) => {
    const popupPoolMod = parseNumber(values.sr6_test_roll_popup_mod);
    const popupState = {
      poolMod: popupPoolMod,
      rows: popupPoolMod !== 0 ? [{ label: "Popup-Modifikator", value: `${popupPoolMod}` }] : [],
    };
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeConfirm() {
  const requestAttrs = [
    "sr6_roll_popup_definition",
    "sr6_roll_popup_template",
    "sr6_roll_popup_row_prefix",
  ];

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    requestAttrs.push(`sr6_roll_popup_value_${slot}_number`);
    requestAttrs.push(`sr6_roll_popup_value_${slot}_text`);
    requestAttrs.push(`sr6_roll_popup_value_${slot}_checkbox`);
    Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
      requestAttrs.push(`sr6_roll_popup_value_${slot}_select_${optionSet}`);
    });
  }

  getAttrs(requestAttrs, (values) => {
    const definition = getRollDefinitionById(values.sr6_roll_popup_definition || "");
    const rawTemplate = values.sr6_roll_popup_template || "";
    const repeatingRowPrefix = values.sr6_roll_popup_row_prefix || "";
    const popupState = buildPopupStateFromValues(values, definition);

    setAttrsSilent({ sr6_roll_popup_open: "0" });
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeCancel() {
  setAttrsSilent({ sr6_roll_popup_open: "0" });
}
// END MODULE: workers/rolls/popup

// BEGIN MODULE: workers/rolls/edge
function runEdgeTokenChange(delta) {
  getAttrs(["sr6_edge_aktuell"], (values) => {
    const edgeCurrent = clampNumber(parseNumber(values.sr6_edge_aktuell) + delta, 0, 7);
    setAttrsSilent({ sr6_edge_aktuell: String(edgeCurrent) });

    const actionText = delta > 0 ? "hinzugefügt" : "verloren";
    const chatMessage = buildEdgeTokenMessage(actionText, edgeCurrent);
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}

function runEdgeTokenPlus() {
  runEdgeTokenChange(1);
}

function runEdgeTokenMinus() {
  runEdgeTokenChange(-1);
}
// END MODULE: workers/rolls/edge

// BEGIN MODULE: workers/rolls/index
function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:probe_popup_test", runTestPopupProbeRoll);
  on("clicked:probe_popup_confirm", runGlobalPopupProbeConfirm);
  on("clicked:probe_popup_cancel", runGlobalPopupProbeCancel);
}

function registerEdgeTokenEvents() {
  on("clicked:sr6_edge_token_plus", runEdgeTokenPlus);
  on("clicked:sr6_edge_token_minus", runEdgeTokenMinus);
}
// END MODULE: workers/rolls/index

// END BLOCK: Worker Includes (rolls)

// BEGIN BLOCK: Worker Includes (compute)
// BEGIN MODULE: workers/compute/attributes
function appendAttributeRequestKeys(requestKeys) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    requestKeys.push(`sr6_attr_${attributeName}_grundwert`);
    requestKeys.push(`sr6_attr_${attributeName}_modifikator`);
  });
}

function computeAttributeTotals(values, updates, totals) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    const baseKey = `sr6_attr_${attributeName}_grundwert`;
    const modifierKey = `sr6_attr_${attributeName}_modifikator`;
    const totalKey = `sr6_attr_${attributeName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    totals[attributeName] = total;
    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/attributes

// BEGIN MODULE: workers/compute/skills
function appendSkillRequestKeys(requestKeys) {
  SR6_SKILLS.forEach((skillName) => {
    requestKeys.push(`sr6_skill_${skillName}_grundwert`);
    requestKeys.push(`sr6_skill_${skillName}_modifikator`);
  });
}

function computeSkillTotals(values, updates, skillTotals) {
  SR6_SKILLS.forEach((skillName) => {
    const baseKey = `sr6_skill_${skillName}_grundwert`;
    const modifierKey = `sr6_skill_${skillName}_modifikator`;
    const totalKey = `sr6_skill_${skillName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    skillTotals[skillName] = total;
    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/skills

// BEGIN MODULE: workers/compute/header-monitor
function appendHeaderMonitorRequestKeys(requestKeys) {
  for (let index = 1; index <= 18; index += 1) {
    requestKeys.push(`sr6_monitor_koerperlich_${index}`);
    requestKeys.push(`sr6_monitor_geistig_${index}`);
  }
}

function sanitizeAndCountHeaderMonitor(values, updates, monitorPrefix, maxBoxes) {
  let count = 0;
  for (let index = 1; index <= 18; index += 1) {
    const key = `sr6_monitor_${monitorPrefix}_${index}`;
    const checked = isCheckedValue(values[key]);

    if (index > maxBoxes) {
      if (checked) {
        updates[key] = "0";
      }
      continue;
    }

    if (checked) {
      count += 1;
    }
  }
  return count;
}

function computeHeaderMonitorDerivedFromAttributes(totals, values, updates) {
  const konstitution = totals.konstitution || 0;
  const willenskraft = totals.willenskraft || 0;

  const koerperlichMax = clampNumber(8 + Math.ceil(konstitution / 2), 0, 18);
  const geistigMax = clampNumber(8 + Math.ceil(willenskraft / 2), 0, 18);
  const koerperlichCount = sanitizeAndCountHeaderMonitor(values, updates, "koerperlich", koerperlichMax);
  const geistigCount = sanitizeAndCountHeaderMonitor(values, updates, "geistig", geistigMax);
  const poolMod = -1 * (Math.floor(koerperlichCount / 3) + Math.floor(geistigCount / 3));

  updates.sr6_derived_koerperlicher_monitor_max = String(koerperlichMax);
  updates.sr6_derived_geistiger_monitor_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_max = String(koerperlichMax);
  updates.sr6_monitor_geistig_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_count = String(koerperlichCount);
  updates.sr6_monitor_geistig_count = String(geistigCount);
  updates.sr6_monitor_koerperlich = String(koerperlichCount);
  updates.sr6_monitor_geistig = String(geistigCount);
  updates.sr6_monitor_pool_mod = String(poolMod);
}
// END MODULE: workers/compute/header-monitor

// BEGIN MODULE: workers/compute/combat
const SR6_COMBAT_ARMOR_SELECTION_FIELDS = [
  {
    key: "sr6_combat_primaere_panzerung",
    checkbox: "sr6_panzerung_ist_primaer",
    nameKey: "sr6_combat_primaere_panzerung_name",
  },
  {
    key: "sr6_combat_sekundaere_panzerung",
    checkbox: "sr6_panzerung_ist_sekundaer",
    nameKey: "sr6_combat_sekundaere_panzerung_name",
  },
  {
    key: "sr6_combat_helm",
    checkbox: "sr6_panzerung_ist_helm",
    nameKey: "sr6_combat_helm_name",
  },
  {
    key: "sr6_combat_schild",
    checkbox: "sr6_panzerung_ist_schild",
    nameKey: "sr6_combat_schild_name",
  },
];

const SR6_COMBAT_CALCULATED_FIELDS = [
  {
    key: "sr6_combat_fernkampfangriff",
    base: (totals, skillTotals) => (skillTotals.feuerwaffen || 0) + (totals.geschicklichkeit || 0),
  },
  {
    key: "sr6_combat_nahkampfangriff",
    base: (totals, skillTotals) => (skillTotals.nahkampf || 0) + (totals.geschicklichkeit || 0),
  },
  {
    key: "sr6_combat_verteidigungswert",
    base: (totals, skillTotals, values) =>
      (totals.konstitution || 0) +
      parseNumber(values.sr6_combat_primaere_panzerung) +
      parseNumber(values.sr6_combat_sekundaere_panzerung) +
      parseNumber(values.sr6_combat_helm) +
      parseNumber(values.sr6_combat_schild),
  },
  {
    key: "sr6_verteidigung_physisch",
    base: (totals) => (totals.reaktion || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_physisch",
    base: (totals) => totals.konstitution || 0,
  },
];

const SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS = [
  {
    section: "repeating_sr6fernkampfwaffen",
    roleAttr: "sr6_fernkampf_ist_primaer",
    rowNameAttr: "sr6_fernkampfwaffe",
    targetMap: {
      sr6_combat_primaere_fernkampfwaffe: "sr6_fernkampfwaffe",
      sr6_combat_fernkampf_fertigkeit: "sr6_fernkampf_fertigkeit",
      sr6_combat_fernkampf_schaden: "sr6_fernkampf_schaden",
      sr6_combat_munition: "sr6_fernkampf_munition",
      sr6_combat_fernkampf_modus: "sr6_fernkampf_modus",
      sr6_combat_fernkampf_sehr_nah: "sr6_fernkampf_s_nah",
      sr6_combat_fernkampf_nah: "sr6_fernkampf_nah",
      sr6_combat_fernkampf_mittel: "sr6_fernkampf_mittel",
      sr6_combat_fernkampf_weit: "sr6_fernkampf_weit",
      sr6_combat_fernkampf_sehr_weit: "sr6_fernkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_fernkampfwaffe: "",
      sr6_combat_fernkampf_fertigkeit: "Feuerwaffen",
      sr6_combat_fernkampf_schaden: "0",
      sr6_combat_munition: "Standard",
      sr6_combat_fernkampf_modus: "",
      sr6_combat_fernkampf_sehr_nah: "0",
      sr6_combat_fernkampf_nah: "0",
      sr6_combat_fernkampf_mittel: "0",
      sr6_combat_fernkampf_weit: "0",
      sr6_combat_fernkampf_sehr_weit: "0",
    },
  },
  {
    section: "repeating_sr6nahkampfwaffen",
    roleAttr: "sr6_nahkampf_ist_primaer",
    rowNameAttr: "sr6_nahkampfwaffe",
    targetMap: {
      sr6_combat_primaere_nahkampfwaffe: "sr6_nahkampfwaffe",
      sr6_combat_nahkampf_fertigkeit: "sr6_nahkampf_fertigkeit",
      sr6_combat_nahkampf_schaden: "sr6_nahkampf_schaden",
      sr6_combat_nahkampf_sehr_nah: "sr6_nahkampf_s_nah",
      sr6_combat_nahkampf_nah: "sr6_nahkampf_nah",
      sr6_combat_nahkampf_mittel: "sr6_nahkampf_mittel",
      sr6_combat_nahkampf_weit: "sr6_nahkampf_weit",
      sr6_combat_nahkampf_sehr_weit: "sr6_nahkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_nahkampfwaffe: "",
      sr6_combat_nahkampf_fertigkeit: "Nahkampf",
      sr6_combat_nahkampf_schaden: "0",
      sr6_combat_nahkampf_sehr_nah: "0",
      sr6_combat_nahkampf_nah: "0",
      sr6_combat_nahkampf_mittel: "0",
      sr6_combat_nahkampf_weit: "0",
      sr6_combat_nahkampf_sehr_weit: "0",
    },
  },
];

function appendCombatRequestKeys(requestKeys) {
  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    requestKeys.push(`${field.key}_modifikator`);
  });
  SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
    requestKeys.push(field.key);
  });
}

function computeCombatDerivedFromAttributes(totals, values, updates, skillTotals) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const resolvedSkillTotals = skillTotals || {};

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);

  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    const baseValue = field.base(totals, resolvedSkillTotals, values);
    const modifierValue = parseNumber(values[`${field.key}_modifikator`]);
    const totalValue = baseValue + modifierValue;

    updates[`${field.key}_grundwert`] = String(baseValue);
    updates[`${field.key}_gesamtwert`] = String(totalValue);
    updates[field.key] = String(totalValue);
  });
}

function parseCombatArmorSelectionEvent(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^repeating_sr6panzerung_([^_]+)_(sr6_panzerung_ist_(primaer|sekundaer|helm|schild))$/);

  if (!match) {
    return null;
  }

  return {
    rowId: match[1],
    checkbox: match[2],
  };
}

function syncCombatArmorSelections(callback, eventInfo) {
  getSectionIDs("repeating_sr6panzerung", (sectionIds) => {
    const orderedIds = sectionIds || [];
    const requestKeys = [];
    const preferredSelection = parseCombatArmorSelectionEvent(eventInfo);

    orderedIds.forEach((rowId) => {
      requestKeys.push(`repeating_sr6panzerung_${rowId}_sr6_panzerung_name`);
      requestKeys.push(`repeating_sr6panzerung_${rowId}_sr6_panzerung_verteidigungswert`);
      SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
        requestKeys.push(`repeating_sr6panzerung_${rowId}_${field.checkbox}`);
      });
    });

    getAttrs(requestKeys, (values) => {
      const updates = {};
      const armorRows = orderedIds.map((rowId) => ({
        rowId,
        name: values[`repeating_sr6panzerung_${rowId}_sr6_panzerung_name`] || "",
        verteidigungswert: parseNumber(values[`repeating_sr6panzerung_${rowId}_sr6_panzerung_verteidigungswert`]),
      }));

      SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
        const selectedRows = armorRows.filter((row) =>
          isCheckedValue(values[`repeating_sr6panzerung_${row.rowId}_${field.checkbox}`])
        );
        const preferredRow =
          preferredSelection && preferredSelection.checkbox === field.checkbox
            ? selectedRows.find((row) => row.rowId === preferredSelection.rowId) || null
            : null;
        const selectedRow = preferredRow || selectedRows[0] || null;

        if (selectedRows.length > 1) {
          selectedRows.forEach((row) => {
            if (!selectedRow || row.rowId === selectedRow.rowId) {
              return;
            }
            updates[`repeating_sr6panzerung_${row.rowId}_${field.checkbox}`] = "0";
          });
        }

        updates[field.key] = String(selectedRow ? selectedRow.verteidigungswert : 0);
        updates[field.nameKey] = selectedRow ? selectedRow.name : "";
      });

      setAttrsSilent(updates, callback);
    });
  });
}
// END MODULE: workers/compute/combat


function parseCombatPrimaryWeaponSelectionEvent(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^(repeating_(sr6fernkampfwaffen|sr6nahkampfwaffen))_([^_]+)_(sr6_(fernkampf|nahkampf)_ist_primaer)$/);

  if (!match) {
    return null;
  }

  return {
    section: match[1],
    rowId: match[3],
    checkbox: match[4],
  };
}

function syncCombatPrimaryWeaponSelection(selectionConfig, callback, eventInfo) {
  getSectionIDs(selectionConfig.section, (sectionIds) => {
    const orderedIds = sectionIds || [];
    const requestKeys = [];
    const preferredSelection = parseCombatPrimaryWeaponSelectionEvent(eventInfo);

    orderedIds.forEach((rowId) => {
      requestKeys.push(`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`);
      Object.keys(selectionConfig.targetMap).forEach((targetKey) => {
        requestKeys.push(`${selectionConfig.section}_${rowId}_${selectionConfig.targetMap[targetKey]}`);
      });
    });

    getAttrs(requestKeys, (values) => {
      const updates = {};
      const selectedRows = orderedIds.filter((rowId) =>
        isCheckedValue(values[`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`])
      );
      const preferredRow =
        preferredSelection &&
        preferredSelection.section === selectionConfig.section &&
        preferredSelection.checkbox === selectionConfig.roleAttr
          ? selectedRows.find((rowId) => rowId === preferredSelection.rowId) || null
          : null;
      const selectedRowId = preferredRow || selectedRows[0] || null;

      if (selectedRows.length > 1) {
        selectedRows.forEach((rowId) => {
          if (!selectedRowId || rowId === selectedRowId) {
            return;
          }
          updates[`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`] = "0";
        });
      }

      Object.keys(selectionConfig.defaults).forEach((targetKey) => {
        updates[targetKey] = selectionConfig.defaults[targetKey];
      });

      if (selectedRowId) {
        Object.keys(selectionConfig.targetMap).forEach((targetKey) => {
          const sourceKey = `${selectionConfig.section}_${selectedRowId}_${selectionConfig.targetMap[targetKey]}`;
          const fallbackValue = selectionConfig.defaults[targetKey];
          const resolvedValue = values[sourceKey];
          updates[targetKey] = resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === ""
            ? fallbackValue
            : `${resolvedValue}`;
        });
      }

      setAttrsSilent(updates, callback);
    });
  });
}

function syncCombatPrimaryWeapons(callback, eventInfo) {
  syncCombatPrimaryWeaponSelection(SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS[0], () => {
    syncCombatPrimaryWeaponSelection(SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS[1], callback, eventInfo);
  }, eventInfo);
}

// BEGIN MODULE: workers/compute/magic
function appendMagicRequestKeys(requestKeys) {
  requestKeys.push("sr6_magic_traditionsattribut_1");
  requestKeys.push("sr6_magic_traditionsattribut_2");
}

function computeMagicDerived(values, totals, skillTotals, updates) {
  updates.sr6_magic_magie = String(totals.magie_resonanz || 0);
  updates.sr6_magic_zauberpool = String(skillTotals.hexerei || 0);
  updates.sr6_magic_spruchzauberei = String(
    parseNumber(updates.sr6_magic_magie) + parseNumber(updates.sr6_magic_zauberpool)
  );
  updates.sr6_magic_waffenloser_kampf = String((skillTotals.astral || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_waffenfoki = String((skillTotals.nahkampf || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_astrale_verteidigung = String((totals.logik || 0) + (totals.intuition || 0));
  updates.sr6_magic_astraler_schadenswiderstand = String(totals.willenskraft || 0);
  updates.sr6_magic_astrale_initiative = String((totals.logik || 0) + (totals.intuition || 0));

  const traditionKey1 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_1);
  const traditionKey2 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_2);
  const traditionValue1 = traditionKey1 ? (totals[traditionKey1] || 0) : 0;
  const traditionValue2 = traditionKey2 ? (totals[traditionKey2] || 0) : 0;

  updates.sr6_magic_entzug_widerstand = String(traditionValue1 + traditionValue2);
  updates.sr6_magic_astralkampf_angriffswert = String((totals.magie_resonanz || 0) + traditionValue1);
  updates.sr6_magic_astralkampf_verteidigungswert = String(totals.intuition || 0);
}
// END MODULE: workers/compute/magic

// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
  });
}

function computeMatrixTotals(values, updates) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/matrix

// BEGIN MODULE: workers/compute/rigging
// Rigging-Compute-Slot.
// Aktuell werden im Rigging-Tab keine automatischen Derived-Werte gesetzt,
// da die angezeigten Kernwerte als direkte Eingaben gefuehrt werden.
function computeRiggingDerived(_values, _totals, _skillTotals, _updates) {
  // bewusst leer
}
// END MODULE: workers/compute/rigging

// END BLOCK: Worker Includes (compute)

// BEGIN BLOCK: Worker Includes (ui)
// BEGIN MODULE: workers/ui/defaults
function resetTabToAllgemeinOnOpen() {
  setAttrsSilent({ sr6_daten_tab: "allgemein" });
}

function getEditModeResetPayload() {
  const payload = {
    sr6_allgemein_attribute_edit_mode: "0",
    sr6_allgemein_initiative_edit_mode: "0",
    sr6_allgemein_fertigkeiten_view: "fertigkeiten",
    sr6_fertigkeiten_edit_mode: "0",
    sr6_allgemein_kampf_edit_mode: "0",
    sr6_allgemein_verteidigung_edit_mode: "0",
    sr6_allgemein_schadenswiderstand_edit_mode: "0",
    sr6_magic_zauber_edit_mode: "0",
    sr6_magic_adeptenkraefte_edit_mode: "0",
    sr6_magic_foki_edit_mode: "0",
    sr6_magic_metamagie_edit_mode: "0",
    sr6_magic_rituale_edit_mode: "0",
    sr6_magic_geister_edit_mode: "0",
    sr6_matrix_programme_edit_mode: "0",
    sr6_matrix_geraete_edit_mode: "0",
    sr6_matrix_handlungen_edit_mode: "0",
    sr6_rigging_fahrzeuge_edit_mode: "0",
    sr6_rigging_programme_edit_mode: "0",
    sr6_rigging_zubehoer_edit_mode: "0",
    sr6_rigging_agenten_edit_mode: "0",
    sr6_rigging_manoever_edit_mode: "0",
    sr6_ausruestung_edit_mode: "0",
    sr6_cyberware_edit_mode: "0",
    sr6_bioware_edit_mode: "0",
    sr6_sin_edit_mode: "0",
    sr6_lebensstil_edit_mode: "0",
    sr6_setting_popup_mods: "eigen",
    sr6_roll_popup_open: "0",
    sr6_roll_popup_definition: "",
  };

  Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
    for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
      payload[`sr6_roll_popup_slot_${slot}_option_${optionSet}`] = "0";
      payload[`sr6_roll_popup_value_${slot}_select_${optionSet}`] = "";
    }
  });

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_number`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_text`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_select`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_requires_previous_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_label`] = "";
    payload[`sr6_roll_popup_value_${slot}_number`] = "0";
    payload[`sr6_roll_popup_value_${slot}_text`] = "";
    payload[`sr6_roll_popup_value_${slot}_checkbox`] = "0";
  }

  return payload;
}

function resetEditModesOnOpen() {
  setAttrsSilent(getEditModeResetPayload());
}
// END MODULE: workers/ui/defaults

// BEGIN MODULE: workers/ui/monitor-cascade
function buildMonitorKeys(prefix) {
  const keys = [];
  for (let index = 1; index <= 18; index += 1) {
    keys.push(`sr6_monitor_${prefix}_${index}`);
  }
  keys.push(`sr6_monitor_${prefix}_max`);
  return keys;
}

function parseMonitorEventSource(sourceAttribute) {
  const match = /^sr6_monitor_(koerperlich|geistig)_(\d+)$/.exec(sourceAttribute || "");
  if (!match) return null;
  return {
    prefix: match[1],
    index: clampNumber(parseNumber(match[2]), 1, 18),
  };
}

function applyMonitorCascade(prefix, index) {
  const monitorKeys = buildMonitorKeys(prefix);
  const monitorMaxKey = `sr6_monitor_${prefix}_max`;
  const sourceKey = `sr6_monitor_${prefix}_${index}`;

  getAttrs(monitorKeys, (values) => {
    const updates = {};
    const maxBoxes = clampNumber(parseNumber(values[monitorMaxKey]) || 18, 0, 18);
    const sourceChecked = isCheckedValue(values[sourceKey]);

    if (sourceChecked) {
      const fillTo = Math.min(index, maxBoxes);
      for (let currentIndex = 1; currentIndex <= fillTo; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (!isCheckedValue(values[key])) {
          updates[key] = "1";
        }
      }
    } else {
      for (let currentIndex = index; currentIndex <= 18; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (isCheckedValue(values[key])) {
          updates[key] = "0";
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      setAttrsSilent(updates, recomputeAll);
    }
  });
}

function registerMonitorCascadeEvents() {
  const events = [];
  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  on(events.join(" "), (eventInfo) => {
    const source = parseMonitorEventSource(eventInfo && eventInfo.sourceAttribute);
    if (!source) return;
    applyMonitorCascade(source.prefix, source.index);
  });
}
// END MODULE: workers/ui/monitor-cascade

// END BLOCK: Worker Includes (ui)

// BEGIN BLOCK: Worker Includes (register)
// BEGIN MODULE: workers/core/register
function recomputeAll() {
  const requestKeys = [];
  const updates = {};
  const totals = {};
  const skillTotals = {};

  appendAttributeRequestKeys(requestKeys);
  appendSkillRequestKeys(requestKeys);
  appendCombatRequestKeys(requestKeys);
  appendMatrixRequestKeys(requestKeys);
  appendMagicRequestKeys(requestKeys);
  appendHeaderMonitorRequestKeys(requestKeys);

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, updates);
    computeCombatDerivedFromAttributes(totals, values, updates, skillTotals);
    computeHeaderMonitorDerivedFromAttributes(totals, values, updates);
    computeMagicDerived(values, totals, skillTotals, updates);
    computeRiggingDerived(values, totals, skillTotals, updates);

    setAttrsSilent(updates);
  });
}

function buildRecalcEvents() {
  const events = [];

  SR6_ATTRIBUTES.forEach((attributeName) => {
    events.push(`change:sr6_attr_${attributeName}_grundwert`);
    events.push(`change:sr6_attr_${attributeName}_modifikator`);
  });

  SR6_SKILLS.forEach((skillName) => {
    events.push(`change:sr6_skill_${skillName}_grundwert`);
    events.push(`change:sr6_skill_${skillName}_modifikator`);
  });

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    events.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
    events.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
  });

  events.push("change:sr6_combat_verteidigungswert_modifikator");
  events.push("change:sr6_combat_primaere_panzerung");
  events.push("change:sr6_combat_sekundaere_panzerung");
  events.push("change:sr6_combat_helm");
  events.push("change:sr6_combat_schild");
  events.push("change:sr6_combat_fernkampfangriff_modifikator");
  events.push("change:sr6_combat_nahkampfangriff_modifikator");
  events.push("change:sr6_verteidigung_physisch_modifikator");
  events.push("change:sr6_schadenswiderstand_physisch_modifikator");
  events.push("change:sr6_combat_fernkampfangriff");
  events.push("change:sr6_combat_nahkampfangriff");
  events.push("change:sr6_verteidigung_physisch_gesamtwert");
  events.push("change:sr6_schadenswiderstand_physisch_gesamtwert");

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_traditionsattribut_2");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), recomputeAll);
  on(
    [
      "change:repeating_sr6panzerung:sr6_panzerung_ist_primaer",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_sekundaer",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_helm",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_schild",
      "change:repeating_sr6panzerung:sr6_panzerung_name",
      "change:repeating_sr6panzerung:sr6_panzerung_verteidigungswert",
      "remove:repeating_sr6panzerung",
    ].join(" "),
    (eventInfo) => {
      syncCombatArmorSelections(recomputeAll, eventInfo);
    }
  );
  on(
    [
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_ist_primaer",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampfwaffe",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_schaden",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_munition",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_modus",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_s_nah",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_nah",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_mittel",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_weit",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_s_weit",
      "remove:repeating_sr6fernkampfwaffen",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_ist_primaer",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampfwaffe",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schaden",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_mittel",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_weit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_weit",
      "remove:repeating_sr6nahkampfwaffen",
    ].join(" "),
    (eventInfo) => {
      syncCombatPrimaryWeapons(recomputeAll, eventInfo);
    }
  );
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToAllgemeinOnOpen();
    resetEditModesOnOpen();
    syncCombatArmorSelections(() => {
      syncCombatPrimaryWeapons(recomputeAll);
    });
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register

// END BLOCK: Worker Includes (register)
