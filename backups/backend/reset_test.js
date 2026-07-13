const prisma = require('./prismaClient');

async function main() {
  console.log('🧹 Limpiando test.db...');
  
  if (process.env.APP_ENV !== 'TEST') {
    console.error('❌ ERROR: Este script solo se puede ejecutar en el entorno de TEST.');
    process.exit(1);
  }

  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.sede.deleteMany({});
  await prisma.training.deleteMany({});
  await prisma.clubEvent.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.playerDocument.deleteMany({});
  await prisma.playerProfile.deleteMany({});
  await prisma.futsalMatch.deleteMany({});
  await prisma.liveMatchEvent.deleteMany({});
  await prisma.futsalTeam.deleteMany({});
  await prisma.futsalNews.deleteMany({});
  await prisma.futsalMedia.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      NOT: [
        { email: 'admin' },
        { email: 'futsal' }
      ]
    }
  });

  console.log('✅ test.db limpio.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
