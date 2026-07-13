const http = require('http');

const endpoints = [
  '/api/admin-general/club-config',
  '/api/admin-general/seasons',
  '/api/admin-general/disciplines',
  '/api/admin-general/sedes',
  '/api/admin-general/facilities',
  '/api/admin-general/roles',
  '/api/admin-general/users'
];

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n==========================================`);
        console.log(`Endpoint: ${path}`);
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        try {
          const json = JSON.parse(data);
          if (Array.isArray(json)) {
            console.log(`Result: Array of ${json.length} items.`);
            if (json.length > 0) {
              console.log(`First item keys:`, Object.keys(json[0]));
            }
          } else {
            console.log(`Result: Object keys:`, Object.keys(json));
          }
        } catch (e) {
          console.log(`Result: Plain text (truncated): ${data.substring(0, 200)}`);
        }
        resolve({ path, status: res.statusCode, success: res.statusCode === 200 });
      });
    });

    req.on('error', (error) => {
      console.error(`Error on ${path}:`, error.message);
      resolve({ path, status: null, success: false, error: error.message });
    });

    req.end();
  });
}

async function run() {
  console.log('🤖 Iniciando verificación oficial de endpoints de la Fase 2.5...\n');
  const results = [];
  for (const ep of endpoints) {
    const res = await testEndpoint(ep);
    results.push(res);
  }
  
  console.log('\n==========================================');
  console.log('📊 RESUMEN DE VERIFICACIÓN:');
  console.log('==========================================');
  let allSuccess = true;
  results.forEach(r => {
    const indicator = r.success ? '✅ [OK]' : '❌ [ERROR]';
    console.log(`${indicator} ${r.path} ── Status: ${r.status || 'FALLO CONEXIÓN'}`);
    if (!r.success) allSuccess = false;
  });
  
  if (allSuccess) {
    console.log('\n🎉 ¡Todos los endpoints responden correctamente!');
  } else {
    console.log('\n⚠️  Se detectaron errores en algunos endpoints. Revisar logs.');
  }
}

run();
