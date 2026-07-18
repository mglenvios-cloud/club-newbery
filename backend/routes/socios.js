const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const sociosService = require('../modules/socios/services/socios.service');
const tutorsService = require('../modules/socios/services/tutors.service');
const digitalCardsService = require('../modules/socios/services/digitalCards.service');

const validators = require('../modules/socios/validators/socios.validators');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

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

// Middleware para verificar que sea ADMIN o SUPER_ADMIN
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Middleware para verificar que sea ADMIN o Staff (FUTSAL, OPERADOR)
const requireAdminOrStaff = (req, res, next) => {
  if (!['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o personal de staff.' });
  }
  next();
};

// Aplicar protección de autenticación JWT a todas las rutas de este router
router.use(authenticateToken);


// ═══════════════════════════════════════════════════════════════════════════
// SOCIOS (MEMBERS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/', requireAdminOrStaff, async (req, res) => {
  try {
    const list = await sociosService.getAll(req.query, 1);
    res.json(list);
  } catch (error) {
    logError({ module: 'SociosRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener socios.' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const validationError = validators.validateSocio(req.body, false);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const socio = await sociosService.create(1, req.body);
    res.status(201).json(socio);
  } catch (error) {
    logError({ module: 'SociosRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al crear socio.' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateSocio(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const socio = await sociosService.update(parseInt(id), req.body);
    res.json(socio);
  } catch (error) {
    logError({ module: 'SociosRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar socio.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await sociosService.remove(parseInt(id));
    res.json({ message: 'Socio eliminado exitosamente del sistema.' });
  } catch (error) {
    logError({ module: 'SociosRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar socio.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TUTORES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/tutores', requireAdminOrStaff, async (req, res) => {
  try {
    const list = await tutorsService.getAll();
    res.json(list);
  } catch (error) {
    logError({ module: 'TutorsRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener tutores.' });
  }
});

router.post('/tutores', requireAdmin, async (req, res) => {
  try {
    const validationError = validators.validateTutor(req.body, false);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const tutor = await tutorsService.create(req.body);
    res.status(201).json(tutor);
  } catch (error) {
    logError({ module: 'TutorsRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al crear tutor.' });
  }
});

router.put('/tutores/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateTutor(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const tutor = await tutorsService.update(parseInt(id), req.body);
    res.json(tutor);
  } catch (error) {
    logError({ module: 'TutorsRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar tutor.' });
  }
});

router.delete('/tutores/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await tutorsService.remove(parseInt(id));
    res.json({ message: 'Tutor eliminado exitosamente.' });
  } catch (error) {
    logError({ module: 'TutorsRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar tutor.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CARNETS DIGITALES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/carnets', requireAdminOrStaff, async (req, res) => {
  try {
    const list = await digitalCardsService.getAll();
    res.json(list);
  } catch (error) {
    logError({ module: 'DigitalCardsRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener credenciales.' });
  }
});

router.post('/carnets/generate/:socioId', requireAdmin, async (req, res) => {
  const { socioId } = req.params;
  try {
    const idError = validators.validateId(socioId);
    if (idError) return res.status(400).json({ error: idError });

    const card = await digitalCardsService.generate(parseInt(socioId));
    res.status(201).json(card);
  } catch (error) {
    logError({ module: 'DigitalCardsRoute', action: 'generate', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al generar credencial digital.' });
  }
});

router.get('/carnets/:id', requireAdminOrStaff, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const card = await digitalCardsService.get(parseInt(id));
    if (!card) return res.status(404).json({ error: 'Credencial no encontrada.' });

    res.json(card);
  } catch (error) {
    logError({ module: 'DigitalCardsRoute', action: 'get', error, req });
    res.status(500).json({ error: 'Error al obtener credencial.' });
  }
});

module.exports = router;
