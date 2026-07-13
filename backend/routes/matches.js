const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Listar partidos de futsal con filtros
router.get('/', async (req, res) => {
  const { category, season, isFeatured, status } = req.query;
  try {
    const filters = {};
    if (category) filters.category = category;
    if (season) filters.season = season;
    if (status) filters.status = status;
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';

    const matches = await prisma.futsalMatch.findMany({
      where: filters,
      orderBy: { date: 'desc' }
    });
    res.json(matches);
  } catch (error) {
    console.error('Error al obtener partidos de futsal:', error);
    res.status(500).json({ error: 'Error al obtener los partidos' });
  }
});

// Obtener un partido específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const match = await prisma.futsalMatch.findUnique({
      where: { id: parseInt(id) }
    });
    if (!match) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.json(match);
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({ error: 'Error al obtener el partido' });
  }
});

// Crear partido (ADMIN / COORDINADOR_FUTSAL)
router.post('/', async (req, res) => {
  const {
    category,
    opponent,
    homeTeam,
    awayTeam,
    referee,
    attendance,
    date,
    timeSlot,
    ourScore,
    opponentScore,
    status,
    videoUrl,
    summary,
    photoGallery,
    isFeatured,
    competition,
    venue,
    season,
    externalMatchId,
    liveStreamUrl,
    provider
  } = req.body;

  try {
    if (!category || !opponent || !date || !timeSlot) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para el partido (categoría, oponente, fecha, horario)' });
    }

    const match = await prisma.futsalMatch.create({
      data: {
        category,
        opponent,
        homeTeam: homeTeam || 'Jorge Newbery',
        awayTeam: awayTeam || '',
        referee: referee || '',
        attendance: attendance !== undefined ? parseInt(attendance) : 0,
        date: new Date(date),
        timeSlot,
        ourScore: ourScore !== undefined && ourScore !== null ? parseInt(ourScore) : null,
        opponentScore: opponentScore !== undefined && opponentScore !== null ? parseInt(opponentScore) : null,
        status: status || 'UPCOMING',
        videoUrl: videoUrl || null,
        summary: summary || null,
        photoGallery: photoGallery || null,
        isFeatured: isFeatured === true || isFeatured === 'true',
        competition: competition || 'AFA Primera',
        venue: venue || 'Cancha Jorge Newbery',
        season: season || '2026',
        externalMatchId: externalMatchId || null,
        liveStreamUrl: liveStreamUrl || null,
        provider: provider || 'LOCAL'
      }
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Error al crear partido:', error);
    res.status(500).json({ error: 'Error al crear el partido' });
  }
});

// Actualizar partido
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    category,
    opponent,
    homeTeam,
    awayTeam,
    referee,
    attendance,
    date,
    timeSlot,
    ourScore,
    opponentScore,
    status,
    videoUrl,
    summary,
    photoGallery,
    isFeatured,
    competition,
    venue,
    season,
    externalMatchId,
    liveStreamUrl,
    provider
  } = req.body;

  try {
    const updated = await prisma.futsalMatch.update({
      where: { id: parseInt(id) },
      data: {
        category,
        opponent,
        homeTeam,
        awayTeam,
        referee,
        attendance: attendance !== undefined ? parseInt(attendance) : undefined,
        date: date ? new Date(date) : undefined,
        timeSlot,
        ourScore: ourScore !== undefined && ourScore !== null ? parseInt(ourScore) : (ourScore === null ? null : undefined),
        opponentScore: opponentScore !== undefined && opponentScore !== null ? parseInt(opponentScore) : (opponentScore === null ? null : undefined),
        status,
        videoUrl,
        summary,
        photoGallery,
        isFeatured: isFeatured !== undefined ? (isFeatured === true || isFeatured === 'true') : undefined,
        competition,
        venue,
        season,
        externalMatchId,
        liveStreamUrl,
        provider
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar partido:', error);
    res.status(500).json({ error: 'Error al actualizar el partido' });
  }
});

// Eliminar partido
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.futsalMatch.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Partido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar partido:', error);
    res.status(500).json({ error: 'Error al eliminar el partido' });
  }
});

module.exports = router;
