// BEGIN MODULE: workers/rolls/definitions/skills-rolls.js
// Roll-Definitionen fuer Fertigkeiten, Wissens-/Sprachfelder, Talentsofts und Wissens-/Sprachsofts.
const SR6_ROLL_DEFINITIONS_SKILLS = [
{
    id: "knowledge_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_wissensfertigkeit_",
      titleFallback: "Wissensfertigkeiten",
    }),
  },
{
    id: "language_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_sprachfertigkeit_",
      extraFields: ["Sprachniveau", "Sprachbonus", "Hinweis"],
      titleFallback: "Sprachfertigkeiten",
    }),
  },
{
    id: "talentsoft_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_talentsoft_",
      extraFields: ["Attribut", "Stufe", "Modifikator", "Hinweis"],
      titleFallback: "Talentsofts",
    }),
  },
{
    id: "knowledge_language_soft_skill",
    ...createSkillProbeDefinition({
      matchPoolPrefix: "sr6_wissenssprachsoft_",
      titleFallback: "Wissens-/Sprachsofts",
    }),
  },
...SR6_SKILLS.map((skillKey) => ({
    id: `skill_${skillKey}`,
    ...createSkillProbeDefinition({
      matchPoolPrefix: `sr6_skill_${skillKey}_`,
      skillKey: skillKey,
      skillAttributeConfig: SR6_SKILL_ATTRIBUTE_CONFIGS[skillKey],
      titleFallback: "Fertigkeiten",
    }),
  })),
{
    id: "generic_skill",
    ...createSkillProbeDefinition({
      titleFallback: "Fertigkeiten",
    }),
  },
];
// END MODULE: workers/rolls/definitions/skills-rolls.js
