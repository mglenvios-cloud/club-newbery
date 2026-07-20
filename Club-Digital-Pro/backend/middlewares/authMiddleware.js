// authMiddleware.js - Seguridad y control de roles por club (Tenant RBAC)

// Roles válidos del sistema
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_CLUB: 'ADMIN_CLUB',
  SECRETARIA: 'SECRETARIA',
  PROFESOR: 'PROFESOR',
  PERIODISTA: 'PERIODISTA',
  SOCIO: 'SOCIO'
};

/**
 * Middleware para validar que el usuario pertenece al club de la solicitud
 */
function verifyClubMembership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autorizado. Sesión inválida." });
  }

  // SuperAdmin global puede ver cualquier club
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  // Verificar que el club de la sesión coincida con el club del request
  if (req.user.clubId !== req.club.id) {
    return res.status(403).json({ 
      error: "Acceso denegado. No perteneces a esta institución deportiva.",
      userClub: req.user.clubId,
      requestedClub: req.club.id
    });
  }

  next();
}

/**
 * Middleware para exigir ciertos roles específicos
 * @param {string[]} allowedRoles Lista de roles permitidos
 */
function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Sesión no válida." });
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next(); // SuperAdmin tiene permisos sobre todas las rutas
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acceso restringido. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
}

module.exports = {
  ROLES,
  verifyClubMembership,
  authorizeRoles
};
