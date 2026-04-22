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

const SR6_COMBAT_CALCULATED_FIELDS = [
  {
    key: "sr6_combat_fernkampfangriff",
    base: (totals, skillTotals) => (skillTotals.feuerwaffen || 0) + (totals.geschicklichkeit || 0),
  },
  {
    key: "sr6_combat_nahkampfangriff",
    base: (totals, skillTotals) => (skillTotals.nahkampf || 0) + (totals.geschicklichkeit || 0),
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
];

const SR6_COMBAT_PRIMARY_WEAPON_SELECTIONS = [
  {
    section: "repeating_sr6fernkampfwaffen",
    roleAttr: "sr6_fernkampf_ist_primaer",
    rowNameAttr: "sr6_fernkampfwaffe",
    targetMap: {
      sr6_combat_primaere_fernkampfwaffe: "sr6_fernkampfwaffe",
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
      sr6_combat_nahkampf_schaden: "sr6_nahkampf_schaden",
      sr6_combat_nahkampf_sehr_nah: "sr6_nahkampf_s_nah",
      sr6_combat_nahkampf_nah: "sr6_nahkampf_nah",
      sr6_combat_nahkampf_mittel: "sr6_nahkampf_mittel",
      sr6_combat_nahkampf_weit: "sr6_nahkampf_weit",
      sr6_combat_nahkampf_sehr_weit: "sr6_nahkampf_s_weit",
    },
    defaults: {
      sr6_combat_primaere_nahkampfwaffe: "",
      sr6_combat_nahkampf_schaden: "0",
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
