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
