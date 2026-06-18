// BEGIN MODULE: workers/rolls/context
// Liest den Kontext aus einem angeklickten Roll20-Button: Template-Felder, Pool-Attribute, Repeating-Zeilen und Popup-Speicherwerte.
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
  const sourceSection = (eventInfo && eventInfo.sourceSection) || "";
  const triggerName = (eventInfo && eventInfo.triggerName) || "";
  const candidates = [sourceAttribute, sourceSection, triggerName];

  for (let index = 0; index < candidates.length; index += 1) {
    const value = candidates[index] || "";
    if (!value) continue;

    const directPrefix = value.match(/^(repeating_[^_]+_[^_:\s]+)/);
    if (directPrefix) return directPrefix[1];

    const prefixedByColon = value.match(/^(repeating_[^_]+_[^:]+):/);
    if (prefixedByColon) return prefixedByColon[1];

    const prefixedByUnderscore = value.match(/^(repeating_[^_]+_[^_]+)_/);
    if (prefixedByUnderscore) return prefixedByUnderscore[1];
  }

  return "";
}

function buildAttrLookup(values, repeatingRowPrefix) {
  return function lookupAttr(key) {
    if (!key) return "";
    if (repeatingRowPrefix) {
      const repeatingKey = `${repeatingRowPrefix}_${key}`;
      if (
        Object.prototype.hasOwnProperty.call(values, repeatingKey) &&
        `${values[repeatingKey] || ""}`.trim() !== ""
      ) {
        return values[repeatingKey];
      }
    }
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

function getRollModifierAttribute(poolAttribute) {
  return poolAttribute ? `${poolAttribute}_roll_modifikator` : "";
}

function appendPoolComponentAttributeRefs(attributeRefs, poolAttribute) {
  if (!poolAttribute) return;
  const attributeMatch = poolAttribute.match(/^sr6_attr_(.+)_gesamtwert$/);
  if (attributeMatch) {
    attributeRefs.push(`sr6_attr_${attributeMatch[1]}_grundwert`);
    attributeRefs.push(`sr6_attr_${attributeMatch[1]}_modifikator`);
  }

  const skillMatch = poolAttribute.match(/^sr6_skill_(.+)_gesamtwert$/);
  if (skillMatch) {
    attributeRefs.push(`sr6_skill_${skillMatch[1]}_grundwert`);
    attributeRefs.push(`sr6_skill_${skillMatch[1]}_modifikator`);
  }
}

function appendComputedCombatPoolAttributeRefs(attributeRefs, definition) {
  if (!definition || definition.probeModel !== "combat_attack_probe") return;

  [
    "geschicklichkeit",
    "staerke",
  ].forEach((attributeKey) => {
    attributeRefs.push(`sr6_attr_${attributeKey}_grundwert`);
    attributeRefs.push(`sr6_attr_${attributeKey}_modifikator`);
    attributeRefs.push(`sr6_attr_${attributeKey}_gesamtwert`);
  });

  [
    "athletik",
    "exotische_waffen",
    "feuerwaffen",
    "nahkampf",
  ].forEach((skillKey) => {
    attributeRefs.push(`sr6_skill_${skillKey}_grundwert`);
    attributeRefs.push(`sr6_skill_${skillKey}_modifikator`);
    attributeRefs.push(`sr6_skill_${skillKey}_gesamtwert`);
    attributeRefs.push(`sr6_skill_${skillKey}_spezialisierung`);
    attributeRefs.push(`sr6_skill_${skillKey}_expertise`);
  });
}

function buildRequestedAttributes(rawTemplate, repeatingRowPrefix) {
  const fields = parseTemplateFields(rawTemplate);
  const poolAttribute = parsePoolAttributeFromFields(fields);
  const definition = resolveRollDefinition(fields, poolAttribute);
  const attributeRefs = collectAttributeReferences(rawTemplate);

  attributeRefs.push("character_id");
  attributeRefs.push("sr6_setting_rolltemplate_debug");

  if (poolAttribute && !attributeRefs.includes(poolAttribute)) {
    attributeRefs.push(poolAttribute);
  }
  appendPoolComponentAttributeRefs(attributeRefs, poolAttribute);
  appendComputedCombatPoolAttributeRefs(attributeRefs, definition);

  if (poolAttribute) {
    attributeRefs.push("sr6_monitor_pool_mod");
    attributeRefs.push(getRollModifierAttribute(poolAttribute));
  }

  const requestedAttributes = [];
  attributeRefs.forEach((attributeRef) => {
    requestedAttributes.push(attributeRef);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${attributeRef}`);
    }
  });

  getRollContextFields(definition).forEach((field) => {
    if (!field || !field.attr) return;
    requestedAttributes.push(field.attr);
    if (repeatingRowPrefix) {
      requestedAttributes.push(`${repeatingRowPrefix}_${field.attr}`);
    }
  });

  getRollAdditionalAttributes(definition).forEach((attributeRef) => {
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
