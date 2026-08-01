const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.GCLOUD_PROJECT || 'club-newbery-digital',
      storageBucket: process.env.STORAGE_BUCKET || 'club-newbery-digital.appspot.com',
    });
  } catch (err) {
    console.warn('Firebase Admin fallback initialisation:', err.message);
  }
}

const db = (admin.apps && admin.apps.length && typeof admin.firestore === 'function') ? admin.firestore() : null;

admin.db = db;
admin.firestore = db;
admin.admin = admin;

module.exports = admin;
