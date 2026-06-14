// BEGIN BLOCK: Worker Includes (core)
// BEGIN MODULE: workers/core/constants
// Attribute keys are the canonical worker-side identifiers.
// Each key maps to sr6_attr_<key>_{grundwert,modifikator,gesamtwert}.
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

// Skill keys drive automatic skill total calculation and generic skill roll definitions.
// Keep these in sync with the static skill fields in the Attribute & Fertigkeiten tab.
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

// Matrix action keys are used to generate derived probe/defense attributes and change listeners.
// The order here is the canonical processing order; the visual order can still be handled in HTML/CSS.
const SR6_MATRIX_ACTIONS = [
  "ausstoepseln",
  "befehl_vortaeuschen",
  "bedrohungsanalyse",
  "brute_force",
  "cyberware_kontrollieren",
  "datei_cracken",
  "datei_editieren",
  "datei_verschluesseln",
  "datenbombe_entschaerfen",
  "datenbombe_legen",
  "datenspike",
  "dienstverweigerung",
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
  "stoersender_lokalisieren",
  "suendenbock",
  "teergrube",
  "uebertragung_abfangen",
  "verstecken",
  "verzoegerter_befehl",
  "virtuelles_zielen",
  "volle_matrixabwehr"
];

// Rule mapping for Matrix actions.
//
// Supported component fields:
// - skill: key from SR6_SKILLS, resolved as Grundwert + Modifikator during rolls.
// - attribute: key from SR6_ATTRIBUTES, resolved as Grundwert + Modifikator during rolls.
// - matrix/matrixSecond: Matrix core values such as Angriff, Schleicher, Datenverarbeitung, Firewall.
// - multiplier: multiplies the referenced matrix value, e.g. Firewall x2.
// - linkedMatrixAttribute: informational Matrix attribute used by the action, shown in roll output.
// - specialization: informational specialization requirement/hint for roll output.
// - target: external value that is not stored on the acting character, e.g. a target device Pilot.
//
// Defense type notes:
// - choice: player can select one calculated defense option.
// - none: no rollable defense.
// - description: rule needs text/context rather than an automatic pool.
// - fixed_formula: formula is known, but at least one part may not be automatically resolvable yet.
const SR6_MATRIX_ACTION_RULES = {
  ausstoepseln: {
    probe: { label: "Elektronik + Willenskraft", skill: "elektronik", attribute: "willenskraft" },
    defense: {
      type: "choice",
      options: [
        { label: "Charisma + Datenverarbeitung", attribute: "charisma", matrix: "datenverarbeitung" },
        { label: "Angriff + Datenverarbeitung", matrix: "angriff", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  bedrohungsanalyse: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  befehl_vortaeuschen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Pilot + Firewall", target: "pilot", matrix: "firewall" },
      ],
    },
  },
  brute_force: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  cyberware_kontrollieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "fixed_formula", label: "Willenskraft + Firewall + Cyberware-Geraetestufe" },
  },
  datei_cracken: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  datei_editieren: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Firewall", attribute: "intuition", matrix: "firewall" },
        { label: "Schleicher + Firewall", matrix: "schleicher", matrixSecond: "firewall" },
      ],
    },
  },
  datei_verschluesseln: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  datenbombe_entschaerfen: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  datenbombe_legen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  datenspike: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
      ],
    },
  },
  dienstverweigerung: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  ersticken: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Schleicher", attribute: "intuition", matrix: "schleicher" },
        { label: "Schleicher x2", matrix: "schleicher", multiplier: 2 },
      ],
    },
  },
  garbage_in_garbage_out: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_formatieren: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_neu_starten: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_steuern: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraetesperre: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hineinspringen: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hintertuer_benutzen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hintertuer_mit_bekanntem_exploit_benutzen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  host_betreten_verlassen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  icon_aufspueren: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Schleicher", attribute: "willenskraft", matrix: "schleicher" },
        { label: "Firewall + Schleicher", matrix: "firewall", matrixSecond: "schleicher" },
      ],
    },
  },
  icon_modifizieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  icon_veraendern: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  infrastruktur_unterwandern: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Firewall", attribute: "intuition", matrix: "firewall" },
        { label: "Schleicher + Firewall", matrix: "schleicher", matrixSecond: "firewall" },
      ],
    },
  },
  interfacemodus_wechseln: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  kalibrierung: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  maskerade: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  matrixattribute_austauschen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  matrixsignatur_loeschen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  matrixsuche: {
    probe: { label: "Elektronik + Intuition", skill: "elektronik", attribute: "intuition" },
    defense: { type: "none" },
  },
  matrixwahrnehmung: {
    probe: { label: "Elektronik + Intuition", skill: "elektronik", attribute: "intuition" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Schleicher", attribute: "willenskraft", matrix: "schleicher" },
        { label: "Firewall + Schleicher", matrix: "firewall", matrixSecond: "schleicher" },
      ],
    },
  },
  mittelsmetamensch: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  nachricht_uebermitteln: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  overwatch_wert_bestimmen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  pop_up: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  programm_abstuerzen_lassen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "fixed_formula", label: "Datenverarbeitung + Geraetestufe" },
  },
  pruefsummensuche: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  signal_stoeren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  sondieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  stalking: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  stoersender_lokalisieren: {
    probe: { label: "Cracken (Elektronische Kriegsfuehrung) + Logik", skill: "cracken", attribute: "logik", specialization: "Elektronische Kriegsfuehrung" },
    defense: { type: "description" },
  },
  suendenbock: {
    probe: { label: "Cracken + Schleicher", skill: "cracken", matrix: "schleicher" },
    defense: { type: "fixed_formula", label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
  },
  teergrube: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
      ],
    },
  },
  uebertragung_abfangen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
      ],
    },
  },
  verstecken: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  verzoegerter_befehl: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Pilot + Firewall", target: "pilot", matrix: "firewall" },
      ],
    },
  },
  virtuelles_zielen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  volle_matrixabwehr: {
    probe: { type: "description" },
    defense: { type: "none" },
  },
};
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
// BEGIN MODULE: workers/rolls/definitions/shared.js
// Geteilte Konstanten fuer Rolltitel, Standard-Reihenfolge und Popup-Slots.
const SR6_ROLL_TITLE_PREFIXES = [
  { prefix: "sr6_combat_", title: "Kampf" },
  { prefix: "sr6_fernkampf_", title: "Fernkampfwaffen" },
  { prefix: "sr6_nahkampf_", title: "Nahkampfwaffen" },
  { prefix: "sr6_matrix_handlung_", title: "Matrix-Handlungen" },
  { prefix: "sr6_rigging_fahrzeug_", title: "Rigging-Fahrzeuge" },
  { prefix: "sr6_attrprobe_", title: "Attributsproben" },
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
  { prefix: "sr6_ausruestung_", title: "Ausrüstung" },
];

