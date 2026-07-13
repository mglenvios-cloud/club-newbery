const prisma = require('../prismaClient');

async function test() {
  console.log("Starting direct queries test...");
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users query OK, count:", users.length);
  } catch (e) {
    console.error("Users query failed:", e);
  }

  try {
    const socios = await prisma.member.findMany({
      include: { tutor: true, digitalCard: true, user: { select: { email: true } } },
      orderBy: { socioNumber: 'asc' }
    });
    console.log("Socios query OK, count:", socios.length);
  } catch (e) {
    console.error("Socios query failed:", e);
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        socio: true,
        facility: true
      },
      orderBy: { fecha: 'desc' }
    });
    console.log("Bookings query OK, count:", bookings.length);
  } catch (e) {
    console.error("Bookings query failed:", e);
  }

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });
    console.log("Transactions query OK, count:", transactions.length);
  } catch (e) {
    console.error("Transactions query failed:", e);
  }

  try {
    const payments = await prisma.payment.findMany({
      include: { socio: true, plan: true, invoices: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Payments query OK, count:", payments.length);
  } catch (e) {
    console.error("Payments query failed:", e);
  }

  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log("News query OK, count:", news.length);
  } catch (e) {
    console.error("News query failed:", e);
  }

  try {
    const media = await prisma.futsalMedia.findMany({
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    console.log("FutsalMedia query OK, count:", media.length);
  } catch (e) {
    console.error("FutsalMedia query failed:", e);
  }

  console.log("Finished queries.");
  await prisma.$disconnect();
}

test();
