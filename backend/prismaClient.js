'use strict';

/**
 * ─── Prisma Client — SQLite Native Connection ─────────────────────────────────
 *
 * Utiliza Prisma Client v7 con el adaptador nativo @prisma/adapter-better-sqlite3
 * conectado directamente a la base de datos SQLite (dev.db).
 */
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('file:', '')
  : path.join(__dirname, 'dev.db');

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
