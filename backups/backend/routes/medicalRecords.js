const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/medical — Lista registros médicos
router.get('/', async (req, res) => {
  const { playerId, status, type } = req.query;
  try {
    const where = {};
    if (playerId) where.playerId = parseInt(playerId);
    if (status) where.status = status;
    if (type) where.type = type;
    const records = await prisma.medicalRecord.findMany({
      where,
      orderBy: { startDate: 'desc' }
    });
    res.json(records);
  } catch (err) {
    console.error('[Medical] GET error:', err);
    res.status(500).json({ error: 'Error al obtener registros médicos' });
  }
});

// POST /api/medical
router.post('/', async (req, res) => {
  const { playerId, playerName, type, description, diagnosis, startDate, endDate, expectedReturn, doctor, treatment, restrictions, status, severity, bodyPart, notes } = req.body;
  try {
    if (!playerId || !type || !description || !startDate) {
      return res.status(400).json({ error: 'Campos obligatorios: playerId, type, description, startDate' });
    }
    const record = await prisma.medicalRecord.create({
      data: {
        playerId: parseInt(playerId),
        playerName: playerName || '',
        type,
        description,
        diagnosis: diagnosis || '',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
        doctor: doctor || '',
        treatment: treatment || '',
        restrictions: restrictions || '',
        status: status || 'ACTIVE',
        severity: severity || 'LEVE',
        bodyPart: bodyPart || '',
        notes: notes || ''
      }
    });
    res.status(201).json(record);
  } catch (err) {
    console.error('[Medical] POST error:', err);
    res.status(500).json({ error: 'Error al crear registro médico' });
  }
});

// PUT /api/medical/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, description, diagnosis, startDate, endDate, expectedReturn, doctor, treatment, restrictions, status, severity, bodyPart, notes } = req.body;
  try {
    const record = await prisma.medicalRecord.update({
      where: { id: parseInt(id) },
      data: {
        type,
        description,
        diagnosis,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
        doctor,
        treatment,
        restrictions,
        status,
        severity,
        bodyPart,
        notes
      }
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar registro médico' });
  }
});

// DELETE /api/medical/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.medicalRecord.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Registro médico eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro médico' });
  }
});

// GET /api/medical/player/:playerId — historial por jugador
router.get('/player/:playerId', async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { playerId: parseInt(req.params.playerId) },
      orderBy: { startDate: 'desc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial médico' });
  }
});

module.exports = router;