const SR6_DEFAULT_ROLL_ROW_ORDER = [
  "Attribut",
  "Fertigkeit",
  "Sprachniveau",
  "Sprachbonus",
  "Hinweis",
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

const SR6_POPUP_FIELD_SLOT_COUNT = 11;
const SR6_EDGE_BOOST_POPUP_SLOT = 9;
const SR6_FATE_DICE_POPUP_SLOT = 10;
const SR6_MATRIX_LONER_POPUP_SLOT = 11;
// END MODULE: workers/rolls/definitions/shared.js

// BEGIN MODULE: workers/rolls/definitions/popup-options.js
// Dropdown-Optionen fuer das Roll-Popup, inklusive Modifikatoren, Munition, Matrixzugriff, Geistertypen und Edge-Boosts.
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
    { value: "Fläche", label: "Fläche", rowValue: "Fläche" },
    { value: "Spezial", label: "Spezial", rowValue: "Spezial" },
  ],
  spirit_type: [
    { value: "Erdgeister", label: "Erdgeister", rowValue: "Erdgeister" },
    { value: "Feuergeister", label: "Feuergeister", rowValue: "Feuergeister" },
    { value: "Luftgeister", label: "Luftgeister", rowValue: "Luftgeister" },
    { value: "Geister des Menschen", label: "Geister des Menschen", rowValue: "Geister des Menschen" },
    { value: "Geister des Tieres", label: "Geister des Tieres", rowValue: "Geister des Tieres" },
    { value: "Wassergeister", label: "Wassergeister", rowValue: "Wassergeister" },
    { value: "Beschützergeister", label: "Beschützergeister", rowValue: "Beschützergeister" },
    { value: "Helfergeister", label: "Helfergeister", rowValue: "Helfergeister" },
    { value: "Pflanzengeister", label: "Pflanzengeister", rowValue: "Pflanzengeister" },
    { value: "Ratgebergeister", label: "Ratgebergeister", rowValue: "Ratgebergeister" },
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
  skill_attr_intuition_willenskraft: [
    { value: "Intuition", label: "Intuition", rowValue: "Intuition" },
    { value: "Willenskraft", label: "Willenskraft", rowValue: "Willenskraft" },
  ],
  skill_attr_geschicklichkeit_staerke: [
    { value: "Geschicklichkeit", label: "Geschicklichkeit", rowValue: "Geschicklichkeit" },
    { value: "Stärke", label: "Stärke", rowValue: "Stärke" },
  ],
  skill_attr_magie: [
    { value: "Magie", label: "Magie", rowValue: "Magie" },
  ],
  skill_attr_logik_intuition: [
    { value: "Logik", label: "Logik", rowValue: "Logik" },
    { value: "Intuition", label: "Intuition", rowValue: "Intuition" },
  ],
  skill_attr_logik: [
    { value: "Logik", label: "Logik", rowValue: "Logik" },
  ],
  skill_attr_charisma_logik: [
    { value: "Charisma", label: "Charisma", rowValue: "Charisma" },
    { value: "Logik", label: "Logik", rowValue: "Logik" },
  ],
  skill_attr_geschicklichkeit: [
    { value: "Geschicklichkeit", label: "Geschicklichkeit", rowValue: "Geschicklichkeit" },
  ],
  skill_attr_logik_geschicklichkeit_intuition: [
    { value: "Logik", label: "Logik", rowValue: "Logik" },
    { value: "Geschicklichkeit", label: "Geschicklichkeit", rowValue: "Geschicklichkeit" },
    { value: "Intuition", label: "Intuition", rowValue: "Intuition" },
  ],
  skill_attr_intuition: [
    { value: "Intuition", label: "Intuition", rowValue: "Intuition" },
  ],
  skill_attr_intuition_logik: [
    { value: "Intuition", label: "Intuition", rowValue: "Intuition" },
    { value: "Logik", label: "Logik", rowValue: "Logik" },
  ],
  skill_attr_reaktion: [
    { value: "Reaktion", label: "Reaktion", rowValue: "Reaktion" },
  ],
  skill_attr_resonanz: [
    { value: "Resonanz", label: "Resonanz", rowValue: "Resonanz" },
  ],
  skill_attr_charisma: [
    { value: "Charisma", label: "Charisma", rowValue: "Charisma" },
  ],
  edge_boost: [
    { value: "none", label: "Kein Edge-Boost", rowValue: "Kein Edge-Boost" },
    { value: "edge_attribute", label: "Edge-Attribut zum Pool (4 Edge)", rowValue: "Edge-Attribut zum Pool (4 Edge)" },
    { value: "fate_1", label: "Jetzt erst recht: 1 Schicksalswürfel (2 Edge)", rowValue: "Jetzt erst recht: 1 Schicksalswürfel (2 Edge)" },
    { value: "fate_2", label: "Jetzt erst recht: 2 Schicksalswürfel (4 Edge)", rowValue: "Jetzt erst recht: 2 Schicksalswürfel (4 Edge)" },
    { value: "fate_3", label: "Jetzt erst recht: 3 Schicksalswürfel (6 Edge)", rowValue: "Jetzt erst recht: 3 Schicksalswürfel (6 Edge)" },
  ],
  edge_after_boost: [
    { value: "reroll_1", label: "Nach dem Wurf: 1 Würfel neu (1 Edge)", rowValue: "Nach dem Wurf: 1 Würfel neu (1 Edge)" },
    { value: "add_1", label: "Nach dem Wurf: +1 auf einen Würfel (2 Edge)", rowValue: "Nach dem Wurf: +1 auf einen Würfel (2 Edge)" },
    { value: "reroll_failures", label: "Nach dem Wurf: Misserfolge neu (4 Edge)", rowValue: "Nach dem Wurf: Misserfolge neu (4 Edge)" },
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
// END MODULE: workers/rolls/definitions/popup-options.js

// BEGIN MODULE: workers/rolls/definitions/equipment.js
// Datenquellen fuer Ausruestungsbezug: welche Attribute und Fertigkeiten im Ausruestungs-Dropdown ausgewaehlt werden koennen.
const SR6_EQUIPMENT_SOURCE_OPTIONS = {
  "attr:konstitution": { label: "Konstitution", type: "Attribut", attr: "sr6_attr_konstitution_gesamtwert" },
  "attr:geschicklichkeit": { label: "Geschicklichkeit", type: "Attribut", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
  "attr:reaktion": { label: "Reaktion", type: "Attribut", attr: "sr6_attr_reaktion_gesamtwert" },
  "attr:staerke": { label: "Stärke", type: "Attribut", attr: "sr6_attr_staerke_gesamtwert" },
  "attr:willenskraft": { label: "Willenskraft", type: "Attribut", attr: "sr6_attr_willenskraft_gesamtwert" },
  "attr:logik": { label: "Logik", type: "Attribut", attr: "sr6_attr_logik_gesamtwert" },
  "attr:intuition": { label: "Intuition", type: "Attribut", attr: "sr6_attr_intuition_gesamtwert" },
  "attr:charisma": { label: "Charisma", type: "Attribut", attr: "sr6_attr_charisma_gesamtwert" },
  "attr:edge": { label: "Edge", type: "Attribut", attr: "sr6_attr_edge_gesamtwert" },
  "attr:magie_resonanz": { label: "Magie/Resonanz", type: "Attribut", attr: "sr6_attr_magie_resonanz_gesamtwert" },
  "skill:astral": { label: "Astral", type: "Fertigkeit", attr: "sr6_skill_astral_gesamtwert" },
  "skill:athletik": { label: "Athletik", type: "Fertigkeit", attr: "sr6_skill_athletik_gesamtwert" },
  "skill:beschwoeren": { label: "Beschwören", type: "Fertigkeit", attr: "sr6_skill_beschwoeren_gesamtwert" },
  "skill:biotech": { label: "Biotech", type: "Fertigkeit", attr: "sr6_skill_biotech_gesamtwert" },
  "skill:cracken": { label: "Cracken", type: "Fertigkeit", attr: "sr6_skill_cracken_gesamtwert" },
  "skill:einfluss": { label: "Einfluss", type: "Fertigkeit", attr: "sr6_skill_einfluss_gesamtwert" },
  "skill:elektronik": { label: "Elektronik", type: "Fertigkeit", attr: "sr6_skill_elektronik_gesamtwert" },
  "skill:exotische_waffen": { label: "Exotische Waffen", type: "Fertigkeit", attr: "sr6_skill_exotische_waffen_gesamtwert" },
  "skill:feuerwaffen": { label: "Feuerwaffen", type: "Fertigkeit", attr: "sr6_skill_feuerwaffen_gesamtwert" },
  "skill:heimlichkeit": { label: "Heimlichkeit", type: "Fertigkeit", attr: "sr6_skill_heimlichkeit_gesamtwert" },
  "skill:hexerei": { label: "Hexerei", type: "Fertigkeit", attr: "sr6_skill_hexerei_gesamtwert" },
  "skill:mechanik": { label: "Mechanik", type: "Fertigkeit", attr: "sr6_skill_mechanik_gesamtwert" },
  "skill:nahkampf": { label: "Nahkampf", type: "Fertigkeit", attr: "sr6_skill_nahkampf_gesamtwert" },
  "skill:natur": { label: "Natur", type: "Fertigkeit", attr: "sr6_skill_natur_gesamtwert" },
  "skill:steuern": { label: "Steuern", type: "Fertigkeit", attr: "sr6_skill_steuern_gesamtwert" },
  "skill:tasken": { label: "Tasken", type: "Fertigkeit", attr: "sr6_skill_tasken_gesamtwert" },
  "skill:ueberreden": { label: "Überreden", type: "Fertigkeit", attr: "sr6_skill_ueberreden_gesamtwert" },
  "skill:verzaubern": { label: "Verzaubern", type: "Fertigkeit", attr: "sr6_skill_verzaubern_gesamtwert" },
  "skill:wahrnehmung": { label: "Wahrnehmung", type: "Fertigkeit", attr: "sr6_skill_wahrnehmung_gesamtwert" },
};

function getEquipmentSourceOption(sourceKey) {
  return SR6_EQUIPMENT_SOURCE_OPTIONS[`${sourceKey || ""}`.trim()] || null;
}

function getEquipmentSourceAttributeRefs() {
  return Object.keys(SR6_EQUIPMENT_SOURCE_OPTIONS)
    .map((sourceKey) => SR6_EQUIPMENT_SOURCE_OPTIONS[sourceKey].attr)
    .filter((attr) => !!attr);
}
// END MODULE: workers/rolls/definitions/equipment.js

// BEGIN MODULE: workers/rolls/definitions/rigging.js
// Attributliste, die fuer Fahrzeug-/Drohnenproben gesammelt werden muss, bevor der Pool berechnet werden kann.
const SR6_RIGGING_VEHICLE_ROLL_ATTRIBUTES = [
  "sr6_attr_reaktion_gesamtwert",
  "sr6_attr_geschicklichkeit_gesamtwert",
  "sr6_attr_intuition_gesamtwert",
  "sr6_attr_logik_gesamtwert",
  "sr6_skill_steuern_gesamtwert",
  "sr6_skill_mechanik_gesamtwert",
  "sr6_skill_mechanik_spezialisierung",
  "sr6_skill_mechanik_expertise",
  "sr6_skill_heimlichkeit_gesamtwert",
  "sr6_skill_wahrnehmung_gesamtwert",
  "sr6_rigging_fahrzeug_probe",
  "sr6_rigging_fahrzeug_modus",
  "sr6_rigging_fahrzeug_rumpf",
  "sr6_rigging_fahrzeug_panzerung",
  "sr6_rigging_fahrzeug_pilot",
  "sr6_rigging_fahrzeug_sensor",
  "sr6_rigging_fahrzeug_agentenstufe",
  "sr6_rigging_fahrzeug_riggerkontrolle",
  "sr6_rigging_fahrzeug_manoevrieren",
  "sr6_rigging_fahrzeug_zielerfassung",
  "sr6_rigging_fahrzeug_ausweichen",
  "sr6_rigging_fahrzeug_stealth",
  "sr6_rigging_fahrzeug_clearsight",
  "sr6_rigging_fahrzeug_angriffswert",
  "sr6_rigging_fahrzeug_verteidigungswert",
  "sr6_rigging_fahrzeug_zustandsmonitor",
  "sr6_rigging_fahrzeug_waffe_probe_wert",
  "sr6_rigging_fahrzeug_waffe_name",
  "sr6_rigging_fahrzeug_waffe",
  "sr6_rigging_fahrzeug_waffe_schaden",
  "sr6_rigging_fahrzeug_waffe_modus",
  "sr6_rigging_fahrzeug_waffe_s_nah",
  "sr6_rigging_fahrzeug_waffe_nah",
  "sr6_rigging_fahrzeug_waffe_mittel",
  "sr6_rigging_fahrzeug_waffe_weit",
  "sr6_rigging_fahrzeug_waffe_s_weit",
];
// END MODULE: workers/rolls/definitions/rigging.js

// BEGIN MODULE: workers/rolls/definitions/skills.js
// Regelwerksnahe Attributzuordnung fuer Aktionsfertigkeiten: Standardattribut und alternative Popup-Auswahl.
const SR6_SKILL_ATTRIBUTE_CONFIGS = {
  astral: {
    optionSet: "skill_attr_intuition_willenskraft",
    defaultValue: "Intuition",
    options: [
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
      { value: "Willenskraft", attr: "sr6_attr_willenskraft_gesamtwert" },
    ],
  },
  athletik: {
    optionSet: "skill_attr_geschicklichkeit_staerke",
    defaultValue: "Geschicklichkeit",
    options: [
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { value: "Stärke", attr: "sr6_attr_staerke_gesamtwert" },
    ],
  },
  beschwoeren: {
    optionSet: "skill_attr_magie",
    defaultValue: "Magie",
    options: [
      { value: "Magie", attr: "sr6_attr_magie_resonanz_gesamtwert" },
    ],
  },
  biotech: {
    optionSet: "skill_attr_logik_intuition",
    defaultValue: "Logik",
    options: [
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
    ],
  },
  cracken: {
    optionSet: "skill_attr_logik",
    defaultValue: "Logik",
    options: [
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
    ],
  },
  einfluss: {
    optionSet: "skill_attr_charisma_logik",
    defaultValue: "Charisma",
    options: [
      { value: "Charisma", attr: "sr6_attr_charisma_gesamtwert" },
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
    ],
  },
  elektronik: {
    optionSet: "skill_attr_logik_intuition",
    defaultValue: "Logik",
    options: [
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
    ],
  },
  exotische_waffen: {
    optionSet: "skill_attr_geschicklichkeit",
    defaultValue: "Geschicklichkeit",
    options: [
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
    ],
  },
  feuerwaffen: {
    optionSet: "skill_attr_geschicklichkeit",
    defaultValue: "Geschicklichkeit",
    options: [
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
    ],
  },
  heimlichkeit: {
    optionSet: "skill_attr_geschicklichkeit",
    defaultValue: "Geschicklichkeit",
    options: [
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
    ],
  },
  hexerei: {
    optionSet: "skill_attr_magie",
    defaultValue: "Magie",
    options: [
      { value: "Magie", attr: "sr6_attr_magie_resonanz_gesamtwert" },
    ],
  },
  mechanik: {
    optionSet: "skill_attr_logik_geschicklichkeit_intuition",
    defaultValue: "Logik",
    options: [
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
    ],
  },
  nahkampf: {
    optionSet: "skill_attr_geschicklichkeit",
    defaultValue: "Geschicklichkeit",
    options: [
      { value: "Geschicklichkeit", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
    ],
  },
  natur: {
    optionSet: "skill_attr_intuition",
    defaultValue: "Intuition",
    options: [
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
    ],
  },
  steuern: {
    optionSet: "skill_attr_reaktion",
    defaultValue: "Reaktion",
    options: [
      { value: "Reaktion", attr: "sr6_attr_reaktion_gesamtwert" },
    ],
  },
  tasken: {
    optionSet: "skill_attr_resonanz",
    defaultValue: "Resonanz",
    options: [
      { value: "Resonanz", attr: "sr6_attr_magie_resonanz_gesamtwert" },
    ],
  },
  ueberreden: {
    optionSet: "skill_attr_charisma",
    defaultValue: "Charisma",
    options: [
      { value: "Charisma", attr: "sr6_attr_charisma_gesamtwert" },
    ],
  },
  verzaubern: {
    optionSet: "skill_attr_magie",
    defaultValue: "Magie",
    options: [
      { value: "Magie", attr: "sr6_attr_magie_resonanz_gesamtwert" },
    ],
  },
  wahrnehmung: {
    optionSet: "skill_attr_intuition_logik",
    defaultValue: "Intuition",
    options: [
      { value: "Intuition", attr: "sr6_attr_intuition_gesamtwert" },
      { value: "Logik", attr: "sr6_attr_logik_gesamtwert" },
    ],
  },
};
// END MODULE: workers/rolls/definitions/skills.js

// BEGIN MODULE: workers/rolls/definitions/popup-fields.js
// Gemeinsame Popup-Feldgruppen, die von mehreren Roll-Definitionen wiederverwendet werden.
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

function createRiggingVehiclePopupFields() {
  return [
    ...SR6_DEFAULT_POPUP_FIELDS,
    {
      id: "ammo_context",
      slot: 2,
      label: "Munition",
      type: "select",
      optionSet: "ammo",
      sourceAttr: "sr6_rigging_fahrzeug_waffe_munition",
      affects: ["attack_value", "damage"],
      includeInTemplate: true,
      defaultValue: "Standard",
      visibleWhenField: "Probe",
      visibleWhenValue: "weapon_attack",
    },
  ];
}
// END MODULE: workers/rolls/definitions/popup-fields.js

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

// BEGIN MODULE: workers/rolls/definitions/core.js
// Basis-Definitionen fuer generische Initiative-, Attributs- und Attributspaar-Proben.
const SR6_ROLL_DEFINITIONS_CORE = [
{
    id: "initiative",
    ...createInitiativeProbeDefinition({
      titleFallback: "Initiative",
    }),
  },
{
    id: "attribute_pair",
    ...createAttributeProbeDefinition({
      matchField: "Attributsprobe",
      matchPoolPrefix: "sr6_attrprobe_",
      titleField: "Attributsprobe",
      primaryFields: ["Attributsprobe"],
      extraFields: ["Formel", "Fertigkeit"],
      popupFields: SR6_DEFAULT_POPUP_FIELDS,
      titleFallback: "Attributsproben",
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
];
// END MODULE: workers/rolls/definitions/core.js

// BEGIN MODULE: workers/rolls/definitions/skills-rolls.js
// Roll-Definitionen fuer Fertigkeiten, Wissens-/Sprachfelder, Talentsofts und Wissens-/Sprachsofts.
const SR6_ROLL_DEFINITIONS_SKILLS = [
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
      extraFields: ["Sprachniveau", "Sprachbonus", "Hinweis"],
      titleFallback: "Sprachfertigkeiten",
    }),
  },
{
    id: "talentsoft_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_talentsoft_",
      extraFields: ["Attribut", "Stufe", "Modifikator", "Hinweis"],
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
...SR6_SKILLS.map((skillKey) => ({
    id: `skill_${skillKey}`,
    ...createSkillProbeDefinition({
      matchPoolPrefix: `sr6_skill_${skillKey}_`,
      skillKey: skillKey,
      skillAttributeConfig: SR6_SKILL_ATTRIBUTE_CONFIGS[skillKey],
      titleFallback: "Fertigkeiten",
    }),
  })),
{
    id: "generic_skill",
    ...createSkillProbeDefinition({
      titleFallback: "Fertigkeiten",
    }),
  },
];
// END MODULE: workers/rolls/definitions/skills-rolls.js

// BEGIN MODULE: workers/rolls/definitions/equipment-rolls.js
// Roll-Definition fuer Ausruestungsproben mit optionalem Attribut-/Fertigkeitsbezug.
const SR6_ROLL_DEFINITIONS_EQUIPMENT = [
{
    id: "equipment",
    probeModel: "equipment_probe",
    matchField: "Ausrüstung",
    matchPoolPrefix: "sr6_ausruestung_",
    titleMode: "field-short",
    titleField: "Ausrüstung",
    primaryFields: ["Ausrüstung"],
    extraFields: ["Stufe"],
    popupFields: createEquipmentPopupFields(),
    internalFields: ["Auswahl"],
    titleFallback: "Ausrüstung",
  },
];
// END MODULE: workers/rolls/definitions/equipment-rolls.js

// BEGIN MODULE: workers/rolls/definitions/magic.js
// Roll-Definitionen fuer Magie: Zauber, Beschwoeren, Magie-Kernwerte und astrale Verteidigungs-/Widerstandsproben.
const SR6_ROLL_DEFINITIONS_MAGIC = [
{
    id: "spell",
    probeModel: "spell_probe",
    matchField: "",
    matchPoolPrefix: "sr6_magic_spruchzauberei",
    titleMode: "fixed",
    primaryFields: ["Zauber"],
    extraFields: ["Art", "Reichweite", "Dauer", "Entzug", "Schaden", "Notiz"],
    templateVariant: "spell",
    contextFields: [
      { label: "Entzugwiderstand", attr: "sr6_magic_entzug_widerstand" },
    ],
    fixedTitle: "Spruchzauberei",
    popupFields: createSpellPopupFields(),
    titleFallback: "Zauber",
  },
{
    id: "summoning",
    probeModel: "summoning_probe",
    matchField: "",
    matchPoolPrefix: "sr6_magic_beschwoeren",
    titleMode: "fixed",
    primaryFields: ["Geist"],
    extraFields: ["Typ", "Stufe"],
    fixedTitle: "Beschwören",
    popupFields: createSummoningPopupFields(),
    titleFallback: "Geister",
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
];
// END MODULE: workers/rolls/definitions/magic.js

// BEGIN MODULE: workers/rolls/definitions/matrix.js
// Roll-Definitionen fuer Matrix-Kernwerte und Matrixhandlungen mit getrennter Probe und Verteidigung.
const SR6_ROLL_DEFINITIONS_MATRIX = [
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
    id: "matrix_comparison_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_matrix_",
      matchFieldValue: "Angriffswert",
      fixedTitle: "Matrix: Kernwerte",
      titleFallback: "Matrix: Kernwerte",
    }),
  },
{
    id: "matrix_defense_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_matrix_",
      matchFieldValue: "Verteidigungswert",
      fixedTitle: "Matrix: Kernwerte",
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
];
// END MODULE: workers/rolls/definitions/matrix.js

// BEGIN MODULE: workers/rolls/definitions/rigging-rolls.js
// Roll-Definitionen fuer Rigging-Kernwerte und Fahrzeuge/Drohnen inklusive Fahrzeugwaffen.
const SR6_ROLL_DEFINITIONS_RIGGING = [
{
    id: "rigging_comparison_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_rigging_",
      matchFieldValue: "Angriffswert",
      fixedTitle: "Rigging: Kernwerte",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
{
    id: "rigging_defense_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_rigging_",
      matchFieldValue: "Verteidigungswert",
      fixedTitle: "Rigging: Kernwerte",
      titleFallback: "Rigging: Kernwerte",
    }),
  },
{
    id: "rigging_vehicle",
    probeModel: "rigging_vehicle_probe",
    matchField: "Fahrzeug",
    matchPoolPrefix: "sr6_rigging_fahrzeug_",
    titleMode: "field-short",
    titleField: "Probe",
    primaryFields: ["Fahrzeug", "Probe"],
    extraFields: ["Modus"],
    popupFields: createRiggingVehiclePopupFields(),
    internalFields: ["Probe"],
    titleFallback: "Rigging-Fahrzeugprobe",
  },
{
    id: "rigging_value",
    ...createValueProbeDefinition({
      matchPoolPrefix: "sr6_rigging_",
      titleFallback: "Rigging: Kernwerte",
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
];
// END MODULE: workers/rolls/definitions/rigging-rolls.js

// BEGIN MODULE: workers/rolls/definitions/combat.js
// Roll-Definitionen fuer Kampf: Kernwerte, Waffenangriffe, Verteidigung, Schadenswiderstand und Kampfvergleichswerte.
const SR6_ROLL_DEFINITIONS_COMBAT = [
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
      { label: "Waffentyp", attr: "sr6_combat_nahkampf_waffentyp" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Reaktion-Wert", attr: "sr6_attr_reaktion_gesamtwert" },
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
    extraFields: ["Waffentyp", "Schadenswert", "Munition", "Reichweite", "Modus"],
    templateVariant: "weapon",
    contextFields: [
      { label: "Fertigkeit", attr: "sr6_combat_fernkampf_fertigkeit" },
    ],
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
    extraFields: ["Fertigkeit", "Attribut", "Waffentyp", "Schadenswert", "Schadenstyp", "Reichweite"],
    templateVariant: "weapon",
    contextFields: [
      { label: "Fertigkeit", attr: "sr6_combat_nahkampf_fertigkeit" },
      { label: "Attribut", attr: "sr6_combat_nahkampf_attribut" },
      { label: "Waffentyp", attr: "sr6_combat_nahkampf_waffentyp" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Reaktion-Wert", attr: "sr6_attr_reaktion_gesamtwert" },
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
    extraFields: ["Fertigkeit", "Schadenswert", "Munition", "Modus", "Reichweite"],
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
    extraFields: ["Fertigkeit", "Attribut", "Waffentyp", "Schadenswert", "Schadenstyp", "Reichweite"],
    templateVariant: "weapon",
    contextFields: [
      { label: "Fertigkeit", attr: "sr6_nahkampf_fertigkeit" },
      { label: "Attribut", attr: "sr6_nahkampf_attribut" },
      { label: "Waffentyp", attr: "sr6_nahkampf_waffentyp" },
      { label: "Geschicklichkeit-Wert", attr: "sr6_attr_geschicklichkeit_gesamtwert" },
      { label: "Stärke-Wert", attr: "sr6_attr_staerke_gesamtwert" },
      { label: "Reaktion-Wert", attr: "sr6_attr_reaktion_gesamtwert" },
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
    extraFields: ["Waffentyp", "Schadenswert", "Munition", "Reichweite", "Modus"],
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
];
// END MODULE: workers/rolls/definitions/combat.js

// BEGIN MODULE: workers/rolls/definitions/fallback.js
// Letztes Sicherheitsnetz fuer Rollbuttons, die noch keinem expliziten Probenmodell zugeordnet sind.
const SR6_ROLL_DEFINITIONS_FALLBACK = [
{
    id: "value",
    ...createValueProbeDefinition({
      titleFallback: "Probe",
    }),
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
// END MODULE: workers/rolls/definitions/fallback.js

// BEGIN MODULE: workers/rolls/definitions/validation.js
// Leichte Laufzeitpruefung der zusammengesetzten Roll-Definitionen, damit Strukturfehler im Worker sichtbar werden.
function validateRollDefinition(definition, index) {
  const warnings = [];
  if (!definition || typeof definition !== "object") {
    warnings.push(`Roll definition ${index} is not an object.`);
    return warnings;
  }
  if (!definition.id) {
    warnings.push(`Roll definition ${index} has no id.`);
  }
  if (!definition.titleFallback && !definition.fixedTitle) {
    warnings.push(`Roll definition ${definition.id || index} has no title fallback.`);
  }
  if (definition.popupFields && !Array.isArray(definition.popupFields)) {
    warnings.push(`Roll definition ${definition.id || index} has invalid popupFields.`);
  }
  return warnings;
}

function validateRollDefinitions(definitions) {
  const warnings = [];
  const seenIds = {};
  const list = Array.isArray(definitions) ? definitions : [];
  list.forEach((definition, index) => {
    validateRollDefinition(definition, index).forEach((warning) => warnings.push(warning));
    if (definition && definition.id) {
      if (seenIds[definition.id]) {
        warnings.push(`Duplicate roll definition id: ${definition.id}`);
      }
      seenIds[definition.id] = true;
    }
  });
  if (typeof console !== "undefined" && console.warn && warnings.length > 0) {
    warnings.forEach((warning) => console.warn(`[SR6 Roll Definition] ${warning}`));
  }
  return warnings;
}
// END MODULE: workers/rolls/definitions/validation.js

// BEGIN MODULE: workers/rolls/definitions/registry.js
// Setzt alle Domain-Definitionen in der Reihenfolge zusammen, in der der Resolver sie prueft.
const SR6_ROLL_DEFINITIONS = [
  ...SR6_ROLL_DEFINITIONS_CORE,
  ...SR6_ROLL_DEFINITIONS_SKILLS,
  ...SR6_ROLL_DEFINITIONS_EQUIPMENT,
  ...SR6_ROLL_DEFINITIONS_MAGIC,
  ...SR6_ROLL_DEFINITIONS_MATRIX,
  ...SR6_ROLL_DEFINITIONS_RIGGING,
  ...SR6_ROLL_DEFINITIONS_COMBAT,
  ...SR6_ROLL_DEFINITIONS_FALLBACK,
];

const SR6_ROLL_DEFINITION_VALIDATION_WARNINGS = validateRollDefinitions(SR6_ROLL_DEFINITIONS);
// END MODULE: workers/rolls/definitions/registry.js

// BEGIN MODULE: workers/rolls/definition-resolver
// Waehlt anhand von Button-Feldern und Pool-Attribut die passende Roll-Definition aus und baut daraus Popup-/Template-Metadaten.
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
    const fieldValueMatches =
      !definition.matchFieldValue ||
      `${fields[definition.matchField] || ""}`.trim() === `${definition.matchFieldValue}`.trim();
    const poolMatches = !definition.matchPoolPrefix || poolAttribute.startsWith(definition.matchPoolPrefix);
    if (fieldMatches && fieldValueMatches && poolMatches) {
      let score = 0;
      if (definition.matchPoolPrefix) score += 2;
      if (definition.matchField) score += 1;
      if (definition.matchFieldValue) score += 1;

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

function getRollPopupFields(definition, poolAttribute) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const baseFields = Array.isArray(resolvedDefinition.popupFields) && resolvedDefinition.popupFields.length > 0
    ? resolvedDefinition.popupFields
    : SR6_DEFAULT_POPUP_FIELDS;

  return addSharedPopupFields(baseFields, resolvedDefinition);
}

function getSkillProbeAttributeOptions(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const config = resolvedDefinition.skillAttributeConfig || {};
  return Array.isArray(config.options) ? config.options : [];
}

function resolveSkillProbeAttributeOption(definition, selectedValue) {
  const options = getSkillProbeAttributeOptions(definition);
  if (options.length === 0) return null;

  const normalizedValue = `${selectedValue || ""}`.trim();
  return options.find((option) => option.value === normalizedValue) || options[0];
}

function getRollAdditionalAttributes(definition) {
  const skillBaseAttributes = SR6_SKILLS.map((skillKey) => `sr6_skill_${skillKey}_grundwert`);
  const attributes = ["sr6_attr_edge_gesamtwert", ...skillBaseAttributes, ...getMagicRollAdditionalAttributes(definition)];
  getSkillProbeAttributeOptions(definition).forEach((option) => {
    if (option && option.attr) attributes.push(option.attr);
  });
  if (definition && definition.id === "equipment") {
    attributes.push(...getEquipmentSourceAttributeRefs());
  }
  if (definition && definition.id === "rigging_vehicle") {
    attributes.push(...SR6_RIGGING_VEHICLE_ROLL_ATTRIBUTES);
  }
  if (definition && definition.id === "matrix_action") {
    return [...new Set([...attributes, ...getMatrixActionRuleAttributeRefs(), ...getMatrixActionSelectionAttributeRefs()])];
  }
  return [...new Set(attributes)];
}

function getMatrixActionKeyFromPoolAttribute(poolAttribute) {
  const prefix = "sr6_matrix_handlung_";
  const suffixes = ["_grundwert", "_modifikator", "_gesamtwert", "_probe_wert", "_verteidigung_wert"];
  if (!poolAttribute || !poolAttribute.startsWith(prefix)) return "";

  const actionPart = poolAttribute.slice(prefix.length);
  for (let index = 0; index < suffixes.length; index += 1) {
    const suffix = suffixes[index];
    if (actionPart.endsWith(suffix)) {
      return actionPart.slice(0, -suffix.length);
    }
  }
  return actionPart;
}

function getMatrixActionRollModeFromPoolAttribute(poolAttribute) {
  if (!poolAttribute) return "probe";
  if (poolAttribute.endsWith("_verteidigung_wert")) return "defense";
  return "probe";
}

function getMatrixActionRule(actionKey) {
  return (SR6_MATRIX_ACTION_RULES && SR6_MATRIX_ACTION_RULES[actionKey]) || null;
}

function getMatrixRuleComponentAttr(component) {
  if (!component) return "";
  if (component.attribute) {
    return `sr6_attr_${component.attribute}_gesamtwert`;
  }
  if (component.skill) {
    return `sr6_skill_${component.skill}_gesamtwert`;
  }
  if (component.matrix) {
    return `sr6_matrix_${component.matrix}`;
  }
  return "";
}

function collectMatrixRuleComponentAttrs(component, attributes) {
  const directAttr = getMatrixRuleComponentAttr(component);
  if (directAttr) attributes.push(directAttr);
  if (component && component.attribute) {
    attributes.push(`sr6_attr_${component.attribute}_grundwert`);
    attributes.push(`sr6_attr_${component.attribute}_modifikator`);
  }
  if (component && component.skill) {
    attributes.push(`sr6_skill_${component.skill}_grundwert`);
    attributes.push(`sr6_skill_${component.skill}_modifikator`);
  }
  if (component && component.matrixSecond) {
    attributes.push(`sr6_matrix_${component.matrixSecond}`);
  }
}

function getMatrixActionRuleAttributeRefs() {
  const attributes = [];
  Object.keys(SR6_MATRIX_ACTION_RULES || {}).forEach((actionKey) => {
    const rule = SR6_MATRIX_ACTION_RULES[actionKey] || {};
    collectMatrixRuleComponentAttrs(rule.probe, attributes);
    const defense = rule.defense || {};
    if (Array.isArray(defense.options)) {
      defense.options.forEach((option) => collectMatrixRuleComponentAttrs(option, attributes));
    } else {
      collectMatrixRuleComponentAttrs(defense, attributes);
    }
  });
  return [...new Set(attributes)];
}

function getMatrixActionSelectionAttributeRefs() {
  return SR6_MATRIX_ACTIONS.map((actionKey) => `sr6_matrix_handlung_${actionKey}_verteidigung_auswahl`);
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

function buildPopupStateFromValues(values, definition, poolAttribute) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const popupRows = [];
  const selectedValues = {};
  let poolMod = 0;
  let attackValueMod = 0;
  let damageMod = 0;
  let drainMod = 0;
  let poolMultiplier = 1;
  const expertiseFieldIndex = popupFields.findIndex((field) => field && field.id === "expertise");
  const expertiseField = expertiseFieldIndex >= 0 ? popupFields[expertiseFieldIndex] : null;
  const expertiseChecked = expertiseField
    ? isCheckedValue(values[getPopupFieldValueAttr(expertiseField, expertiseFieldIndex)])
    : false;

  popupFields.forEach((field, index) => {
    const rawValue = values[getPopupFieldValueAttr(field, index)];
    const isNumberField = field.type === "number";
    const isTextField = field.type === "text";
    const isCheckboxField = field.type === "checkbox";
    const dependencySatisfied = !field.requiresCheckedSlot || isCheckedValue(values[`sr6_roll_popup_value_${field.requiresCheckedSlot}_checkbox`]);
    const checkboxChecked =
      dependencySatisfied &&
      isCheckboxField &&
      !(field.id === "specialization" && expertiseChecked)
        ? isCheckedValue(rawValue)
        : false;
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
    const affectMultipliers = field && field.affectMultipliers && typeof field.affectMultipliers === "object"
      ? field.affectMultipliers
      : {};
    const numericBaseValue = isNumberField
      ? parseNumber(normalizedValue)
      : isCheckboxField
        ? (checkboxChecked ? parseNumber(field.checkedValue) : 0)
        : 0;

    if (field.id) {
      selectedValues[field.id] = normalizedValue;
    }

    if (affects.includes("pool")) {
      poolMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.pool) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.pool) || 1)
          : parseNumber(selectedOption && selectedOption.poolMod);
    }
    if (affects.includes("attack_value")) {
      attackValueMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.attack_value) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.attack_value) || 1)
          : parseNumber(selectedOption && selectedOption.attackValueMod);
    }
    if (affects.includes("damage")) {
      damageMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.damage) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.damage) || 1)
          : parseNumber(selectedOption && selectedOption.damageMod);
    }
    if (affects.includes("drain")) {
      drainMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.drain) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.drain) || 1)
          : parseNumber(selectedOption && selectedOption.drainMod);
    }
    if (affects.includes("pool_multiplier")) {
      const multiplierValue = isCheckboxField && checkboxChecked
        ? parseNumber(field.checkedValue)
        : isNumberField
          ? parseNumber(normalizedValue)
          : 1;
      if (multiplierValue > poolMultiplier) {
        poolMultiplier = multiplierValue;
      }
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
    drainMod: drainMod,
    poolMultiplier: poolMultiplier,
    selectedValues: selectedValues,
    rows: popupRows,
  };
}

function fieldMatchesPopupVisibility(field, templateFields) {
  if (!field || !field.visibleWhenField) return true;
  const hasVisibilityField = !!(templateFields && templateFields[field.visibleWhenField] !== undefined);
  if (!hasVisibilityField && field.visibleWhenFieldMissing) return true;
  return `${(templateFields && templateFields[field.visibleWhenField]) || ""}`.trim() === `${field.visibleWhenValue || ""}`.trim();
}

function buildPopupResetPayload() {
  const payload = {};

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_active`] = "0";
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

  return payload;
}

function buildPopupFormPayload(definition, templateFields = {}, poolAttribute) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const payload = buildPopupResetPayload();

  popupFields.forEach((field, index) => {
    const slot = field.slot || (index + 1);
    if (slot > SR6_POPUP_FIELD_SLOT_COUNT) return;
    if (!fieldMatchesPopupVisibility(field, templateFields)) return;

    payload[`sr6_roll_popup_slot_${slot}_active`] = "1";
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
  const popupFields = getRollPopupFields(definition, poolAttribute);
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

function buildPopupPrefillPayload(definition, poolAttribute, repeatingRowPrefix, values, templateFields = {}) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const lookupAttr = buildAttrLookup(values || {}, repeatingRowPrefix);
  const resolvedTemplateFields = buildResolvedFields(templateFields || {}, lookupAttr);
  const payload = buildPopupFormPayload(definition, resolvedTemplateFields, poolAttribute);

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    const sourceAttr = getPopupSourceAttrName(field, poolAttribute);
    const resolvedValue = sourceAttr ? lookupAttr(sourceAttr) : "";
    if (resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === "") return;
    payload[getPopupFieldValueAttr(field, index)] = `${resolvedValue}`;
  });

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    if (!field.sourceField) return;
    const resolvedValue = resolvedTemplateFields[field.sourceField];
    if (resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === "") return;
    payload[getPopupFieldValueAttr(field, index)] = `${resolvedValue}`;
  });

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    if (field.id === "specialization" && resolvedTemplateFields["Spezialisierung Aktiv"] === "1" && resolvedTemplateFields.Spezialisierung) {
      payload[getPopupFieldValueAttr(field, index)] = "1";
    }
    if (field.id === "expertise" && resolvedTemplateFields["Expertise Aktiv"] === "1" && resolvedTemplateFields.Expertise) {
      payload[getPopupFieldValueAttr(field, index)] = "1";
    }
  });

  return payload;
}

function getPopupDerivedResults(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.popupDerivedResults) ? resolvedDefinition.popupDerivedResults : [];
}
// END MODULE: workers/rolls/definition-resolver
// END MODULE: workers/rolls/definition-resolver

// BEGIN MODULE: workers/rolls/context
// Liest den Kontext aus einem angeklickten Roll20-Button: Template-Felder, Pool-Attribute, Repeating-Zeilen und Popup-Speicherwerte.
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
  const sourceSection = (eventInfo && eventInfo.sourceSection) || "";
  const triggerName = (eventInfo && eventInfo.triggerName) || "";
  const candidates = [sourceAttribute, sourceSection, triggerName];

  for (let index = 0; index < candidates.length; index += 1) {
    const value = candidates[index] || "";
    if (!value) continue;

    const directPrefix = value.match(/^(repeating_[^_]+_[^_:\s]+)/);
    if (directPrefix) return directPrefix[1];

    const prefixedByColon = value.match(/^(repeating_[^_]+_[^:]+):/);
    if (prefixedByColon) return prefixedByColon[1];

    const prefixedByUnderscore = value.match(/^(repeating_[^_]+_[^_]+)_/);
    if (prefixedByUnderscore) return prefixedByUnderscore[1];
  }

  return "";
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

  attributeRefs.push("character_id");

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

  getRollAdditionalAttributes(definition).forEach((attributeRef) => {
    requestedAttributes.push(attributeRef);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${attributeRef}`);
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
  const untrained = findLastRowValue(rows, "Ungeübt");

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
  if (untrained) {
    calcParts.push(`Ungeübt: ${untrained}`);
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

// BEGIN MODULE: workers/rolls/compute
// Berechnet reine Wuerfelergebnisse: normale W6, explodierende Sechsen, Schicksalswuerfel, Patzer und Erfolgszahlen. Diese Datei kennt keine UI und keine Roll20-Templates.
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollRegularDice(pool, explodingSixes) {
  const diceResults = [];
  const initialDiceResults = [];

  for (let index = 0; index < pool; index += 1) {
    let die = rollD6();
    diceResults.push(die);
    initialDiceResults.push(die);

    while (explodingSixes && die === 6) {
      die = rollD6();
      diceResults.push(die);
    }
  }

  return {
    diceResults: diceResults,
    initialDiceResults: initialDiceResults,
  };
}

function rollFateDice(fateDiceCount, matrixLonerFateDiceCount, explodingSixes) {
  const diceResults = [];
  const initialDiceResults = [];
  let successCount = 0;
  let cancelingOnes = 0;
  let ignoredLonerOnes = 0;

  const rollSingleFateDie = (ignoreCancellationOnOne) => {
    let die = rollD6();
    diceResults.push(die);
    initialDiceResults.push(die);

    if (die === 1 && ignoreCancellationOnOne) {
      ignoredLonerOnes += 1;
    } else if (die === 1) {
      cancelingOnes += 1;
    } else if (die >= 5) {
      successCount += 3;
    }

    while (explodingSixes && die === 6) {
      die = rollD6();
      diceResults.push(die);
      if (die >= 5) {
        successCount += 1;
      }
    }
  };

  for (let index = 0; index < matrixLonerFateDiceCount; index += 1) {
    rollSingleFateDie(true);
  }

  for (let index = 0; index < fateDiceCount; index += 1) {
    rollSingleFateDie(false);
  }

  return {
    diceResults: diceResults,
    initialDiceResults: initialDiceResults,
    successCount: successCount,
    cancelsNormalFives: cancelingOnes > 0,
    cancelingOnes: cancelingOnes,
    ignoredLonerOnes: ignoredLonerOnes,
  };
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildProbeComputation(lookupAttr, poolAttribute, popupPoolMod, poolMultiplier = 1, poolBasisOverride = null, edgeOptions = {}) {
  const poolBasisRaw = poolBasisOverride === null
    ? parseNumber(lookupAttr(poolAttribute))
    : parseNumber(poolBasisOverride);
  const normalizedPoolMultiplier = Math.max(1, parseNumber(poolMultiplier) || 1);
  const poolBasis = poolBasisRaw * normalizedPoolMultiplier;
  const monitorPoolMod = parseNumber(lookupAttr("sr6_monitor_pool_mod"));
  const poolPopupMod = parseNumber(popupPoolMod);
  const edgePoolBonus = Math.max(0, parseNumber(edgeOptions && edgeOptions.poolBonus));
  const requestedStandardFateDiceCount = Math.max(0, parseNumber(edgeOptions && edgeOptions.fateDiceCount));
  const requestedMatrixLonerFateDiceCount = Math.max(0, parseNumber(edgeOptions && edgeOptions.matrixLonerFateDiceCount));
  const explodingSixes = !!(edgeOptions && edgeOptions.explodingSixes);
  const pool = Math.max(0, poolBasis + monitorPoolMod + poolPopupMod + edgePoolBonus);
  const matrixLonerFateDiceCount = Math.min(requestedMatrixLonerFateDiceCount, pool);
  const remainingFateSlots = Math.max(0, pool - matrixLonerFateDiceCount);
  const standardFateDiceCount = Math.min(requestedStandardFateDiceCount, remainingFateSlots);
  const fateDiceCount = standardFateDiceCount + matrixLonerFateDiceCount;
  const regularPool = Math.max(0, pool - fateDiceCount);
  const regularRoll = rollRegularDice(regularPool, explodingSixes);
  const fateRoll = rollFateDice(standardFateDiceCount, matrixLonerFateDiceCount, explodingSixes);
  const canceledNormalFives = fateRoll.cancelsNormalFives
    ? regularRoll.diceResults.filter((die) => die === 5).length
    : 0;
  const regularSuccessCount = regularRoll.diceResults.filter((die) => die >= 5).length;
  const successCount = Math.max(0, regularSuccessCount - canceledNormalFives + fateRoll.successCount);
  const diceResults = [...regularRoll.diceResults, ...fateRoll.diceResults];
  const glitchDiceResults = [...regularRoll.initialDiceResults, ...fateRoll.initialDiceResults];
  const glitchState = evaluateGlitch(glitchDiceResults, successCount);

  return {
    poolBasisRaw: poolBasisRaw,
    poolMultiplier: normalizedPoolMultiplier,
    poolBasis: poolBasis,
    monitorPoolMod: monitorPoolMod,
    poolPopupMod: poolPopupMod,
    edgePoolBonus: edgePoolBonus,
    fateDiceCount: fateDiceCount,
    standardFateDiceCount: standardFateDiceCount,
    matrixLonerFateDiceCount: matrixLonerFateDiceCount,
    requestedFateDiceCount: requestedStandardFateDiceCount + requestedMatrixLonerFateDiceCount,
    explodingSixes: explodingSixes,
    canceledNormalFives: canceledNormalFives,
    cancelingFateOnes: fateRoll.cancelingOnes,
    ignoredLonerFateOnes: fateRoll.ignoredLonerOnes,
    regularPool: regularPool,
    pool: pool,
    diceResults: diceResults,
    regularDiceResults: regularRoll.diceResults,
    fateDiceResults: fateRoll.diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}

function buildFixedPoolComputation(poolValue) {
  const pool = Math.max(0, parseNumber(poolValue));
  const diceResults = [];

  for (let index = 0; index < pool; index += 1) {
    diceResults.push(rollD6());
  }

  const successCount = diceResults.filter((die) => die >= 5).length;
  const glitchState = evaluateGlitch(diceResults, successCount);

  return {
    pool: pool,
    diceResults: diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}
// END MODULE: workers/rolls/compute

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
    const matrixValue = parseNumber(lookupAttr(`sr6_matrix_${component.matrix}`));
    return {
      label: component.label || component.matrix,
      value: matrixValue * parseNumber(component.multiplier),
      parts: [{ label: component.matrix, value: matrixValue }],
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
    parts.push({ label: component.skill, value: value });
    total += value;
  }
  if (component.attribute) {
    const value = resolveRollAttributeTotal(component.attribute, lookupAttr);
    parts.push({ label: component.attribute, value: value });
    total += value;
  }
  if (component.matrix) {
    const value = parseNumber(lookupAttr(`sr6_matrix_${component.matrix}`));
    parts.push({ label: component.matrix, value: value });
    total += value;
  }
  if (component.matrixSecond) {
    const value = parseNumber(lookupAttr(`sr6_matrix_${component.matrixSecond}`));
    parts.push({ label: component.matrixSecond, value: value });
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

function appendMatrixActionRows(rows, matrixActionContext) {
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
    rows.push({ label: "Probe-Wert", value: `${probe.value}` });
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
  } else if (defense.type === "fixed_formula") {
    rows.push({ label: "Verteidigung", value: defense.label || "Zielwert" });
  } else if (defenseValue && defenseValue.value !== null) {
    rows.push({ label: "Verteidigung", value: defenseValue.label });
    rows.push({ label: "Verteidigungswert", value: `${defenseValue.value}` });
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

function appendRowIfMissing(rows, label, value) {
  const normalizedValue = `${value || ""}`.trim();
  if (!normalizedValue) return;
  if (rows.some((row) => row && row.label === label && `${row.value || ""}`.trim() === normalizedValue)) return;
  rows.push({ label: label, value: normalizedValue });
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

function runEquipmentProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const sourceKey = `${(resolvedFields && resolvedFields.Auswahl) || ""}`.trim();
  const sourceOption = getEquipmentSourceOption(sourceKey);
  const sourceValue = sourceOption ? parseNumber(lookupAttr(sourceOption.attr)) : 0;
  const rating = parseNumber((resolvedFields && resolvedFields.Stufe) || lookupAttr(context.poolAttribute));
  const ratingMultiplier = `${((popupState.selectedValues || {}).equipment_rating_x2) || ""}`.trim() === "1" ? 2 : 1;
  const ratingValue = rating * ratingMultiplier;
  const poolBasisOverride = sourceValue + ratingValue;
  const edgeOptions = resolveEdgeBoostOptions(popupState, lookupAttr);
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod,
    1,
    poolBasisOverride,
    edgeOptions
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  rows.push({ label: "Bezug", value: sourceOption ? sourceOption.label : "Keine Auswahl" });
  if (sourceOption) {
    rows.push({ label: sourceOption.type, value: `${sourceOption.label} (${sourceValue})` });
  }
  rows.push({ label: ratingMultiplier === 2 ? "Stufe x2" : "Stufe", value: `${ratingValue}` });
  if (computation.monitorPoolMod !== 0) {
    rows.push({ label: "Pool-Basis", value: `${computation.poolBasis}` });
    rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
  }
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
    detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults),
    isGlitch: computation.isGlitch,
    characterId: lookupAttr("character_id"),
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
    rumpf: parseNumber(lookupAttr("sr6_rigging_fahrzeug_rumpf")),
    panzerung: parseNumber(lookupAttr("sr6_rigging_fahrzeug_panzerung")),
    pilot: parseNumber(lookupAttr("sr6_rigging_fahrzeug_pilot")),
    sensor: parseNumber(lookupAttr("sr6_rigging_fahrzeug_sensor")),
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
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
    1,
    probe.value,
    edgeOptions
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  rows.push({ label: "Probe", value: getRiggingVehicleProbeLabel(probeKey) });
  rows.push({ label: "Formel", value: probe.formula });
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
    detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults),
    isGlitch: computation.isGlitch,
    characterId: lookupAttr("character_id"),
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
  const spellComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
    1,
    null,
    edgeOptions
  );
  const drainComputation = buildProbeComputation(
    lookupAttr,
    "sr6_magic_entzug_widerstand",
    0
  );
  const baseDamage = parseNumber(resolvedFields.Schaden);
  const baseAttackValue = parseNumber(resolvedFields.Angriffswert);
  const finalAttackValue = isCombatSpell(resolvedFields)
    ? Math.max(0, baseAttackValue + effectivePopupState.attackValueMod)
    : "";
  const finalDamage = isCombatSpell(resolvedFields) || baseDamage || effectivePopupState.damageMod
    ? `${baseDamage + effectivePopupState.damageMod}`
    : "";
  const modifiedDrain = Math.max(0, parseNumber(resolvedFields.Entzug) + effectivePopupState.drainMod);
  const drainDamage = Math.max(0, modifiedDrain - drainComputation.successCount);
  const drainDamageType = resolveDrainDamageType(drainDamage, lookupAttr("sr6_magic_magie"));

  effectivePopupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
  if (isCombatSpell(resolvedFields) && effectivePopupState.attackValueMod !== 0) {
    rows.push({ label: "Angriffswert-Basis", value: `${baseAttackValue}` });
    rows.push({ label: "Angriffswert-Modifikator", value: `${effectivePopupState.attackValueMod}` });
    rows.push({ label: "Angriffswert", value: `${finalAttackValue}` });
  }
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
    detailsDice: buildDetailsDice(spellComputation.diceResults, spellComputation.fateDiceResults),
    isGlitch: spellComputation.isGlitch,
    spellAttackValue: `${finalAttackValue}`,
    spellDamage: finalDamage,
    drainValue: `${modifiedDrain}`,
    drainDamage: `${drainDamage}`,
    drainDamageType: drainDamageType,
    drainDetails: buildDiceDetails(drainComputation.diceResults),
    drainDetailsDice: buildDetailsDice(drainComputation.diceResults),
    characterId: lookupAttr("character_id"),
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
  const summonerComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    effectivePopupState.poolMod,
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

  appendRowIfMissing(rows, "Geistertyp", spiritType);
  appendRowIfMissing(rows, "Kraftstufe", `${spiritForce}`);
  effectivePopupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
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
    detailsDice: buildDetailsDice(summonerComputation.diceResults, summonerComputation.fateDiceResults),
    isGlitch: summonerComputation.isGlitch,
    characterId: lookupAttr("character_id"),
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
    const computation = buildProbeComputation(
      lookupAttr,
      context.poolAttribute,
      effectivePopupState.poolMod,
      poolMultiplier,
      poolBasisOverride,
      edgeOptions
    );

    if (meleeAttributeOverride) {
      rows.push({
        label: "Attribut-Fallback",
        value: `${meleeAttributeOverride.currentAttribute} -> ${meleeAttributeOverride.selectedAttribute}`,
      });
    }
    if (skillAttributeOverride) {
      rows.push({ label: "Attribut", value: skillAttributeOverride.selectedAttribute });
      rows.push({ label: "Attribut-Wert", value: `${skillAttributeOverride.attributeValue}` });
      rows.push({ label: "Fertigkeitswert", value: `${skillAttributeOverride.skillValue}` });
    }
    appendMatrixActionRows(rows, matrixActionContext);
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
      pool: `${computation.pool}`,
      erfolge: erfolgeValue,
      details: buildDiceDetails(computation.diceResults, computation.fateDiceResults),
      detailsDice: buildDetailsDice(computation.diceResults, computation.fateDiceResults),
      isGlitch: computation.isGlitch,
      characterId: lookupAttr("character_id"),
    });
    saveEdgeLastRollContext(name, computation);
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}
// END MODULE: workers/rolls/probe

// BEGIN MODULE: workers/rolls/popup
// Oeffnet das eigene Wurf-Popup, befuellt es aus der Roll-Definition und startet nach Bestaetigung den eigentlichen Wurf.
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
        const popupFormPayload = buildPopupPrefillPayload(definition, poolAttribute, repeatingRowPrefix, popupValues, parsedFields);
        setAttrsSilent({
          ...buildPopupResetPayload(),
          sr6_roll_popup_open: "0",
        }, () => {
          setAttrsSilent({
            ...popupFormPayload,
            sr6_roll_popup_definition: definition.id,
            sr6_roll_popup_template: rawTemplate,
            sr6_roll_popup_row_prefix: repeatingRowPrefix || "",
            sr6_roll_popup_open: "1",
          });
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
    if ((values.sr6_roll_popup_definition || "") === "edge_after_roll") {
      setAttrsSilent({ sr6_roll_popup_open: "0" });
      runEdgeAfterRollConfirm(values);
      return;
    }

    const definition = getRollDefinitionById(values.sr6_roll_popup_definition || "");
    const rawTemplate = values.sr6_roll_popup_template || "";
    const repeatingRowPrefix = values.sr6_roll_popup_row_prefix || "";
    const parsedFields = parseTemplateFields(rawTemplate);
    const poolAttribute = parsePoolAttributeFromFields(parsedFields);
    const popupState = buildPopupStateFromValues(values, definition, poolAttribute);

    setAttrsSilent({ sr6_roll_popup_open: "0" });
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeCancel() {
  setAttrsSilent({ sr6_roll_popup_open: "0" });
}
// END MODULE: workers/rolls/popup

// BEGIN MODULE: workers/rolls/edge
// Steuert Edge-Token und den Edge-nach-dem-Wurf-Flow. Der eigentliche Wurf bleibt in compute/probe, diese Datei verwaltet Bedienung und Chat-Ausgabe.
function runEdgeTokenChange(delta) {
  getAttrs(["sr6_edge_aktuell", "sr6_setting_edge_chatmeldung"], (values) => {
    const edgeCurrent = clampNumber(parseNumber(values.sr6_edge_aktuell) + delta, 0, 7);
    setAttrsSilent({ sr6_edge_aktuell: String(edgeCurrent) });
    if (`${values.sr6_setting_edge_chatmeldung || "nein"}`.trim() !== "ja") return;

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

function buildEdgeAfterRollPopupPayload() {
  const payload = buildPopupResetPayload();
  payload.sr6_roll_popup_definition = "edge_after_roll";
  payload.sr6_roll_popup_template = "";
  payload.sr6_roll_popup_row_prefix = "";

  payload.sr6_roll_popup_slot_9_active = "1";
  payload.sr6_roll_popup_slot_9_visible = "1";
  payload.sr6_roll_popup_slot_9_label = "Edge einsetzen";
  payload.sr6_roll_popup_slot_9_is_select = "1";
  payload.sr6_roll_popup_slot_9_option_edge_after_boost = "1";
  payload.sr6_roll_popup_value_9_select_edge_after_boost = "reroll_1";

  payload.sr6_roll_popup_slot_10_active = "1";
  payload.sr6_roll_popup_slot_10_visible = "1";
  payload.sr6_roll_popup_slot_10_label = "Anzahl";
  payload.sr6_roll_popup_slot_10_is_number = "1";
  payload.sr6_roll_popup_value_10_number = "1";

  return payload;
}

function runEdgeAfterRollOpen() {
  setAttrsSilent({
    ...buildEdgeAfterRollPopupPayload(),
    sr6_roll_popup_open: "1",
  });
}

function parseEdgeLastRollDice(value) {
  return `${value || ""}`
    .split(",")
    .map((die) => parseNumber(die))
    .filter((die) => die >= 1 && die <= 6);
}

function buildEdgeAfterRollRows(boostLabel, lastRollName, rows) {
  return [
    { label: "Ursprünglicher Wurf", value: lastRollName || "Letzter Wurf" },
    { label: "Edge-Boost", value: boostLabel },
    ...rows,
  ];
}

function runEdgeAfterRollConfirm(values) {
  const boost = `${values.sr6_roll_popup_value_9_select_edge_after_boost || "reroll_1"}`.trim();
  const requestedAmount = Math.max(1, parseNumber(values.sr6_roll_popup_value_10_number) || 1);
  const attrs = [
    "sr6_edge_last_roll_name",
    "sr6_edge_last_roll_dice",
    "sr6_edge_last_roll_successes",
    "sr6_edge_last_roll_is_glitch",
    "sr6_edge_last_roll_is_critical_glitch",
  ];

  getAttrs(attrs, (lastValues) => {
    const lastRollName = lastValues.sr6_edge_last_roll_name || "Letzter Wurf";
    const diceResults = parseEdgeLastRollDice(lastValues.sr6_edge_last_roll_dice);
    const previousSuccesses = parseNumber(lastValues.sr6_edge_last_roll_successes);
    const isGlitch = `${lastValues.sr6_edge_last_roll_is_glitch || ""}` === "1";
    const isCriticalGlitch = `${lastValues.sr6_edge_last_roll_is_critical_glitch || ""}` === "1";
    const rows = [];
    let pool = "";
    let successes = "";
    let detailsDice = [];

    if (diceResults.length === 0) {
      rows.push({ label: "Hinweis", value: "Kein letzter Würfelwurf gespeichert." });
      const chatMessage = buildSr6ProbeMessage({
        name: "Edge einsetzen",
        rows: buildEdgeAfterRollRows("Nicht möglich", lastRollName, rows),
        edgeAction: false,
      });
      startRoll(chatMessage, (rollResult) => finishRoll(rollResult.rollId));
      return;
    }

    if (boost === "reroll_failures") {
      const failures = diceResults.filter((die) => die < 5);
      if (isGlitch || isCriticalGlitch) {
        rows.push({ label: "Hinweis", value: "Misserfolge neu würfeln ist bei Patzer/Kritischem Patzer nicht erlaubt." });
        successes = `${previousSuccesses}`;
      } else {
        const rerolledDice = failures.map(() => rollD6());
        const newSuccesses = rerolledDice.filter((die) => die >= 5).length;
        pool = `${rerolledDice.length}`;
        successes = `${previousSuccesses + newSuccesses}`;
        detailsDice = buildDetailsDice(rerolledDice);
        rows.push({ label: "Misserfolge", value: `${failures.length}` });
        rows.push({ label: "Neue Erfolge", value: `${newSuccesses}` });
        rows.push({ label: "Gesamterfolge", value: `${previousSuccesses + newSuccesses}` });
      }
    } else if (boost === "add_1") {
      const fours = diceResults.filter((die) => die === 4).length;
      const appliedAmount = Math.min(requestedAmount, fours);
      const newTotal = previousSuccesses + appliedAmount;
      successes = `${newTotal}`;
      rows.push({ label: "Gewählte Anwendung", value: `${requestedAmount}` });
      rows.push({ label: "Vorhandene 4en", value: `${fours}` });
      rows.push({
        label: "Hinweis",
        value: appliedAmount > 0
          ? `${appliedAmount} Würfel wurde um +1 erhöht.`
          : "Keine 4 vorhanden, die zu einem Erfolg erhöht werden kann.",
      });
      rows.push({ label: "Gesamterfolge", value: `${newTotal}` });
    } else {
      const rerolledDice = Array.from({ length: requestedAmount }, () => rollD6());
      const newSuccesses = rerolledDice.filter((die) => die >= 5).length;
      pool = `${requestedAmount}`;
      successes = `${newSuccesses}`;
      detailsDice = buildDetailsDice(rerolledDice);
      rows.push({ label: "Neu gewürfelte Würfel", value: `${requestedAmount}` });
      rows.push({ label: "Neue Erfolge", value: `${newSuccesses}` });
      rows.push({ label: "Hinweis", value: "Ersetze damit manuell entsprechend viele Würfel aus dem ursprünglichen Wurf." });
    }

    const boostLabels = {
      reroll_1: "1 Würfel neu würfeln",
      add_1: "+1 auf einen Würfel",
      reroll_failures: "Misserfolge neu würfeln",
    };
    const chatMessage = buildSr6ProbeMessage({
      name: "Edge einsetzen",
      rows: buildEdgeAfterRollRows(boostLabels[boost] || "Edge-Boost", lastRollName, rows),
      pool: pool,
      erfolge: successes,
      detailsDice: detailsDice,
      edgeAction: false,
    });

    startRoll(chatMessage, (rollResult) => finishRoll(rollResult.rollId));
  });
}
// END MODULE: workers/rolls/edge

// BEGIN MODULE: workers/rolls/number-stepper
// Erlaubt Plus/Minus-Buttons neben Zahlenfeldern und behandelt Sonderfaelle, bei denen Felder berechnet oder in Repeatern gespeichert werden.
const SR6_NUMBER_STEPPER_COMPUTED_TARGETS = [];

const SR6_NUMBER_STEPPER_REPEATING_SKILL_PREFIXES = [
  "repeating_sr6wissensfertigkeiten_",
  "repeating_sr6sprachfertigkeiten_",
  "repeating_sr6talentsofts_",
  "repeating_sr6wissenssprachsofts_",
];

const SR6_NUMBER_STEPPER_RIGGING_VEHICLE_PREFIXES = [
  "repeating_sr6riggingfahrzeuge_",
];

function shouldSyncRepeatingSkillTotalsAfterStepper(repeatingRowPrefix) {
  if (!repeatingRowPrefix) return false;
  return SR6_NUMBER_STEPPER_REPEATING_SKILL_PREFIXES.some((prefix) => repeatingRowPrefix.startsWith(prefix));
}

function shouldSyncRiggingVehicleProbesAfterStepper(repeatingRowPrefix) {
  if (!repeatingRowPrefix) return false;
  return SR6_NUMBER_STEPPER_RIGGING_VEHICLE_PREFIXES.some((prefix) => repeatingRowPrefix.startsWith(prefix));
}

function resolveRepeatingRowPrefixForStepper(eventInfo, callback) {
  const fallbackPrefix = extractRepeatingRowPrefix(eventInfo);
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const triggerName = (eventInfo && eventInfo.triggerName) || "";
  const sourceSection = (eventInfo && eventInfo.sourceSection) || "";
  const candidates = [sourceAttribute, triggerName];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index] || "";
    if (!candidate) continue;

    const resolvedMatch = candidate.match(/^(repeating_[^_]+_[^_:\s$]+)_/);
    if (resolvedMatch) {
      callback(resolvedMatch[1]);
      return;
    }

    const placeholderMatch = candidate.match(/^(repeating_([^_]+)_\$(\d+))_/);
    if (placeholderMatch) {
      const sectionName = placeholderMatch[2];
      const sectionIndex = parseNumber(placeholderMatch[3]);
      getSectionIDs(`repeating_${sectionName}`, (sectionIds) => {
        const ids = sectionIds || [];
        const rowId = ids[sectionIndex];
        if (!rowId) {
          callback(fallbackPrefix);
          return;
        }
        callback(`repeating_${sectionName}_${rowId}`);
      });
      return;
    }

    const triggerRowIdMatch = candidate.match(/(?:^|:)repeating_([^:]+):(-[^:]+):/);
    if (triggerRowIdMatch) {
      callback(`repeating_${triggerRowIdMatch[1]}_${triggerRowIdMatch[2]}`);
      return;
    }

    const triggerIndexMatch = candidate.match(/(?:^|:)repeating_([^:]+):\$(\d+):/);
    if (triggerIndexMatch) {
      const sectionName = triggerIndexMatch[1];
      const sectionIndex = parseNumber(triggerIndexMatch[2]);
      getSectionIDs(`repeating_${sectionName}`, (sectionIds) => {
        const ids = sectionIds || [];
        const rowId = ids[sectionIndex];
        if (!rowId) {
          callback(fallbackPrefix);
          return;
        }
        callback(`repeating_${sectionName}_${rowId}`);
      });
      return;
    }
  }

  if (sourceSection) {
    const sectionMatch = sourceSection.match(/^repeating_([^_]+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1];
      getSectionIDs(sourceSection, (sectionIds) => {
        const ids = sectionIds || [];
        if (ids.length === 1) {
          callback(`repeating_${sectionName}_${ids[0]}`);
          return;
        }
        callback(fallbackPrefix);
      });
      return;
    }
  }

  callback(fallbackPrefix);
}

function resolveNumberStepperTargetAttr(targetAttr, repeatingRowPrefix) {
  if (repeatingRowPrefix) return targetAttr;
  if (targetAttr.endsWith("_gesamtwert")) return targetAttr.replace(/_gesamtwert$/, "_modifikator");
  if (SR6_NUMBER_STEPPER_COMPUTED_TARGETS.includes(targetAttr)) return `${targetAttr}_modifikator`;
  return targetAttr;
}

function runNumberStepperAdjust(eventInfo) {
  const rawValue =
    (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) ||
    (eventInfo && eventInfo.value) ||
    "";
  const modernSeparator = "::";
  const legacySeparator = "|";
  const separator = rawValue.includes(modernSeparator) ? modernSeparator : legacySeparator;
  const separatorIndex = rawValue.lastIndexOf(separator);
  if (separatorIndex <= 0) return;

  const targetAttr = rawValue.slice(0, separatorIndex);
  const delta = parseNumber(rawValue.slice(separatorIndex + separator.length));
  if (!targetAttr || delta === 0) return;

  resolveRepeatingRowPrefixForStepper(eventInfo, (repeatingRowPrefix) => {
    const effectiveTargetAttr = resolveNumberStepperTargetAttr(targetAttr, repeatingRowPrefix);
    const scopedTargetAttr = repeatingRowPrefix ? `${repeatingRowPrefix}_${effectiveTargetAttr}` : effectiveTargetAttr;
    getAttrs([scopedTargetAttr], (values) => {
      const currentValue = parseNumber(values[scopedTargetAttr]);
      setAttrsSilent({
        [scopedTargetAttr]: String(currentValue + delta),
      }, () => {
        if (shouldSyncRiggingVehicleProbesAfterStepper(repeatingRowPrefix) && typeof syncRiggingVehicleProbes === "function") {
          syncRiggingVehicleProbes();
          return;
        }
        if (shouldSyncRepeatingSkillTotalsAfterStepper(repeatingRowPrefix) && typeof syncRepeatingSkillTotals === "function") {
          syncRepeatingSkillTotals();
          return;
        }
        if (!repeatingRowPrefix && typeof recomputeAll === "function") {
          recomputeAll();
        }
      });
    });
  });
}
// END MODULE: workers/rolls/number-stepper

// BEGIN MODULE: workers/rolls/index
// Registriert alle Roll20-Eventhandler fuer Rollbuttons, Popup-Aktionen, Edge und Stepper. Hier wird nur verdrahtet, nicht fachlich berechnet.
function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6zauber:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6geister:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6ausruestung:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6riggingfahrzeuge:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6wissensfertigkeiten:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6sprachfertigkeiten:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6talentsofts:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6wissenssprachsofts:probe", runSuccessProbeRoll);
  on("clicked:probe_popup_test", runTestPopupProbeRoll);
  on("clicked:probe_popup_confirm", runGlobalPopupProbeConfirm);
  on("clicked:probe_popup_cancel", runGlobalPopupProbeCancel);
}

function registerEdgeTokenEvents() {
  on("clicked:sr6_edge_token_plus", runEdgeTokenPlus);
  on("clicked:sr6_edge_token_minus", runEdgeTokenMinus);
  on("clicked:sr6_edge_after_roll", runEdgeAfterRollOpen);
}

function registerNumberStepperEvents() {
  on("clicked:sr6_number_step", runNumberStepperAdjust);
  const repeatingSections = [
    "sr6adeptenkraefte",
    "sr6ausruestung",
    "sr6bioware",
    "sr6connections",
    "sr6cyberware",
    "sr6fernkampfwaffen",
    "sr6foki",
    "sr6geister",
    "sr6lebensstil",
    "sr6matrixgeraete",
    "sr6matrixprogramme",
    "sr6matrixsprites",
    "sr6matrixstrukturen",
    "sr6matrixzubehoer",
    "sr6nahkampfwaffen",
    "sr6panzerung",
    "sr6riggingagenten",
    "sr6riggingfahrzeuge",
    "sr6riggingmanoever",
    "sr6riggingprogramme",
    "sr6riggingzubehoer",
    "sr6rituale",
    "sr6sin",
    "sr6sprachfertigkeiten",
    "sr6talentsofts",
    "sr6wissensfertigkeiten",
    "sr6wissenssprachsofts",
    "sr6zauber",
  ];

  repeatingSections.forEach((sectionName) => {
    // Stable repeater hook: lets the handler filter real stepper clicks via button value payload.
    on(`clicked:repeating_${sectionName}`, runNumberStepperAdjust);
  });
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

  updates.sr6_attrprobe_erinnerungsvermoegen = String(parseNumber(totals.logik) + parseNumber(totals.intuition));
  updates.sr6_attrprobe_heben_tragen = String(parseNumber(totals.konstitution) + parseNumber(totals.willenskraft));
  updates.sr6_attrprobe_menschenkenntnis = String(parseNumber(totals.willenskraft) + parseNumber(totals.intuition));
  updates.sr6_attrprobe_selbstbeherrschung = String(parseNumber(totals.willenskraft) + parseNumber(totals.charisma));
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

const SR6_REPEATING_SKILL_TOTAL_SECTIONS = [
  {
    section: "repeating_sr6wissensfertigkeiten",
    prefix: "sr6_wissensfertigkeit_",
    totalSource: "memory",
  },
  {
    section: "repeating_sr6sprachfertigkeiten",
    prefix: "sr6_sprachfertigkeit_",
    totalSource: "memory",
  },
  {
    section: "repeating_sr6talentsofts",
    prefix: "sr6_talentsoft_",
    totalSource: "talentsoft",
  },
  {
    section: "repeating_sr6wissenssprachsofts",
    prefix: "sr6_wissenssprachsoft_",
    totalSource: "memory",
  },
];

const SR6_TALENTSOFT_ATTRIBUTE_SOURCES = {
  "Geschicklichkeit": "sr6_attr_geschicklichkeit_gesamtwert",
  "Konstitution": "sr6_attr_konstitution_gesamtwert",
  "Reaktion": "sr6_attr_reaktion_gesamtwert",
  "Stärke": "sr6_attr_staerke_gesamtwert",
  "Willenskraft": "sr6_attr_willenskraft_gesamtwert",
  "Logik": "sr6_attr_logik_gesamtwert",
  "Intuition": "sr6_attr_intuition_gesamtwert",
  "Charisma": "sr6_attr_charisma_gesamtwert",
  "Magie/Resonanz": "sr6_attr_magie_resonanz_gesamtwert",
};

function getLanguageLevelBonus(selectedLevel) {
  const normalizedLevel = `${selectedLevel || ""}`.trim();
  if (normalizedLevel === "Fortgeschritten (+2)") return 2;
  if (normalizedLevel === "Experte (+3)") return 3;
  return 0;
}

function getLanguageLevelHint(selectedLevel) {
  return `${selectedLevel || ""}`.trim() === "Muttersprache"
    ? "Muttersprache: keine Probe zum Verstehen notwendig."
    : "";
}

function getTalentsoftAttributeTotal(values, selectedAttribute) {
  const attrKey =
    SR6_TALENTSOFT_ATTRIBUTE_SOURCES[`${selectedAttribute || ""}`.trim()] ||
    SR6_TALENTSOFT_ATTRIBUTE_SOURCES["Geschicklichkeit"];
  if (!attrKey) return 0;
  return parseNumber(values[attrKey]);
}

function syncRepeatingSkillTotals(callback) {
  const pendingSections = SR6_REPEATING_SKILL_TOTAL_SECTIONS.length;
  const sectionIdsByName = {};
  let resolvedSections = 0;

  if (pendingSections === 0) {
    if (typeof callback === "function") callback();
    return;
  }

  SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((config) => {
    getSectionIDs(config.section, (sectionIds) => {
      sectionIdsByName[config.section] = sectionIds || [];
      resolvedSections += 1;

      if (resolvedSections < pendingSections) {
        return;
      }

      const requestKeys = [];

      SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((sectionConfig) => {
        const sectionIds = sectionIdsByName[sectionConfig.section] || [];
        sectionIds.forEach((rowId) => {
          if (sectionConfig.totalSource === "memory" && sectionConfig.prefix === "sr6_sprachfertigkeit_") {
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}niveau`);
          }
          if (sectionConfig.totalSource === "talentsoft") {
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}grundwert`);
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}modifikator`);
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}attribut`);
          }
        });
      });

      Object.keys(SR6_TALENTSOFT_ATTRIBUTE_SOURCES).forEach((attributeName) => {
        requestKeys.push(SR6_TALENTSOFT_ATTRIBUTE_SOURCES[attributeName]);
      });
      requestKeys.push("sr6_attrprobe_erinnerungsvermoegen");

      if (requestKeys.length === 0) {
        if (typeof callback === "function") callback();
        return;
      }

      getAttrs(requestKeys, (values) => {
        const updates = {};

        SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((sectionConfig) => {
          const sectionIds = sectionIdsByName[sectionConfig.section] || [];
          sectionIds.forEach((rowId) => {
            const rowPrefix = `${sectionConfig.section}_${rowId}_${sectionConfig.prefix}`;
            if (sectionConfig.totalSource === "memory") {
              const isLanguage = sectionConfig.prefix === "sr6_sprachfertigkeit_";
              const languageLevel = values[`${rowPrefix}niveau`];
              const languageBonus = isLanguage ? getLanguageLevelBonus(languageLevel) : 0;
              updates[`${rowPrefix}gesamtwert`] = String(parseNumber(values.sr6_attrprobe_erinnerungsvermoegen) + languageBonus);
              if (isLanguage) {
                updates[`${rowPrefix}bonus`] = String(languageBonus);
                updates[`${rowPrefix}hinweis`] = getLanguageLevelHint(languageLevel);
              }
              return;
            }
            const attributeTotal =
              sectionConfig.totalSource === "talentsoft"
                ? getTalentsoftAttributeTotal(values, values[`${rowPrefix}attribut`])
                : 0;
            const total =
              attributeTotal +
              parseNumber(values[`${rowPrefix}grundwert`]) +
              parseNumber(values[`${rowPrefix}modifikator`]);

            updates[`${rowPrefix}gesamtwert`] = String(total);
          });
        });

        setAttrsSilent(updates, callback);
      });
    });
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

function getCombatMeleeSkillTotalByName(skillTotals, selectedSkill) {
  const skillKey = getCombatMeleeSkillKeyByName(selectedSkill);
  return (skillTotals && skillTotals[skillKey]) || 0;
}

function getCombatMeleeSkillTotal(skillTotals, values) {
  const selectedSkill = `${(values && values.sr6_combat_nahkampf_fertigkeit) || "Nahkampf"}`.trim();
  return getCombatMeleeSkillTotalByName(skillTotals, selectedSkill);
}

function getCombatMeleeAttributeTotalByName(totals, selectedAttribute) {
  if (selectedAttribute === "Stärke") {
    return (totals && totals.staerke) || 0;
  }
  return (totals && totals.geschicklichkeit) || 0;
}

function getCombatMeleeAttributeTotal(totals, values) {
  const selectedAttribute = `${(values && values.sr6_combat_nahkampf_attribut) || "Geschicklichkeit"}`.trim();
  return getCombatMeleeAttributeTotalByName(totals, selectedAttribute);
}

function getCombatRangedSkillTotalByName(skillTotals, selectedSkill) {
  const skillKey = getCombatRangedSkillKeyByName(selectedSkill);
  return (skillTotals && skillTotals[skillKey]) || 0;
}

function getCombatRangedSkillTotal(skillTotals, values) {
  const selectedSkill = `${(values && values.sr6_combat_fernkampf_fertigkeit) || "Feuerwaffen"}`.trim();
  return getCombatRangedSkillTotalByName(skillTotals, selectedSkill);
}

function getCombatMeleeSkillKeyByName(selectedSkill) {
  return `${selectedSkill || "Nahkampf"}`.trim() === "Exotische Waffen"
    ? "exotische_waffen"
    : "nahkampf";
}

function getCombatRangedSkillKeyByName(selectedSkill) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  if (skill === "Projektilwaffen") return "athletik";
  if (skill === "Exotische Waffen") return "exotische_waffen";
  return "feuerwaffen";
}

function getCombatUntrainedSkillPenalty(values, skillKey) {
  if (!skillKey) return 0;
  const baseValue = parseNumber(values && values[`sr6_skill_${skillKey}_grundwert`]);
  return baseValue <= 0 ? -1 : 0;
}

function getCombatRangedUntrainedSkillPenalty(values, selectedSkill) {
  return getCombatUntrainedSkillPenalty(values, getCombatRangedSkillKeyByName(selectedSkill));
}

function getCombatMeleeUntrainedSkillPenalty(values, selectedSkill) {
  return getCombatUntrainedSkillPenalty(values, getCombatMeleeSkillKeyByName(selectedSkill));
}

function getCombatSkillSpecializationSelection(values, skillKey) {
  return {
    specialization: values && values[`sr6_skill_${skillKey}_spezialisierung`],
    expertise: values && values[`sr6_skill_${skillKey}_expertise`],
  };
}

function getCombatSkillPool(values, skillTotals, skillKey, attributeTotal, matchingNames) {
  const selection = getCombatSkillSpecializationSelection(values, skillKey);
  return (
    parseNumber(attributeTotal) +
    parseNumber(skillTotals && skillTotals[skillKey]) +
    getCombatSpecializationBonus(selection.specialization, selection.expertise, matchingNames) +
    getCombatUntrainedSkillPenalty(values, skillKey)
  );
}

function normalizeCombatSpecializationName(value) {
  return `${value || ""}`
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "");
}

function getCombatSpecializationBonus(selectedSpecialization, selectedExpertise, matchingNames) {
  const matches = new Set((matchingNames || []).map(normalizeCombatSpecializationName).filter(Boolean));

  if (matches.size === 0) {
    return 0;
  }

  if (matches.has(normalizeCombatSpecializationName(selectedExpertise))) {
    return 3;
  }

  if (matches.has(normalizeCombatSpecializationName(selectedSpecialization))) {
    return 2;
  }

  return 0;
}

function getCombatRangedSpecializationMatches(selectedSkill, weaponType) {
  const type = `${weaponType || ""}`.trim();

  if (selectedSkill === "Projektilwaffen") {
    return ["Projektilwaffen"];
  }

  if (selectedSkill === "Exotische Waffen") {
    return ["Werfer", "Druckluftwaffen", "Sprühwaffen", "Laserwaffen", "Energiewaffen"].filter((name) => name === type);
  }

  return [type];
}

function getCombatRangedSpecializationBonus(values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  const skillKey = getCombatRangedSkillKeyByName(skill);
  const selection = getCombatSkillSpecializationSelection(values, skillKey);

  return getCombatSpecializationBonus(
    selection.specialization,
    selection.expertise,
    getCombatRangedSpecializationMatches(skill, weaponType)
  );
}

function getCombatRangedPool(totals, skillTotals, values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  const skillKey = getCombatRangedSkillKeyByName(skill);
  return getCombatSkillPool(
    values,
    skillTotals,
    skillKey,
    totals && totals.geschicklichkeit,
    getCombatRangedSpecializationMatches(skill, weaponType)
  );
}

function getCombatMeleeSpecializationMatches(selectedSkill, weaponType) {
  const type = `${weaponType || ""}`.trim();

  if (selectedSkill === "Exotische Waffen") {
    return ["Cyberimplantwaffen", "Handgemenge-Waffen", "Kettensägen", "Natürliche Waffen", "Peitschen"].filter(
      (name) => name === type
    );
  }

  return [type];
}

function getCombatMeleeSpecializationBonus(values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Nahkampf"}`.trim();
  const skillKey = getCombatMeleeSkillKeyByName(skill);
  const selection = getCombatSkillSpecializationSelection(values, skillKey);

  return getCombatSpecializationBonus(
    selection.specialization,
    selection.expertise,
    getCombatMeleeSpecializationMatches(skill, weaponType)
  );
}

function getCombatMeleePool(totals, skillTotals, values, selectedSkill, selectedAttribute, weaponType) {
  const skill = `${selectedSkill || "Nahkampf"}`.trim();
  const skillKey = getCombatMeleeSkillKeyByName(skill);
  return getCombatSkillPool(
    values,
    skillTotals,
    skillKey,
    getCombatMeleeAttributeTotalByName(totals, selectedAttribute),
    getCombatMeleeSpecializationMatches(skill, weaponType)
  );
}

const SR6_COMBAT_CALCULATED_FIELDS = [
  {
    key: "sr6_combat_fernkampfangriff",
    useModifier: false,
    base: (totals, skillTotals, values) => {
      const selectedSkill = `${(values && values.sr6_combat_fernkampf_fertigkeit) || "Feuerwaffen"}`.trim();
      const weaponType = `${(values && values.sr6_combat_fernkampf_waffentyp) || ""}`.trim();
      return getCombatRangedPool(totals, skillTotals, values, selectedSkill, weaponType);
    },
  },
  {
    key: "sr6_combat_projektilwaffen",
    useModifier: false,
    base: (totals, skillTotals, values) =>
      getCombatRangedPool(totals, skillTotals, values, "Projektilwaffen", "Projektilwaffen"),
  },
  {
    key: "sr6_combat_nahkampfangriff",
    useModifier: false,
    base: (totals, skillTotals, values) => {
      const selectedSkill = `${(values && values.sr6_combat_nahkampf_fertigkeit) || "Nahkampf"}`.trim();
      const selectedAttribute = `${(values && values.sr6_combat_nahkampf_attribut) || "Geschicklichkeit"}`.trim();
      const weaponType = `${(values && values.sr6_combat_nahkampf_waffentyp) || ""}`.trim();
      return getCombatMeleePool(totals, skillTotals, values, selectedSkill, selectedAttribute, weaponType);
    },
  },
  {
    key: "sr6_combat_verteidigungswert",
    useModifier: false,
    base: (totals, skillTotals, values) =>
      (totals.konstitution || 0) +
      parseNumber(values.sr6_combat_primaere_panzerung) +
      parseNumber(values.sr6_combat_sekundaere_panzerung) +
      parseNumber(values.sr6_combat_helm) +
      parseNumber(values.sr6_combat_schild),
  },
  {
    key: "sr6_verteidigung_physisch",
    useModifier: false,
    base: (totals) => (totals.reaktion || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_physisch",
    useModifier: false,
    base: (totals) => totals.konstitution || 0,
  },
  {
    key: "sr6_verteidigung_zauber_direkt",
    base: (totals) => (totals.willenskraft || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_verteidigung_zauber_indirekt",
    base: (totals) => (totals.reaktion || 0) + (totals.willenskraft || 0),
  },
  {
    key: "sr6_verteidigung_astralkampf",
    base: (totals) => (totals.logik || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_astral",
    base: (totals) => totals.willenskraft || 0,
  },
  {
    key: "sr6_schadenswiderstand_matrix",
    base: (_totals, _skillTotals, values) => parseNumber(values.sr6_matrix_firewall),
  },
  {
    key: "sr6_schadenswiderstand_biofeedback",
    base: (totals) => totals.willenskraft || 0,
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
      sr6_combat_fernkampf_waffentyp: "sr6_fernkampf_waffentyp",
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
      sr6_combat_fernkampf_waffentyp: "",
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
      sr6_combat_nahkampf_attribut: "sr6_nahkampf_attribut",
      sr6_combat_nahkampf_waffentyp: "sr6_nahkampf_waffentyp",
      sr6_combat_nahkampf_schaden: "sr6_nahkampf_schaden",
      sr6_combat_nahkampf_schadentyp: "sr6_nahkampf_schadentyp",
      sr6_combat_nahkampf_sehr_nah: "sr6_nahkampf_s_nah",
      sr6_combat_nahkampf_nah: "sr6_nahkampf_nah",
      sr6_combat_nahkampf_mittel: "sr6_nahkampf_mittel",
      sr6_combat_nahkampf_weit: "sr6_nahkampf_weit",
      sr6_combat_nahkampf_sehr_weit: "sr6_nahkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_nahkampfwaffe: "",
      sr6_combat_nahkampf_fertigkeit: "Nahkampf",
      sr6_combat_nahkampf_attribut: "Geschicklichkeit",
      sr6_combat_nahkampf_waffentyp: "",
      sr6_combat_nahkampf_schaden: "0",
      sr6_combat_nahkampf_schadentyp: "Körperlich",
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
  requestKeys.push("sr6_combat_fernkampf_fertigkeit");
  requestKeys.push("sr6_combat_fernkampf_waffentyp");
  requestKeys.push("sr6_combat_nahkampf_fertigkeit");
  requestKeys.push("sr6_combat_nahkampf_attribut");
  requestKeys.push("sr6_combat_nahkampf_waffentyp");
  requestKeys.push("sr6_skill_athletik_spezialisierung");
  requestKeys.push("sr6_skill_athletik_expertise");
  requestKeys.push("sr6_skill_athletik_grundwert");
  requestKeys.push("sr6_skill_exotische_waffen_spezialisierung");
  requestKeys.push("sr6_skill_exotische_waffen_expertise");
  requestKeys.push("sr6_skill_exotische_waffen_grundwert");
  requestKeys.push("sr6_skill_feuerwaffen_spezialisierung");
  requestKeys.push("sr6_skill_feuerwaffen_expertise");
  requestKeys.push("sr6_skill_feuerwaffen_grundwert");
  requestKeys.push("sr6_skill_nahkampf_spezialisierung");
  requestKeys.push("sr6_skill_nahkampf_expertise");
  requestKeys.push("sr6_skill_nahkampf_grundwert");
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
    const modifierValue = field.useModifier === false ? 0 : parseNumber(values[`${field.key}_modifikator`]);
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

function syncCombatWeaponPools(callback) {
  const requestKeys = [
    "sr6_attr_geschicklichkeit_gesamtwert",
    "sr6_attr_staerke_gesamtwert",
    "sr6_skill_athletik_gesamtwert",
    "sr6_skill_athletik_grundwert",
    "sr6_skill_athletik_spezialisierung",
    "sr6_skill_athletik_expertise",
    "sr6_skill_exotische_waffen_gesamtwert",
    "sr6_skill_exotische_waffen_grundwert",
    "sr6_skill_exotische_waffen_spezialisierung",
    "sr6_skill_exotische_waffen_expertise",
    "sr6_skill_feuerwaffen_gesamtwert",
    "sr6_skill_feuerwaffen_grundwert",
    "sr6_skill_feuerwaffen_spezialisierung",
    "sr6_skill_feuerwaffen_expertise",
    "sr6_skill_nahkampf_gesamtwert",
    "sr6_skill_nahkampf_grundwert",
    "sr6_skill_nahkampf_spezialisierung",
    "sr6_skill_nahkampf_expertise",
  ];

  getSectionIDs("repeating_sr6fernkampfwaffen", (rangedIds) => {
    getSectionIDs("repeating_sr6nahkampfwaffen", (meleeIds) => {
      const rangedRowIds = rangedIds || [];
      const meleeRowIds = meleeIds || [];

      rangedRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_fertigkeit`);
        requestKeys.push(`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_waffentyp`);
      });
      meleeRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_fertigkeit`);
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_attribut`);
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_waffentyp`);
      });

      getAttrs(requestKeys, (values) => {
        const totals = {
          geschicklichkeit: parseNumber(values.sr6_attr_geschicklichkeit_gesamtwert),
          staerke: parseNumber(values.sr6_attr_staerke_gesamtwert),
        };
        const skillTotals = {
          athletik: parseNumber(values.sr6_skill_athletik_gesamtwert),
          exotische_waffen: parseNumber(values.sr6_skill_exotische_waffen_gesamtwert),
          feuerwaffen: parseNumber(values.sr6_skill_feuerwaffen_gesamtwert),
          nahkampf: parseNumber(values.sr6_skill_nahkampf_gesamtwert),
        };
        const updates = {};

        rangedRowIds.forEach((rowId) => {
          const skill = `${values[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_fertigkeit`] || "Feuerwaffen"}`.trim();
          const weaponType = `${values[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_waffentyp`] || ""}`.trim();
          const pool = getCombatRangedPool(totals, skillTotals, values, skill, weaponType);
          updates[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_pool`] = String(pool);
        });

        meleeRowIds.forEach((rowId) => {
          const skill = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_fertigkeit`] || "Nahkampf"}`.trim();
          const attribute = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_attribut`] || "Geschicklichkeit"}`.trim();
          const weaponType = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_waffentyp`] || ""}`.trim();
          const pool = getCombatMeleePool(totals, skillTotals, values, skill, attribute, weaponType);
          updates[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_pool`] = String(pool);
        });

        if (Object.keys(updates).length === 0 && typeof callback === "function") {
          callback();
          return;
        }
        setAttrsSilent(updates, callback);
      });
    });
  });
}

