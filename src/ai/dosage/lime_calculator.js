const FUZZY_PARAMETERS = require('../config/fuzzy_parameters');

function calculateLimeDosage(phValue, areaMSquare, customPhTarget = null) {
  const { PH_TARGET, R_L } = FUZZY_PARAMETERS;
  const targetPh = customPhTarget !== null ? customPhTarget : PH_TARGET;

  const phDeficit = Math.max(0, targetPh - phValue);
  const rawDosage = R_L * areaMSquare * phDeficit;

  return {
    limeDosageGram: parseFloat(rawDosage.toFixed(2)),
    phDeficit:      parseFloat(phDeficit.toFixed(3)),
    phTarget:       targetPh,
    rL:             R_L,
  };
}

module.exports = { calculateLimeDosage };
