'use strict';

/**
 * ─── Firebase Storage Helper ──────────────────────────────────────────────────
 *
 * Provee funciones para:
 *  - Generar Signed URLs de escritura (el cliente sube directamente a Storage)
 *  - Generar Signed URLs de lectura (para archivos privados)
 *  - Eliminar archivos de Storage
 *  - Construir la URL pública de un archivo
 *
 * VENTAJA vs Multer + disco local:
 *  - Sin límite de disco en el servidor
 *  - Funciona en Cloud Functions (filesystem efímero)
 *  - Archivos de hasta 500 MB sin pasar por el servidor
 */

const path = require('path');
const fs = require('fs');

let admin = null;
let bucket = null;
let storageMode = 'LOCAL';

const hasEmulator = !!process.env.STORAGE_EMULATOR_HOST;
const hasProduction = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_STORAGE_BUCKET);

if (hasEmulator) {
  try {
    admin = require('./firebase-admin');
    bucket = admin.storage().bucket();
    storageMode = 'EMULATOR';
    console.log('[Storage] Modo 1 activo: Configurado en Storage Emulator');
  } catch (e) {
    console.warn('[Storage] Error al inicializar Storage Emulator, usando local fallback:', e.message);
    storageMode = 'LOCAL';
  }
} else if (hasProduction) {
  try {
    admin = require('./firebase-admin');
    bucket = admin.storage().bucket();
    storageMode = 'PRODUCTION';
    console.log('[Storage] Modo 2 activo: Configurado en Firebase Storage (Producción)');
  } catch (e) {
    console.warn('[Storage] Error al inicializar Firebase Storage, usando local fallback:', e.message);
    storageMode = 'LOCAL';
  }
} else {
  storageMode = 'LOCAL';
  console.log('[Storage] Modo 3 activo: Desarrollo Offline (uploads/)');
}

/**
 * Mapeo de categorías a carpetas de Storage.
 * Mantiene la misma estructura que los uploads locales.
 */
const CATEGORY_FOLDERS = {
  socios:      'socios',
  sponsors:    'sponsors',
  marketing:   'campanas',
  banners:     'banners',
  campanas:    'campanas',
  galeria:     'media',
  noticias:    'media',
  documentos:  'documentos',
  videos:      'videos',
  'newbery-tv':'videos',
  reservas:    'media',
  multimedia:  'media',
  default:     'media',
};

/**
 * Genera un nombre de archivo único, igual al patrón actual de Multer.
 * @param {string} category
 * @param {string} originalName
 * @returns {string} storagePath - ej: "media/media-foto-1720000000-123456.jpg"
 */
function buildStoragePath(category, originalName) {
  const folder = CATEGORY_FOLDERS[category] || CATEGORY_FOLDERS.default;
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 40);
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const filename = `${category}-${base}-${timestamp}-${random}${ext}`;
  return `${folder}/${filename}`;
}

/**
 * Genera una Signed URL de escritura para que el cliente suba directamente.
 * El cliente hace PUT a esta URL con el archivo en el body.
 *
 * @param {string} category - Categoría del archivo (media, videos, etc.)
 * @param {string} originalName - Nombre original del archivo
 * @param {string} mimeType - MIME type del archivo
 * @param {number} [expiresInMinutes=15] - Minutos de validez de la URL
 * @returns {Promise<{uploadUrl: string, fileUrl: string, storagePath: string}>}
 */
async function getUploadSignedUrl(category, originalName, mimeType, expiresInMinutes = 15) {
  const storagePath = buildStoragePath(category, originalName);

  if (storageMode === 'EMULATOR') {
    const bucketName = bucket ? bucket.name : (process.env.FIREBASE_STORAGE_BUCKET || 'club-newbery-digital.appspot.com');
    const host = process.env.STORAGE_EMULATOR_HOST;
    const cleanHost = host.startsWith('http') ? host : `http://${host}`;
    const uploadUrl = `${cleanHost}/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}`;
    const fileUrl = `${cleanHost}/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`;
    return { uploadUrl, fileUrl, storagePath };
  } else if (storageMode === 'PRODUCTION') {
    const file = bucket.file(storagePath);
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
      contentType: mimeType,
    });
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    return { uploadUrl, fileUrl, storagePath };
  } else {
    // LOCAL fallback
    const uploadUrl = `http://localhost:5000/api/media/upload-mock-local?path=${encodeURIComponent(storagePath)}`;
    const fileUrl = `/uploads/${storagePath}`;
    return { uploadUrl, fileUrl, storagePath };
  }
}

