const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

/**
 * ─── Prisma Client — PostgreSQL ───────────────────────────────────────────────
 *
 * La conexión se obtiene exclusivamente desde DATABASE_URL.
 * config/env.js garantiza que esta variable esté definida antes de que
 * cualquier ruta sea cargada.
 */

const nodeEnv = process.env.NODE_ENV || 'development';

const prisma = new PrismaClient({
  log: nodeEnv === 'development'
    ? ['error', 'warn']
    : ['error'],
});

if (nodeEnv !== 'production') {
  console.log(`[Prisma] Conectando a base de datos (${nodeEnv})`);
}

module.exports = prisma;
