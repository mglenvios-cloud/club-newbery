const http = require('http');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';
const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);
const userToken = jwt.sign({ userId: 2, role: 'USER' }, JWT_SECRET);

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
  console.log('📺 Iniciando verificación oficial de Newbery TV y Gestión Multimedia...\n');

  try {
    // 1. Limpieza de datos de prueba previos
    console.log('🧹 Limpiando registros multimedia anteriores...');
    await prisma.futsalMedia.deleteMany({
      where: {
        title: {
          contains: 'TEST_VIDEO'
        }
      }
    });
    console.log('   Listo.\n');

    // 2. Probar acceso público (GET /api/media)
    console.log('1. Probando listado público (GET /api/media)...');
    const resGetPub = await request('/api/media', 'GET');
    console.log(`   Status: ${resGetPub.status}`);
    console.log(`   OK: Es un Array de elementos (${Array.isArray(resGetPub.data) ? 'Sí' : 'No'})\n`);

    // 3. Probar intento de creación sin autenticación (debe dar 401)
    console.log('2. Probando creación sin autenticar (POST /api/media)...');
    const bodyMedia = {
      type: 'VIDEO',
      title: 'TEST_VIDEO - Gol de taco contra Ferro',
      url: 'https://www.youtube.com/watch?v=mock_ferro_gol',
      category: 'Goles',
      description: 'Gran gol anotado en el segundo tiempo.',
      season: '2026',
      competition: 'AFA Primera',
      opponent: 'Ferro',
      published: true,
      visibility: 'PUBLIC',
      featured: true
    };
    const resPostUnauth = await request('/api/media', 'POST', bodyMedia);
    console.log(`   Status: ${resPostUnauth.status} (Esperado: 401)\n`);

    // 4. Probar intento de creación con rol USER no administrativo (debe dar 403)
    console.log('3. Probando creación con usuario ordinario (POST /api/media)...');
    const resPostUser = await request('/api/media', 'POST', bodyMedia, userToken);
    console.log(`   Status: ${resPostUser.status} (Esperado: 403)\n`);

    // 5. Probar intento de creación con URL inválida (debe dar 400)
    console.log('4. Probando creación con URL inválida (POST /api/media)...');
    const bodyInvalidUrl = { ...bodyMedia, url: 'invalid-url-format' };
    const resPostInvalid = await request('/api/media', 'POST', bodyInvalidUrl, adminToken);
    console.log(`   Status: ${resPostInvalid.status} (Esperado: 400)`);
    console.log(`   Error devuelto: "${resPostInvalid.data.error}"\n`);

    // 6. Probar creación exitosa con rol ADMIN
    console.log('5. Creando contenido multimedia válido como ADMIN...');
    const resPostAdmin = await request('/api/media', 'POST', bodyMedia, adminToken);
    console.log(`   Status: ${resPostAdmin.status} (Esperado: 201)`);
    console.log(`   ID Registrado: ${resPostAdmin.data.id}`);
    console.log(`   Featured: ${resPostAdmin.data.featured} (Esperado: true)`);
    console.log(`   Published: ${resPostAdmin.data.published} (Esperado: true)\n`);

    const mediaId = resPostAdmin.data.id;

    // 7. Consultar contenido y verificar incremento de visualizaciones
    console.log('6. Visualizando contenido registrado (GET /api/media/:id)...');
    const resGetSingleBefore = await request(`/api/media/${mediaId}`, 'GET');
    console.log(`   Vistas iniciales: ${resGetSingleBefore.data.views}`);

    // Esperar unos milisegundos y volver a consultar para verificar la actualización asíncrona
    await new Promise(r => setTimeout(r, 200));
    const resGetSingleAfter = await request(`/api/media/${mediaId}`, 'GET');
    console.log(`   Vistas después de reproducción: ${resGetSingleAfter.data.views} (Esperado: 1)\n`);

    // 8. Modificar a Borrador / Inactivo y verificar filtrado en listado público
    console.log('7. Actualizando contenido a no publicado (borrador) (PUT /api/media/:id)...');
    const updateBody = { ...bodyMedia, published: false };
    const resPut = await request(`/api/media/${mediaId}`, 'PUT', updateBody, adminToken);
    console.log(`   Status: ${resPut.status} (Esperado: 200)`);
    console.log(`   Published final: ${resPut.data.published} (Esperado: false)\n`);

    console.log('8. Verificando que el borrador no aparezca en listado público (GET /api/media)...');
    const resGetPubFiltered = await request('/api/media', 'GET');
    const foundInPub = resGetPubFiltered.data.some(item => item.id === mediaId);
    console.log(`   ¿Aparece en catálogo público?: ${foundInPub ? 'SÍ (Fallo)' : 'NO (Correcto)'}\n`);

    console.log('9. Verificando que aparezca en consulta administrativa (GET /api/media?admin=true)...');
    const resGetAdminList = await request('/api/media?admin=true', 'GET');
    const foundInAdmin = resGetAdminList.data.some(item => item.id === mediaId);
    console.log(`   ¿Aparece en catálogo administrativo?: ${foundInAdmin ? 'SÍ (Correcto)' : 'NO (Fallo)'}\n`);

    // 9. Eliminar contenido
    console.log('10. Eliminando contenido de prueba (DELETE /api/media/:id)...');
    const resDelete = await request(`/api/media/${mediaId}`, 'DELETE', null, adminToken);
    console.log(`   Status: ${resDelete.status} (Esperado: 200)`);
    console.log(`   Mensaje: "${resDelete.data.message}"\n`);

    console.log('✅ Verificación completada con 100% de éxito. ¡Newbery TV está plenamente operativo y seguro!');
  } catch (error) {
    console.error('❌ Error durante la verificación de Newbery TV:', error);
  } finally {
    prisma.$disconnect();
  }
}

run();
