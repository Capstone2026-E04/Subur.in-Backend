

const DEFAULT_PLANT_PARAMS = {
  minPh: 6.0,
  maxPh: 7.0,
  phTarget: 6.5,
  minMoisture: 30.0,
  maxMoisture: 80.0,
  targetMoisture: 65.0,
};

function buildMembershipFunctions(plantParams = DEFAULT_PLANT_PARAMS) {
  const { minPh, maxPh, minMoisture, maxMoisture, targetMoisture } = plantParams;

  const muSangatAsam = (x1) => {
    const t1 = minPh - 1.5;
    const t2 = minPh - 0.5;
    if (x1 <= t1) return 1;
    if (x1 <= t2) return (t2 - x1) / (t2 - t1);
    return 0;
  };

  const muAsam = (x1) => {
    const t1 = minPh - 1.5;
    const t2 = minPh - 0.5;
    const t3 = minPh + 0.5;
    if (x1 <= t1) return 0;
    if (x1 <= t2) return (x1 - t1) / (t2 - t1);
    if (x1 <= t3) return (t3 - x1) / (t3 - t2);
    return 0;
  };

  const muOptimal = (x1) => {
    const t1 = minPh - 0.5;
    const t2 = minPh;
    const t3 = maxPh;
    const t4 = maxPh + 0.5;
    if (x1 <= t1) return 0;
    if (x1 <= t2) return (x1 - t1) / (t2 - t1);
    if (x1 <= t3) return 1;
    if (x1 <= t4) return (t4 - x1) / (t4 - t3);
    return 0;
  };

  const muBasa = (x1) => {
    const t1 = maxPh - 0.5;
    const t2 = maxPh + 0.5;
    const t3 = maxPh + 1.5;
    if (x1 <= t1) return 0;
    if (x1 <= t2) return (x1 - t1) / (t2 - t1);
    if (x1 <= t3) return (t3 - x1) / (t3 - t2);
    return 0;
  };

  const muSangatBasa = (x1) => {
    const t1 = maxPh + 0.5;
    const t2 = maxPh + 1.5;
    if (x1 <= t1) return 0;
    if (x1 <= t2) return (x1 - t1) / (t2 - t1);
    return 1;
  };

  

  const muKering = (x2) => {
    const t1 = minMoisture - 15;
    const t2 = minMoisture;
    if (x2 <= t1) return 1;
    if (x2 <= t2) return (t2 - x2) / (t2 - t1);
    return 0;
  };

  const peakSedang = (minMoisture + maxMoisture) / 2 - 10;
  const muSedang = (x2) => {
    const t1 = minMoisture - 15;
    const t2 = peakSedang;
    const t3 = targetMoisture;
    if (x2 <= t1) return 0;
    if (x2 <= t2) return (x2 - t1) / (t2 - t1);
    if (x2 <= t3) return (t3 - x2) / (t3 - t2);
    return 0;
  };

  const muLembap = (x2) => {
    const t1 = peakSedang;
    const t2 = targetMoisture - 5;
    const t3 = targetMoisture + 5;
    const t4 = maxMoisture;
    if (x2 <= t1) return 0;
    if (x2 <= t2) return (x2 - t1) / (t2 - t1);
    if (x2 <= t3) return 1;
    if (x2 <= t4) return (t4 - x2) / (t4 - t3);
    return 0;
  };

  const muJenuh = (x2) => {
    const t1 = maxMoisture;
    const t2 = maxMoisture + 5;
    if (x2 <= t1) return 0;
    if (x2 <= t2) return (x2 - t1) / (t2 - t1);
    return 1;
  };

  

  const muOutput = (k, y) => {
    return Math.max(0, 1 - Math.abs(y - (k - 1)));
  };

  

  const fuzzify = (ph, moisture) => {
    return {
      ph: {
        sangatAsam: muSangatAsam(ph),
        asam:       muAsam(ph),
        optimal:    muOptimal(ph),
        basa:       muBasa(ph),
        sangatBasa: muSangatBasa(ph),
      },
      moisture: {
        kering: muKering(moisture),
        sedang: muSedang(moisture),
        lembap: muLembap(moisture),
        jenuh:  muJenuh(moisture),
      },
    };
  };

  return {
    muSangatAsam,
    muAsam,
    muOptimal,
    muBasa,
    muSangatBasa,
    muKering,
    muSedang,
    muLembap,
    muJenuh,
    muOutput,
    fuzzify,
  };
}


const defaultMfs = buildMembershipFunctions();

module.exports = {
  buildMembershipFunctions,
  muSangatAsam: defaultMfs.muSangatAsam,
  muAsam: defaultMfs.muAsam,
  muOptimal: defaultMfs.muOptimal,
  muBasa: defaultMfs.muBasa,
  muSangatBasa: defaultMfs.muSangatBasa,
  muKering: defaultMfs.muKering,
  muSedang: defaultMfs.muSedang,
  muLembap: defaultMfs.muLembap,
  muJenuh: defaultMfs.muJenuh,
  muOutput: defaultMfs.muOutput,
  fuzzify: defaultMfs.fuzzify,
};
