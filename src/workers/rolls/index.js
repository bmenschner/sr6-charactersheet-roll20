// BEGIN MODULE: workers/rolls/index
function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6zauber:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6wissensfertigkeiten:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6sprachfertigkeiten:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6talentsofts:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6wissenssprachsofts:probe", runSuccessProbeRoll);
  on("clicked:probe_popup_test", runTestPopupProbeRoll);
  on("clicked:probe_popup_confirm", runGlobalPopupProbeConfirm);
  on("clicked:probe_popup_cancel", runGlobalPopupProbeCancel);
}

function registerEdgeTokenEvents() {
  on("clicked:sr6_edge_token_plus", runEdgeTokenPlus);
  on("clicked:sr6_edge_token_minus", runEdgeTokenMinus);
}

function registerNumberStepperEvents() {
  on("clicked:sr6_number_step", runNumberStepperAdjust);
  const repeatingSections = [
    "sr6adeptenkraefte",
    "sr6ausruestung",
    "sr6bioware",
    "sr6connections",
    "sr6cyberware",
    "sr6fernkampfwaffen",
    "sr6foki",
    "sr6geister",
    "sr6lebensstil",
    "sr6matrixgeraete",
    "sr6matrixprogramme",
    "sr6matrixsprites",
    "sr6matrixstrukturen",
    "sr6matrixzubehoer",
    "sr6nahkampfwaffen",
    "sr6panzerung",
    "sr6riggingagenten",
    "sr6riggingfahrzeuge",
    "sr6riggingmanoever",
    "sr6riggingprogramme",
    "sr6riggingzubehoer",
    "sr6rituale",
    "sr6sin",
    "sr6sprachfertigkeiten",
    "sr6talentsofts",
    "sr6wissensfertigkeiten",
    "sr6wissenssprachsofts",
    "sr6zauber",
  ];

  repeatingSections.forEach((sectionName) => {
    // Stable repeater hook: lets the handler filter real stepper clicks via button value payload.
    on(`clicked:repeating_${sectionName}`, runNumberStepperAdjust);
  });
}
// END MODULE: workers/rolls/index
