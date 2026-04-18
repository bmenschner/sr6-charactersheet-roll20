// BEGIN MODULE: worker ui state
// Migration: altes Checkbox-Format konnte "on" in Helm hinterlassen.
function normalizeLegacyCheckboxValues() {
  getAttrs(["sr6_combat_helm"], (values) => {
    if ((values.sr6_combat_helm || "").trim().toLowerCase() === "on") {
      setAttrs({ sr6_combat_helm: "" }, { silent: true });
    }
  });
}

// Beim Laden immer mit dem Tab "Allgemein" starten.
function resetTabToAllgemeinOnOpen() {
  setAttrs({ sr6_daten_tab: "allgemein" }, { silent: true });
}

// Beim Laden alle Editier-Toggles auf Listenansicht (inaktiv) setzen.
function getEditModeResetPayload() {
  return {
    sr6_allgemein_attribute_edit_mode: "0",
    sr6_allgemein_initiative_edit_mode: "0",
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
  };
}

function resetEditModesOnOpen() {
  setAttrs(getEditModeResetPayload(), { silent: true });
}
// END MODULE: worker ui state
