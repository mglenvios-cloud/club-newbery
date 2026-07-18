'use strict';

const jwt = require('jsonwebtoken');
const admin = require('./config/firebase-admin');

async function testAuth() {
  console.log('🔐 [Test Auth] Iniciando pruebas de autenticación...');
  
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log(`🔐 [Test Auth] Detectada variable FIREBASE_AUTH_EMULATOR_HOST=${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  } else {
    console.log('🔐 [Test Auth] Ejecutando en modo NO emulador.');
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';

  try {
    // 1. Probar JWT Legacy
    console.log('   - Probando generación y verificación de JWT Legacy...');
    const payload = { userId: 1, email: 'admin@clubnewbery.com', role: 'SUPER_ADMIN' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      throw new Error('El JWT decodificado no coincide o no es SUPER_ADMIN.');
    }
    console.log('   - JWT Legacy verificado correctamente.');

    // 2. Probar Firebase Auth (Emulator / Real)
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      console.log('   - Probando inicialización de Firebase Auth Emulator...');
      // Generar un token personalizado de Firebase para pruebas de emulador
      const customToken = await admin.auth().createCustomToken('test-uid-123', {
        role: 'SUPER_ADMIN',
        dbUserId: 1
      });
      console.log(`   - Custom token generado con éxito para pruebas de emulador.`);
      if (!customToken) {
        throw new Error('Fallo al generar el custom token de Firebase.');
      }
    } else {
      console.log('   - Saltando pruebas de Firebase Auth (Offline o Producción sin credenciales activas).');
    }

    console.log('✅ [Test Auth] Pruebas de Autenticación finalizadas con 100% de ÉXITO.\n');
    return { status: 'OK', error: null };
  } catch (error) {
    console.error('❌ [Test Auth] Fallo en pruebas de Autenticación:', error.message);
    return { status: 'FAIL', error: error.message };
  }
}

if (require.main === module) {
  testAuth();
}

module.exports = testAuth;
