const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/club-events
router.get('/', async (req, res) => {
  const { type, month, year, team, category } = req.query;
  try {
    const where = {};
    if (type) where.type = type;
    if (team) where.team = team;
    if (category) where.category = category;
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }
    const events = await prisma.clubEvent.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (err) {
    console.error('[Events] GET error:', err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// POST /api/club-events
router.post('/', async (req, res) => {
  const { title, type, date, endDate, timeSlot, endTime, location, category, team, discipline, description, color, createdBy } = req.body;
  try {
    if (!title || !date || !type) return res.status(400).json({ error: 'Título, tipo y fecha requeridos' });
    const event = await prisma.clubEvent.create({
      data: {
        title,
        type,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        timeSlot: timeSlot || '',
        endTime: endTime || '',
        location: location || '',
        category: category || '',
        team: team || '',
        discipline: discipline || '',
        description: description || '',
        color: color || '#EF4444',
        createdBy: createdBy || 'Admin'
      }
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('[Events] POST error:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// PUT /api/club-events/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, type, date, endDate, timeSlot, endTime, location, category, team, discipline, description, color } = req.body;
  try {
    const event = await prisma.clubEvent.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        date: date ? new Date(date) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        timeSlot,
        endTime,
        location,
        category,
        team,
        discipline,
        description,
        color
      }
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// DELETE /api/club-events/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.clubEvent.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

module.exports = router;
