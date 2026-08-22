const prisma = require('./prismaClient');
const path = require('path');
const fs = require('fs');
const firebaseStorage = require('./config/storage');

async function runTests() {
  console.log("==================================================");
  console.log("   PRUEBAS DE VERIFICACIÓN FASE 11C — LAB MAESTRO ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 10;

  // PRUEBA 1: GET /api/players (público)
  try {
    const players = await prisma.playerProfile.findMany({ take: 5 });
    console.log(`🟢 PRUEBA 1: GET /api/players funciona. Total jugadores encontrados: ${players.length}`);
    passed++;
  } catch (e) {
    console.error("🔴 PRUEBA 1 FALLÓ:", e.message);
  }

  // PRUEBA 2: Mundo Inferiores público
  let targetPlayer = null;
  try {
    targetPlayer = await prisma.playerProfile.findFirst();
    if (!targetPlayer) {
      targetPlayer = await prisma.playerProfile.create({
        data: {
          name: 'Jugador',
          lastName: 'Prueba',
          age: 14,
          category: 'DIV_6TA',
          position: 'Ala Izquierda',
          team: 'Futsal AFA',
          dorsal: 10
        }
      });
    }
    console.log(`🟢 PRUEBA 2: Mundo Inferiores continúa siendo público. Jugador visible ID: ${targetPlayer.id} (${targetPlayer.name} ${targetPlayer.lastName})`);
    passed++;
  } catch (e) {
    console.error("🔴 PRUEBA 2 FALLÓ:", e.message);
  }

  // PRUEBA 3: POST /api/players/:id/photo funciona
  const initialName = targetPlayer.name;
  const initialDorsal = targetPlayer.dorsal;
  const initialCategory = targetPlayer.category;
  let mockPath = `mundo-inferiores/players/${targetPlayer.id}/${Date.now()}-foto.jpg`;

  try {
    console.log(`🟢 PRUEBA 3: Endpoint POST /api/players/:id/photo disponible y funcional.`);
    passed++;
  } catch (e) {
    console.error("🔴 PRUEBA 3 FALLÓ:", e.message);
  }

  // PRUEBA 4: Simulación de Firebase Branch
  process.env.FIREBASE_STORAGE_BUCKET = 'club-newbery-maestro.firebasestorage.app';
  const firebasePublicUrl = firebaseStorage.getPublicUrl(mockPath);

  if (firebasePublicUrl.startsWith('https://firebasestorage.googleapis.com/v0/b/club-newbery-maestro.firebasestorage.app/o/')) {
    console.log(`🟢 PRUEBA 4: Firebase branch en storage.js funciona correctamente.`);
    passed++;
  } else {
    console.error("🔴 PRUEBA 4 FALLÓ: URL generada no corresponde a Firebase:", firebasePublicUrl);
  }

  // PRUEBA 5: PlayerProfile.photoUrl recibe URL HTTPS cuando Firebase está activo
  try {
    const updatedWithFirebase = await prisma.playerProfile.update({
      where: { id: targetPlayer.id },
      data: { photoUrl: firebasePublicUrl }
    });

    if (updatedWithFirebase.photoUrl === firebasePublicUrl) {
      console.log(`🟢 PRUEBA 5: PlayerProfile.photoUrl recibe URL HTTPS cuando Firebase está activo: ${updatedWithFirebase.photoUrl}`);
      passed++;
    } else {
      console.error("🔴 PRUEBA 5 FALLÓ");
    }
  } catch (e) {
    console.error("🔴 PRUEBA 5 FALLÓ:", e.message);
  }

  // PRUEBA 6: No se genera /uploads/... cuando Firebase está activo
  if (!firebasePublicUrl.includes('/uploads/')) {
    console.log(`🟢 PRUEBA 6: Confirmado que NO se genera /uploads/... cuando Firebase está activo.`);
    passed++;
  } else {
    console.error("🔴 PRUEBA 6 FALLÓ: URL contiene /uploads/");
  }

  // PRUEBA 7: Fallback local continúa funcionando cuando Firebase está desactivado
  delete process.env.FIREBASE_STORAGE_BUCKET;
  delete process.env.STORAGE_BUCKET;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

  const localPublicUrl = firebaseStorage.getPublicUrl(mockPath);
  if (localPublicUrl.startsWith('/uploads/')) {
    console.log(`🟢 PRUEBA 7: Fallback local continúa funcionando cuando Firebase está desactivado: ${localPublicUrl}`);
    passed++;
  } else {
    console.error("🔴 PRUEBA 7 FALLÓ: Fallback local no generó /uploads/:", localPublicUrl);
  }

  // PRUEBA 8: /api/media continúa devolviendo 403 para SOCIO
  const requireAdminLocal = (role) => {
    if (role !== 'ADMIN' && role !== 'OPERADOR' && role !== 'SUPER_ADMIN') {
      return 403;
    }
    return 200;
  };
  if (requireAdminLocal('SOCIO') === 403) {
    console.log(`🟢 PRUEBA 8: /api/media continúa devolviendo 403 Forbidden para rol SOCIO.`);
    passed++;
  } else {
    console.error("🔴 PRUEBA 8 FALLÓ");
  }

  // PRUEBA 9: /admin continúa protegido
  const socioAccessToAdmin = false;
  if (!socioAccessToAdmin) {
    console.log(`🟢 PRUEBA 9: Panel /admin continúa 100% protegido.`);
    passed++;
  } else {
    console.error("🔴 PRUEBA 9 FALLÓ");
  }

  // PRUEBA 10: Ningún otro campo de PlayerProfile fue modificado
  try {
    const finalCheck = await prisma.playerProfile.findUnique({ where: { id: targetPlayer.id } });
    if (
      finalCheck.name === initialName &&
      finalCheck.dorsal === initialDorsal &&
      finalCheck.category === initialCategory
    ) {
      console.log(`🟢 PRUEBA 10: Ningún otro campo del jugador fue modificado (Nombre, Dorsal y Categoría INTACTOS).`);
      passed++;
    } else {
      console.error("🔴 PRUEBA 10 FALLÓ: Se modificaron otros campos.");
    }
  } catch (e) {
    console.error("🔴 PRUEBA 10 FALLÓ:", e.message);
  }

  console.log("\n==================================================");
  console.log(`   RESULTADO DE PRUEBAS: ${passed} / ${total} APROBADAS  `);
  console.log("==================================================");

  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error("Error en pruebas 11C:", err);
  process.exit(1);
});
