// BEGIN MODULE: workers/compute/combat
const SR6_COMBAT_ARMOR_SELECTION_FIELDS = [
  {
    key: "sr6_combat_primaere_panzerung",
    checkbox: "sr6_panzerung_ist_primaer",
    nameKey: "sr6_combat_primaere_panzerung_name",
  },
  {
    key: "sr6_combat_sekundaere_panzerung",
    checkbox: "sr6_panzerung_ist_sekundaer",
    nameKey: "sr6_combat_sekundaere_panzerung_name",
  },
  {
    key: "sr6_combat_helm",
    checkbox: "sr6_panzerung_ist_helm",
    nameKey: "sr6_combat_helm_name",
  },
  {
    key: "sr6_combat_schild",
    checkbox: "sr6_panzerung_ist_schild",
    nameKey: "sr6_combat_schild_name",
  },
];

function getCombatMeleeSkillTotalByName(skillTotals, selectedSkill) {
  const skillKey = getCombatMeleeSkillKeyByName(selectedSkill);
  return (skillTotals && skillTotals[skillKey]) || 0;
}

function getCombatMeleeSkillTotal(skillTotals, values) {
  const selectedSkill = `${(values && values.sr6_combat_nahkampf_fertigkeit) || "Nahkampf"}`.trim();
  return getCombatMeleeSkillTotalByName(skillTotals, selectedSkill);
}

function getCombatMeleeAttributeTotalByName(totals, selectedAttribute) {
  if (selectedAttribute === "Stärke") {
    return (totals && totals.staerke) || 0;
  }
  return (totals && totals.geschicklichkeit) || 0;
}

function getCombatMeleeAttributeTotal(totals, values) {
  const selectedAttribute = `${(values && values.sr6_combat_nahkampf_attribut) || "Geschicklichkeit"}`.trim();
  return getCombatMeleeAttributeTotalByName(totals, selectedAttribute);
}

function getCombatRangedSkillTotalByName(skillTotals, selectedSkill) {
  const skillKey = getCombatRangedSkillKeyByName(selectedSkill);
  return (skillTotals && skillTotals[skillKey]) || 0;
}

function getCombatRangedSkillTotal(skillTotals, values) {
  const selectedSkill = `${(values && values.sr6_combat_fernkampf_fertigkeit) || "Feuerwaffen"}`.trim();
  return getCombatRangedSkillTotalByName(skillTotals, selectedSkill);
}

function getCombatMeleeSkillKeyByName(selectedSkill) {
  return `${selectedSkill || "Nahkampf"}`.trim() === "Exotische Waffen"
    ? "exotische_waffen"
    : "nahkampf";
}

function getCombatRangedSkillKeyByName(selectedSkill) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  if (skill === "Projektilwaffen") return "athletik";
  if (skill === "Exotische Waffen") return "exotische_waffen";
  return "feuerwaffen";
}

function getCombatUntrainedSkillPenalty(values, skillKey) {
  if (!skillKey) return 0;
  const baseValue = parseNumber(values && values[`sr6_skill_${skillKey}_grundwert`]);
  return baseValue <= 0 ? -1 : 0;
}

function getCombatRangedUntrainedSkillPenalty(values, selectedSkill) {
  return getCombatUntrainedSkillPenalty(values, getCombatRangedSkillKeyByName(selectedSkill));
}

function getCombatMeleeUntrainedSkillPenalty(values, selectedSkill) {
  return getCombatUntrainedSkillPenalty(values, getCombatMeleeSkillKeyByName(selectedSkill));
}

function getCombatSkillSpecializationSelection(values, skillKey) {
  return {
    specialization: values && values[`sr6_skill_${skillKey}_spezialisierung`],
    expertise: values && values[`sr6_skill_${skillKey}_expertise`],
  };
}

function getCombatSkillPool(values, skillTotals, skillKey, attributeTotal, matchingNames) {
  const selection = getCombatSkillSpecializationSelection(values, skillKey);
  return (
    parseNumber(attributeTotal) +
    parseNumber(skillTotals && skillTotals[skillKey]) +
    getCombatSpecializationBonus(selection.specialization, selection.expertise, matchingNames) +
    getCombatUntrainedSkillPenalty(values, skillKey)
  );
}

