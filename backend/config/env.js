/**
 * ─── Validación de Variables de Entorno ───────────────────────────────────────
 *
 * Este módulo se importa UNA VEZ en index.js ANTES de cargar cualquier ruta.
 * Si alguna variable critica está ausente, el proceso termina con exit code 1.
 *
 * NUNCA agregar valores por defecto para secretos de seguridad.
 */

'use strict';

const REQUIRED_VARS = [
  { key: 'JWT_SECRET',   description: 'Clave secreta para firmar y verificar tokens JWT' },
  { key: 'DATABASE_URL', description: 'URL de conexion a la base de datos (PostgreSQL)' },
  { key: 'FRONTEND_URL', description: 'URL del frontend (Vercel) para CORS' },
];

const OPTIONAL_VARS = [
  { key: 'MP_ACCESS_TOKEN', description: 'Token de acceso de MercadoPago (requerido para pagos)' },
  { key: 'PORT',            description: 'Puerto de escucha del servidor' },
];

function validateEnv() {
  const missing = [];

  for (const { key, description } of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(`  - ${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    console.error('\n[ENV] VARIABLES DE ENTORNO CRITICAS NO DEFINIDAS:');
    missing.forEach((m) => console.error('[ENV]' + m));
    console.error('\n[ENV] Configurar estas variables antes de iniciar el servidor.');
    console.error('[ENV] En Render: Dashboard -> Environment -> Add Variable');
    console.error('[ENV] En local:  Agregar al archivo .env\n');
    process.exit(1);
  }

  for (const { key, description } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      console.warn(`[ENV] ADVERTENCIA: ${key} no definida: ${description}`);
    }
  }

  console.log('[ENV] Variables de entorno criticas: OK');
}

validateEnv();

module.exports = {
  JWT_SECRET:      process.env.JWT_SECRET,
  DATABASE_URL:    process.env.DATABASE_URL,
  FRONTEND_URL:    process.env.FRONTEND_URL,
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || null,
  NODE_ENV:        process.env.NODE_ENV || 'development',
  PORT:            parseInt(process.env.PORT, 10) || 5000,
};
