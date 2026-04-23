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

const SR6_REPEATING_SKILL_TOTAL_SECTIONS = [
  {
    section: "repeating_sr6wissensfertigkeiten",
    prefix: "sr6_wissensfertigkeit_",
  },
  {
    section: "repeating_sr6sprachfertigkeiten",
    prefix: "sr6_sprachfertigkeit_",
  },
  {
    section: "repeating_sr6talentsofts",
    prefix: "sr6_talentsoft_",
  },
  {
    section: "repeating_sr6wissenssprachsofts",
    prefix: "sr6_wissenssprachsoft_",
  },
];

function syncRepeatingSkillTotals(callback) {
  const pendingSections = SR6_REPEATING_SKILL_TOTAL_SECTIONS.length;
  const sectionIdsByName = {};
  let resolvedSections = 0;

  if (pendingSections === 0) {
    if (typeof callback === "function") callback();
    return;
  }

  SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((config) => {
    getSectionIDs(config.section, (sectionIds) => {
      sectionIdsByName[config.section] = sectionIds || [];
      resolvedSections += 1;

      if (resolvedSections < pendingSections) {
        return;
      }

      const requestKeys = [];

      SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((sectionConfig) => {
        const sectionIds = sectionIdsByName[sectionConfig.section] || [];
        sectionIds.forEach((rowId) => {
          requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}grundwert`);
          requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}modifikator`);
        });
      });

      if (requestKeys.length === 0) {
        if (typeof callback === "function") callback();
        return;
      }

      getAttrs(requestKeys, (values) => {
        const updates = {};

        SR6_REPEATING_SKILL_TOTAL_SECTIONS.forEach((sectionConfig) => {
          const sectionIds = sectionIdsByName[sectionConfig.section] || [];
          sectionIds.forEach((rowId) => {
            const rowPrefix = `${sectionConfig.section}_${rowId}_${sectionConfig.prefix}`;
            const total =
              parseNumber(values[`${rowPrefix}grundwert`]) +
              parseNumber(values[`${rowPrefix}modifikator`]);

            updates[`${rowPrefix}gesamtwert`] = String(total);
          });
        });

        setAttrsSilent(updates, callback);
      });
    });
  });
}
// END MODULE: workers/compute/skills
