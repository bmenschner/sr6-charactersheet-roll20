// BEGIN MODULE: workers/rolls/edge
function runEdgeTokenChange(delta) {
  getAttrs(["sr6_edge_aktuell"], (values) => {
    const edgeCurrent = clampNumber(parseNumber(values.sr6_edge_aktuell) + delta, 0, 7);
    setAttrsSilent({ sr6_edge_aktuell: String(edgeCurrent) });

    const actionText = delta > 0 ? "hinzugefügt" : "verloren";
    const chatMessage = buildEdgeTokenMessage(actionText, edgeCurrent);
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}

function runEdgeTokenPlus() {
  runEdgeTokenChange(1);
}

function runEdgeTokenMinus() {
  runEdgeTokenChange(-1);
}
// END MODULE: workers/rolls/edge
