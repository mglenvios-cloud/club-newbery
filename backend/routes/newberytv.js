const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const router = express.Router();

// Configuración de Multer para videos físicos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    
    const timestamp = Math.floor(Date.now() / 1000);
    const uuid = Math.floor(Math.random() * 1000000);
    const newName = `video-${baseName}-${timestamp}-${uuid}${ext}`;
    cb(null, newName);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

const { JWT_SECRET } = require('../config/env');

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Optional JWT authentication (doesn't block if token is missing/invalid)
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// 1 & 2. DASHBOARD & CHANNEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/newberytv/channel
router.get('/channel', async (req, res) => {
  try {
    let channel = await prisma.channel.findFirst();
    if (!channel) {
      // Create a default initial channel
      channel = await prisma.channel.create({
        data: {
          name: "Jorge Newbery TV",
          logoUrl: "/images/logo.png",
          bannerUrl: "/images/banner.png",
          description: "Canal oficial del Club Atlético Jorge Newbery. Transmisiones de partidos, entrevistas, inferiores e históricos.",
          website: "https://clubjorgenewbery.com.ar",
          email: "prensa@clubjorgenewbery.com.ar",
          facebook: "ClubJorgeNewberyOficial",
          instagram: "clubjorgenewbery",
          twitter: "NewberyOficial",
          youtubeUrl: "https://youtube.com/c/ClubJorgeNewberyTV",
          subscribers: 2450,
          views: 18900,
          watchHours: 320.5,
          status: "ACTIVE"
        }
      });
    }
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración del canal.' });
  }
});

// POST /api/newberytv/channel (Admin only)
router.post('/channel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    let channel = await prisma.channel.findFirst();
    if (channel) {
      channel = await prisma.channel.update({
        where: { id: channel.id },
        data: {
          name: data.name,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          description: data.description,
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          youtubeUrl: data.youtubeUrl,
          website: data.website,
          email: data.email,
          status: data.status || "ACTIVE"
        }
      });
    } else {
      channel = await prisma.channel.create({
        data: {
          name: data.name || "Jorge Newbery TV",
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          description: data.description,
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          youtubeUrl: data.youtubeUrl,
          website: data.website,
          email: data.email,
          subscribers: 0,
          views: 0,
          watchHours: 0,
          status: data.status || "ACTIVE"
        }
      });
    }
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la configuración del canal.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 3 & 4. YouTube API Integration & Livestreams
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/newberytv/livestreams
router.get('/livestreams', async (req, res) => {
  try {
    const broadcasts = await prisma.matchBroadcast.findMany({
      include: {
        liveStream: true,
        events: true,
        sponsors: true,
        cameraStatuses: true,
        replayMarkers: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar las transmisiones.' });
  }
});

// POST /api/newberytv/livestreams (Admin only)
router.post('/livestreams', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    
    // Create linked LiveStream record
    const stream = await prisma.liveStream.create({
      data: {
        title: data.title || `Transmisión: ${data.homeTeam} vs ${data.awayTeam}`,
        description: data.description || `Transmisión oficial del encuentro.`,
        youtubeId: data.youtubeId || `yt-stream-${Math.floor(Math.random() * 1000000)}`,
        rtmpUrl: data.rtmpUrl || "rtmp://a.rtmp.youtube.com/live2",
        streamKey: data.streamKey || `jn-key-${Math.floor(Math.random() * 90000) + 10000}`,
        status: data.status || "UPCOMING",
        bitrate: data.bitrate || "4500 Kbps",
        resolution: data.resolution || "1080p",
        fps: data.fps ? parseInt(data.fps) : 60
      }
    });

    // Create MatchBroadcast with scoreboard fields and linked LiveStream
    const broadcast = await prisma.matchBroadcast.create({
      data: {
        matchId: data.matchId ? parseInt(data.matchId) : 0,
        title: data.title,
        status: data.status || "PROGRAMADO",
        streamUrl: data.streamUrl || `https://youtube.com/live/${stream.youtubeId}`,
        platform: data.platform || "YOUTUBE",
        competition: data.competition || "Torneo Oficial",
        season: data.season || "2026",
        date: data.date ? new Date(data.date) : new Date(),
        timeSlot: data.timeSlot || "19:00",
        homeTeam: data.homeTeam || "Jorge Newbery",
        awayTeam: data.awayTeam || "Rival",
        court: data.court || "Microestadio Parquet",
        referee: data.referee || "A designar",
        addedTime: 0,
        foulsHome: 0,
        foulsAway: 0,
        cardsYellowHome: 0,
        cardsYellowAway: 0,
        cardsRedHome: 0,
        cardsRedAway: 0,
        scorers: "[]",
        audioStatus: "OK",
        liveStreamId: stream.id
      },
      include: {
        liveStream: true
      }
    });

    // Create default CameraStatus entries for this broadcast
    const cameras = ["Cámara Principal", "Cámara Lateral", "Cámara Arco Norte", "Cámara Arco Sur", "Cámara Móvil"];
    for (let index = 0; index < cameras.length; index++) {
      await prisma.cameraStatus.create({
        data: {
          matchBroadcastId: broadcast.id,
          name: cameras[index],
          status: index === 0 ? "ACTIVE" : "OFFLINE"
        }
      });
    }

    // Connect sponsors to the broadcast automatically (pre-populate with some sponsors if any exist)
    const activeSponsors = await prisma.sponsor.findMany({ where: { isActive: true } });
    for (const sponsor of activeSponsors) {
      await prisma.broadcastSponsor.create({
        data: {
          matchBroadcastId: broadcast.id,
          sponsorId: sponsor.id,
          sponsorName: sponsor.name,
          logoUrl: sponsor.logoUrl || sponsor.imageUrl,
          linkUrl: sponsor.website || "#",
          position: "PREVIA"
        }
      });
    }

    res.status(201).json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Error al programar la transmisión.' });
  }
});

// PUT /api/newberytv/livestreams/:id (Admin only)
router.put('/livestreams/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const data = req.body;
    const broadcastId = parseInt(id);

    // Get current broadcast to update its associated LiveStream
    const current = await prisma.matchBroadcast.findUnique({
      where: { id: broadcastId },
      include: { liveStream: true }
    });

    if (!current) {
      return res.status(404).json({ error: 'Transmisión no encontrada.' });
    }

    // Map status updates from MatchBroadcast to LiveStream
    let liveStatus = undefined;
    if (data.status === 'EN_VIVO') liveStatus = 'LIVE';
    if (data.status === 'FINALIZADO') liveStatus = 'COMPLETED';
    if (data.status === 'PROGRAMADO') liveStatus = 'UPCOMING';

    // Update LiveStream if exists
    if (current.liveStreamId) {
      await prisma.liveStream.update({
        where: { id: current.liveStreamId },
        data: {
          title: data.title,
          status: liveStatus,
          rtmpUrl: data.rtmpUrl,
          streamKey: data.streamKey,
          bitrate: data.bitrate,
          resolution: data.resolution,
          fps: data.fps ? parseInt(data.fps) : undefined
        }
      });
    }

    // Update MatchBroadcast
    const updated = await prisma.matchBroadcast.update({
      where: { id: broadcastId },
      data: {
        title: data.title,
        status: data.status,
        streamUrl: data.streamUrl,
        platform: data.platform,
        competition: data.competition,
        season: data.season,
        date: data.date ? new Date(data.date) : undefined,
        timeSlot: data.timeSlot,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        court: data.court,
        referee: data.referee,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        finishedAt: data.finishedAt ? new Date(data.finishedAt) : undefined,
        addedTime: data.addedTime !== undefined ? parseInt(data.addedTime) : undefined,
        foulsHome: data.foulsHome !== undefined ? parseInt(data.foulsHome) : undefined,
        foulsAway: data.foulsAway !== undefined ? parseInt(data.foulsAway) : undefined,
        cardsYellowHome: data.cardsYellowHome !== undefined ? parseInt(data.cardsYellowHome) : undefined,
        cardsYellowAway: data.cardsYellowAway !== undefined ? parseInt(data.cardsYellowAway) : undefined,
        cardsRedHome: data.cardsRedHome !== undefined ? parseInt(data.cardsRedHome) : undefined,
        cardsRedAway: data.cardsRedAway !== undefined ? parseInt(data.cardsRedAway) : undefined,
        scorers: data.scorers !== undefined ? (typeof data.scorers === 'string' ? data.scorers : JSON.stringify(data.scorers)) : undefined,
        audioStatus: data.audioStatus
      },
      include: {
        liveStream: true,
        events: true,
        sponsors: true,
        cameraStatuses: true,
        replayMarkers: true
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la transmisión.' });
  }
});

// DELETE /api/newberytv/livestreams/:id (Admin only)
router.delete('/livestreams/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const broadcastId = parseInt(id);
    const broadcast = await prisma.matchBroadcast.findUnique({
      where: { id: broadcastId }
    });

    if (!broadcast) {
      return res.status(404).json({ error: 'Transmisión no encontrada.' });
    }

    // Cascade delete manual: eliminar relaciones antes de borrar el broadcast
    await prisma.cameraStatus.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.replayMarker.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.streamEvent.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.streamStatistic.deleteMany({ where: { matchBroadcastId: broadcastId } });
    await prisma.broadcastSponsor.deleteMany({ where: { matchBroadcastId: broadcastId } });

    await prisma.matchBroadcast.delete({ where: { id: broadcastId } });

    if (broadcast.liveStreamId) {
      await prisma.liveStream.delete({ where: { id: broadcast.liveStreamId } }).catch(() => {});
    }

    res.json({ message: 'Transmisión eliminada correctamente.' });
  } catch (error) {
    res.status(550).json({ error: 'Error al eliminar la transmisión.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 5 & 6. Live Match events & OBS / Multi-camera updates
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/newberytv/livestreams/:id/events
router.get('/livestreams/:id/events', async (req, res) => {
  const { id } = req.params;
  try {
    const list = await prisma.streamEvent.findMany({
      where: { matchBroadcastId: parseInt(id) },
      orderBy: { minute: 'asc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los eventos de la transmisión.' });
  }
});

// POST /api/newberytv/livestreams/:id/events (Admin only)
router.post('/livestreams/:id/events', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const data = req.body;
    const matchBroadcastId = parseInt(id);

    const event = await prisma.streamEvent.create({
      data: {
        matchBroadcastId: matchBroadcastId,
        minute: parseInt(data.minute),
        type: data.type, // GOL, TARJETA_AMARILLA, TARJETA_ROJA, PENAL, CAMBIO, LESION, TIEMPO_MUERTO, INICIO, ENTRETIEMPO, SEGUNDO_TIEMPO, FINAL
        description: data.description,
        team: data.team,
        playerName: data.playerName,
        detail: data.detail
      }
    });

    // Automatically update the scorecard metrics if it's a Goal, Card, or Foul!
    const broadcast = await prisma.matchBroadcast.findUnique({
      where: { id: matchBroadcastId }
    });

    if (broadcast) {
      const updateData = {};
      const typeUpper = data.type.toUpperCase();

      if (typeUpper === 'GOL') {
        // If Gol, add to scorer list and score
        let currentScorers = [];
        try {
          currentScorers = JSON.parse(broadcast.scorers || '[]');
        } catch {
          currentScorers = [];
        }
        currentScorers.push({
          minute: parseInt(data.minute),
          playerName: data.playerName || 'Desconocido',
          team: data.team || 'LOCAL'
        });
        updateData.scorers = JSON.stringify(currentScorers);
      } else if (typeUpper === 'TARJETA_AMARILLA') {
        if (data.team === 'LOCAL') {
          updateData.cardsYellowHome = broadcast.cardsYellowHome + 1;
        } else {
          updateData.cardsYellowAway = broadcast.cardsYellowAway + 1;
        }
      } else if (typeUpper === 'TARJETA_ROJA') {
        if (data.team === 'LOCAL') {
          updateData.cardsRedHome = broadcast.cardsRedHome + 1;
        } else {
          updateData.cardsRedAway = broadcast.cardsRedAway + 1;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.matchBroadcast.update({
          where: { id: matchBroadcastId },
          data: updateData
        });
      }
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el evento.' });
  }
});

// POST /api/newberytv/livestreams/:id/cameras (Admin only)
router.post('/livestreams/:id/cameras', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { name, status } = req.body;
    const matchBroadcastId = parseInt(id);

    const camera = await prisma.cameraStatus.findFirst({
      where: {
        matchBroadcastId: matchBroadcastId,
        name: name
      }
    });

    let updated;
    if (camera) {
      updated = await prisma.cameraStatus.update({
        where: { id: camera.id },
        data: { status }
      });
    } else {
      updated = await prisma.cameraStatus.create({
        data: {
          matchBroadcastId,
          name,
          status
        }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(550).json({ error: 'Error al actualizar el estado de la cámara.' });
  }
});

// GET /api/newberytv/livestreams/:id/replays
router.get('/livestreams/:id/replays', async (req, res) => {
  const { id } = req.params;
  try {
    const list = await prisma.replayMarker.findMany({
      where: { matchBroadcastId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcadores de repetición.' });
  }
});

// POST /api/newberytv/livestreams/:id/replays (Admin only)
router.post('/livestreams/:id/replays', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { minute, title, description } = req.body;
    const marker = await prisma.replayMarker.create({
      data: {
        matchBroadcastId: parseInt(id),
        minute: parseInt(minute),
        title,
        description,
        processed: false
      }
    });
    res.status(201).json(marker);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar repetición.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 7 & 8. Multimedia Library & Videos
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/newberytv/videos
router.get('/videos', async (req, res) => {
  try {
    const { season, category, tournament, search, folder } = req.query;

    const where = {};
    if (season && season !== 'ALL') where.season = season;
    if (category && category !== 'ALL') where.category = category;
    if (folder && folder !== 'ALL') where.folder = folder;
    if (tournament && tournament !== '') {
      where.tournament = { contains: tournament };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: { playlist: true }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar videos.' });
  }
});

// POST /api/newberytv/videos/upload (Physical upload)
router.post('/videos/upload', authenticateToken, videoUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo de video.' });
    }

    const {
      title, description, category, season, tournament, team, folder, duration, durationSeconds
    } = req.body;

    const fileUrl = `/uploads/videos/${req.file.filename}`;

    const video = await prisma.video.create({
      data: {
        title: title || req.file.originalname,
        description: description || null,
        url: fileUrl,
        youtubeId: null,
        thumbnailUrl: '/images/default-video.png',
        duration: duration || '0:00',
        durationSeconds: durationSeconds ? parseFloat(durationSeconds) : 0,
        size: req.file.size,
        category: category || 'Partidos',
        folder: folder || '',
        team: team || '',
        season: season || '2026',
        tournament: tournament || 'AFA Futsal',
        views: 0,
        likes: 0
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Error al subir video:', error);
    res.status(500).json({ error: 'Error al procesar la subida del video.' });
  }
});

// POST /api/newberytv/videos (Legacy compat - Admin only)
router.post('/videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        youtubeId: data.youtubeId || null,
        thumbnailUrl: data.thumbnailUrl || '/images/default-video.png',
        duration: data.duration || '0:00',
        durationSeconds: data.durationSeconds ? parseFloat(data.durationSeconds) : 0,
        size: data.size || 0,
        category: data.category || 'Varios',
        folder: data.folder || '',
        team: data.team || '',
        season: data.season || '2026',
        tournament: data.tournament || 'Campeonato local',
        views: 0,
        likes: 0
      }
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: 'Error al subir el video.' });
  }
});

// DELETE /api/newberytv/videos/:id (Admin only)
router.delete('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(id) }
    });
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado.' });
    }

    if (video.url && video.url.startsWith('/uploads/videos/')) {
      const filepath = path.join(__dirname, '..', video.url);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await prisma.video.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Video eliminado con éxito de la biblioteca.' });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({ error: 'Error al eliminar el video.' });
  }
});

// GET /api/newberytv/playlists
router.get('/playlists', async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { videos: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener listas de reproducción:', error);
    res.status(500).json({ error: 'Error al obtener listas de reproducción.' });
  }
});

// POST /api/newberytv/playlists (Admin only)
router.post('/playlists', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'El título es obligatorio.' });

  try {
    const playlist = await prisma.playlist.create({
      data: { title, description }
    });
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error al crear lista de reproducción:', error);
    res.status(500).json({ error: 'Error al crear lista de reproducción.' });
  }
});

// PUT /api/newberytv/playlists/:id (Admin only)
router.put('/playlists/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { videoIds } = req.body;

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(id) }
    });
    if (!playlist) return res.status(404).json({ error: 'Lista de reproducción no encontrada.' });

    await prisma.video.updateMany({
      where: { playlistId: parseInt(id) },
      data: { playlistId: null }
    });

    if (videoIds && videoIds.length > 0) {
      await prisma.video.updateMany({
        where: { id: { in: videoIds.map(vid => parseInt(vid)) } },
        data: { playlistId: parseInt(id) }
      });
    }

    const updatedPlaylist = await prisma.playlist.findUnique({
      where: { id: parseInt(id) },
      include: { videos: true }
    });

    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Error al actualizar lista de reproducción:', error);
    res.status(500).json({ error: 'Error al actualizar lista de reproducción.' });
  }
});

