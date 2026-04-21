// BEGIN MODULE: workers/rolls/probe
function normalizePopupState(popupState) {
  if (typeof popupState === "number") {
    return { poolMod: popupState, rows: [] };
  }

  if (!popupState || typeof popupState !== "object") {
    return { poolMod: 0, rows: [] };
  }

  return {
    poolMod: parseNumber(popupState.poolMod),
    rows: Array.isArray(popupState.rows) ? popupState.rows : [],
  };
}

function runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState = 0) {
  if (!rawTemplate) return;

  const context = buildRequestedAttributes(rawTemplate, repeatingRowPrefix);
  const normalizedPopupState = normalizePopupState(popupState);

  getAttrs(context.requestedAttributes, (values) => {
    const lookupAttr = buildAttrLookup(values, repeatingRowPrefix);
    const resolvedFields = buildResolvedFields(context.fields, lookupAttr);
    const rows = buildProbeRows(resolvedFields, context.definition);
    const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);

    if (!context.poolAttribute) {
      const chatMessage = buildSr6ProbeMessage({
        name: name,
        rows: rows,
        pool: resolvedFields.Pool || "",
        erfolge: resolvedFields.Erfolge || "",
        details: resolvedFields.Details || "",
        isGlitch: false,
      });
      startRoll(chatMessage, (rollResult) => {
        finishRoll(rollResult.rollId);
      });
      return;
    }

    const computation = buildProbeComputation(lookupAttr, context.poolAttribute, normalizedPopupState.poolMod);
    const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

    if (computation.monitorPoolMod !== 0) {
      rows.push({ label: "Pool-Basis", value: `${computation.poolBasis}` });
      rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
    }
    normalizedPopupState.rows.forEach((popupRow) => rows.push(popupRow));

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      pool: `${computation.pool}`,
      erfolge: erfolgeValue,
      details: buildDiceDetails(computation.diceResults),
      detailsDice: buildDetailsDice(computation.diceResults),
      isGlitch: computation.isGlitch,
    });
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}
// END MODULE: workers/rolls/probe
