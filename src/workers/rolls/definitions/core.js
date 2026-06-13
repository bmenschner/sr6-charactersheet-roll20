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
