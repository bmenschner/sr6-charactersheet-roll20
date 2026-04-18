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
