const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');

const { dualAuth, requireAdmin } = require('../middleware/firebaseAuth');

// Robust URL or local path validation
function isValidUrlOrPath(string) {
  if (typeof string !== 'string') return false;
  if (string.startsWith('/uploads/') || string.startsWith('data:')) return true;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// ─── GET /api/news ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const where = {};
    if (status) {
      where.status = status;
    }
    const news = await prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getAllNews', error, req });
    res.status(500).json({ error: 'Error al obtener las novedades del club.' });
  }
});

// ─── GET /api/news/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!newsItem) {
      return res.status(404).json({ error: 'Novedad no encontrada.' });
    }
    res.json(newsItem);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'getNewsById', error, req });
    res.status(500).json({ error: 'Error al obtener la novedad.' });
  }
});

// ─── POST /api/news (Admin only) ───────────────────────────────────────────
router.post('/', dualAuth, requireAdmin, async (req, res) => {
  const { title, description, content, category, tag, imageUrl, author, status } = req.body;
  try {
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (título, contenido o categoría).' });
    }

    if (imageUrl && !isValidUrlOrPath(imageUrl)) {
      return res.status(400).json({ error: 'La URL de la imagen de la noticia no posee un formato correcto.' });
    }

    const newsItem = await prisma.news.create({
      data: {
        title,
        description: description || '',
        content,
        category,
        tag: tag || null,
        imageUrl: imageUrl || null,
        author: author || 'Admin',
        status: status || 'DRAFT'
      }
    });

    res.status(201).json(newsItem);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'createNews', error, req });
    res.status(500).json({ error: 'Error al redactar la novedad.' });
  }
});

// ─── PUT /api/news/:id (Admin only) ──────────────────────────────────────────
router.put('/:id', dualAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, content, category, tag, imageUrl, author, status } = req.body;
  try {
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (título, contenido o categoría).' });
    }

    if (imageUrl && !isValidUrlOrPath(imageUrl)) {
      return res.status(400).json({ error: 'La URL de la imagen de la noticia no posee un formato correcto.' });
    }

    const existing = await prisma.news.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existing) {
      return res.status(404).json({ error: 'Novedad no encontrada.' });
    }

    const newsItem = await prisma.news.update({
      where: { id: parseInt(id, 10) },
      data: {
        title,
        description: description !== undefined ? description : existing.description,
        content,
        category,
        tag: tag || null,
        imageUrl: imageUrl || null,
        author: author || existing.author,
        status: status || existing.status
      }
    });

    res.json(newsItem);
  } catch (error) {
    logError({ module: 'NewberyTV', action: 'updateNews', error, req });
    res.status(500).json({ error: 'Error al actualizar la novedad.' });
  }
});

// ─── DELETE /api/news/:id (Admin only) ─────────────────────────────────────
router.delete('/:id', dualAuth, requireAdmin, async (req, res) => {
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