// BEGIN MODULE: workers/compute/magic
function appendMagicRequestKeys(requestKeys) {
  requestKeys.push("sr6_magic_traditionsattribut_1");
  requestKeys.push("sr6_magic_traditionsattribut_1_modifikator");
}

function computeMagicDerived(values, totals, skillTotals, updates) {
  updates.sr6_magic_magie = String(totals.magie_resonanz || 0);
  updates.sr6_magic_zauberpool = String(skillTotals.hexerei || 0);
  updates.sr6_magic_spruchzauberei = String(
    parseNumber(updates.sr6_magic_magie) + parseNumber(updates.sr6_magic_zauberpool)
  );
  updates.sr6_magic_beschwoeren = String(
    (skillTotals.beschwoeren || 0) + parseNumber(updates.sr6_magic_magie)
  );
  updates.sr6_magic_waffenloser_kampf = String(
    (skillTotals.astral || 0) + (totals.willenskraft || 0)
  );
  updates.sr6_magic_waffenfoki = String((skillTotals.nahkampf || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_astrale_verteidigung = String(
    (totals.logik || 0) + (totals.intuition || 0)
  );
  updates.sr6_magic_astraler_schadenswiderstand = String(totals.willenskraft || 0);
  updates.sr6_magic_astrale_initiative = String(
    (totals.logik || 0) + (totals.intuition || 0)
  );

  const traditionKey1 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_1);
  const traditionValue1 =
    (traditionKey1 ? (totals[traditionKey1] || 0) : 0) +
    parseNumber(values.sr6_magic_traditionsattribut_1_modifikator);

  updates.sr6_magic_entzug_widerstand = String(
    traditionValue1 + (totals.willenskraft || 0)
  );
  updates.sr6_magic_angriffswert = String(
    parseNumber(updates.sr6_magic_magie) + traditionValue1
  );
  updates.sr6_magic_astralkampf_angriffswert = String(
    (totals.magie_resonanz || 0) + traditionValue1
  );
  updates.sr6_magic_astralkampf_verteidigungswert = String(totals.intuition || 0);
}
// END MODULE: workers/compute/magic

// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  requestKeys.push("sr6_matrix_modus");
  requestKeys.push("sr6_matrix_angriff");
  requestKeys.push("sr6_matrix_schleicher");
  requestKeys.push("sr6_matrix_datenverarbeitung");
  requestKeys.push("sr6_matrix_firewall");
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_verteidigung_auswahl`);
  });
}

function resolveMatrixInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function resolveMatrixActionComponentTotal(component, values, totals, skillTotals) {
  if (!component || component.type === "none" || component.type === "description" || component.target) {
    return "";
  }

  if (component.multiplier && component.matrix) {
    return String(parseNumber(values[`sr6_matrix_${component.matrix}`]) * parseNumber(component.multiplier));
  }

  let total = 0;
  let hasParts = false;

  if (component.skill) {
    total += parseNumber(skillTotals[component.skill]);
    total += getMatrixUntrainedSkillPenalty(values, component.skill);
    hasParts = true;
  }
  if (component.attribute) {
    total += parseNumber(totals[component.attribute]);
    hasParts = true;
  }
  if (component.matrix) {
    total += parseNumber(values[`sr6_matrix_${component.matrix}`]);
    hasParts = true;
  }
  if (component.matrixSecond) {
    total += parseNumber(values[`sr6_matrix_${component.matrixSecond}`]);
    hasParts = true;
  }

  return hasParts ? String(total) : "";
}

function getMatrixUntrainedSkillPenalty(values, skillKey) {
  if (!skillKey) return 0;
  const baseValue = parseNumber(values && values[`sr6_skill_${skillKey}_grundwert`]);
  return baseValue <= 0 ? -1 : 0;
}

function resolveMatrixActionDefenseComponent(rule, selectedDefense) {
  const defense = (rule && rule.defense) || {};
  if (Array.isArray(defense.options)) {
    const normalizedSelection = `${selectedDefense || ""}`.trim();
    return defense.options.find((option) => `${option.label || ""}`.trim() === normalizedSelection) || defense.options[0];
  }
  return defense;
}

function computeMatrixTotals(values, totals, skillTotals, updates) {
  const matrixInitiativeMode = resolveMatrixInitiativeMode(values.sr6_matrix_modus);
  const matrixAttack = parseNumber(values.sr6_matrix_angriff);
  const matrixSleaze = parseNumber(values.sr6_matrix_schleicher);
  const matrixDataProcessing = parseNumber(values.sr6_matrix_datenverarbeitung);
  const matrixFirewall = parseNumber(values.sr6_matrix_firewall);
  const matrixBasis =
    matrixInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + matrixDataProcessing
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_matrix_initiative = String(matrixBasis);
  updates.sr6_matrix_initiative_w6 = String(matrixInitiativeMode.w6);
  updates.sr6_matrix_angriffswert = String(matrixAttack + matrixSleaze);
  updates.sr6_matrix_verteidigungswert = String(matrixDataProcessing + matrixFirewall);
  updates.sr6_matrix_verteidigung = String((totals.intuition || 0) + matrixFirewall);
  updates.sr6_matrix_schadenswiderstand = String(matrixFirewall);
  updates.sr6_matrix_biofeedback_schadenswiderstand = String(totals.willenskraft || 0);

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const rule = SR6_MATRIX_ACTION_RULES[actionName] || {};
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);
    const defenseSelectionKey = `sr6_matrix_handlung_${actionName}_verteidigung_auswahl`;
    const probeTotalKey = `sr6_matrix_handlung_${actionName}_probe_wert`;
    const defenseTotalKey = `sr6_matrix_handlung_${actionName}_verteidigung_wert`;
    const defenseComponent = resolveMatrixActionDefenseComponent(rule, values[defenseSelectionKey]);

    updates[totalKey] = String(total);
    updates[probeTotalKey] = resolveMatrixActionComponentTotal(rule.probe, values, totals, skillTotals);
    updates[defenseTotalKey] = resolveMatrixActionComponentTotal(defenseComponent, values, totals, skillTotals);
  });
}
// END MODULE: workers/compute/matrix

// BEGIN MODULE: workers/compute/rigging
function appendRiggingRequestKeys(requestKeys) {
  requestKeys.push("sr6_rigging_modus");
  requestKeys.push("sr6_rigging_angriff");
  requestKeys.push("sr6_rigging_schleicher");
  requestKeys.push("sr6_rigging_datenverarbeitung");
  requestKeys.push("sr6_rigging_firewall");
}

const SR6_RIGGING_VEHICLE_PROBE_LABELS = {
  handling: "Handlingprobe",
  ramming_attack: "Fahrzeug als Waffe",
  weapon_attack: "Fahrzeugwaffe",
  defense: "Verteidigungsprobe",
  stealth: "Heimlichkeit",
  perception: "Wahrnehmung",
  damage_resistance: "Schadenswiderstand",
};

function resolveRiggingInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function computeRiggingDerived(values, totals, _skillTotals, updates) {
  const riggingInitiativeMode = resolveRiggingInitiativeMode(values.sr6_rigging_modus);
  const riggingAttack = parseNumber(values.sr6_rigging_angriff);
  const riggingSleaze = parseNumber(values.sr6_rigging_schleicher);
  const riggingDataProcessing = parseNumber(values.sr6_rigging_datenverarbeitung);
  const riggingFirewall = parseNumber(values.sr6_rigging_firewall);
  const riggingBasis =
    riggingInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + riggingDataProcessing
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_rigging_initiative = String(riggingBasis);
  updates.sr6_rigging_initiative_w6 = String(riggingInitiativeMode.w6);
  updates.sr6_rigging_angriffswert = String(riggingAttack + riggingSleaze);
  updates.sr6_rigging_verteidigungswert = String(riggingDataProcessing + riggingFirewall);
  updates.sr6_rigging_matrix_verteidigung = String((totals.intuition || 0) + riggingFirewall);
  updates.sr6_rigging_matrix_schadenswiderstand = String(riggingFirewall);
  updates.sr6_rigging_biofeedback_schadenswiderstand = String(totals.willenskraft || 0);
}

function normalizeRiggingVehicleMode(mode) {
  const normalizedMode = `${mode || ""}`.trim();
  if (normalizedMode === "Agent") return "agent";
  if (normalizedMode === "Autonom") return "autonomous";
  if (normalizedMode === "Eingesprungen (VR)") return "jumped_in_vr";
  return "manual_ar";
}

function getRiggingVehicleProbeLabel(probeKey) {
  return SR6_RIGGING_VEHICLE_PROBE_LABELS[probeKey] || SR6_RIGGING_VEHICLE_PROBE_LABELS.handling;
}

function getRiggingVehicleGunneryBonus(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return 0;
  }
  return getCombatSpecializationBonus(data.mechanikSpezialisierung, data.mechanikExpertise, ["Geschuetze", "Geschütze"]);
}

function getRiggingVehicleProbeValue(probeKey, mode, data) {
  const modeKey = normalizeRiggingVehicleMode(mode);
  const riggerControl = modeKey === "jumped_in_vr" ? data.riggerkontrolle : 0;
  const gunneryBonus = getRiggingVehicleGunneryBonus(mode, data);
  const gunneryFormulaBonus = gunneryBonus ? " + Geschütze" : "";

  if (probeKey === "damage_resistance") {
    return {
      value: data.rumpf,
      formula: "Rumpf",
    };
  }

  if (modeKey === "autonomous") {
    if (probeKey === "weapon_attack" || probeKey === "ramming_attack") {
      return {
        value: data.zielerfassung + data.sensor,
        formula: "Zielerfassung + Sensor",
      };
    }
    if (probeKey === "defense" || probeKey === "handling") {
      return {
        value: data.ausweichen + data.pilot,
        formula: "Ausweichen + Pilot",
      };
    }
    if (probeKey === "stealth") {
      return {
        value: data.stealth + data.pilot,
        formula: "Stealth + Pilot",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.clearsight + data.sensor,
        formula: "Clearsight + Sensor",
      };
    }
  }

  if (modeKey === "agent") {
    if (probeKey === "weapon_attack" || probeKey === "ramming_attack") {
      return {
        value: data.agentenstufe + data.sensor,
        formula: "Agentenstufe + Sensor",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.agentenstufe + data.sensor,
        formula: "Agentenstufe + Sensor",
      };
    }
    if (probeKey === "defense" || probeKey === "handling" || probeKey === "stealth") {
      return {
        value: data.agentenstufe + data.pilot,
        formula: "Agentenstufe + Pilot",
      };
    }
  }

  if (modeKey === "jumped_in_vr") {
    if (probeKey === "weapon_attack") {
      return {
        value: data.mechanik + data.logik + riggerControl + gunneryBonus,
        formula: `Mechanik + Logik + Riggerkontrolle${gunneryFormulaBonus}`,
      };
    }
    if (probeKey === "stealth") {
      return {
        value: data.heimlichkeit + data.logik + riggerControl,
        formula: "Heimlichkeit + Logik + Riggerkontrolle",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.wahrnehmung + data.sensor + riggerControl,
        formula: "Wahrnehmung + Sensor + Riggerkontrolle",
      };
    }
    return {
      value: data.steuern + data.intuition + riggerControl,
      formula: "Steuern + Intuition + Riggerkontrolle",
    };
  }

  if (probeKey === "weapon_attack") {
    return {
      value: data.mechanik + data.logik + gunneryBonus,
      formula: `Mechanik + Logik${gunneryFormulaBonus}`,
    };
  }
  if (probeKey === "stealth") {
    return {
      value: data.heimlichkeit + data.geschicklichkeit,
      formula: "Heimlichkeit + Geschicklichkeit",
    };
  }
  if (probeKey === "perception") {
    return {
      value: data.wahrnehmung + data.intuition,
      formula: "Wahrnehmung + Intuition",
    };
  }

  return {
    value: data.steuern + data.reaktion,
    formula: "Steuern + Reaktion",
  };
}

function getRiggingVehicleAttackValue(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    return data.agentenstufe + data.sensor;
  }
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return data.manoevrieren + data.sensor;
  }
  return data.steuern + data.sensor;
}

function getRiggingVehicleDefenseValue(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    return data.agentenstufe + data.panzerung;
  }
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return data.manoevrieren + data.panzerung;
  }
  return data.steuern + data.panzerung;
}

function getRiggingVehicleMonitorValue(data) {
  return Math.ceil(data.rumpf / 2) + 8;
}

function buildRiggingVehicleData(values, rowPrefix) {
  return {
    reaktion: parseNumber(values.sr6_attr_reaktion_gesamtwert),
    geschicklichkeit: parseNumber(values.sr6_attr_geschicklichkeit_gesamtwert),
    intuition: parseNumber(values.sr6_attr_intuition_gesamtwert),
    logik: parseNumber(values.sr6_attr_logik_gesamtwert),
    steuern: parseNumber(values.sr6_skill_steuern_gesamtwert),
    mechanik: parseNumber(values.sr6_skill_mechanik_gesamtwert),
    mechanikSpezialisierung: values.sr6_skill_mechanik_spezialisierung,
    mechanikExpertise: values.sr6_skill_mechanik_expertise,
    heimlichkeit: parseNumber(values.sr6_skill_heimlichkeit_gesamtwert),
    wahrnehmung: parseNumber(values.sr6_skill_wahrnehmung_gesamtwert),
    rumpf: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_rumpf`]),
    panzerung: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_panzerung`]),
    pilot: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_pilot`]),
    sensor: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_sensor`]),
    agentenstufe: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_agentenstufe`]),
    riggerkontrolle: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_riggerkontrolle`]),
    manoevrieren: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_manoevrieren`]),
    zielerfassung: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_zielerfassung`]),
    ausweichen: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_ausweichen`]),
    stealth: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_stealth`]),
    clearsight: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_clearsight`]),
  };
}