function normalizeCombatSpecializationName(value) {
  return `${value || ""}`
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "");
}

function getCombatSpecializationBonus(selectedSpecialization, selectedExpertise, matchingNames) {
  const matches = new Set((matchingNames || []).map(normalizeCombatSpecializationName).filter(Boolean));

  if (matches.size === 0) {
    return 0;
  }

  if (matches.has(normalizeCombatSpecializationName(selectedExpertise))) {
    return 3;
  }

  if (matches.has(normalizeCombatSpecializationName(selectedSpecialization))) {
    return 2;
  }

  return 0;
}

function getCombatRangedSpecializationMatches(selectedSkill, weaponType) {
  const type = `${weaponType || ""}`.trim();

  if (selectedSkill === "Projektilwaffen") {
    return ["Projektilwaffen"];
  }

  if (selectedSkill === "Exotische Waffen") {
    return ["Werfer", "Druckluftwaffen", "Sprühwaffen", "Laserwaffen", "Energiewaffen"].filter((name) => name === type);
  }

  return [type];
}

function getCombatRangedSpecializationBonus(values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  const skillKey = getCombatRangedSkillKeyByName(skill);
  const selection = getCombatSkillSpecializationSelection(values, skillKey);

  return getCombatSpecializationBonus(
    selection.specialization,
    selection.expertise,
    getCombatRangedSpecializationMatches(skill, weaponType)
  );
}

function getCombatRangedPool(totals, skillTotals, values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Feuerwaffen"}`.trim();
  const skillKey = getCombatRangedSkillKeyByName(skill);
  return getCombatSkillPool(
    values,
    skillTotals,
    skillKey,
    totals && totals.geschicklichkeit,
    getCombatRangedSpecializationMatches(skill, weaponType)
  );
}

function getCombatMeleeSpecializationMatches(selectedSkill, weaponType) {
  const type = `${weaponType || ""}`.trim();

  if (selectedSkill === "Exotische Waffen") {
    return ["Cyberimplantwaffen", "Handgemenge-Waffen", "Kettensägen", "Natürliche Waffen", "Peitschen"].filter(
      (name) => name === type
    );
  }

  return [type];
}

function getCombatMeleeSpecializationBonus(values, selectedSkill, weaponType) {
  const skill = `${selectedSkill || "Nahkampf"}`.trim();
  const skillKey = getCombatMeleeSkillKeyByName(skill);
  const selection = getCombatSkillSpecializationSelection(values, skillKey);

  return getCombatSpecializationBonus(
    selection.specialization,
    selection.expertise,
    getCombatMeleeSpecializationMatches(skill, weaponType)
  );
}

function getCombatMeleePool(totals, skillTotals, values, selectedSkill, selectedAttribute, weaponType) {
  const skill = `${selectedSkill || "Nahkampf"}`.trim();
  const skillKey = getCombatMeleeSkillKeyByName(skill);
  return getCombatSkillPool(
    values,
    skillTotals,
    skillKey,
    getCombatMeleeAttributeTotalByName(totals, selectedAttribute),
    getCombatMeleeSpecializationMatches(skill, weaponType)
  );
}

