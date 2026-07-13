const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// Listar todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.categoryConfig.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

// Crear una nueva categoría
router.post('/', async (req, res) => {
  const { name, type, price, description } = req.body;
  try {
    if (!name || !type || price === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: name, type, price' });
    }
    const category = await prisma.categoryConfig.create({
      data: {
        name,
        type,
        price: parseFloat(price),
        description
      }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
});

// Eliminar una categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.categoryConfig.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
});

// Actualizar una categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, price, description } = req.body;
  try {
    const category = await prisma.categoryConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        price: price !== undefined ? parseFloat(price) : undefined,
        description
      }
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
});

module.exports = router;
