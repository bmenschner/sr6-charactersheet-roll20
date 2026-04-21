// BEGIN BLOCK: Worker Includes (core)
// BEGIN MODULE: workers/core/constants
const SR6_ATTRIBUTES = [
  "konstitution",
  "geschicklichkeit",
  "reaktion",
  "staerke",
  "willenskraft",
  "logik",
  "intuition",
  "charisma",
  "edge",
  "magie_resonanz"
];

const SR6_SKILLS = [
  "astral",
  "athletik",
  "beschwoeren",
  "biotech",
  "cracken",
  "einfluss",
  "elektronik",
  "exotische_waffen",
  "feuerwaffen",
  "heimlichkeit",
  "hexerei",
  "mechanik",
  "nahkampf",
  "natur",
  "steuern",
  "tasken",
  "ueberreden",
  "verzaubern",
  "wahrnehmung"
];

const SR6_MATRIX_ACTIONS = [
  "ausstoepseln",
  "befehl_vortaeuschen",
  "bedrohungsanalyse",
  "brute_force",
  "datei_cracken",
  "datei_editieren",
  "datei_verschluesseln",
  "datenbombe_entschaerfen",
  "datenbombe_legen",
  "datenspike",
  "ersticken",
  "garbage_in_garbage_out",
  "geraet_formatieren",
  "geraet_neu_starten",
  "geraet_steuern",
  "geraetesperre",
  "hineinspringen",
  "hintertuer_benutzen",
  "hintertuer_mit_bekanntem_exploit_benutzen",
  "host_betreten_verlassen",
  "icon_aufspueren",
  "icon_modifizieren",
  "icon_veraendern",
  "infrastruktur_unterwandern",
  "interfacemodus_wechseln",
  "kalibrierung",
  "maskerade",
  "matrixattribute_austauschen",
  "matrixsignatur_loeschen",
  "matrixsuche",
  "matrixwahrnehmung",
  "mittelsmetamensch",
  "nachricht_uebermitteln",
  "overwatch_wert_bestimmen",
  "pop_up",
  "programm_abstuerzen_lassen",
  "pruefsummensuche",
  "signal_stoeren",
  "sondieren",
  "stalking",
  "teergrube",
  "uebertragung_abfangen",
  "verstecken",
  "verzoegerter_befehl",
  "virtuelles_zielen",
  "volle_matrixabwehr"
];
// END MODULE: workers/core/constants

// BEGIN MODULE: workers/core/helpers
function parseNumber(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isCheckedValue(value) {
  const normalized = `${value || ""}`.trim().toLowerCase();
  return normalized === "1" || normalized === "on" || normalized === "true" || normalized === "yes";
}

function mapTraditionsattributToKey(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "charisma") return "charisma";
  if (normalized === "intuition") return "intuition";
  if (normalized === "konstitution") return "konstitution";
  if (normalized === "logik") return "logik";
  if (normalized === "willenskraft") return "willenskraft";
  return "";
}
// END MODULE: workers/core/helpers

// BEGIN MODULE: workers/core/guards
function setAttrsSilent(payload, callback) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  if (typeof callback === "function") {
    setAttrs(payload, { silent: true }, callback);
    return;
  }
  setAttrs(payload, { silent: true });
}
// END MODULE: workers/core/guards

// END BLOCK: Worker Includes (core)

// BEGIN BLOCK: Worker Includes (rolls)
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

