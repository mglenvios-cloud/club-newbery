const bcrypt = require('bcryptjs');
const prisma = require('../../../prismaClient');

// ═══════════════════════════════════════════════════════════════════════════
// ROLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los roles.
 * @param {number} [clubId=1]
 * @returns {Promise<Role[]>}
 */
async function getAllRoles(clubId = 1) {
  return prisma.role.findMany({
    where: { clubId },
    orderBy: { name: 'asc' }
  });
}

/**
 * Crea un nuevo rol.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<Role>}
 */
async function createRole(clubId = 1, data) {
  const { name, description, permissions } = data;

  return prisma.role.create({
    data: {
      name: name.trim(),
      description: description || '',
      permissions: Array.isArray(permissions) ? JSON.stringify(permissions) : (permissions || '[]'),
      clubId
    }
  });
}

/**
 * Actualiza un rol existente.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Role>}
 */
async function updateRole(id, data) {
  const { name, description, permissions } = data;

  return prisma.role.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      description,
      permissions: Array.isArray(permissions) ? JSON.stringify(permissions) : permissions
    }
  });
}

/**
 * Elimina un rol.
 * @param {number} id
 * @returns {Promise<Role>}
 */
async function removeRole(id) {
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Rol no encontrado');
    err.statusCode = 404;
    throw err;
  }

  // Desvincular usuarios asociados a este rol
  await prisma.user.updateMany({
    where: { roleId: id },
    data: { roleId: null }
  });

  return prisma.role.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los usuarios del club, incluyendo su rol.
 * @param {number} [clubId=1]
 * @returns {Promise<User[]>}
 */
async function getAllUsers(clubId = 1) {
  return prisma.user.findMany({
    where: { clubId },
    include: { roleRel: true },
    orderBy: { email: 'asc' }
  });
}

/**
 * Crea un nuevo usuario.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<User>}
 */
async function createUser(clubId = 1, data) {
  const { email, password, role, name, isActive, roleId } = data;

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    const err = new Error('El correo electrónico ya está registrado');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password || '123456', 10);

  return prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'SOCIO',
      name: name || '',
      isActive: isActive !== undefined ? !!isActive : true,
      roleId: roleId ? parseInt(roleId) : null,
      clubId
    }
  });
}

/**
 * Actualiza un usuario.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<User>}
 */
async function updateUser(id, data) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const { email, password, role, name, isActive, roleId } = data;

  const updateData = {
    role,
    name,
    isActive: isActive !== undefined ? !!isActive : undefined,
    roleId: roleId !== undefined ? (roleId ? parseInt(roleId) : null) : undefined
  };

  if (email && email.trim().toLowerCase() !== existing.email) {
    const doubleEmail = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (doubleEmail) {
      const err = new Error('El correo electrónico ya está registrado por otro usuario');
      err.statusCode = 400;
      throw err;
    }
    updateData.email = email.trim().toLowerCase();
  }

  if (password && password.trim() !== '') {
    updateData.password = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: updateData
  });
}

/**
 * Elimina un usuario del sistema.
 * @param {number} id
 * @returns {Promise<User>}
 */
async function removeUser(id) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return prisma.user.delete({ where: { id } });
}

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  removeRole,
  getAllUsers,
  createUser,
  updateUser,
  removeUser
};
