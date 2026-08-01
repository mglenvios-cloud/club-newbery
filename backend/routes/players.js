const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

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
