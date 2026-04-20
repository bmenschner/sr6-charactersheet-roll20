// BEGIN MODULE: workers/compute/combat
function computeCombatDerivedFromAttributes(totals, values, updates) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);
}
// END MODULE: workers/compute/combat
