// BEGIN MODULE: workers/rolls/definitions/validation.js
// Leichte Laufzeitpruefung der zusammengesetzten Roll-Definitionen, damit Strukturfehler im Worker sichtbar werden.
function validateRollDefinition(definition, index) {
  const warnings = [];
  if (!definition || typeof definition !== "object") {
    warnings.push(`Roll definition ${index} is not an object.`);
    return warnings;
  }
  if (!definition.id) {
    warnings.push(`Roll definition ${index} has no id.`);
  }
  if (!definition.titleFallback && !definition.fixedTitle) {
    warnings.push(`Roll definition ${definition.id || index} has no title fallback.`);
  }
  if (definition.popupFields && !Array.isArray(definition.popupFields)) {
    warnings.push(`Roll definition ${definition.id || index} has invalid popupFields.`);
  }
  return warnings;
}

function validateRollDefinitions(definitions) {
  const warnings = [];
  const seenIds = {};
  const list = Array.isArray(definitions) ? definitions : [];
  list.forEach((definition, index) => {
    validateRollDefinition(definition, index).forEach((warning) => warnings.push(warning));
    if (definition && definition.id) {
      if (seenIds[definition.id]) {
        warnings.push(`Duplicate roll definition id: ${definition.id}`);
      }
      seenIds[definition.id] = true;
    }
  });
  if (typeof console !== "undefined" && console.warn && warnings.length > 0) {
    warnings.forEach((warning) => console.warn(`[SR6 Roll Definition] ${warning}`));
  }
  return warnings;
}
// END MODULE: workers/rolls/definitions/validation.js
