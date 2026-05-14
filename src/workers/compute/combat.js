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

function getCombatMeleeSkillName(values, fieldName) {
  return `${(values && values[fieldName || "sr6_combat_nahkampf_fertigkeit"]) || "Nahkampf"}`.trim();
}

function getCombatMeleeSkillTotal(skillTotals, values, fieldName) {
  const selectedSkill = getCombatMeleeSkillName(values, fieldName);
  if (selectedSkill === "Exotische Waffen") {
    return (skillTotals && skillTotals.exotische_waffen) || 0;
  }
  return (skillTotals && skillTotals.nahkampf) || 0;
}

function getCombatMeleeAttributeTotal(totals, values, fieldName) {
  const selectedAttribute = `${(values && values[fieldName || "sr6_combat_nahkampf_attribut"]) || "Geschicklichkeit"}`.trim();
  if (selectedAttribute === "Stärke") {
    return (totals && totals.staerke) || 0;
  }
  return (totals && totals.geschicklichkeit) || 0;
}

function getCombatRangedSkillName(values, fieldName) {
  return `${(values && values[fieldName || "sr6_combat_fernkampf_fertigkeit"]) || "Feuerwaffen"}`.trim();
}

function getCombatRangedSkillTotal(skillTotals, values, fieldName) {
  const selectedSkill = getCombatRangedSkillName(values, fieldName);
  if (selectedSkill === "Projektilwaffen") {
    return (skillTotals && skillTotals.athletik) || 0;
  }
  if (selectedSkill === "Exotische Waffen") {
    return (skillTotals && skillTotals.exotische_waffen) || 0;
  }
  return (skillTotals && skillTotals.feuerwaffen) || 0;
}

function getCombatRangedAttackBase(totals, skillTotals, values, fieldName) {
  return getCombatRangedSkillTotal(skillTotals, values, fieldName) + ((totals && totals.geschicklichkeit) || 0);
}

function getCombatRangedAttackPool(totals, skillTotals, values, fieldName, modifier, projektilwaffenTotal) {
  const selectedSkill = getCombatRangedSkillName(values, fieldName);

  if (selectedSkill === "Projektilwaffen" && typeof projektilwaffenTotal === "number") {
    return projektilwaffenTotal;
  }

  if (selectedSkill === "Exotische Waffen") {
    return getCombatRangedAttackBase(totals, skillTotals, values, fieldName);
  }

  return getCombatRangedAttackBase(totals, skillTotals, values, fieldName) + (modifier || 0);
}

function getCombatMeleeAttackBase(totals, skillTotals, values, skillFieldName, attributeFieldName) {
  return getCombatMeleeSkillTotal(skillTotals, values, skillFieldName) +
    getCombatMeleeAttributeTotal(totals, values, attributeFieldName);
}

function getCombatMeleeAttackPool(totals, skillTotals, values, skillFieldName, attributeFieldName, modifier) {
  const selectedSkill = getCombatMeleeSkillName(values, skillFieldName);

  if (selectedSkill === "Exotische Waffen") {
    return ((totals && totals.geschicklichkeit) || 0) + ((skillTotals && skillTotals.exotische_waffen) || 0);
  }

  return getCombatMeleeAttackBase(totals, skillTotals, values, skillFieldName, attributeFieldName) + (modifier || 0);
}

const SR6_COMBAT_CALCULATED_FIELDS = [
  {
    key: "sr6_combat_fernkampfangriff",
    base: (totals, skillTotals, values) => getCombatRangedAttackBase(totals, skillTotals, values),
  },
  {
    key: "sr6_combat_projektilwaffen",
    base: (totals, skillTotals) => (skillTotals.athletik || 0) + (totals.geschicklichkeit || 0),
  },
  {
    key: "sr6_combat_nahkampfangriff",
    base: (totals, skillTotals, values) => getCombatMeleeAttackBase(totals, skillTotals, values),
  },
  {
    key: "sr6_combat_verteidigungswert",
    base: (totals, skillTotals, values) =>
      (totals.konstitution || 0) +
      parseNumber(values.sr6_combat_primaere_panzerung) +
      parseNumber(values.sr6_combat_sekundaere_panzerung) +
      parseNumber(values.sr6_combat_helm) +
      parseNumber(values.sr6_combat_schild),
  },
  {
    key: "sr6_verteidigung_physisch",
    base: (totals) => (totals.reaktion || 0) + (totals.intuition || 0),
  },
  {
    key: "sr6_schadenswiderstand_physisch",
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
  requestKeys.push("sr6_derived_initiative_basis_modifikator");
  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    requestKeys.push(`${field.key}_modifikator`);
  });
  requestKeys.push("sr6_combat_fernkampf_fertigkeit");
  requestKeys.push("sr6_combat_nahkampf_fertigkeit");
  requestKeys.push("sr6_combat_nahkampf_attribut");
  SR6_COMBAT_ARMOR_SELECTION_FIELDS.forEach((field) => {
    requestKeys.push(field.key);
  });
}