/**
 * Genera una Signed URL de lectura para archivos privados.
 *
 * @param {string} storagePath - Path del archivo en Storage
 * @param {number} [expiresInMinutes=60]
 * @returns {Promise<string>} URL de lectura temporal
 */
async function getDownloadSignedUrl(storagePath, expiresInMinutes = 60) {
  if (storageMode === 'EMULATOR') {
    const bucketName = bucket ? bucket.name : (process.env.FIREBASE_STORAGE_BUCKET || 'club-newbery-digital.appspot.com');
    const host = process.env.STORAGE_EMULATOR_HOST;
    const cleanHost = host.startsWith('http') ? host : `http://${host}`;
    return `${cleanHost}/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`;
  } else if (storageMode === 'PRODUCTION') {
    const file = bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
    return url;
  } else {
    // LOCAL fallback
    return `/uploads/${storagePath}`;
  }
}

/**
 * Elimina un archivo de Firebase Storage.
 * No lanza error si el archivo no existe.
 *
 * @param {string} storagePath - Path del archivo o URL pública completa
 */
async function deleteFile(storagePath) {
  try {
    let filePath = storagePath;
    const bucketName = bucket ? bucket.name : (process.env.FIREBASE_STORAGE_BUCKET || 'club-newbery-digital.appspot.com');

    // Parse URL if needed
    if (storagePath.startsWith('http')) {
      const url = new URL(storagePath);
      if (url.pathname.includes('/o/')) {
        const parts = url.pathname.split('/o/');
        filePath = decodeURIComponent(parts[1].split('?')[0]);
      } else if (url.pathname.startsWith(`/${bucketName}/`)) {
        filePath = decodeURIComponent(url.pathname.replace(`/${bucketName}/`, ''));
      }
    }

    if (storageMode === 'LOCAL' || filePath.startsWith('/uploads/') || !filePath.includes('/')) {
      let localPath = filePath;
      if (filePath.startsWith('/uploads/')) {
        localPath = filePath.replace('/uploads/', '');
      }
      const absoluteLocalPath = path.join(__dirname, '../uploads', localPath);
      if (fs.existsSync(absoluteLocalPath)) {
        fs.unlinkSync(absoluteLocalPath);
      }
    } else {
      if (bucket) {
        await bucket.file(filePath).delete({ ignoreNotFound: true });
      }
    }
  } catch (err) {
    console.warn('[Storage] Error eliminando archivo:', storagePath, err.message);
  }
}

/**
 * Construye la URL pública de un archivo en Storage.
 * Solo funciona para archivos en carpetas con acceso público en las rules.
 *
 * @param {string} storagePath
 * @returns {string}
 */
function getPublicUrl(storagePath) {
  if (storageMode === 'EMULATOR') {
    const bucketName = bucket ? bucket.name : (process.env.FIREBASE_STORAGE_BUCKET || 'club-newbery-digital.appspot.com');
    const host = process.env.STORAGE_EMULATOR_HOST;
    const cleanHost = host.startsWith('http') ? host : `http://${host}`;
    return `${cleanHost}/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`;
  } else if (storageMode === 'PRODUCTION') {
    return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  } else {
    return `/uploads/${storagePath}`;
  }
}

module.exports = {
  getUploadSignedUrl,
  getDownloadSignedUrl,
  deleteFile,
  getPublicUrl,
  buildStoragePath,
  CATEGORY_FOLDERS,
};
