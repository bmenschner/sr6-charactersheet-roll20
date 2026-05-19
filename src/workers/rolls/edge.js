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

function buildEdgeAfterRollPopupPayload() {
  const payload = buildPopupResetPayload();
  payload.sr6_roll_popup_definition = "edge_after_roll";
  payload.sr6_roll_popup_template = "";
  payload.sr6_roll_popup_row_prefix = "";

  payload.sr6_roll_popup_slot_9_active = "1";
  payload.sr6_roll_popup_slot_9_visible = "1";
  payload.sr6_roll_popup_slot_9_label = "Edge einsetzen";
  payload.sr6_roll_popup_slot_9_is_select = "1";
  payload.sr6_roll_popup_slot_9_option_edge_after_boost = "1";
  payload.sr6_roll_popup_value_9_select_edge_after_boost = "reroll_1";

  payload.sr6_roll_popup_slot_10_active = "1";
  payload.sr6_roll_popup_slot_10_visible = "1";
  payload.sr6_roll_popup_slot_10_label = "Anzahl";
  payload.sr6_roll_popup_slot_10_is_number = "1";
  payload.sr6_roll_popup_value_10_number = "1";

  return payload;
}

function runEdgeAfterRollOpen() {
  setAttrsSilent({
    ...buildEdgeAfterRollPopupPayload(),
    sr6_roll_popup_open: "1",
  });
}

function parseEdgeLastRollDice(value) {
  return `${value || ""}`
    .split(",")
    .map((die) => parseNumber(die))
    .filter((die) => die >= 1 && die <= 6);
}

function buildEdgeAfterRollRows(boostLabel, lastRollName, rows) {
  return [
    { label: "Ursprünglicher Wurf", value: lastRollName || "Letzter Wurf" },
    { label: "Edge-Boost", value: boostLabel },
    ...rows,
  ];
}

function runEdgeAfterRollConfirm(values) {
  const boost = `${values.sr6_roll_popup_value_9_select_edge_after_boost || "reroll_1"}`.trim();
  const requestedAmount = Math.max(1, parseNumber(values.sr6_roll_popup_value_10_number) || 1);
  const attrs = [
    "sr6_edge_last_roll_name",
    "sr6_edge_last_roll_dice",
    "sr6_edge_last_roll_successes",
    "sr6_edge_last_roll_is_glitch",
    "sr6_edge_last_roll_is_critical_glitch",
  ];

  getAttrs(attrs, (lastValues) => {
    const lastRollName = lastValues.sr6_edge_last_roll_name || "Letzter Wurf";
    const diceResults = parseEdgeLastRollDice(lastValues.sr6_edge_last_roll_dice);
    const previousSuccesses = parseNumber(lastValues.sr6_edge_last_roll_successes);
    const isGlitch = `${lastValues.sr6_edge_last_roll_is_glitch || ""}` === "1";
    const isCriticalGlitch = `${lastValues.sr6_edge_last_roll_is_critical_glitch || ""}` === "1";
    const rows = [];
    let pool = "";
    let successes = "";
    let detailsDice = [];

    if (diceResults.length === 0) {
      rows.push({ label: "Hinweis", value: "Kein letzter Würfelwurf gespeichert." });
      const chatMessage = buildSr6ProbeMessage({
        name: "Edge einsetzen",
        rows: buildEdgeAfterRollRows("Nicht möglich", lastRollName, rows),
        edgeAction: false,
      });
      startRoll(chatMessage, (rollResult) => finishRoll(rollResult.rollId));
      return;
    }

    if (boost === "reroll_failures") {
      const failures = diceResults.filter((die) => die < 5);
      if (isGlitch || isCriticalGlitch) {
        rows.push({ label: "Hinweis", value: "Misserfolge neu würfeln ist bei Patzer/Kritischem Patzer nicht erlaubt." });
        successes = `${previousSuccesses}`;
      } else {
        const rerolledDice = failures.map(() => rollD6());
        const newSuccesses = rerolledDice.filter((die) => die >= 5).length;
        pool = `${rerolledDice.length}`;
        successes = `${previousSuccesses + newSuccesses}`;
        detailsDice = buildDetailsDice(rerolledDice);
        rows.push({ label: "Misserfolge", value: `${failures.length}` });
        rows.push({ label: "Neue Erfolge", value: `${newSuccesses}` });
        rows.push({ label: "Gesamterfolge", value: `${previousSuccesses + newSuccesses}` });
      }
    } else if (boost === "add_1") {
      const fours = diceResults.filter((die) => die === 4).length;
      const appliedAmount = Math.min(requestedAmount, fours);
      const newTotal = previousSuccesses + appliedAmount;
      successes = `${newTotal}`;
      rows.push({ label: "Gewählte Anwendung", value: `${requestedAmount}` });
      rows.push({ label: "Vorhandene 4en", value: `${fours}` });
      rows.push({
        label: "Hinweis",
        value: appliedAmount > 0
          ? `${appliedAmount} Würfel wurde um +1 erhöht.`
          : "Keine 4 vorhanden, die zu einem Erfolg erhöht werden kann.",
      });
      rows.push({ label: "Gesamterfolge", value: `${newTotal}` });
    } else {
      const rerolledDice = Array.from({ length: requestedAmount }, () => rollD6());
      const newSuccesses = rerolledDice.filter((die) => die >= 5).length;
      pool = `${requestedAmount}`;
      successes = `${newSuccesses}`;
      detailsDice = buildDetailsDice(rerolledDice);
      rows.push({ label: "Neu gewürfelte Würfel", value: `${requestedAmount}` });
      rows.push({ label: "Neue Erfolge", value: `${newSuccesses}` });
      rows.push({ label: "Hinweis", value: "Ersetze damit manuell entsprechend viele Würfel aus dem ursprünglichen Wurf." });
    }

    const boostLabels = {
      reroll_1: "1 Würfel neu würfeln",
      add_1: "+1 auf einen Würfel",
      reroll_failures: "Misserfolge neu würfeln",
    };
    const chatMessage = buildSr6ProbeMessage({
      name: "Edge einsetzen",
      rows: buildEdgeAfterRollRows(boostLabels[boost] || "Edge-Boost", lastRollName, rows),
      pool: pool,
      erfolge: successes,
      detailsDice: detailsDice,
      edgeAction: false,
    });

    startRoll(chatMessage, (rollResult) => finishRoll(rollResult.rollId));
  });
}
// END MODULE: workers/rolls/edge
