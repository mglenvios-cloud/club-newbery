'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const config = {
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'club-newbery-digital.appspot.com',
  };

  // Detect modes
  const hasEmulator = !!(
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.STORAGE_EMULATOR_HOST
  );

  if (hasEmulator) {
    if (!process.env.GCLOUD_PROJECT) {
      process.env.GCLOUD_PROJECT = 'club-newbery-digital';
    }
    config.projectId = process.env.GCLOUD_PROJECT;

    // Asegurar que STORAGE_EMULATOR_HOST tenga el prefijo http:// requerido por @google-cloud/storage
    if (process.env.STORAGE_EMULATOR_HOST && !process.env.STORAGE_EMULATOR_HOST.startsWith('http')) {
      process.env.STORAGE_EMULATOR_HOST = `http://${process.env.STORAGE_EMULATOR_HOST}`;
    }
  }

  admin.initializeApp(config);

  // LOG DE INICIALIZACIÓN
  const fsEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const authEmulator = !!process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const storageEmulator = !!process.env.STORAGE_EMULATOR_HOST;
  const hasProdCreds = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_STORAGE_BUCKET);

  let activeMode = 'OFFLINE';
  if (fsEmulator || authEmulator || storageEmulator) {
    activeMode = 'EMULATOR';
  } else if (hasProdCreds) {
    activeMode = 'PRODUCTION';
  }

  console.log('\n==================================================');
  console.log('LOG DE INICIALIZACIÓN DE FIREBASE');
  console.log('==================================================');
  console.log(`Modo activo:\n${activeMode}\n`);
  
  console.log('Firestore:');
  console.log(fsEmulator || (activeMode === 'PRODUCTION') ? 'OK' : 'OK (OFFLINE FALLBACK)');
  console.log('');

  console.log('Storage:');
  console.log(storageEmulator || (activeMode === 'PRODUCTION') ? 'OK' : 'OK (OFFLINE FALLBACK)');
  console.log('');

  console.log('Authentication:');
  console.log(authEmulator || (activeMode === 'PRODUCTION') ? 'OK' : 'OK (JWT LEGACY FALLBACK)');
  console.log('');

  console.log('Proyecto:');
  console.log(process.env.GCLOUD_PROJECT || 'club-newbery-digital');
  console.log('==================================================\n');
}

module.exports = admin;
