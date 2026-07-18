'use strict';

const prisma = require('./prismaClient');

async function testFirestore() {
  console.log('🔥 [Test Firestore] Iniciando pruebas de base de datos...');
  
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`🔥 [Test Firestore] Detectada variable FIRESTORE_EMULATOR_HOST=${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log('🔥 [Test Firestore] Ejecutando en modo NO emulador.');
  }

  const testTitle = `TEST_FIRESTORE_CRUD_${Date.now()}`;
  
  try {
    // 1. CREATE
    console.log('   - Creando registro de prueba...');
    const created = await prisma.futsalMedia.create({
      data: {
        type: 'VIDEO',
        title: testTitle,
        url: 'https://www.youtube.com/watch?v=test_crud',
        category: 'Goles',
        description: 'Prueba de CRUD en Firestore',
        season: '2026',
        competition: 'Pruebas',
        published: true,
        visibility: 'PUBLIC',
        featured: false
      }
    });
    
    console.log(`   - Registro creado exitosamente. ID: ${created.id}`);
    
    // 2. READ
    console.log('   - Buscando el registro creado...');
    const found = await prisma.futsalMedia.findUnique({
      where: { id: created.id }
    });
    
    if (!found || found.title !== testTitle) {
      throw new Error(`El registro encontrado no coincide o no existe. Encontrado: ${JSON.stringify(found)}`);
    }
    console.log('   - Registro encontrado y coincide correctamente.');

    // 3. UPDATE
    console.log('   - Actualizando el registro...');
    const updated = await prisma.futsalMedia.update({
      where: { id: created.id },
      data: {
        description: 'Prueba de CRUD en Firestore (Actualizado)',
        views: { increment: 5 }
      }
    });
    
    console.log(`   - Registro actualizado. Nueva descripción: "${updated.description}"`);

    // 4. DELETE
    console.log('   - Eliminando el registro...');
    await prisma.futsalMedia.delete({
      where: { id: created.id }
    });
    
    // Verificar eliminación
    const checkDeleted = await prisma.futsalMedia.findUnique({
      where: { id: created.id }
    });
    
    if (checkDeleted) {
      throw new Error('El registro no fue eliminado correctamente.');
    }
    console.log('   - Registro eliminado exitosamente.');
    console.log('✅ [Test Firestore] Pruebas de Firestore CRUD finalizadas con 100% de ÉXITO.\n');
    return { status: 'OK', error: null };
  } catch (error) {
    console.error('❌ [Test Firestore] Fallo en pruebas de Firestore:', error.message);
    return { status: 'FAIL', error: error.message };
  }
}

if (require.main === module) {
  testFirestore().then(() => prisma.$disconnect());
}

module.exports = testFirestore;