// DELETE /api/newberytv/playlists/:id (Admin only)
router.delete('/playlists/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(id) }
    });
    if (!playlist) return res.status(404).json({ error: 'Lista de reproducción no encontrada.' });

    await prisma.video.updateMany({
      where: { playlistId: parseInt(id) },
      data: { playlistId: null }
    });

    await prisma.playlist.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Lista de reproducción eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar lista de reproducción:', error);
    res.status(500).json({ error: 'Error al eliminar lista de reproducción.' });
  }
});

// POST /api/newberytv/livestreams/:id/sponsors/track
router.post('/livestreams/:id/sponsors/track', optionalAuthenticate, async (req, res) => {
  const { id } = req.params;
  const { sponsorId, type } = req.body;
  try {
    const sponsor = await prisma.broadcastSponsor.findFirst({
      where: {
        matchBroadcastId: parseInt(id),
        sponsorId: parseInt(sponsorId)
      }
    });

    if (sponsor) {
      const updateData = {};
      if (type === 'CLICK') {
        updateData.clickCount = sponsor.clickCount + 1;
      } else {
        updateData.impCount = sponsor.impCount + 1;
      }

      const updated = await prisma.broadcastSponsor.update({
        where: { id: sponsor.id },
        data: updateData
      });

      await prisma.sponsor.update({
        where: { id: parseInt(sponsorId) },
        data: {
          clicks: type === 'CLICK' ? { increment: 1 } : undefined,
          views: type === 'IMP' ? { increment: 1 } : undefined
        }
      }).catch(() => {});

      return res.json(updated);
    }
    res.status(404).json({ error: 'Sponsor no encontrado para esta transmisión.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar estadísticas de sponsor.' });
  }
});

