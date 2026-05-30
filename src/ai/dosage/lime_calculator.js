const FUZZY_PARAMETERS = require('../config/fuzzy_parameters');

function calculateLimeDosage(phValue, volumeLiter, customPhTarget = null) {
  const { PH_TARGET, K_L } = FUZZY_PARAMETERS;
  const targetPh = customPhTarget !== null ? customPhTarget : PH_TARGET;

  const phDeficit  = Math.max(0, targetPh - phValue);
  const rawDosage  = K_L * volumeLiter * phDeficit;

  return {
    limeDosageGram: parseFloat(rawDosage.toFixed(2)),
    phDeficit:      parseFloat(phDeficit.toFixed(3)),
    phTarget:       targetPh,
    kL:             K_L,
  };
}

module.exports = { calculateLimeDosage };
