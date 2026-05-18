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

function applyTemplateSkillBonusToPopupState(popupState, resolvedFields) {
  const state = normalizePopupState(popupState);
  const rows = Array.isArray(state.rows) ? [...state.rows] : [];
  const hasPopupBonusRow = (label, value) => rows.some((row) => (
    row &&
    row.label === label &&
    `${row.value || ""}`.trim() === value
  ));
  const expertiseName = `${(resolvedFields && resolvedFields.Expertise) || ""}`.trim();
  const specializationName = `${(resolvedFields && resolvedFields.Spezialisierung) || ""}`.trim();
  const expertiseRequested = `${(resolvedFields && resolvedFields["Expertise Aktiv"]) || ""}`.trim() === "1" && expertiseName !== "";
  const specializationRequested = `${(resolvedFields && resolvedFields["Spezialisierung Aktiv"]) || ""}`.trim() === "1" && specializationName !== "";

  if (expertiseRequested && !hasPopupBonusRow("Expertise", "+3")) {
    return {
      ...state,
      poolMod: state.poolMod + 3,
      rows: [...rows, { label: "Expertise", value: "+3" }],
    };
  }

  if (specializationRequested && !expertiseRequested && !hasPopupBonusRow("Spezialisierung", "+2")) {
    return {
      ...state,
      poolMod: state.poolMod + 2,
      rows: [...rows, { label: "Spezialisierung", value: "+2" }],
    };
  }

  return {
    ...state,
    rows: rows,
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

function resolveDrainDamageType(remainingDrainDamage, magicValue) {
  if (parseNumber(remainingDrainDamage) <= 0) return "";
  return parseNumber(remainingDrainDamage) > parseNumber(magicValue) ? "Körperlich" : "Betäubung";
}

function resolveSummoningSpiritType(resolvedFields, popupState) {
  const selectedSpiritType = `${(((popupState || {}).selectedValues || {}).spirit_type) || ""}`.trim();
  if (selectedSpiritType) return selectedSpiritType;
  return `${(resolvedFields && resolvedFields.Typ) || ""}`.trim();
}

function resolveSummoningSpiritForce(resolvedFields, popupState) {
  const selectedSpiritForce = parseNumber(((popupState || {}).selectedValues || {}).spirit_force);
  if (selectedSpiritForce > 0) return selectedSpiritForce;
  return parseNumber(resolvedFields.Stufe);
}

function isSummoningPossessionCheckEnabled(popupState) {
  return `${(((popupState || {}).selectedValues || {}).possession) || ""}`.trim() === "1";
}

function appendRowIfMissing(rows, label, value) {
  const normalizedValue = `${value || ""}`.trim();
  if (!normalizedValue) return;
  if (rows.some((row) => row && row.label === label && `${row.value || ""}`.trim() === normalizedValue)) return;
  rows.push({ label: label, value: normalizedValue });
}

function runEquipmentProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const sourceKey = `${(resolvedFields && resolvedFields.Auswahl) || ""}`.trim();
  const sourceOption = getEquipmentSourceOption(sourceKey);
  const sourceValue = sourceOption ? parseNumber(lookupAttr(sourceOption.attr)) : 0;
  const rating = parseNumber((resolvedFields && resolvedFields.Stufe) || lookupAttr(context.poolAttribute));
  const ratingMultiplier = `${((popupState.selectedValues || {}).equipment_rating_x2) || ""}`.trim() === "1" ? 2 : 1;
  const ratingValue = rating * ratingMultiplier;
  const poolBasisOverride = sourceValue + ratingValue;
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod,
    1,
    poolBasisOverride
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  rows.push({ label: "Bezug", value: sourceOption ? sourceOption.label : "Keine Auswahl" });
  if (sourceOption) {
    rows.push({ label: sourceOption.type, value: `${sourceOption.label} (${sourceValue})` });
  }
  rows.push({ label: ratingMultiplier === 2 ? "Stufe x2" : "Stufe", value: `${ratingValue}` });
  if (computation.monitorPoolMod !== 0) {
    rows.push({ label: "Pool-Basis", value: `${computation.poolBasis}` });
    rows.push({ label: "Zustandsmodifikator", value: `${computation.monitorPoolMod}` });
  }
  popupState.rows.forEach((popupRow) => rows.push(popupRow));

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
}

function buildRiggingVehicleRollDataFromLookup(lookupAttr) {
  return {
    reaktion: parseNumber(lookupAttr("sr6_attr_reaktion_gesamtwert")),
    geschicklichkeit: parseNumber(lookupAttr("sr6_attr_geschicklichkeit_gesamtwert")),
    intuition: parseNumber(lookupAttr("sr6_attr_intuition_gesamtwert")),
    logik: parseNumber(lookupAttr("sr6_attr_logik_gesamtwert")),
    steuern: parseNumber(lookupAttr("sr6_skill_steuern_gesamtwert")),
    mechanik: parseNumber(lookupAttr("sr6_skill_mechanik_gesamtwert")),
    mechanikSpezialisierung: lookupAttr("sr6_skill_mechanik_spezialisierung"),
    mechanikExpertise: lookupAttr("sr6_skill_mechanik_expertise"),
    heimlichkeit: parseNumber(lookupAttr("sr6_skill_heimlichkeit_gesamtwert")),
    wahrnehmung: parseNumber(lookupAttr("sr6_skill_wahrnehmung_gesamtwert")),
    rumpf: parseNumber(lookupAttr("sr6_rigging_fahrzeug_rumpf")),
    panzerung: parseNumber(lookupAttr("sr6_rigging_fahrzeug_panzerung")),
    pilot: parseNumber(lookupAttr("sr6_rigging_fahrzeug_pilot")),
    sensor: parseNumber(lookupAttr("sr6_rigging_fahrzeug_sensor")),
    agentenstufe: parseNumber(lookupAttr("sr6_rigging_fahrzeug_agentenstufe")),
    riggerkontrolle: parseNumber(lookupAttr("sr6_rigging_fahrzeug_riggerkontrolle")),
    manoevrieren: parseNumber(lookupAttr("sr6_rigging_fahrzeug_manoevrieren")),
    zielerfassung: parseNumber(lookupAttr("sr6_rigging_fahrzeug_zielerfassung")),
    ausweichen: parseNumber(lookupAttr("sr6_rigging_fahrzeug_ausweichen")),
    stealth: parseNumber(lookupAttr("sr6_rigging_fahrzeug_stealth")),
    clearsight: parseNumber(lookupAttr("sr6_rigging_fahrzeug_clearsight")),
  };
}

function buildRiggingVehicleWeaponRangeText(lookupAttr) {
  const rangeValues = [
    ["S. Nah", lookupAttr("sr6_rigging_fahrzeug_waffe_s_nah")],
    ["Nah", lookupAttr("sr6_rigging_fahrzeug_waffe_nah")],
    ["Mittel", lookupAttr("sr6_rigging_fahrzeug_waffe_mittel")],
    ["Weit", lookupAttr("sr6_rigging_fahrzeug_waffe_weit")],
    ["S. Weit", lookupAttr("sr6_rigging_fahrzeug_waffe_s_weit")],
  ];
  return rangeValues
    .map(([label, value]) => `${label}: ${parseNumber(value)}`)
    .join(" / ");
}

function runRiggingVehicleProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const probeKey = `${resolvedFields.Probe || lookupAttr("sr6_rigging_fahrzeug_probe") || "handling"}`.trim();
  const mode = lookupAttr("sr6_rigging_fahrzeug_modus") || resolvedFields.Modus || "Autonom";
  const data = buildRiggingVehicleRollDataFromLookup(lookupAttr);
  const probe = getRiggingVehicleProbeValue(probeKey, mode, data);
  const attackValue = probeKey === "weapon_attack" && resolvedFields.Angriffswert
    ? resolvedFields.Angriffswert
    : `${getRiggingVehicleAttackValue(mode, data)}`;
  const computation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod,
    1,
    probe.value
  );
  const glitchText = computation.isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
  const erfolgeValue = computation.isGlitch ? glitchText : `${computation.successCount}`;

  rows.push({ label: "Probe", value: getRiggingVehicleProbeLabel(probeKey) });
  rows.push({ label: "Formel", value: probe.formula });
  rows.push({ label: "Modus", value: mode });
  rows.push({ label: "Angriffswert", value: `${attackValue}` });
  rows.push({ label: "Verteidigungswert", value: `${getRiggingVehicleDefenseValue(mode, data)}` });
  rows.push({ label: "Zustandsmonitor", value: `${getRiggingVehicleMonitorValue(data)}` });
  if (probeKey === "weapon_attack") {
    rows.push({ label: "Installierte Waffe", value: lookupAttr("sr6_rigging_fahrzeug_waffe_name") || "-" });
    rows.push({ label: "Waffentyp", value: lookupAttr("sr6_rigging_fahrzeug_waffe") || "-" });
    rows.push({ label: "Schaden", value: lookupAttr("sr6_rigging_fahrzeug_waffe_schaden") || "-" });
    rows.push({ label: "Waffenmodus", value: lookupAttr("sr6_rigging_fahrzeug_waffe_modus") || "-" });
    rows.push({ label: "Angriffswerte (Reichweite)", value: buildRiggingVehicleWeaponRangeText(lookupAttr) });
  }
  if (normalizeRiggingVehicleMode(mode) === "jumped_in_vr") {
    rows.push({ label: "Riggerkontrolle", value: `${data.riggerkontrolle}` });
  }
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    rows.push({ label: "Agentenstufe", value: `${data.agentenstufe}` });
  }
  popupState.rows.forEach((popupRow) => rows.push(popupRow));

  const chatMessage = buildSr6ProbeMessage({
    name: "Rigging-Fahrzeugprobe",
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
  const baseAttackValue = parseNumber(resolvedFields.Angriffswert);
  const finalAttackValue = isCombatSpell(resolvedFields)
    ? Math.max(0, baseAttackValue + popupState.attackValueMod)
    : "";
  const finalDamage = isCombatSpell(resolvedFields) || baseDamage || popupState.damageMod
    ? `${baseDamage + popupState.damageMod}`
    : "";
  const modifiedDrain = Math.max(0, parseNumber(resolvedFields.Entzug) + popupState.drainMod);
  const drainDamage = Math.max(0, modifiedDrain - drainComputation.successCount);
  const drainDamageType = resolveDrainDamageType(drainDamage, lookupAttr("sr6_magic_magie"));

  popupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
  if (isCombatSpell(resolvedFields) && popupState.attackValueMod !== 0) {
    rows.push({ label: "Angriffswert-Basis", value: `${baseAttackValue}` });
    rows.push({ label: "Angriffswert-Modifikator", value: `${popupState.attackValueMod}` });
    rows.push({ label: "Angriffswert", value: `${finalAttackValue}` });
  }

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
    spellAttackValue: `${finalAttackValue}`,
    spellDamage: finalDamage,
    drainValue: `${modifiedDrain}`,
    drainDamage: `${drainDamage}`,
    drainDamageType: drainDamageType,
    drainDetails: buildDiceDetails(drainComputation.diceResults),
    drainDetailsDice: buildDetailsDice(drainComputation.diceResults),
  });

  startRoll(chatMessage, (rollResult) => {
    finishRoll(rollResult.rollId);
  });
}

