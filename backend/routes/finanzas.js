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
    doc.fontSize(16).font('Helvetica-Bold').text('JN - Club Atlético Jorge Newbery', textStartX, 32);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#CC0000').text('Comprobante de Pago Oficial', textStartX, 52);
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text('Alpatacal 3026, Villa Devoto. C.A.B.A. | CUIT: 30-12345678-9', textStartX, 68);
    doc.text('contacto@clubjorgenewbery.com.ar | www.clubjorgenewbery.com.ar', textStartX, 80);

    // Encabezado del Recibo (Derecha) - Caja "X" / Recibo de Caja
    doc.roundedRect(doc.page.width - 150, 30, 100, 48, 4).stroke('#E2E8F0');
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#111111').text('X', doc.page.width - 150, 36, { width: 100, align: 'center' });
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#666666').text('Recibo de Caja', doc.page.width - 150, 58, { width: 100, align: 'center' });

    const receiptNumStr = String(invoice.numero || (100000 + invoice.id)).startsWith('REC-')
      ? invoice.numero || `REC-${100000 + invoice.id}`
      : `REC-${invoice.numero || (100000 + invoice.id)}`;

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text(`N° ${receiptNumStr}`, 380, 86, { align: 'right' });

    // Fecha de emisión formateada con hora
    const fechaEmisionObj = new Date(invoice.fechaEmision || invoice.createdAt || Date.now());
    const hoursFin = String(fechaEmisionObj.getHours()).padStart(2, '0');
    const minsFin = String(fechaEmisionObj.getMinutes()).padStart(2, '0');
    const fechaFormattedStr = `${fechaEmisionObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${hoursFin}:${minsFin} hs`;
    doc.fontSize(8).font('Helvetica').fillColor('#555555').text(`Fecha de Emisión: ${fechaFormattedStr}`, 380, 100, { align: 'right' });

    // Línea separadora
    doc.moveTo(50, 118).lineTo(doc.page.width - 50, 118).stroke('#E2E8F0');

    // DATOS DEL SOCIO / CLIENTE
    const socio = invoice.payment.socio || {};
    const fullName = `${socio.firstName || ''} ${socio.lastName || ''}`.trim() || 'Martin Perez';
    
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('SOCIO / CLIENTE', 50, 130);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111111').text(fullName, 50, 144);
    if (socio.dni) {
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text(`DNI: ${socio.dni} | N° Socio: #${socio.socioNumber || '-'} | Categoría: ${socio.category || 'ACTIVO'}`, 50, 160);
    }

    // CONCEPTO Y DETALLE DEL PAGO
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('CONCEPTO', 50, 182);
    const conceptoText = invoice.payment.plan?.nombre || 'Cuota Social';
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text(conceptoText, 50, 196);

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('DETALLE DEL PAGO', 50, 218);
    const detalleText = invoice.payment.observaciones || invoice.payment.detalles || 'Sin descripción de detalles.';
    doc.fontSize(9).font('Helvetica').fillColor('#444444').text(detalleText, 50, 232);

    // TABLA DE MONTOS / TOTAL RECAUDADO
    doc.rect(50, 255, doc.page.width - 100, 22).fill('#F8FAFC');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569');
    doc.text('Ítem / Descripción', 60, 261);
    doc.text('Período', 280, 261);
    doc.text('Importe', 450, 261, { width: 90, align: 'right' });

    const totalVal = parseFloat(invoice.payment.importe) || 0;
    const amountFormatted = `$${totalVal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    doc.fontSize(9).font('Helvetica').fillColor('#111111');
    doc.text(conceptoText, 60, 285);
    doc.text(periodo, 280, 285);
    doc.font('Helvetica-Bold').text(amountFormatted, 450, 285, { width: 90, align: 'right' });

    doc.moveTo(50, 305).lineTo(doc.page.width - 50, 305).stroke('#E2E8F0');

    // RESUMEN Y ESTADO DEL PAGO
    doc.roundedRect(320, 320, 225, 45, 6).fill('#F0FDF4');
    doc.roundedRect(320, 320, 225, 45, 6).stroke('#BBF7D0');
    
    doc.fillColor('#166534').fontSize(9).font('Helvetica-Bold').text('TOTAL RECAUDADO', 335, 328);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#15803D').text(amountFormatted, 430, 326, { width: 105, align: 'right' });
    
    const payState = (invoice.payment.estado || 'PAGADO').toUpperCase();
    const isCompleted = payState === 'PAGADO' || payState === 'COMPLETADO';
    const statusLabel = isCompleted ? '✓ Pago Completado' : `Estado: ${payState}`;
    
    doc.fontSize(9).font('Helvetica-Bold').fillColor(isCompleted ? '#166534' : '#991B1B').text(statusLabel, 335, 348);

    // VERIFICACIÓN DIGITAL Y QR
    const validationUrl = process.env.INVOICE_VALIDATION_URL 
      ? `${process.env.INVOICE_VALIDATION_URL.replace(/\/$/, '')}/verify/invoice/${invoice.id}`
      : `https://www.clubjorgenewbery.com.ar/verify/invoice/${invoice.id}`;
    
    let qrBuffer = null;
    try {
      qrBuffer = qr.imageSync(validationUrl, { type: 'png', margin: 1 });
    } catch (qrErr) {
      console.error('Error al generar buffer de QR real:', qrErr);
    }

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('VERIFICACIÓN DIGITAL', 50, 330);
    if (qrBuffer) {
      try {
        doc.image(qrBuffer, 50, 345, { width: 65, height: 65 });
      } catch (e) {}
    }
    
    const qrInfoX = qrBuffer ? 125 : 50;
    doc.fontSize(8).font('Helvetica').fillColor('#555555');
    doc.text(`Comprobante N°: ${receiptNumStr}`, qrInfoX, 348);
    doc.text(`Medio de Pago: ${invoice.payment.metodoPago || 'EFECTIVO'}`, qrInfoX, 360);
    doc.text('Escanee el código QR para validar la autenticidad en línea.', qrInfoX, 372);

    // PIE LEGAL Y DIRECCIÓN
    doc.moveTo(50, doc.page.height - 85).lineTo(doc.page.width - 50, doc.page.height - 85).stroke('#E2E8F0');
    doc.fontSize(8).font('Helvetica').fillColor('#475569');
    doc.text('Este comprobante tiene carácter de recibo oficial de pago electrónico para el Club Social y Deportivo Jorge Newbery.', 50, doc.page.height - 72, { align: 'center', width: doc.page.width - 100 });
    doc.font('Helvetica-Bold').fillColor('#111111').text('Alpatacal 3026, Villa Devoto. C.A.B.A.', 50, doc.page.height - 58, { align: 'center', width: doc.page.width - 100 });

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
