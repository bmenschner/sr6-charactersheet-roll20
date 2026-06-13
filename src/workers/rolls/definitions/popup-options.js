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
