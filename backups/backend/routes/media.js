const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';

// Middleware to authenticate JWT token
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
    return res.status(403).json({ error: 'Acceso denegado. Permisos de administrador o productor operador requeridos.' });
  }
  next();
};

// Simple URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// ─── GET /api/media ────────────────────────────────────────────────────────
// Lists media files with filters. Admin query parameter allows showing all drafts.
router.get('/', async (req, res) => {
  const { category, type, season, competition, opponent, playerId, matchId, search, admin, featured } = req.query;
  try {
    const filters = {};

    // For public users, only return published and public content
    if (admin !== 'true') {
      filters.published = true;
      filters.visibility = 'PUBLIC';
    }

    if (category && category !== 'ALL') filters.category = category;
    if (type && type !== 'ALL') filters.type = type;
    if (season && season !== 'ALL') filters.season = season;
    if (competition && competition !== 'ALL') filters.competition = competition;
    if (opponent) filters.opponent = { contains: opponent };
    if (playerId) filters.playerId = parseInt(playerId, 10);
    if (matchId) filters.matchId = parseInt(matchId, 10);
    if (featured === 'true') filters.featured = true;

    if (search) {
      filters.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { opponent: { contains: search } },
        { competition: { contains: search } }
      ];
    }

    const media = await prisma.futsalMedia.findMany({
      where: filters,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(media);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getAllMedia', error, req });
    res.status(500).json({ error: 'Error al obtener los archivos de Newbery TV.' });
  }
});

// ─── GET /api/media/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.futsalMedia.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!item) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    // Increment views count (non-blocking)
    prisma.futsalMedia.update({
      where: { id: item.id },
      data: { views: { increment: 1 } }
    }).catch(() => {});

    res.json(item);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getMediaById', error, req });
    res.status(500).json({ error: 'Error al obtener el archivo multimedia.' });
  }
});

// ─── POST /api/media (Admin only) ──────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const {
    type, title, url, category, description, season, competition, opponent,
    playerId, matchId, published, visibility, featured
  } = req.body;

  try {
    if (!type || !title || !url || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (tipo, título, URL, sección).' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'La URL especificada no posee un formato válido (http/https).' });
    }

    const item = await prisma.futsalMedia.create({
      data: {
        type,
        title,
        url,
        category,
        description: description || '',
        season: season || '2026',
        competition: competition || null,
        opponent: opponent || null,
        playerId: playerId ? parseInt(playerId, 10) : null,
        matchId: matchId ? parseInt(matchId, 10) : null,
        published: published !== undefined ? published : true,
        publishedAt: published === false ? null : new Date(),
        authorId: req.user.userId,
        visibility: visibility || 'PUBLIC',
        featured: featured !== undefined ? featured : false,
        views: 0
      }
    });

    res.status(201).json(item);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'createMedia', error, req });
    res.status(500).json({ error: 'Error al registrar el archivo multimedia.' });
  }
});

// ─── PUT /api/media/:id (Admin only) ───────────────────────────────────────
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    type, title, url, category, description, season, competition, opponent,
    playerId, matchId, published, visibility, featured
  } = req.body;

  try {
    if (url && !isValidUrl(url)) {
      return res.status(400).json({ error: 'La URL especificada no posee un formato válido.' });
    }

    const existing = await prisma.futsalMedia.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    // Determine publishedAt value transitions
    let finalPublishedAt = existing.publishedAt;
    if (published === true && !existing.published) {
      finalPublishedAt = new Date();
    } else if (published === false) {
      finalPublishedAt = null;
    }

    const updated = await prisma.futsalMedia.update({
      where: { id: parseInt(id, 10) },
      data: {
        type,
        title,
        url,
        category,
        description,
        season,
        competition,
        opponent,
        playerId: playerId ? parseInt(playerId, 10) : null,
        matchId: matchId ? parseInt(matchId, 10) : null,
        published,
        publishedAt: finalPublishedAt,
        visibility,
        featured
      }
    });
    res.json(updated);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'updateMedia', error, req });
    res.status(500).json({ error: 'Error al actualizar el contenido.' });
  }
});

// ─── DELETE /api/media/:id (Admin only) ────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.futsalMedia.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Contenido multimedia no encontrado.' });
    }

    await prisma.futsalMedia.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Contenido eliminado de la biblioteca.' });
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'deleteMedia', error, req });
    res.status(500).json({ error: 'Error al eliminar el contenido.' });
  }
});

module.exports = router;
