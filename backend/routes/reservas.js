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
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
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
    // Si no es admin o superadmin, verificar que la reserva le pertenezca a este socio
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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
    // Si no es admin o superadmin, verificar que la reserva le pertenezca a este socio
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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

// ─── SCHEDULES & MAINTENANCE BLOCKS ENDPOINTS ──────────────────────────────────────

// GET /api/reservas/schedules?facilityId=X
router.get('/schedules', async (req, res) => {
  const { facilityId } = req.query;
  try {
    if (facilityId) {
      const list = await schedulesService.getSchedulesByFacility(facilityId);
      return res.json(list);
    }
    const allSchedules = await prisma.schedule.findMany({
      include: { facility: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(allSchedules);
  } catch (error) {
    logError({ module: 'Reservas', action: 'getSchedules', error, req });
    res.status(500).json({ error: 'Error al obtener bloqueos de horario.' });
  }
});

// POST /api/reservas/schedules
router.post('/schedules', authenticateToken, async (req, res) => {
  const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
  if (!isStaff) return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });

  try {
    const { facilityId, dayOfWeek, startTime, endTime, isBlocked, reason } = req.body;
    if (!facilityId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Faltan datos requeridos para crear el bloqueo.' });
    }
    const newSchedule = await schedulesService.createSchedule({
      facilityId,
      dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : 1,
      startTime,
      endTime,
      isBlocked: isBlocked !== undefined ? isBlocked : true,
      reason
    });
    res.status(201).json(newSchedule);
  } catch (error) {
    logError({ module: 'Reservas', action: 'createSchedule', error, req });
    res.status(500).json({ error: 'Error al registrar bloqueo de cancha.' });
  }
});

// DELETE /api/reservas/schedules/:id
router.delete('/schedules/:id', authenticateToken, async (req, res) => {
  const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
  if (!isStaff) return res.status(403).json({ error: 'Acceso denegado.' });

  const { id } = req.params;
  try {
    await prisma.schedule.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Bloqueo / horario liberado exitosamente.' });
  } catch (error) {
    logError({ module: 'Reservas', action: 'deleteSchedule', error, req });
    res.status(500).json({ error: 'Error al eliminar bloqueo de horario.' });
  }
});

// ─── PRICE RULES / TARIFAS ENDPOINTS ──────────────────────────────────────────────

// GET /api/reservas/prices?facilityId=X
router.get('/prices', async (req, res) => {
  const { facilityId } = req.query;
  try {
    if (facilityId) {
      const list = await pricesService.getPriceRulesByFacility(facilityId);
      return res.json(list);
    }
    const allRules = await prisma.priceRule.findMany({
      include: { facility: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(allRules);
  } catch (error) {
    logError({ module: 'Reservas', action: 'getPrices', error, req });
    res.status(500).json({ error: 'Error al obtener tarifas de canchas.' });
  }
});

// POST /api/reservas/prices
router.post('/prices', authenticateToken, async (req, res) => {
  const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
  if (!isStaff) return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });

  try {
    const { facilityId, userType, isPeakHour, price } = req.body;
    if (!facilityId || !userType || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la tarifa (facilityId, userType, price).' });
    }
    const rule = await pricesService.createPriceRule({ facilityId, userType, isPeakHour, price });
    res.status(201).json(rule);
  } catch (error) {
    logError({ module: 'Reservas', action: 'createPriceRule', error, req });
    res.status(500).json({ error: 'Error al guardar regla de tarifa.' });
  }
});

// DELETE /api/reservas/prices/:id
router.delete('/prices/:id', authenticateToken, async (req, res) => {
  const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
  if (!isStaff) return res.status(403).json({ error: 'Acceso denegado.' });

  const { id } = req.params;
  try {
    await prisma.priceRule.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Regla de tarifa eliminada.' });
  } catch (error) {
    logError({ module: 'Reservas', action: 'deletePriceRule', error, req });
    res.status(500).json({ error: 'Error al eliminar regla de tarifa.' });
  }
});

module.exports = router;
