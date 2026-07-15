const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const router = express.Router();

const membershipPlansService = require('../modules/finanzas/services/membershipPlans.service');
const paymentsService = require('../modules/finanzas/services/payments.service');
const invoicesService = require('../modules/finanzas/services/invoices.service');
const subscriptionsService = require('../modules/finanzas/services/subscriptions.service');

const validators = require('../modules/finanzas/validators/payments.validators');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

const { JWT_SECRET } = require('../config/env');

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware para verificar que sea ADMIN
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// PLANES (MEMBERSHIP PLANS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const list = await membershipPlansService.getAll(1);
    res.json(list);
  } catch (error) {
    logError({ module: 'FinanzasPlansRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener planes.' });
  }
});

router.post('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validationError = validators.validatePlan(req.body, false);
    if (validationError) return res.status(400).json({ error: validationError });

    const plan = await membershipPlansService.create(1, req.body);
    res.status(201).json(plan);
  } catch (error) {
    logError({ module: 'FinanzasPlansRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al crear plan.' });
  }
});

router.put('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validatePlan(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const plan = await membershipPlansService.update(parseInt(id), req.body);
    res.json(plan);
  } catch (error) {
    logError({ module: 'FinanzasPlansRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar plan.' });
  }
});

router.delete('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await membershipPlansService.remove(parseInt(id));
    res.json({ message: 'Plan desactivado exitosamente.' });
  } catch (error) {
    logError({ module: 'FinanzasPlansRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar plan.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PAGOS (PAYMENTS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/payments', authenticateToken, async (req, res) => {
  try {
    // Si no es ADMIN, restringimos a consultar sus propios pagos
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR'].includes(req.user.role);
    if (!isStaff) {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      if (!socio) {
        return res.status(403).json({ error: 'Acceso denegado. No posee un perfil de socio vinculado.' });
      }
      req.query.socioId = socio.id;
    }

    const list = await paymentsService.getAll(req.query);
    res.json(list);
  } catch (error) {
    logError({ module: 'FinanzasPaymentsRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener pagos.' });
  }
});

router.post('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validationError = validators.validatePayment(req.body, false);
    if (validationError) return res.status(400).json({ error: validationError });

    const payment = await paymentsService.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    logError({ module: 'FinanzasPaymentsRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al registrar pago.' });
  }
});

