// BEGIN MODULE: workers/core/rolls
function parseTemplateFields(template) {
  const fields = {};
  const fieldRegex = /\{\{([^=]+)=([\s\S]*?)\}\}/g;
  let match;
  while ((match = fieldRegex.exec(template)) !== null) {
    fields[(match[1] || "").trim()] = (match[2] || "").trim();
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

function resolveFieldText(templateValue, values) {
  if (!templateValue) return "";
  return templateValue.replace(/@\{([^}]+)\}/g, (_, key) => values[key] || "");
}

function buildDiceDetails(diceResults) {
  return diceResults.join(" + ");
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

function buildResolvedFields(fields, values) {
  const resolved = {};
  Object.keys(fields).forEach((key) => {
    resolved[key] = resolveFieldText(fields[key], values);
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

  if (payload.isGlitch) {
    parts.push("{{is_glitch=1}}");
  }

  return parts.join(" ");
}

function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  if (!rawTemplate) return;

  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  const resolvedAttributes = collectAttributeReferences(rawTemplate);
  if (poolAttribute && !resolvedAttributes.includes(poolAttribute)) {
    resolvedAttributes.push(poolAttribute);
  }

  getAttrs(resolvedAttributes, (values) => {
    const resolvedFields = buildResolvedFields(fields, values);
    const rows = buildProbeRows(resolvedFields);
    const name = resolvedFields.name || "Probe";

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

    const pool = Math.max(0, parseNumber(values[poolAttribute]));
    const diceResults = [];
    for (let index = 0; index < pool; index += 1) {
      diceResults.push(rollD6());
    }

    const successCount = diceResults.filter((die) => die >= 5).length;
    const { isGlitch, isCriticalGlitch } = evaluateGlitch(diceResults, successCount);
    const glitchText = isCriticalGlitch ? "!! Kritischer Patzer !!" : "!! Patzer !!";
    const erfolgeValue = isGlitch ? glitchText : `${successCount}`;
    const details = buildDiceDetails(diceResults);
    const poolValue = resolvedFields.Pool || pool;

    const chatMessage = buildSr6ProbeMessage({
      name: name,
      rows: rows,
      pool: poolValue,
      erfolge: erfolgeValue,
      details: details,
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
