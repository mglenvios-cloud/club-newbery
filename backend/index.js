const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ─── Validación de variables de entorno (debe ser lo primero) ─────────────────
const { PORT, FRONTEND_URL, NODE_ENV } = require('./config/env');


const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const postRoutes = require('./routes/posts');
const playerRoutes = require('./routes/players');
const mpRoutes = require('./routes/mercadopago');
const aiRoutes = require('./routes/gemini');
const newsRoutes = require('./routes/news');
const teamRoutes = require('./routes/teams');
const matchRoutes = require('./routes/matches');
const mediaRoutes = require('./routes/media');
const futsalNewsRoutes = require('./routes/futsalNews');
const liveMatchRoutes = require('./routes/liveMatch');
const integrationsRoutes = require('./routes/integrations');
const publicidadRoutes = require('./routes/publicidad');
const gestionDeportivaRoutes = require('./routes/gestionDeportiva');
const demoContactRoutes = require('./routes/demoContact');
// ─── Nuevas rutas Fase 2 ───────────────────────────────────────────────────────
const technicalStaffRoutes = require('./routes/technicalStaff');
const clubEventsRoutes = require('./routes/clubEvents');
const medicalRecordsRoutes = require('./routes/medicalRecords');
const playerDocsRoutes = require('./routes/playerDocs');
// ─── Nuevas rutas Fase 2.5 ─────────────────────────────────────────────────────
const administracionGeneralRoutes = require('./routes/administracionGeneral');
// ─── Nuevas rutas Fase 3 ───────────────────────────────────────────────────────
const sociosRoutes = require('./routes/socios');
// ─── Nuevas rutas Fase 4 ───────────────────────────────────────────────────────
const finanzasRoutes = require('./routes/finanzas');
const ligaProStudioRoutes = require('./routes/ligaProStudio');
const reservasRoutes = require('./routes/reservas');
const newberytvRoutes = require('./routes/newberytv');

const app = express();

// ─── CORS — Lista blanca de orígenes permitidos ────────────────────────────────
const allowedOrigins = [
  FRONTEND_URL,
  // En desarrollo local, permitir localhost
  ...(NODE_ENV !== 'production' ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ] : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`[CORS] Origen bloqueado: ${origin}`);
    return callback(new Error(`CORS: Origen no autorizado: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// Routes — existentes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', mpRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/futsal-news', futsalNewsRoutes);
app.use('/api/live', liveMatchRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/publicidad', publicidadRoutes);
app.use('/api/gestion-deportiva', gestionDeportivaRoutes);
app.use('/api/demo-contact', demoContactRoutes);
// ─── Nuevas rutas Fase 2 ───────────────────────────────────────────────────────
app.use('/api/technical-staff', technicalStaffRoutes);
app.use('/api/club-events', clubEventsRoutes);
app.use('/api/medical', medicalRecordsRoutes);
app.use('/api/player-docs', playerDocsRoutes);
// ─── Nuevas rutas Fase 2.5 ─────────────────────────────────────────────────────
app.use('/api/admin-general', administracionGeneralRoutes);
app.use('/api/socios', sociosRoutes);
// ─── Nuevas rutas Fase 4 ───────────────────────────────────────────────────────
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/liga-pro-studio', ligaProStudioRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/newberytv', newberytvRoutes);

// Servir archivos estáticos subidos de publicidad/sponsors
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Módulo Comercial — ruta específica
app.use('/api/publicidad', publicidadRoutes);



// Alias directos requeridos para verificación
app.get('/api/tutores', async (req, res) => {
  try {
    const list = await require('./modules/socios/services/tutors.service').getAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tutores' });
  }
});

app.get('/api/carnets', async (req, res) => {
  try {
    const list = await require('./modules/socios/services/digitalCards.service').getAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener credenciales' });
  }
});

// Health check — usado por Render para verificar que el servicio está vivo
app.get('/health', async (req, res) => {
  try {
    const prisma = require('./prismaClient');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      message: 'API del Club Jorge Newbery operativa.',
      version: '2.0',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (dbError) {
    res.status(503).json({
      status: 'error',
      message: 'Base de datos no disponible.',
      timestamp: new Date().toISOString()
    });
  }
});

// Root — información básica de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API del Club Jorge Newbery funcionando correctamente.',
    version: '2.0',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📦 Versión 2.0 - ERP Deportivo Club Jorge Newbery`);
});