// BEGIN MODULE: workers/rolls/context
function parseTemplateFields(template) {
  const fields = {};
  let index = 0;

  while (index < template.length) {
    const start = template.indexOf("{{", index);
    if (start === -1) break;

    let cursor = start + 2;
    let key = "";
    while (cursor < template.length && template[cursor] !== "=") {
      key += template[cursor];
      cursor += 1;
    }
    if (cursor >= template.length) break;
    cursor += 1;

    let value = "";
    let attrDepth = 0;
    while (cursor < template.length) {
      const current = template[cursor];
      const next = template[cursor + 1];

      if (current === "@" && next === "{") {
        attrDepth += 1;
        value += "@{";
        cursor += 2;
        continue;
      }

      if (current === "}" && attrDepth > 0) {
        attrDepth -= 1;
        value += current;
        cursor += 1;
        continue;
      }

      if (current === "}" && next === "}" && attrDepth === 0) {
        cursor += 2;
        break;
      }

      value += current;
      cursor += 1;
    }

    if (key.trim()) {
      fields[key.trim()] = value.trim();
    }

    index = cursor;
  }

  return fields;
}

function collectAttributeReferences(template) {
  const refs = [];
  const attributeRefRegex = /@\{([^}]+)\}/g;
  let match;

  while ((match = attributeRefRegex.exec(template)) !== null) {
    refs.push(match[1]);
  }

  return [...new Set(refs)];
}

function parsePoolAttributeFromFields(fields) {
  const erfolgeField = fields.Erfolge || "";
  const match = erfolgeField.match(/\[\[@\{([^}]+)\}d6(?:cs>|>)5\]\]/);
  return match ? match[1] : "";
}

function extractRepeatingRowPrefix(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^(repeating_[^_]+_[^_]+)_/);
  return match ? match[1] : "";
}

function buildAttrLookup(values, repeatingRowPrefix) {
  return function lookupAttr(key) {
    if (!key) return "";
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return values[key];
    }
    if (repeatingRowPrefix) {
      const repeatingKey = `${repeatingRowPrefix}_${key}`;
      if (Object.prototype.hasOwnProperty.call(values, repeatingKey)) {
        return values[repeatingKey];
      }
    }
    return "";
  };
}

function resolveFieldText(templateValue, lookupAttr) {
  if (!templateValue) return "";
  return templateValue.replace(/@\{([^}]+)\}/g, (_, key) => lookupAttr(key));
}

function buildResolvedFields(fields, lookupAttr) {
  const resolved = {};
  Object.keys(fields).forEach((key) => {
    resolved[key] = resolveFieldText(fields[key], lookupAttr);
  });
  return resolved;
}

