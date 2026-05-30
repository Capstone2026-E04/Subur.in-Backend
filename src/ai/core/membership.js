function muSangatAsam(x1) {
  if (x1 <= 4.5) return 1;
  if (x1 <= 5.5) return (5.5 - x1) / (5.5 - 4.5);
  return 0;
}

function muAsam(x1) {
  if (x1 <= 4.5) return 0;
  if (x1 <= 5.5) return (x1 - 4.5) / (5.5 - 4.5);
  if (x1 <= 6.5) return (6.5 - x1) / (6.5 - 5.5);
  return 0;
}

function muOptimal(x1) {
  if (x1 <= 5.5) return 0;
  if (x1 <= 6.5) return (x1 - 5.5) / (6.5 - 5.5);
  if (x1 <= 7.5) return (7.5 - x1) / (7.5 - 6.5);
  return 0;
}

function muBasa(x1) {
  if (x1 <= 6.5) return 0;
  if (x1 <= 7.5) return (x1 - 6.5) / (7.5 - 6.5);
  if (x1 <= 8.5) return (8.5 - x1) / (8.5 - 7.5);
  return 0;
}

function muSangatBasa(x1) {
  if (x1 <= 7.5) return 0;
  if (x1 <= 8.5) return (x1 - 7.5) / (8.5 - 7.5);
  return 1;
}

function muKering(x2) {
  if (x2 <= 15) return 1;
  if (x2 <= 30) return (30 - x2) / (30 - 15);
  return 0;
}

function muSedang(x2) {
  if (x2 <= 25) return 0;
  if (x2 <= 42.5) return (x2 - 25) / (42.5 - 25);
  if (x2 <= 60) return (60 - x2) / (60 - 42.5);
  return 0;
}

function muLembap(x2) {
  if (x2 <= 55) return 0;
  if (x2 <= 70) return (x2 - 55) / (70 - 55);
  if (x2 <= 85) return (85 - x2) / (85 - 70);
  return 0;
}

function muJenuh(x2) {
  if (x2 <= 80) return 0;
  if (x2 <= 90) return (x2 - 80) / (90 - 80);
  return 1;
}

function muOutput(k, y) {
  return Math.max(0, 1 - Math.abs(y - (k - 1)));
}

function fuzzify(x1, x2) {
  return {
    ph: {
      sangatAsam: muSangatAsam(x1),
      asam:       muAsam(x1),
      optimal:    muOptimal(x1),
      basa:       muBasa(x1),
      sangatBasa: muSangatBasa(x1),
    },
    moisture: {
      kering: muKering(x2),
      sedang: muSedang(x2),
      lembap: muLembap(x2),
      jenuh:  muJenuh(x2),
    },
  };
}

module.exports = {
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
