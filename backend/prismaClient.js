'use strict';

/**
 * ─── Prisma Client — Firebase Firestore Adapter ────────────────────────────────
 *
 * Mapea todas las llamadas de base de datos a colecciones Firestore emulando Prisma.
 */
const prisma = require('./firestorePrismaAdapter');

console.log('[Prisma-Firestore] Inicializando adaptador para base de datos Firestore');

module.exports = prisma;
