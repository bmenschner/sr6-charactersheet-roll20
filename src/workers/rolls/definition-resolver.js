// BEGIN MODULE: workers/rolls/definition-resolver
// Waehlt anhand von Button-Feldern und Pool-Attribut die passende Roll-Definition aus und baut daraus Popup-/Template-Metadaten.
function findRollTitleByPoolAttribute(poolAttribute) {
  if (!poolAttribute) return "";

  for (let index = 0; index < SR6_ROLL_TITLE_PREFIXES.length; index += 1) {
    const entry = SR6_ROLL_TITLE_PREFIXES[index];
    if (poolAttribute.startsWith(entry.prefix)) {
      return entry.title;
    }
  }

  return "";
}

function resolveRollDefinition(fields, poolAttribute = "") {
  let bestDefinition = null;
  let bestScore = -1;

  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    const definition = SR6_ROLL_DEFINITIONS[index];
    const fieldMatches = !definition.matchField || fields[definition.matchField];
    const fieldValueMatches =
      !definition.matchFieldValue ||
      `${fields[definition.matchField] || ""}`.trim() === `${definition.matchFieldValue}`.trim();
    const poolMatches = !definition.matchPoolPrefix || poolAttribute.startsWith(definition.matchPoolPrefix);
    if (fieldMatches && fieldValueMatches && poolMatches) {
      let score = 0;
      if (definition.matchPoolPrefix) score += 2;
      if (definition.matchField) score += 1;
      if (definition.matchFieldValue) score += 1;

      if (score > bestScore) {
        bestDefinition = definition;
        bestScore = score;
      }
    }
  }

  return bestDefinition || SR6_ROLL_DEFINITIONS[SR6_ROLL_DEFINITIONS.length - 1];
}

function getRollDefinitionById(definitionId) {
  if (!definitionId) {
    return resolveRollDefinition({});
  }

  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    if (SR6_ROLL_DEFINITIONS[index].id === definitionId) {
      return SR6_ROLL_DEFINITIONS[index];
    }
  }

  return resolveRollDefinition({});
}

function buildRollRowOrder(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const primaryFields = Array.isArray(resolvedDefinition.primaryFields) ? resolvedDefinition.primaryFields : [];
  const extraFields = Array.isArray(resolvedDefinition.extraFields) ? resolvedDefinition.extraFields : [];
  const combined = [...primaryFields, ...extraFields];

  SR6_DEFAULT_ROLL_ROW_ORDER.forEach((field) => {
    if (!combined.includes(field)) {
      combined.push(field);
    }
  });

  return combined;
}

function getInternalRollFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.internalFields) ? resolvedDefinition.internalFields : [];
}

function getRollPopupFields(definition, poolAttribute) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const baseFields = Array.isArray(resolvedDefinition.popupFields) && resolvedDefinition.popupFields.length > 0
    ? resolvedDefinition.popupFields
    : SR6_DEFAULT_POPUP_FIELDS;

  return addSharedPopupFields(baseFields, resolvedDefinition);
}

function getSkillProbeAttributeOptions(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  const config = resolvedDefinition.skillAttributeConfig || {};
  return Array.isArray(config.options) ? config.options : [];
}

function resolveSkillProbeAttributeOption(definition, selectedValue) {
  const options = getSkillProbeAttributeOptions(definition);
  if (options.length === 0) return null;

  const normalizedValue = `${selectedValue || ""}`.trim();
  return options.find((option) => option.value === normalizedValue) || options[0];
}

