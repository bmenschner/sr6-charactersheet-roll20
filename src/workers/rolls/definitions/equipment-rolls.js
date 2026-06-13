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
