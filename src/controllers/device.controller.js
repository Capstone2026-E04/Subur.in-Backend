const prisma = require('../database/connections/prisma_client');
const { getRedisClient } = require('../database/connections/redis');
const { generateRecommendation } = require('../ai/services/recommendation.service');
const { getLatestSensorData } = require('../repositories/sensor_redis_repository');
const { getLatestSensorLog } = require('../repositories/sensor_repository');

/**
 * GET /api/devices/discovered
 * Mendeteksi secara dinamis device yang sedang aktif memancarkan data di Redis,
 * namun BELUM terdaftar di database Supabase (Unclaimed/Auto-Discovery).
 */
exports.getDiscoveredDevices = async (req, res) => {
  try {
    const redis = getRedisClient();

    // 1. Cari semua key di Redis yang mencatat data sensor terbaru dari device
    const keys = await redis.keys('sensor:latest:*');

    if (keys.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Tidak ada device aktif baru yang terdeteksi.',
        data: { devices: [] }
      });
    }

    // 2. Ambil nilai telemetry (data sensor) untuk setiap device dari Redis
    const activeDevices = [];
    for (const key of keys) {
      const rawData = await redis.get(key);
      if (rawData) {
        activeDevices.push(JSON.parse(rawData));
      }
    }

    // Ambil daftar deviceId yang sedang aktif di Redis
    const activeDeviceIds = activeDevices.map(d => d.deviceId);

    // 3. Cari device mana saja dari daftar aktif tersebut yang SUDAH terdaftar di database
    const registeredDevices = await prisma.device.findMany({
      where: {
        id: { in: activeDeviceIds }
      },
      select: { id: true }
    });

    const registeredIds = new Set(registeredDevices.map(d => d.id));

    // 4. Saring: Sisakan hanya device aktif yang BELUM terdaftar di database (Unclaimed)
    const unclaimedDevices = activeDevices.filter(d => !registeredIds.has(d.deviceId));

    return res.status(200).json({
      success: true,
      message: 'Berhasil mendeteksi device aktif yang belum terdaftar.',
      data: { devices: unclaimedDevices }
    });

  } catch (error) {
    console.error('Get Discovered Devices Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mencari device aktif.',
      error: error.message
    });
  }
};

/**
 * POST /api/devices
 * Mendaftarkan (klaim) device baru yang terhubung ke akun user yang sedang login.
 */
exports.registerDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceId, label, plantId, polybagId } = req.body;

    if (!deviceId || !label || !plantId || !polybagId) {
      return res.status(400).json({
        success: false,
        message: 'deviceId, label, plantId, dan polybagId wajib diisi.'
      });
    }

    // 1. Periksa apakah device dengan ID ini sudah terdaftar sebelumnya
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device dengan ID ini sudah terdaftar di sistem.'
      });
    }

    // 2. Hubungkan ke database dengan foreign keys yang valid
    const newDevice = await prisma.device.create({
      data: {
        id: deviceId, // Disimpan menggunakan deviceId dari ESP32 (misal: MAC Address)
        userId: userId, // Diambil otomatis dari token autentikasi user
        label: label.trim(),
        plantId: plantId,
        polybagId: polybagId,
        status: 'ACTIVE'
      },
      include: {
        plant: true,
        polybag: {
          include: { polybagType: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Device berhasil didaftarkan dan dihubungkan ke akun Anda.',
      data: { device: newDevice }
    });

  } catch (error) {
    console.error('Register Device Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftarkan device.',
      error: error.message
    });
  }
};

/**
 * GET /api/devices
 * Mengambil daftar seluruh device yang terdaftar atas nama user yang sedang login.
 */
exports.getMyDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    const devices = await prisma.device.findMany({
      where: { userId: userId },
      include: {
        plant: true,
        polybag: {
          include: { polybagType: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar device Anda berhasil diambil.',
      data: { devices }
    });

  } catch (error) {
    console.error('Get My Devices Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar device.',
      error: error.message
    });
  }
};

/**
 * PATCH /api/devices/:id
 * Memperbarui info device milik user yang sedang login (seperti ganti label, jenis tanaman, atau polybag).
 */
exports.updateDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { label, plantId, polybagId, status } = req.body;

    // Pastikan device tersebut ada dan memang milik user bersangkutan
    const device = await prisma.device.findFirst({
      where: { id: id, userId: userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    const updatedDevice = await prisma.device.update({
      where: { id: id },
      data: {
        label: label !== undefined ? label.trim() : device.label,
        plantId: plantId !== undefined ? plantId : device.plantId,
        polybagId: polybagId !== undefined ? polybagId : device.polybagId,
        status: status !== undefined ? status : device.status
      },
      include: {
        plant: true,
        polybag: {
          include: { polybagType: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Info device berhasil diperbarui.',
      data: { device: updatedDevice }
    });

  } catch (error) {
    console.error('Update Device Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui device.',
      error: error.message
    });
  }
};

/**
 * DELETE /api/devices/:id
 * Menghapus/melepas (unclaim) device milik user secara permanen.
 */
exports.deleteDevice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Pastikan device tersebut ada dan memang milik user bersangkutan
    const device = await prisma.device.findFirst({
      where: { id: id, userId: userId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    await prisma.device.delete({
      where: { id: id }
    });

    return res.status(200).json({
      success: true,
      message: 'Device berhasil dihapus dari akun Anda.'
    });

  } catch (error) {
    console.error('Delete Device Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus device.',
      error: error.message
    });
  }
};

/**
 * GET /api/devices/:id/recommendation
 * Menghasilkan rekomendasi fuzzy logic real-time untuk device berdasarkan data sensor terbaru.
 */
exports.getDeviceRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Pastikan device tersebut ada dan memang milik user
    const device = await prisma.device.findFirst({
      where: { id: id, userId: userId },
      include: {
        plant: true,
        polybag: true
      }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    // 2. Ambil data sensor terbaru (Redis -> Database)
    let sensorData = await getLatestSensorData(id);
    if (!sensorData) {
      const dbLog = await getLatestSensorLog(id);
      if (dbLog) {
        sensorData = {
          ph: dbLog.ph,
          moisture: dbLog.moisture,
          timestamp: dbLog.timestamp
        };
      }
    }

    if (!sensorData) {
      return res.status(200).json({
        success: true,
        message: 'Belum ada data sensor tercatat untuk alat ini.',
        data: null
      });
    }

    // 3. Jalankan mesin fuzzy logic untuk mendapatkan rekomendasi
    const recommendation = await generateRecommendation({
      phValue: sensorData.ph,
      moistureValue: sensorData.moisture,
      polybagPreset: device.polybagId,
      plantIdOrName: device.plantId
    });

    // 4. Simpan log rekomendasi di database Supabase
    const savedLog = await prisma.recommendationLog.create({
      data: {
        deviceId: id,
        phValue: sensorData.ph,
        moistureValue: sensorData.moisture,
        fuzzyIndex: recommendation.fuzzyIndex,
        categoryCode: recommendation.categoryCode,
        actionText: recommendation.actionText,
        waterVolumeLiter: recommendation.waterVolumeLiter,
        limeDosageGram: recommendation.limeDosageGram,
        sulfurDosageGram: recommendation.sulfurDosageGram,
        reduceWatering: recommendation.reduceWatering
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Rekomendasi Fuzzy Logic berhasil dibuat.',
      data: {
        ...recommendation,
        logId: savedLog.id,
        timestamp: sensorData.timestamp
      }
    });

  } catch (error) {
    console.error('Get Device Recommendation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghasilkan rekomendasi.',
      error: error.message
    });
  }
};
