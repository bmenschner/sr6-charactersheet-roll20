// BEGIN MODULE: workers/rolls/index
function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:probe_popup_test", runTestPopupProbeRoll);
  on("clicked:probe_popup_confirm", runGlobalPopupProbeConfirm);
  on("clicked:probe_popup_cancel", runGlobalPopupProbeCancel);
}

function registerEdgeTokenEvents() {
  on("clicked:sr6_edge_token_plus", runEdgeTokenPlus);
  on("clicked:sr6_edge_token_minus", runEdgeTokenMinus);
}
// END MODULE: workers/rolls/index
