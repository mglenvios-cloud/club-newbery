const prisma = require('../prismaClient');

async function runBackfill() {
  console.log('🔄 Iniciando backfill de clubId = 1...');

  try {
    // 1. Asegurar la existencia del club Jorge Newbery (ID = 1)
    let club = await prisma.club.findUnique({
      where: { id: 1 }
    });

    if (!club) {
      console.log('ℹ️ Club Jorge Newbery con ID = 1 no encontrado. Creándolo...');
      club = await prisma.club.create({
        data: {
          id: 1,
          name: 'Club Jorge Newbery'
        }
      });
      console.log('✅ Club creado exitosamente.');
    } else {
      console.log(`✅ Club Jorge Newbery ya existe: "${club.name}"`);
    }

    // 2. Modelos globales para backfill
    const models = [
      'playerProfile',
      'futsalMatch',
      'futsalTeam',
      'futsalNews',
      'futsalMedia',
      'sponsor',
      'banner',
      'campaign',
      'training',
      'document',
      'coach',
      'technicalStaff',
      'clubEvent',
      'medicalRecord',
      'playerDocument',
      'auditLog',
      'matchEvent',
      'highlightClip',
      // Modelos que ya poseían clubId pero que pueden requerir sincronización
      'season',
      'discipline',
      'sede',
      'role',
      'membershipPlan',
      'booking',
      'user',
      'member'
    ];

    for (const model of models) {
      if (prisma[model]) {
        console.log(`⏳ Actualizando registros del modelo "${model}"...`);
        const result = await prisma[model].updateMany({
          where: {
            OR: [
              { clubId: null },
              { clubId: { not: 1 } }
            ]
          },
          data: {
            clubId: 1
          }
        });
        console.log(`   └─ Se actualizaron ${result.count} registros.`);
      } else {
        console.warn(`⚠️ Advertencia: El modelo "${model}" no está definido en Prisma.`);
      }
    }

    console.log('🎉 Backfill completado exitosamente.');
  } catch (error) {
    console.error('❌ Error durante el backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackfill();
