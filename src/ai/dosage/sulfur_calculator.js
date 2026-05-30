const FUZZY_PARAMETERS = require('../config/fuzzy_parameters');

function calculateSulfurDosage(phValue, volumeLiter, customPhTarget = null) {
  const { PH_TARGET, K_S, M_S_MAX } = FUZZY_PARAMETERS;
  const targetPh = customPhTarget !== null ? customPhTarget : PH_TARGET;

  const phExcess    = Math.max(0, phValue - targetPh);
  const rawDosage   = K_S * volumeLiter * phExcess;
  const finalDosage = Math.min(rawDosage, M_S_MAX);
  const wasCapped   = rawDosage > M_S_MAX;

  return {
    sulfurDosageGram:          parseFloat(finalDosage.toFixed(2)),
    phExcess:                  parseFloat(phExcess.toFixed(3)),
    phTarget:                  targetPh,
    kS:                        K_S,
    mSMax:                     M_S_MAX,
    cappedByMSMax:             wasCapped,
    requiresStagedApplication: wasCapped,
  };
}

module.exports = { calculateSulfurDosage };