const SR6_COMBAT_CALCULATED_FIELDS = [
  {
    key: "sr6_combat_fernkampfangriff",
    useModifier: false,
    base: (totals, skillTotals, values) => {
      const selectedSkill = `${(values && values.sr6_combat_fernkampf_fertigkeit) || "Feuerwaffen"}`.trim();
      const weaponType = `${(values && values.sr6_combat_fernkampf_waffentyp) || ""}`.trim();
      return getCombatRangedPool(totals, skillTotals, values, selectedSkill, weaponType);
    },
  },
  {
    key: "sr6_combat_projektilwaffen",
    useModifier: false,
    base: (totals, skillTotals, values) =>
      getCombatRangedPool(totals, skillTotals, values, "Projektilwaffen", "Projektilwaffen"),
  },
  {
    key: "sr6_combat_nahkampfangriff",
    useModifier: false,
    base: (totals, skillTotals, values) => {
      const selectedSkill = `${(values && values.sr6_combat_nahkampf_fertigkeit) || "Nahkampf"}`.trim();
      const selectedAttribute = `${(values && values.sr6_combat_nahkampf_attribut) || "Geschicklichkeit"}`.trim();
      const weaponType = `${(values && values.sr6_combat_nahkampf_waffentyp) || ""}`.trim();
      return getCombatMeleePool(totals, skillTotals, values, selectedSkill, selectedAttribute, weaponType);
    },
  },
  {
    key: "sr6_combat_verteidigungswert",
    useModifier: false,
    base: (totals, skillTotals, values) =>
      (totals.konstitution || 0) +
      parseNumber(values.sr6_combat_primaere_panzerung) +
      parseNumber(values.sr6_combat_sekundaere_panzerung) +
      parseNumber(values.sr6_combat_helm) +
      parseNumber(values.sr6_combat_schild),
  },
  {
    key: "sr6_verteidigung_physisch",
    useModifier: false,
    base: (totals) => (totals.reaktion || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_physisch",
    useModifier: false,
    base: (totals) => totals.konstitution || 0,
  },
  {
    key: "sr6_verteidigung_zauber_direkt",
    base: (totals) => (totals.willenskraft || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_verteidigung_zauber_indirekt",
    base: (totals) => (totals.reaktion || 0) + (totals.willenskraft || 0),
  },
  {
    key: "sr6_verteidigung_astralkampf",
    base: (totals) => (totals.logik || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_astral",
    base: (totals) => totals.willenskraft || 0,
  },
  {
    key: "sr6_schadenswiderstand_matrix",
    base: (_totals, _skillTotals, values) => parseNumber(values.sr6_matrix_firewall),
  },
  {
    key: "sr6_schadenswiderstand_biofeedback",
    base: (totals) => totals.willenskraft || 0,
  },
];

const SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS = [
  {
    section: "repeating_sr6fernkampfwaffen",
    roleAttr: "sr6_fernkampf_ist_primaer",
    rowNameAttr: "sr6_fernkampfwaffe",
    targetMap: {
      sr6_combat_primaere_fernkampfwaffe: "sr6_fernkampfwaffe",
      sr6_combat_fernkampf_fertigkeit: "sr6_fernkampf_fertigkeit",
      sr6_combat_fernkampf_waffentyp: "sr6_fernkampf_waffentyp",
      sr6_combat_fernkampf_schaden: "sr6_fernkampf_schaden",
      sr6_combat_munition: "sr6_fernkampf_munition",
      sr6_combat_fernkampf_modus: "sr6_fernkampf_modus",
      sr6_combat_fernkampf_sehr_nah: "sr6_fernkampf_s_nah",
      sr6_combat_fernkampf_nah: "sr6_fernkampf_nah",
      sr6_combat_fernkampf_mittel: "sr6_fernkampf_mittel",
      sr6_combat_fernkampf_weit: "sr6_fernkampf_weit",
      sr6_combat_fernkampf_sehr_weit: "sr6_fernkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_fernkampfwaffe: "",
      sr6_combat_fernkampf_fertigkeit: "Feuerwaffen",
      sr6_combat_fernkampf_waffentyp: "",
      sr6_combat_fernkampf_schaden: "0",
      sr6_combat_munition: "Standard",
      sr6_combat_fernkampf_modus: "",
      sr6_combat_fernkampf_sehr_nah: "0",
      sr6_combat_fernkampf_nah: "0",
      sr6_combat_fernkampf_mittel: "0",
      sr6_combat_fernkampf_weit: "0",
      sr6_combat_fernkampf_sehr_weit: "0",
    },
  },
  {
    section: "repeating_sr6nahkampfwaffen",
    roleAttr: "sr6_nahkampf_ist_primaer",
    rowNameAttr: "sr6_nahkampfwaffe",
    targetMap: {
      sr6_combat_primaere_nahkampfwaffe: "sr6_nahkampfwaffe",
      sr6_combat_nahkampf_fertigkeit: "sr6_nahkampf_fertigkeit",
      sr6_combat_nahkampf_attribut: "sr6_nahkampf_attribut",
      sr6_combat_nahkampf_waffentyp: "sr6_nahkampf_waffentyp",
      sr6_combat_nahkampf_schaden: "sr6_nahkampf_schaden",
      sr6_combat_nahkampf_schadentyp: "sr6_nahkampf_schadentyp",
      sr6_combat_nahkampf_sehr_nah: "sr6_nahkampf_s_nah",
      sr6_combat_nahkampf_nah: "sr6_nahkampf_nah",
      sr6_combat_nahkampf_mittel: "sr6_nahkampf_mittel",
      sr6_combat_nahkampf_weit: "sr6_nahkampf_weit",
      sr6_combat_nahkampf_sehr_weit: "sr6_nahkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_nahkampfwaffe: "",
      sr6_combat_nahkampf_fertigkeit: "Nahkampf",
      sr6_combat_nahkampf_attribut: "Geschicklichkeit",
      sr6_combat_nahkampf_waffentyp: "",
      sr6_combat_nahkampf_schaden: "0",
      sr6_combat_nahkampf_schadentyp: "Körperlich",
      sr6_combat_nahkampf_sehr_nah: "0",
      sr6_combat_nahkampf_nah: "0",
      sr6_combat_nahkampf_mittel: "0",
      sr6_combat_nahkampf_weit: "0",
      sr6_combat_nahkampf_sehr_weit: "0",
    },
  },
];

function appendCombatRequestKeys(requestKeys) {
  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    requestKeys.push(`${field.key}_modifikator`);
  });
  requestKeys.push("sr6_combat_fernkampf_fertigkeit");
  requestKeys.push("sr6_combat_fernkampf_waffentyp");
  requestKeys.push("sr6_combat_nahkampf_fertigkeit");
  requestKeys.push("sr6_combat_nahkampf_attribut");
  requestKeys.push("sr6_combat_nahkampf_waffentyp");
  requestKeys.push("sr6_skill_athletik_spezialisierung");
  requestKeys.push("sr6_skill_athletik_expertise");
  requestKeys.push("sr6_skill_athletik_grundwert");
  requestKeys.push("sr6_skill_exotische_waffen_spezialisierung");
  requestKeys.push("sr6_skill_exotische_waffen_expertise");
  requestKeys.push("sr6_skill_exotische_waffen_grundwert");
  requestKeys.push("sr6_skill_feuerwaffen_spezialisierung");
  requestKeys.push("sr6_skill_feuerwaffen_expertise");
  requestKeys.push("sr6_skill_feuerwaffen_grundwert");
  requestKeys.push("sr6_skill_nahkampf_spezialisierung");
  requestKeys.push("sr6_skill_nahkampf_expertise");
  requestKeys.push("sr6_skill_nahkampf_grundwert");
  SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
    requestKeys.push(field.key);
  });
}

