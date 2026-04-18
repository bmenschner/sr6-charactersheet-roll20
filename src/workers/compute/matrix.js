// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
  });
}

function computeMatrixTotals(values, updates) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/matrix
