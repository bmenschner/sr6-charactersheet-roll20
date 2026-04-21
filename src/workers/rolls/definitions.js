// BEGIN MODULE: workers/rolls/definitions
const SR6_ROLL_TITLE_PREFIXES = [
  { prefix: "sr6_combat_", title: "Kampf" },
  { prefix: "sr6_fernkampf_", title: "Fernkampfwaffen" },
  { prefix: "sr6_nahkampf_", title: "Nahkampfwaffen" },
  { prefix: "sr6_matrix_handlung_", title: "Matrix-Handlungen" },
  { prefix: "sr6_matrix_", title: "Matrix: Kernwerte" },
  { prefix: "sr6_rigging_manoever_", title: "Manöver" },
  { prefix: "sr6_rigging_", title: "Rigging: Kernwerte" },
  { prefix: "sr6_magic_", title: "Magie: Kernwerte" },
  { prefix: "sr6_zauber_", title: "Zauber" },
  { prefix: "sr6_ritual_", title: "Rituale" },
  { prefix: "sr6_verteidigung_", title: "Verteidigung" },
  { prefix: "sr6_schadenswiderstand_", title: "Schadenswiderstand" },
  { prefix: "sr6_skill_", title: "Fertigkeiten" },
  { prefix: "sr6_wissensfertigkeit_", title: "Wissensfertigkeiten" },
  { prefix: "sr6_sprachfertigkeit_", title: "Sprachfertigkeiten" },
  { prefix: "sr6_talentsoft_", title: "Talentsofts" },
  { prefix: "sr6_wissenssprachsoft_", title: "Wissens-/Sprachsofts" },
];

const SR6_DEFAULT_ROLL_ROW_ORDER = [
  "Attribut",
  "Fertigkeit",
  "Wert",
  "Waffe",
  "Schadenswert",
  "Handlung",
  "Reichweite",
  "Munition",
  "Modus",
  "Basis",
  "Gesamt",
];

const SR6_POPUP_FIELD_SLOT_COUNT = 3;

const SR6_POPUP_SELECT_OPTION_SETS = {
  visibility: [
    { value: "clear", label: "Klare Sicht", poolMod: 0, rowValue: "Klare Sicht" },
    { value: "partial", label: "Leicht verdeckt", poolMod: -1, rowValue: "Leicht verdeckt" },
    { value: "heavy", label: "Stark verdeckt", poolMod: -2, rowValue: "Stark verdeckt" },
    { value: "blind", label: "Blindes Feuer", poolMod: -3, rowValue: "Blindes Feuer" },
  ],
  movement: [
    { value: "steady", label: "Ruhiges Ziel", poolMod: 0, rowValue: "Ruhiges Ziel" },
    { value: "walking", label: "Leichte Bewegung", poolMod: -1, rowValue: "Leichte Bewegung" },
    { value: "running", label: "Schnelle Bewegung", poolMod: -2, rowValue: "Schnelle Bewegung" },
  ],
  spell_range: [
    { value: "Selbst", label: "Selbst", rowValue: "Selbst" },
    { value: "Beruehrung", label: "Berührung", rowValue: "Berührung" },
    { value: "Sicht", label: "Sicht", rowValue: "Sicht" },
    { value: "Spezial", label: "Spezial", rowValue: "Spezial" },
  ],
  matrix_access: [
    { value: "Benutzer", label: "Benutzer", rowValue: "Benutzer" },
    { value: "Admin", label: "Admin", rowValue: "Admin" },
    { value: "Root", label: "Root", rowValue: "Root" },
  ],
};

const SR6_DEFAULT_POPUP_FIELDS = [
  {
    id: "pool_mod",
    slot: 1,
    label: "Popup-Modifikator",
    type: "number",
    affects: "pool",
    defaultValue: "0",
    includeInTemplate: true,
  },
];

