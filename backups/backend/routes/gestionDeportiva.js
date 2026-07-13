const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

const trainingsService = require('../modules/gestionDeportiva/services/trainings.service');
const documentsService = require('../modules/gestionDeportiva/services/documents.service');
const coachesService = require('../modules/gestionDeportiva/services/coaches.service');
const validators = require('../modules/gestionDeportiva/validators/gestionDeportiva.validators');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

// ═══════════════════════════════════════════════════════════════════════════
// ENTRENAMIENTOS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gestion-deportiva/trainings
router.get('/trainings', async (req, res) => {
  const { category, court, team } = req.query;
  try {
    const trainings = await trainingsService.getAll({ category, court, team });
    res.json(trainings);
  } catch (error) {
    logError({ module: 'TrainingsRoute', action: 'getTrainings', error, req });
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
});

// POST /api/gestion-deportiva/trainings
router.post('/trainings', async (req, res) => {
  try {
    const validationError = validators.validateTraining(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const tr = await trainingsService.create(req.body);
    res.status(201).json(tr);
  } catch (error) {
    logError({ module: 'TrainingsRoute', action: 'createTraining', error, req });
    res.status(500).json({ error: 'Error al crear entrenamiento' });
  }
});

// PUT /api/gestion-deportiva/trainings/:id
router.put('/trainings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) {
      return res.status(400).json({ error: idError });
    }
    const tr = await trainingsService.update(parseInt(id), req.body);
    res.json(tr);
  } catch (error) {
    logError({ module: 'TrainingsRoute', action: 'updateTraining', error, req });
    res.status(500).json({ error: 'Error al actualizar entrenamiento' });
  }
});