function computeCombatDerivedFromAttributes(totals, values, updates, skillTotals) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const resolvedSkillTotals = skillTotals || {};
  const physicalInitiativeModifier = parseNumber(values.sr6_derived_initiative_basis_modifikator);

  updates.sr6_derived_initiative_basis = String(reaktion + intuition + physicalInitiativeModifier);

  SR6_COMBAT_CALCULATED_FIELDS.forEach((field) => {
    const baseValue = field.base(totals, resolvedSkillTotals, values);
    const modifierValue = parseNumber(values[`${field.key}_modifikator`]);
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

function syncCombatWeaponAttackPools(callback) {
  const baseRequestKeys = [
    "sr6_attr_geschicklichkeit_gesamtwert",
    "sr6_attr_staerke_gesamtwert",
    "sr6_combat_fernkampfangriff_modifikator",
    "sr6_combat_nahkampfangriff_modifikator",
    "sr6_combat_projektilwaffen_gesamtwert",
    "sr6_skill_athletik_gesamtwert",
    "sr6_skill_exotische_waffen_gesamtwert",
    "sr6_skill_feuerwaffen_gesamtwert",
    "sr6_skill_nahkampf_gesamtwert",
  ];

  getSectionIDs("repeating_sr6fernkampfwaffen", (rangedIds) => {
    getSectionIDs("repeating_sr6nahkampfwaffen", (meleeIds) => {
      const requestKeys = [...baseRequestKeys];
      const rangedRowIds = rangedIds || [];
      const meleeRowIds = meleeIds || [];

      if (!rangedRowIds.length && !meleeRowIds.length) {
        if (typeof callback === "function") {
          callback();
        }
        return;
      }

      rangedRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6fernkampfwaffen_${rowId}_sr6_fernkampf_fertigkeit`);
      });

      meleeRowIds.forEach((rowId) => {
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_fertigkeit`);
        requestKeys.push(`repeating_sr6nahkampfwaffen_${rowId}_sr6_nahkampf_attribut`);
      });

      getAttrs(requestKeys, (values) => {
        const totals = {
          geschicklichkeit: parseNumber(values.sr6_attr_geschicklichkeit_gesamtwert),
          staerke: parseNumber(values.sr6_attr_staerke_gesamtwert),
          fernkampfangriffModifikator: parseNumber(values.sr6_combat_fernkampfangriff_modifikator),
          nahkampfangriffModifikator: parseNumber(values.sr6_combat_nahkampfangriff_modifikator),
          projektilwaffen: parseNumber(values.sr6_combat_projektilwaffen_gesamtwert),
        };
        const skillTotals = {
          athletik: parseNumber(values.sr6_skill_athletik_gesamtwert),
          exotische_waffen: parseNumber(values.sr6_skill_exotische_waffen_gesamtwert),
          feuerwaffen: parseNumber(values.sr6_skill_feuerwaffen_gesamtwert),
          nahkampf: parseNumber(values.sr6_skill_nahkampf_gesamtwert),
        };
        const updates = {};

        rangedRowIds.forEach((rowId) => {
          const rowPrefix = `repeating_sr6fernkampfwaffen_${rowId}`;
          const rowValues = {
            sr6_fernkampf_fertigkeit: values[`${rowPrefix}_sr6_fernkampf_fertigkeit`],
          };
          updates[`${rowPrefix}_sr6_fernkampf_angriffspool`] = String(
            getCombatRangedAttackPool(
              totals,
              skillTotals,
              rowValues,
              "sr6_fernkampf_fertigkeit",
              totals.fernkampfangriffModifikator,
              totals.projektilwaffen
            )
          );
        });

        meleeRowIds.forEach((rowId) => {
          const rowPrefix = `repeating_sr6nahkampfwaffen_${rowId}`;
          const rowValues = {
            sr6_nahkampf_fertigkeit: values[`${rowPrefix}_sr6_nahkampf_fertigkeit`],
            sr6_nahkampf_attribut: values[`${rowPrefix}_sr6_nahkampf_attribut`],
          };
          updates[`${rowPrefix}_sr6_nahkampf_angriffspool`] = String(
            getCombatMeleeAttackPool(
              totals,
              skillTotals,
              rowValues,
              "sr6_nahkampf_fertigkeit",
              "sr6_nahkampf_attribut",
              totals.nahkampfangriffModifikator
            )
          );
        });

        setAttrsSilent(updates, callback);
      });
    });
  });
}
