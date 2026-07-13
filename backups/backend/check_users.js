const prisma = require('./prismaClient');

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DATABASE:");
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
