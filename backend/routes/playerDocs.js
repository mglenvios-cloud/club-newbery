const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/player-docs
router.get('/', async (req, res) => {
  const { playerId, status, category } = req.query;
  try {
    const where = {};
    if (playerId) where.playerId = parseInt(playerId);
    if (status) where.status = status;
    if (category) where.category = category;
    const docs = await prisma.playerDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(docs);
  } catch (err) {
    console.error('[PlayerDocs] GET error:', err);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// POST /api/player-docs
router.post('/', async (req, res) => {
  const { playerId, playerName, title, category, url, fileType, expiryDate, issuedDate, issuer, notes } = req.body;
  try {
    if (!playerId || !title || !category) {
      return res.status(400).json({ error: 'playerId, título y categoría requeridos' });
    }
    const today = new Date();
    let status = 'VALID';
    if (expiryDate && new Date(expiryDate) < today) status = 'EXPIRED';
    const doc = await prisma.playerDocument.create({
      data: {
        playerId: parseInt(playerId),
        playerName: playerName || '',
        title,
        category,
        url: url || '',
        fileType: fileType || 'PDF',
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        issuer: issuer || '',
        status,
        notes: notes || ''
      }
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('[PlayerDocs] POST error:', err);
    res.status(500).json({ error: 'Error al crear documento' });
  }
});

// PUT /api/player-docs/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, url, fileType, expiryDate, issuedDate, issuer, status, notes } = req.body;
  try {
    const doc = await prisma.playerDocument.update({
      where: { id: parseInt(id) },
      data: { title, category, url, fileType, expiryDate: expiryDate ? new Date(expiryDate) : undefined, issuedDate: issuedDate ? new Date(issuedDate) : undefined, issuer, status, notes }
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar documento' });
  }
});

// DELETE /api/player-docs/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.playerDocument.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

// GET /api/player-docs/expiring — documentos próximos a vencer (30 días)
router.get('/expiring', async (req, res) => {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const docs = await prisma.playerDocument.findMany({
      where: {
        expiryDate: { gte: now, lte: in30 },
        status: 'VALID'
      },
      orderBy: { expiryDate: 'asc' }
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos próximos a vencer' });
  }
});

// GET /api/player-docs/player/:playerId
router.get('/player/:playerId', async (req, res) => {
  try {
    const docs = await prisma.playerDocument.findMany({
      where: { playerId: parseInt(req.params.playerId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos del jugador' });
  }
});

module.exports = router;
