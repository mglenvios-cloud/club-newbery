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

// Middleware para verificar que sea ADMIN o SUPER_ADMIN
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
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
  const fs = require('fs');
  const path = require('path');
  const qr = require('qr-image');
  const PDFDocument = require('pdfkit');

  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const invoice = await invoicesService.get(parseInt(id));
    
    // FASE 8: Validación de objetos requeridos
    if (!invoice) {
      return res.status(404).json({ error: 'Comprobante no encontrado.' });
    }
    if (!invoice.payment) {
      return res.status(422).json({ error: 'El comprobante no posee datos de pago asociados.' });
    }
    if (!invoice.payment.socio) {
      return res.status(422).json({ error: 'El pago asociado al comprobante no posee un socio registrado.' });
    }
    if (!invoice.payment.plan) {
      return res.status(422).json({ error: 'El pago asociado al comprobante no posee un plan de membresía registrado.' });
    }

    // Si no es ADMIN ni personal de staff, verificar pertenencia del comprobante
    const isStaff = ['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isStaff) {
      const socio = await prisma.member.findUnique({ where: { userId: req.user.userId } });
      if (!socio || invoice.payment.socioId !== socio.id) {
        return res.status(403).json({ error: 'Acceso denegado. No posee permisos para ver este comprobante.' });
      }
    }

    // FASE 5: Resolver logo del club de forma segura y automática
    let logoPath = null;
    try {
      const clubConfig = await prisma.clubConfig.findFirst({
        where: { clubId: invoice.payment.socio.clubId || 1 }
      });
      const club = await prisma.club.findUnique({
        where: { id: invoice.payment.socio.clubId || 1 }
      });

      const possibleUrls = [];
      if (clubConfig && clubConfig.shieldUrl) possibleUrls.push(clubConfig.shieldUrl);
      if (club && club.logoUrl) possibleUrls.push(club.logoUrl);

      for (const urlStr of possibleUrls) {
        if (!urlStr) continue;

        // Intentar buscar en backend/uploads resolviendo la ruta relativa o nombre de archivo
        if (urlStr.startsWith('/uploads/')) {
          const uploadsRelPath = path.join(__dirname, '..', urlStr);
          if (fs.existsSync(uploadsRelPath)) {
            logoPath = uploadsRelPath;
            break;
          }
        }
        const uploadsFileNamePath = path.join(__dirname, '..', 'uploads', path.basename(urlStr));
        if (fs.existsSync(uploadsFileNamePath)) {
          logoPath = uploadsFileNamePath;
          break;
        }

        // Intentar buscar en frontend/public
        const frontendPublicPath = path.join(__dirname, '..', '..', 'frontend', 'public', urlStr);
        if (fs.existsSync(frontendPublicPath)) {
          logoPath = frontendPublicPath;
          break;
        }
        const frontendPublicImagesPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', path.basename(urlStr));
        if (fs.existsSync(frontendPublicImagesPath)) {
          logoPath = frontendPublicImagesPath;
          break;
        }
      }
    } catch (logoError) {
      console.error('Error resolviendo logo del club:', logoError);
    }

    // Fallback de respaldo automático
    if (!logoPath) {
      const defaultLogo = path.join(__dirname, '..', 'public', 'logo-default.png');
      if (fs.existsSync(defaultLogo)) {
        logoPath = defaultLogo;
      }
    }

    // FASE 5: Calcular período en español
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dateForPeriod = invoice.payment.fechaPago || invoice.payment.createdAt || new Date();
    const d = new Date(dateForPeriod);
    const periodo = `${meses[d.getMonth()]} ${d.getFullYear()}`;

    // Inicializar PDFKit (A4 compatible)
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recibo-${invoice.numero}.pdf`);

    doc.pipe(res);

    // FASE 8: Estilo Visual Premium
    // Dibujar Franja Superior Decorativa Roja
    doc.rect(0, 0, doc.page.width, 15).fill('#CC0000');

    // Header: Escudo y Datos del Club
    let textStartX = 50;
    if (logoPath) {
      try {
        doc.image(logoPath, 50, 30, { width: 55, height: 55 });
        textStartX = 120;
      } catch (imgErr) {
        console.error('Error insertando imagen de logo en PDF:', imgErr);
        textStartX = 50; // Fallback sin imagen si está corrupto
      }
    }

    doc.fillColor('#111111');
    doc.fontSize(16).font('Helvetica-Bold').text('CLUB ATLETICO JORGE NEWBERY', textStartX, 35);
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text('Av. Jorge Newbery 1234, CABA | CUIT: 30-12345678-9', textStartX, 54);
    doc.text('Asociación Civil sin Fines de Lucro | Fundado en 1916', textStartX, 66);
    doc.text('contacto@jorgenewbery.com.ar | www.jorgenewbery.com.ar', textStartX, 78);

    // Encabezado del Recibo (Derecha)
    doc.fillColor('#CC0000');
    doc.fontSize(12).font('Helvetica-Bold').text('RECIBO OFICIAL', 400, 35, { align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text(`Número: ${invoice.numero}`, 400, 52, { align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text(`Emisión: ${new Date(invoice.fechaEmision).toLocaleDateString('es-AR')}`, 400, 68, { align: 'right' });
    
    // Estado del Pago en badge de color
    const payState = (invoice.payment.estado || 'PENDIENTE').toUpperCase();
    let badgeBg = '#FFF3CD';
    let badgeText = '#856404';
    if (payState === 'PAGADO') {
      badgeBg = '#D4EDDA';
      badgeText = '#155724';
    } else if (payState === 'RECHAZADO' || payState === 'CANCELADO') {
      badgeBg = '#F8D7DA';
      badgeText = '#721C24';
    }
    
    doc.rect(doc.page.width - 130, 84, 80, 16).fill(badgeBg);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(badgeText).text(payState, doc.page.width - 130, 88, { width: 80, align: 'center' });

    // Línea separadora
    doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).stroke('#E2E8F0');

    // DATOS DEL SOCIO
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#CC0000').text('DATOS DEL SOCIO', 50, 125);
    
    // Contenedor de datos del socio (rounded rect)
    doc.roundedRect(50, 140, doc.page.width - 100, 65, 6).stroke('#E2E8F0');
    
    // Textos de Datos de Socio
    const socio = invoice.payment.socio;
    const fullName = `${socio.firstName || ''} ${socio.lastName || ''}`.trim();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111');
    
    // Columna 1
    doc.text('Nombre completo:', 65, 152);
    doc.font('Helvetica').text(fullName, 160, 152);
    doc.font('Helvetica-Bold').text('Documento / DNI:', 65, 168);
    doc.font('Helvetica').text(socio.dni || '-', 160, 168);
    doc.font('Helvetica-Bold').text('Categoría:', 65, 184);
    doc.font('Helvetica').text(socio.category || 'ACTIVO', 160, 184);

    // Columna 2
    doc.font('Helvetica-Bold').text('Número de socio:', 310, 152);
    doc.font('Helvetica').text(String(socio.socioNumber || '-'), 400, 152);
    doc.font('Helvetica-Bold').text('Plan de membresía:', 310, 168);
    doc.font('Helvetica').text(invoice.payment.plan.nombre || '-', 400, 168);

    // DETALLE DEL PAGO
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#CC0000').text('DETALLE DEL PAGO', 50, 225);

    // Encabezado de la tabla de detalles
    doc.rect(50, 240, doc.page.width - 100, 18).fill('#F8FAFC');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569');
    doc.text('Concepto', 60, 245);
    doc.text('Período', 210, 245);
    doc.text('Subtotal', 300, 245, { width: 60, align: 'right' });
    doc.text('Descuento', 360, 245, { width: 60, align: 'right' });
    doc.text('Recargo', 420, 245, { width: 60, align: 'right' });
    doc.text('Total', 480, 245, { width: 60, align: 'right' });

    // FASE 7: Importes obtenidos desde la base de datos
    const subtotalVal = parseFloat(invoice.payment.importe) || 0;
    const discountVal = 0.0;
    const surchargeVal = 0.0;
    const totalVal = subtotalVal - discountVal + surchargeVal;

    // Fila única de detalle
    doc.fontSize(9).font('Helvetica').fillColor('#111111');
    doc.text(invoice.payment.plan.nombre || 'Cuota Social General', 60, 266, { width: 145 });
    doc.text(periodo, 210, 266);
    doc.text(`$${subtotalVal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 300, 266, { width: 60, align: 'right' });
    doc.text(`$${discountVal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 360, 266, { width: 60, align: 'right' });
    doc.text(`$${surchargeVal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 420, 266, { width: 60, align: 'right' });
    doc.font('Helvetica-Bold').text(`$${totalVal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 480, 266, { width: 60, align: 'right' });

    // Línea divisoria de tabla
    doc.moveTo(50, 286).lineTo(doc.page.width - 50, 286).stroke('#E2E8F0');

    // Métodos de pago y Total box
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('Medio de pago:', 60, 305);
    doc.font('Helvetica').text(invoice.payment.metodoPago || 'EFECTIVO', 140, 305);
    doc.font('Helvetica-Bold').text('Fecha de pago:', 60, 321);
    doc.font('Helvetica').text(invoice.payment.fechaPago ? new Date(invoice.payment.fechaPago).toLocaleString('es-AR') : 'Pendiente', 140, 321);

    // TOTAL ABONADO BOX
    doc.rect(340, 298, 205, 38).fill('#F8FAFC');
    doc.rect(340, 298, 3, 38).fill('#CC0000'); // acento rojo lateral
    doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold').text('TOTAL ABONADO:', 352, 312);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#CC0000').text(`$${totalVal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`, 435, 310, { width: 105, align: 'right' });

    // FASE 6: Código QR Real
    const validationUrl = process.env.INVOICE_VALIDATION_URL 
      ? `${process.env.INVOICE_VALIDATION_URL.replace(/\/$/, '')}/verify/invoice/${invoice.id}`
      : `https://www.jorgenewbery.com.ar/portal/verify/invoice/${invoice.id}`;
    
    let qrBuffer = null;
    try {
      qrBuffer = qr.imageSync(validationUrl, { type: 'png', margin: 1 });
    } catch (qrErr) {
      console.error('Error al generar buffer de QR real:', qrErr);
    }

    doc.moveTo(50, 355).lineTo(doc.page.width - 50, 355).stroke('#E2E8F0');

    // VALIDACIÓN DIGITAL CONTAINER
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#CC0000').text('VALIDACIÓN DIGITAL Y CONTROL', 50, 370);
    
    if (qrBuffer) {
      try {
        doc.image(qrBuffer, 50, 390, { width: 75, height: 75 });
      } catch (qrDrawErr) {
        console.error('Error dibujando QR en PDF:', qrDrawErr);
      }
    }
    
    const qrInfoStartX = qrBuffer ? 140 : 50;
    doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold').text('INFORMACIÓN DE VERIFICACIÓN:', qrInfoStartX, 390);
    doc.fontSize(8).font('Helvetica').fillColor('#475569');
    doc.text(`Código de control único: REC-${invoice.numero}-${invoice.id}-${new Date(invoice.createdAt).getTime()}`, qrInfoStartX, 405);
    doc.text('Este documento digital sirve como comprobante de pago oficial de las obligaciones sociales y deportivas descritas.', qrInfoStartX, 418, { width: 380 });
    doc.text('Para verificar su validez en el portal oficial del Club Jorge Newbery, escanee el código QR con su dispositivo celular.', qrInfoStartX, 438, { width: 380 });

    // FASE 7: Pie del documento
    doc.moveTo(50, doc.page.height - 70).lineTo(doc.page.width - 50, doc.page.height - 70).stroke('#E2E8F0');
    doc.fontSize(8).font('Helvetica').fillColor('#94A3B8');
    doc.text('Club Atlético Jorge Newbery - Asociación Civil sin Fines de Lucro', 50, doc.page.height - 60);
    doc.text('Sistema de Gestión Digital ERP v2.0 - Comprobante de emisión digital automática', 50, doc.page.height - 48);
    doc.text(`Emisión: ${new Date().toLocaleString('es-AR')}`, 450, doc.page.height - 60, { width: 95, align: 'right' });

    doc.end();
  } catch (error) {
    logError({ module: 'FinanzasInvoicesRoute', action: 'get', error, req });
    // FASE 8: Nunca lanzar excepción ni responder 500 si podemos atraparlo
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno al generar el comprobante PDF.' });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SUSCRIPCIONES (SUBSCRIPTIONS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    // Si no es ADMIN, restringimos a consultar sus propias suscripciones
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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
