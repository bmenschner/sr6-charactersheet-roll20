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
