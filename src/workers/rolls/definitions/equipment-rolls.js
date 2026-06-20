// BEGIN MODULE: workers/rolls/definitions/equipment-rolls.js
// Roll-Definitionen fuer Ausruestungs- und einfache Stufenproben.
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
  {
    id: "sin",
    probeModel: "equipment_probe",
    matchField: "SIN",
    matchPoolPrefix: "sr6_sin_",
    titleMode: "field-short",
    titleField: "SIN",
    primaryFields: ["SIN"],
    extraFields: ["Stufe"],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "SIN",
  },
];
// END MODULE: workers/rolls/definitions/equipment-rolls.js
