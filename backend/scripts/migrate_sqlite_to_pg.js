const Database = require('better-sqlite3');
const { PrismaClient, Prisma } = require('@prisma/client');
require('dotenv').config();

const ORDERED_MODELS = [
  'Club',
  'Role',
  'User',
  'Tutor',
  'Member',
  'DigitalCard',
  'MembershipPlan',
  'Payment',
  'Invoice',
  'Subscription',
  'Sede',
  'Facility',
  'Booking',
  'Schedule',
  'PriceRule',
  'Sponsor',
  'ContractHistory',
  'Banner',
  'Campaign',
  'PlayerProfile',
  'FutsalMatch',
  'LiveMatchEvent',
  'FutsalTeam',
  'FutsalNews',
  'FutsalMedia',
  'Training',
  'Document',
  'Coach',
  'TechnicalStaff',
  'ClubEvent',
  'MedicalRecord',
  'PlayerDocument',
  'AuditLog',
  'SocialConfig',
  'Transaction',
  'News',
  'AdvertisementView',
  'Post',
  'CourtBooking',
  'CategoryConfig'
];

async function main() {
  console.log('🚀 Iniciando migración de datos SQLite (dev.db) -> PostgreSQL...');

  const sqliteDb = new Database('dev.db');
  const prisma = new PrismaClient();

  const modelsMap = new Map(Prisma.dmmf.datamodel.models.map(m => [m.name, m]));

  function mapRow(row, modelName) {
    const model = modelsMap.get(modelName);
    if (!model) return row;

    const mapped = {};
    for (const field of model.fields) {
      if (field.kind !== 'scalar') continue;
      const value = row[field.name];
      if (value === undefined || value === null) {
        mapped[field.name] = null;
        continue;
      }

      if (field.type === 'Boolean') {
        mapped[field.name] = value === 1 || value === true || value === 'true';
      } else if (field.type === 'DateTime') {
        mapped[field.name] = new Date(value);
      } else if (field.type === 'Decimal') {
        mapped[field.name] = new Prisma.Decimal(value);
      } else {
        mapped[field.name] = value;
      }
    }
    return mapped;
  }

  // 1. Limpiar base de datos destino en orden inverso para evitar fallos de constraints
  console.log('\n🧹 Limpiando registros antiguos en PostgreSQL...');
  for (let i = ORDERED_MODELS.length - 1; i >= 0; i--) {
    const modelName = ORDERED_MODELS[i];
    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    if (prisma[prismaModelName]) {
      try {
        await prisma[prismaModelName].deleteMany();
      } catch (err) {
        // Ignorar si la tabla no existe aún
      }
    }
  }

  // 2. Migrar datos en orden de dependencias
  for (const modelName of ORDERED_MODELS) {
    const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    if (!prisma[prismaModelName]) {
      console.log(`[SKIP] Modelo no encontrado en Prisma Client: ${modelName}`);
      continue;
    }

    // Verificar si la tabla existe en SQLite
    const tableExists = sqliteDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(modelName);
    if (!tableExists) {
      continue;
    }

    const rows = sqliteDb.prepare(`SELECT * FROM "${modelName}"`).all();
    if (rows.length === 0) {
      continue;
    }

    console.log(`📦 Migrando ${modelName} (${rows.length} registros)...`);

    const mappedRows = rows.map(r => mapRow(r, modelName));

    // Insertar registros en PostgreSQL
    await prisma[prismaModelName].createMany({
      data: mappedRows
    });
  }

  // 3. Ajustar secuencias autoincrementales en PostgreSQL
  console.log('\n🔄 Ajustando secuencias en PostgreSQL...');
  for (const modelName of ORDERED_MODELS) {
    const model = modelsMap.get(modelName);
    if (!model) continue;

    const hasAutoincrementId = model.fields.some(f => f.name === 'id' && f.type === 'Int');
    if (!hasAutoincrementId) continue;

    try {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('public."${modelName}"', 'id'), COALESCE(MAX(id), 1)) FROM "public"."${modelName}";`);
      console.log(`   Secuencia ajustada para tabla: ${modelName}`);
    } catch (err) {
      // Intentar sin el esquema public por si acaso
      try {
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${modelName}"', 'id'), COALESCE(MAX(id), 1)) FROM "${modelName}";`);
        console.log(`   Secuencia ajustada (fallback) para tabla: ${modelName}`);
      } catch (err2) {
        console.warn(`⚠️  No se pudo ajustar secuencia para ${modelName}: ${err2.message}`);
      }
    }
  }

  sqliteDb.close();
  await prisma.$disconnect();
  console.log('\n🎉 ¡Migración de datos SQLite -> PostgreSQL finalizada con éxito!');
}

main().catch(err => {
  console.error('❌ Error crítico durante la migración de datos:', err);
  process.exit(1);
});
