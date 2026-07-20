'use strict';

/**
 * ─── Endpoint de Monitoreo en Tiempo Real `/system-status` ─────────────────────
 */

const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const prisma = require('../prismaClient');
const versionInfo = require('../../shared/version');

const startTime = Date.now();

router.get('/', async (req, res) => {
  let dbStatus = 'connected';
  let dbLatencyMs = 0;
  let isDegraded = false;

  const dbStart = Date.now();
  try {
    if (prisma && prisma.$queryRaw) {
      await prisma.$queryRaw`SELECT 1`;
    }
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'disconnected';
    isDegraded = true;
    dbLatencyMs = Date.now() - dbStart;
  }

  // Información de Memoria
  const memoryUsage = process.memoryUsage();
  const totalSystemMem = os.totalmem();
  const freeSystemMem = os.freemem();

  // Información de CPU
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  // Espacio de almacenamiento sintético/fs
  let storageStats = { freeGB: 'N/A', totalGB: 'N/A' };
  try {
    if (fs.statfsSync) {
      const stats = fs.statfsSync(process.cwd());
      storageStats = {
        freeGB: (stats.bavail * stats.bsize / (1024 * 1024 * 1024)).toFixed(2),
        totalGB: (stats.blocks * stats.bsize / (1024 * 1024 * 1024)).toFixed(2)
      };
    }
  } catch (_) {}

  const overallStatus = isDegraded ? 'degraded' : 'ok';
  const statusCode = isDegraded ? 503 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    appName: versionInfo.APP_NAME,
    version: versionInfo.VERSION,
    apiVersion: versionInfo.API_VERSION,
    buildDate: versionInfo.BUILD_DATE,
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    backend: {
      status: 'operational',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    frontend: {
      status: 'operational',
      url: process.env.FRONTEND_URL || 'Non-configured'
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: 'PostgreSQL / SQLite Adapter'
    },
    api: {
      status: 'operational',
      healthEndpoint: '/api/health'
    },
    metrics: {
      memory: {
        rssMB: (memoryUsage.rss / (1024 * 1024)).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / (1024 * 1024)).toFixed(2),
        systemFreeMemMB: (freeSystemMem / (1024 * 1024)).toFixed(2),
        systemTotalMemMB: (totalSystemMem / (1024 * 1024)).toFixed(2)
      },
      cpu: {
        cores: cpus.length,
        model: cpus[0] ? cpus[0].model : 'Generic CPU',
        loadAverage: loadAvg
      },
      storage: storageStats
    }
  });
});

module.exports = router;
