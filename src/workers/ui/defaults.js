// BEGIN MODULE: workers/ui/defaults
function resetTabToAllgemeinOnOpen() {
  setAttrsSilent({ sr6_daten_tab: "allgemein" });
}

function getEditModeResetPayload() {
  const payload = {
    sr6_allgemein_attribute_edit_mode: "0",
    sr6_fertigkeiten_attribute_edit_mode: "0",
    sr6_allgemein_initiative_edit_mode: "0",
    sr6_allgemein_fertigkeiten_view: "fertigkeiten",
    sr6_fertigkeiten_edit_mode: "0",
    sr6_allgemein_kampf_edit_mode: "0",
    sr6_allgemein_verteidigung_edit_mode: "0",
    sr6_allgemein_schadenswiderstand_edit_mode: "0",
    sr6_magic_zauber_edit_mode: "0",
    sr6_magic_adeptenkraefte_edit_mode: "0",
    sr6_magic_foki_edit_mode: "0",
    sr6_magic_metamagie_edit_mode: "0",
    sr6_magic_rituale_edit_mode: "0",
    sr6_magic_geister_edit_mode: "0",
    sr6_matrix_programme_edit_mode: "0",
    sr6_matrix_geraete_edit_mode: "0",
    sr6_matrix_handlungen_edit_mode: "0",
    sr6_rigging_fahrzeuge_edit_mode: "0",
    sr6_rigging_programme_edit_mode: "0",
    sr6_rigging_zubehoer_edit_mode: "0",
    sr6_rigging_agenten_edit_mode: "0",
    sr6_rigging_manoever_edit_mode: "0",
    sr6_ausruestung_edit_mode: "0",
    sr6_cyberware_edit_mode: "0",
    sr6_bioware_edit_mode: "0",
    sr6_sin_edit_mode: "0",
    sr6_lebensstil_edit_mode: "0",
    sr6_setting_popup_mods: "eigen",
    sr6_roll_popup_open: "0",
    sr6_roll_popup_definition: "",
  };

  Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
    for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
      payload[`sr6_roll_popup_slot_${slot}_option_${optionSet}`] = "0";
      payload[`sr6_roll_popup_value_${slot}_select_${optionSet}`] = "";
    }
  });

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_number`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_text`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_select`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_requires_previous_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_label`] = "";
    payload[`sr6_roll_popup_value_${slot}_number`] = "0";
    payload[`sr6_roll_popup_value_${slot}_text`] = "";
    payload[`sr6_roll_popup_value_${slot}_checkbox`] = "0";
  }

  return payload;
}

function resetEditModesOnOpen() {
  setAttrsSilent(getEditModeResetPayload());
}
// END MODULE: workers/ui/defaults
