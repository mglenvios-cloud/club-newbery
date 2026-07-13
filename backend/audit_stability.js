const http = require('http');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';

function request(path, method, body = null, token = null) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

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

    req.on('error', () => {
      resolve({ status: 500, error: 'Connection Refused' });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAudit() {
  console.log('🔍 Iniciando Auditoría General de Estabilidad (Post Fase 3)...\n');

  const auditReport = {
    gestionDeportiva: 'FAIL',
    adminGeneral: 'FAIL',
    socios: 'FAIL',
    compatibilidadMe: 'FAIL'
  };

  try {
    // 1. Verificar Gestión Deportiva
    console.log('1. Probando módulo Gestión Deportiva...');
    const gdRes = await request('/api/gestion-deportiva/stats', 'GET');
    console.log(`   GET /api/gestion-deportiva/stats: ${gdRes.status}`);
    if (gdRes.status === 200) auditReport.gestionDeportiva = 'OK';

    // 2. Verificar Administración General
    console.log('\n2. Probando módulo Administración General...');
    const agRes = await request('/api/admin-general/club-config', 'GET');
    console.log(`   GET /api/admin-general/club-config: ${agRes.status}`);
    if (agRes.status === 200) auditReport.adminGeneral = 'OK';

    // 3. Verificar Centro de Socios
    console.log('\n3. Probando módulo Centro de Socios...');
    const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);
    const scRes = await request('/api/socios', 'GET', null, adminToken);
    console.log(`   GET /api/socios: ${scRes.status}`);
    if (scRes.status === 200) auditReport.socios = 'OK';

    // 4. Crear un socio/user temporal y verificar /api/members/me
    console.log('\n4. Creando registro temporal para verificar compatibilidad...');
    
    // Buscar o crear club
    let club = await prisma.club.findFirst();
    if (!club) {
      club = await prisma.club.create({ data: { name: 'Club de Auditoria' } });
    }

    const testUser = await prisma.user.create({
      data: {
        email: 'auditor@example.com',
        password: 'auditpassword',
        role: 'SOCIO',
        isActive: true,
        name: 'Socio Auditor',
        clubId: club.id
      }
    });

    const testMember = await prisma.member.create({
      data: {
        socioNumber: 9999,
        firstName: 'Socio',
        lastName: 'Auditor',
        dni: '99999999',
        birthDate: new Date('1990-01-01'),
        address: 'Calle Auditoria 100',
        phone: '12345678',
        email: 'auditor@example.com',
        estado: 'ACTIVO',
        userId: testUser.id,
        clubId: club.id
      }
    });

    const token = jwt.sign({ userId: testUser.id, role: 'SOCIO' }, JWT_SECRET);
    
    console.log('   Invocando GET /api/members/me...');
    const meRes = await request('/api/members/me', 'GET', null, token);
    console.log(`   GET /api/members/me: ${meRes.status}`);
    
    if (meRes.status === 200 && meRes.data && meRes.data.socioNumber === 9999) {
      auditReport.compatibilidadMe = 'OK';
      console.log('   ✅ /api/members/me mapea correctamente los campos.');
    }

    // Limpieza
    await prisma.member.delete({ where: { id: testMember.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('   Registro temporal eliminado de forma segura.');

  } catch (err) {
    console.error('❌ Error fatal en ejecución de auditoría:', err.message);
  }

  console.log('\n======================================================');
  console.log('📋 DIAGNÓSTICO DE ESTABILIDAD DE RUTA DE APIS');
  console.log('======================================================');
  console.log(`- Gestión Deportiva (GD):    ${auditReport.gestionDeportiva === 'OK' ? '✅ OK' : '❌ FAIL'}`);
  console.log(`- Administración General (AG): ${auditReport.adminGeneral === 'OK' ? '✅ OK' : '❌ FAIL'}`);
  console.log(`- Centro de Socios (SC):     ${auditReport.socios === 'OK' ? '✅ OK' : '❌ FAIL'}`);
  console.log(`- Mapeo Legacy (/members/me): ${auditReport.compatibilidadMe === 'OK' ? '✅ OK' : '❌ FAIL'}`);
  console.log('======================================================\n');
}

runAudit();
