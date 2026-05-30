const prisma = require('../database/connections/prisma_client');


exports.getAllPolybags = async (req, res) => {
  try {
    const polybags = await prisma.polybag.findMany({
      include: {
        polybagType: true
      }
    });

    
    const mappedPolybags = polybags.map(pb => ({
      id: pb.id,
      name: pb.polybagType.name,
      size: `${pb.soilVolumeLiter}L (${pb.polybagType.diameter}x${pb.polybagType.height}cm)`
    }));

    return res.status(200).json({
      success: true,
      message: 'Daftar polybag berhasil diambil.',
      data: mappedPolybags
    });
  } catch (error) {
    console.error('Get All Polybags Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar polybag.',
      error: error.message
    });
  }
};