function computeCombatDerivedFromAttributes(totals, values, updates, skillTotals) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const resolvedSkillTotals = skillTotals || {};

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);

  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    const baseValue = field.base(totals, resolvedSkillTotals, values);
    const modifierValue = field.useModifier === false ? 0 : parseNumber(values[`${field.key}_modifikator`]);
    const totalValue = baseValue + modifierValue;

    updates[`${field.key}_grundwert`] = String(baseValue);
    updates[`${field.key}_gesamtwert`] = String(totalValue);
    updates[field.key] = String(totalValue);
  });
}

function parseCombatArmorSelectionEvent(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^repeating_sr6panzerung_([^_]+)_(sr6_panzerung_ist_(primaer|sekundaer|helm|schild))$/);

  if (!match) {
    return null;
  }

  return {
    rowId: match[1],
    checkbox: match[2],
  };
}

function syncCombatArmorSelections(callback, eventInfo) {
  getSectionIDs("repeating_sr6panzerung", (sectionIds) => {
    const orderedIds = sectionIds || [];
    const requestKeys = [];
    const preferredSelection = parseCombatArmorSelectionEvent(eventInfo);

    orderedIds.forEach((rowId) => {
      requestKeys.push(`repeating_sr6panzerung_${rowId}_sr6_panzerung_name`);
      requestKeys.push(`repeating_sr6panzerung_${rowId}_sr6_panzerung_verteidigungswert`);
      SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
        requestKeys.push(`repeating_sr6panzerung_${rowId}_${field.checkbox}`);
      });
    });

    getAttrs(requestKeys, (values) => {
      const updates = {};
      const armorRows = orderedIds.map((rowId) => ({
        rowId,
        name: values[`repeating_sr6panzerung_${rowId}_sr6_panzerung_name`] || "",
        verteidigungswert: parseNumber(values[`repeating_sr6panzerung_${rowId}_sr6_panzerung_verteidigungswert`]),
      }));

      SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
        const selectedRows = armorRows.filter((row) =>
          isCheckedValue(values[`repeating_sr6panzerung_${row.rowId}_${field.checkbox}`])
        );
        const preferredRow =
          preferredSelection && preferredSelection.checkbox === field.checkbox
            ? selectedRows.find((row) => row.rowId === preferredSelection.rowId) || null
            : null;
        const selectedRow = preferredRow || selectedRows[0] || null;

        if (selectedRows.length > 1) {
          selectedRows.forEach((row) => {
            if (!selectedRow || row.rowId === selectedRow.rowId) {
              return;
            }
            updates[`repeating_sr6panzerung_${row.rowId}_${field.checkbox}`] = "0";
          });
        }

        updates[field.key] = String(selectedRow ? selectedRow.verteidigungswert : 0);
        updates[field.nameKey] = selectedRow ? selectedRow.name : "";
      });

      setAttrsSilent(updates, callback);
    });
  });
}
// END MODULE: workers/compute/combat


