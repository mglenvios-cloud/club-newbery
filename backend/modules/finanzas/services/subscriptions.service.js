const prisma = require('../../../prismaClient');

/**
 * Obtiene todas las suscripciones de los socios.
 * @param {object} filters
 * @returns {Promise<Subscription[]>}
 */
async function getAll(filters = {}) {
  const where = {};
  if (filters.socioId) {
    where.socioId = parseInt(filters.socioId, 10);
  }
  if (filters.estado) {
    where.estado = filters.estado.toUpperCase();
  }

  return prisma.subscription.findMany({
    where,
    include: {
      socio: true,
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Suscribe un socio a un plan de cuotas.
 * @param {object} data
 * @returns {Promise<Subscription>}
 */
async function create(data) {
  const { socioId, planId, fechaInicio, fechaFin, estado, proximoCobro } = data;

  // 1. Validar existencia del socio
  const socio = await prisma.member.findUnique({ where: { id: parseInt(socioId, 10) } });
  if (!socio) {
    const err = new Error('El socio especificado no existe.');
    err.statusCode = 400;
    throw err;
  }

  // 2. Validar existencia del plan
  const plan = await prisma.membershipPlan.findUnique({ where: { id: parseInt(planId, 10) } });
  if (!plan) {
    const err = new Error('El plan especificado no existe.');
    err.statusCode = 400;
    throw err;
  }

  // Calcular proximoCobro por defecto si no se especifica
  let calculatedNextCobro = proximoCobro ? new Date(proximoCobro) : null;
  if (!calculatedNextCobro && plan.activo) {
    const start = fechaInicio ? new Date(fechaInicio) : new Date();
    if (plan.periodicidad === 'MENSUAL') {
      start.setMonth(start.getMonth() + 1);
      calculatedNextCobro = start;
    } else if (plan.periodicidad === 'ANUAL') {
      start.setFullYear(start.getFullYear() + 1);
      calculatedNextCobro = start;
    }
  }

  return prisma.subscription.create({
    data: {
      socioId: parseInt(socioId, 10),
      planId: parseInt(planId, 10),
      fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      estado: estado || 'ACTIVO',
      proximoCobro: calculatedNextCobro
    },
    include: { socio: true, plan: true }
  });
}

/**
 * Actualiza el estado o parámetros de una suscripción.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Subscription>}
 */
async function update(id, data) {
  const existing = await prisma.subscription.findUnique({ where: { id: parseInt(id, 10) } });
  if (!existing) {
    const err = new Error('Suscripción no encontrada.');
    err.statusCode = 404;
    throw err;
  }

  const updateData = { ...data };
  if (data.socioId !== undefined) updateData.socioId = parseInt(data.socioId, 10);
  if (data.planId !== undefined) updateData.planId = parseInt(data.planId, 10);
  if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
  if (data.fechaFin) updateData.fechaFin = new Date(data.fechaFin);
  if (data.proximoCobro) updateData.proximoCobro = new Date(data.proximoCobro);

  return prisma.subscription.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
    include: { socio: true, plan: true }
  });
}

module.exports = {
  getAll,
  create,
  update
};
