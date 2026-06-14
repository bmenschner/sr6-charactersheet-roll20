// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  requestKeys.push("sr6_matrix_modus");
  requestKeys.push("sr6_matrix_angriff");
  requestKeys.push("sr6_matrix_schleicher");
  requestKeys.push("sr6_matrix_datenverarbeitung");
  requestKeys.push("sr6_matrix_firewall");
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_verteidigung_auswahl`);
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
  const matrixAttack = parseNumber(values.sr6_matrix_angriff);
  const matrixSleaze = parseNumber(values.sr6_matrix_schleicher);
  const matrixDataProcessing = parseNumber(values.sr6_matrix_datenverarbeitung);
  const matrixFirewall = parseNumber(values.sr6_matrix_firewall);
  const matrixBasis =
    matrixInitiativeMode.basisSource === "matrix"
      ? (totals.intuition || 0) + matrixDataProcessing
      : (totals.reaktion || 0) + (totals.intuition || 0);

  updates.sr6_matrix_initiative = String(matrixBasis);
  updates.sr6_matrix_initiative_w6 = String(matrixInitiativeMode.w6);
  updates.sr6_matrix_angriffswert = String(matrixAttack + matrixSleaze);
  updates.sr6_matrix_verteidigungswert = String(matrixDataProcessing + matrixFirewall);
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
    updates[probeTotalKey] = resolveMatrixActionComponentTotal(rule.probe, values, totals, skillTotals);
    updates[defenseTotalKey] = resolveMatrixActionComponentTotal(defenseComponent, values, totals, skillTotals);
  });
}
// END MODULE: workers/compute/matrix
