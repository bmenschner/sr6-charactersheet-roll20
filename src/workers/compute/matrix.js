// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  requestKeys.push("sr6_matrix_modus");
  requestKeys.push("sr6_initiative_physisch_w6");
  requestKeys.push("sr6_matrix_angriff");
  requestKeys.push("sr6_matrix_angriff_modifikator");
  requestKeys.push("sr6_matrix_schleicher");
  requestKeys.push("sr6_matrix_schleicher_modifikator");
  requestKeys.push("sr6_matrix_datenverarbeitung");
  requestKeys.push("sr6_matrix_datenverarbeitung_modifikator");
  requestKeys.push("sr6_matrix_firewall");
  requestKeys.push("sr6_matrix_firewall_modifikator");
  requestKeys.push("sr6_matrix_cyberbuchse_initiative_w6");
  requestKeys.push("sr6_matrix_angriffswert_modifikator");
  requestKeys.push("sr6_matrix_verteidigungswert_modifikator");
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_verteidigung_auswahl`);
  });
}

function getMatrixCoreValue(values, key) {
  return parseNumber(values[`sr6_matrix_${key}`]) + parseNumber(values[`sr6_matrix_${key}_modifikator`]);
}

function buildEffectiveMatrixCoreValues(values) {
  return Object.assign({}, values, {
    sr6_matrix_angriff: String(getMatrixCoreValue(values, "angriff")),
    sr6_matrix_schleicher: String(getMatrixCoreValue(values, "schleicher")),
    sr6_matrix_datenverarbeitung: String(getMatrixCoreValue(values, "datenverarbeitung")),
    sr6_matrix_firewall: String(getMatrixCoreValue(values, "firewall")),
  });
}

function resolveMatrixInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function resolveMatrixActionComponentTotal(component, values, totals, skillTotals) {
  if (!component || component.type === "none" || component.type === "description" || component.target) {
    return "";
  }

  if (component.multiplier && component.matrix) {
    return String(parseNumber(values[`sr6_matrix_${component.matrix}`]) * parseNumber(component.multiplier));
  }

  let total = 0;
  let hasParts = false;

  if (component.skill) {
    total += parseNumber(skillTotals[component.skill]);
    total += getMatrixUntrainedSkillPenalty(values, component.skill);
    hasParts = true;
  }
  if (component.attribute) {
    total += parseNumber(totals[component.attribute]);
    hasParts = true;
  }
  if (component.matrix) {
    total += parseNumber(values[`sr6_matrix_${component.matrix}`]);
    hasParts = true;
  }
  if (component.matrixSecond) {
    total += parseNumber(values[`sr6_matrix_${component.matrixSecond}`]);
    hasParts = true;
  }

  return hasParts ? String(total) : "";
}

function getMatrixUntrainedSkillPenalty(values, skillKey) {
  if (!skillKey) return 0;
  const baseValue = parseNumber(values && values[`sr6_skill_${skillKey}_grundwert`]);
  return baseValue <= 0 ? -1 : 0;
}

function resolveMatrixActionDefenseComponent(rule, selectedDefense) {
  const defense = (rule && rule.defense) || {};
  if (Array.isArray(defense.options)) {
    const normalizedSelection = `${selectedDefense || ""}`.trim();
    return defense.options.find((option) => `${option.label || ""}`.trim() === normalizedSelection) || defense.options[0];
  }
  return defense;
}

function computeMatrixTotals(values, totals, skillTotals, updates) {
  const matrixInitiativeMode = resolveMatrixInitiativeMode(values.sr6_matrix_modus);
  const effectiveValues = buildEffectiveMatrixCoreValues(values);
  const matrixAttack = parseNumber(effectiveValues.sr6_matrix_angriff);
  const matrixSleaze = parseNumber(effectiveValues.sr6_matrix_schleicher);
  const matrixDataProcessing = parseNumber(effectiveValues.sr6_matrix_datenverarbeitung);
  const matrixFirewall = parseNumber(effectiveValues.sr6_matrix_firewall);
  const matrixInitiativeBonusDice =
    matrixInitiativeMode.basisSource === "matrix"
      ? parseNumber(values.sr6_matrix_cyberbuchse_initiative_w6)
      : 0;
  const matrixInitiativeBaseDice =
    matrixInitiativeMode.basisSource === "matrix"
      ? matrixInitiativeMode.w6
      : parseNumber(values.sr6_initiative_physisch_w6) || matrixInitiativeMode.w6;
  const matrixBasis =
    matrixInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + matrixDataProcessing
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_matrix_cyberbuchse_aktiver_initiative_bonus_w6 = String(matrixInitiativeBonusDice);
  updates.sr6_matrix_angriff_gesamtwert = String(matrixAttack);
  updates.sr6_matrix_schleicher_gesamtwert = String(matrixSleaze);
  updates.sr6_matrix_datenverarbeitung_gesamtwert = String(matrixDataProcessing);
  updates.sr6_matrix_firewall_gesamtwert = String(matrixFirewall);
  updates.sr6_matrix_initiative = String(matrixBasis);
  updates.sr6_matrix_initiative_w6 = String(matrixInitiativeBaseDice + matrixInitiativeBonusDice);
  updates.sr6_matrix_angriffswert = String(
    matrixAttack + matrixSleaze + parseNumber(values.sr6_matrix_angriffswert_modifikator)
  );
  updates.sr6_matrix_verteidigungswert = String(
    matrixDataProcessing + matrixFirewall + parseNumber(values.sr6_matrix_verteidigungswert_modifikator)
  );
  updates.sr6_matrix_verteidigung = String((totals.intuition || 0) + matrixFirewall);
  updates.sr6_matrix_schadenswiderstand = String(matrixFirewall);
  updates.sr6_matrix_biofeedback_schadenswiderstand = String(totals.willenskraft || 0);

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const rule = SR6_MATRIX_ACTION_RULES[actionName] || {};
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);
    const defenseSelectionKey = `sr6_matrix_handlung_${actionName}_verteidigung_auswahl`;
    const probeTotalKey = `sr6_matrix_handlung_${actionName}_probe_wert`;
    const defenseTotalKey = `sr6_matrix_handlung_${actionName}_verteidigung_wert`;
    const defenseComponent = resolveMatrixActionDefenseComponent(rule, values[defenseSelectionKey]);

    updates[totalKey] = String(total);
    updates[probeTotalKey] = resolveMatrixActionComponentTotal(rule.probe, effectiveValues, totals, skillTotals);
    updates[defenseTotalKey] = resolveMatrixActionComponentTotal(defenseComponent, effectiveValues, totals, skillTotals);
  });
}
// END MODULE: workers/compute/matrix
