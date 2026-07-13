const prisma = require('./prismaClient');

async function main() {
  const models = ['user', 'member', 'categoryConfig', 'transaction', 'booking', 'post', 'playerProfile', 'news'];
  for (const model of models) {
    try {
      const data = await prisma[model].findMany();
      console.log(`--- ${model.toUpperCase()} (${data.length} records) ---`);
      if (data.length > 0) {
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`Error querying ${model}:`, err.message);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
