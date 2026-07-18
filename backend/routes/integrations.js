const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');
const CONFIG_PATH = path.join(__dirname, '../config/lps-config.json');

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

// Middleware to require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Acceso denegado. Permisos de administrador requeridos.' });
  }
  next();
};

// URL validation helper
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Read configuration from disk
const readConfig = () => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      apiUrl: '', apiKey: '', clubId: '', token: '', webhookUrl: '',
      mode: 'test', connected: false, lastSync: null, syncCount: 0,
      sponsors: [
        { id: 'header', label: 'Encabezado del partido', imageUrl: '', linkUrl: '', active: false },
        { id: 'between-stats', label: 'Entre estadísticas', imageUrl: '', linkUrl: '', active: false },
        { id: 'below-player', label: 'Debajo del reproductor', imageUrl: '', linkUrl: '', active: false },
        { id: 'footer', label: 'Pie de página', imageUrl: '', linkUrl: '', active: false }
      ]
    };
  }
};

// Save configuration to disk
const writeConfig = (data) => {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// ─── GET /api/integrations/lps ──────────────────────────────────────────────
router.get('/lps', (req, res) => {
  try {
    const config = readConfig();
    res.json({
      ...config,
      token: config.token ? '••••••••' : '',
      apiKey: config.apiKey ? '••••••••' : ''
    });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getConfig', error, req });
    res.status(500).json({ error: 'Error al leer la configuración de integración.' });
  }
});

// ─── GET /api/integrations/lps/full (Admin only) ────────────────────────────
router.get('/lps/full', authenticateToken, requireAdmin, (req, res) => {
  try {
    const config = readConfig();
    res.json(config);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getConfigFull', error, req });
    res.status(500).json({ error: 'Error al leer la configuración completa.' });
  }
});

// ─── GET /api/integrations/lps/status ───────────────────────────────────────
router.get('/lps/status', (req, res) => {
  try {
    const config = readConfig();
    res.json({
      connected: config.connected,
      mode: config.mode,
      lastSync: config.lastSync,
      syncCount: config.syncCount,
      hasCredentials: !!(config.apiUrl && config.apiKey && config.clubId),
      provider: 'Liga Pro Studio'
    });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getStatus', error, req });
    res.status(500).json({ error: 'Error al obtener estado de integración.' });
  }
});

// ─── PUT /api/integrations/lps (Admin only) ─────────────────────────────────
router.put('/lps', authenticateToken, requireAdmin, (req, res) => {
  const { apiUrl, apiKey, clubId, token, webhookUrl, mode } = req.body;
  try {
    if (apiUrl && !isValidUrl(apiUrl)) {
      return res.status(400).json({ error: 'La API URL especificada no posee un formato correcto.' });
    }
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return res.status(400).json({ error: 'La URL del Webhook no posee un formato correcto.' });
    }

    const current = readConfig();
    const updated = {
      ...current,
      apiUrl: apiUrl ?? current.apiUrl,
      apiKey: apiKey && apiKey !== '••••••••' ? apiKey : current.apiKey,
      clubId: clubId ?? current.clubId,
      token: token && token !== '••••••••' ? token : current.token,
      webhookUrl: webhookUrl ?? current.webhookUrl,
      mode: mode ?? current.mode,
    };

    writeConfig(updated);
    res.json({ message: 'Configuración guardada correctamente.', mode: updated.mode });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'saveConfig', error, req });
    res.status(500).json({ error: 'Error al guardar la configuración.' });
  }
});

// ─── PUT /api/integrations/lps/sponsors (Admin only) ────────────────────────
router.put('/lps/sponsors', authenticateToken, requireAdmin, (req, res) => {
  const { sponsors } = req.body;
  try {
    if (!Array.isArray(sponsors)) {
      return res.status(400).json({ error: 'Se esperaba una lista de patrocinadores.' });
    }

    // Validate sponsor URLs
    for (const sp of sponsors) {
      if (sp.active) {
        if (sp.imageUrl && !isValidUrl(sp.imageUrl)) {
          return res.status(400).json({ error: `La URL de la imagen para "${sp.label}" no posee un formato válido.` });
        }
        if (sp.linkUrl && !isValidUrl(sp.linkUrl)) {
          return res.status(400).json({ error: `El enlace de redirección para "${sp.label}" no posee un formato válido.` });
        }
      }
    }

    const current = readConfig();
    const updated = { ...current, sponsors };
    writeConfig(updated);
    res.json({ message: 'Espacios publicitarios actualizados con éxito.', sponsors: updated.sponsors });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'saveSponsors', error, req });
    res.status(500).json({ error: 'Error al actualizar sponsors.' });
  }
});

// ─── GET /api/integrations/lps/sponsors ─────────────────────────────────────
router.get('/lps/sponsors', (req, res) => {
  try {
    const config = readConfig();
    res.json(config.sponsors || []);
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'getSponsors', error, req });
    res.status(500).json({ error: 'Error al obtener anunciantes.' });
  }
});

// ─── POST /api/integrations/lps/sync (Admin only) ───────────────────────────
router.post('/lps/sync', authenticateToken, requireAdmin, (req, res) => {
  try {
    const config = readConfig();

    if (!config.apiUrl || !config.apiKey || !config.clubId) {
      return res.status(400).json({
        error: 'Configuración incompleta. Defina la API URL, API KEY y CLUB ID de Liga Pro Studio antes de sincronizar.'
      });
    }

    const updated = {
      ...config,
      lastSync: new Date().toISOString(),
      syncCount: (config.syncCount || 0) + 1,
      connected: true
    };
    writeConfig(updated);

    res.json({
      message: 'Sincronización simulada completada. La API se integrará cuando esté en producción.',
      lastSync: updated.lastSync,
      syncCount: updated.syncCount
    });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'syncLps', error, req });
    res.status(500).json({ error: 'Error al sincronizar datos.' });
  }
});

// ─── POST /api/integrations/lps/disconnect (Admin only) ─────────────────────
router.post('/lps/disconnect', authenticateToken, requireAdmin, (req, res) => {
  try {
    const current = readConfig();
    const updated = { ...current, connected: false };
    writeConfig(updated);
    res.json({ message: 'Liga Pro Studio desconectada del canal.' });
  } catch (error) {
    logError({ module: 'LigaProStudio', action: 'disconnectLps', error, req });
    res.status(500).json({ error: 'Error al desconectar integración.' });
  }
});

module.exports = router;
