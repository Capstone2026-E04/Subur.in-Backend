const { generateRecommendation } = require('../ai/services/recommendation.service');

/**
 * Menyimulasikan logika fuzzy berdasarkan input pH, kelembaban, tipe polybag, dan tipe tanaman dari database.
 */
exports.simulateRecommendation = async (req, res) => {
  try {
    const { phValue, moistureValue, polybagPreset, plantIdOrName } = req.body;

    if (phValue === undefined || moistureValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Parameter phValue dan moistureValue wajib dikirimkan!'
      });
    }

    if (!polybagPreset) {
      return res.status(400).json({
        success: false,
        message: 'Parameter polybagPreset wajib diisi (misal: "STANDAR", "BESAR", atau UUID).'
      });
    }

    if (!plantIdOrName) {
      return res.status(400).json({
        success: false,
        message: 'Parameter plantIdOrName wajib diisi (misal: "Pakcoy", "Selada", "Bayam", atau UUID).'
      });
    }

    const ph = parseFloat(phValue);
    const moisture = parseFloat(moistureValue);

    if (isNaN(ph) || isNaN(moisture)) {
      return res.status(400).json({
        success: false,
        message: 'phValue dan moistureValue harus berupa angka valid.'
      });
    }

    const result = await generateRecommendation({
      phValue: ph,
      moistureValue: moisture,
      polybagPreset,
      plantIdOrName
    });

    return res.status(200).json({
      success: true,
      message: 'Simulasi Fuzzy Logic berhasil dijalankan!',
      data: result
    });

  } catch (error) {
    console.error('Simulate Recommendation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan simulasi fuzzy logic.',
      error: error.message
    });
  }
};
