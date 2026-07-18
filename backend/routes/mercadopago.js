const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const prisma = require('../prismaClient');
const { FRONTEND_URL, MP_ACCESS_TOKEN } = require('../config/env');

const router = express.Router();

if (!FRONTEND_URL) {
  console.error('[MercadoPago] CRITICAL: FRONTEND_URL no está definida. Configurar en variables de entorno.');
}

// Inicializar MercadoPago Client
if (!MP_ACCESS_TOKEN) {
  console.error('[MercadoPago] CRITICAL: MP_ACCESS_TOKEN no está definida. Los pagos no funcionarán.');
}
const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

// 1. Crear Preferencia de Pago para Reservas
router.post('/preference', async (req, res) => {
  const { bookingId, spaceName, price, clientName, timeSlot, date } = req.body;
  try {
    if (!bookingId || !spaceName || !price) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para iniciar el cobro' });
    }

    // Configurar preferencia
    const body = {
      items: [
        {
          id: String(bookingId),
          title: `Alquiler: ${spaceName} (${timeSlot})`,
          quantity: 1,
          unit_price: parseFloat(price),
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${FRONTEND_URL}/reservas?status=success`,
        failure: `${FRONTEND_URL}/reservas?status=failure`,
        pending: `${FRONTEND_URL}/reservas?status=pending`
      },
      auto_return: 'approved',
      // Metadata útil para el Webhook
      metadata: {
        booking_id: bookingId,
        client_name: clientName,
        space_name: spaceName,
        price: price,
        time_slot: timeSlot,
        date: date
      },
      external_reference: String(bookingId)
    };

    const response = await preferenceClient.create({ body });
    
    // Retornamos la URL para redireccionar al Checkout
    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    res.status(500).json({ error: 'Error al iniciar la pasarela de pagos' });
  }
});

// 2. Webhook IPN - MercadoPago notifica cambios de estado
router.post('/webhook', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;
  
  try {
    // Si la notificación es de un pago
    if (topic === 'payment') {
      const paymentId = query.id || query['data.id'];
      
      if (!paymentId) {
        return res.status(400).send('ID de pago faltante');
      }

      // Consultar el detalle del pago en MercadoPago
      const paymentData = await paymentClient.get({ id: String(paymentId) });
      
      if (paymentData.status === 'approved') {
        const bookingId = parseInt(paymentData.metadata.booking_id);
        const price = parseFloat(paymentData.metadata.price);
        const clientName = paymentData.metadata.client_name;
        const spaceName = paymentData.metadata.space_name;
        const timeSlot = paymentData.metadata.time_slot;

        // 1. Verificar si la reserva existe y está pendiente
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId }
        });
 
        if (booking && booking.estado === 'PENDIENTE') {
          // 2. Ejecutar transacción atómica para marcar pagado y registrar movimiento
          await prisma.$transaction([
            prisma.booking.update({
              where: { id: bookingId },
              data: { estado: 'CONFIRMADA' }
            }),
            prisma.transaction.create({
              data: {
                concept: 'ALQUILER_CANCHA',
                amount: price,
                memberName: clientName,
                details: `Pago MP Aprobado: ${spaceName} - Turno: ${timeSlot}`,
                status: 'COMPLETED'
              }
            })
          ]);
 
          console.log(`[MercadoPago Webhook] Pago aprobado e ingreso contable impactados atómicamente. Reserva N°${bookingId}`);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error procesando Webhook de MercadoPago:', error);
    // Retornamos 500 para que MP reintente la notificación
    res.status(500).send('Error en webhook');
  }
});

module.exports = router;
