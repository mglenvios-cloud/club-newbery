'use strict';

/**
 * ─── Middleware de Autenticación Dual: JWT + Firebase Auth ────────────────────
 *
 * ESTRATEGIA DE MIGRACIÓN INCREMENTAL:
 * Este middleware soporta AMBOS sistemas de autenticación en simultáneo:
 *
 *   1. Firebase ID Token (nuevo): Header "Authorization: Bearer <firebase-id-token>"
 *      El token es verificado con Firebase Admin SDK.
 *
 *   2. JWT manual (legacy): Header "Authorization: Bearer <jwt-token>"
 *      El token es verificado con jsonwebtoken + JWT_SECRET.
 *      Se mantiene para compatibilidad mientras dure la transición.
 *
 * CÓMO FUNCIONA:
 *   - Intenta verificar el token con Firebase primero.
 *   - Si falla (token no es Firebase), intenta con JWT.
 *   - Si ambos fallan, responde 403.
 *   - req.user siempre contiene: { userId, uid, email, role }
 *
 * Una vez que el frontend esté 100% migrado a Firebase Auth,
 * se puede eliminar el bloque JWT de este archivo.
 */

const jwt = require('jsonwebtoken');
const admin = require('../config/firebase-admin');
const { JWT_SECRET } = require('../config/env');

/**
 * Middleware principal — requerido, falla con 401/403 si no hay token válido.
 * Reemplaza `authenticateToken` en todas las rutas.
 */
const dualAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  // ─── Intento 1: Firebase ID Token ─────────────────────────────────────────
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid:      decoded.uid,
      userId:   decoded.dbUserId || null, // Custom Claim: ID de PostgreSQL
      dbUserId: decoded.dbUserId || null,
      email:    decoded.email,
      role:     decoded.role || 'SOCIO',  // Custom Claim
    };
    return next();
  } catch (firebaseErr) {
    // No es un Firebase token — intentar con JWT
  }

  // ─── Intento 2: JWT legacy ─────────────────────────────────────────────────
  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        uid:      null,
        userId:   decoded.userId,
        dbUserId: decoded.userId,
        email:    decoded.email || null,
        role:     decoded.role || 'SOCIO',
      };
      return next();
    } catch (jwtErr) {
      // Token inválido en ambos sistemas
      return res.sendStatus(403);
    }
  }

  return res.sendStatus(403);
};

/**
 * Middleware opcional — no falla si no hay token.
 * Útil para rutas que funcionan tanto autenticadas como anónimas.
 * Reemplaza `optionalAuthenticate`.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  // Intentar Firebase primero
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid:      decoded.uid,
      userId:   decoded.dbUserId || null,
      dbUserId: decoded.dbUserId || null,
      email:    decoded.email,
      role:     decoded.role || 'SOCIO',
    };
    return next();
  } catch (_) {}

  // Intentar JWT legacy
  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        uid:      null,
        userId:   decoded.userId,
        dbUserId: decoded.userId,
        email:    decoded.email || null,
        role:     decoded.role || 'SOCIO',
      };
      return next();
    } catch (_) {}
  }

  // Token inválido — continuar como anónimo
  req.user = null;
  next();
};

/**
 * Guard: solo ADMIN
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

/**
 * Guard: ADMIN, FUTSAL u OPERADOR
 */
const requireAdminOrStaff = (req, res, next) => {
  if (!req.user || (!['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role))) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o personal de staff.' });
  }
  next();
};

module.exports = { dualAuth, optionalAuth, requireAdmin, requireAdminOrStaff };
