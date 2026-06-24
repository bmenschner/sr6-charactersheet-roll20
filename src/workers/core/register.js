// BEGIN MODULE: workers/core/register
function recomputeAll(callback) {
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
    computeMatrixTotals(values, totals, skillTotals, updates);
    computeCombatDerivedFromAttributes(totals, values, updates, skillTotals);
    computeHeaderMonitorDerivedFromAttributes(totals, values, updates);
    computeMagicDerived(values, totals, skillTotals, updates);
    computeRiggingDerived(values, totals, skillTotals, updates);

    setAttrsSilent(updates, callback);
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
    events.push(`change:sr6_skill_${skillName}_spezialisierung`);
    events.push(`change:sr6_skill_${skillName}_expertise`);
  });

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    events.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
    events.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
    events.push(`change:sr6_matrix_handlung_${actionName}_verteidigung_auswahl`);
  });

  events.push("change:sr6_combat_verteidigungswert_modifikator");
  events.push("change:sr6_combat_primaere_panzerung");
  events.push("change:sr6_combat_sekundaere_panzerung");
  events.push("change:sr6_combat_helm");
  events.push("change:sr6_combat_schild");
  events.push("change:sr6_combat_fernkampfangriff_modifikator");
  events.push("change:sr6_combat_fernkampf_fertigkeit");
  events.push("change:sr6_combat_fernkampf_waffentyp");
  events.push("change:sr6_combat_nahkampfangriff_modifikator");
  events.push("change:sr6_combat_nahkampf_fertigkeit");
  events.push("change:sr6_combat_nahkampf_attribut");
  events.push("change:sr6_combat_nahkampf_waffentyp");
  events.push("change:sr6_verteidigung_physisch_modifikator");
  events.push("change:sr6_schadenswiderstand_physisch_modifikator");
  events.push("change:sr6_combat_fernkampfangriff");
  events.push("change:sr6_combat_nahkampfangriff");
  events.push("change:sr6_verteidigung_physisch_gesamtwert");
  events.push("change:sr6_schadenswiderstand_physisch_gesamtwert");

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_angriffswert_modifikator");
  events.push("change:sr6_magic_astralkampf_angriffswert_modifikator");
  events.push("change:sr6_magic_astralkampf_verteidigungswert_modifikator");
  events.push("change:sr6_initiative_physisch_w6");
  events.push("change:sr6_matrix_modus");
  events.push("change:sr6_matrix_angriff");
  events.push("change:sr6_matrix_angriff_modifikator");
  events.push("change:sr6_matrix_schleicher");
  events.push("change:sr6_matrix_schleicher_modifikator");
  events.push("change:sr6_matrix_datenverarbeitung");
  events.push("change:sr6_matrix_datenverarbeitung_modifikator");
  events.push("change:sr6_matrix_firewall");
  events.push("change:sr6_matrix_firewall_modifikator");
  events.push("change:sr6_matrix_cyberbuchse_initiative_w6");
  events.push("change:sr6_matrix_angriffswert_modifikator");
  events.push("change:sr6_matrix_verteidigungswert_modifikator");
  events.push("change:sr6_rigging_modus");
  events.push("change:sr6_rigging_initiative_modifikator");
  events.push("change:sr6_rigging_initiative_w6_modifikator");
  events.push("change:sr6_rigging_angriff");
  events.push("change:sr6_rigging_schleicher");
  events.push("change:sr6_rigging_datenverarbeitung");
  events.push("change:sr6_rigging_firewall");
  events.push("change:sr6_rigging_angriffswert_modifikator");
  events.push("change:sr6_rigging_verteidigungswert_modifikator");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), () => {
    recomputeAll(() => {
      syncCombatWeaponPools(() => {
        syncRiggingVehicleProbes(() => {
          syncRepeatingSkillTotals();
        });
      });
    });
  });
  on(
    [
      "change:repeating_sr6wissensfertigkeiten:sr6_wissensfertigkeit_name",
      "remove:repeating_sr6wissensfertigkeiten",
      "change:repeating_sr6sprachfertigkeiten:sr6_sprachfertigkeit_name",
      "change:repeating_sr6sprachfertigkeiten:sr6_sprachfertigkeit_niveau",
      "remove:repeating_sr6sprachfertigkeiten",
      "change:repeating_sr6talentsofts:sr6_talentsoft_attribut",
      "change:repeating_sr6talentsofts:sr6_talentsoft_grundwert",
      "change:repeating_sr6talentsofts:sr6_talentsoft_modifikator",
      "remove:repeating_sr6talentsofts",
      "change:repeating_sr6wissenssprachsofts:sr6_wissenssprachsoft_name",
      "remove:repeating_sr6wissenssprachsofts",
    ].join(" "),
    () => {
      syncRepeatingSkillTotals();
    }
  );
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
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_fertigkeit",
      "change:repeating_sr6fernkampfwaffen:sr6_fernkampf_waffentyp",
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
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_fertigkeit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_attribut",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_waffentyp",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schaden",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_schadentyp",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_nah",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_mittel",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_weit",
      "change:repeating_sr6nahkampfwaffen:sr6_nahkampf_s_weit",
      "remove:repeating_sr6nahkampfwaffen",
    ].join(" "),
    (eventInfo) => {
      syncCombatPrimaryWeapons(() => {
        recomputeAll(() => {
          syncCombatWeaponPools();
        });
      }, eventInfo);
    }
  );
  on(
    [
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_probe",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_modus",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_handling",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_handling_gelaende",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_handling_umgebung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_beschleunigung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_intervall",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_geschwindigkeit",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_rumpf",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_panzerung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_pilot",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_sensor",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_handling_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_beschleunigung_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_intervall_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_geschwindigkeit_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_rumpf_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_panzerung_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_pilot_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_sensor_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_agentenstufe",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_riggerkontrolle",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_manoevrieren",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_zielerfassung",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_ausweichen",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_stealth",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_clearsight",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_angriffswert_modifikator",
      "change:repeating_sr6riggingfahrzeuge:sr6_rigging_fahrzeug_verteidigungswert_modifikator",
      "change:sr6_skill_mechanik_spezialisierung",
      "change:sr6_skill_mechanik_expertise",
      "remove:repeating_sr6riggingfahrzeuge",
    ].join(" "),
    () => {
      syncRiggingVehicleProbes();
    }
  );
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerNumberStepperEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToDefaultOnOpen();
    resetEditModesOnOpen();
    syncCombatArmorSelections(() => {
      syncCombatPrimaryWeapons(() => {
        recomputeAll(() => {
          syncCombatWeaponPools(() => {
            syncRiggingVehicleProbes(() => {
              syncRepeatingSkillTotals();
            });
          });
        });
      });
    });
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register
