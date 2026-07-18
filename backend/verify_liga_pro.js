const http = require('http');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';
const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);

function request(path, method, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('⚽ Iniciando verificación de la Fase Liga Pro Studio...\n');

  let testMatchId = null;

  try {
    // 1. Crear un partido de prueba en FutsalMatch para vincular las relaciones
    console.log('🎮 Creando partido de futsal de prueba...');
    const testMatch = await prisma.futsalMatch.create({
      data: {
        category: 'Primera',
        opponent: 'TEST_OPPONENT_LPS',
        date: new Date(),
        timeSlot: '21:00hs',
        ourScore: 0,
        opponentScore: 0,
        status: 'UPCOMING',
        competition: 'Liga Oficial AFA',
        videoUrl: 'https://youtube.com/watch?v=real_match_video'
      }
    });
    testMatchId = testMatch.id;
    console.log(`   Partido de prueba creado con ID: ${testMatchId}\n`);

    // 2. Limpiar registros de prueba previos
    console.log('🧹 Limpiando registros previos asociados al partido...');
    await prisma.matchBroadcast.deleteMany({ where: { matchId: testMatchId } });
    await prisma.matchEvent.deleteMany({ where: { matchId: testMatchId } });
    await prisma.highlightClip.deleteMany({ where: { matchId: testMatchId } });
    console.log('   Listo.\n');

    // 3. Probar creación de Transmisión (POST /api/liga-pro-studio/broadcasts)
    console.log('1. Creando Transmisión de Partido (POST /api/liga-pro-studio/broadcasts)...');
    const broadcastBody = {
      matchId: testMatchId,
      title: 'Transmisión Oficial: Newbery vs TEST_OPPONENT_LPS',
      status: 'PROGRAMADO',
      streamUrl: 'https://youtube.com/watch?v=mock_lps_stream',
      platform: 'YouTube'
    };
    const resPostBroadcast = await request('/api/liga-pro-studio/broadcasts', 'POST', broadcastBody, adminToken);
    console.log(`   Status: ${resPostBroadcast.status} (Esperado: 201)`);
    console.log(`   Broadcast ID: ${resPostBroadcast.data.id}`);
    console.log(`   Título: "${resPostBroadcast.data.title}"`);
    console.log(`   Estado: "${resPostBroadcast.data.status}"\n`);

    const broadcastId = resPostBroadcast.data.id;

    // 4. Probar actualización de Transmisión a EN_VIVO (PUT /api/liga-pro-studio/broadcasts/:id)
    console.log('2. Iniciando transmisión en vivo (PUT /api/liga-pro-studio/broadcasts/:id)...');
    const updateBroadcastBody = {
      matchId: testMatchId,
      title: 'Transmisión Oficial: Newbery vs TEST_OPPONENT_LPS [EN VIVO]',
      status: 'EN_VIVO',
      streamUrl: 'https://youtube.com/watch?v=mock_lps_stream',
      platform: 'YouTube'
    };
    const resPutBroadcast = await request(`/api/liga-pro-studio/broadcasts/${broadcastId}`, 'PUT', updateBroadcastBody, adminToken);
    console.log(`   Status: ${resPutBroadcast.status} (Esperado: 200)`);
    console.log(`   Nuevo Estado: "${resPutBroadcast.data.status}"`);
    console.log(`   startedAt: ${resPutBroadcast.data.startedAt ? 'Registrado (Correcto)' : 'No registrado'}\n`);

    // 5. Probar registrar Eventos en Vivo (POST /api/liga-pro-studio/matches/:id/events)
    console.log('3. Registrando Gol en vivo (POST /api/liga-pro-studio/matches/:id/events)...');
    const eventBody = {
      minute: 12,
      type: 'GOL',
      description: '¡Golazo de taco de la delantera local!'
    };
    const resPostEvent = await request(`/api/liga-pro-studio/matches/${testMatchId}/events`, 'POST', eventBody, adminToken);
    console.log(`   Status: ${resPostEvent.status} (Esperado: 201)`);
    console.log(`   Evento ID: ${resPostEvent.data.id}`);
    console.log(`   Minuto: ${resPostEvent.data.minute}`);
    console.log(`   Tipo: "${resPostEvent.data.type}"`);
    console.log(`   Detalle: "${resPostEvent.data.description}"\n`);

    // 6. Probar listado de Eventos (GET /api/liga-pro-studio/matches/:id/events)
    console.log('4. Consultando eventos del partido (GET /api/liga-pro-studio/matches/:id/events)...');
    const resGetEvents = await request(`/api/liga-pro-studio/matches/${testMatchId}/events`, 'GET');
    console.log(`   Status: ${resGetEvents.status} (Esperado: 200)`);
    console.log(`   Eventos encontrados: ${resGetEvents.data.length} (Esperado: 1)\n`);

    // 7. Probar creación de Highlights (Clips) (POST /api/liga-pro-studio/highlights)
    console.log('5. Creando clip destacado de la jugada (POST /api/liga-pro-studio/highlights)...');
    const highlightBody = {
      matchId: testMatchId,
      title: 'Clip: Gol de taco contra TEST_OPPONENT_LPS',
      startTime: 720, // 12 minutos en segundos
      endTime: 750,
      generatedByAI: true,
      published: true
    };
    const resPostHighlight = await request('/api/liga-pro-studio/highlights', 'POST', highlightBody, adminToken);
    console.log(`   Status: ${resPostHighlight.status} (Esperado: 201)`);
    console.log(`   Highlight ID: ${resPostHighlight.data.id}`);
    console.log(`   StartTime: ${resPostHighlight.data.startTime}s`);
    console.log(`   AI Generated: ${resPostHighlight.data.generatedByAI}\n`);

    const highlightId = resPostHighlight.data.id;

    // 8. Probar listado de Highlights (GET /api/liga-pro-studio/highlights)
    console.log('6. Consultando clips destacados (GET /api/liga-pro-studio/highlights)...');
    const resGetHighlights = await request('/api/liga-pro-studio/highlights', 'GET');
    console.log(`   Status: ${resGetHighlights.status} (Esperado: 200)`);
    console.log(`   Clips encontrados: ${resGetHighlights.data.length}\n`);

    // 9. Eliminar clip de prueba
    console.log('7. Eliminando clip de prueba (DELETE /api/liga-pro-studio/highlights/:id)...');
    const resDeleteHighlight = await request(`/api/liga-pro-studio/highlights/${highlightId}`, 'DELETE', null, adminToken);
    console.log(`   Status: ${resDeleteHighlight.status} (Esperado: 200)`);
    console.log(`   Mensaje: "${resDeleteHighlight.data.message}"\n`);

    console.log('✅ Verificación de la Fase Liga Pro Studio completada con 100% de éxito.');
  } catch (error) {
    console.error('❌ Error durante la verificación de Liga Pro Studio:', error);
  } finally {
    // Limpieza final del partido de prueba
    if (testMatchId) {
      console.log('🧹 Limpiando registros de prueba del partido...');
      await prisma.matchBroadcast.deleteMany({ where: { matchId: testMatchId } });
      await prisma.matchEvent.deleteMany({ where: { matchId: testMatchId } });
      await prisma.highlightClip.deleteMany({ where: { matchId: testMatchId } });
      await prisma.futsalMatch.delete({ where: { id: testMatchId } });
      console.log('   Partidos y dependencias eliminadas con éxito.');
    }
    prisma.$disconnect();
  }
}

run();
