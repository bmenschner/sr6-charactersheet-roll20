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
