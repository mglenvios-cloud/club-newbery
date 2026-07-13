const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Listar todos los perfiles de jugadores
router.get('/', async (req, res) => {
  const { category, team } = req.query;
  try {
    const filters = {};
    if (category) filters.category = category;
    if (team) filters.team = team;

    const players = await prisma.playerProfile.findMany({
      where: filters,
      orderBy: { name: 'asc' }
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
      where: { id: parseInt(id) }
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
  const { name, lastName, dorsal, age, category, position, team, achievements, matchesPlayed, goals, assists, yellowCards, redCards, cleanSheets, season, description, birthDate, playerStatus, videoUrl, photoUrl } = req.body;
  try {
    if (!name || age === undefined || !category || !position || !team) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el jugador' });
    }

    const player = await prisma.playerProfile.create({
      data: {
        name,
        lastName: lastName || '',
        dorsal: dorsal ? parseInt(dorsal) : 0,
        age: parseInt(age),
        category,
        position,
        team,
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
        videoUrl,
        photoUrl
      }
    });

    res.status(201).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear perfil del jugador' });
  }
});

// Actualizar estadísticas o logros del jugador (ADMIN)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, lastName, dorsal, age, category, position, team, achievements, matchesPlayed, goals, assists, yellowCards, redCards, cleanSheets, season, description, birthDate, playerStatus, videoUrl, photoUrl } = req.body;
  try {
    const updated = await prisma.playerProfile.update({
      where: { id: parseInt(id) },
      data: {
        name,
        lastName,
        dorsal: dorsal !== undefined ? parseInt(dorsal) : undefined,
        age: age ? parseInt(age) : undefined,
        category,
        position,
        team,
        achievements,
        matchesPlayed: matchesPlayed !== undefined ? parseInt(matchesPlayed) : undefined,
        goals: goals !== undefined ? parseInt(goals) : undefined,
        assists: assists !== undefined ? parseInt(assists) : undefined,
        yellowCards: yellowCards !== undefined ? parseInt(yellowCards) : undefined,
        redCards: redCards !== undefined ? parseInt(redCards) : undefined,
        cleanSheets: cleanSheets !== undefined ? parseInt(cleanSheets) : undefined,
        season,
        description,
        birthDate: birthDate ? new Date(birthDate) : (birthDate === null ? null : undefined),
        playerStatus,
        videoUrl,
        photoUrl
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
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
