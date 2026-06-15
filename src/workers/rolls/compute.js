// BEGIN MODULE: workers/rolls/compute
// Berechnet reine Wuerfelergebnisse: normale W6, explodierende Sechsen, Schicksalswuerfel, Patzer und Erfolgszahlen. Diese Datei kennt keine UI und keine Roll20-Templates.
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollRegularDice(pool, explodingSixes) {
  const diceResults = [];
  const initialDiceResults = [];

  for (let index = 0; index < pool; index += 1) {
    let die = rollD6();
    diceResults.push(die);
    initialDiceResults.push(die);

    while (explodingSixes && die === 6) {
      die = rollD6();
      diceResults.push(die);
    }
  }

  return {
    diceResults: diceResults,
    initialDiceResults: initialDiceResults,
  };
}

function rollFateDice(fateDiceCount, matrixLonerFateDiceCount, explodingSixes) {
  const diceResults = [];
  const initialDiceResults = [];
  let successCount = 0;
  let cancelingOnes = 0;
  let ignoredLonerOnes = 0;

  const rollSingleFateDie = (ignoreCancellationOnOne) => {
    let die = rollD6();
    diceResults.push(die);
    initialDiceResults.push(die);

    if (die === 1 && ignoreCancellationOnOne) {
      ignoredLonerOnes += 1;
    } else if (die === 1) {
      cancelingOnes += 1;
    } else if (die >= 5) {
      successCount += 3;
    }

    while (explodingSixes && die === 6) {
      die = rollD6();
      diceResults.push(die);
      if (die >= 5) {
        successCount += 1;
      }
    }
  };

  for (let index = 0; index < matrixLonerFateDiceCount; index += 1) {
    rollSingleFateDie(true);
  }

  for (let index = 0; index < fateDiceCount; index += 1) {
    rollSingleFateDie(false);
  }

  return {
    diceResults: diceResults,
    initialDiceResults: initialDiceResults,
    successCount: successCount,
    cancelsNormalFives: cancelingOnes > 0,
    cancelingOnes: cancelingOnes,
    ignoredLonerOnes: ignoredLonerOnes,
  };
}

function evaluateGlitch(diceResults, successCount) {
  const ones = diceResults.filter((die) => die === 1).length;
  const isGlitch = ones > diceResults.length / 2;
  const isCriticalGlitch = isGlitch && successCount === 0;
  return { isGlitch, isCriticalGlitch };
}

function buildProbeComputation(
  lookupAttr,
  poolAttribute,
  popupPoolMod,
  rollPoolMod = 0,
  poolMultiplier = 1,
  poolBasisOverride = null,
  edgeOptions = {}
) {
  const poolBasisRaw = poolBasisOverride === null
    ? parseNumber(lookupAttr(poolAttribute))
    : parseNumber(poolBasisOverride);
  const normalizedPoolMultiplier = Math.max(1, parseNumber(poolMultiplier) || 1);
  const poolBasis = poolBasisRaw * normalizedPoolMultiplier;
  const monitorPoolMod = parseNumber(lookupAttr("sr6_monitor_pool_mod"));
  const poolPopupMod = parseNumber(popupPoolMod);
  const poolRollMod = parseNumber(rollPoolMod);
  const edgePoolBonus = Math.max(0, parseNumber(edgeOptions && edgeOptions.poolBonus));
  const requestedStandardFateDiceCount = Math.max(0, parseNumber(edgeOptions && edgeOptions.fateDiceCount));
  const requestedMatrixLonerFateDiceCount = Math.max(0, parseNumber(edgeOptions && edgeOptions.matrixLonerFateDiceCount));
  const explodingSixes = !!(edgeOptions && edgeOptions.explodingSixes);
  const pool = Math.max(0, poolBasis + monitorPoolMod + poolPopupMod + poolRollMod + edgePoolBonus);
  const matrixLonerFateDiceCount = Math.min(requestedMatrixLonerFateDiceCount, pool);
  const remainingFateSlots = Math.max(0, pool - matrixLonerFateDiceCount);
  const standardFateDiceCount = Math.min(requestedStandardFateDiceCount, remainingFateSlots);
  const fateDiceCount = standardFateDiceCount + matrixLonerFateDiceCount;
  const regularPool = Math.max(0, pool - fateDiceCount);
  const regularRoll = rollRegularDice(regularPool, explodingSixes);
  const fateRoll = rollFateDice(standardFateDiceCount, matrixLonerFateDiceCount, explodingSixes);
  const canceledNormalFives = fateRoll.cancelsNormalFives
    ? regularRoll.diceResults.filter((die) => die === 5).length
    : 0;
  const regularSuccessCount = regularRoll.diceResults.filter((die) => die >= 5).length;
  const successCount = Math.max(0, regularSuccessCount - canceledNormalFives + fateRoll.successCount);
  const diceResults = [...regularRoll.diceResults, ...fateRoll.diceResults];
  const glitchDiceResults = [...regularRoll.initialDiceResults, ...fateRoll.initialDiceResults];
  const glitchState = evaluateGlitch(glitchDiceResults, successCount);

  return {
    poolBasisRaw: poolBasisRaw,
    poolMultiplier: normalizedPoolMultiplier,
    poolBasis: poolBasis,
    monitorPoolMod: monitorPoolMod,
    poolPopupMod: poolPopupMod,
    poolRollMod: poolRollMod,
    edgePoolBonus: edgePoolBonus,
    fateDiceCount: fateDiceCount,
    standardFateDiceCount: standardFateDiceCount,
    matrixLonerFateDiceCount: matrixLonerFateDiceCount,
    requestedFateDiceCount: requestedStandardFateDiceCount + requestedMatrixLonerFateDiceCount,
    explodingSixes: explodingSixes,
    canceledNormalFives: canceledNormalFives,
    cancelingFateOnes: fateRoll.cancelingOnes,
    ignoredLonerFateOnes: fateRoll.ignoredLonerOnes,
    regularPool: regularPool,
    pool: pool,
    diceResults: diceResults,
    regularDiceResults: regularRoll.diceResults,
    fateDiceResults: fateRoll.diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}

function buildFixedPoolComputation(poolValue) {
  const pool = Math.max(0, parseNumber(poolValue));
  const diceResults = [];

  for (let index = 0; index < pool; index += 1) {
    diceResults.push(rollD6());
  }

  const successCount = diceResults.filter((die) => die >= 5).length;
  const glitchState = evaluateGlitch(diceResults, successCount);

  return {
    pool: pool,
    diceResults: diceResults,
    successCount: successCount,
    isGlitch: glitchState.isGlitch,
    isCriticalGlitch: glitchState.isCriticalGlitch,
  };
}
// END MODULE: workers/rolls/compute