function getMatrixLikeDefenseAdditionalAttributes(definition) {
  const definitionId = definition && definition.id;
  const matrixDefenseIds = [
    "matrix_defense",
    "matrix_damage_resistance",
    "matrix_biofeedback_damage_resistance",
  ];
  const riggingDefenseIds = [
    "rigging_matrix_defense",
    "rigging_matrix_damage_resistance",
    "rigging_biofeedback_damage_resistance",
  ];

  if (matrixDefenseIds.includes(definitionId)) {
    return [
      "sr6_matrix_datenverarbeitung",
      "sr6_matrix_datenverarbeitung_modifikator",
      "sr6_matrix_firewall",
      "sr6_matrix_firewall_modifikator",
      "sr6_matrix_verteidigungswert_modifikator",
      "sr6_matrix_verteidigungswert",
    ];
  }
  if (riggingDefenseIds.includes(definitionId)) {
    return [
      "sr6_rigging_datenverarbeitung",
      "sr6_rigging_firewall",
      "sr6_rigging_verteidigungswert_modifikator",
      "sr6_rigging_verteidigungswert",
    ];
  }
  return [];
}

function getRollAdditionalAttributes(definition) {
  const attributeBaseAttributes = SR6_ATTRIBUTES.map((attributeKey) => `sr6_attr_${attributeKey}_grundwert`);
  const attributeModifierAttributes = SR6_ATTRIBUTES.map((attributeKey) => `sr6_attr_${attributeKey}_modifikator`);
  const attributeTotalAttributes = SR6_ATTRIBUTES.map((attributeKey) => `sr6_attr_${attributeKey}_gesamtwert`);
  const skillBaseAttributes = SR6_SKILLS.map((skillKey) => `sr6_skill_${skillKey}_grundwert`);
  const skillModifierAttributes = SR6_SKILLS.map((skillKey) => `sr6_skill_${skillKey}_modifikator`);
  const skillTotalAttributes = SR6_SKILLS.map((skillKey) => `sr6_skill_${skillKey}_gesamtwert`);
  const attributes = [
    ...attributeBaseAttributes,
    ...attributeModifierAttributes,
    ...attributeTotalAttributes,
    ...skillBaseAttributes,
    ...skillModifierAttributes,
    ...skillTotalAttributes,
    ...getMagicRollAdditionalAttributes(definition),
    ...getMatrixLikeDefenseAdditionalAttributes(definition),
  ];
  getSkillProbeAttributeOptions(definition).forEach((option) => {
    if (!option || !option.attr) return;
    attributes.push(option.attr);
    const attributeMatch = option.attr.match(/^sr6_attr_(.+)_gesamtwert$/);
    if (attributeMatch) {
      attributes.push(`sr6_attr_${attributeMatch[1]}_grundwert`);
      attributes.push(`sr6_attr_${attributeMatch[1]}_modifikator`);
    }
  });
  if (definition && definition.id === "equipment") {
    attributes.push(...getEquipmentSourceAttributeRefs());
  }
  if (definition && definition.id === "rigging_vehicle") {
    attributes.push(...SR6_RIGGING_VEHICLE_ROLL_ATTRIBUTES);
  }
  if (definition && [
    "physical_defense",
    "physical_damage_resistance",
    "general_defense",
    "general_damage_resistance",
  ].includes(definition.id)) {
    attributes.push(
      "sr6_combat_primaere_panzerung",
      "sr6_combat_sekundaere_panzerung",
      "sr6_combat_helm",
      "sr6_combat_schild",
      "sr6_combat_verteidigungswert_modifikator",
      "sr6_combat_verteidigungswert_gesamtwert"
    );
  }
  if (definition && definition.id === "matrix_action") {
    return [...new Set([...attributes, ...getMatrixActionRuleAttributeRefs(), ...getMatrixActionSelectionAttributeRefs()])];
  }
  return [...new Set(attributes)];
}

function getMatrixActionKeyFromPoolAttribute(poolAttribute) {
  const prefix = "sr6_matrix_handlung_";
  const suffixes = ["_grundwert", "_modifikator", "_gesamtwert", "_probe_wert", "_verteidigung_wert"];
  if (!poolAttribute || !poolAttribute.startsWith(prefix)) return "";

  const actionPart = poolAttribute.slice(prefix.length);
  for (let index = 0; index < suffixes.length; index += 1) {
    const suffix = suffixes[index];
    if (actionPart.endsWith(suffix)) {
      return actionPart.slice(0, -suffix.length);
    }
  }
  return actionPart;
}