// GET /api/newberytv/statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalVideos = await prisma.video.count();
    const totalPlaylists = await prisma.playlist.count();
    const totalBroadcasts = await prisma.matchBroadcast.count();

    const videoStats = await prisma.video.aggregate({
      _sum: {
        size: true,
        durationSeconds: true,
        views: true
      },
      _avg: {
        likes: true
      }
    });

    const totalSpace = videoStats._sum.size || 0;
    const totalSeconds = videoStats._sum.durationSeconds || 0;
    const totalMinutes = Math.round(totalSeconds / 65); // Promedio minutos redondeados
    
    const lastVideo = await prisma.video.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const channel = await prisma.channel.findFirst() || {};

    const viewerRetention = [
      { minute: 0, retention: 100 },
      { minute: 10, retention: 95 },
      { minute: 20, retention: 90 },
      { minute: 30, retention: 88 },
      { minute: 40, retention: 92 },
      { minute: 50, retention: 85 },
      { minute: 60, retention: 80 },
      { minute: 70, retention: 78 },
      { minute: 80, retention: 85 },
      { minute: 90, retention: 93 }
    ];

    const deviceDistribution = {
      desktop: 35,
      mobile: 58,
      tablet: 7
    };

    const geographicRetention = [
      { country: "Argentina", viewers: 82 },
      { country: "Uruguay", viewers: 8 },
      { country: "España", viewers: 4 },
      { country: "Otros", viewers: 6 }
    ];

    res.json({
      channel: {
        name: channel.name || 'Newbery TV',
        logoUrl: channel.logoUrl || '',
        subscribers: channel.subscribers || 0,
        views: channel.views || 0,
        watchHours: channel.watchHours || 0
      },
      summary: {
        totalVideos,
        totalPlaylists,
        totalBroadcasts,
        totalViews: videoStats._sum.views || 0,
        averageLikes: videoStats._avg.likes || 0,
        totalSpace,
        totalMinutes
      },
      stats: {
        totalVideos,
        totalPlaylists,
        totalBroadcasts,
        totalSpace,
        totalMinutes,
        totalViews: videoStats._sum.views || 0,
        avgLikes: videoStats._avg.likes || 0,
        lastVideo: lastVideo ? {
          title: lastVideo.title,
          createdAt: lastVideo.createdAt
        } : null
      },
      viewerRetention,
      deviceDistribution,
      geographicRetention
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    res.status(500).json({ error: 'Error al generar estadísticas.' });
  }
});

// YouTube API Connection — integración pendiente de implementar con OAuth2 real
router.post('/youtube/connect', authenticateToken, requireAdmin, async (req, res) => {
  // TODO: Implementar flujo OAuth2 real con YouTube Data API v3
  // Requiere: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET en variables de entorno
  res.status(501).json({
    error: 'Integración con YouTube no implementada.',
    message: 'Para activar la transmisión en vivo, configurar las credenciales OAuth2 de Google en las variables de entorno.',
    requiredVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  });
});

module.exports = router;
