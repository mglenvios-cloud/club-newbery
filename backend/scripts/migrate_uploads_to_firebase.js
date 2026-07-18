#!/usr/bin/env node
/**
 * ─── Script de Migración: uploads/ → Firebase Storage ────────────────────────
 *
 * Este script migra todos los archivos existentes en backend/uploads/
 * hacia Firebase Storage, manteniendo la misma estructura de carpetas.
 *
 * USO:
 *   node backend/scripts/migrate_uploads_to_firebase.js
 *
 * PRE-REQUISITOS:
 *   1. FIREBASE_STORAGE_BUCKET configurado en .env
 *   2. GOOGLE_APPLICATION_CREDENTIALS apuntando al serviceAccount.json
 *   3. Archivos existentes en backend/uploads/
 *
 * EJECUTAR SOLO UNA VEZ antes de activar Firebase Storage en producción.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const admin = require('../config/firebase-admin');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

const FOLDER_MAPPING = {
  'banners':    'banners',
  'campañas':   'campanas',
  'documentos': 'documentos',
  'sponsors':   'sponsors',
  'videos':     'videos',
};

async function migrateFolder(localFolder, storageFolder) {
  const localPath = path.join(UPLOADS_DIR, localFolder);

  if (!fs.existsSync(localPath)) {
    console.log(`[SKIP] Carpeta no encontrada: ${localPath}`);
    return { skipped: 1, uploaded: 0, errors: 0 };
  }

  const files = fs.readdirSync(localPath).filter(f => !f.startsWith('.'));
  let uploaded = 0, errors = 0;

  for (const file of files) {
    const filePath = path.join(localPath, file);
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) continue;

    const destPath = `${storageFolder}/${file}`;

    try {
      const bucket = admin.storage().bucket();
      await bucket.upload(filePath, {
        destination: destPath,
        metadata: {
          metadata: { migratedFrom: `uploads/${localFolder}/${file}` }
        }
      });

      const sizeKB = (stat.size / 1024).toFixed(1);
      console.log(`  ✅ ${localFolder}/${file} → ${destPath} (${sizeKB} KB)`);
      uploaded++;
    } catch (err) {
      console.error(`  ❌ Error subiendo ${file}:`, err.message);
      errors++;
    }
  }

  return { skipped: 0, uploaded, errors };
}

async function main() {
  console.log('\n🚀 Iniciando migración uploads/ → Firebase Storage\n');
  console.log(`Bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
  console.log(`Directorio local: ${UPLOADS_DIR}\n`);

  let totalUploaded = 0, totalErrors = 0, totalSkipped = 0;

  for (const [localFolder, storageFolder] of Object.entries(FOLDER_MAPPING)) {
    console.log(`\n📁 Migrando ${localFolder}/ → ${storageFolder}/`);
    const result = await migrateFolder(localFolder, storageFolder);
    totalUploaded += result.uploaded;
    totalErrors += result.errors;
    totalSkipped += result.skipped;
  }

  console.log('\n─────────────────────────────────────');
  console.log(`✅ Subidos:   ${totalUploaded} archivos`);
  console.log(`❌ Errores:   ${totalErrors} archivos`);
  console.log(`⏭️  Omitidos:  ${totalSkipped} carpetas`);
  console.log('─────────────────────────────────────\n');

  if (totalErrors > 0) {
    console.log('⚠️  Algunos archivos no se pudieron subir. Revisar errores arriba.');
    process.exit(1);
  }

  console.log('✅ Migración completada exitosamente.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error fatal en la migración:', err);
  process.exit(1);
});