router.put('/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validatePayment(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const payment = await paymentsService.update(parseInt(id), req.body);
    res.json(payment);
  } catch (error) {
    logError({ module: 'FinanzasPaymentsRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar pago.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPROBANTES (INVOICES)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/invoices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const invoice = await invoicesService.get(parseInt(id));
    if (!invoice) return res.status(404).json({ error: 'Comprobante no encontrado.' });

    // Si no es ADMIN ni personal de staff, verificar pertenencia del comprobante
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR'].includes(req.user.role);
    if (!isStaff) {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      if (!socio || invoice.payment.socioId !== socio.id) {
        return res.status(403).json({ error: 'Acceso denegado. No posee permisos para ver este comprobante.' });
      }
    }

    // Generar PDF usando pdfkit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recibo-${invoice.numero}.pdf`);

    doc.pipe(res);

    // Dibujar Banner Superior
    doc.rect(0, 0, doc.page.width, 15).fill('#CC0000');

    // Dibujar Título y Logo
    doc.fillColor('#111111');
    doc.fontSize(20).font('Helvetica-Bold').text('CLUB ATLETICO JORGE NEWBERY', 50, 40);
    doc.fontSize(10).font('Helvetica').text('Av. Jorge Newbery 1234, CABA | CUIT: 30-12345678-9', 50, 65);
    doc.text('Asociación Civil sin Fines de Lucro', 50, 78);

    // Detalles del comprobante (Derecha)
    doc.fontSize(14).font('Helvetica-Bold').text(invoice.tipoComprobante, 400, 40, { align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').text(`Número: ${invoice.numero}`, 400, 60, { align: 'right' });
    doc.font('Helvetica').text(`Fecha: ${new Date(invoice.fechaEmision).toLocaleDateString('es-AR')}`, 400, 75, { align: 'right' });

    // Línea separadora
    doc.moveTo(50, 105).lineTo(doc.page.width - 50, 105).stroke('#CCCCCC');

    // Información del Socio
    doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL SOCIO', 50, 120);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nombre: ${invoice.payment.socio.firstName} ${invoice.payment.socio.lastName}`, 50, 140);
    doc.text(`Nº Socio: ${invoice.payment.socio.socioNumber}`, 50, 155);
    doc.text(`DNI: ${invoice.payment.socio.dni}`, 50, 170);
    doc.text(`Email: ${invoice.payment.socio.email || '-'}`, 50, 185);

    // Detalles del Pago
    doc.fontSize(12).font('Helvetica-Bold').text('DETALLE DEL PAGO', 50, 215);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Concepto: ${invoice.payment.plan?.nombre || 'Cuota Social General'}`, 50, 235);
    doc.text(`Medio de Pago: ${invoice.payment.metodoPago}`, 50, 250);
    doc.text(`Referencia: ${invoice.payment.referenciaPago || 'N/A'}`, 50, 265);
    doc.text(`Fecha Pago: ${invoice.payment.fechaPago ? new Date(invoice.payment.fechaPago).toLocaleDateString('es-AR') : 'Pendiente'}`, 50, 280);

    // Contenedor del Total
    doc.rect(50, 310, doc.page.width - 100, 60).fill('#F5F5F5');
    doc.fillColor('#111111');
    doc.fontSize(12).font('Helvetica-Bold').text('TOTAL ABONADO:', 70, 332);
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#CC0000').text(`$${parseFloat(invoice.payment.importe).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`, 200, 328);

    // Estado del Pago
    doc.rect(doc.page.width - 150, 322, 100, 30).fill('#D4EDDA');
    doc.fillColor('#155724');
    doc.fontSize(12).font('Helvetica-Bold').text(invoice.payment.estado, doc.page.width - 150, 331, { width: 100, align: 'center' });

    // Código de Validación y Leyenda
    doc.fillColor('#111111');
    doc.fontSize(10).font('Helvetica-Bold').text('VALIDACIÓN DIGITAL', 50, 400);
    doc.fontSize(8).font('Helvetica');
    doc.text(`Código de Verificación: ${invoice.numero}-${id}-${new Date(invoice.createdAt).getTime()}`, 50, 420);
    doc.text('Este es un comprobante oficial emitido de forma digital por el sistema de administración del Club Atlético Jorge Newbery.', 50, 435);

    // Dibujar Código QR simulado (Vectorial)
    doc.rect(450, 400, 80, 80).stroke('#666666');
    doc.fontSize(6).text('ESCANEADO\nDIGITAL', 450, 435, { width: 80, align: 'center' });

    // Pie de Página
    doc.moveTo(50, doc.page.height - 70).lineTo(doc.page.width - 50, doc.page.height - 70).stroke('#CCCCCC');
    doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Jorge Newbery Online - Sistema de Gestión Deportiva Integral', 50, doc.page.height - 60);
    doc.text('Página 1 de 1', 450, doc.page.height - 60, { align: 'right' });

    doc.end();
  } catch (error) {
    logError({ module: 'FinanzasInvoicesRoute', action: 'get', error, req });
    res.status(500).json({ error: 'Error al generar o descargar el comprobante.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SUSCRIPCIONES (SUBSCRIPTIONS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    // Si no es ADMIN, restringimos a consultar sus propias suscripciones
    if (req.user.role !== 'ADMIN') {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      if (!socio) {
        return res.status(403).json({ error: 'Acceso denegado. No posee un perfil de socio vinculado.' });
      }
      req.query.socioId = socio.id;
    }

    const list = await subscriptionsService.getAll(req.query);
    res.json(list);
  } catch (error) {
    logError({ module: 'FinanzasSubscriptionsRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener suscripciones.' });
  }
});

router.post('/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subscription = await subscriptionsService.create(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    logError({ module: 'FinanzasSubscriptionsRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al registrar suscripción.' });
  }
});

router.put('/subscriptions/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const subscription = await subscriptionsService.update(id, req.body);
    res.json(subscription);
  } catch (error) {
    logError({ module: 'FinanzasSubscriptionsRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar suscripción.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRACIÓN MERCADO PAGO
// ═══════════════════════════════════════════════════════════════════════════

router.post('/mercadopago/preference', authenticateToken, async (req, res) => {
  const { paymentId } = req.body;
  try {
    if (!paymentId) return res.status(400).json({ error: 'El ID del pago es obligatorio.' });
    
    // Si no es ADMIN, verificar que el pago le pertenezca a este socio
    if (req.user.role !== 'ADMIN') {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      const payment = await prisma.payment.findUnique({ where: { id: parseInt(paymentId) } });
      if (!socio || !payment || payment.socioId !== socio.id) {
        return res.status(403).json({ error: 'Acceso denegado. No posee permisos para pagar esta cuota.' });
      }
    }

    const preference = await paymentsService.createPreference(paymentId);
    res.json(preference);
  } catch (error) {
    logError({ module: 'FinanzasMercadoPagoRoute', action: 'preference', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al generar preferencia.' });
  }
});

router.post('/mercadopago/webhook', async (req, res) => {
  try {
    const payment = await paymentsService.processWebhook(req.body);
    res.json({ success: true, payment });
  } catch (error) {
    logError({ module: 'FinanzasMercadoPagoRoute', action: 'webhook', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al procesar webhook.' });
  }
});

// GET /api/finanzas/payment-methods
// Retorna la lista de medios de pago activos de la configuración central
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../config/paymentMethods.json');
    const data = fs.readFileSync(configPath, 'utf8');
    const methods = JSON.parse(data);
    const activeMethods = methods.filter(m => m.active);
    res.json(activeMethods);
  } catch (error) {
    logError({ module: 'FinanzasPaymentMethodsRoute', action: 'get', error, req });
    res.status(500).json({ error: 'Error al obtener los medios de pago.' });
  }
});

module.exports = router;
