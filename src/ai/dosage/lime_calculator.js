const { K_L_LIME, M_L_MAX_PER_LITER, PH_TOLERANCE } = require('../config/treatment_constants');


function calculateLimeDosage(phValue, volumeLiter, targetPh) {
  if (typeof phValue !== 'number' || typeof volumeLiter !== 'number' || typeof targetPh !== 'number') {
    throw new TypeError('Semua parameter input kalkulator kapur harus berupa angka.');
  }

  const phDeficit = targetPh - phValue;

  
  if (phDeficit <= PH_TOLERANCE) {
    return {
      limeDosageGram: 0,
      phDeficit:      parseFloat(Math.max(0, phDeficit).toFixed(3)),
      phTarget:       targetPh,
      kL:             K_L_LIME,
      cappedByMax:    false,
    };
  }

  const rawDosage   = K_L_LIME * volumeLiter * phDeficit;
  const maxDosage   = M_L_MAX_PER_LITER * volumeLiter;
  const finalDosage = Math.min(rawDosage, maxDosage);

  return {
    limeDosageGram: parseFloat(finalDosage.toFixed(2)),
    phDeficit:      parseFloat(phDeficit.toFixed(3)),
    phTarget:       targetPh,
    kL:             K_L_LIME,
    maxDosage:      parseFloat(maxDosage.toFixed(2)),
    cappedByMax:    rawDosage > maxDosage,
  };
}

module.exports = { calculateLimeDosage };
