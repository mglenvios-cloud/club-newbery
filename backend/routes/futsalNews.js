const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Listar noticias de futsal con filtros
router.get('/', async (req, res) => {
  const { category, season, published } = req.query;
  try {
    const filters = {};
    if (category) filters.category = category;
    if (season) filters.season = season;
    if (published !== undefined) filters.published = published === 'true';

    const news = await prisma.futsalNews.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' }
    });
    res.json(news);
  } catch (error) {
    console.error('Error al obtener noticias de futsal:', error);
    res.status(500).json({ error: 'Error al obtener las noticias' });
  }
});

// Obtener una noticia específica
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const newsItem = await prisma.futsalNews.findUnique({
      where: { id: parseInt(id) }
    });
    if (!newsItem) {
      return res.status(404).json({ error: 'Noticia de futsal no encontrada' });
    }
    res.json(newsItem);
  } catch (error) {
    console.error('Error al obtener noticia:', error);
    res.status(500).json({ error: 'Error al obtener la noticia' });
  }
});

// Crear noticia (ADMIN / COORDINADOR_FUTSAL)
router.post('/', async (req, res) => {
  const { title, description, imageUrl, category, season, published } = req.body;
  try {
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para la noticia (título, descripción, categoría)' });
    }

    const newsItem = await prisma.futsalNews.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        category,
        season: season || '2026',
        published: published !== undefined ? (published === true || published === 'true') : true
      }
    });

    res.status(201).json(newsItem);
  } catch (error) {
    console.error('Error al crear noticia:', error);
    res.status(500).json({ error: 'Error al crear la noticia' });
  }
});

// Actualizar noticia
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, category, season, published } = req.body;
  try {
    const updated = await prisma.futsalNews.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        imageUrl,
        category,
        season,
        published: published !== undefined ? (published === true || published === 'true') : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    res.status(500).json({ error: 'Error al actualizar la noticia' });
  }
});

// Eliminar noticia
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.futsalNews.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({ error: 'Error al eliminar la noticia' });
  }
});

module.exports = router;
