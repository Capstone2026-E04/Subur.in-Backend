

const DEFAULT_PLANT_PARAMS = {
  minPh: 6.0,
  maxPh: 7.0,
  phTarget: 6.5,
  minMoisture: 30.0,
  maxMoisture: 80.0,
  targetMoisture: 65.0,
};

function buildMembershipFunctions(plantParams = DEFAULT_PLANT_PARAMS) {
  const muSangatAsam = (x1) => {
    if (x1 <= 4.5) return 1;
    if (x1 <= 5.5) return (5.5 - x1) / (5.5 - 4.5);
    return 0;
  };

  const muAsam = (x1) => {
    if (x1 <= 4.5) return 0;
    if (x1 <= 5.5) return (x1 - 4.5) / (5.5 - 4.5);
    if (x1 <= 6.5) return (6.5 - x1) / (6.5 - 5.5);
    return 0;
  };

  const muOptimal = (x1) => {
    if (x1 <= 5.5) return 0;
    if (x1 <= 6.5) return (x1 - 5.5) / (6.5 - 5.5);
    if (x1 <= 7.5) return (7.5 - x1) / (7.5 - 6.5);
    return 0;
  };

  const muBasa = (x1) => {
    if (x1 <= 7.0) return 0;
    if (x1 <= 7.5) return (x1 - 7.0) / (7.5 - 7.0);
    if (x1 <= 8.5) return (8.5 - x1) / (8.5 - 7.5);
    return 0;
  };

  const muSangatBasa = (x1) => {
    if (x1 <= 7.5) return 0;
    if (x1 <= 8.5) return (x1 - 7.5) / (8.5 - 7.5);
    return 1;
  };

  const muKering = (x2) => {
    if (x2 <= 20) return 1;
    if (x2 <= 30) return (30 - x2) / (30 - 20);
    return 0;
  };

  const muSedang = (x2) => {
    if (x2 <= 25) return 0;
    if (x2 <= 42.5) return (x2 - 25) / (42.5 - 25);
    if (x2 <= 60) return (60 - x2) / (60 - 42.5);
    return 0;
  };

  const muLembap = (x2) => {
    if (x2 <= 55) return 0;
    if (x2 <= 70) return (x2 - 55) / (70 - 55);
    if (x2 <= 85) return (85 - x2) / (85 - 70);
    return 0;
  };

  const muJenuh = (x2) => {
    if (x2 <= 80) return 0;
    if (x2 <= 90) return (x2 - 80) / (90 - 80);
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
