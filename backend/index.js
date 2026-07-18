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
  'https://frontend-indol-rho-38.vercel.app', // Respaldo explícito para producción en Vercel
  // En desarrollo local, permitir localhost
  ...(NODE_ENV !== 'production' ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ] : []),
].filter(Boolean).map(url => url.trim().replace(/[\r\n]/g, '').replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Normalizar origen entrante
    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    // Validar si el origen está permitido por lista o coincide con wildcard de Vercel
    const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                      normalizedOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }

    console.error(`[CORS] Origen bloqueado: ${origin}`);
    // No lanzar error Express (evita respuesta 500 en preflight OPTIONS), solo retornar false
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// ─── Middleware Global de Auditoría ──────────────────────────────────────────
const prisma = require('./prismaClient');
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const originalJson = res.json;
    res.json = function (body) {
      res.json = originalJson;
      const result = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : `FAILED (${res.statusCode})`;
      const moduleName = req.baseUrl ? req.baseUrl.replace('/api/', '').toUpperCase() : req.path.split('/')[2]?.toUpperCase() || 'GENERAL';
      
      const userId = req.user ? parseInt(req.user.userId || req.user.dbUserId) || null : null;
      const userName = req.user ? req.user.email || `User #${req.user.userId}` : 'Anónimo';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      
      let entityId = null;
      if (req.params && req.params.id) {
        entityId = parseInt(req.params.id) || null;
      } else if (body && body.id) {
        entityId = parseInt(body.id) || null;
      }
      
      const detailsStr = JSON.stringify({
        path: req.originalUrl,
        body: req.body ? { ...req.body, password: req.body.password ? '***' : undefined } : null,
        result
      });
      
      prisma.auditLog.create({
        data: {
          action: req.method,
          entity: moduleName,
          entityId,
          entityName: `${req.method} ${req.originalUrl}`,
          userId,
          userName,
          details: detailsStr.substring(0, 1000),
          ipAddress: ip,
          clubId: req.user ? req.user.clubId || 1 : 1
        }
      }).catch(err => {
        console.error('[AuditLog Error]', err.message);
      });
      
      return originalJson.call(this, body);
    };
  }
  next();
});

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
