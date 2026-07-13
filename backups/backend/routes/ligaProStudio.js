const express = require('express');
const jwt = require('jsonwebtoken');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

// Services
const broadcastsService = require('../modules/ligaProStudio/services/broadcasts.service');
const matchEventsService = require('../modules/ligaProStudio/services/matchEvents.service');
const highlightsService = require('../modules/ligaProStudio/services/highlights.service');

// Validators
const {
  validateBroadcast,
  validateEvent,
  validateHighlight
} = require('../modules/ligaProStudio/validators/ligaPro.validators');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';

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

// Middleware to enforce admin or operator role
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'OPERADOR')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o productor operador.' });
  }
  next();
};

// ─── BROADCAST ENDPOINTS ───────────────────────────────────────────────────

// GET /api/liga-pro-studio/broadcasts
router.get('/broadcasts', async (req, res) => {
  try {
    const list = await broadcastsService.getAllBroadcasts();
    res.json(list);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getAllBroadcasts', error, req });
    res.status(500).json({ error: 'Error al obtener las transmisiones.' });
  }
});

// GET /api/liga-pro-studio/broadcasts/match/:matchId
router.get('/broadcasts/match/:matchId', async (req, res) => {
  const { matchId } = req.params;
  try {
    const broadcast = await broadcastsService.getBroadcastByMatch(matchId);
    if (!broadcast) {
      return res.status(404).json({ error: 'Transmisión no encontrada para el partido especificado.' });
    }
    res.json(broadcast);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getBroadcastByMatch', error, req });
    res.status(500).json({ error: 'Error al obtener la transmisión del partido.' });
  }
});

// POST /api/liga-pro-studio/broadcasts (Admin only)
router.post('/broadcasts', authenticateToken, requireAdmin, validateBroadcast, async (req, res) => {
  try {
    const item = await broadcastsService.createBroadcast(req.body);
    res.status(201).json(item);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'createBroadcast', error, req });
    res.status(500).json({ error: 'Error al programar la transmisión.' });
  }
});

// PUT /api/liga-pro-studio/broadcasts/:id (Admin only)
router.put('/broadcasts/:id', authenticateToken, requireAdmin, validateBroadcast, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await broadcastsService.updateBroadcast(id, req.body);
    res.json(updated);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'updateBroadcast', error, req });
    res.status(500).json({ error: 'Error al actualizar la transmisión.' });
  }
});


// ─── EVENTS ENDPOINTS ──────────────────────────────────────────────────────

// GET /api/liga-pro-studio/matches/:id/events
router.get('/matches/:id/events', async (req, res) => {
  const matchId = req.params.id;
  try {
    const list = await matchEventsService.getEventsByMatch(matchId);
    res.json(list);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getEventsByMatch', error, req });
    res.status(500).json({ error: 'Error al obtener los eventos en vivo del partido.' });
  }
});

// POST /api/liga-pro-studio/matches/:id/events (Admin only)
router.post('/matches/:id/events', authenticateToken, requireAdmin, validateEvent, async (req, res) => {
  const matchId = req.params.id;
  try {
    const payload = { ...req.body, matchId };
    const item = await matchEventsService.createEvent(payload);
    res.status(201).json(item);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'createMatchEvent', error, req });
    res.status(500).json({ error: 'Error al registrar el evento de juego en vivo.' });
  }
});


// ─── HIGHLIGHT CLIPS ENDPOINTS ─────────────────────────────────────────────

// GET /api/liga-pro-studio/highlights
router.get('/highlights', async (req, res) => {
  try {
    const list = await highlightsService.getAllHighlights();
    res.json(list);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getAllHighlights', error, req });
    res.status(500).json({ error: 'Error al listar los clips destacados.' });
  }
});

// POST /api/liga-pro-studio/highlights (Admin only)
router.post('/highlights', authenticateToken, requireAdmin, validateHighlight, async (req, res) => {
  try {
    const item = await highlightsService.createHighlight(req.body);
    res.status(201).json(item);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'createHighlight', error, req });
    res.status(500).json({ error: 'Error al guardar el clip destacado.' });
  }
});

// PUT /api/liga-pro-studio/highlights/:id (Admin only)
router.put('/highlights/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await highlightsService.updateHighlight(id, req.body);
    res.json(updated);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'updateHighlight', error, req });
    res.status(500).json({ error: 'Error al actualizar el clip destacado.' });
  }
});

// DELETE /api/liga-pro-studio/highlights/:id (Admin only)
router.delete('/highlights/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await highlightsService.deleteHighlight(id);
    res.json({ message: 'Clip destacado eliminado de la producción.' });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'deleteHighlight', error, req });
    res.status(500).json({ error: 'Error al eliminar el clip destacado.' });
  }
});

module.exports = router;
