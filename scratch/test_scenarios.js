const { generateRecommendation } = require('../src/ai/services/recommendation.service');
const prisma = require('../src/database/connections/prisma_client');

async function testAll() {
  const scenarios = [
    { name: 'S1 - Kondisi optimal', ph: 6.8, moisture: 70 },
    { name: 'S2 - Tanah kering', ph: 6.8, moisture: 25 },
    { name: 'S3 - pH asam, lembap', ph: 5.5, moisture: 55 },
    { name: 'S4 - pH asam, kering', ph: 5.5, moisture: 20 }
  ];

  for (const s of scenarios) {
    console.log(`\n================ ${s.name} ===============`);
    try {
      const result = await generateRecommendation({
        phValue: s.ph,
        moistureValue: s.moisture,
        polybagPreset: 'Standar',
        plantIdOrName: 'Pakcoy'
      });
      console.log(`Input: pH = ${s.ph}, Moisture = ${s.moisture}%`);
      console.log(`Category Code   : ${result.categoryCode}`);
      console.log(`Fuzzy Index (y*): ${result.fuzzyIndex}`);
      console.log(`Water Volume (L): ${result.waterVolumeLiter}`);
      console.log(`Lime Dosage (g) : ${result.limeDosageGram}`);
      console.log(`Sulfur Dosage (g): ${result.sulfurDosageGram}`);
      console.log('Active Rules:');
      result._debug.activeRules.forEach(r => {
        console.log(`  - ${r.ruleId} (${r.phSet} & ${r.moistureSet} -> C${r.outputCategory}) alpha = ${r.alpha}`);
      });
    } catch (e) {
      console.error(`Error running ${s.name}:`, e.message);
    }
  }
  await prisma.$disconnect();
}

testAll();
