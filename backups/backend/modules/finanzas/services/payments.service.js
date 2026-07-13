const prisma = require('../../../prismaClient');
const invoicesService = require('./invoices.service');

/**
 * Obtiene el listado de todos los pagos con filtros opcionales.
 * @param {object} filters
 * @returns {Promise<Payment[]>}
 */
async function getAll(filters = {}) {
  const where = {};

  if (filters.socioId) {
    where.socioId = parseInt(filters.socioId, 10);
  }

  if (filters.estado) {
    where.estado = filters.estado.toUpperCase();
  }

  if (filters.planId) {
    where.planId = parseInt(filters.planId, 10);
  }

  if (filters.fechaDesde || filters.fechaHasta) {
    where.createdAt = {};
    if (filters.fechaDesde) {
      where.createdAt.gte = new Date(filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      where.createdAt.lte = new Date(filters.fechaHasta);
    }
  }

  return prisma.payment.findMany({
    where,
    include: { socio: true, plan: true, invoices: true },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Registra un pago.
 * Si se registra directamente como PAGADO, emite la factura interna automáticamente.
 * @param {object} data
 * @returns {Promise<Payment>}
 */
async function create(data) {
  const { socioId, planId, importe, metodoPago, estado, referenciaPago, fechaPago } = data;

  // 1. Validar existencia del socio (Member)
  const socio = await prisma.member.findUnique({ where: { id: parseInt(socioId) } });
  if (!socio) {
    const err = new Error('El socio especificado no existe.');
    err.statusCode = 400;
    throw err;
  }

  // 2. Validar plan si aplica
  if (planId) {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: parseInt(planId) } });
    if (!plan) {
      const err = new Error('El plan de cuota especificado no existe.');
      err.statusCode = 400;
      throw err;
    }
  }

  if (parseFloat(importe) <= 0) {
    const err = new Error('El importe del pago debe ser mayor a cero.');
    err.statusCode = 400;
    throw err;
  }

  const createdPayment = await prisma.payment.create({
    data: {
      socioId: parseInt(socioId),
      planId: planId ? parseInt(planId) : null,
      importe: parseFloat(importe),
      metodoPago: metodoPago || 'EFECTIVO',
      estado: estado || 'PENDIENTE',
      referenciaPago: referenciaPago || '',
      fechaPago: estado === 'PAGADO' ? (fechaPago ? new Date(fechaPago) : new Date()) : null
    },
    include: { socio: true, plan: true, invoices: true }
  });

  // Si ya ingresó pagado, emitir comprobante interno
  if (createdPayment.estado === 'PAGADO') {
    try {
      await invoicesService.generate(createdPayment.id);
    } catch {}
  }

  return createdPayment;
}

/**
 * Actualiza el estado de un pago.
 * Si el estado pasa a ser PAGADO, emite el comprobante interno automáticamente.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Payment>}
 */
async function update(id, data) {
  const existing = await prisma.payment.findUnique({
    where: { id },
    include: { invoices: true }
  });
  if (!existing) {
    const err = new Error('Registro de pago no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const { estado, metodoPago, referenciaPago, fechaPago } = data;

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      estado: estado ? estado.toUpperCase() : undefined,
      metodoPago,
      referenciaPago,
      fechaPago: estado === 'PAGADO' ? (fechaPago ? new Date(fechaPago) : new Date()) : undefined
    },
    include: { socio: true, plan: true, invoices: true }
  });

  // Si transiciona a PAGADO y no tiene comprobante emitido, emitirlo
  if (updated.estado === 'PAGADO' && updated.invoices.length === 0) {
    try {
      await invoicesService.generate(updated.id);
    } catch {}
  }

  return updated;
}

/**
 * Prepara una preferencia de Mercado Pago (Simulado).
 * @param {number} paymentId
 * @returns {Promise<object>}
 */
async function createPreference(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(paymentId) },
    include: { socio: true, plan: true }
  });

  if (!payment) {
    const err = new Error('Pago no encontrado.');
    err.statusCode = 404;
    throw err;
  }

  const preferenceId = `pref-jn-mp-${payment.id}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Actualizar referencias de Mercado Pago simuladas
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      mpPreferenceId: preferenceId,
      mpStatus: 'pending'
    }
  });

  // init_point simulado apuntando a nuestro webhook simulado para pruebas locales
  return {
    preferenceId,
    init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`,
    sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
  };
}

/**
 * Webhook simulador para Mercado Pago.
 * Recibe un payload webhook e impacta el pago.
 * @param {object} payload
 * @returns {Promise<Payment>}
 */
async function processWebhook(payload) {
  const { preferenceId, paymentId, status } = payload;

  // Buscar pago por preferenciaId
  const payment = await prisma.payment.findFirst({
    where: { mpPreferenceId: preferenceId }
  });

  if (!payment) {
    const err = new Error('Preferencia de pago no encontrada.');
    err.statusCode = 404;
    throw err;
  }

  const isApproved = status === 'approved' || status === 'PAGADO';
  
  return update(payment.id, {
    estado: isApproved ? 'PAGADO' : 'RECHAZADO',
    referenciaPago: `MP-ID-${paymentId || 'WEBHOOK'}`,
    fechaPago: isApproved ? new Date() : null,
    mpStatus: status,
    mpPaymentId: paymentId || ''
  });
}

module.exports = { getAll, create, update, createPreference, processWebhook };
