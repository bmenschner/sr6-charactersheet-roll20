// BEGIN MODULE: workers/core/register
function recomputeAll() {
  const requestKeys = [];
  const updates = {};
  const totals = {};
  const skillTotals = {};

  appendAttributeRequestKeys(requestKeys);
  appendSkillRequestKeys(requestKeys);
  appendMatrixRequestKeys(requestKeys);
  appendMagicRequestKeys(requestKeys);
  appendHeaderMonitorRequestKeys(requestKeys);

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, updates);
    computeCombatDerivedFromAttributes(totals, values, updates);
    computeHeaderMonitorDerivedFromAttributes(totals, values, updates);
    computeMagicDerived(values, totals, skillTotals, updates);
    computeRiggingDerived(values, totals, skillTotals, updates);

    setAttrsSilent(updates);
  });
}

function buildRecalcEvents() {
  const events = [];

  SR6_ATTRIBUTES.forEach((attributeName) => {
    events.push(`change:sr6_attr_${attributeName}_grundwert`);
    events.push(`change:sr6_attr_${attributeName}_modifikator`);
  });

  SR6_SKILLS.forEach((skillName) => {
    events.push(`change:sr6_skill_${skillName}_grundwert`);
    events.push(`change:sr6_skill_${skillName}_modifikator`);
  });

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    events.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
    events.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
  });

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_traditionsattribut_2");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), recomputeAll);
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToAllgemeinOnOpen();
    resetEditModesOnOpen();
    recomputeAll();
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register
