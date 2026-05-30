const { fuzzify, muOutput } = require('./membership');
const RULE_BASE = require('./rules');
const FUZZY_PARAMETERS = require('../config/fuzzy_parameters');

function evaluateRules(membership) {
  const activeRules = [];

  for (const rule of RULE_BASE) {
    const muPh       = membership.ph[rule.phSet];
    const muMoisture = membership.moisture[rule.moistureSet];
    const alpha      = Math.min(muPh, muMoisture);

    if (alpha > 0) {
      activeRules.push({
        ruleId: rule.id,
        phSet: rule.phSet,
        moistureSet: rule.moistureSet,
        outputCategory: rule.outputCategory,
        alpha,
      });
    }
  }

  return activeRules;
}

function aggregateAt(activeRules, y) {
  let maxVal = 0;

  for (const rule of activeRules) {
    const clipped = Math.min(rule.alpha, muOutput(rule.outputCategory, y));
    if (clipped > maxVal) maxVal = clipped;
  }

  return maxVal;
}

function defuzzify(activeRules) {
  const { Y_MIN, Y_MAX, Y_STEP } = FUZZY_PARAMETERS;

  let numerator   = 0;
  let denominator = 0;

  for (let y = Y_MIN; y <= Y_MAX + 1e-9; y += Y_STEP) {
    const mu = aggregateAt(activeRules, y);
    numerator   += y * mu;
    denominator += mu;
  }

  if (denominator === 0) {
    return 4;
  }

  return numerator / denominator;
}

function lookupCategory(yStar) {
  let bestK   = 1;
  let minDist = Infinity;

  for (let k = 1; k <= 9; k++) {
    const dist = Math.abs(yStar - (k - 1));
    if (dist < minDist) {
      minDist = dist;
      bestK   = k;
    }
  }

  return bestK;
}

function runInference(x1, x2) {
  if (typeof x1 !== 'number' || typeof x2 !== 'number') {
    throw new TypeError('Input x1 (pH) dan x2 (kelembaban) harus berupa angka.');
  }

  const phClamped       = Math.max(0, Math.min(14, x1));
  const moistureClamped = Math.max(0, Math.min(100, x2));

  const membership  = fuzzify(phClamped, moistureClamped);
  const activeRules = evaluateRules(membership);
  const yStar       = defuzzify(activeRules);
  const categoryStar = lookupCategory(yStar);

  return {
    input:        { ph: x1, moisture: x2 },
    inputClamped: { ph: phClamped, moisture: moistureClamped },
    membership,
    activeRules,
    yStar:        parseFloat(yStar.toFixed(4)),
    categoryStar,
    categoryCode: `C${categoryStar}`,
  };
}

module.exports = {
  runInference,
  evaluateRules,
  defuzzify,
  lookupCategory,
  aggregateAt,
};
