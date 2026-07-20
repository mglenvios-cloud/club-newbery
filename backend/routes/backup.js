'use strict';

/**
 * ─── Rutas de Gestión de Backups (Importación / Exportación / Programación) ────
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const { dualAuth, requireAdmin } = require('../middleware/firebaseAuth');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Endpoint: Exportación manual de datos (JSON, CSV, SQL)
 * GET /api/admin-general/backups/export?format=json|csv|sql
 */
router.get('/export', dualAuth, requireAdmin, async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Recuperar datos principales
    let users = [];
    let members = [];
    let categories = [];
    let transactions = [];
    let auditLogs = [];

    try {
      if (prisma.user) users = await prisma.user.findMany();
      if (prisma.member) members = await prisma.member.findMany();
      if (prisma.category) categories = await prisma.category.findMany();
      if (prisma.transaction) transactions = await prisma.transaction.findMany();
      if (prisma.auditLog) auditLogs = await prisma.auditLog.findMany({ take: 500 });
    } catch (_) {}

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      clubId: req.user ? req.user.clubId || 1 : 1,
      counts: {
        users: users.length,
        members: members.length,
        categories: categories.length,
        transactions: transactions.length,
        auditLogs: auditLogs.length
      },
      data: {
        users,
        members,
        categories,
        transactions,
        auditLogs
      }
    };

    if (format === 'json') {
      const filename = `backup_club_${timestamp}.json`;
      const filePath = path.join(BACKUP_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(JSON.stringify(backupData, null, 2));
    }

    if (format === 'csv') {
      // Formato CSV para Miembros
      const headers = ['id', 'name', 'email', 'dni', 'status', 'createdAt'];
      const csvLines = [headers.join(',')];
      members.forEach(m => {
        csvLines.push([
          m.id,
          `"${(m.name || m.nombre || '').replace(/"/g, '""')}"`,
          `"${m.email || ''}"`,
          `"${m.dni || ''}"`,
          `"${m.status || m.estado || 'ACTIVO'}"`,
          `"${m.createdAt || ''}"`
        ].join(','));
      });
      const csvContent = csvLines.join('\n');
      const filename = `members_backup_${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    }

    if (format === 'sql') {
      let sqlScript = `-- Club Digital Pro Database Dump\n-- Generated at: ${new Date().toISOString()}\n\n`;
      sqlScript += `-- Users Dump\n`;
      users.forEach(u => {
        sqlScript += `INSERT INTO "User" ("id", "email", "name", "role") VALUES (${u.id}, '${u.email}', '${u.name || ''}', '${u.role || 'SOCIO'}') ON CONFLICT DO NOTHING;\n`;
      });
      sqlScript += `\n-- Members Dump\n`;
      members.forEach(m => {
        sqlScript += `INSERT INTO "Member" ("id", "name", "email", "dni") VALUES (${m.id}, '${m.name || m.nombre || ''}', '${m.email || ''}', '${m.dni || ''}') ON CONFLICT DO NOTHING;\n`;
      });

      const filename = `database_dump_${timestamp}.sql`;
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(sqlScript);
    }

    return res.status(400).json({ error: 'Formato de exportación no soportado. Usar json, csv o sql.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar backup: ' + error.message });
  }
});

/**
 * Endpoint: Disparo de Backup Manual almacenado en servidor
 * POST /api/admin-general/backups/trigger
 */
router.post('/trigger', dualAuth, requireAdmin, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auto_backup_${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    let members = [];
    let users = [];
    try {
      if (prisma.member) members = await prisma.member.findMany();
      if (prisma.user) users = await prisma.user.findMany();
    } catch (_) {}

    const payload = {
      timestamp: new Date().toISOString(),
      type: 'MANUAL_TRIGGER',
      usersCount: users.length,
      membersCount: members.length,
      data: { users, members }
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

    res.json({
      success: true,
      message: 'Backup manual generado y guardado en servidor.',
      filename,
      filePath
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar backup manual: ' + err.message });
  }
});

/**
 * Endpoint: Importación completa de backup JSON
 * POST /api/admin-general/backups/import
 */
router.post('/import', dualAuth, requireAdmin, async (req, res) => {
  try {
    const { backupData } = req.body;
    if (!backupData || !backupData.data) {
      return res.status(400).json({ error: 'Estructura de backup JSON inválida.' });
    }

    const { users = [], members = [] } = backupData.data;
    let restoredUsers = 0;
    let restoredMembers = 0;

    for (const u of users) {
      try {
        if (prisma.user) {
          await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, role: u.role },
            create: { email: u.email, password: u.password || 'imported', name: u.name, role: u.role }
          });
          restoredUsers++;
        }
      } catch (_) {}
    }

    for (const m of members) {
      try {
        if (prisma.member) {
          await prisma.member.create({
            data: { name: m.name || m.nombre, email: m.email, dni: m.dni }
          });
          restoredMembers++;
        }
      } catch (_) {}
    }

    res.json({
      success: true,
      message: 'Importación completa realizada.',
      restoredUsers,
      restoredMembers
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al importar backup: ' + err.message });
  }
});

module.exports = router;
