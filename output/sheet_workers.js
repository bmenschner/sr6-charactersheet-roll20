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
function setAttrsSilent(payload) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  setAttrs(payload, { silent: true });
}
// END MODULE: workers/core/guards

// BEGIN MODULE: workers/core/rolls
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
  const match = erfolgeField.match(/\[\[@\{([^}]+)\}d6>5\]\]/);
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

function buildDiceDetails(diceResults) {
  return diceResults.join(" + ");
}

function buildDetailsDice(diceResults, maxDice = 20) {
  return diceResults.slice(0, maxDice).map((die) => {
    let tone = "neutral";
    if (die === 1) tone = "fail";
    if (die >= 5) tone = "success";
    return { value: `${die}`, tone: tone };
  });
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildResolvedFields(fields, lookupAttr) {
  const resolved = {};
  Object.keys(fields).forEach((key) => {
    resolved[key] = resolveFieldText(fields[key], lookupAttr);
  });
  return resolved;
}

function buildProbeRows(resolvedFields) {
  const ignoredKeys = new Set(["name", "Pool", "Erfolge", "Details"]);
  const preferredOrder = [
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
    "Gesamt"
  ];

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

function deriveTitleFromPoolAttribute(poolAttribute) {
  if (!poolAttribute) return "";

  if (poolAttribute.startsWith("sr6_combat_")) return "Kampf";
  if (poolAttribute.startsWith("sr6_fernkampf_")) return "Fernkampfwaffen";
  if (poolAttribute.startsWith("sr6_nahkampf_")) return "Nahkampfwaffen";

  if (poolAttribute.startsWith("sr6_matrix_handlung_")) return "Matrix-Handlungen";
  if (poolAttribute.startsWith("sr6_matrix_")) return "Matrix: Kernwerte";

  if (poolAttribute.startsWith("sr6_rigging_manoever_")) return "Manöver";
  if (poolAttribute.startsWith("sr6_rigging_")) return "Rigging: Kernwerte";

  if (poolAttribute.startsWith("sr6_magic_")) return "Magie: Kernwerte";
  if (poolAttribute.startsWith("sr6_zauber_")) return "Zauber";
  if (poolAttribute.startsWith("sr6_ritual_")) return "Rituale";

  if (poolAttribute.startsWith("sr6_verteidigung_")) return "Verteidigung";
  if (poolAttribute.startsWith("sr6_schadenswiderstand_")) return "Schadenswiderstand";
  if (poolAttribute.startsWith("sr6_skill_")) return "Fertigkeiten";

  return "";
}

function deriveProbeTitle(resolvedFields, poolAttribute) {
  const explicitName = resolvedFields.name;
  const attributeValue = resolvedFields.Attribut;
  const skillValue = resolvedFields.Fertigkeit;

  if (attributeValue) {
    const shortAttribute = attributeValue.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (shortAttribute) return shortAttribute;
  }

  const titleFromPoolAttribute = deriveTitleFromPoolAttribute(poolAttribute);
  if (titleFromPoolAttribute) {
    return titleFromPoolAttribute;
  }

  if (skillValue) {
    return "Fertigkeiten";
  }

  if (explicitName) return explicitName;
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
    });
  }

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  if (!rawTemplate) return;
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);

  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  const attributeRefs = collectAttributeReferences(rawTemplate);
  if (poolAttribute && !attributeRefs.includes(poolAttribute)) {
    attributeRefs.push(poolAttribute);
  }
  const resolvedAttributes = [];
  attributeRefs.forEach((attributeRef) => {
    resolvedAttributes.push(attributeRef);
    if (repeatingRowPrefix) {
      resolvedAttributes.push(`${repeatingRowPrefix}_${attributeRef}`);
    }
  });

  getAttrs(resolvedAttributes, (values) => {
    const lookupAttr = buildAttrLookup(values, repeatingRowPrefix);
    const resolvedFields = buildResolvedFields(fields, lookupAttr);
    const rows = buildProbeRows(resolvedFields);
    const name = deriveProbeTitle(resolvedFields, poolAttribute);

    if (!poolAttribute) {
      const chatMessage = buildSr6ProbeMessage({
        name: name,
        rows: rows,
        pool: resolvedFields.Pool || "",
        erfolge: resolvedFields.Erfolge || "",
        details: resolvedFields.Details || "",
        isGlitch: false
      });
      startRoll(chatMessage, (rollResult) => {
        finishRoll(rollResult.rollId);
      });
      return;
    }

    const pool = Math.max(0, parseNumber(lookupAttr(poolAttribute)));
    const diceResults = [];
    for (let index = 0; index < pool; index += 1) {
      diceResults.push(rollD6());
    }

    const successCount = diceResults.filter((die) => die >= 5).length;
    const { isGlitch, isCriticalGlitch } = evaluateGlitch(diceResults, successCount);
    const glitchText = isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = isGlitch ? glitchText : `${successCount}`;
    const details = buildDiceDetails(diceResults);
    const detailsDice = buildDetailsDice(diceResults);
    const poolValue = resolvedFields.Pool || pool;

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      pool: poolValue,
      erfolge: erfolgeValue,
      details: details,
      detailsDice: detailsDice,
      isGlitch: isGlitch
    });
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}

function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6fernkampfwaffen:probe", runSuccessProbeRoll);
  on("clicked:repeating_sr6nahkampfwaffen:probe", runSuccessProbeRoll);
}
// END MODULE: workers/core/rolls

// END BLOCK: Worker Includes (core)

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

// BEGIN MODULE: workers/compute/combat
function computeCombatDerivedFromAttributes(totals, updates) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const konstitution = totals.konstitution || 0;
  const willenskraft = totals.willenskraft || 0;

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);
  updates.sr6_derived_koerperlicher_monitor_max = String(8 + Math.ceil(konstitution / 2));
  updates.sr6_derived_geistiger_monitor_max = String(8 + Math.ceil(willenskraft / 2));
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
  };
}

function resetEditModesOnOpen() {
  setAttrsSilent(getEditModeResetPayload());
}
// END MODULE: workers/ui/defaults

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

  getAttrs(requestKeys, (values) => {
    computeAttributeTotals(values, updates, totals);
    computeSkillTotals(values, updates, skillTotals);
    computeMatrixTotals(values, updates);
    computeCombatDerivedFromAttributes(totals, updates);
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

  return events;
}

function registerWorkerEvents() {
  const recalcEvents = buildRecalcEvents();
  on(recalcEvents.join(" "), recomputeAll);
  registerSuccessProbeRollEvents();

  on("sheet:opened", () => {
    resetTabToAllgemeinOnOpen();
    resetEditModesOnOpen();
    recomputeAll();
  });
}

registerWorkerEvents();
// END MODULE: workers/core/register

// END BLOCK: Worker Includes (register)
