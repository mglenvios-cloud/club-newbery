const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

const jwt = require('jsonwebtoken');
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

// Listar todas las transacciones
router.get('/', authenticateToken, async (req, res) => {
  if (!['ADMIN', 'FUTSAL', 'OPERADOR', 'SUPER_ADMIN'].includes(req.user.role)) return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o personal de staff.' });
  const { concept, status } = req.query;
  try {
    const filters = {};
    if (concept) filters.concept = concept;
    if (status) filters.status = status;

    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los movimientos contables' });
  }
});

// Registrar un movimiento de pago manual
router.post('/', authenticateToken, async (req, res) => {
  if (!['ADMIN', 'SUPER_ADMIN', 'FUTSAL', 'OPERADOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador o staff.' });
  }
  const { concept, amount, memberName, memberId, details, status } = req.body;
  try {
    if (!concept || amount === undefined || !memberName) {
      return res.status(400).json({ error: 'Faltan campos requeridos: concept, amount, memberName' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        concept,
        amount: parseFloat(amount),
        status: status || 'COMPLETED',
        memberName,
        memberId: memberId ? parseInt(memberId) : null,
        details,
        date: new Date()
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el movimiento contable' });
  }
});

// GET /api/transactions/:id/pdf - Generar PDF Oficial del Recibo de Caja
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const fs = require('fs');
  const path = require('path');
  const qr = require('qr-image');
  const PDFDocument = require('pdfkit');

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Movimiento contable no encontrado.' });
    }

    const receiptNo = `REC-${100000 + transaction.id}`;
    const dateObj = new Date(transaction.date || Date.now());
    const dateFormatted = dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const mins = String(dateObj.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${mins} hs`;

    const conceptLabel = transaction.concept === 'CUOTA_SOCIAL' ? 'Cuota Social' :
                         transaction.concept === 'ARANCEL_DISCIPLINA' ? 'Arancel Disciplina' : 'Alquiler Cancha';
    const amountVal = parseFloat(transaction.amount) || 0;
    const amountFormatted = `$${amountVal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    // Inicializar PDFKit (A4 compatible)
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=recibo-${receiptNo}.pdf`);

    doc.pipe(res);

    // Franja Superior Decorativa Roja
    doc.rect(0, 0, doc.page.width, 15).fill('#CC0000');

    // Header: Logo / Marca JN + Nombre del Club
    doc.fillColor('#111111');
    doc.fontSize(18).font('Helvetica-Bold').text('JN - Club Atlético Jorge Newbery', 50, 32);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#CC0000').text('Comprobante de Pago Oficial', 50, 54);
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text('Alpatacal 3026, Villa Devoto. C.A.B.A. | CUIT: 30-12345678-9', 50, 70);

    // Encabezado Recibo de Caja (Caja "X")
    doc.roundedRect(doc.page.width - 150, 30, 100, 48, 4).stroke('#E2E8F0');
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#111111').text('X', doc.page.width - 150, 36, { width: 100, align: 'center' });
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#666666').text('Recibo de Caja', doc.page.width - 150, 58, { width: 100, align: 'center' });

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text(`N° ${receiptNo}`, 380, 86, { align: 'right' });
    doc.fontSize(8).font('Helvetica').fillColor('#555555').text(`Fecha de Emisión: ${dateFormatted}, ${timeFormatted}`, 380, 100, { align: 'right' });

    // Línea separadora
    doc.moveTo(50, 118).lineTo(doc.page.width - 50, 118).stroke('#E2E8F0');

    // DATOS DEL SOCIO / CLIENTE
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('SOCIO / CLIENTE', 50, 130);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#111111').text(transaction.memberName || 'Martin Perez', 50, 144);

    // CONCEPTO Y DETALLE DEL PAGO
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('CONCEPTO', 50, 175);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111111').text(conceptLabel, 50, 189);

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('DETALLE DEL PAGO', 50, 215);
    doc.fontSize(9).font('Helvetica').fillColor('#444444').text(transaction.details || 'Sin descripción de detalles.', 50, 229, { width: doc.page.width - 100 });

    // RESUMEN Y TOTAL RECAUDADO
    doc.roundedRect(300, 270, 245, 50, 6).fill('#F0FDF4');
    doc.roundedRect(300, 270, 245, 50, 6).stroke('#BBF7D0');

    doc.fillColor('#166534').fontSize(9).font('Helvetica-Bold').text('TOTAL RECAUDADO', 315, 278);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#15803D').text(amountFormatted, 420, 275, { width: 115, align: 'right' });
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#166534').text('✓ Pago Completado', 315, 300);

    // VERIFICACIÓN DIGITAL Y QR
    const qrUrl = `https://www.clubjorgenewbery.com.ar/verify/${receiptNo}?amount=${transaction.amount}&socio=${encodeURIComponent(transaction.memberName)}`;
    let qrBuffer = null;
    try {
      qrBuffer = qr.imageSync(qrUrl, { type: 'png', margin: 1 });
    } catch (e) {}

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#CC0000').text('VERIFICACIÓN DIGITAL', 50, 280);
    if (qrBuffer) {
      try {
        doc.image(qrBuffer, 50, 295, { width: 65, height: 65 });
      } catch (e) {}
    }

    const qrInfoX = qrBuffer ? 125 : 50;
    doc.fontSize(8).font('Helvetica').fillColor('#555555');
    doc.text(`Comprobante N°: ${receiptNo}`, qrInfoX, 298);
    doc.text('Escanee el código QR para validar la autenticidad en línea.', qrInfoX, 312);

    // PIE LEGAL Y DIRECCIÓN OFICIAL
    doc.moveTo(50, doc.page.height - 85).lineTo(doc.page.width - 50, doc.page.height - 85).stroke('#E2E8F0');
    doc.fontSize(8).font('Helvetica').fillColor('#475569');
    doc.text('Este comprobante tiene carácter de recibo oficial de pago electrónico para el Club Social y Deportivo Jorge Newbery.', 50, doc.page.height - 72, { align: 'center', width: doc.page.width - 100 });
    doc.font('Helvetica-Bold').fillColor('#111111').text('Alpatacal 3026, Villa Devoto. C.A.B.A.', 50, doc.page.height - 58, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF de transaccion:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Error al generar el comprobante PDF.' });
  }
});

module.exports = router;
