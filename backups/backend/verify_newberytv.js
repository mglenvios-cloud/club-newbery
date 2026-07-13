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
  console.log('🏁 INICIANDO VERIFICACIÓN DE NUEVO MÓDULO: NEWBERY TV...\n');
  let broadcastId, videoId;

  try {
    // 1. GET /api/newberytv/channel
    console.log('⏳ 1. Probando: Obtener Canal Oficial (GET /api/newberytv/channel)...');
    const resChannel = await request('/api/newberytv/channel', 'GET');
    if (resChannel.status === 200 && resChannel.data.name) {
      console.log(`  ✔ Éxito! Canal encontrado: ${resChannel.data.name}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resChannel.status}`, resChannel.data || resChannel.raw);
      process.exit(1);
    }

    // 2. POST /api/newberytv/channel
    console.log('\n⏳ 2. Probando: Modificar Configuración Canal (POST /api/newberytv/channel)...');
    const resUpdateChannel = await request('/api/newberytv/channel', 'POST', {
      name: "Newbery TV Pro",
      logoUrl: "/images/new_logo.png",
      bannerUrl: "/images/new_banner.png",
      description: "Canal premium del Club Jorge Newbery",
      email: "prensa@newbery.com"
    }, adminToken);
    
    if (resUpdateChannel.status === 200 && resUpdateChannel.data.name === 'Newbery TV Pro') {
      console.log('  ✔ Éxito! Canal configurado correctamente.');
    } else {
      console.log(`  ❌ Fallo. Status: ${resUpdateChannel.status}`, resUpdateChannel.data || resUpdateChannel.raw);
      process.exit(1);
    }

    // 3. POST /api/newberytv/livestreams
    console.log('\n⏳ 3. Probando: Crear Transmisión en Vivo (POST /api/newberytv/livestreams)...');
    const resCreateStream = await request('/api/newberytv/livestreams', 'POST', {
      title: "Gran Clásico: Newbery vs Franja de Oro",
      homeTeam: "Jorge Newbery",
      awayTeam: "Franja de Oro",
      competition: "Liga de Honor Futsal",
      season: "2026",
      court: "Microestadio Devoto",
      referee: "Horacio Elizondo",
      date: "2026-07-15",
      timeSlot: "21:00",
      resolution: "1080p",
      fps: 60,
      bitrate: "6000 Kbps"
    }, adminToken);

    if (resCreateStream.status === 201 && resCreateStream.data.id) {
      broadcastId = resCreateStream.data.id;
      console.log(`  ✔ Éxito! Transmisión programada con ID: ${broadcastId}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resCreateStream.status}`, resCreateStream.data || resCreateStream.raw);
      process.exit(1);
    }

    // 4. PUT /api/newberytv/livestreams/:id (Empezar Partido)
    console.log(`\n⏳ 4. Probando: Iniciar Transmisión / Actualizar Score (PUT /api/newberytv/livestreams/${broadcastId})...`);
    const resUpdateStream = await request(`/api/newberytv/livestreams/${broadcastId}`, 'PUT', {
      status: "EN_VIVO",
      foulsHome: 2,
      foulsAway: 1,
      audioStatus: "OK"
    }, adminToken);

    if (resUpdateStream.status === 200 && resUpdateStream.data.status === 'EN_VIVO') {
      console.log(`  ✔ Éxito! Transmisión iniciada correctamente.`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resUpdateStream.status}`, resUpdateStream.data || resUpdateStream.raw);
      process.exit(1);
    }

    // 5. POST /api/newberytv/livestreams/:id/events (Registrar Gol)
    console.log(`\n⏳ 5. Probando: Registrar Evento de Línea de Tiempo (POST /api/newberytv/livestreams/${broadcastId}/events)...`);
    const resCreateEvent = await request(`/api/newberytv/livestreams/${broadcastId}/events`, 'POST', {
      minute: 12,
      type: "GOL",
      team: "LOCAL",
      playerName: "Ariel Ortega",
      description: "¡Golazo espectacular al ángulo!"
    }, adminToken);

    if (resCreateEvent.status === 201 && resCreateEvent.data.id) {
      console.log(`  ✔ Éxito! Evento de GOL registrado al minuto ${resCreateEvent.data.minute}.`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resCreateEvent.status}`, resCreateEvent.data || resCreateEvent.raw);
      process.exit(1);
    }

    // 6. POST /api/newberytv/livestreams/:id/cameras (Toggle Cámara)
    console.log(`\n⏳ 6. Probando: Actualizar Estado de Cámara Lateral (POST /api/newberytv/livestreams/${broadcastId}/cameras)...`);
    const resCamera = await request(`/api/newberytv/livestreams/${broadcastId}/cameras`, 'POST', {
      name: "Cámara Lateral",
      status: "ACTIVE"
    }, adminToken);

    if (resCamera.status === 200 && resCamera.data.status === 'ACTIVE') {
      console.log('  ✔ Éxito! Cámara Lateral marcada como ACTIVE.');
    } else {
      console.log(`  ❌ Fallo. Status: ${resCamera.status}`, resCamera.data || resCamera.raw);
      process.exit(1);
    }

    // 7. POST /api/newberytv/livestreams/:id/replays (Marcar Repetición)
    console.log(`\n⏳ 7. Probando: Registrar Marcador de Repetición (POST /api/newberytv/livestreams/${broadcastId}/replays)...`);
    const resReplay = await request(`/api/newberytv/livestreams/${broadcastId}/replays`, 'POST', {
      minute: 15,
      title: "Remate al poste de Ortega",
      description: "Jugada muy veloz que pega en la base del palo derecho"
    }, adminToken);

    if (resReplay.status === 201 && resReplay.data.id) {
      console.log(`  ✔ Éxito! Repetición guardada con ID: ${resReplay.data.id}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resReplay.status}`, resReplay.data || resReplay.raw);
      process.exit(1);
    }

    // 8. POST /api/newberytv/videos (Agregar Video)
    console.log('\n⏳ 8. Probando: Subir Video a Biblioteca (POST /api/newberytv/videos)...');
    const resCreateVideo = await request('/api/newberytv/videos', 'POST', {
      title: "Resumen: Jorge Newbery vs Atlanta 2026",
      description: "Los goles y mejores jugadas del triunfo 3-1 en Devoto.",
      url: "https://youtube.com/watch?v=mock-vid-123",
      youtubeId: "mock-vid-123",
      category: "Resumenes",
      season: "2026",
      tournament: "Torneo de AFA Futsal",
      duration: "08:45",
      thumbnailUrl: "/uploads/thumbnails/mock-thumbnail.png"
    }, adminToken);

    if (resCreateVideo.status === 201 && resCreateVideo.data.id) {
      videoId = resCreateVideo.data.id;
      console.log(`  ✔ Éxito! Video registrado con ID: ${videoId}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resCreateVideo.status}`, resCreateVideo.data || resCreateVideo.raw);
      process.exit(1);
    }

    // 9. GET /api/newberytv/statistics (Consultar Estadísticas)
    console.log('\n⏳ 9. Probando: Consultar Estadísticas del Módulo (GET /api/newberytv/statistics)...');
    const resStats = await request('/api/newberytv/statistics', 'GET');
    if (resStats.status === 200 && resStats.data.viewerRetention) {
      console.log('  ✔ Éxito! Estadísticas recuperadas correctamente.');
      console.log(`    Total Videos: ${resStats.data.summary.totalVideos}`);
      console.log(`    Espectadores en Arg: ${resStats.data.geographicRetention[0].viewers}%`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resStats.status}`, resStats.data || resStats.raw);
      process.exit(1);
    }

    // Limpieza
    console.log('\n🧹 Limpiando base de datos de pruebas...');
    const broadcast = await prisma.matchBroadcast.findUnique({
      where: { id: broadcastId }
    });
    
    await prisma.cameraStatus.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.replayMarker.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.streamEvent.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.broadcastSponsor.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.matchBroadcast.delete({ where: { id: broadcastId } });
    if (broadcast.liveStreamId) {
      await prisma.liveStream.delete({ where: { id: broadcast.liveStreamId } });
    }
    await prisma.video.delete({ where: { id: videoId } });
    console.log('  ✔ Base de datos de pruebas limpiada.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS FUE APROBADAS SATISFACTORIAMENTE! Módulo NEWBERY TV Backend operativo.');
  } catch (error) {
    console.error('❌ Error fatal en ejecución de verificación:', error);
  } finally {
    prisma.$disconnect();
  }
}

run();