function getMatrixActionRollModeFromPoolAttribute(poolAttribute) {
  if (!poolAttribute) return "probe";
  if (poolAttribute.endsWith("_verteidigung_wert")) return "defense";
  return "probe";
}

function getMatrixActionRule(actionKey) {
  return (SR6_MATRIX_ACTION_RULES && SR6_MATRIX_ACTION_RULES[actionKey]) || null;
}

function getMatrixRuleComponentAttr(component) {
  if (!component) return "";
  if (component.attribute) {
    return `sr6_attr_${component.attribute}_gesamtwert`;
  }
  if (component.skill) {
    return `sr6_skill_${component.skill}_gesamtwert`;
  }
  if (component.matrix) {
    return `sr6_matrix_${component.matrix}`;
  }
  return "";
}

function pushMatrixRuleComponentAttr(attributes, key) {
  if (!key) return;
  attributes.push(`sr6_matrix_${key}`);
  attributes.push(`sr6_matrix_${key}_modifikator`);
}

function collectMatrixRuleComponentAttrs(component, attributes) {
  const directAttr = getMatrixRuleComponentAttr(component);
  if (directAttr) attributes.push(directAttr);
  if (component && component.attribute) {
    attributes.push(`sr6_attr_${component.attribute}_grundwert`);
    attributes.push(`sr6_attr_${component.attribute}_modifikator`);
  }
  if (component && component.skill) {
    attributes.push(`sr6_skill_${component.skill}_grundwert`);
    attributes.push(`sr6_skill_${component.skill}_modifikator`);
  }
  if (component && component.matrixSecond) {
    pushMatrixRuleComponentAttr(attributes, component.matrixSecond);
  }
  if (component && component.matrix) {
    pushMatrixRuleComponentAttr(attributes, component.matrix);
  }
}

function getMatrixActionRuleAttributeRefs() {
  const attributes = [];
  Object.keys(SR6_MATRIX_ACTION_RULES || {}).forEach((actionKey) => {
    const rule = SR6_MATRIX_ACTION_RULES[actionKey] || {};
    collectMatrixRuleComponentAttrs(rule.probe, attributes);
    const defense = rule.defense || {};
    if (Array.isArray(defense.options)) {
      defense.options.forEach((option) => collectMatrixRuleComponentAttrs(option, attributes));
    } else {
      collectMatrixRuleComponentAttrs(defense, attributes);
    }
  });
  return [...new Set(attributes)];
}

function getMatrixActionSelectionAttributeRefs() {
  return SR6_MATRIX_ACTIONS.map((actionKey) => `sr6_matrix_handlung_${actionKey}_verteidigung_auswahl`);
}

function getRollContextFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.contextFields) ? resolvedDefinition.contextFields : [];
}

function getRollPoolMultiplier(definition, resolvedFields) {
  const resolvedDefinition = definition || resolveRollDefinition(resolvedFields || {});
  const multiplierField = resolvedDefinition.poolMultiplierField || "";
  if (multiplierField) {
    const fieldValue = `${(resolvedFields && resolvedFields[multiplierField]) || ""}`.trim();
    if (fieldValue && fieldValue === `${resolvedDefinition.poolMultiplierFieldValue || "1"}`) {
      const configuredMultiplier = parseNumber(resolvedDefinition.poolMultiplier);
      return configuredMultiplier > 0 ? configuredMultiplier : 1;
    }
    return 1;
  }
  const configuredMultiplier = parseNumber(resolvedDefinition.poolMultiplier);
  return configuredMultiplier > 0 ? configuredMultiplier : 1;
}

function getPopupFieldValueAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  if (field && field.type === "select") {
    return `sr6_roll_popup_value_${slot}_select_${field.optionSet || "default"}`;
  }
  if (field && field.type === "text") {
    return `sr6_roll_popup_value_${slot}_text`;
  }
  if (field && field.type === "checkbox") {
    return `sr6_roll_popup_value_${slot}_checkbox`;
  }
  return `sr6_roll_popup_value_${slot}_number`;
}

function getPopupFieldTypeToggleAttr(field, index, type) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_is_${type}`;
}

function getPopupFieldDependencyToggleAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_requires_previous_checkbox`;
}


function getPopupFieldOptionToggleAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_option_${field.optionSet || "none"}`;
}

function getPopupSelectOptions(field) {
  if (!field || field.type !== "select" || !field.optionSet) return [];
  return SR6_POPUP_SELECT_OPTION_SETS[field.optionSet] || [];
}

function buildPopupStateFromValues(values, definition, poolAttribute) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const popupRows = [];
  const selectedValues = {};
  const combatSkillBonusIsInformational = typeof isComputedCombatPoolDefinition === "function" && isComputedCombatPoolDefinition(definition);
  let poolMod = 0;
  let attackValueMod = 0;
  let damageMod = 0;
  let drainMod = 0;
  let poolMultiplier = 1;
  const expertiseFieldIndex = popupFields.findIndex((field) => field && field.id === "expertise");
  const expertiseField = expertiseFieldIndex >= 0 ? popupFields[expertiseFieldIndex] : null;
  const expertiseChecked = expertiseField
    ? isCheckedValue(values[getPopupFieldValueAttr(expertiseField, expertiseFieldIndex)])
    : false;

  popupFields.forEach((field, index) => {
    const rawValue = values[getPopupFieldValueAttr(field, index)];
    const isNumberField = field.type === "number";
    const isTextField = field.type === "text";
    const isCheckboxField = field.type === "checkbox";
    const dependencySatisfied = !field.requiresCheckedSlot || isCheckedValue(values[`sr6_roll_popup_value_${field.requiresCheckedSlot}_checkbox`]);
    const checkboxChecked =
      dependencySatisfied &&
      isCheckboxField &&
      !(field.id === "specialization" && expertiseChecked)
        ? isCheckedValue(rawValue)
        : false;
    const normalizedValue = isNumberField
      ? parseNumber(rawValue)
      : isCheckboxField
        ? (checkboxChecked ? "1" : "0")
        : `${rawValue || ""}`.trim();
    const selectedOption = (isNumberField || isTextField || isCheckboxField)
      ? null
      : getPopupSelectOptions(field).find((option) => option.value === normalizedValue);
    const displayValue = isNumberField
      ? `${normalizedValue}`
      : isTextField
        ? `${normalizedValue}`
        : isCheckboxField
          ? `${field.checkedDisplayValue || "Ja"}`
          : `${(selectedOption && (selectedOption.rowValue || selectedOption.label)) || normalizedValue}`;
    const affects = Array.isArray(field.affects)
      ? field.affects
      : field.affects
        ? [field.affects]
        : [];
    const skillBonusIsInformational =
      combatSkillBonusIsInformational &&
      (field.id === "specialization" || field.id === "expertise");
    const affectMultipliers = field && field.affectMultipliers && typeof field.affectMultipliers === "object"
      ? field.affectMultipliers
      : {};
    const numericBaseValue = isNumberField
      ? parseNumber(normalizedValue)
      : isCheckboxField
        ? (checkboxChecked ? parseNumber(field.checkedValue) : 0)
        : 0;

    if (field.id) {
      selectedValues[field.id] = normalizedValue;
    }

    if (affects.includes("pool") && !skillBonusIsInformational) {
      poolMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.pool) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.pool) || 1)
          : parseNumber(selectedOption && selectedOption.poolMod);
    }
    if (affects.includes("attack_value")) {
      attackValueMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.attack_value) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.attack_value) || 1)
          : parseNumber(selectedOption && selectedOption.attackValueMod);
    }
    if (affects.includes("damage")) {
      damageMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.damage) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.damage) || 1)
          : parseNumber(selectedOption && selectedOption.damageMod);
    }
    if (affects.includes("drain")) {
      drainMod += isNumberField
        ? numericBaseValue * (parseNumber(affectMultipliers.drain) || 1)
        : isCheckboxField
          ? numericBaseValue * (parseNumber(affectMultipliers.drain) || 1)
          : parseNumber(selectedOption && selectedOption.drainMod);
    }
    if (affects.includes("pool_multiplier")) {
      const multiplierValue = isCheckboxField && checkboxChecked
        ? parseNumber(field.checkedValue)
        : isNumberField
          ? parseNumber(normalizedValue)
          : 1;
      if (multiplierValue > poolMultiplier) {
        poolMultiplier = multiplierValue;
      }
    }

    const shouldInclude =
      field.includeInTemplate &&
      (
        (isNumberField && parseNumber(normalizedValue) !== 0) ||
        (isTextField && normalizedValue !== "" && normalizedValue !== `${field.defaultValue || ""}`) ||
        (isCheckboxField && checkboxChecked) ||
        (!isNumberField && !isTextField && !isCheckboxField && normalizedValue !== "" && normalizedValue !== `${field.defaultValue || ""}`)
      );

    if (shouldInclude) {
      popupRows.push({
        label: field.label,
        value: displayValue,
        ignorePoolFormula: skillBonusIsInformational,
      });
    }

    if (selectedOption && Array.isArray(selectedOption.extraRows)) {
      selectedOption.extraRows.forEach((extraRow) => {
        if (!extraRow || !extraRow.label || extraRow.value === undefined || extraRow.value === null || `${extraRow.value}` === "") {
          return;
        }
        popupRows.push({
          label: extraRow.label,
          value: `${extraRow.value}`,
        });
      });
    }
  });

  return {
    poolMod: poolMod,
    attackValueMod: attackValueMod,
    damageMod: damageMod,
    drainMod: drainMod,
    poolMultiplier: poolMultiplier,
    selectedValues: selectedValues,
    rows: popupRows,
  };
}

function fieldMatchesPopupVisibility(field, templateFields) {
  if (!field || !field.visibleWhenField) return true;
  const hasVisibilityField = !!(templateFields && templateFields[field.visibleWhenField] !== undefined);
  if (!hasVisibilityField && field.visibleWhenFieldMissing) return true;
  return `${(templateFields && templateFields[field.visibleWhenField]) || ""}`.trim() === `${field.visibleWhenValue || ""}`.trim();
}

function buildPopupResetPayload() {
  const payload = {};

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_active`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_label`] = "";
    payload[`sr6_roll_popup_slot_${slot}_is_number`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_text`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_select`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_checkbox`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_requires_previous_checkbox`] = "0";
    payload[`sr6_roll_popup_value_${slot}_number`] = "0";
    payload[`sr6_roll_popup_value_${slot}_text`] = "";
    payload[`sr6_roll_popup_value_${slot}_checkbox`] = "0";
    Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
      payload[`sr6_roll_popup_slot_${slot}_option_${optionSet}`] = "0";
      payload[`sr6_roll_popup_value_${slot}_select_${optionSet}`] = "";
    });
  }

  return payload;
}

function buildPopupFormPayload(definition, templateFields = {}, poolAttribute) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const payload = buildPopupResetPayload();

  popupFields.forEach((field, index) => {
    const slot = field.slot || (index + 1);
    if (slot > SR6_POPUP_FIELD_SLOT_COUNT) return;
    if (!fieldMatchesPopupVisibility(field, templateFields)) return;

    payload[`sr6_roll_popup_slot_${slot}_active`] = "1";
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "1";
    payload[`sr6_roll_popup_slot_${slot}_label`] = field.label || "";
    const fieldType = field.type === "select"
      ? "select"
      : field.type === "text"
        ? "text"
        : field.type === "checkbox"
          ? "checkbox"
          : "number";
    payload[getPopupFieldTypeToggleAttr(field, index, fieldType)] = "1";
    if (field.type === "select" && field.optionSet) {
      payload[getPopupFieldOptionToggleAttr(field, index)] = "1";
    }
    if (field.requiresCheckedSlot && field.requiresCheckedSlot === slot - 1) {
      payload[getPopupFieldDependencyToggleAttr(field, index)] = "1";
    }
    payload[getPopupFieldValueAttr(field, index)] = field.defaultValue !== undefined ? `${field.defaultValue}` : "0";
  });

  return payload;
}

function getPopupSourceAttrName(field, poolAttribute) {
  if (!field) return "";
  if (field.source === "pool") return poolAttribute || "";
  return field.sourceAttr || "";
}

function buildPopupRequestedAttributes(definition, poolAttribute, repeatingRowPrefix) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const requestedAttributes = [];

  popupFields.forEach((field) => {
    const sourceAttr = getPopupSourceAttrName(field, poolAttribute);
    if (!sourceAttr) return;
    requestedAttributes.push(sourceAttr);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${sourceAttr}`);
    }
  });

  return [...new Set(requestedAttributes)];
}

