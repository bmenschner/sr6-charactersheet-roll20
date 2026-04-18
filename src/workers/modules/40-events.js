// BEGIN MODULE: worker events
// Eventliste: reagiert auf Aenderungen in allen relevanten Attributfeldern.
const recalcEvents = [];

SR6_ATTRIBUTES.forEach((attributeName) => {
  recalcEvents.push(`change:sr6_attr_${attributeName}_grundwert`);
  recalcEvents.push(`change:sr6_attr_${attributeName}_modifikator`);
});

SR6_SKILLS.forEach((skillName) => {
  recalcEvents.push(`change:sr6_skill_${skillName}_grundwert`);
  recalcEvents.push(`change:sr6_skill_${skillName}_modifikator`);
});

SR6_MATRIX_ACTIONS.forEach((actionName) => {
  recalcEvents.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
  recalcEvents.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
});

recalcEvents.push("change:sr6_magic_traditionsattribut_1");
recalcEvents.push("change:sr6_magic_traditionsattribut_2");

on(recalcEvents.join(" "), recomputeAll);

on("sheet:opened", () => {
  resetTabToAllgemeinOnOpen();
  resetEditModesOnOpen();
  normalizeLegacyCheckboxValues();
  recomputeAll();
});

on("change:sr6_combat_helm", normalizeLegacyCheckboxValues);
// END MODULE: worker events
