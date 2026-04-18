// BEGIN MODULE: workers/compute/combat
function computeCombatDerivedFromAttributes(totals, updates) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const konstitution = totals.konstitution || 0;
  const willenskraft = totals.willenskraft || 0;
  const edge = totals.edge || 0;

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);
  updates.sr6_derived_verteidigung_basis = String(reaktion + intuition);
  updates.sr6_derived_koerperlicher_monitor_max = String(8 + Math.ceil(konstitution / 2));
  updates.sr6_derived_geistiger_monitor_max = String(8 + Math.ceil(willenskraft / 2));
  updates.sr6_derived_edge_basis = String(edge);
}
// END MODULE: workers/compute/combat
