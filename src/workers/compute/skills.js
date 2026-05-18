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
    totalSource: "memory",
  },
  {
    section: "repeating_sr6sprachfertigkeiten",
    prefix: "sr6_sprachfertigkeit_",
    totalSource: "memory",
  },
  {
    section: "repeating_sr6talentsofts",
    prefix: "sr6_talentsoft_",
    totalSource: "talentsoft",
  },
  {
    section: "repeating_sr6wissenssprachsofts",
    prefix: "sr6_wissenssprachsoft_",
    totalSource: "memory",
  },
];

const SR6_TALENTSOFT_ATTRIBUTE_SOURCES = {
  "Geschicklichkeit": "sr6_attr_geschicklichkeit_gesamtwert",
  "Konstitution": "sr6_attr_konstitution_gesamtwert",
  "Reaktion": "sr6_attr_reaktion_gesamtwert",
  "Stärke": "sr6_attr_staerke_gesamtwert",
  "Willenskraft": "sr6_attr_willenskraft_gesamtwert",
  "Logik": "sr6_attr_logik_gesamtwert",
  "Intuition": "sr6_attr_intuition_gesamtwert",
  "Charisma": "sr6_attr_charisma_gesamtwert",
  "Magie/Resonanz": "sr6_attr_magie_resonanz_gesamtwert",
};

function getTalentsoftAttributeTotal(values, selectedAttribute) {
  const attrKey =
    SR6_TALENTSOFT_ATTRIBUTE_SOURCES[`${selectedAttribute || ""}`.trim()] ||
    SR6_TALENTSOFT_ATTRIBUTE_SOURCES["Geschicklichkeit"];
  if (!attrKey) return 0;
  return parseNumber(values[attrKey]);
}

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
          if (sectionConfig.totalSource === "talentsoft") {
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}grundwert`);
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}modifikator`);
            requestKeys.push(`${sectionConfig.section}_${rowId}_${sectionConfig.prefix}attribut`);
          }
        });
      });

      Object.keys(SR6_TALENTSOFT_ATTRIBUTE_SOURCES).forEach((attributeName) => {
        requestKeys.push(SR6_TALENTSOFT_ATTRIBUTE_SOURCES[attributeName]);
      });
      requestKeys.push("sr6_attrprobe_erinnerungsvermoegen");

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
            if (sectionConfig.totalSource === "memory") {
              updates[`${rowPrefix}gesamtwert`] = String(parseNumber(values.sr6_attrprobe_erinnerungsvermoegen));
              return;
            }
            const attributeTotal =
              sectionConfig.totalSource === "talentsoft"
                ? getTalentsoftAttributeTotal(values, values[`${rowPrefix}attribut`])
                : 0;
            const total =
              attributeTotal +
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
