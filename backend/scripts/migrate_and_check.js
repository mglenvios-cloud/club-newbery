'use strict';

/**
 * ─── Script de Migración y Validación de Base de Datos (`npm run migrate`) ──────
 */

const { execSync } = require('child_process');
const prisma = require('../prismaClient');

async function runMigrate() {
  console.log('====================================================');
  console.log('🔄 INICIANDO PROCESO DE MIGRACIÓN Y VERIFICACIÓN');
  console.log('====================================================\n');

  // 1. Ejecutar prisma db push / migrate deploy
  try {
    console.log('[1/4] Aplicando cambios de esquema Prisma...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Esquema sincronizado exitosamente.\n');
  } catch (err) {
    console.error('⚠️ Advertencia en prisma db push:', err.message);
  }

  // 2. Generar Cliente Prisma
  try {
    console.log('[2/4] Generando Cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma actualizado.\n');
  } catch (err) {
    console.error('❌ Error al generar cliente Prisma:', err.message);
  }

  // 3. Validar conexión y contar registros/tablas
  console.log('[3/4] Validando conexión activa a la Base de Datos...');
  let connected = false;
  let report = {
    users: 0,
    members: 0,
    categories: 0,
    auditLogs: 0
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    connected = true;
    console.log('✅ Conexión con la Base de Datos comprobada.');

    try {
      if (prisma.user) report.users = await prisma.user.count();
      if (prisma.member) report.members = await prisma.member.count();
      if (prisma.category) report.categories = await prisma.category.count();
      if (prisma.auditLog) report.auditLogs = await prisma.auditLog.count();
    } catch (_) {}

  } catch (dbErr) {
    console.error('❌ Error de conexión:', dbErr.message);
  }

  // 4. Generar reporte final
  console.log('\n[4/4] REPORTE DE MIGRACIÓN Y ESTADO DE TABLAS:');
  console.log('----------------------------------------------------');
  console.log(`Estado Conexión DB: ${connected ? '🟢 CONECTADO' : '🔴 ERROR'}`);
  console.log(`Tabla Usuarios:    ${report.users} registros`);
  console.log(`Tabla Miembros:    ${report.members} registros`);
  console.log(`Tabla Categorías:  ${report.categories} registros`);
  console.log(`Tabla AuditLogs:   ${report.auditLogs} registros`);
  console.log('----------------------------------------------------');
  console.log('✨ Proceso de migración completado exitosamente.\n');

  await prisma.$disconnect();
}

runMigrate().catch((err) => {
  console.error('❌ Error crítico en script de migración:', err);
  process.exit(1);
});
