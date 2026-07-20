'use strict';

/**
 * ─── Middleware Multi-Tenant (Club Resolution) ──────────────────────────────
 * Resuelve dinámicamente el inquilino (Club) basado en:
 *  1. Header `x-club-slug`
 *  2. Query Param `?club=slug`
 *  3. Subdominio en el Header `Host`
 *  4. Fallback por defecto: `demo` / `jorge-newbery` (Cliente Demo)
 */

const prisma = require('../prismaClient');

const CLUBS_FALLBACK = [
  {
    id: 1,
    nombre: "Club Jorge Newbery (Demo)",
    slug: "jorge-newbery",
    colorPrimario: "#cc0000",
    colorSecundario: "#000000",
    email: "contacto@jorge-newbery.com",
    estado: "ACTIVO"
  },
  {
    id: 2,
    nombre: "Club Deportivo Demo",
    slug: "demo",
    colorPrimario: "#0066cc",
    colorSecundario: "#ffffff",
    email: "contacto@clubdemo.com",
    estado: "ACTIVO"
  }
];

module.exports = async function tenantMiddleware(req, res, next) {
  try {
    let clubSlug = req.headers['x-club-slug'] || req.query.club;

    if (!clubSlug) {
      const host = req.headers.host || '';
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        clubSlug = parts[0];
      }
    }

    if (!clubSlug) {
      clubSlug = 'jorge-newbery'; // Cliente de demostración por defecto
    }

    let activeClub = null;
    try {
      if (prisma && prisma.club) {
        activeClub = await prisma.club.findUnique({
          where: { slug: clubSlug }
        });
      }
    } catch (_) {
      // Ignorar error de consulta y usar fallback
    }

    if (!activeClub) {
      activeClub = CLUBS_FALLBACK.find(c => c.slug === clubSlug) || CLUBS_FALLBACK[0];
    }

    if (activeClub.estado && activeClub.estado !== 'ACTIVO') {
      return res.status(403).json({
        error: "La licencia de este club se encuentra suspendida o inactiva.",
        clubSlug
      });
    }

    req.club = activeClub;
    next();
  } catch (err) {
    res.status(500).json({ error: "Error interno al resolver inquilino: " + err.message });
  }
};
