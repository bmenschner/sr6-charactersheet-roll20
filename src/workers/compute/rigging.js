// BEGIN MODULE: workers/compute/rigging
function appendRiggingRequestKeys(requestKeys) {
  requestKeys.push("sr6_rigging_modus");
  requestKeys.push("sr6_initiative_physisch_w6");
  requestKeys.push("sr6_rigging_angriff");
  requestKeys.push("sr6_rigging_schleicher");
  requestKeys.push("sr6_rigging_datenverarbeitung");
  requestKeys.push("sr6_rigging_firewall");
  requestKeys.push("sr6_rigging_initiative_modifikator");
  requestKeys.push("sr6_rigging_initiative_w6_modifikator");
  requestKeys.push("sr6_rigging_angriffswert_modifikator");
  requestKeys.push("sr6_rigging_verteidigungswert_modifikator");
}

const SR6_RIGGING_VEHICLE_PROBE_LABELS = {
  handling: "Handlingprobe",
  ramming_attack: "Fahrzeug als Waffe",
  weapon_attack: "Fahrzeugwaffe",
  defense: "Verteidigungsprobe",
  stealth: "Heimlichkeit",
  perception: "Wahrnehmung",
  damage_resistance: "Schadenswiderstand",
};

function resolveRiggingInitiativeMode(mode) {
  if (mode === "VR Heiss") {
    return { basisSource: "matrix", w6: 3 };
  }

  if (mode === "VR Kalt") {
    return { basisSource: "matrix", w6: 2 };
  }

  return { basisSource: "physical", w6: 1 };
}

function computeRiggingDerived(values, totals, _skillTotals, updates) {
  const riggingInitiativeMode = resolveRiggingInitiativeMode(values.sr6_rigging_modus);
  const riggingAttack = parseNumber(values.sr6_rigging_angriff);
  const riggingSleaze = parseNumber(values.sr6_rigging_schleicher);
  const riggingDataProcessing = parseNumber(values.sr6_rigging_datenverarbeitung);
  const riggingFirewall = parseNumber(values.sr6_rigging_firewall);
  const riggingInitiativeIsVr = riggingInitiativeMode.basisSource === "matrix";
  const riggingInitiativeBasisMod = riggingInitiativeIsVr
    ? parseNumber(values.sr6_rigging_initiative_modifikator)
    : 0;
  const riggingInitiativeW6Mod = riggingInitiativeIsVr
    ? parseNumber(values.sr6_rigging_initiative_w6_modifikator)
    : 0;
  const riggingBasis = riggingInitiativeIsVr
    ? (totals.intuition || 0) + riggingDataProcessing + riggingInitiativeBasisMod
    : (totals.reaktion || 0) + (totals.intuition || 0);
  const riggingInitiativeW6 = riggingInitiativeIsVr
    ? riggingInitiativeMode.w6 + riggingInitiativeW6Mod
    : parseNumber(values.sr6_initiative_physisch_w6) || riggingInitiativeMode.w6;

  updates.sr6_rigging_initiative = String(Math.max(0, riggingBasis));
  updates.sr6_rigging_initiative_w6 = String(Math.max(0, riggingInitiativeW6));
  updates.sr6_rigging_angriffswert = String(
    riggingAttack + riggingSleaze + parseNumber(values.sr6_rigging_angriffswert_modifikator)
  );
  updates.sr6_rigging_verteidigungswert = String(
    riggingDataProcessing + riggingFirewall + parseNumber(values.sr6_rigging_verteidigungswert_modifikator)
  );
  updates.sr6_rigging_matrix_verteidigung = String((totals.intuition || 0) + riggingFirewall);
  updates.sr6_rigging_matrix_schadenswiderstand = String(riggingFirewall);
  updates.sr6_rigging_biofeedback_schadenswiderstand = String(totals.willenskraft || 0);
}

function normalizeRiggingVehicleMode(mode) {
  const normalizedMode = `${mode || ""}`.trim();
  if (normalizedMode === "Agent") return "agent";
  if (normalizedMode === "Autonom") return "autonomous";
  if (normalizedMode === "Eingesprungen (VR)") return "jumped_in_vr";
  return "manual_ar";
}

function getRiggingVehicleProbeLabel(probeKey) {
  return SR6_RIGGING_VEHICLE_PROBE_LABELS[probeKey] || SR6_RIGGING_VEHICLE_PROBE_LABELS.handling;
}

function getRiggingVehicleGunneryBonus(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return 0;
  }
  return getCombatSpecializationBonus(data.mechanikSpezialisierung, data.mechanikExpertise, ["Geschuetze", "Geschütze"]);
}

