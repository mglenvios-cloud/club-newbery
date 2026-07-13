const prisma = require('../../../prismaClient');

// ═══════════════════════════════════════════════════════════════════════════
// SEDES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las sedes de un club, incluyendo sus instalaciones.
 * @param {number} [clubId=1]
 * @returns {Promise<Sede[]>}
 */
async function getAllSedes(clubId = 1) {
  return prisma.sede.findMany({
    where: { clubId },
    include: { facilities: true },
    orderBy: { name: 'asc' }
  });
}

/**
 * Crea una nueva sede.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<Sede>}
 */
async function createSede(clubId = 1, data) {
  const { name, address, location, capacity, status, observations } = data;

  return prisma.sede.create({
    data: {
      name: name.trim(),
      address: address || '',
      location: location || '',
      capacity: capacity !== undefined ? parseInt(capacity) : 0,
      status: status || 'ACTIVE',
      observations: observations || '',
      clubId
    }
  });
}

/**
 * Actualiza una sede.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Sede>}
 */
async function updateSede(id, data) {
  const existing = await prisma.sede.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Sede no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const { name, address, location, capacity, status, observations } = data;

  return prisma.sede.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      address,
      location,
      capacity: capacity !== undefined ? parseInt(capacity) : undefined,
      status,
      observations
    }
  });
}

/**
 * Elimina una sede y todas sus instalaciones asociadas.
 * @param {number} id
 * @returns {Promise<Sede>}
 */
async function removeSede(id) {
  const existing = await prisma.sede.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Sede no encontrada');
    err.statusCode = 404;
    throw err;
  }

  // Eliminar instalaciones vinculadas primero
  await prisma.facility.deleteMany({ where: { sedeId: id } });

  return prisma.sede.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════════════════
// INSTALACIONES (FACILITIES)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las instalaciones. Filtrado opcional por sedeId.
 * @param {number} [sedeId]
 * @returns {Promise<Facility[]>}
 */
async function getAllFacilities(sedeId) {
  const where = {};
  if (sedeId !== undefined) {
    where.sedeId = parseInt(sedeId);
  }

  return prisma.facility.findMany({
    where,
    orderBy: { name: 'asc' }
  });
}

/**
 * Crea una nueva instalación vinculada a una sede.
 * @param {object} data
 * @returns {Promise<Facility>}
 */
async function createFacility(data) {
  const { name, type, capacity, status, location, observations, sedeId } = data;

  if (!sedeId) {
    const err = new Error('ID de Sede es requerido para crear una instalación');
    err.statusCode = 400;
    throw err;
  }

  const sede = await prisma.sede.findUnique({ where: { id: parseInt(sedeId) } });
  if (!sede) {
    const err = new Error('Sede vinculada no encontrada');
    err.statusCode = 404;
    throw err;
  }

  return prisma.facility.create({
    data: {
      name: name.trim(),
      type: type || 'CANCHA',
      capacity: capacity !== undefined ? parseInt(capacity) : 0,
      status: status || 'ACTIVE',
      location: location || '',
      observations: observations || '',
      sedeId: parseInt(sedeId)
    }
  });
}

/**
 * Actualiza una instalación.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Facility>}
 */
async function updateFacility(id, data) {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Instalación no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const { name, type, capacity, status, location, observations, sedeId } = data;

  return prisma.facility.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      type,
      capacity: capacity !== undefined ? parseInt(capacity) : undefined,
      status,
      location,
      observations,
      sedeId: sedeId ? parseInt(sedeId) : undefined
    }
  });
}

/**
 * Elimina una instalación.
 * @param {number} id
 * @returns {Promise<Facility>}
 */
async function removeFacility(id) {
  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Instalación no encontrada');
    err.statusCode = 404;
    throw err;
  }

  return prisma.facility.delete({ where: { id } });
}

module.exports = {
  getAllSedes,
  createSede,
  updateSede,
  removeSede,
  getAllFacilities,
  createFacility,
  updateFacility,
  removeFacility
};
