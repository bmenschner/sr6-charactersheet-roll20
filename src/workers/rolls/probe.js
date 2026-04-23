// BEGIN MODULE: workers/rolls/probe
function normalizePopupState(popupState) {
  if (typeof popupState === "number") {
    return { poolMod: popupState, attackValueMod: 0, damageMod: 0, selectedValues: {}, rows: [] };
  }

  if (!popupState || typeof popupState !== "object") {
    return { poolMod: 0, attackValueMod: 0, damageMod: 0, selectedValues: {}, rows: [] };
  }

  return {
    poolMod: parseNumber(popupState.poolMod),
    attackValueMod: parseNumber(popupState.attackValueMod),
    damageMod: parseNumber(popupState.damageMod),
    selectedValues: popupState.selectedValues && typeof popupState.selectedValues === "object" ? popupState.selectedValues : {},
    rows: Array.isArray(popupState.rows) ? popupState.rows : [],
  };
}

function resolveMeleePopupAttributePoolOverride(definition, resolvedFields, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.popupPoolAttributeOverride !== "melee_attribute") {
    return null;
  }

  const selectedAttribute = `${(((popupState || {}).selectedValues || {}).attribute_context) || ""}`.trim();
  const currentAttribute = `${(resolvedFields && resolvedFields.Attribut) || ""}`.trim();

  if (!selectedAttribute || !currentAttribute || selectedAttribute === currentAttribute) {
    return null;
  }

  const geschicklichkeit = parseNumber((resolvedFields && resolvedFields["Geschicklichkeit-Wert"]) || 0);
  const staerke = parseNumber((resolvedFields && resolvedFields["Stärke-Wert"]) || 0);
  const currentAttributeValue = currentAttribute === "Stärke" ? staerke : geschicklichkeit;
  const selectedAttributeValue = selectedAttribute === "Stärke" ? staerke : geschicklichkeit;
  const currentPoolBasis = parseNumber(lookupAttr(poolAttribute));

  return {
    selectedAttribute: selectedAttribute,
    currentAttribute: currentAttribute,
    poolBasisOverride: currentPoolBasis - currentAttributeValue + selectedAttributeValue,
  };
}

function resolvePopupDerivedSourceAttr(result, resolvedFields) {
  if (!result || !resolvedFields) {
    return "";
  }

  if (result.sourceByRange && resolvedFields.Reichweite) {
    return result.sourceByRange[resolvedFields.Reichweite] || "";
  }

  return result.sourceAttr || "";
}

function buildPopupDerivedResultRows(definition, lookupAttr, poolAttribute, resolvedFields, popupState) {
  const derivedResults = getPopupDerivedResults(definition);
  const rows = [];

  derivedResults.forEach((result) => {
    const resultKind = result.kind || "";
    const modifier = resultKind === "attack_value"
      ? parseNumber(popupState.attackValueMod)
      : resultKind === "damage"
        ? parseNumber(popupState.damageMod)
        : 0;

    if (modifier === 0) {
      return;
    }

    const sourceAttr = resolvePopupDerivedSourceAttr(result, resolvedFields);
    const baseValue = result.source === "pool"
      ? parseNumber(lookupAttr(poolAttribute))
      : parseNumber(lookupAttr(sourceAttr));
    const totalValue = baseValue + modifier;
    const labelBase = result.label || "Wert";

    rows.push({ label: `${labelBase}-Basis`, value: `${baseValue}` });
    rows.push({ label: `${labelBase}-Modifikator`, value: `${modifier}` });
    rows.push({ label: `${labelBase}`, value: `${totalValue}` });
  });

  return rows;
}

function runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState = 0) {
  if (!rawTemplate) return;

  const context = buildRequestedAttributes(rawTemplate, repeatingRowPrefix);
  const normalizedPopupState = normalizePopupState(popupState);

  getAttrs(context.requestedAttributes, (values) => {
    const lookupAttr = buildAttrLookup(values, repeatingRowPrefix);
    const resolvedFields = buildResolvedFields(context.fields, lookupAttr);
    getRollContextFields(context.definition).forEach((field) => {
      if (!field || !field.label || !field.attr) return;
      if (resolvedFields[field.label]) return;
      resolvedFields[field.label] = lookupAttr(field.attr);
    });
    const rows = buildProbeRows(resolvedFields, context.definition);
    const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);

    if (!context.poolAttribute) {
      const chatMessage = buildSr6ProbeMessage({
        name: name,
        rows: rows,
        resolvedFields: resolvedFields,
        definition: context.definition,
        definitionId: context.definition && context.definition.id,
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

    const poolMultiplier = getRollPoolMultiplier(context.definition, resolvedFields);
    const meleeAttributeOverride = resolveMeleePopupAttributePoolOverride(
      context.definition,
      resolvedFields,
      normalizedPopupState,
      lookupAttr,
      context.poolAttribute
    );
    const computation = buildProbeComputation(
      lookupAttr,
      context.poolAttribute,
      normalizedPopupState.poolMod,
      poolMultiplier,
      meleeAttributeOverride ? meleeAttributeOverride.poolBasisOverride : null
    );

    if (meleeAttributeOverride) {
      rows.push({
        label: "Attribut-Fallback",
        value: `${meleeAttributeOverride.currentAttribute} -> ${meleeAttributeOverride.selectedAttribute}`,
      });
    }
    const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

    if (computation.poolMultiplier !== 1) {
      rows.push({ label: "Pool-Basis", value: `${computation.poolBasisRaw}` });
      rows.push({ label: "Multiplikator", value: `x${computation.poolMultiplier}` });
    }
    if (computation.monitorPoolMod !== 0) {
      rows.push({
        label: computation.poolMultiplier !== 1 ? "Pool nach Multiplikator" : "Pool-Basis",
        value: `${computation.poolBasis}`,
      });
      rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
    }
    normalizedPopupState.rows.forEach((popupRow) => rows.push(popupRow));
    buildPopupDerivedResultRows(context.definition, lookupAttr, context.poolAttribute, resolvedFields, normalizedPopupState)
      .forEach((popupRow) => rows.push(popupRow));

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      resolvedFields: resolvedFields,
      definition: context.definition,
      definitionId: context.definition && context.definition.id,
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
