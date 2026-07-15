const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

// Services
const bookingsService = require('../modules/reservas/services/bookings.service');
const schedulesService = require('../modules/reservas/services/schedules.service');
const pricesService = require('../modules/reservas/services/prices.service');

// Validators
const { validateBooking, validateSchedule } = require('../modules/reservas/validators/reservas.validators');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');

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

// Optional JWT authentication helper (does not reject if unauthenticated)
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

// ─── FACILITIES ENDPOINTS ──────────────────────────────────────────────────

// GET /api/reservas/facilities
// Returns all active facilities of type CANCHA or similar
router.get('/facilities', async (req, res) => {
  try {
    const list = await prisma.facility.findMany({
      where: { status: 'ACTIVE' },
      include: { sede: true }
    });
    res.json(list);
  } catch (error) {
    logError({ module: 'Reservas', action: 'getFacilities', error, req });
    res.status(500).json({ error: 'Error al listar las instalaciones deportivas.' });
  }
});


// ─── AVAILABILITY ENDPOINTS ────────────────────────────────────────────────

// GET /api/reservas/availability?facilityId=X&date=YYYY-MM-DD
router.get('/availability', async (req, res) => {
  const { facilityId, date } = req.query;
  try {
    if (!facilityId || !date) {
      return res.status(400).json({ error: 'Faltan parámetros de consulta: facilityId y date son obligatorios.' });
    }
    const availability = await schedulesService.checkAvailability(facilityId, date);
    res.json(availability);
  } catch (error) {
    logError({ module: 'Reservas', action: 'checkAvailability', error, req });
    res.status(500).json({ error: 'Error al consultar disponibilidad de turnos.' });
  }
});


// ─── BOOKINGS ENDPOINTS ────────────────────────────────────────────────────

// GET /api/reservas/bookings
// Admin lists all, Socio lists their own bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR'].includes(req.user.role);
    if (isStaff) {
      const allBookings = await bookingsService.getAllBookings();
      return res.json(allBookings);
    }

    // Si es un socio/usuario normal, buscar su socioId
    const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
    if (!socio) {
      return res.json([]); // No es socio, no tiene reservas
    }

    const myBookings = await prisma.booking.findMany({
      where: { socioId: socio.id },
      include: { facility: true },
      orderBy: { fecha: 'desc' }
    });
    res.json(myBookings);
  } catch (error) {
    logError({ module: 'Reservas', action: 'getBookings', error, req });
    res.status(500).json({ error: 'Error al listar las reservas.' });
  }
});

// POST /api/reservas/bookings
// Create booking (Authenticated Socio or Public)
router.post('/bookings', optionalAuthenticate, validateBooking, async (req, res) => {
  try {
    const payload = { ...req.body };
    
    // Si está autenticado, intentar asociar la reserva a su socioId automáticamente
    if (req.user) {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      if (socio) {
        payload.socioId = socio.id;
        payload.tipoReserva = 'SOCIO';
      }
    }

    const newBooking = await bookingsService.createBooking(payload);
    res.status(201).json(newBooking);
  } catch (error) {
    logError({ module: 'Reservas', action: 'createBooking', error, req });
    res.status(400).json({ error: error.message || 'Error al registrar la reserva.' });
  }
});

// PUT /api/reservas/bookings/:id
// Admin can edit/confirm bookings
router.put('/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Si no es admin, verificar que la reserva le pertenezca a este socio
    if (req.user.role !== 'ADMIN') {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      const booking = await prisma.booking.findUnique({ where: { id: parseInt(id, 10) } });
      if (!socio || !booking || booking.socioId !== socio.id) {
        return res.status(403).json({ error: 'Acceso denegado. No posee permisos para modificar esta reserva.' });
      }
    }

    const updated = await bookingsService.updateBooking(id, req.body);
    res.json(updated);
  } catch (error) {
    logError({ module: 'Reservas', action: 'updateBooking', error, req });
    res.status(500).json({ error: 'Error al actualizar la reserva.' });
  }
});

// DELETE /api/reservas/bookings/:id
// Cancel / Delete reservation
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Si no es admin, verificar que la reserva le pertenezca a este socio
    if (req.user.role !== 'ADMIN') {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      const booking = await prisma.booking.findUnique({ where: { id: parseInt(id, 10) } });
      if (!socio || !booking || booking.socioId !== socio.id) {
        return res.status(403).json({ error: 'Acceso denegado. No posee permisos para cancelar esta reserva.' });
      }
    }

    await bookingsService.deleteBooking(id);
    res.json({ message: 'Reserva eliminada / cancelada correctamente.' });
  } catch (error) {
    logError({ module: 'Reservas', action: 'deleteBooking', error, req });
    res.status(500).json({ error: 'Error al cancelar la reserva.' });
  }
});

module.exports = router;
