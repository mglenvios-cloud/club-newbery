const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

const jwt = require('jsonwebtoken');
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

// Listar todas las transacciones
router.get('/', authenticateToken, async (req, res) => {
  if (!['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role)) return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o personal de staff.' });
  const { concept, status } = req.query;
  try {
    const filters = {};
    if (concept) filters.concept = concept;
    if (status) filters.status = status;

    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los movimientos contables' });
  }
});

// Registrar un movimiento de pago manual
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acceso denegado' });
  const { concept, amount, memberName, memberId, details, status } = req.body;
  try {
    if (!concept || amount === undefined || !memberName) {
      return res.status(400).json({ error: 'Faltan campos requeridos: concept, amount, memberName' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        concept,
        amount: parseFloat(amount),
        status: status || 'COMPLETED',
        memberName,
        memberId: memberId ? parseInt(memberId) : null,
        details,
        date: new Date()
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el movimiento contable' });
  }
});

module.exports = router;
