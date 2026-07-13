const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

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

// Middleware to require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Permisos de administrador requeridos.' });
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

// ─── GET /api/news ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getAllNews', error, req });
    res.status(500).json({ error: 'Error al obtener las novedades del club.' });
  }
});

// ─── POST /api/news (Admin only) ───────────────────────────────────────────
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, content, category, tag, imageUrl } = req.body;
  try {
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (título, contenido o categoría).' });
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      return res.status(400).json({ error: 'La URL de la imagen del sponsor no posee un formato correcto.' });
    }

    const newsItem = await prisma.news.create({
      data: {
        title,
        content,
        category,
        tag: tag || null,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json(newsItem);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'createNews', error, req });
    res.status(500).json({ error: 'Error al redactar la novedad.' });
  }
});

// ─── DELETE /api/news/:id (Admin only) ─────────────────────────────────────
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.news.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Novedad no encontrada.' });
    }

    await prisma.news.delete({
      where: { id: parseInt(id, 10) }
    });
    res.json({ message: 'Novedad eliminada correctamente.' });
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'deleteNews', error, req });
    res.status(500).json({ error: 'Error al eliminar la novedad.' });
  }
});

module.exports = router;
