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
