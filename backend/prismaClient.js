const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
require('dotenv').config();

let dbUrl = process.env.DATABASE_URL;

if (process.env.APP_ENV === 'TEST') {
  dbUrl = 'file:./test.db';
  console.log('🧪 [ENV: TEST] Utilizando base de datos aislada test.db');
} else {
  dbUrl = dbUrl || 'file:./dev.db';
  console.log('🚀 [ENV: PROD] Utilizando base de datos principal dev.db');
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
