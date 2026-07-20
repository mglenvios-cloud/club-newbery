// index.js - Servidor Express base de Club Digital Pro (Multi-Tenant SaaS)

const express = require('express');
const cors = require('cors');
const clubsRouter = require('./routes/clubs');

const app = express();
const PORT = process.env.PORT || 5050;

// Configuración básica de CORS
app.use(cors({
  origin: '*', // Permitir peticiones desde cualquier origen (subdominios del frontend)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-club-slug']
}));

app.use(express.json());

// 🛡️ API Rate Limiter (Protección contra fuerza bruta en producción)
const rateLimits = {};
app.use('/api', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }
  // Filtrar peticiones de más de 1 minuto
  rateLimits[ip] = rateLimits[ip].filter(t => now - t < 60000);
  
  if (rateLimits[ip].length >= 100) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Límite de 100 peticiones por minuto." });
  }
  
  rateLimits[ip].push(now);
  next();
});

// Inyección de rutas base
app.use('/api', clubsRouter);

// Ruta de estado general del sistema
app.get('/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    platform: "Club Digital Pro SaaS",
    version: "1.0.0-fase1",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Club Digital Pro Server escuchando en http://localhost:${PORT}`);
});
