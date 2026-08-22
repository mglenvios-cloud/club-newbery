const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const admin = require('../config/firebase-admin');
const firebaseStorage = require('../config/storage');
const { dualAuth } = require('../middleware/firebaseAuth');

const router = express.Router();

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Configurar fotografía de jugador (Aporte de Foto para Mundo Inferiores)
router.post('/:id/photo', dualAuth, uploadPhoto.single('file'), async (req, res) => {
  const { id } = req.params;
  const playerId = parseInt(id, 10);

  if (isNaN(playerId)) {
    return res.status(400).json({ error: 'ID de jugador inválido' });
  }

  try {
    const player = await prisma.playerProfile.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo de imagen' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Formato no permitido. Solo se aceptan imágenes (JPG, PNG, WEBP, GIF)' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Extensión de archivo no válida' });
    }

    const safeBaseName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `mundo-inferiores/players/${playerId}/${Date.now()}-${safeBaseName}${ext}`;

    const useLocalJson = !process.env.GOOGLE_APPLICATION_CREDENTIALS && 
                         !process.env.FIREBASE_STORAGE_BUCKET && 
                         !process.env.STORAGE_BUCKET && 
                         !process.env.STORAGE_EMULATOR_HOST;
    let fileUrl = '';

    if (useLocalJson) {
      const localFilePath = path.join(__dirname, '../uploads', storagePath);
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, req.file.buffer);
      fileUrl = `/uploads/${storagePath}`;
    } else {
      const bucket = admin.storage().bucket();
      const file = bucket.file(storagePath);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });
      try {
        await file.makePublic();
      } catch (e) {}
      fileUrl = firebaseStorage.getPublicUrl(storagePath);
    }

    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: playerId },
      data: { photoUrl: fileUrl }
    });

    res.status(200).json({
      success: true,
      playerId: updatedPlayer.id,
      photoUrl: updatedPlayer.photoUrl
    });
  } catch (error) {
    console.error('[Players Photo Upload Error]', error);
    res.status(500).json({ error: 'Error al procesar la fotografía del jugador' });
  }
});

// Listar todos los perfiles de jugadores
router.get('/', async (req, res) => {
  const { category, team, status } = req.query;
  try {
    const filters = {};
    if (category && category !== 'ALL') filters.category = { contains: category };
    if (team) filters.team = team;
    if (status && status !== 'ALL') filters.playerStatus = status;

    const players = await prisma.playerProfile.findMany({
      where: filters,
      orderBy: [{ lastName: 'asc' }, { name: 'asc' }]
    });
    res.json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfiles de jugadores' });
  }
});

// Obtener un perfil de jugador en específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const player = await prisma.playerProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        playerStatistics: true,
      }
    });
    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el perfil del jugador' });
  }
});

