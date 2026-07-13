/**
 * Servicio de Entrenadores / Cuerpo Técnico.
 * Encapsula toda la lógica de acceso a datos para el modelo Coach.
 */

const prisma = require('../../../prismaClient');

/**
 * Obtiene todos los coaches con filtro opcional por rol.
 * @param {{ role?: string }} filters
 * @returns {Promise<Coach[]>}
 */
async function getAll(filters = {}) {
  const where = {};
  if (filters.role) where.role = filters.role.toUpperCase();

  return prisma.coach.findMany({
    where,
    orderBy: { name: 'asc' }
  });
}

/**
 * Crea un nuevo miembro del cuerpo técnico.
 * @param {object} data
 * @returns {Promise<Coach>}
 */
async function create(data) {
  const { photoUrl, name, role, categories, license, phone, email, biography } = data;

  return prisma.coach.create({
    data: {
      photoUrl: photoUrl || null,
      name: name.trim(),
      role: role.toUpperCase(),
      categories: categories || '',
      license: license || null,
      phone: phone || null,
      email: email || null,
      biography: biography || null
    }
  });
}

/**
 * Actualiza un miembro del cuerpo técnico existente.
 * Verifica que exista antes de actualizar.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Coach>}
 */
async function update(id, data) {
  const existing = await prisma.coach.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Miembro del cuerpo técnico no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const { photoUrl, name, role, categories, license, phone, email, biography } = data;

  return prisma.coach.update({
    where: { id },
    data: {
      photoUrl,
      name: name ? name.trim() : undefined,
      role: role ? role.toUpperCase() : undefined,
      categories,
      license,
      phone,
      email,
      biography
    }
  });
}

/**
 * Elimina un miembro del cuerpo técnico. Verifica que exista antes de eliminar.
 * @param {number} id
 * @returns {Promise<Coach>}
 */
async function remove(id) {
  const existing = await prisma.coach.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Miembro del cuerpo técnico no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return prisma.coach.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };
