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
