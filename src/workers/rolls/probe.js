// BEGIN MODULE: workers/rolls/probe
function normalizePopupState(popupState) {
  if (typeof popupState === "number") {
    return { poolMod: popupState, attackValueMod: 0, damageMod: 0, drainMod: 0, poolMultiplier: 1, selectedValues: {}, rows: [] };
  }

  if (!popupState || typeof popupState !== "object") {
    return { poolMod: 0, attackValueMod: 0, damageMod: 0, drainMod: 0, poolMultiplier: 1, selectedValues: {}, rows: [] };
  }

  return {
    poolMod: parseNumber(popupState.poolMod),
    attackValueMod: parseNumber(popupState.attackValueMod),
    damageMod: parseNumber(popupState.damageMod),
    drainMod: parseNumber(popupState.drainMod),
    poolMultiplier: Math.max(1, parseNumber(popupState.poolMultiplier) || 1),
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

function resolveSkillProbeAttributePoolOverride(definition, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.probeModel !== "skill_probe") {
    return null;
  }

  const attributeOption = resolveSkillProbeAttributeOption(
    definition,
    (((popupState || {}).selectedValues || {}).skill_attribute) || ""
  );

  if (!attributeOption || !attributeOption.attr) {
    return null;
  }

  const skillValue = parseNumber(lookupAttr(poolAttribute));
  const attributeValue = parseNumber(lookupAttr(attributeOption.attr));

  return {
    selectedAttribute: attributeOption.value,
    skillValue: skillValue,
    attributeValue: attributeValue,
    poolBasisOverride: skillValue + attributeValue,
  };
}

function resolveMatrixActionComponentValue(component, lookupAttr) {
  if (!component || component.type === "none" || component.type === "description") {
    return null;
  }

  if (component.multiplier && component.matrix) {
    const matrixValue = parseNumber(lookupAttr(`sr6_matrix_${component.matrix}`));
    return {
      label: component.label || component.matrix,
      value: matrixValue * parseNumber(component.multiplier),
      parts: [{ label: component.matrix, value: matrixValue }],
    };
  }

  if (component.target) {
    return {
      label: component.label || component.target,
      value: null,
      parts: [],
    };
  }

  const parts = [];
  let total = 0;

  if (component.skill) {
    const value = parseNumber(lookupAttr(`sr6_skill_${component.skill}_gesamtwert`));
    parts.push({ label: component.skill, value: value });
    total += value;
  }
  if (component.attribute) {
    const value = parseNumber(lookupAttr(`sr6_attr_${component.attribute}_gesamtwert`));
    parts.push({ label: component.attribute, value: value });
    total += value;
  }
  if (component.matrix) {
    const value = parseNumber(lookupAttr(`sr6_matrix_${component.matrix}`));
    parts.push({ label: component.matrix, value: value });
    total += value;
  }
  if (component.matrixSecond) {
    const value = parseNumber(lookupAttr(`sr6_matrix_${component.matrixSecond}`));
    parts.push({ label: component.matrixSecond, value: value });
    total += value;
  }

  if (parts.length === 0) {
    return null;
  }

  return {
    label: component.label || parts.map((part) => part.label).join(" + "),
    value: total,
    parts: parts,
  };
}

function resolveMatrixActionRuleContext(definition, popupState, lookupAttr, poolAttribute) {
  if (!definition || definition.id !== "matrix_action") {
    return null;
  }

  const actionKey = getMatrixActionKeyFromPoolAttribute(poolAttribute);
  const rollMode = getMatrixActionRollModeFromPoolAttribute(poolAttribute);
  const rule = getMatrixActionRule(actionKey);
  if (!actionKey || !rule) {
    return null;
  }

  const probe = resolveMatrixActionComponentValue(rule.probe, lookupAttr);
  const defense = rule.defense || {};
  const selectedDefense = `${(((popupState || {}).selectedValues || {}).matrix_defense) || lookupAttr(`sr6_matrix_handlung_${actionKey}_verteidigung_auswahl`) || ""}`.trim();
  const defenseOption = Array.isArray(defense.options)
    ? (defense.options.find((option) => `${option.label || ""}`.trim() === selectedDefense) || defense.options[0])
    : defense;
  const defenseValue = resolveMatrixActionComponentValue(defenseOption, lookupAttr);
  const poolBasisOverride = rollMode === "defense"
    ? (defenseValue && defenseValue.value !== null ? defenseValue.value : null)
    : (probe ? probe.value : null);

  return {
    actionKey: actionKey,
    rollMode: rollMode,
    rule: rule,
    probe: probe,
    defense: defense,
    defenseOption: defenseOption,
    defenseValue: defenseValue,
    poolBasisOverride: poolBasisOverride,
  };
}

function appendMatrixActionRows(rows, matrixActionContext) {
  if (!matrixActionContext) return;

  const rule = matrixActionContext.rule || {};
  const probe = matrixActionContext.probe;
  const defense = matrixActionContext.defense || {};
  const defenseValue = matrixActionContext.defenseValue;
  const defenseOption = matrixActionContext.defenseOption || {};

  if (rule.probe && rule.probe.type === "none") {
    rows.push({ label: "Probe", value: "Keine Probe" });
  } else if (rule.probe && rule.probe.type === "description") {
    rows.push({ label: "Probe", value: "Siehe Beschreibung" });
  } else if (probe) {
    rows.push({ label: "Probe", value: probe.label });
    rows.push({ label: "Probe-Wert", value: `${probe.value}` });
  }

  if (rule.probe && rule.probe.linkedMatrixAttribute) {
    rows.push({ label: "Matrixattribut", value: rule.probe.linkedMatrixAttribute });
  }
  if (rule.probe && rule.probe.specialization) {
    rows.push({ label: "Spezialisierung", value: rule.probe.specialization });
  }

  if (defense.type === "none") {
    rows.push({ label: "Verteidigung", value: "Keine Verteidigungsprobe" });
  } else if (defense.type === "description") {
    rows.push({ label: "Verteidigung", value: "Siehe Beschreibung" });
  } else if (defense.type === "fixed_formula" && defenseValue && defenseValue.value !== null) {
    rows.push({ label: "Verteidigung", value: defenseValue.label });
    rows.push({ label: "Verteidigungswert", value: `${defenseValue.value}` });
  } else if (defense.type === "fixed_formula") {
    rows.push({ label: "Verteidigung", value: defense.label || "Zielwert" });
  } else if (defenseValue && defenseValue.value !== null) {
    rows.push({ label: "Verteidigung", value: defenseValue.label });
    rows.push({ label: "Verteidigungswert", value: `${defenseValue.value}` });
  } else if (defenseOption && defenseOption.label) {
    rows.push({ label: "Verteidigung", value: defenseOption.label });
  }
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

function isCombatSpell(resolvedFields) {
  return `${(resolvedFields && resolvedFields.Art) || ""}`.trim() === "Kampf";
}

function runSpellProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const spellComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod
  );
  const drainComputation = buildProbeComputation(
    lookupAttr,
    "sr6_magic_entzug_widerstand",
    0
  );
  const baseDamage = parseNumber(resolvedFields.Schaden);
  const finalDamage = isCombatSpell(resolvedFields) || baseDamage || popupState.damageMod
    ? `${baseDamage + popupState.damageMod}`
    : "";
  const modifiedDrain = Math.max(0, parseNumber(resolvedFields.Entzug) + popupState.drainMod);
  const drainDamage = Math.max(0, modifiedDrain - drainComputation.successCount);

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${spellComputation.pool}`,
    erfolge: `${spellComputation.successCount}`,
    details: buildDiceDetails(spellComputation.diceResults),
    detailsDice: buildDetailsDice(spellComputation.diceResults),
    isGlitch: spellComputation.isGlitch,
    spellDamage: finalDamage,
    drainValue: `${modifiedDrain}`,
    drainDamage: `${drainDamage}`,
    drainDetails: buildDiceDetails(drainComputation.diceResults),
    drainDetailsDice: buildDetailsDice(drainComputation.diceResults),
  });

  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
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

    if (context.definition && context.definition.probeModel === "spell_probe") {
      runSpellProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }

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

    const poolMultiplier = Math.max(
      getRollPoolMultiplier(context.definition, resolvedFields),
      normalizedPopupState.poolMultiplier
    );
    const meleeAttributeOverride = resolveMeleePopupAttributePoolOverride(
      context.definition,
      resolvedFields,
      normalizedPopupState,
      lookupAttr,
      context.poolAttribute
    );
    const skillAttributeOverride = resolveSkillProbeAttributePoolOverride(
      context.definition,
      normalizedPopupState,
      lookupAttr,
      context.poolAttribute
    );
    const matrixActionContext = resolveMatrixActionRuleContext(
      context.definition,
      normalizedPopupState,
      lookupAttr,
      context.poolAttribute
    );
    const poolBasisOverride = meleeAttributeOverride
      ? meleeAttributeOverride.poolBasisOverride
      : skillAttributeOverride
        ? skillAttributeOverride.poolBasisOverride
        : matrixActionContext && matrixActionContext.poolBasisOverride !== null
          ? matrixActionContext.poolBasisOverride
          : null;
    const computation = buildProbeComputation(
      lookupAttr,
      context.poolAttribute,
      normalizedPopupState.poolMod,
      poolMultiplier,
      poolBasisOverride
    );

    if (meleeAttributeOverride) {
      rows.push({
        label: "Attribut-Fallback",
        value: `${meleeAttributeOverride.currentAttribute} -> ${meleeAttributeOverride.selectedAttribute}`,
      });
    }
    if (skillAttributeOverride) {
      rows.push({ label: "Attribut", value: skillAttributeOverride.selectedAttribute });
      rows.push({ label: "Attribut-Wert", value: `${skillAttributeOverride.attributeValue}` });
      rows.push({ label: "Fertigkeitswert", value: `${skillAttributeOverride.skillValue}` });
    }
    appendMatrixActionRows(rows, matrixActionContext);
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
