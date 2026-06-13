// BEGIN MODULE: workers/rolls/definitions/registry.js
// Setzt alle Domain-Definitionen in der Reihenfolge zusammen, in der der Resolver sie prueft.
const SR6_ROLL_DEFINITIONS = [
  ...SR6_ROLL_DEFINITIONS_CORE,
  ...SR6_ROLL_DEFINITIONS_SKILLS,
  ...SR6_ROLL_DEFINITIONS_EQUIPMENT,
  ...SR6_ROLL_DEFINITIONS_MAGIC,
  ...SR6_ROLL_DEFINITIONS_MATRIX,
  ...SR6_ROLL_DEFINITIONS_RIGGING,
  ...SR6_ROLL_DEFINITIONS_COMBAT,
  ...SR6_ROLL_DEFINITIONS_FALLBACK,
];

const SR6_ROLL_DEFINITION_VALIDATION_WARNINGS = validateRollDefinitions(SR6_ROLL_DEFINITIONS);
// END MODULE: workers/rolls/definitions/registry.js
