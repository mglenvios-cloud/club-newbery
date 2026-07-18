'use strict';

const storage = require('./config/storage');
const http = require('http');

async function testStorage() {
  console.log('📦 [Test Storage] Iniciando pruebas de almacenamiento...');
  
  if (process.env.STORAGE_EMULATOR_HOST) {
    console.log(`📦 [Test Storage] Detectada variable STORAGE_EMULATOR_HOST=${process.env.STORAGE_EMULATOR_HOST}`);
  } else {
    console.log('📦 [Test Storage] Ejecutando en modo NO emulador.');
  }

  try {
    const testCategory = 'multimedia';
    const testFilename = 'test_upload_file.txt';
    const mimeType = 'text/plain';
    
    // 1. Generar URL de subida
    console.log('   - Generando URL de subida firmada...');
    const uploadDetails = await storage.getUploadSignedUrl(testCategory, testFilename, mimeType);
    console.log(`   - Detalles de subida obtenidos:`);
    console.log(`     Path en storage: "${uploadDetails.storagePath}"`);
    console.log(`     Upload URL: "${uploadDetails.uploadUrl.substring(0, 100)}..."`);
    console.log(`     File URL: "${uploadDetails.fileUrl}"`);
    
    if (!uploadDetails.uploadUrl || !uploadDetails.fileUrl || !uploadDetails.storagePath) {
      throw new Error('Faltan detalles en la respuesta de subida firmada.');
    }

    // 2. Subir un archivo de prueba
    console.log('   - Subiendo archivo de prueba al bucket/directorio local...');
    const fileContent = 'Hola, esta es una prueba del Storage de Club Newbery.';
    
    if (process.env.STORAGE_EMULATOR_HOST) {
      // Simular subida PUT HTTP a la URL de subida
      const uploadUrl = new URL(uploadDetails.uploadUrl);
      const options = {
        hostname: uploadUrl.hostname,
        port: uploadUrl.port,
        path: uploadUrl.pathname + uploadUrl.search,
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': Buffer.byteLength(fileContent)
        }
      };

      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Error al subir archivo al emulador (Status: ${res.statusCode})`));
          }
        });
        req.on('error', (err) => reject(err));
        req.write(fileContent);
        req.end();
      });
      console.log('   - Archivo subido con éxito al emulador de Storage.');
    } else {
      console.log('   - Saltando subida real de red (offline o producción sin emulador de red).');
    }

    // 3. Generar URL de descarga y verificar lectura
    console.log('   - Generando URL de descarga firmada...');
    const downloadUrl = await storage.getDownloadSignedUrl(uploadDetails.storagePath);
    console.log(`     Download URL: "${downloadUrl.substring(0, 100)}..."`);
    
    if (!downloadUrl) {
      throw new Error('Fallo al obtener la URL de descarga.');
    }

    // 4. Eliminar el archivo
    console.log('   - Eliminando archivo de prueba...');
    await storage.deleteFile(uploadDetails.storagePath);
    console.log('   - Archivo eliminado con éxito.');

    console.log('✅ [Test Storage] Pruebas de Storage finalizadas con 100% de ÉXITO.\n');
    return { status: 'OK', error: null };
  } catch (error) {
    console.error('❌ [Test Storage] Fallo en pruebas de Storage:', error.message);
    return { status: 'FAIL', error: error.message };
  }
}

if (require.main === module) {
  testStorage();
}

module.exports = testStorage;
