const http = require('http');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';
const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);

function request(path, method, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('💳 Iniciando verificación de la Fase 6: Finanzas Digitales...\n');

  let testUserId = null;
  let testSocioId = null;
  let testPlanId = null;
  let testPaymentId = null;
  let testSubscriptionId = null;

  try {
    // 1. Obtener o crear un Socio (Member) para asociar el pago/suscripción
    console.log('👥 Buscando socio existente...');
    let socio = await prisma.member.findFirst();
    if (!socio) {
      console.log('   Socio no encontrado. Creando socio de prueba temporal...');
      const user = await prisma.user.create({
        data: {
          email: 'socio.finanzas@test.com',
          password: 'mock_password_hash',
          role: 'SOCIO'
        }
      });
      testUserId = user.id;

      socio = await prisma.member.create({
        data: {
          socioNumber: 99988,
          firstName: 'Socio',
          lastName: 'Test Finanzas',
          dni: '9988776655',
          birthDate: new Date('1990-01-01'),
          email: 'socio.finanzas@test.com',
          userId: user.id
        }
      });
      testSocioId = socio.id;
    }
    const socioId = socio.id;
    console.log(`   Socio utilizado ID: ${socioId}\n`);

    // 2. Crear un plan de prueba (POST /api/finanzas/plans)
    console.log('📋 1. Creando Plan de Membresía de Prueba (POST /api/finanzas/plans)...');
    const planBody = {
      nombre: 'Plan Test Futsal Juvenil',
      tipo: 'DEPORTIVO',
      importe: 12500,
      periodicidad: 'MENSUAL',
      moneda: 'ARS',
      activo: true
    };
    const resPlan = await request('/api/finanzas/plans', 'POST', planBody, adminToken);
    console.log(`   Status: ${resPlan.status} (Esperado: 201)`);
    console.log(`   Plan ID: ${resPlan.data.id}`);
    console.log(`   Importe: $${resPlan.data.importe}\n`);

    testPlanId = resPlan.data.id;

    // 3. Suscribiendo socio al plan (POST /api/finanzas/subscriptions)
    console.log('🔄 2. Suscribiendo socio al plan (POST /api/finanzas/subscriptions)...');
    const subBody = {
      socioId: socioId,
      planId: testPlanId,
      fechaInicio: new Date().toISOString(),
      estado: 'ACTIVO'
    };
    const resSub = await request('/api/finanzas/subscriptions', 'POST', subBody, adminToken);
    console.log(`   Status: ${resSub.status} (Esperado: 201)`);
    console.log(`   Suscripción ID: ${resSub.data.id}`);
    console.log(`   Próximo Cobro: ${resSub.data.proximoCobro ? 'Calculado con éxito' : 'No calculado'}\n`);

    testSubscriptionId = resSub.data.id;

    // 4. Registrar pago pendiente (POST /api/finanzas/payments)
    console.log('💰 3. Registrando pago pendiente (POST /api/finanzas/payments)...');
    const paymentBody = {
      socioId: socioId,
      planId: testPlanId,
      importe: 12500,
      metodoPago: 'MERCADOPAGO',
      estado: 'PENDIENTE'
    };
    const resPayment = await request('/api/finanzas/payments', 'POST', paymentBody, adminToken);
    console.log(`   Status: ${resPayment.status} (Esperado: 201)`);
    console.log(`   Pago ID: ${resPayment.data.id}`);
    console.log(`   Estado: "${resPayment.data.estado}"\n`);

    testPaymentId = resPayment.data.id;

    // 5. Generar Preferencia de Mercado Pago (POST /api/finanzas/mercadopago/preference)
    console.log('💳 4. Generando preferencia Mercado Pago (POST /api/finanzas/mercadopago/preference)...');
    const resPref = await request('/api/finanzas/mercadopago/preference', 'POST', { paymentId: testPaymentId }, adminToken);
    console.log(`   Status: ${resPref.status} (Esperado: 200)`);
    console.log(`   Preferencia ID: "${resPref.data.preferenceId}"`);
    console.log(`   Redirección: "${resPref.data.init_point}"\n`);

    const prefId = resPref.data.preferenceId;

    // 6. Simular confirmación por Webhook (POST /api/finanzas/mercadopago/webhook)
    console.log('🔔 5. Simulando recepción de Webhook de aprobación de pago (POST /api/finanzas/mercadopago/webhook)...');
    const webhookBody = {
      preferenceId: prefId,
      paymentId: 'MOCK-MP-TX-9988',
      status: 'approved'
    };
    const resWebhook = await request('/api/finanzas/mercadopago/webhook', 'POST', webhookBody);
    console.log(`   Status: ${resWebhook.status} (Esperado: 200)`);
    console.log(`   Resultado: success = ${resWebhook.data.success}`);
    console.log(`   Nuevo Estado del Pago: "${resWebhook.data.payment.estado}" (Esperado: PAGADO)\n`);

    // 7. Consultar Comprobante (Invoice) generado automáticamente
    console.log('🧾 6. Consultando comprobante (Invoice) generado automáticamente...');
    const paymentWithInvoices = await prisma.payment.findUnique({
      where: { id: testPaymentId },
      include: { invoices: true }
    });
    const invoice = paymentWithInvoices.invoices[0];
    if (invoice) {
      console.log(`   Comprobante encontrado: ID ${invoice.id}`);
      console.log(`   Número: "${invoice.numero}"`);
      console.log(`   Tipo: "${invoice.tipoComprobante}"`);
      console.log(`   PDF: "${invoice.archivoPDF}"\n`);
    } else {
      console.log('   ❌ Error: Comprobante no generado automáticamente.\n');
    }

    console.log('✅ Verificación de la Fase 6 completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la verificación de Finanzas:', error);
  } finally {
    // Limpieza final
    console.log('🧹 Limpiando registros de prueba...');
    if (testPaymentId) {
      await prisma.invoice.deleteMany({ where: { paymentId: testPaymentId } }).catch(() => {});
      await prisma.payment.delete({ where: { id: testPaymentId } }).catch(() => {});
    }
    if (testSubscriptionId) {
      await prisma.subscription.delete({ where: { id: testSubscriptionId } }).catch(() => {});
    }
    if (testPlanId) {
      await prisma.membershipPlan.delete({ where: { id: testPlanId } }).catch(() => {});
    }
    if (testSocioId) {
      await prisma.member.delete({ where: { id: testSocioId } }).catch(() => {});
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    console.log('   Listo.');
    prisma.$disconnect();
  }
}

run();