// DELETE /api/gestion-deportiva/trainings/:id
router.delete('/trainings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) {
      return res.status(400).json({ error: idError });
    }
    await trainingsService.remove(parseInt(id));
    res.json({ message: 'Entrenamiento eliminado' });
  } catch (error) {
    logError({ module: 'TrainingsRoute', action: 'deleteTraining', error, req });
    res.status(500).json({ error: 'Error al eliminar entrenamiento' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTACIÓN
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gestion-deportiva/documents
router.get('/documents', async (req, res) => {
  try {
    const docs = await documentsService.getAll();
    res.json(docs);
  } catch (error) {
    logError({ module: 'DocumentsRoute', action: 'getDocuments', error, req });
    res.status(500).json({ error: 'Error al obtener documentación' });
  }
});

// POST /api/gestion-deportiva/documents
router.post('/documents', async (req, res) => {
  try {
    const validationError = validators.validateDocument(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const doc = await documentsService.create(req.body);
    res.status(201).json(doc);
  } catch (error) {
    logError({ module: 'DocumentsRoute', action: 'createDocument', error, req });
    res.status(500).json({ error: 'Error al subir documentación' });
  }
});

// DELETE /api/gestion-deportiva/documents/:id
router.delete('/documents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) {
      return res.status(400).json({ error: idError });
    }
    await documentsService.remove(parseInt(id));
    res.json({ message: 'Documento eliminado' });
  } catch (error) {
    logError({ module: 'DocumentsRoute', action: 'deleteDocument', error, req });
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ENTRENADORES Y CUERPO TÉCNICO
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gestion-deportiva/coaches
router.get('/coaches', async (req, res) => {
  const { role } = req.query;
  try {
    const coaches = await coachesService.getAll({ role });
    res.json(coaches);
  } catch (error) {
    logError({ module: 'CoachesRoute', action: 'getCoaches', error, req });
    res.status(500).json({ error: 'Error al obtener cuerpo técnico' });
  }
});

// POST /api/gestion-deportiva/coaches
router.post('/coaches', async (req, res) => {
  try {
    const validationError = validators.validateCoach(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const coach = await coachesService.create(req.body);
    res.status(201).json(coach);
  } catch (error) {
    logError({ module: 'CoachesRoute', action: 'createCoach', error, req });
    res.status(500).json({ error: 'Error al registrar miembro del cuerpo técnico' });
  }
});

// PUT /api/gestion-deportiva/coaches/:id
router.put('/coaches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) {
      return res.status(400).json({ error: idError });
    }
    const coach = await coachesService.update(parseInt(id), req.body);
    res.json(coach);
  } catch (error) {
    logError({ module: 'CoachesRoute', action: 'updateCoach', error, req });
    res.status(500).json({ error: 'Error al actualizar miembro del cuerpo técnico' });
  }
});

// DELETE /api/gestion-deportiva/coaches/:id
router.delete('/coaches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) {
      return res.status(400).json({ error: idError });
    }
    await coachesService.remove(parseInt(id));
    res.json({ message: 'Miembro del cuerpo técnico eliminado' });
  } catch (error) {
    logError({ module: 'CoachesRoute', action: 'deleteCoach', error, req });
    res.status(500).json({ error: 'Error al eliminar miembro' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ESTADÍSTICAS Y KPIS DE CONTROL
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gestion-deportiva/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in7days = new Date(today);
    in7days.setDate(in7days.getDate() + 7);
    const in30days = new Date(today);
    in30days.setDate(in30days.getDate() + 30);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const [
      totalTeams,
      activeTeams,
      totalPlayers,
      activePlayers,
      injuredPlayers,
      suspendedPlayers,
      totalCoaches,
      totalAssistants,
      totalPFs,
      totalTechnicalStaff,
      trainingsToday,
      trainingsThisWeek,
      upcomingMatches,
      weeklyTrainings,
      allPlayers,
      newsCount,
      futsalNewsCount,
      allTeams,
      allCategories,
      activeMedical,
      expiringDocs
    ] = await Promise.all([
      prisma.futsalTeam.count(),
      prisma.futsalTeam.count({ where: { status: 'ACTIVE' } }),
      prisma.playerProfile.count(),
      prisma.playerProfile.count({ where: { playerStatus: 'ACTIVE' } }),
      prisma.playerProfile.count({ where: { playerStatus: 'INJURED' } }),
      prisma.playerProfile.count({ where: { playerStatus: 'SUSPENDED' } }),
      prisma.coach.count({ where: { role: 'ENTRENADOR' } }),
      prisma.coach.count({ where: { role: 'AYUDANTE' } }),
      prisma.coach.count({ where: { role: 'PF' } }),
      prisma.technicalStaff.count({ where: { isActive: true } }),
      prisma.training.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.training.count({ where: { date: { gte: startOfWeek, lt: endOfWeek } } }),
      prisma.futsalMatch.findMany({
        where: { status: 'UPCOMING', date: { gte: today } },
        take: 5,
        orderBy: { date: 'asc' }
      }),
      prisma.training.findMany({
        where: { status: 'SCHEDULED' },
        orderBy: { date: 'asc' },
        take: 10
      }),
      prisma.playerProfile.findMany({ where: { birthDate: { not: null } } }),
      prisma.news.count(),
      prisma.futsalNews.count(),
      prisma.futsalTeam.findMany({ orderBy: { name: 'asc' } }),
      prisma.categoryConfig.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.medicalRecord.count({ where: { status: 'ACTIVE' } }),
      prisma.playerDocument.count({
        where: {
          expiryDate: { gte: today, lte: in30days },
          status: 'VALID'
        }
      })
    ]);

    const playersByCategory = await prisma.playerProfile.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const playersByDiscipline = await prisma.playerProfile.groupBy({
      by: ['discipline'],
      _count: { id: true }
    });

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const trainingsWeekly = await Promise.all(
      daysOfWeek.map(async (day, i) => {
        const dayStart = new Date(startOfWeek);
        dayStart.setDate(dayStart.getDate() + i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const count = await prisma.training.count({
          where: { date: { gte: dayStart, lt: dayEnd } }
        });
        return { day, count };
      })
    );

    const teamsByDiscipline = await prisma.futsalTeam.groupBy({
      by: ['discipline'],
      where: { status: 'ACTIVE' },
      _count: { id: true }
    });

    const catSet = new Set([
      ...allTeams.map(t => t.category),
      ...allCategories.map(c => c.name)
    ].filter(Boolean));
    const totalCategories = catSet.size;

    const currentMonth = new Date().getMonth();
    const todayDay = new Date().getDate();
    const birthdays = allPlayers.filter(p => {
      if (!p.birthDate) return false;
      const bd = new Date(p.birthDate);
      return bd.getMonth() === currentMonth;
    }).map(p => ({
      id: p.id,
      name: `${p.name} ${p.lastName}`,
      birthDate: p.birthDate,
      category: p.category,
      team: p.team,
      isToday: new Date(p.birthDate).getDate() === todayDay
    })).sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());

    const upcomingNext7 = await prisma.futsalMatch.findMany({
      where: { status: 'UPCOMING', date: { gte: today, lte: in7days } },
      orderBy: { date: 'asc' }
    });

    const ages = allPlayers.filter(p => p.age).map(p => p.age);
    const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0;

    const totalStaffCount = await prisma.coach.count();

    res.json({
      totalTeams,
      activeTeams,
      totalCategories,
      totalPlayers,
      activePlayers,
      totalCoaches,
      totalAssistants,
      totalPFs,
      totalTechnicalStaff,
      trainingsToday,
      trainingsThisWeek,
      injuredPlayers,
      suspendedPlayers,
      publishedNews: newsCount + futsalNewsCount,
      activeMedicalCases: activeMedical,
      expiringDocuments: expiringDocs,
      avgAge: parseFloat(avgAge),
      upcomingMatches,
      upcomingNext7,
      weeklyTrainings,
      birthdays,
      playersByCategory: playersByCategory.map(c => ({ name: c.category || 'Sin categoría', value: c._count.id })),
      playersByDiscipline: playersByDiscipline.map(d => ({ name: d.discipline || 'Futsal', value: d._count.id })),
      teamsByDiscipline: teamsByDiscipline.map(d => ({ name: d.discipline || 'Futsal', value: d._count.id })),
      trainingsWeekly,
      totalStaff: totalStaffCount + totalTechnicalStaff
    });
  } catch (error) {
    logError({ module: 'StatsRoute', action: 'getStats', error, req });
    res.status(500).json({ error: 'Error al obtener indicadores deportivos' });
  }
});

// GET /api/gestion-deportiva/search
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const validationError = validators.validateSearchQuery(q);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const [players, teams, coaches, matches] = await Promise.all([
      prisma.playerProfile.findMany({
        where: { OR: [{ name: { contains: q } }, { lastName: { contains: q } }, { category: { contains: q } }, { team: { contains: q } }] },
        take: 8
      }),
      prisma.futsalTeam.findMany({
        where: { OR: [{ name: { contains: q } }, { category: { contains: q } }, { coach: { contains: q } }] },
        take: 5
      }),
      prisma.coach.findMany({
        where: { OR: [{ name: { contains: q } }, { categories: { contains: q } }] },
        take: 5
      }),
      prisma.futsalMatch.findMany({
        where: { OR: [{ opponent: { contains: q } }, { category: { contains: q } }, { competition: { contains: q } }] },
        take: 5,
        orderBy: { date: 'desc' }
      })
    ]);
    res.json({ players, teams, coaches, matches });
  } catch (err) {
    logError({ module: 'SearchRoute', action: 'search', error: err, req });
    res.status(500).json({ error: 'Error en búsqueda global' });
  }
});

module.exports = router;