function runSummoningProbeFromContext(context, lookupAttr, resolvedFields, popupState) {
  const rows = buildProbeRows(resolvedFields, context.definition);
  const name = deriveProbeTitle(resolvedFields, context.poolAttribute, context.definition);
  const spiritType = resolveSummoningSpiritType(resolvedFields, popupState);
  const spiritForce = resolveSummoningSpiritForce(resolvedFields, popupState);
  const summonerComputation = buildProbeComputation(
    lookupAttr,
    context.poolAttribute,
    popupState.poolMod
  );
  const spiritComputation = buildFixedPoolComputation(spiritForce * 2);
  const netHits = summonerComputation.successCount - spiritComputation.successCount;
  const services = Math.max(0, netHits);
  const modifiedDrain = Math.max(0, spiritComputation.successCount + popupState.drainMod);
  const drainComputation = buildProbeComputation(
    lookupAttr,
    "sr6_magic_entzug_widerstand",
    0
  );
  const drainDamage = Math.max(0, modifiedDrain - drainComputation.successCount);
  const drainDamageType = resolveDrainDamageType(drainDamage, lookupAttr("sr6_magic_magie"));
  const objectResistancePool = parseNumber((popupState.selectedValues || {}).object_resistance);
  const objectResistanceComputation = isSummoningPossessionCheckEnabled(popupState)
    ? buildFixedPoolComputation(objectResistancePool)
    : null;
  const objectResistanceNetHits = objectResistanceComputation
    ? Math.max(0, spiritComputation.successCount - objectResistanceComputation.successCount)
    : null;

  appendRowIfMissing(rows, "Geistertyp", spiritType);
  appendRowIfMissing(rows, "Kraftstufe", `${spiritForce}`);
  popupState.rows.forEach((popupRow) => {
    if (!popupRow || !popupRow.label) return;
    appendRowIfMissing(rows, popupRow.label, popupRow.value);
  });
  rows.push({ label: "Beschwören-Pool", value: `${summonerComputation.pool}` });
  rows.push({ label: "Beschwören-Erfolge", value: `${summonerComputation.successCount}` });
  rows.push({ label: "Geist-Pool", value: `${spiritComputation.pool}` });
  rows.push({ label: "Geist-Erfolge", value: `${spiritComputation.successCount}` });
  if (objectResistanceNetHits !== null) {
    rows.push({ label: "Objektwiderstand-Pool", value: `${objectResistancePool}` });
    rows.push({ label: "Objektwiderstand-Erfolge", value: `${objectResistanceComputation.successCount}` });
    rows.push({ label: "Objektwiderstand-Nettoerfolge", value: `${objectResistanceNetHits}` });
    rows.push({ label: "Objektwiderstand-Details", value: buildDiceDetails(objectResistanceComputation.diceResults) });
  }
  rows.push({ label: "Nettoerfolge", value: `${netHits}` });
  rows.push({
    label: "Erhaltene Dienste",
    value: services > 0 ? `${services}` : "0 (nicht herbeigerufen)",
  });
  rows.push({ label: "Entstandener Entzug", value: `${modifiedDrain}` });
  rows.push({
    label: "Entzugsschaden",
    value: drainDamageType ? `${drainDamage} (${drainDamageType})` : `${drainDamage}`,
  });
  rows.push({ label: "Geist-Details", value: buildDiceDetails(spiritComputation.diceResults) });
  rows.push({ label: "Entzug-Details", value: buildDiceDetails(drainComputation.diceResults) });

  const chatMessage = buildSr6ProbeMessage({
    name: name,
    rows: rows,
    resolvedFields: resolvedFields,
    definition: context.definition,
    definitionId: context.definition && context.definition.id,
    pool: `${summonerComputation.pool}`,
    erfolge: `${summonerComputation.successCount}`,
    details: buildDiceDetails(summonerComputation.diceResults),
    detailsDice: buildDetailsDice(summonerComputation.diceResults),
    isGlitch: summonerComputation.isGlitch,
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
    if (context.definition && context.definition.probeModel === "summoning_probe") {
      runSummoningProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }
    if (context.definition && context.definition.probeModel === "equipment_probe") {
      runEquipmentProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }
    if (context.definition && context.definition.probeModel === "rigging_vehicle_probe") {
      runRiggingVehicleProbeFromContext(context, lookupAttr, resolvedFields, normalizedPopupState);
      return;
    }

    const effectivePopupState = applyTemplateSkillBonusToPopupState(normalizedPopupState, resolvedFields);

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
      effectivePopupState.poolMultiplier
    );
    const meleeAttributeOverride = resolveMeleePopupAttributePoolOverride(
      context.definition,
      resolvedFields,
      effectivePopupState,
      lookupAttr,
      context.poolAttribute
    );
    const skillAttributeOverride = resolveSkillProbeAttributePoolOverride(
      context.definition,
      effectivePopupState,
      lookupAttr,
      context.poolAttribute
    );
    const matrixActionContext = resolveMatrixActionRuleContext(
      context.definition,
      effectivePopupState,
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
      effectivePopupState.poolMod,
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
    effectivePopupState.rows.forEach((popupRow) => rows.push(popupRow));
    buildPopupDerivedResultRows(context.definition, lookupAttr, context.poolAttribute, resolvedFields, effectivePopupState)
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