function parseCombatPrimaryWeaponSelectionEvent(eventInfo) {
  const sourceAttribute = (eventInfo && eventInfo.sourceAttribute) || "";
  const match = sourceAttribute.match(/^(repeating_(sr6fernkampfwaffen|sr6nahkampfwaffen))_([^_]+)_(sr6_(fernkampf|nahkampf)_ist_primaer)$/);

  if (!match) {
    return null;
  }

  return {
    section: match[1],
    rowId: match[3],
    checkbox: match[4],
  };
}

function syncCombatPrimaryWeaponSelection(selectionConfig, callback, eventInfo) {
  getSectionIDs(selectionConfig.section, (sectionIds) => {
    const orderedIds = sectionIds || [];
    const requestKeys = [];
    const preferredSelection = parseCombatPrimaryWeaponSelectionEvent(eventInfo);

    orderedIds.forEach((rowId) => {
      requestKeys.push(`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`);
      Object.keys(selectionConfig.targetMap).forEach((targetKey) => {
        requestKeys.push(`${selectionConfig.section}_${rowId}_${selectionConfig.targetMap[targetKey]}`);
      });
    });

    getAttrs(requestKeys, (values) => {
      const updates = {};
      const selectedRows = orderedIds.filter((rowId) =>
        isCheckedValue(values[`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`])
      );
      const preferredRow =
        preferredSelection &&
        preferredSelection.section === selectionConfig.section &&
        preferredSelection.checkbox === selectionConfig.roleAttr
          ? selectedRows.find((rowId) => rowId === preferredSelection.rowId) || null
          : null;
      const selectedRowId = preferredRow || selectedRows[0] || null;

      if (selectedRows.length > 1) {
        selectedRows.forEach((rowId) => {
          if (!selectedRowId || rowId === selectedRowId) {
            return;
          }
          updates[`${selectionConfig.section}_${rowId}_${selectionConfig.roleAttr}`] = "0";
        });
      }

      Object.keys(selectionConfig.defaults).forEach((targetKey) => {
        updates[targetKey] = selectionConfig.defaults[targetKey];
      });

      if (selectedRowId) {
        Object.keys(selectionConfig.targetMap).forEach((targetKey) => {
          const sourceKey = `${selectionConfig.section}_${selectedRowId}_${selectionConfig.targetMap[targetKey]}`;
          const fallbackValue = selectionConfig.defaults[targetKey];
          const resolvedValue = values[sourceKey];
          updates[targetKey] = resolvedValue === undefined || resolvedValue === null || `${resolvedValue}` === ""
            ? fallbackValue
            : `${resolvedValue}`;
        });
      }

      setAttrsSilent(updates, callback);
    });
  });
}

