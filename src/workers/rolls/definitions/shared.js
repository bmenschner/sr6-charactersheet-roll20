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
