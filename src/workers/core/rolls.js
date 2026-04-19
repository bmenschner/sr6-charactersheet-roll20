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

function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  if (!rawTemplate) return;

  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  if (!poolAttribute) return;

  const labelName = fields.Attribut ? "Attribut" : fields.Fertigkeit ? "Fertigkeit" : "Wert";
  const labelTemplate = fields.Attribut || fields.Fertigkeit || "";
  const titleTemplate = fields.name || "Probe";

  const uniqueAttributes = [poolAttribute];
  const attributeRefRegex = /@\{([^}]+)\}/g;
  let refMatch;
  while ((refMatch = attributeRefRegex.exec(rawTemplate)) !== null) {
    uniqueAttributes.push(refMatch[1]);
  }
  const resolvedAttributes = [...new Set(uniqueAttributes)];

  getAttrs(resolvedAttributes, (values) => {
    const pool = Math.max(0, parseNumber(values[poolAttribute]));
    const title = resolveFieldText(titleTemplate, values);
    const probeLabel = resolveFieldText(labelTemplate, values);

    const diceResults = [];
    for (let index = 0; index < pool; index += 1) {
      diceResults.push(rollD6());
    }

    const successCount = diceResults.filter((die) => die >= 5).length;
    const { isGlitch, isCriticalGlitch } = evaluateGlitch(diceResults, successCount);
    const glitchText = isCriticalGlitch ? "!! KRITISCHER GLITCH !!" : "!! GLITCH !!";
    const erfolgeValue = isGlitch
      ? `<span style='color:#c62828;font-weight:700;'>${glitchText}</span>`
      : `${successCount}`;
    const details = `Rolling ${pool}d6>5 = ${buildDiceDetails(diceResults)}`;

    const chatMessage = `&{template:default} {{name=${title}}} {{${labelName}=${probeLabel}}} {{Pool=[[${pool}]]}} {{Erfolge=${erfolgeValue}}} {{Details=${details}}}`;
    startRoll(chatMessage, (rollResult) => {
      finishRoll(rollResult.rollId);
    });
  });
}

function registerSuccessProbeRollEvents() {
  on("clicked:probe", runSuccessProbeRoll);
}
// END MODULE: workers/core/rolls