// Crear un perfil de jugador (ADMIN)
router.post('/', async (req, res) => {
  const {
    name, lastName, dorsal, age, category, position, team, achievements,
    matchesPlayed, goals, assists, yellowCards, redCards, cleanSheets,
    season, description, birthDate, playerStatus, videoUrl, photoUrl,
    phone, email, address, dni, dominantFoot, height, weight, observations,
    bloodType, emergencyPhone, entryDate, nationality,
    // Nuevos campos Fase 3
    isCaptain, isSubCaptain, licenciaAFA, carnet, seguro, aptoFisico, esSocio, tutorNombre
  } = req.body;
  try {
    if (!name || !category) {
      return res.status(400).json({ error: 'Nombre y Categoría son obligatorios' });
    }

    // Calcular edad automática si se tiene birthDate
    let calculatedAge = age ? parseInt(age) : 0;
    if (birthDate && !age) {
      calculatedAge = Math.floor((Date.now() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000));
    }

    const player = await prisma.playerProfile.create({
      data: {
        name,
        lastName: lastName || '',
        dorsal: dorsal !== undefined ? parseInt(dorsal) : 0,
        age: calculatedAge,
        category,
        position: position || 'Ala Derecha',
        team: team || 'Futsal AFA',
        achievements: achievements || '',
        matchesPlayed: matchesPlayed ? parseInt(matchesPlayed) : 0,
        goals: goals ? parseInt(goals) : 0,
        assists: assists ? parseInt(assists) : 0,
        yellowCards: yellowCards ? parseInt(yellowCards) : 0,
        redCards: redCards ? parseInt(redCards) : 0,
        cleanSheets: cleanSheets ? parseInt(cleanSheets) : 0,
        season: season || '2026',
        description: description || '',
        birthDate: birthDate ? new Date(birthDate) : null,
        playerStatus: playerStatus || 'ACTIVE',
        videoUrl: videoUrl || null,
        photoUrl: photoUrl || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        dni: dni || null,
        dominantFoot: dominantFoot || 'DERECHA',
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        observations: observations || '',
        bloodType: bloodType || null,
        emergencyPhone: emergencyPhone || null,
        entryDate: entryDate ? new Date(entryDate) : null,
        nationality: nationality || 'Argentina',
        // Fase 3
        isCaptain: isCaptain === true || isCaptain === 'true',
        isSubCaptain: isSubCaptain === true || isSubCaptain === 'true',
        licenciaAFA: licenciaAFA === true || licenciaAFA === 'true',
        carnet: carnet === true || carnet === 'true',
        seguro: seguro === true || seguro === 'true',
        aptoFisico: aptoFisico === true || aptoFisico === 'true',
        esSocio: esSocio === true || esSocio === 'true',
        tutorNombre: tutorNombre || '',
      }
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('[Players POST]', error);
    res.status(500).json({ error: 'Error al crear perfil del jugador' });
  }
});

// Actualizar estadísticas o logros del jugador (ADMIN)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, lastName, dorsal, age, category, position, team, achievements,
    matchesPlayed, goals, assists, yellowCards, redCards, cleanSheets,
    season, description, birthDate, playerStatus, videoUrl, photoUrl,
    phone, email, address, dni, dominantFoot, height, weight, observations,
    bloodType, emergencyPhone, entryDate, nationality,
    // Nuevos campos Fase 3
    isCaptain, isSubCaptain, licenciaAFA, carnet, seguro, aptoFisico, esSocio, tutorNombre
  } = req.body;
  try {
    // Calcular edad si se tiene birthDate
    let calculatedAge = age !== undefined ? parseInt(age) : undefined;
    if (birthDate && age === undefined) {
      calculatedAge = Math.floor((Date.now() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000));
    }

    const updated = await prisma.playerProfile.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(lastName !== undefined && { lastName }),
        ...(dorsal !== undefined && { dorsal: parseInt(dorsal) }),
        ...(calculatedAge !== undefined && { age: calculatedAge }),
        ...(category !== undefined && { category }),
        ...(position !== undefined && { position }),
        ...(team !== undefined && { team }),
        ...(achievements !== undefined && { achievements }),
        ...(matchesPlayed !== undefined && { matchesPlayed: parseInt(matchesPlayed) }),
        ...(goals !== undefined && { goals: parseInt(goals) }),
        ...(assists !== undefined && { assists: parseInt(assists) }),
        ...(yellowCards !== undefined && { yellowCards: parseInt(yellowCards) }),
        ...(redCards !== undefined && { redCards: parseInt(redCards) }),
        ...(cleanSheets !== undefined && { cleanSheets: parseInt(cleanSheets) }),
        ...(season !== undefined && { season }),
        ...(description !== undefined && { description }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(playerStatus !== undefined && { playerStatus }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(address !== undefined && { address: address || null }),
        ...(dni !== undefined && { dni: dni || null }),
        ...(dominantFoot !== undefined && { dominantFoot }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(observations !== undefined && { observations }),
        ...(bloodType !== undefined && { bloodType: bloodType || null }),
        ...(emergencyPhone !== undefined && { emergencyPhone: emergencyPhone || null }),
        ...(entryDate !== undefined && { entryDate: entryDate ? new Date(entryDate) : null }),
        ...(nationality !== undefined && { nationality }),
        // Fase 3
        ...(isCaptain !== undefined && { isCaptain: isCaptain === true || isCaptain === 'true' }),
        ...(isSubCaptain !== undefined && { isSubCaptain: isSubCaptain === true || isSubCaptain === 'true' }),
        ...(licenciaAFA !== undefined && { licenciaAFA: licenciaAFA === true || licenciaAFA === 'true' }),
        ...(carnet !== undefined && { carnet: carnet === true || carnet === 'true' }),
        ...(seguro !== undefined && { seguro: seguro === true || seguro === 'true' }),
        ...(aptoFisico !== undefined && { aptoFisico: aptoFisico === true || aptoFisico === 'true' }),
        ...(esSocio !== undefined && { esSocio: esSocio === true || esSocio === 'true' }),
        ...(tutorNombre !== undefined && { tutorNombre: tutorNombre || '' }),
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('[Players PUT]', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

// Eliminar jugador (ADMIN)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.playerProfile.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
});

module.exports = router;