function getRiggingVehicleProbeValue(probeKey, mode, data) {
  const modeKey = normalizeRiggingVehicleMode(mode);
  const riggerControl = modeKey === "jumped_in_vr" ? data.riggerkontrolle : 0;
  const gunneryBonus = getRiggingVehicleGunneryBonus(mode, data);
  const gunneryFormulaBonus = gunneryBonus ? " + Geschütze" : "";

  if (probeKey === "damage_resistance") {
    return {
      value: data.rumpf,
      formula: "Rumpf",
    };
  }

  if (modeKey === "autonomous") {
    if (probeKey === "weapon_attack" || probeKey === "ramming_attack") {
      return {
        value: data.zielerfassung + data.sensor,
        formula: "Zielerfassung + Sensor",
      };
    }
    if (probeKey === "defense" || probeKey === "handling") {
      return {
        value: data.ausweichen + data.pilot,
        formula: "Ausweichen + Pilot",
      };
    }
    if (probeKey === "stealth") {
      return {
        value: data.stealth + data.pilot,
        formula: "Stealth + Pilot",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.clearsight + data.sensor,
        formula: "Clearsight + Sensor",
      };
    }
  }

  if (modeKey === "agent") {
    if (probeKey === "weapon_attack" || probeKey === "ramming_attack") {
      return {
        value: data.agentenstufe + data.sensor,
        formula: "Agentenstufe + Sensor",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.agentenstufe + data.sensor,
        formula: "Agentenstufe + Sensor",
      };
    }
    if (probeKey === "defense" || probeKey === "handling" || probeKey === "stealth") {
      return {
        value: data.agentenstufe + data.pilot,
        formula: "Agentenstufe + Pilot",
      };
    }
  }

  if (modeKey === "jumped_in_vr") {
    if (probeKey === "weapon_attack") {
      return {
        value: data.mechanik + data.logik + riggerControl + gunneryBonus,
        formula: `Mechanik + Logik + Riggerkontrolle${gunneryFormulaBonus}`,
      };
    }
    if (probeKey === "stealth") {
      return {
        value: data.heimlichkeit + data.logik + riggerControl,
        formula: "Heimlichkeit + Logik + Riggerkontrolle",
      };
    }
    if (probeKey === "perception") {
      return {
        value: data.wahrnehmung + data.sensor + riggerControl,
        formula: "Wahrnehmung + Sensor + Riggerkontrolle",
      };
    }
    return {
      value: data.steuern + data.intuition + riggerControl,
      formula: "Steuern + Intuition + Riggerkontrolle",
    };
  }

  if (probeKey === "weapon_attack") {
    return {
      value: data.mechanik + data.logik + gunneryBonus,
      formula: `Mechanik + Logik${gunneryFormulaBonus}`,
    };
  }
  if (probeKey === "stealth") {
    return {
      value: data.heimlichkeit + data.geschicklichkeit,
      formula: "Heimlichkeit + Geschicklichkeit",
    };
  }
  if (probeKey === "perception") {
    return {
      value: data.wahrnehmung + data.intuition,
      formula: "Wahrnehmung + Intuition",
    };
  }

  return {
    value: data.steuern + data.reaktion,
    formula: "Steuern + Reaktion",
  };
}

function getRiggingVehicleAttackValue(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    return data.agentenstufe + data.sensor;
  }
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return data.manoevrieren + data.sensor;
  }
  return data.steuern + data.sensor;
}

function getRiggingVehicleDefenseValue(mode, data) {
  if (normalizeRiggingVehicleMode(mode) === "agent") {
    return data.agentenstufe + data.panzerung;
  }
  if (normalizeRiggingVehicleMode(mode) === "autonomous") {
    return data.manoevrieren + data.panzerung;
  }
  return data.steuern + data.panzerung;
}

function getRiggingVehicleMonitorValue(data) {
  return Math.ceil(data.rumpf / 2) + 8;
}

function resolveRiggingVehicleHandlingEnvironment(environment) {
  return `${environment || ""}`.trim() === "Gelände" ? "Gelände" : "Straße";
}

function getRiggingVehicleModifiedValue(values, rowPrefix, key) {
  return parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_${key}`]) +
    parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_${key}_modifikator`]);
}

