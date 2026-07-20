// routes/clubs.js - Enrutamiento para marca del inquilino y control maestro

const express = require('express');
const router = express.Router();
const clubsController = require('../controllers/clubsController');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const backupController = require('../controllers/backupController');

// ─── MOCK DATABASE SOCIOS CON TENTANT-ISOLATION ──────────────────────────────
let SOCIOS_DB = [
  { id: 's-1', nombre: 'Carlos', apellido: 'Tevez', dni: '32000000', email: 'carlitos@club.com', telefono: '11-5555-9000', estado: 'ACTIVO', clubId: 'club-1', digitalCard: { id: 'card-1', qrCode: 'jorge-newbery-Carlos-Tevez-QR' } },
  { id: 's-2', nombre: 'Juan Roman', apellido: 'Riquelme', dni: '28000000', email: 'roman@club.com', telefono: '11-4444-9000', estado: 'ACTIVO', clubId: 'club-1', digitalCard: { id: 'card-2', qrCode: 'jorge-newbery-Roman-Riquelme-QR' } },
  { id: 's-3', nombre: 'Diego', apellido: 'Maradona', dni: '10000000', email: 'diego@belgrano.com', telefono: '351-555-1010', estado: 'ACTIVO', clubId: 'club-2', digitalCard: { id: 'card-3', qrCode: 'social-belgrano-Diego-Maradona-QR' } }
];

// ─── RUTAS PÚBLICAS DE INQUILINOS (Toman el club activo dinámicamente)
router.get('/public/branding', tenantMiddleware, clubsController.getActiveClubConfig);

// ─── APIS DE SOCIOS (TENANT ENCAPSULADOS)
router.get('/socios', tenantMiddleware, (req, res) => {
  const list = SOCIOS_DB.filter(s => s.clubId === req.club.id);
  res.json(list);
});

router.post('/socios', tenantMiddleware, (req, res) => {
  const { nombre, apellido, dni, email, telefono, estado, tutor } = req.body;
  if (!nombre || !apellido || !dni) {
    return res.status(400).json({ error: "Nombre, Apellido y DNI requeridos." });
  }
  const newSocio = {
    id: `s-${Date.now()}`,
    nombre,
    apellido,
    dni,
    email: email || '',
    telefono: telefono || '',
    estado: estado || 'ACTIVO',
    tutor: tutor || null,
    clubId: req.club.id,
    digitalCard: {
      id: `card-${Date.now()}`,
      qrCode: `${req.club.slug}-${nombre}-${apellido}-QR`
    }
  };
  SOCIOS_DB.push(newSocio);
  res.status(201).json(newSocio);
});

router.put('/socios/:id', tenantMiddleware, (req, res) => {
  const { id } = req.params;
  const index = SOCIOS_DB.findIndex(s => s.id === id && s.clubId === req.club.id);
  if (index === -1) {
    return res.status(404).json({ error: "Socio no encontrado en esta franquicia." });
  }
  SOCIOS_DB[index] = {
    ...SOCIOS_DB[index],
    ...req.body,
    id: SOCIOS_DB[index].id, // protect ID
    clubId: req.club.id // protect Tenant
  };
  res.json(SOCIOS_DB[index]);
});

router.delete('/socios/:id', tenantMiddleware, (req, res) => {
  const { id } = req.params;
  const index = SOCIOS_DB.findIndex(s => s.id === id && s.clubId === req.club.id);
  if (index === -1) {
    return res.status(404).json({ error: "Socio no encontrado." });
  }
  const deleted = SOCIOS_DB.splice(index, 1);
  res.json({ message: "Socio removido.", socio: deleted[0] });
});

// ─── APIS DE COPIAS DE SEGURIDAD (RESPALDO TENANT)
router.get('/backup/export', tenantMiddleware, backupController.exportClubData);
router.post('/backup/restore', tenantMiddleware, backupController.restoreClubData);


// ─── RUTAS DEL PANEL MAESTRO (SuperAdmin general)
router.get('/master/clubs', clubsController.listAllClubs);
router.post('/master/clubs', clubsController.createClub);
router.put('/master/clubs/:id', clubsController.updateClub);
router.patch('/master/clubs/:id/status', clubsController.toggleClubStatus);

module.exports = router;
