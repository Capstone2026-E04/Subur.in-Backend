const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database Subur.in...');

  console.log('🧹 Membersihkan data tanaman lama (jika ada)...');
  await prisma.plant.deleteMany({});

  console.log('📌 Memasukkan data tanaman default...');
  const plants = [
    {
      name: 'Pakcoy',
      scientificName: 'Brassica rapa L. var. chinensis',
      description: 'Sayuran daun populer dari keluarga kubis-kubisan (Brassicaceae). Sangat cocok untuk sistem urban farming skala kecil.',
      minPh: 6.0,
      maxPh: 7.0,
      minMoisture: 60.0,
      maxMoisture: 80.0,
    },
    {
      name: 'Selada',
      scientificName: 'Lactuca sativa L.',
      description: 'Sayuran berdaun longgar yang kaya vitamin. Membutuhkan aerasi tanah baik dengan kelembaban sedang.',
      minPh: 6.0,
      maxPh: 6.8,
      minMoisture: 60.0,
      maxMoisture: 75.0,
    },
    {
      name: 'Bayam',
      scientificName: 'Amaranthus tricolor L.',
      description: 'Sayuran hijau cepat panen dengan kandungan zat besi tinggi. Relatif toleran terhadap berbagai jenis media tanam.',
      minPh: 6.0,
      maxPh: 7.0,
      minMoisture: 50.0,
      maxMoisture: 70.0,
    }
  ];

  for (const plant of plants) {
    const createdPlant = await prisma.plant.create({
      data: plant
    });
    console.log(`✅ Berhasil membuat tanaman: ${createdPlant.name}`);
  }

  console.log('🧹 Membersihkan data polybag lama (jika ada)...');
  await prisma.polybag.deleteMany({});
  await prisma.polybagType.deleteMany({});

  console.log('📌 Memasukkan tipe polybag default...');
  const polybagTypes = [
    {
      name: 'Standar',
      diameter: 20.0,
      height: 25.0,
    },
    {
      name: 'Besar',
      diameter: 25.0,
      height: 25.0,
    }
  ];

  const createdTypes = {};
  for (const type of polybagTypes) {
    const createdType = await prisma.polybagType.create({
      data: type
    });
    createdTypes[createdType.name.toLowerCase()] = createdType;
    console.log(`✅ Berhasil membuat tipe polybag: ${createdType.name} (Dia: ${createdType.diameter}cm, T: ${createdType.height}cm)`);
  }

  console.log('📌 Memasukkan data polybag (penggunaan) default...');
  const polybags = [
    {
      polybagTypeId: createdTypes['standar'].id,
      soilVolumeLiter: 5.0,
    },
    {
      polybagTypeId: createdTypes['besar'].id,
      soilVolumeLiter: 10.0,
    }
  ];

  for (const polybag of polybags) {
    const createdPolybag = await prisma.polybag.create({
      data: polybag,
      include: { polybagType: true }
    });
    console.log(`✅ Berhasil membuat polybag: ${createdPolybag.polybagType.name} dengan Volume Tanah ${createdPolybag.soilVolumeLiter}L`);
  }

  console.log('✨ Proses seeding database selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
