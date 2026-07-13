const prisma = require('../../../prismaClient');

/**
 * Genera el siguiente número correlativo de comprobante.
 * @returns {Promise<string>}
 */
async function getNextInvoiceNumber() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { id: 'desc' }
  });
  if (lastInvoice && lastInvoice.numero.startsWith('REC-')) {
    const num = parseInt(lastInvoice.numero.split('-')[1], 10);
    return `REC-${(num + 1).toString().padStart(6, '0')}`;
  }
  return 'REC-001001';
}

/**
 * Genera una factura interna para un pago completado.
 * @param {number} paymentId
 * @param {object} [options={}]
 * @returns {Promise<Invoice>}
 */
async function generate(paymentId, options = {}) {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(paymentId) },
    include: { invoices: true }
  });

  if (!payment) {
    const err = new Error('El pago especificado no existe.');
    err.statusCode = 404;
    throw err;
  }

  // Si ya se generó un comprobante para este pago, no duplicarlo
  if (payment.invoices.length > 0) {
    return payment.invoices[0];
  }

  const numero = await getNextInvoiceNumber();
  const pdfFileName = `/invoices/${numero}.pdf`;

  return prisma.invoice.create({
    data: {
      paymentId: payment.id,
      numero,
      archivoPDF: pdfFileName,
      estado: 'EMITIDO',
      tipoComprobante: options.tipoComprobante || 'RECIBO',
      observaciones: options.observaciones || 'Comprobante interno de cuota social.'
    },
    include: { payment: { include: { socio: true, plan: true } } }
  });
}

/**
 * Obtiene un comprobante por su ID.
 * @param {number} id
 * @returns {Promise<Invoice>}
 */
async function get(id) {
  return prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: { payment: { include: { socio: true, plan: true } } }
  });
}

module.exports = { generate, get };
