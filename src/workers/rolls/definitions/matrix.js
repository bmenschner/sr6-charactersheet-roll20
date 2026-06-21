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
      extraFields: ["Basiswert", "Modifikator"],
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
