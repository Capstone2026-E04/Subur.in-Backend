const FUZZY_PARAMETERS = require('../config/fuzzy_parameters');

function calculateWaterVolume(moisturePercent, volumeLiter, customThetaTarget = null) {
  const { THETA_TARGET, V_MAX } = FUZZY_PARAMETERS;
  const targetTheta = customThetaTarget !== null ? customThetaTarget : THETA_TARGET;

  const theta      = moisturePercent / 100;
  const rawVolume  = Math.max(0, (targetTheta - theta) * volumeLiter);
  const finalVolume = Math.min(rawVolume, V_MAX);

  return {
    waterVolumeLiter: parseFloat(finalVolume.toFixed(3)),
    theta:            parseFloat(theta.toFixed(4)),
    thetaTarget:      targetTheta,
    cappedByVmax:     rawVolume > V_MAX,
  };
}

module.exports = { calculateWaterVolume };