function buildPopupPrefillPayload(definition, poolAttribute, repeatingRowPrefix, values, templateFields = {}) {
  const popupFields = getRollPopupFields(definition, poolAttribute);
  const lookupAttr = buildAttrLookup(values || {}, repeatingRowPrefix);
  const resolvedTemplateFields = buildResolvedFields(templateFields || {}, lookupAttr);
  const payload = buildPopupFormPayload(definition, resolvedTemplateFields, poolAttribute);

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    const sourceAttr = getPopupSourceAttrName(field, poolAttribute);
    const resolvedValue = sourceAttr ? lookupAttr(sourceAttr) : "";
    if (resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === "") return;
    payload[getPopupFieldValueAttr(field, index)] = `${resolvedValue}`;
  });

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    if (!field.sourceField) return;
    const resolvedValue = resolvedTemplateFields[field.sourceField];
    if (resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === "") return;
    payload[getPopupFieldValueAttr(field, index)] = `${resolvedValue}`;
  });

  popupFields.forEach((field, index) => {
    if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
    if (field.id === "specialization" && resolvedTemplateFields["Spezialisierung Aktiv"] === "1" && resolvedTemplateFields.Spezialisierung) {
      payload[getPopupFieldValueAttr(field, index)] = "1";
    }
    if (field.id === "expertise" && resolvedTemplateFields["Expertise Aktiv"] === "1" && resolvedTemplateFields.Expertise) {
      payload[getPopupFieldValueAttr(field, index)] = "1";
    }
  });

  if (typeof resolveComputedCombatPopupSkillBonusState === "function") {
    const combatSkillBonusState = resolveComputedCombatPopupSkillBonusState(definition, resolvedTemplateFields, lookupAttr);
    if (combatSkillBonusState) {
      popupFields.forEach((field, index) => {
        if (!fieldMatchesPopupVisibility(field, resolvedTemplateFields)) return;
        if (field.id === "specialization") {
          payload[getPopupFieldValueAttr(field, index)] = combatSkillBonusState.specializationActive ? "1" : "0";
        }
        if (field.id === "expertise") {
          payload[getPopupFieldValueAttr(field, index)] = combatSkillBonusState.expertiseActive ? "1" : "0";
        }
      });
    }
  }

  return payload;
}

function getPopupDerivedResults(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  return Array.isArray(resolvedDefinition.popupDerivedResults) ? resolvedDefinition.popupDerivedResults : [];
}
// END MODULE: workers/rolls/definition-resolver
// END MODULE: workers/rolls/definition-resolver
