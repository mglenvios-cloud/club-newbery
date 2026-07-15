const express = require('express');
const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');

// Middleware para verificar token JWT
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

// Obtener todos los socios (Solo ADMIN)
router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' });

  try {
    const members = await prisma.member.findMany({
      include: { user: { select: { email: true } } }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los socios' });
  }
});

// Obtener el perfil del socio logueado (Permitido para SOCIO y ADMIN)
router.get('/me', authenticateToken, async (req, res) => {
  if (req.user.role !== 'SOCIO' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Solo permitido para socios.' });
  }
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.user.userId },
      include: { user: { select: { email: true } } }
    });
    
    if (!member) {
      if (req.user.role === 'ADMIN') {
        // Retornar socio virtual para el administrador para que pueda ver el portal sin fallos
        return res.json({
          id: 9999,
          socioNumber: 9999,
          firstName: "Admin",
          lastName: "Newbery",
          dni: "99999999",
          birthDate: new Date(),
          category: "ADMINISTRADOR",
          estado: "ACTIVO",
          isActive: true,
          user: { email: req.user.email }
        });
      }
      return res.status(404).json({ error: 'Socio no encontrado' });
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

module.exports = router;