function appendRiggingVehicleRequestKeys(requestKeys, rowPrefix) {
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_probe`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_modus`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_rumpf`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_panzerung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_pilot`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_sensor`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_agentenstufe`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_riggerkontrolle`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_manoevrieren`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_zielerfassung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_ausweichen`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_stealth`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_clearsight`);
}

function syncRiggingVehicleProbes(callback) {
  const requestKeys = [
    "sr6_attr_reaktion_gesamtwert",
    "sr6_attr_geschicklichkeit_gesamtwert",
    "sr6_attr_intuition_gesamtwert",
    "sr6_attr_logik_gesamtwert",
    "sr6_skill_steuern_gesamtwert",
    "sr6_skill_mechanik_gesamtwert",
    "sr6_skill_mechanik_spezialisierung",
    "sr6_skill_mechanik_expertise",
    "sr6_skill_heimlichkeit_gesamtwert",
    "sr6_skill_wahrnehmung_gesamtwert",
  ];

  getSectionIDs("repeating_sr6riggingfahrzeuge", (sectionIds) => {
    const rowIds = sectionIds || [];
    rowIds.forEach((rowId) => appendRiggingVehicleRequestKeys(requestKeys, `repeating_sr6riggingfahrzeuge_${rowId}`));

    getAttrs(requestKeys, (values) => {
      const updates = {};

      rowIds.forEach((rowId) => {
        const rowPrefix = `repeating_sr6riggingfahrzeuge_${rowId}`;
        const probeKey = values[`${rowPrefix}_sr6_rigging_fahrzeug_probe`] || "handling";
        const mode = values[`${rowPrefix}_sr6_rigging_fahrzeug_modus`] || "Autonom";
        const data = buildRiggingVehicleData(values, rowPrefix);
        const probe = getRiggingVehicleProbeValue(probeKey, mode, data);
        const weaponProbe = getRiggingVehicleProbeValue("weapon_attack", mode, data);

        updates[`${rowPrefix}_sr6_rigging_fahrzeug_waffe`] = "Geschütze";
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_probe_wert`] = String(probe.value);
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_waffe_probe_wert`] = String(weaponProbe.value);
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_angriffswert`] = String(getRiggingVehicleAttackValue(mode, data));
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_verteidigungswert`] = String(getRiggingVehicleDefenseValue(mode, data));
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_zustandsmonitor`] = String(getRiggingVehicleMonitorValue(data));
      });

      if (Object.keys(updates).length === 0) {
        if (typeof callback === "function") callback();
        return;
      }
      setAttrsSilent(updates, callback);
    });
  });
}
// END MODULE: workers/compute/rigging

