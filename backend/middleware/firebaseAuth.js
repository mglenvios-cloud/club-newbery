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
 * Guard: exige uno de los roles autorizados
 * @param {string[]} allowedRoles 
 */
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Sesión no válida o token ausente." });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso restringido. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Guard: verifica pertenencia al club de la request
 */
const verifyClubMembership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado. Sesión inválida." });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (req.club && req.user.clubId && req.user.clubId !== req.club.id) {
    return res.status(403).json({
      error: "Acceso denegado. No perteneces a esta institución deportiva.",
      userClub: req.user.clubId,
      requestedClub: req.club.id
    });
  }

  next();
};

module.exports = {
  dualAuth,
  optionalAuth,
  requireAdmin,
  requireAdminOrStaff,
  authorizeRoles,
  verifyClubMembership
};

