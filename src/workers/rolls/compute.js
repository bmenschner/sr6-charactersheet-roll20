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

function buildProbeComputation(lookupAttr, poolAttribute, popupPoolMod) {
  const poolBasis = parseNumber(lookupAttr(poolAttribute));
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