const SR6_ROLL_DEFINITIONS = [
  {
    id: "attribute",
    matchField: "Attribut",
    titleMode: "field-short",
    titleField: "Attribut",
    primaryFields: ["Attribut"],
    extraFields: [],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
  {
    id: "skill",
    matchField: "Fertigkeit",
    titleMode: "pool-prefix",
    primaryFields: ["Fertigkeit"],
    extraFields: [],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Fertigkeiten",
  },
  {
    id: "spell",
    matchField: "Zauber",
    titleMode: "pool-prefix",
    primaryFields: ["Zauber"],
    extraFields: ["Entzug"],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "spell_range",
        slot: 2,
        label: "Reichweite",
        type: "select",
        optionSet: "spell_range",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Sicht",
      },
      {
        id: "drain_mod",
        slot: 3,
        label: "Entzug-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Zauber",
  },
  {
    id: "matrix_action",
    matchField: "Handlung",
    matchPoolPrefix: "sr6_matrix_handlung_",
    titleMode: "pool-prefix",
    primaryFields: ["Handlung"],
    extraFields: [],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "matrix_access",
        slot: 2,
        label: "Zugriff",
        type: "select",
        optionSet: "matrix_access",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Benutzer",
      },
      {
        id: "matrix_overwatch",
        slot: 3,
        label: "Overwatch-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Matrix-Handlungen",
  },
  {
    id: "matrix_value",
    matchField: "Wert",
    matchPoolPrefix: "sr6_matrix_",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "matrix_access",
        slot: 2,
        label: "Zugriff",
        type: "select",
        optionSet: "matrix_access",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "Benutzer",
      },
      {
        id: "matrix_overwatch",
        slot: 3,
        label: "Overwatch-Modifikator",
        type: "number",
        affects: "display",
        includeInTemplate: true,
        defaultValue: "0",
      },
    ],
    titleFallback: "Matrix: Kernwerte",
  },
  {
    id: "value",
    matchField: "Wert",
    titleMode: "pool-prefix",
    primaryFields: ["Wert"],
    extraFields: [],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
  {
    id: "weapon",
    matchField: "Waffe",
    titleMode: "pool-prefix",
    primaryFields: ["Waffe"],
    extraFields: ["Schadenswert", "Munition", "Reichweite", "Modus"],
    popupFields: [
      SR6_DEFAULT_POPUP_FIELDS[0],
      {
        id: "visibility",
        slot: 2,
        label: "Sichtverhältnisse",
        type: "select",
        optionSet: "visibility",
        affects: "pool",
        includeInTemplate: true,
        defaultValue: "clear",
      },
      {
        id: "movement",
        slot: 3,
        label: "Bewegung",
        type: "select",
        optionSet: "movement",
        affects: "pool",
        includeInTemplate: true,
        defaultValue: "steady",
      },
    ],
    titleFallback: "Kampf",
  },
  {
    id: "fallback",
    titleMode: "pool-prefix-or-explicit",
    primaryFields: [],
    extraFields: ["Basis", "Gesamt"],
    popupFields: SR6_DEFAULT_POPUP_FIELDS,
    titleFallback: "Probe",
  },
];

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
  for (let index = 0; index < SR6_ROLL_DEFINITIONS.length; index += 1) {
    const definition = SR6_ROLL_DEFINITIONS[index];
    const fieldMatches = !definition.matchField || fields[definition.matchField];
    const poolMatches = !definition.matchPoolPrefix || poolAttribute.startsWith(definition.matchPoolPrefix);
    if (fieldMatches && poolMatches) {
      return definition;
    }
  }

  return SR6_ROLL_DEFINITIONS[SR6_ROLL_DEFINITIONS.length - 1];
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

function getRollPopupFields(definition) {
  const resolvedDefinition = definition || resolveRollDefinition({});
  if (Array.isArray(resolvedDefinition.popupFields) && resolvedDefinition.popupFields.length > 0) {
    return resolvedDefinition.popupFields;
  }
  return SR6_DEFAULT_POPUP_FIELDS;
}

function getPopupFieldValueAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  if (field && field.type === "select") {
    return `sr6_roll_popup_value_${slot}_select_${field.optionSet || "default"}`;
  }
  return `sr6_roll_popup_value_${slot}_number`;
}

function getPopupFieldTypeToggleAttr(field, index, type) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_is_${type}`;
}

function getPopupFieldOptionToggleAttr(field, index) {
  const slot = (field && field.slot) || (index + 1);
  return `sr6_roll_popup_slot_${slot}_option_${field.optionSet || "none"}`;
}

function getPopupSelectOptions(field) {
  if (!field || field.type !== "select" || !field.optionSet) return [];
  return SR6_POPUP_SELECT_OPTION_SETS[field.optionSet] || [];
}

function buildPopupStateFromValues(values, definition) {
  const popupFields = getRollPopupFields(definition);
  const popupRows = [];
  let poolMod = 0;

  popupFields.forEach((field, index) => {
    const rawValue = values[getPopupFieldValueAttr(field, index)];
    const isNumberField = field.type === "number";
    const normalizedValue = isNumberField ? parseNumber(rawValue) : `${rawValue || ""}`.trim();
    const selectedOption = isNumberField
      ? null
      : getPopupSelectOptions(field).find((option) => option.value === normalizedValue);
    const displayValue = isNumberField
      ? `${normalizedValue}`
      : `${(selectedOption && (selectedOption.rowValue || selectedOption.label)) || normalizedValue}`;

    if (field.affects === "pool") {
      poolMod += isNumberField
        ? parseNumber(normalizedValue)
        : parseNumber(selectedOption && selectedOption.poolMod);
    }

    const shouldInclude =
      field.includeInTemplate &&
      (
        (isNumberField && parseNumber(normalizedValue) !== 0) ||
        (!isNumberField && normalizedValue !== "" && normalizedValue !== `${field.defaultValue || ""}`)
      );

    if (shouldInclude) {
      popupRows.push({
        label: field.label,
        value: displayValue,
      });
    }
  });

  return {
    poolMod: poolMod,
    rows: popupRows,
  };
}

function buildPopupFormPayload(definition) {
  const popupFields = getRollPopupFields(definition);
  const payload = {};

  for (let slot = 1; slot <= SR6_POPUP_FIELD_SLOT_COUNT; slot += 1) {
    payload[`sr6_roll_popup_slot_${slot}_visible`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_label`] = "";
    payload[`sr6_roll_popup_slot_${slot}_is_number`] = "0";
    payload[`sr6_roll_popup_slot_${slot}_is_select`] = "0";
    payload[`sr6_roll_popup_value_${slot}_number`] = "0";
    Object.keys(SR6_POPUP_SELECT_OPTION_SETS).forEach((optionSet) => {
      payload[`sr6_roll_popup_slot_${slot}_option_${optionSet}`] = "0";
      payload[`sr6_roll_popup_value_${slot}_select_${optionSet}`] = "";
    });
  }

  popupFields.forEach((field, index) => {
    const slot = field.slot || (index + 1);
    if (slot > SR6_POPUP_FIELD_SLOT_COUNT) return;

    payload[`sr6_roll_popup_slot_${slot}_visible`] = "1";
    payload[`sr6_roll_popup_slot_${slot}_label`] = field.label || "";
    payload[getPopupFieldTypeToggleAttr(field, index, field.type === "select" ? "select" : "number")] = "1";
    if (field.type === "select" && field.optionSet) {
      payload[getPopupFieldOptionToggleAttr(field, index)] = "1";
    }
    payload[getPopupFieldValueAttr(field, index)] = field.defaultValue !== undefined ? `${field.defaultValue}` : "0";
  });

  return payload;
}
// END MODULE: workers/rolls/definitions
