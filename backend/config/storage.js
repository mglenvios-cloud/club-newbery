const path = require('path');

function buildStoragePath(category = 'documentos', originalName = 'file') {
  const safeCategory = (category || 'documentos').replace(/[^a-zA-Z0-9_-]/g, '');
  const timestamp = Date.now();
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeCategory}/${timestamp}-${baseName}${ext}`;
}

function getPublicUrl(storagePath) {
  if (!storagePath) return '';
  if (storagePath.startsWith('http')) return storagePath;

  const isFirebaseConfigured = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    process.env.FIREBASE_STORAGE_BUCKET || 
    process.env.STORAGE_BUCKET
  );

  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;

  if (isFirebaseConfigured) {
    const bucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'club-newbery-digital.appspot.com';
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(cleanPath)}?alt=media`;
  }

  return `/uploads/${cleanPath}`;
}

async function getSignedUrl(fileName) {
  return `http://localhost:5000/uploads/${fileName}`;
}

async function getUploadSignedUrl(fileName) {
  return `http://localhost:5000/uploads/${fileName}`;
}

async function getDownloadSignedUrl(fileName) {
  return `http://localhost:4000/uploads/${fileName}`;
}

module.exports = {
  buildStoragePath,
  getPublicUrl,
  getSignedUrl,
  getUploadSignedUrl,
  getDownloadSignedUrl,
};

