const prisma = require('../../../prismaClient');

/**
 * Obtiene todos los planes de cuota del club.
 * @param {number} [clubId=1]
 * @returns {Promise<MembershipPlan[]>}
 */
async function getAll(clubId = 1) {
  return prisma.membershipPlan.findMany({
    where: { clubId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Crea un nuevo plan de cuota.
 * @param {number} clubId
 * @param {object} data
 * @returns {Promise<MembershipPlan>}
 */
async function create(clubId = 1, data) {
  const { nombre, tipo, importe, periodicidad, moneda, activo } = data;

  if (parseFloat(importe) < 0) {
    const err = new Error('El importe no puede ser negativo.');
    err.statusCode = 400;
    throw err;
  }

  return prisma.membershipPlan.create({
    data: {
      nombre: nombre.trim(),
      tipo: tipo || 'SOCIO',
      importe: parseFloat(importe),
      periodicidad: periodicidad || 'MENSUAL',
      moneda: moneda || 'ARS',
      activo: activo !== undefined ? activo : true,
      clubId
    }
  });
}

/**
 * Actualiza un plan de cuota.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<MembershipPlan>}
 */
async function update(id, data) {
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Plan no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const { nombre, tipo, importe, periodicidad, moneda, activo } = data;

  if (importe !== undefined && parseFloat(importe) < 0) {
    const err = new Error('El importe no puede ser negativo.');
    err.statusCode = 400;
    throw err;
  }

  return prisma.membershipPlan.update({
    where: { id },
    data: {
      nombre: nombre ? nombre.trim() : undefined,
      tipo,
      importe: importe !== undefined ? parseFloat(importe) : undefined,
      periodicidad,
      moneda,
      activo
    }
  });
}

/**
 * Desactiva un plan de cuota (baja lógica).
 * @param {number} id
 * @returns {Promise<MembershipPlan>}
 */
async function remove(id) {
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Plan no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  // Desactivación lógica para no romper históricos de pagos asociados
  return prisma.membershipPlan.update({
    where: { id },
    data: { activo: false }
  });
}

module.exports = { getAll, create, update, remove };
