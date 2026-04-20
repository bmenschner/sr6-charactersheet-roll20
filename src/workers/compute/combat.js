// BEGIN MODULE: workers/compute/combat
function appendCombatRequestKeys(requestKeys) {
  for (let index = 1; index <= 18; index += 1) {
    requestKeys.push(`sr6_monitor_koerperlich_${index}`);
    requestKeys.push(`sr6_monitor_geistig_${index}`);
  }
}

function sanitizeAndCountMonitor(values, updates, monitorPrefix, maxBoxes) {
  let count = 0;
  for (let index = 1; index <= 18; index += 1) {
    const key = `sr6_monitor_${monitorPrefix}_${index}`;
    const checked = isCheckedValue(values[key]);

    if (index > maxBoxes) {
      if (checked) {
        updates[key] = "0";
      }
      continue;
    }

    if (checked) {
      count += 1;
    }
  }
  return count;
}

function computeCombatDerivedFromAttributes(totals, values, updates) {
  const reaktion = totals.reaktion || 0;
  const intuition = totals.intuition || 0;
  const konstitution = totals.konstitution || 0;
  const willenskraft = totals.willenskraft || 0;

  const koerperlichMax = clampNumber(8 + Math.ceil(konstitution / 2), 0, 18);
  const geistigMax = clampNumber(8 + Math.ceil(willenskraft / 2), 0, 18);
  const koerperlichCount = sanitizeAndCountMonitor(values, updates, "koerperlich", koerperlichMax);
  const geistigCount = sanitizeAndCountMonitor(values, updates, "geistig", geistigMax);
  const poolMod = -1 * (Math.floor(koerperlichCount / 3) + Math.floor(geistigCount / 3));

  updates.sr6_derived_initiative_basis = String(reaktion + intuition);
  updates.sr6_derived_koerperlicher_monitor_max = String(koerperlichMax);
  updates.sr6_derived_geistiger_monitor_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_max = String(koerperlichMax);
  updates.sr6_monitor_geistig_max = String(geistigMax);
  updates.sr6_monitor_koerperlich_count = String(koerperlichCount);
  updates.sr6_monitor_geistig_count = String(geistigCount);
  updates.sr6_monitor_koerperlich = String(koerperlichCount);
  updates.sr6_monitor_geistig = String(geistigCount);
  updates.sr6_monitor_pool_mod = String(poolMod);
}
// END MODULE: workers/compute/combat
