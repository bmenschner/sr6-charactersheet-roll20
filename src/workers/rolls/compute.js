// BEGIN MODULE: workers/rolls/compute
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildProbeComputation(lookupAttr, poolAttribute, popupPoolMod, poolMultiplier = 1, poolBasisOverride = null) {
  const poolBasisRaw = poolBasisOverride === null
    ? parseNumber(lookupAttr(poolAttribute))
    : parseNumber(poolBasisOverride);
  const normalizedPoolMultiplier = Math.max(1, parseNumber(poolMultiplier) || 1);
  const poolBasis = poolBasisRaw * normalizedPoolMultiplier;
  const monitorPoolMod = parseNumber(lookupAttr("sr6_monitor_pool_mod"));
  const poolPopupMod = parseNumber(popupPoolMod);
  const pool = Math.max(0, poolBasis + monitorPoolMod + poolPopupMod);
  const diceResults = [];

  for (let index = 0; index < pool; index += 1) {
    diceResults.push(rollD6());
  }

  const successCount = diceResults.filter((die) => die >= 5).length;
  const glitchState = evaluateGlitch(diceResults, successCount);

  return {
    poolBasisRaw: poolBasisRaw,
    poolMultiplier: normalizedPoolMultiplier,
    poolBasis: poolBasis,
    monitorPoolMod: monitorPoolMod,
    poolPopupMod: poolPopupMod,
    pool: pool,
    diceResults: diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}
// END MODULE: workers/rolls/compute