function buildRequestedAttributes(rawTemplate, repeatingRowPrefix) {
  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  const definition = resolveRollDefinition(fields, poolAttribute);
  const attributeRefs = collectAttributeReferences(rawTemplate);

  if (poolAttribute && !attributeRefs.includes(poolAttribute)) {
    attributeRefs.push(poolAttribute);
  }

  if (poolAttribute) {
    attributeRefs.push("sr6_monitor_pool_mod");
  }

  const requestedAttributes = [];
  attributeRefs.forEach((attributeRef) => {
    requestedAttributes.push(attributeRef);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${attributeRef}`);
    }
  });

  return {
    definition: definition,
    fields: fields,
    poolAttribute: poolAttribute,
    requestedAttributes: requestedAttributes,
  };
}
// END MODULE: workers/rolls/context

// BEGIN MODULE: workers/rolls/display
function buildDiceDetails(diceResults) {
  return diceResults.join(" + ");
}

function getDieToneStyle(tone) {
  if (tone === "success") {
    return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #9fcb9f;background:#dff3df;color:#1f5f1f;font-weight:700;line-height:1;";
  }
  if (tone === "fail") {
    return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #e3a8af;background:#f8d7da;color:#7a0f1b;font-weight:700;line-height:1;";
  }
  return "display:inline-flex;align-items:center;justify-content:center;min-width:1.35rem;height:1.35rem;padding:0 0.25rem;border-radius:0.22rem;border:0.125rem solid #d0d0d0;background:#ececec;color:#111111;font-weight:700;line-height:1;";
}

function buildDetailsDice(diceResults, maxDice = 20) {
  return diceResults.slice(0, maxDice).map((die) => {
    let tone = "neutral";
    if (die === 1) tone = "fail";
    if (die >= 5) tone = "success";
    return { value: `${die}`, tone: tone, style: getDieToneStyle(tone) };
  });
}

function buildProbeRows(resolvedFields, definition) {
  const ignoredKeys = new Set(["name", "Pool", "Erfolge", "Details"]);
  const preferredOrder = buildRollRowOrder(definition);

  const rows = [];
  const usedKeys = new Set();

  preferredOrder.forEach((key) => {
    if (!ignoredKeys.has(key) && resolvedFields[key]) {
      rows.push({ label: key, value: resolvedFields[key] });
      usedKeys.add(key);
    }
  });

  Object.keys(resolvedFields).forEach((key) => {
    if (ignoredKeys.has(key) || usedKeys.has(key) || !resolvedFields[key]) return;
    rows.push({ label: key, value: resolvedFields[key] });
  });

  return rows.slice(0, 4);
}

function getShortLabelValue(value) {
  if (!value) return "";
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

function deriveProbeTitle(resolvedFields, poolAttribute, definition) {
  const explicitName = resolvedFields.name;
  const resolvedDefinition = definition || resolveRollDefinition(resolvedFields, poolAttribute);

  if (resolvedDefinition && resolvedDefinition.titleMode === "field-short" && resolvedDefinition.titleField) {
    const shortFieldValue = getShortLabelValue(resolvedFields[resolvedDefinition.titleField]);
    if (shortFieldValue) {
      return shortFieldValue;
    }
  }

  const titleFromPoolAttribute = findRollTitleByPoolAttribute(poolAttribute);
  if (titleFromPoolAttribute) {
    return titleFromPoolAttribute;
  }

  if (explicitName && resolvedDefinition && resolvedDefinition.titleMode === "explicit-name") {
    return explicitName;
  }

  if (explicitName) return explicitName;
  if (resolvedDefinition && resolvedDefinition.titleFallback) return resolvedDefinition.titleFallback;
  return "Probe";
}

function buildSr6ProbeMessage(payload) {
  const parts = ["&{template:sr6probe}"];
  const name = payload.name || "Probe";
  parts.push(`{{name=${name}}}`);

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    parts.push(`{{label${rowNumber}=${row.label}}}`);
    parts.push(`{{value${rowNumber}=${row.value}}}`);
  });

  if (payload.pool !== undefined && payload.pool !== null && `${payload.pool}` !== "") {
    parts.push(`{{pool=${payload.pool}}}`);
  }

  if (payload.erfolge !== undefined && payload.erfolge !== null && `${payload.erfolge}` !== "") {
    parts.push(`{{erfolge=${payload.erfolge}}}`);
  }

  if (payload.details) {
    parts.push(`{{details=${payload.details}}}`);
  }

  const detailsDice = Array.isArray(payload.detailsDice) ? payload.detailsDice : [];
  if (detailsDice.length > 0) {
    parts.push("{{details_dice=1}}");
    detailsDice.forEach((die, index) => {
      const dieIndex = index + 1;
      parts.push(`{{d${dieIndex}_v=${die.value}}}`);
      parts.push(`{{d${dieIndex}_t=${die.tone}}}`);
      parts.push(`{{d${dieIndex}_s=${die.style}}}`);
    });
  }

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function buildEdgeTokenMessage(actionText, edgeCurrent) {
  return `&{template:default} {{name=Edge Token}} {{Details=Hat 1 Edge ${actionText}. <br /> Aktuelles Edge: ${edgeCurrent}.}}`;
}
// END MODULE: workers/rolls/display

// BEGIN MODULE: workers/rolls/compute
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildProbeComputation(lookupAttr, poolAttribute, popupPoolMod) {
  const poolBasis = parseNumber(lookupAttr(poolAttribute));
  const monitorPoolMod = parseNumber(lookupAttr("sr6_monitor_pool_mod"));
  const poolPopupMod = parseNumber(popupPoolMod);
  const pool = Math.max(0, poolBasis + monitorPoolMod + poolPopupMod);
  const diceResults = [];

  for (let index = 0; index < pool; index += 1) {
    diceResults.push(rollD6());
  }

  const successCount = diceResults.filter((die) => die >= 5).length;
  const glitchState = evaluateGlitch(diceResults, successCount);

  return {
    poolBasis: poolBasis,
    monitorPoolMod: monitorPoolMod,
    poolPopupMod: poolPopupMod,
    pool: pool,
    diceResults: diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}
// END MODULE: workers/rolls/compute

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

// BEGIN MODULE: workers/rolls/popup
function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  const parsedFields = parseTemplateFields(rawTemplate);
  const definition = resolveRollDefinition(parsedFields, parsePoolAttributeFromFields(parsedFields));

  getAttrs(["sr6_setting_popup_mods"], (values) => {
    const popupSetting = (values.sr6_setting_popup_mods || "eigen").toLowerCase();
    const useRoll20Fallback = popupSetting === "roll20";

    if (!useRoll20Fallback) {
      const popupFormPayload = buildPopupFormPayload(definition);
      setAttrsSilent({
        ...popupFormPayload,
        sr6_roll_popup_definition: definition.id,
        sr6_roll_popup_template: rawTemplate,
        sr6_roll_popup_row_prefix: repeatingRowPrefix || "",
        sr6_roll_popup_open: "1",
      });
      return;
    }

    startRoll(
      "&{template:default} {{name=Probenmodifikator}} {{Wert=[[?{Modifikator|0}]]}}",
      (queryResult) => {
        const queryRoll = queryResult && queryResult.results && queryResult.results.Wert;
        const popupState = {
          poolMod: parseNumber(queryRoll && queryRoll.result),
          rows: parseNumber(queryRoll && queryRoll.result) !== 0
            ? [{ label: "Popup-Modifikator", value: `${parseNumber(queryRoll && queryRoll.result)}` }]
            : [],
        };
        if (queryResult && queryResult.rollId) {
          finishRoll(queryResult.rollId);
        }
        runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
      }
    );
  });
}

function runTestPopupProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  getAttrs(["sr6_test_roll_popup_mod"], (values) => {
    const popupPoolMod = parseNumber(values.sr6_test_roll_popup_mod);
    const popupState = {
      poolMod: popupPoolMod,
      rows: popupPoolMod !== 0 ? [{ label: "Popup-Modifikator", value: `${popupPoolMod}` }] : [],
    };
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeConfirm() {
  getAttrs([
    "sr6_roll_popup_definition",
    "sr6_roll_popup_template",
    "sr6_roll_popup_row_prefix",
    "sr6_roll_popup_value_1_number",
    "sr6_roll_popup_value_2_number",
    "sr6_roll_popup_value_3_number",
    "sr6_roll_popup_value_1_select_visibility",
    "sr6_roll_popup_value_2_select_visibility",
    "sr6_roll_popup_value_3_select_visibility",
    "sr6_roll_popup_value_1_select_movement",
    "sr6_roll_popup_value_2_select_movement",
    "sr6_roll_popup_value_3_select_movement",
    "sr6_roll_popup_value_1_select_spell_range",
    "sr6_roll_popup_value_2_select_spell_range",
    "sr6_roll_popup_value_3_select_spell_range",
    "sr6_roll_popup_value_1_select_matrix_access",
    "sr6_roll_popup_value_2_select_matrix_access",
    "sr6_roll_popup_value_3_select_matrix_access",
  ], (values) => {
    const definition = getRollDefinitionById(values.sr6_roll_popup_definition || "");
    const rawTemplate = values.sr6_roll_popup_template || "";
    const repeatingRowPrefix = values.sr6_roll_popup_row_prefix || "";
    const popupState = buildPopupStateFromValues(values, definition);

    setAttrsSilent({ sr6_roll_popup_open: "0" });
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeCancel() {
  setAttrsSilent({ sr6_roll_popup_open: "0" });
}
// END MODULE: workers/rolls/popup

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

// BEGIN MODULE: workers/rolls/index
function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:probe_popup_test", runTestPopupProbeRoll);
  on("clicked:probe_popup_confirm", runGlobalPopupProbeConfirm);
  on("clicked:probe_popup_cancel", runGlobalPopupProbeCancel);
}

function registerEdgeTokenEvents() {
  on("clicked:sr6_edge_token_plus", runEdgeTokenPlus);
  on("clicked:sr6_edge_token_minus", runEdgeTokenMinus);
}
// END MODULE: workers/rolls/index

// END BLOCK: Worker Includes (rolls)

// BEGIN BLOCK: Worker Includes (compute)
// BEGIN MODULE: workers/compute/attributes
function appendAttributeRequestKeys(requestKeys) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    requestKeys.push(`sr6_attr_${attributeName}_grundwert`);
    requestKeys.push(`sr6_attr_${attributeName}_modifikator`);
  });
}

function computeAttributeTotals(values, updates, totals) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    const baseKey = `sr6_attr_${attributeName}_grundwert`;
    const modifierKey = `sr6_attr_${attributeName}_modifikator`;
    const totalKey = `sr6_attr_${attributeName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    totals[attributeName] = total;
    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/attributes

// BEGIN MODULE: workers/compute/skills
function appendSkillRequestKeys(requestKeys) {
  SR6_SKILLS.forEach((skillName) => {
    requestKeys.push(`sr6_skill_${skillName}_grundwert`);
    requestKeys.push(`sr6_skill_${skillName}_modifikator`);
  });
}

function computeSkillTotals(values, updates, skillTotals) {
  SR6_SKILLS.forEach((skillName) => {
    const baseKey = `sr6_skill_${skillName}_grundwert`;
    const modifierKey = `sr6_skill_${skillName}_modifikator`;
    const totalKey = `sr6_skill_${skillName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    skillTotals[skillName] = total;
    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/skills

// BEGIN MODULE: workers/compute/header-monitor
function appendHeaderMonitorRequestKeys(requestKeys) {
  for (let index = 1; index <= 18; index += 1) {
    requestKeys.push(`sr6_monitor_koerperlich_${index}`);
    requestKeys.push(`sr6_monitor_geistig_${index}`);
  }
}

function sanitizeAndCountHeaderMonitor(values, updates, monitorPrefix, maxBoxes) {
  let count = 0;
  for (let index = 1; index <= 18; index += 1) {
    const key = `sr6_monitor_${monitorPrefix}_${index}`;
    const checked = isCheckedValue(values[key]);

    if (index > maxBoxes) {
      if (checked) {
        updates[key] = "0";
      }
      continue;
    }

    if (checked) {
      count += 1;
    }
  }
  return count;
}

function computeHeaderMonitorDerivedFromAttributes(totals, values, updates) {
  const konstitution = totals.konstitution || 0;
  const willenskraft = totals.willenskraft || 0;

  const koerperlichMax = clampNumber(8 + Math.ceil(konstitution / 2), 0, 18);
  const geistigMax = clampNumber(8 + Math.ceil(willenskraft / 2), 0, 18);
  const koerperlichCount = sanitizeAndCountHeaderMonitor(values, updates, "koerperlich", koerperlichMax);
  const geistigCount = sanitizeAndCountHeaderMonitor(values, updates, "geistig", geistigMax);
  const poolMod = -1 * (Math.floor(koerperlichCount / 3) + Math.floor(geistigCount / 3));

  updates.sr6_derived_koerperlicher_monitor_max = String(koerperlichMax);
  updates.sr6_derived_geistiger_monitor_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_max = String(koerperlichMax);
  updates.sr6_monitor_geistig_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_count = String(koerperlichCount);
  updates.sr6_monitor_geistig_count = String(geistigCount);
  updates.sr6_monitor_koerperlich = String(koerperlichCount);
  updates.sr6_monitor_geistig = String(geistigCount);
  updates.sr6_monitor_pool_mod = String(poolMod);
}
// END MODULE: workers/compute/header-monitor

// BEGIN MODULE: workers/compute/combat
function computeCombatDerivedFromAttributes(totals, values, updates) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);
}
// END MODULE: workers/compute/combat

// BEGIN MODULE: workers/compute/magic
function appendMagicRequestKeys(requestKeys) {
  requestKeys.push("sr6_magic_traditionsattribut_1");
  requestKeys.push("sr6_magic_traditionsattribut_2");
}

function computeMagicDerived(values, totals, skillTotals, updates) {
  updates.sr6_magic_magie = String(totals.magie_resonanz || 0);
  updates.sr6_magic_zauberpool = String(skillTotals.hexerei || 0);
  updates.sr6_magic_spruchzauberei = String(
    parseNumber(updates.sr6_magic_magie) + parseNumber(updates.sr6_magic_zauberpool)
  );
  updates.sr6_magic_waffenloser_kampf = String((skillTotals.astral || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_waffenfoki = String((skillTotals.nahkampf || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_astrale_verteidigung = String((totals.logik || 0) + (totals.intuition || 0));
  updates.sr6_magic_astraler_schadenswiderstand = String(totals.willenskraft || 0);
  updates.sr6_magic_astrale_initiative = String((totals.logik || 0) + (totals.intuition || 0));

  const traditionKey1 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_1);
  const traditionKey2 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_2);
  const traditionValue1 = traditionKey1 ? (totals[traditionKey1] || 0) : 0;
  const traditionValue2 = traditionKey2 ? (totals[traditionKey2] || 0) : 0;

  updates.sr6_magic_entzug_widerstand = String(traditionValue1 + traditionValue2);
  updates.sr6_magic_astralkampf_angriffswert = String((totals.magie_resonanz || 0) + traditionValue1);
  updates.sr6_magic_astralkampf_verteidigungswert = String(totals.intuition || 0);
}
// END MODULE: workers/compute/magic

// BEGIN MODULE: workers/compute/matrix
function appendMatrixRequestKeys(requestKeys) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    requestKeys.push(`sr6_matrix_handlung_${actionName}_grundwert`);
    requestKeys.push(`sr6_matrix_handlung_${actionName}_modifikator`);
  });
}

function computeMatrixTotals(values, updates) {
  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    const baseKey = `sr6_matrix_handlung_${actionName}_grundwert`;
    const modifierKey = `sr6_matrix_handlung_${actionName}_modifikator`;
    const totalKey = `sr6_matrix_handlung_${actionName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/matrix

// BEGIN MODULE: workers/compute/rigging
// Rigging-Compute-Slot.
// Aktuell werden im Rigging-Tab keine automatischen Derived-Werte gesetzt,
// da die angezeigten Kernwerte als direkte Eingaben gefuehrt werden.
function computeRiggingDerived(_values, _totals, _skillTotals, _updates) {
  // bewusst leer
}
// END MODULE: workers/compute/rigging

// END BLOCK: Worker Includes (compute)

// BEGIN BLOCK: Worker Includes (ui)
// BEGIN MODULE: workers/ui/defaults
function resetTabToAllgemeinOnOpen() {
  setAttrsSilent({ sr6_daten_tab: "allgemein" });
}

function getEditModeResetPayload() {
  return {
    sr6_allgemein_attribute_edit_mode: "0",
    sr6_allgemein_initiative_edit_mode: "0",
    sr6_allgemein_fertigkeiten_view: "fertigkeiten",
    sr6_fertigkeiten_edit_mode: "0",
    sr6_allgemein_kampf_edit_mode: "0",
    sr6_allgemein_verteidigung_edit_mode: "0",
    sr6_allgemein_schadenswiderstand_edit_mode: "0",
    sr6_magic_zauber_edit_mode: "0",
    sr6_magic_adeptenkraefte_edit_mode: "0",
    sr6_magic_foki_edit_mode: "0",
    sr6_magic_metamagie_edit_mode: "0",
    sr6_magic_rituale_edit_mode: "0",
    sr6_magic_geister_edit_mode: "0",
    sr6_matrix_programme_edit_mode: "0",
    sr6_matrix_geraete_edit_mode: "0",
    sr6_matrix_handlungen_edit_mode: "0",
    sr6_rigging_fahrzeuge_edit_mode: "0",
    sr6_rigging_programme_edit_mode: "0",
    sr6_rigging_zubehoer_edit_mode: "0",
    sr6_rigging_agenten_edit_mode: "0",
    sr6_rigging_manoever_edit_mode: "0",
    sr6_ausruestung_edit_mode: "0",
    sr6_cyberware_edit_mode: "0",
    sr6_bioware_edit_mode: "0",
    sr6_sin_edit_mode: "0",
    sr6_lebensstil_edit_mode: "0",
    sr6_setting_popup_mods: "eigen",
    sr6_roll_popup_open: "0",
    sr6_roll_popup_definition: "",
    sr6_roll_popup_slot_1_visible: "0",
    sr6_roll_popup_slot_2_visible: "0",
    sr6_roll_popup_slot_3_visible: "0",
    sr6_roll_popup_slot_1_is_number: "0",
    sr6_roll_popup_slot_2_is_number: "0",
    sr6_roll_popup_slot_3_is_number: "0",
    sr6_roll_popup_slot_1_is_select: "0",
    sr6_roll_popup_slot_2_is_select: "0",
    sr6_roll_popup_slot_3_is_select: "0",
    sr6_roll_popup_slot_1_label: "",
    sr6_roll_popup_slot_2_label: "",
    sr6_roll_popup_slot_3_label: "",
    sr6_roll_popup_slot_1_option_visibility: "0",
    sr6_roll_popup_slot_2_option_visibility: "0",
    sr6_roll_popup_slot_3_option_visibility: "0",
    sr6_roll_popup_slot_1_option_movement: "0",
    sr6_roll_popup_slot_2_option_movement: "0",
    sr6_roll_popup_slot_3_option_movement: "0",
    sr6_roll_popup_slot_1_option_spell_range: "0",
    sr6_roll_popup_slot_2_option_spell_range: "0",
    sr6_roll_popup_slot_3_option_spell_range: "0",
    sr6_roll_popup_slot_1_option_matrix_access: "0",
    sr6_roll_popup_slot_2_option_matrix_access: "0",
    sr6_roll_popup_slot_3_option_matrix_access: "0",
    sr6_roll_popup_value_1_number: "0",
    sr6_roll_popup_value_2_number: "0",
    sr6_roll_popup_value_3_number: "0",
    sr6_roll_popup_value_1_select_visibility: "",
    sr6_roll_popup_value_2_select_visibility: "",
    sr6_roll_popup_value_3_select_visibility: "",
    sr6_roll_popup_value_1_select_movement: "",
    sr6_roll_popup_value_2_select_movement: "",
    sr6_roll_popup_value_3_select_movement: "",
    sr6_roll_popup_value_1_select_spell_range: "",
    sr6_roll_popup_value_2_select_spell_range: "",
    sr6_roll_popup_value_3_select_spell_range: "",
    sr6_roll_popup_value_1_select_matrix_access: "",
    sr6_roll_popup_value_2_select_matrix_access: "",
    sr6_roll_popup_value_3_select_matrix_access: "",
  };
}

function resetEditModesOnOpen() {
  setAttrsSilent(getEditModeResetPayload());
}
// END MODULE: workers/ui/defaults

// BEGIN MODULE: workers/ui/monitor-cascade
function buildMonitorKeys(prefix) {
  const keys = [];
  for (let index = 1; index <= 18; index += 1) {
    keys.push(`sr6_monitor_${prefix}_${index}`);
  }
  keys.push(`sr6_monitor_${prefix}_max`);
  return keys;
}

function parseMonitorEventSource(sourceAttribute) {
  const match = /^sr6_monitor_(koerperlich|geistig)_(\d+)$/.exec(sourceAttribute || "");
  if (!match) return null;
  return {
    prefix: match[1],
    index: clampNumber(parseNumber(match[2]), 1, 18),
  };
}

function applyMonitorCascade(prefix, index) {
  const monitorKeys = buildMonitorKeys(prefix);
  const monitorMaxKey = `sr6_monitor_${prefix}_max`;
  const sourceKey = `sr6_monitor_${prefix}_${index}`;

  getAttrs(monitorKeys, (values) => {
    const updates = {};
    const maxBoxes = clampNumber(parseNumber(values[monitorMaxKey]) || 18, 0, 18);
    const sourceChecked = isCheckedValue(values[sourceKey]);

    if (sourceChecked) {
      const fillTo = Math.min(index, maxBoxes);
      for (let currentIndex = 1; currentIndex <= fillTo; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (!isCheckedValue(values[key])) {
          updates[key] = "1";
        }
      }
    } else {
      for (let currentIndex = index; currentIndex <= 18; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (isCheckedValue(values[key])) {
          updates[key] = "0";
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      setAttrsSilent(updates, recomputeAll);
    }
  });
}

function registerMonitorCascadeEvents() {
  const events = [];
  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  on(events.join(" "), (eventInfo) => {
    const source = parseMonitorEventSource(eventInfo && eventInfo.sourceAttribute);
    if (!source) return;
    applyMonitorCascade(source.prefix, source.index);
  });
}
// END MODULE: workers/ui/monitor-cascade

// END BLOCK: Worker Includes (ui)

// BEGIN BLOCK: Worker Includes (register)
// BEGIN MODULE: workers/core/register
function recomputeAll() {
  const requestKeys = [];
  const updates = {};
  const totals = {};
  const skillTotals = {};

  appendAttributeRequestKeys(requestKeys);
  appendSkillRequestKeys(requestKeys);
  appendMatrixRequestKeys(requestKeys);
  appendMagicRequestKeys(requestKeys);
  appendHeaderMonitorRequestKeys(requestKeys);

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, updates);
    computeCombatDerivedFromAttributes(totals, values, updates);
    computeHeaderMonitorDerivedFromAttributes(totals, values, updates);
    computeMagicDerived(values, totals, skillTotals, updates);
    computeRiggingDerived(values, totals, skillTotals, updates);

    setAttrsSilent(updates);
  });
}

function buildRecalcEvents() {
  const events = [];

  SR6_ATTRIBUTES.forEach((attributeName) => {
    events.push(`change:sr6_attr_${attributeName}_grundwert`);
    events.push(`change:sr6_attr_${attributeName}_modifikator`);
  });

  SR6_SKILLS.forEach((skillName) => {
    events.push(`change:sr6_skill_${skillName}_grundwert`);
    events.push(`change:sr6_skill_${skillName}_modifikator`);
  });

  SR6_MATRIX_ACTIONS.forEach((actionName) => {
    events.push(`change:sr6_matrix_handlung_${actionName}_grundwert`);
    events.push(`change:sr6_matrix_handlung_${actionName}_modifikator`);
  });

  events.push("change:sr6_magic_traditionsattribut_1");
  events.push("change:sr6_magic_traditionsattribut_2");

  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), recomputeAll);
  registerSuccessProbeRollEvents();
  registerEdgeTokenEvents();
  registerMonitorCascadeEvents();

  on("sheet:opened", () => {
    resetTabToAllgemeinOnOpen();
    resetEditModesOnOpen();
    recomputeAll();
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register

// END BLOCK: Worker Includes (register)