function getRiggingVehicleHandlingDetail(values, rowPrefix) {
  const environment = resolveRiggingVehicleHandlingEnvironment(
    values[`${rowPrefix}_sr6_rigging_fahrzeug_handling_umgebung`]
  );
  const street = parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_handling`]);
  const terrain = parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_handling_gelaende`]);
  const modifier = parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_handling_modifikator`]);
  const selectedBase = environment === "Gelände" ? terrain : street;

  return {
    environment: environment,
    street: street,
    terrain: terrain,
    modifier: modifier,
    selectedBase: selectedBase,
    total: selectedBase + modifier,
  };
}

function buildRiggingVehicleData(values, rowPrefix) {
  const handlingDetail = getRiggingVehicleHandlingDetail(values, rowPrefix);

  return {
    reaktion: parseNumber(values.sr6_attr_reaktion_gesamtwert),
    geschicklichkeit: parseNumber(values.sr6_attr_geschicklichkeit_gesamtwert),
    intuition: parseNumber(values.sr6_attr_intuition_gesamtwert),
    logik: parseNumber(values.sr6_attr_logik_gesamtwert),
    steuern: parseNumber(values.sr6_skill_steuern_gesamtwert),
    mechanik: parseNumber(values.sr6_skill_mechanik_gesamtwert),
    mechanikSpezialisierung: values.sr6_skill_mechanik_spezialisierung,
    mechanikExpertise: values.sr6_skill_mechanik_expertise,
    heimlichkeit: parseNumber(values.sr6_skill_heimlichkeit_gesamtwert),
    wahrnehmung: parseNumber(values.sr6_skill_wahrnehmung_gesamtwert),
    handling: handlingDetail.total,
    handlingStrasse: handlingDetail.street + handlingDetail.modifier,
    handlingGelaende: handlingDetail.terrain + handlingDetail.modifier,
    handlingModifikator: handlingDetail.modifier,
    handlingUmgebung: handlingDetail.environment,
    handlingSchwellenwert: handlingDetail.total,
    beschleunigung: getRiggingVehicleModifiedValue(values, rowPrefix, "beschleunigung"),
    intervall: getRiggingVehicleModifiedValue(values, rowPrefix, "intervall"),
    geschwindigkeit: getRiggingVehicleModifiedValue(values, rowPrefix, "geschwindigkeit"),
    rumpf: getRiggingVehicleModifiedValue(values, rowPrefix, "rumpf"),
    panzerung: getRiggingVehicleModifiedValue(values, rowPrefix, "panzerung"),
    pilot: getRiggingVehicleModifiedValue(values, rowPrefix, "pilot"),
    sensor: getRiggingVehicleModifiedValue(values, rowPrefix, "sensor"),
    agentenstufe: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_agentenstufe`]),
    riggerkontrolle: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_riggerkontrolle`]),
    manoevrieren: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_manoevrieren`]),
    zielerfassung: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_zielerfassung`]),
    ausweichen: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_ausweichen`]),
    stealth: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_stealth`]),
    clearsight: parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_clearsight`]),
  };
}

function appendRiggingVehicleRequestKeys(requestKeys, rowPrefix) {
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_probe`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_modus`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_handling`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_handling_gelaende`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_handling_umgebung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_beschleunigung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_intervall`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_geschwindigkeit`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_rumpf`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_panzerung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_pilot`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_sensor`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_handling_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_beschleunigung_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_intervall_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_geschwindigkeit_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_rumpf_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_panzerung_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_pilot_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_sensor_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_agentenstufe`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_riggerkontrolle`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_manoevrieren`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_zielerfassung`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_ausweichen`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_stealth`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_clearsight`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_angriffswert_modifikator`);
  requestKeys.push(`${rowPrefix}_sr6_rigging_fahrzeug_verteidigungswert_modifikator`);
}

function syncRiggingVehicleProbes(callback) {
  const requestKeys = [
    "sr6_attr_reaktion_gesamtwert",
    "sr6_attr_geschicklichkeit_gesamtwert",
    "sr6_attr_intuition_gesamtwert",
    "sr6_attr_logik_gesamtwert",
    "sr6_skill_steuern_gesamtwert",
    "sr6_skill_mechanik_gesamtwert",
    "sr6_skill_mechanik_spezialisierung",
    "sr6_skill_mechanik_expertise",
    "sr6_skill_heimlichkeit_gesamtwert",
    "sr6_skill_wahrnehmung_gesamtwert",
  ];

  getSectionIDs("repeating_sr6riggingfahrzeuge", (sectionIds) => {
    const rowIds = sectionIds || [];
    rowIds.forEach((rowId) => appendRiggingVehicleRequestKeys(requestKeys, `repeating_sr6riggingfahrzeuge_${rowId}`));

    getAttrs(requestKeys, (values) => {
      const updates = {};

      rowIds.forEach((rowId) => {
        const rowPrefix = `repeating_sr6riggingfahrzeuge_${rowId}`;
        const probeKey = values[`${rowPrefix}_sr6_rigging_fahrzeug_probe`] || "handling";
        const mode = values[`${rowPrefix}_sr6_rigging_fahrzeug_modus`] || "Autonom";
        const data = buildRiggingVehicleData(values, rowPrefix);
        const probe = getRiggingVehicleProbeValue(probeKey, mode, data);
        const weaponProbe = getRiggingVehicleProbeValue("weapon_attack", mode, data);

        updates[`${rowPrefix}_sr6_rigging_fahrzeug_waffe`] = "Geschütze";
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_probe_wert`] = String(probe.value);
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_waffe_probe_wert`] = String(weaponProbe.value);
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_angriffswert`] = String(
          getRiggingVehicleAttackValue(mode, data) +
            parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_angriffswert_modifikator`])
        );
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_verteidigungswert`] = String(
          getRiggingVehicleDefenseValue(mode, data) +
            parseNumber(values[`${rowPrefix}_sr6_rigging_fahrzeug_verteidigungswert_modifikator`])
        );
        updates[`${rowPrefix}_sr6_rigging_fahrzeug_zustandsmonitor`] = String(getRiggingVehicleMonitorValue(data));
      });

      if (Object.keys(updates).length === 0) {
        if (typeof callback === "function") callback();
        return;
      }
      setAttrsSilent(updates, callback);
    });
  });
}
// END MODULE: workers/compute/rigging
