const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// ─── Versionado Unificado ──────────────────────────────────────────────────────
const versionInfo = require('../shared/version');

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
// ─── Nuevas rutas Fase 7 & 7.1 ─────────────────────────────────────────────────
const systemStatusRoutes = require('./routes/systemStatus');
const backupRoutes = require('./routes/backup');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const { provisionNewClub } = require('./services/clubProvisioning.service');

const startTime = Date.now();
const app = express();

// ─── SEGURIDAD: Helmet & Rate Limiting ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Desactivado para flexibilizar fuentes de imágenes y streaming
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite de 300 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones desde esta IP, intente más tarde." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Límite estricto de logins
  message: { error: "Demasiados intentos de acceso, intente más tarde." }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── CORS — Lista blanca de orígenes permitidos ────────────────────────────────
const allowedOrigins = [
  FRONTEND_URL,
  'https://frontend-indol-rho-38.vercel.app',
  ...(NODE_ENV !== 'production' ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ] : []),
].filter(Boolean).map(url => url.trim().replace(/[\r\n]/g, '').replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                      normalizedOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }
    console.error(`[CORS] Origen bloqueado: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Club-Slug'],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// ─── Resolution de Inquilino (Multi-Tenant) ────────────────────────────────────
app.use(tenantMiddleware);

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
      
      if (prisma && prisma.auditLog) {
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
            clubId: req.user ? req.user.clubId || 1 : (req.club ? req.club.id : 1)
          }
        }).catch(err => {
          console.error('[AuditLog Error]', err.message);
        });
      }
      
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

// ─── Rutas de Futsal AFA (Alias de compatibilidad) ───────────────────────────
app.use('/api/futsal/teams', teamRoutes);
app.use('/api/futsal/players', playerRoutes);
app.use('/api/futsal/matches', matchRoutes);

// ─── Rutas Comerciales directas ───────────────────────────────────────────────
app.use('/api', publicidadRoutes);

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

// ─── Nuevas rutas Fase 7 & 7.1 ─────────────────────────────────────────────────
app.use('/api/system-status', systemStatusRoutes);
app.use('/api/admin-general/backups', backupRoutes);

// Endpoint de consulta de logs de auditoría
app.get('/api/admin-general/audit-logs', async (req, res) => {
  try {
    if (!prisma || !prisma.auditLog) {
      return res.json([]);
    }
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar logs de auditoría' });
  }
});

// Endpoint de auto-provisionamiento de club
app.post('/api/admin-general/provision-club', async (req, res) => {
  try {
    const { nombre, slug, emailAdmin, passwordAdmin } = req.body;
    const result = await provisionNewClub({ nombre, slug, emailAdmin, passwordAdmin });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al provisionar club: ' + err.message });
  }
});

// Servir archivos estáticos subidos de publicidad/sponsors
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ─── Health Check Extendido (FASE 7.1 Standard) ────────────────────────────────
app.get(['/health', '/api/health'], async (req, res) => {
  let dbStatus = 'disconnected';
  let isDegraded = false;

  try {
    if (prisma && prisma.$queryRaw) {
      await prisma.$queryRaw`SELECT 1`;
    }
    dbStatus = 'connected';
  } catch (dbError) {
    dbStatus = 'disconnected';
    isDegraded = true;
  }

  const overallStatus = isDegraded ? 'degraded' : 'ok';
  const statusCode = isDegraded ? 503 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    version: versionInfo.VERSION,
    environment: NODE_ENV || 'production',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbStatus,
    api: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Root — información básica de la API
app.get('/', (req, res) => {
  res.json({
    message: `${versionInfo.APP_NAME} API funcionando correctamente.`,
    version: versionInfo.VERSION,
    apiVersion: versionInfo.API_VERSION,
    buildDate: versionInfo.BUILD_DATE,
    health: '/api/health',
    statusUrl: '/api/system-status',
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
  console.log(`📦 Versión ${versionInfo.VERSION} - ${versionInfo.APP_NAME}`);
});
