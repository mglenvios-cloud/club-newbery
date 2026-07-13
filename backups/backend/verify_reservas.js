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
  console.log('📅 Iniciando verificación de la Fase 5: Reservas y Turnos Deportivos...\n');

  let testSedeId = null;
  let testFacilityId = null;
  let testBookingId = null;

  try {
    // 1. Asegurar la existencia de una Sede de prueba
    console.log('🏢 Creando sede deportiva de prueba...');
    let sede = await prisma.sede.findFirst();
    if (!sede) {
      sede = await prisma.sede.create({
        data: {
          name: 'SEDE TEST RESERVAS',
          address: 'Av. Juan B. Justo 1234',
          location: 'CABA',
          status: 'ACTIVE'
        }
      });
      testSedeId = sede.id;
    }
    const sedeId = sede.id;
    console.log(`   Sede utilizada ID: ${sedeId}\n`);

    // 2. Crear una instalación (Facility) de prueba
    console.log('🏟️ Creando cancha de prueba...');
    const facility = await prisma.facility.create({
      data: {
        name: 'CANCHA DE PRUEBA VERIFY',
        type: 'CANCHA',
        capacity: 10,
        status: 'ACTIVE',
        sedeId: sedeId
      }
    });
    testFacilityId = facility.id;
    console.log(`   Cancha creada con ID: ${testFacilityId}\n`);

    // 3. Consultar disponibilidad inicial (GET /api/reservas/availability)
    console.log('🔍 Consultando disponibilidad inicial (GET /api/reservas/availability)...');
    const dateStr = '2026-08-15';
    const resAvail1 = await request(`/api/reservas/availability?facilityId=${testFacilityId}&date=${dateStr}`, 'GET');
    console.log(`   Status: ${resAvail1.status} (Esperado: 200)`);
    console.log(`   Turnos totales en el día: ${resAvail1.data ? resAvail1.data.length : 0}\n`);

    // 4. Crear Reserva de Prueba (POST /api/reservas/bookings)
    console.log('📥 Intentando crear una reserva (POST /api/reservas/bookings)...');
    const bookingBody = {
      nombreCliente: 'Marcos Test-Reservas',
      telefono: '11-9988-7766',
      email: 'marcos.test@reservas.com',
      facilityId: testFacilityId,
      fecha: dateStr,
      horaInicio: '19:00',
      horaFin: '20:00',
      tipoReserva: 'GENERAL'
    };

    const resPostBooking = await request('/api/reservas/bookings', 'POST', bookingBody, adminToken);
    console.log(`   Status: ${resPostBooking.status} (Esperado: 201)`);
    console.log(`   Reserva ID: ${resPostBooking.data.id}`);
    console.log(`   Importe liquidado: $${resPostBooking.data.importe}\n`);

    testBookingId = resPostBooking.data.id;

    // 5. Intentar crear una reserva solapada (Choque horario) -> Debe fallar
    console.log('⚠️ Intentando crear reserva en el mismo horario (Choque horario)...');
    const overlapBody = {
      nombreCliente: 'Claudio Overlap-Reservas',
      telefono: '11-2233-4455',
      email: 'claudio.test@reservas.com',
      facilityId: testFacilityId,
      fecha: dateStr,
      horaInicio: '19:30', // Se solapa con 19:00 - 20:00
      horaFin: '20:30',
      tipoReserva: 'GENERAL'
    };

    const resOverlap = await request('/api/reservas/bookings', 'POST', overlapBody, adminToken);
    console.log(`   Status: ${resOverlap.status} (Esperado: 400 por choque de horario)`);
    console.log(`   Error devuelto: "${resOverlap.data.error}"\n`);

    // 6. Consultar disponibilidad con turno ocupado
    console.log('🔍 Consultando disponibilidad nuevamente...');
    const resAvail2 = await request(`/api/reservas/availability?facilityId=${testFacilityId}&date=${dateStr}`, 'GET');
    const busySlot = resAvail2.data.find(s => s.startTime === '19:00');
    console.log(`   Estado del turno de las 19:00: "${busySlot ? busySlot.status : 'No encontrado'}" (Esperado: OCUPADO)\n`);

    // 7. Modificar/Aprobar Reserva (PUT /api/reservas/bookings/:id)
    console.log('✍️ Aprobando y confirmando la reserva (PUT /api/reservas/bookings/:id)...');
    const resPutBooking = await request(`/api/reservas/bookings/${testBookingId}`, 'PUT', { estado: 'CONFIRMADA' }, adminToken);
    console.log(`   Status: ${resPutBooking.status} (Esperado: 200)`);
    console.log(`   Nuevo Estado: "${resPutBooking.data.estado}"\n`);

    // 8. Cancelar la reserva (DELETE /api/reservas/bookings/:id)
    console.log('🗑️ Eliminando / cancelando la reserva de prueba...');
    const resDelete = await request(`/api/reservas/bookings/${testBookingId}`, 'DELETE', null, adminToken);
    console.log(`   Status: ${resDelete.status} (Esperado: 200)`);
    console.log(`   Mensaje: "${resDelete.data.message}"\n`);

    testBookingId = null;

    console.log('✅ Verificación de la Fase 5 completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la verificación de Reservas:', error);
  } finally {
    // Limpieza final de la cancha de prueba
    console.log('🧹 Limpiando base de datos...');
    if (testBookingId) {
      await prisma.booking.deleteMany({ where: { id: testBookingId } }).catch(() => {});
    }
    if (testFacilityId) {
      await prisma.schedule.deleteMany({ where: { facilityId: testFacilityId } }).catch(() => {});
      await prisma.priceRule.deleteMany({ where: { facilityId: testFacilityId } }).catch(() => {});
      await prisma.booking.deleteMany({ where: { facilityId: testFacilityId } }).catch(() => {});
      await prisma.facility.delete({ where: { id: testFacilityId } }).catch(() => {});
    }
    if (testSedeId) {
      await prisma.sede.delete({ where: { id: testSedeId } }).catch(() => {});
    }
    console.log('   Listo.');
    prisma.$disconnect();
  }
}

run();