function syncCombatPrimaryWeapons(callback, eventInfo) {
  syncCombatPrimaryWeaponSelection(SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS[0], () => {
    syncCombatPrimaryWeaponSelection(SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS[1], callback, eventInfo);
  }, eventInfo);
}

function syncCombatWeaponPools(callback) {
  const requestKeys = [
    "sr6_attr_geschicklichkeit_gesamtwert",
    "sr6_attr_staerke_gesamtwert",
    "sr6_skill_athletik_gesamtwert",
    "sr6_skill_athletik_grundwert",
    "sr6_skill_athletik_spezialisierung",
    "sr6_skill_athletik_expertise",
    "sr6_skill_exotische_waffen_gesamtwert",
    "sr6_skill_exotische_waffen_grundwert",
    "sr6_skill_exotische_waffen_spezialisierung",
    "sr6_skill_exotische_waffen_expertise",
    "sr6_skill_feuerwaffen_gesamtwert",
    "sr6_skill_feuerwaffen_grundwert",
    "sr6_skill_feuerwaffen_spezialisierung",
    "sr6_skill_feuerwaffen_expertise",
    "sr6_skill_nahkampf_gesamtwert",
    "sr6_skill_nahkampf_grundwert",
    "sr6_skill_nahkampf_spezialisierung",
    "sr6_skill_nahkampf_expertise",
  ];

  getSectionIDs("repeating_sr6fernkampfwaffen", (rangedIds) => {
    getSectionIDs("repeating_sr6nahkampfwaffen", (meleeIds) => {
      const rangedRowIds = rangedIds || [];
      const meleeRowIds = meleeIds || [];

      rangedRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_fertigkeit`);
        requestKeys.push(`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_waffentyp`);
      });
      meleeRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_fertigkeit`);
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_attribut`);
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_waffentyp`);
      });

      getAttrs(requestKeys, (values) => {
        const totals = {
          geschicklichkeit: parseNumber(values.sr6_attr_geschicklichkeit_gesamtwert),
          staerke: parseNumber(values.sr6_attr_staerke_gesamtwert),
        };
        const skillTotals = {
          athletik: parseNumber(values.sr6_skill_athletik_gesamtwert),
          exotische_waffen: parseNumber(values.sr6_skill_exotische_waffen_gesamtwert),
          feuerwaffen: parseNumber(values.sr6_skill_feuerwaffen_gesamtwert),
          nahkampf: parseNumber(values.sr6_skill_nahkampf_gesamtwert),
        };
        const updates = {};

        rangedRowIds.forEach((rowId) => {
          const skill = `${values[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_fertigkeit`] || "Feuerwaffen"}`.trim();
          const weaponType = `${values[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_waffentyp`] || ""}`.trim();
          const pool = getCombatRangedPool(totals, skillTotals, values, skill, weaponType);
          updates[`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_pool`] = String(pool);
        });

        meleeRowIds.forEach((rowId) => {
          const skill = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_fertigkeit`] || "Nahkampf"}`.trim();
          const attribute = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_attribut`] || "Geschicklichkeit"}`.trim();
          const weaponType = `${values[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_waffentyp`] || ""}`.trim();
          const pool = getCombatMeleePool(totals, skillTotals, values, skill, attribute, weaponType);
          updates[`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_pool`] = String(pool);
        });

        if (Object.keys(updates).length === 0 && typeof callback === "function") {
          callback();
          return;
        }
        setAttrsSilent(updates, callback);
      });
    });
  });
}
