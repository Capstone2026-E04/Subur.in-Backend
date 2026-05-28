const prisma = require('../../database/connections/prisma_client');
const { runInference }           = require('../core/engine');
const { interpretCategory }      = require('../utils/interpreter');
const { calculateWaterVolume }   = require('../dosage/water_calculator');
const { calculateLimeDosage }    = require('../dosage/lime_calculator');
const { calculateSulfurDosage }  = require('../dosage/sulfur_calculator');
const { getPhysicalPreset }      = require('../config/physical_presets');

async function generateRecommendation({ phValue, moistureValue, polybagPreset, plantIdOrName }) {
  if (typeof phValue !== 'number' || typeof moistureValue !== 'number') {
    throw new TypeError('phValue dan moistureValue harus berupa angka.');
  }
  if (!polybagPreset) {
    throw new Error('polybagPreset wajib diisi.');
  }
  if (!plantIdOrName) {
    throw new Error('plantIdOrName wajib diisi.');
  }

  const preset = await getPhysicalPreset(polybagPreset);

  let plant = null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(plantIdOrName);
    if (isUuid) {
      plant = await prisma.plant.findUnique({
        where: { id: plantIdOrName }
      });
    } else {
      plant = await prisma.plant.findFirst({
        where: {
          name: {
            equals: plantIdOrName,
            mode: 'insensitive'
          }
        }
      });
    }
  } catch (dbError) {
    throw new Error(`Database error saat memuat data tanaman: "${dbError.message}".`);
  }

  if (!plant) {
    throw new Error(`Data tanaman dengan identitas "${plantIdOrName}" tidak ditemukan di database.`);
  }

  const phTarget = (plant.minPh + plant.maxPh) / 2;
  const thetaTarget = ((plant.minMoisture + plant.maxMoisture) / 2) / 100;

  const inference = runInference(phValue, moistureValue);

  const interpretation = interpretCategory(inference.categoryCode);

  let waterVolumeLiter = 0;
  let limeDosageGram   = 0;
  let sulfurDosageGram = 0;
  let waterDetail      = null;
  let limeDetail       = null;
  let sulfurDetail     = null;

  if (interpretation.needsWater) {
    waterDetail       = calculateWaterVolume(moistureValue, preset.volumeLiter, thetaTarget);
    waterVolumeLiter  = waterDetail.waterVolumeLiter;
  }

  if (interpretation.needsLime) {
    limeDetail       = calculateLimeDosage(phValue, preset.areaM2, phTarget);
    limeDosageGram   = limeDetail.limeDosageGram;
  }

  if (interpretation.needsSulfur) {
    sulfurDetail      = calculateSulfurDosage(phValue, preset.areaM2, phTarget);
    sulfurDosageGram  = sulfurDetail.sulfurDosageGram;
  }

  return {
    phValue,
    moistureValue,
    fuzzyIndex:       inference.yStar,
    categoryCode:     inference.categoryCode,
    actionText:       interpretation.actionText,
    waterVolumeLiter,
    limeDosageGram,
    sulfurDosageGram,
    reduceWatering:   interpretation.reduceWatering,

    _debug: {
      inputClamped:       inference.inputClamped,
      membership:         inference.membership,
      activeRules:        inference.activeRules,
      yStar:              inference.yStar,
      categoryStar:       inference.categoryStar,
      polybagPresetUsed:  preset.name,
      areaM2:             parseFloat(preset.areaM2.toFixed(5)),
      volumeLiterUsed:    parseFloat(preset.volumeLiter.toFixed(3)),
      plantUsed:          `${plant.name} (${plant.scientificName || 'n/a'})`,
      phTarget:           parseFloat(phTarget.toFixed(3)),
      thetaTarget:        parseFloat(thetaTarget.toFixed(4)),
      waterDetail,
      limeDetail,
      sulfurDetail,
    },
  };
}

module.exports = { generateRecommendation };
