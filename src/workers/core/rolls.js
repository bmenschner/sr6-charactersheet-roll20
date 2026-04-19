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

function deriveProbeTitle(resolvedFields) {
  const explicitName = resolvedFields.name;
  const attributeValue = resolvedFields.Attribut;
  const skillValue = resolvedFields.Fertigkeit;
  const hasCombatName = /kampf/i.test(explicitName || "");

  if (hasCombatName) {
    return "Kampf";
  }

  if (attributeValue) {
    const shortAttribute = attributeValue.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (shortAttribute) return shortAttribute;
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
    const name = deriveProbeTitle(resolvedFields);

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
}
// END MODULE: workers/core/rolls
