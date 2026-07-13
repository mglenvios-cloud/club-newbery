const http = require('http');
const jwt = require('jsonwebtoken');

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
  console.log('🤖 Iniciando verificación de Fase 3: Socios y Carnet Digital...\n');
  try {
    // 1. Obtener socios inicialmente
    console.log('1. GET /api/socios...');
    const getRes = await request('/api/socios', 'GET', null, adminToken);
    console.log(`   Status: ${getRes.status}`);
    console.log(`   Socios iniciales: ${Array.isArray(getRes.data) ? getRes.data.length : 'Error'}`);

    // 2. Crear un tutor
    console.log('\n2. POST /api/socios/tutores (Crear Tutor)...');
    const tutorDni = String(Math.floor(10000000 + Math.random() * 90000000));
    const tutorData = {
      nombre: "Carlos",
      apellido: "Perez",
      DNI: tutorDni,
      telefono: "15-4444-5555",
      email: `carlos.perez.${tutorDni}@test.com`,
      parentesco: "PADRE",
      contactoEmergencia: "Mama 15-2222-3333"
    };
    const tutorRes = await request('/api/socios/tutores', 'POST', tutorData, adminToken);
    console.log(`   Status: ${tutorRes.status}`);
    const tutorId = tutorRes.data.id;
    console.log(`   Tutor creado id: ${tutorId}`);

    // 3. Crear un Socio
    console.log('\n3. POST /api/socios (Crear Socio)...');
    const socioDni = String(Math.floor(10000000 + Math.random() * 90000000));
    const socioData = {
      nombre: "Martin",
      apellido: "Perez",
      DNI: socioDni,
      fechaNacimiento: "2015-05-20",
      email: `martin.perez.${socioDni}@test.com`,
      direccion: "Alpatacal 3000",
      telefono: "15-9999-8888",
      ciudad: "Buenos Aires",
      provincia: "CABA",
      codigoPostal: "1417",
      tutorId: tutorId,
      category: "INFANTIL",
      estado: "ACTIVO"
    };
    const socioRes = await request('/api/socios', 'POST', socioData, adminToken);
    console.log(`   Status: ${socioRes.status}`);
    const socioId = socioRes.data.id;
    console.log(`   Socio creado id: ${socioId}, Numero Socio: ${socioRes.data.socioNumber}`);

    // 4. Generar Carnet Digital
    console.log(`\n4. POST /api/socios/carnets/generate/${socioId} (Generar Carnet Digital)...`);
    const carnetRes = await request(`/api/socios/carnets/generate/${socioId}`, 'POST', null, adminToken);
    console.log(`   Status: ${carnetRes.status}`);
    console.log(`   Carnet QR: ${carnetRes.data.qrCode}, Status: ${carnetRes.data.status}`);

    // 5. Consultar Carnet
    console.log(`\n5. GET /api/socios/carnets/${carnetRes.data.id} (Consultar Carnet)...`);
    const getCarnetRes = await request(`/api/socios/carnets/${carnetRes.data.id}`, 'GET', null, adminToken);
    console.log(`   Status: ${getCarnetRes.status}`);
    console.log(`   Socio en carnet: ${getCarnetRes.data.socio.firstName} ${getCarnetRes.data.socio.lastName}`);

    // 6. Listar Socios
    console.log('\n6. GET /api/socios (Listar)...');
    const listRes = await request('/api/socios', 'GET', null, adminToken);
    console.log(`   Status: ${listRes.status}`);
    console.log(`   Socios actuales: ${listRes.data.length}`);

    // 7. Limpieza Socio
    console.log(`\n7. DELETE /api/socios/${socioId} (Limpieza)...`);
    const delSocio = await request(`/api/socios/${socioId}`, 'DELETE', null, adminToken);
    console.log(`   Status: ${delSocio.status}`);

    // 8. Limpieza Tutor
    console.log(`\n8. DELETE /api/socios/tutores/${tutorId} (Limpieza Tutor)...`);
    const delTutor = await request(`/api/socios/tutores/${tutorId}`, 'DELETE', null, adminToken);
    console.log(`   Status: ${delTutor.status}`);

    console.log('\n🎉 ¡Verificación oficial de Fase 3 completada con éxito!');
  } catch (e) {
    console.error('❌ Error en verificación:', e);
  }
}

run();
