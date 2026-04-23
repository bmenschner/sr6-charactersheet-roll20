// BEGIN MODULE: workers/core/register
function recomputeAll() {
  const requestKeys = [];
  const updates = {};
  const totals = {};
  const skillTotals = {};

  appendAttributeRequestKeys(requestKeys);
  appendSkillRequestKeys(requestKeys);
  appendCombatRequestKeys(requestKeys);
  appendMatrixRequestKeys(requestKeys);
  appendMagicRequestKeys(requestKeys);
  appendRiggingRequestKeys(requestKeys);
  appendHeaderMonitorRequestKeys(requestKeys);

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, totals, updates);
    computeCombatDerivedFromAttributes(totals, values, updates, skillTotals);
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

  events.push("change:sr6_combat_verteidigungswert_modifikator");
  events.push("change:sr6_combat_primaere_panzerung");
  events.push("change:sr6_combat_sekundaere_panzerung");
  events.push("change:sr6_combat_helm");
  events.push("change:sr6_combat_schild");
  events.push("change:sr6_combat_fernkampfangriff_modifikator");
  events.push("change:sr6_combat_nahkampfangriff_modifikator");
  events.push("change:sr6_verteidigung_physisch_modifikator");
  events.push("change:sr6_schadenswiderstand_physisch_modifikator");
  events.push("change:sr6_combat_fernkampfangriff");
  events.push("change:sr6_combat_nahkampfangriff");
  events.push("change:sr6_verteidigung_physisch_gesamtwert");
  events.push("change:sr6_schadenswiderstand_physisch_gesamtwert");

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_traditionsattribut_2");
  events.push("change:sr6_matrix_modus");
  events.push("change:sr6_matrix_datenverarbeitung");
  events.push("change:sr6_rigging_modus");
  events.push("change:sr6_rigging_datenverarbeitung");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), recomputeAll);
  on(
    [
      "change:repeating_sr6panzerung:sr6_panzerung_ist_primaer",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_sekundaer",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_helm",
      "change:repeating_sr6panzerung:sr6_panzerung_ist_schild",
      "change:repeating_sr6panzerung:sr6_panzerung_name",
      "change:repeating_sr6panzerung:sr6_panzerung_verteidigungswert",
      "remove:repeating_sr6panzerung",
    ].join(" "),
    (eventInfo) => {
      syncCombatArmorSelections(recomputeAll, eventInfo);
    }
  );
  on(
    [
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_ist_primaer",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampfwaffe",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_schaden",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_munition",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_modus",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_s_nah",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_nah",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_mittel",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_weit",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_s_weit",
      "remove:repeating_sr6fernkampfwaffen",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_ist_primaer",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampfwaffe",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schaden",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_mittel",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_weit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_weit",
      "remove:repeating_sr6nahkampfwaffen",
    ].join(" "),
    (eventInfo) => {
      syncCombatPrimaryWeapons(recomputeAll, eventInfo);
    }
  );
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToAllgemeinOnOpen();
    resetEditModesOnOpen();
    syncCombatArmorSelections(() => {
      syncCombatPrimaryWeapons(recomputeAll);
    });
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register
