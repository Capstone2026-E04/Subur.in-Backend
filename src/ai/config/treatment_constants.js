/**
 * Konstanta agronomi global berdasarkan rujukan ilmiah terpercaya
 * (FAO Irrigation Paper 56, Manutec, MSU Extension, Wisconsin Soils, dll.)
 */
const TREATMENT_CONSTANTS = {
  PH_TOLERANCE:              0.2,     // Tidak ada aksi jika |pH_aktual - pH_target| < 0.2
  MAD_FRACTION:              0.30,    // Management Allowed Depletion untuk leafy greens
  V_MAX_FRACTION:            0.20,    // Cap volume air per aplikasi (20% dari V_tanah)
  K_L_LIME:                  2.0,     // Dosis kapur: 2.0 g/L media per unit pH deficit
  M_L_MAX_PER_LITER:         5.0,     // Cap kapur maksimal: 5.0 g per liter media tanah
  K_S_SULFUR:                0.6,     // Dosis belerang: 0.6 g/L media per unit pH excess
  M_S_MAX_PER_LITER:         3.0,     // Cap belerang maksimal: 3.0 g per liter media tanah
};

module.exports = TREATMENT_CONSTANTS;
