// BEGIN MODULE: workers/compute/magic
function appendMagicRequestKeys(requestKeys) {
  requestKeys.push("sr6_magic_traditionsattribut_1");
  requestKeys.push("sr6_magic_traditionsattribut_2");
  requestKeys.push("sr6_magic_traditionsattribut_1_modifikator");
  requestKeys.push("sr6_magic_traditionsattribut_2_modifikator");
  requestKeys.push("sr6_magic_magie_modifikator");
  requestKeys.push("sr6_magic_zauberpool_modifikator");
  requestKeys.push("sr6_magic_spruchzauberei_modifikator");
  requestKeys.push("sr6_magic_entzug_widerstand_modifikator");
  requestKeys.push("sr6_magic_astrale_initiative_modifikator");
  requestKeys.push("sr6_magic_astrale_verteidigung_modifikator");
  requestKeys.push("sr6_magic_astraler_schadenswiderstand_modifikator");
  requestKeys.push("sr6_magic_astralkampf_angriffswert_modifikator");
  requestKeys.push("sr6_magic_astralkampf_verteidigungswert_modifikator");
}

function computeMagicDerived(values, totals, skillTotals, updates) {
  updates.sr6_magic_magie = String(
    (totals.magie_resonanz || 0) + parseNumber(values.sr6_magic_magie_modifikator)
  );
  updates.sr6_magic_zauberpool = String(
    (skillTotals.hexerei || 0) + parseNumber(values.sr6_magic_zauberpool_modifikator)
  );
  updates.sr6_magic_spruchzauberei = String(
    parseNumber(updates.sr6_magic_magie) +
      parseNumber(updates.sr6_magic_zauberpool) +
      parseNumber(values.sr6_magic_spruchzauberei_modifikator)
  );
  updates.sr6_magic_waffenloser_kampf = String((skillTotals.astral || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_waffenfoki = String((skillTotals.nahkampf || 0) + (totals.willenskraft || 0));
  updates.sr6_magic_astrale_verteidigung = String(
    (totals.logik || 0) +
      (totals.intuition || 0) +
      parseNumber(values.sr6_magic_astrale_verteidigung_modifikator)
  );
  updates.sr6_magic_astraler_schadenswiderstand = String(
    (totals.willenskraft || 0) + parseNumber(values.sr6_magic_astraler_schadenswiderstand_modifikator)
  );
  updates.sr6_magic_astrale_initiative = String(
    (totals.logik || 0) +
      (totals.intuition || 0) +
      parseNumber(values.sr6_magic_astrale_initiative_modifikator)
  );

  const traditionKey1 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_1);
  const traditionKey2 = mapTraditionsattributToKey(values.sr6_magic_traditionsattribut_2);
  const traditionValue1 =
    (traditionKey1 ? (totals[traditionKey1] || 0) : 0) +
    parseNumber(values.sr6_magic_traditionsattribut_1_modifikator);
  const traditionValue2 =
    (traditionKey2 ? (totals[traditionKey2] || 0) : 0) +
    parseNumber(values.sr6_magic_traditionsattribut_2_modifikator);

  updates.sr6_magic_entzug_widerstand = String(
    traditionValue1 + traditionValue2 + parseNumber(values.sr6_magic_entzug_widerstand_modifikator)
  );
  updates.sr6_magic_astralkampf_angriffswert = String(
    (totals.magie_resonanz || 0) +
      traditionValue1 +
      parseNumber(values.sr6_magic_astralkampf_angriffswert_modifikator)
  );
  updates.sr6_magic_astralkampf_verteidigungswert = String(
    (totals.intuition || 0) + parseNumber(values.sr6_magic_astralkampf_verteidigungswert_modifikator)
  );
}
// END MODULE: workers/compute/magic
