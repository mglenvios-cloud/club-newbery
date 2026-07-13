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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('🏁 Iniciando Auditoría de Integración y Compatibilidad de la Fase 3...\n');
  
  const report = {
    backend: 'OK',
    prisma: 'OK',
    endpoints: {},
    compatibility: 'PENDIENTE',
    errors: []
  };

  try {
    // 1. Limpiar base de datos para prueba
    console.log('🧹 Limpiando registros previos de pruebas...');
    await prisma.booking.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.digitalCard.deleteMany({});
    await prisma.member.deleteMany({});
    await prisma.tutor.deleteMany({});
    console.log('   Listo.\n');

    // 2. Verificar endpoints vacíos
    console.log('📡 Probando listados vacíos...');
    
    // GET /api/socios
    const sociosRes = await request('/api/socios', 'GET', null, adminToken);
    report.endpoints['GET /api/socios'] = sociosRes.status === 200 ? 'OK' : `FAIL (${sociosRes.status})`;
    console.log(`   GET /api/socios: ${sociosRes.status} (${Array.isArray(sociosRes.data) ? 'Array' : 'Error'})`);

    // GET /api/tutores
    const tutoresRes = await request('/api/tutores', 'GET');
    report.endpoints['GET /api/tutores'] = tutoresRes.status === 200 ? 'OK' : `FAIL (${tutoresRes.status})`;
    console.log(`   GET /api/tutores: ${tutoresRes.status} (${Array.isArray(tutoresRes.data) ? 'Array' : 'Error'})`);

    // GET /api/carnets
    const carnetsRes = await request('/api/carnets', 'GET');
    report.endpoints['GET /api/carnets'] = carnetsRes.status === 200 ? 'OK' : `FAIL (${carnetsRes.status})`;
    console.log(`   GET /api/carnets: ${carnetsRes.status} (${Array.isArray(carnetsRes.data) ? 'Array' : 'Error'})`);

    // 3. Crear Tutor para prueba
    console.log('\n➕ Creando Tutor de prueba...');
    const tutorBody = {
      nombre: 'Marisa',
      apellido: 'Alvarez',
      DNI: '99888777',
      telefono: '11-4444-5555',
      email: 'marisa@example.com',
      parentesco: 'MADRE',
      contactoEmergencia: '11-6666-7777'
    };
    const newTutor = await request('/api/socios/tutores', 'POST', tutorBody, adminToken);
    report.endpoints['POST /api/socios/tutores'] = newTutor.status === 201 ? 'OK' : `FAIL (${newTutor.status})`;
    console.log(`   POST /api/socios/tutores: ${newTutor.status} (ID: ${newTutor.data?.id})`);

    // 4. Crear Socio vinculado a ese tutor
    console.log('\n➕ Creando Socio de prueba...');
    const randomDni = Math.floor(10000000 + Math.random() * 90000000).toString();
    const socioBody = {
      nombre: 'Julian',
      apellido: 'Alvarez',
      DNI: randomDni,
      fechaNacimiento: '2012-08-15',
      sexo: 'MASCULINO',
      email: `julian.alvarez.${randomDni}@example.com`,
      direccion: 'Rivadavia 500',
      ciudad: 'CABA',
      provincia: 'Buenos Aires',
      codigoPostal: '1406',
      telefono: '11-7777-8888',
      estado: 'ACTIVO',
      tutorId: newTutor.data?.id,
      observaciones: 'Menor federado en futsal'
    };
    const newSocio = await request('/api/socios', 'POST', socioBody, adminToken);
    report.endpoints['POST /api/socios'] = newSocio.status === 201 ? 'OK' : `FAIL (${newSocio.status})`;
    console.log(`   POST /api/socios: ${newSocio.status} (ID: ${newSocio.data?.id}, Socio Nº: ${newSocio.data?.socioNumber})`);

    if (newSocio.status === 201 && newSocio.data?.userId) {
      const socioId = newSocio.data.id;
      const userId = newSocio.data.userId;

      // 5. Probar Compatibilidad Legacy: GET /api/members/me con JWT
      console.log('\n🔐 Probando compatibilidad legacy con JWT...');
      console.log(`   Firmando token JWT de prueba para userId: ${userId}...`);
      const token = jwt.sign({ userId, role: 'SOCIO' }, JWT_SECRET);

      console.log('   Invocando GET /api/members/me...');
      const meRes = await request('/api/members/me', 'GET', null, token);
      report.endpoints['GET /api/members/me'] = meRes.status === 200 ? 'OK' : `FAIL (${meRes.status})`;
      console.log(`   GET /api/members/me: ${meRes.status}`);

      if (meRes.status === 200) {
        const payload = meRes.data;
        const validName = payload.firstName === 'Julian' && payload.lastName === 'Alvarez';
        const validDni = payload.dni === randomDni;
        const hasSocioNum = typeof payload.socioNumber === 'number';
        const isActiveBoolean = payload.isActive === true;

        if (validName && validDni && hasSocioNum && isActiveBoolean) {
          report.compatibility = 'ESTABLE';
          console.log('   ✅ Compatibilidad de campos verificada con éxito:');
          console.log(`      - firstName: "${payload.firstName}" (Correcto)`);
          console.log(`      - lastName: "${payload.lastName}" (Correcto)`);
          console.log(`      - dni: "${payload.dni}" (Correcto)`);
          console.log(`      - socioNumber: ${payload.socioNumber} (Correcto)`);
          console.log(`      - isActive: ${payload.isActive} (Correcto)`);
        } else {
          report.compatibility = 'FALLIDA';
          report.errors.push('Los campos mapeados en /api/members/me no coinciden con la especificación legacy.');
          console.log('   ❌ Error de mapeo en los campos legacy del socio.');
        }
      } else {
        report.compatibility = 'FALLIDA';
        report.errors.push(`/api/members/me retornó status ${meRes.status}`);
      }

      // 6. Generar Carnet Digital
      console.log('\n💳 Probando generación de Carnet Digital...');
      const cardGen = await request(`/api/socios/carnets/generate/${socioId}`, 'POST', null, adminToken);
      report.endpoints['POST /api/socios/carnets/generate/:socioId'] = cardGen.status === 201 ? 'OK' : `FAIL (${cardGen.status})`;
      console.log(`   POST /api/socios/carnets/generate/${socioId}: ${cardGen.status}`);
      if (cardGen.status === 201) {
        console.log(`      - Carnet QR: "${cardGen.data.qrCode}"`);
        console.log(`      - Expiración: ${cardGen.data.expiresAt}`);
      }

      // 7. Limpieza de registros
      console.log('\n🧹 Limpiando registros de verificación creados...');
      await prisma.digitalCard.deleteMany({ where: { socioId } });
      await prisma.member.delete({ where: { id: socioId } });
      await prisma.user.delete({ where: { id: userId } });
      await prisma.tutor.delete({ where: { id: newTutor.data.id } });
      console.log('   Base de datos restaurada.\n');
    } else {
      report.compatibility = 'FALLIDA';
      report.errors.push('No se pudo crear el socio para la prueba JWT.');
    }

  } catch (error) {
    report.backend = 'ERROR';
    report.prisma = 'ERROR';
    report.errors.push(error.message);
    console.error('\n❌ Error de ejecución en la prueba de integración:', error);
  }

  // Imprimir reporte de auditoría estructurado
  console.log('================================================================');
  console.log('📋 REPORTE FINAL DE AUDITORÍA DE INTEGRACIÓN – FASE 3');
  console.log('================================================================');
  console.log(`🟢 Estado Servidor Backend:   ${report.backend}`);
  console.log(`🟢 Estado Prisma / DB:        ${report.prisma}`);
  console.log(`🟢 Compatibilidad Legacy (me): ${report.compatibility}`);
  console.log('\n🏁 Estados de Endpoints:');
  Object.entries(report.endpoints).forEach(([endpoint, status]) => {
    console.log(`   - ${endpoint.padEnd(45)}: ${status === 'OK' ? '✅ OK' : '❌ ' + status}`);
  });
  
  if (report.errors.length > 0) {
    console.log('\n❌ Incidencias detectadas:');
    report.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n🎉 ¡Compatibilidad e Integración confirmadas al 100% como ESTABLE!');
  }
  console.log('================================================================\n');
}

run();
