// BEGIN MODULE: workers/rolls/number-stepper
// Erlaubt Plus/Minus-Buttons neben Zahlenfeldern und behandelt Sonderfaelle, bei denen Felder berechnet oder in Repeatern gespeichert werden.
const SR6_NUMBER_STEPPER_COMPUTED_TARGETS = [];

const SR6_NUMBER_STEPPER_REPEATING_SKILL_PREFIXES = [
  "repeating_sr6wissensfertigkeiten_",
  "repeating_sr6sprachfertigkeiten_",
  "repeating_sr6talentsofts_",
  "repeating_sr6wissenssprachsofts_",
];

const SR6_NUMBER_STEPPER_RIGGING_VEHICLE_PREFIXES = [
  "repeating_sr6riggingfahrzeuge_",
];

function shouldSyncRepeatingSkillTotalsAfterStepper(repeatingRowPrefix) {
  if (!repeatingRowPrefix) return false;
  return SR6_NUMBER_STEPPER_REPEATING_SKILL_PREFIXES.some((prefix) => repeatingRowPrefix.startsWith(prefix));
}

function shouldSyncRiggingVehicleProbesAfterStepper(repeatingRowPrefix) {
  if (!repeatingRowPrefix) return false;
  return SR6_NUMBER_STEPPER_RIGGING_VEHICLE_PREFIXES.some((prefix) => repeatingRowPrefix.startsWith(prefix));
}

function resolveRepeatingRowPrefixForStepper(eventInfo, callback) {
  const fallbackPrefix = extractRepeatingRowPrefix(eventInfo);
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const triggerName = (eventInfo && eventInfo.triggerName) || "";
  const sourceSection = (eventInfo && eventInfo.sourceSection) || "";
  const candidates = [sourceAttribute, triggerName];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index] || "";
    if (!candidate) continue;

    const resolvedMatch = candidate.match(/^(repeating_[^_]+_[^_:\s$]+)_/);
    if (resolvedMatch) {
      callback(resolvedMatch[1]);
      return;
    }

    const placeholderMatch = candidate.match(/^(repeating_([^_]+)_\$(\d+))_/);
    if (placeholderMatch) {
      const sectionName = placeholderMatch[2];
      const sectionIndex = parseNumber(placeholderMatch[3]);
      getSectionIDs(`repeating_${sectionName}`, (sectionIds) => {
        const ids = sectionIds || [];
        const rowId = ids[sectionIndex];
        if (!rowId) {
          callback(fallbackPrefix);
          return;
        }
        callback(`repeating_${sectionName}_${rowId}`);
      });
      return;
    }

    const triggerRowIdMatch = candidate.match(/(?:^|:)repeating_([^:]+):(-[^:]+):/);
    if (triggerRowIdMatch) {
      callback(`repeating_${triggerRowIdMatch[1]}_${triggerRowIdMatch[2]}`);
      return;
    }

    const triggerIndexMatch = candidate.match(/(?:^|:)repeating_([^:]+):\$(\d+):/);
    if (triggerIndexMatch) {
      const sectionName = triggerIndexMatch[1];
      const sectionIndex = parseNumber(triggerIndexMatch[2]);
      getSectionIDs(`repeating_${sectionName}`, (sectionIds) => {
        const ids = sectionIds || [];
        const rowId = ids[sectionIndex];
        if (!rowId) {
          callback(fallbackPrefix);
          return;
        }
        callback(`repeating_${sectionName}_${rowId}`);
      });
      return;
    }
  }

  if (sourceSection) {
    const sectionMatch = sourceSection.match(/^repeating_([^_]+)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1];
      getSectionIDs(sourceSection, (sectionIds) => {
        const ids = sectionIds || [];
        if (ids.length === 1) {
          callback(`repeating_${sectionName}_${ids[0]}`);
          return;
        }
        callback(fallbackPrefix);
      });
      return;
    }
  }

  callback(fallbackPrefix);
}

function resolveNumberStepperTargetAttr(targetAttr, repeatingRowPrefix) {
  if (repeatingRowPrefix) return targetAttr;
  if (targetAttr.endsWith("_gesamtwert")) return targetAttr.replace(/_gesamtwert$/, "_modifikator");
  if (SR6_NUMBER_STEPPER_COMPUTED_TARGETS.includes(targetAttr)) return `${targetAttr}_modifikator`;
  return targetAttr;
}

function runNumberStepperAdjust(eventInfo) {
  const rawValue =
    (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) ||
    (eventInfo && eventInfo.value) ||
    "";
  const modernSeparator = "::";
  const legacySeparator = "|";
  const separator = rawValue.includes(modernSeparator) ? modernSeparator : legacySeparator;
  const separatorIndex = rawValue.lastIndexOf(separator);
  if (separatorIndex <= 0) return;

  const targetAttr = rawValue.slice(0, separatorIndex);
  const delta = parseNumber(rawValue.slice(separatorIndex + separator.length));
  if (!targetAttr || delta === 0) return;

  resolveRepeatingRowPrefixForStepper(eventInfo, (repeatingRowPrefix) => {
    const effectiveTargetAttr = resolveNumberStepperTargetAttr(targetAttr, repeatingRowPrefix);
    const scopedTargetAttr = repeatingRowPrefix ? `${repeatingRowPrefix}_${effectiveTargetAttr}` : effectiveTargetAttr;
    getAttrs([scopedTargetAttr], (values) => {
      const currentValue = parseNumber(values[scopedTargetAttr]);
      setAttrsSilent({
        [scopedTargetAttr]: String(currentValue + delta),
      }, () => {
        if (shouldSyncRiggingVehicleProbesAfterStepper(repeatingRowPrefix) && typeof syncRiggingVehicleProbes === "function") {
          syncRiggingVehicleProbes();
          return;
        }
        if (shouldSyncRepeatingSkillTotalsAfterStepper(repeatingRowPrefix) && typeof syncRepeatingSkillTotals === "function") {
          syncRepeatingSkillTotals();
          return;
        }
        if (!repeatingRowPrefix && typeof recomputeAll === "function") {
          recomputeAll();
        }
      });
    });
  });
}
// END MODULE: workers/rolls/number-stepper
