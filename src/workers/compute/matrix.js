// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  requestKeys.push("sr6_matrix_modus");
  requestKeys.push("sr6_matrix_datenverarbeitung");
  requestKeys.push("sr6_matrix_firewall");
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
  });
}

function resolveMatrixInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function computeMatrixTotals(values, totals, updates) {
  const matrixInitiativeMode = resolveMatrixInitiativeMode(values.sr6_matrix_modus);
  const matrixBasis =
    matrixInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + parseNumber(values.sr6_matrix_datenverarbeitung)
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_matrix_initiative = String(matrixBasis);
  updates.sr6_matrix_initiative_w6 = String(matrixInitiativeMode.w6);

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/matrix
