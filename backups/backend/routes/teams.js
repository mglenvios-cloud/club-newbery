const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Listar equipos de futsal
router.get('/', async (req, res) => {
  const { category, season } = req.query;
  try {
    const filters = {};
    if (category) filters.category = category;
    if (season) filters.season = season;

    const teams = await prisma.futsalTeam.findMany({
      where: filters,
      orderBy: { name: 'asc' }
    });
    res.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos de futsal:', error);
    res.status(500).json({ error: 'Error al obtener los equipos' });
  }
});

// Obtener un equipo específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const team = await prisma.futsalTeam.findUnique({
      where: { id: parseInt(id) }
    });
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(team);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: 'Error al obtener el equipo' });
  }
});

// Crear equipo (ADMIN / COORDINADOR_FUTSAL)
router.post('/', async (req, res) => {
  const { name, category, gender, season, coach, assistantCoach, preparadorFisico, status, trainingDays, trainingSchedule, location, description, imageUrl } = req.body;
  try {
    if (!name || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoría)' });
    }

    const team = await prisma.futsalTeam.create({
      data: {
        name,
        category,
        gender: gender || 'MASCULINO',
        season: season || '2026',
        coach: coach || '',
        assistantCoach: assistantCoach || '',
        preparadorFisico: preparadorFisico || '',
        status: status || 'ACTIVE',
        trainingDays: trainingDays || '',
        trainingSchedule: trainingSchedule || '',
        location: location || '',
        description: description || '',
        imageUrl: imageUrl || ''
      }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear el equipo' });
  }
});

// Actualizar equipo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, gender, season, coach, assistantCoach, preparadorFisico, status, trainingDays, trainingSchedule, location, description, imageUrl } = req.body;
  try {
    const updated = await prisma.futsalTeam.update({
      where: { id: parseInt(id) },
      data: {
        name,
        category,
        gender,
        season,
        coach,
        assistantCoach,
        preparadorFisico,
        status,
        trainingDays,
        trainingSchedule,
        location,
        description,
        imageUrl
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error al actualizar el equipo' });
  }
});

// Eliminar equipo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.futsalTeam.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});

module.exports = router;
