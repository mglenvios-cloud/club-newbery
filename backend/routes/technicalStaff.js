const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/technical-staff
router.get('/', async (req, res) => {
  const { role, discipline } = req.query;
  try {
    const where = {};
    if (role) where.role = role.toUpperCase();
    if (discipline) where.discipline = discipline;
    const staff = await prisma.technicalStaff.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (err) {
    console.error('[TechnicalStaff] GET error:', err);
    res.status(500).json({ error: 'Error al obtener personal técnico' });
  }
});

// POST /api/technical-staff
router.post('/', async (req, res) => {
  const { name, role, photoUrl, phone, email, categories, discipline, incorporationDate, notes } = req.body;
  try {
    if (!name || !role) return res.status(400).json({ error: 'Nombre y cargo requeridos' });
    const staff = await prisma.technicalStaff.create({
      data: {
        name,
        role: role.toUpperCase(),
        photoUrl: photoUrl || null,
        phone: phone || null,
        email: email || null,
        categories: categories || '',
        discipline: discipline || 'FUTSAL',
        incorporationDate: incorporationDate ? new Date(incorporationDate) : null,
        notes: notes || '',
        isActive: true
      }
    });
    res.status(201).json(staff);
  } catch (err) {
    console.error('[TechnicalStaff] POST error:', err);
    res.status(500).json({ error: 'Error al registrar personal' });
  }
});

// PUT /api/technical-staff/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, photoUrl, phone, email, categories, discipline, incorporationDate, notes, isActive } = req.body;
  try {
    const staff = await prisma.technicalStaff.update({
      where: { id: parseInt(id) },
      data: {
        name,
        role: role ? role.toUpperCase() : undefined,
        photoUrl,
        phone,
        email,
        categories,
        discipline,
        incorporationDate: incorporationDate ? new Date(incorporationDate) : undefined,
        notes,
        isActive
      }
    });
    res.json(staff);
  } catch (err) {
    console.error('[TechnicalStaff] PUT error:', err);
    res.status(500).json({ error: 'Error al actualizar personal' });
  }
});

// DELETE /api/technical-staff/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.technicalStaff.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Personal eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar personal' });
  }
});

module.exports = router;
