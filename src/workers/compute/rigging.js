// BEGIN MODULE: workers/compute/rigging
function appendRiggingRequestKeys(requestKeys) {
  requestKeys.push("sr6_rigging_modus");
  requestKeys.push("sr6_rigging_datenverarbeitung");
}

function resolveRiggingInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function computeRiggingDerived(values, totals, _skillTotals, updates) {
  const riggingInitiativeMode = resolveRiggingInitiativeMode(values.sr6_rigging_modus);
  const riggingBasis =
    riggingInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + parseNumber(values.sr6_rigging_datenverarbeitung)
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_rigging_initiative = String(riggingBasis);
  updates.sr6_rigging_initiative_w6 = String(riggingInitiativeMode.w6);
}
// END MODULE: workers/compute/rigging