// END BLOCK: Worker Includes (compute)

// BEGIN BLOCK: Worker Includes (ui)
// BEGIN MODULE: workers/ui/defaults
function resetTabToDefaultOnOpen() {
  setAttrsSilent({ sr6_daten_tab: "fertigkeiten" });
}

function getEditModeResetPayload() {
  const payload = {
    sr6_fertigkeiten_attribute_edit_mode: "0",
    sr6_fertigkeiten_edit_mode: "0",
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
function recomputeAll(callback) {
  const requestKeys = [];
  const updates = {};
  const totals = {};
  const skillTotals = {};

  appendAttributeRequestKeys(requestKeys);
  appendSkillRequestKeys(requestKeys);
  appendCombatRequestKeys(requestKeys);
  appendMatrixRequestKeys(requestKeys);
  appendMagicRequestKeys(requestKeys);
  appendRiggingRequestKeys(requestKeys);
  appendHeaderMonitorRequestKeys(requestKeys);

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, totals, skillTotals, updates);
    computeCombatDerivedFromAttributes(totals, values, updates, skillTotals);
    computeHeaderMonitorDerivedFromAttributes(totals, values, updates);
    computeMagicDerived(values, totals, skillTotals, updates);
    computeRiggingDerived(values, totals, skillTotals, updates);

    setAttrsSilent(updates, callback);
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
    events.push(`change:sr6_skill_${skillName}_spezialisierung`);
    events.push(`change:sr6_skill_${skillName}_expertise`);
  });

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    events.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
    events.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
    events.push(`change:sr6_matrix_handlung_${actionName}_verteidigung_auswahl`);
  });

  events.push("change:sr6_combat_verteidigungswert_modifikator");
  events.push("change:sr6_combat_primaere_panzerung");
  events.push("change:sr6_combat_sekundaere_panzerung");
  events.push("change:sr6_combat_helm");
  events.push("change:sr6_combat_schild");
  events.push("change:sr6_combat_fernkampfangriff_modifikator");
  events.push("change:sr6_combat_projektilwaffen_modifikator");
  events.push("change:sr6_combat_fernkampf_fertigkeit");
  events.push("change:sr6_combat_fernkampf_waffentyp");
  events.push("change:sr6_combat_nahkampfangriff_modifikator");
  events.push("change:sr6_combat_nahkampf_fertigkeit");
  events.push("change:sr6_combat_nahkampf_attribut");
  events.push("change:sr6_combat_nahkampf_waffentyp");
  events.push("change:sr6_verteidigung_physisch_modifikator");
  events.push("change:sr6_schadenswiderstand_physisch_modifikator");
  events.push("change:sr6_combat_fernkampfangriff");
  events.push("change:sr6_combat_nahkampfangriff");
  events.push("change:sr6_verteidigung_physisch_gesamtwert");
  events.push("change:sr6_schadenswiderstand_physisch_gesamtwert");

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_traditionsattribut_1_modifikator");
  events.push("change:sr6_matrix_modus");
  events.push("change:sr6_matrix_angriff");
  events.push("change:sr6_matrix_schleicher");
  events.push("change:sr6_matrix_datenverarbeitung");
  events.push("change:sr6_matrix_firewall");
  events.push("change:sr6_rigging_modus");
  events.push("change:sr6_rigging_angriff");
  events.push("change:sr6_rigging_schleicher");
  events.push("change:sr6_rigging_datenverarbeitung");
  events.push("change:sr6_rigging_firewall");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), () => {
    recomputeAll(() => {
      syncCombatWeaponPools(() => {
        syncRiggingVehicleProbes(() => {
          syncRepeatingSkillTotals();
        });
      });
    });
  });
  on(
    [
      "change:repeating_sr6wissensfertigkeiten:sr6_wissensfertigkeit_name",
      "remove:repeating_sr6wissensfertigkeiten",
      "change:repeating_sr6sprachfertigkeiten:sr6_sprachfertigkeit_name",
      "change:repeating_sr6sprachfertigkeiten:sr6_sprachfertigkeit_niveau",
      "remove:repeating_sr6sprachfertigkeiten",
      "change:repeating_sr6talentsofts:sr6_talentsoft_attribut",
      "change:repeating_sr6talentsofts:sr6_talentsoft_grundwert",
      "change:repeating_sr6talentsofts:sr6_talentsoft_modifikator",
      "remove:repeating_sr6talentsofts",
      "change:repeating_sr6wissenssprachsofts:sr6_wissenssprachsoft_name",
      "remove:repeating_sr6wissenssprachsofts",
    ].join(" "),
    () => {
      syncRepeatingSkillTotals();
    }
  );
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
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_fertigkeit",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_waffentyp",
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
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_fertigkeit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_attribut",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_waffentyp",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schaden",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schadentyp",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_mittel",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_weit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_weit",
      "remove:repeating_sr6nahkampfwaffen",
    ].join(" "),
    (eventInfo) => {
      syncCombatPrimaryWeapons(() => {
        recomputeAll(() => {
          syncCombatWeaponPools();
        });
      }, eventInfo);
    }
  );
  on(
    [
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_probe",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_modus",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_rumpf",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_panzerung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_pilot",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_sensor",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_agentenstufe",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_riggerkontrolle",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_manoevrieren",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_zielerfassung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_ausweichen",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_stealth",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_clearsight",
      "change:sr6_skill_mechanik_spezialisierung",
      "change:sr6_skill_mechanik_expertise",
      "remove:repeating_sr6riggingfahrzeuge",
    ].join(" "),
    () => {
      syncRiggingVehicleProbes();
    }
  );
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerNumberStepperEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToDefaultOnOpen();
    resetEditModesOnOpen();
    syncCombatArmorSelections(() => {
      syncCombatPrimaryWeapons(() => {
        recomputeAll(() => {
          syncCombatWeaponPools(() => {
            syncRiggingVehicleProbes(() => {
              syncRepeatingSkillTotals();
            });
          });
        });
      });
    });
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register

// END BLOCK: Worker Includes (register)
