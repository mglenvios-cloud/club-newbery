const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';
const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);

function request(path, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        ...headers
      }
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

    if (body) {
      if (headers['Content-Type'] && headers['Content-Type'].startsWith('multipart/form-data')) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function run() {
  console.log('🤖 INICIANDO VERIFICACIÓN DE MARKETING Y SPONSORS (FASE 4)...\n');
  let sponsorId, bannerId, campaignId, fileId;

  try {
    // 1. Crear Sponsor
    console.log('⏳ 1. Probando: Crear Sponsor...');
    const resSponsor = await request('/api/publicidad/sponsors', 'POST', {}, {
      name: 'Coca Cola Test',
      category: 'PRINCIPAL',
      website: 'https://coca-cola.com',
      whatsapp: '1122334455',
      address: 'Av. Del Libertador 1234, CABA',
      contractStartDate: '2026-07-12',
      contractEndDate: '2027-07-12',
      status: 'activo'
    });

    if (resSponsor.status === 201 && resSponsor.data.id) {
      sponsorId = resSponsor.data.id;
      console.log(`  ✔ Éxito! Sponsor creado con ID: ${sponsorId}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resSponsor.status}`, resSponsor.data || resSponsor.raw);
      process.exit(1);
    }

    // 2. Editar Sponsor
    console.log('\n⏳ 2. Probando: Editar Sponsor...');
    const resEditSponsor = await request(`/api/publicidad/sponsors/${sponsorId}`, 'PUT', {}, {
      name: 'Coca Cola Company Test',
      category: 'PRINCIPAL',
      address: 'Av. Del Libertador 5555, CABA'
    });

    if (resEditSponsor.status === 200 && resEditSponsor.data.name === 'Coca Cola Company Test') {
      console.log('  ✔ Éxito! Sponsor editado correctamente.');
    } else {
      console.log(`  ❌ Fallo. Status: ${resEditSponsor.status}`, resEditSponsor.data || resEditSponsor.raw);
      process.exit(1);
    }

    // 3. Subir Archivo
    console.log('\n⏳ 3. Probando: Subir Archivo (Simulado)...');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    const boundaryHeader = `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nsponsors\r\n`;
    const boundaryFile = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-logo.png"\r\nContent-Type: image/png\r\n\r\n`;
    const fileBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const boundaryEnd = `\r\n--${boundary}--\r\n`;

    const multipartBody = Buffer.concat([
      Buffer.from(boundaryHeader),
      Buffer.from(boundaryFile),
      fileBytes,
      Buffer.from(boundaryEnd)
    ]);

    const resUpload = await request('/api/media/upload', 'POST', {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length
    }, multipartBody);

    if (resUpload.status === 201 && resUpload.data.id) {
      fileId = resUpload.data.id;
      console.log(`  ✔ Éxito! Archivo subido con ID: ${fileId} | URL: ${resUpload.data.url}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resUpload.status}`, resUpload.data || resUpload.raw);
      process.exit(1);
    }

    // 4. Crear Banner
    console.log('\n⏳ 4. Probando: Crear Banner...');
    const resBanner = await request('/api/publicidad/banners', 'POST', {}, {
      title: 'Coca Cola Banner Principal',
      imageUrl: resUpload.data.url,
      linkUrl: 'https://coca-cola.com/promo',
      locations: ['home'],
      sponsorId: sponsorId
    });

    if (resBanner.status === 201 && resBanner.data.id) {
      bannerId = resBanner.data.id;
      console.log(`  ✔ Éxito! Banner creado con ID: ${bannerId}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resBanner.status}`, resBanner.data || resBanner.raw);
      process.exit(1);
    }

    // 5. Crear Campaña
    console.log('\n⏳ 5. Probando: Crear Campaña...');
    const resCampaign = await request('/api/publicidad/campaigns', 'POST', {}, {
      title: 'Campaña Primavera Coca Cola',
      imageUrl: resUpload.data.url,
      linkUrl: 'https://coca-cola.com/primavera',
      locations: ['home'],
      sponsorId: sponsorId,
      status: 'ACTIVE'
    });

    if (resCampaign.status === 201 && resCampaign.data.id) {
      campaignId = resCampaign.data.id;
      console.log(`  ✔ Éxito! Campaña creada con ID: ${campaignId}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resCampaign.status}`, resCampaign.data || resCampaign.raw);
      process.exit(1);
    }

    // 6. Registrar Impresión/Vista (VIEW)
    console.log('\n⏳ 6. Probando: Registrar Visualización (Impresión)...');
    const resView = await request('/api/publicidad/statistics/event', 'POST', {}, {
      type: 'VIEW',
      bannerId: bannerId,
      campaignId: campaignId,
      sponsorId: sponsorId,
      device: 'desktop',
      ip: '127.0.0.1'
    });

    if (resView.status === 201 && resView.data.id) {
      console.log(`  ✔ Éxito! Evento VIEW registrado con ID: ${resView.data.id}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resView.status}`, resView.data || resView.raw);
      process.exit(1);
    }

    // 7. Registrar Click (CLICK)
    console.log('\n⏳ 7. Probando: Registrar Click...');
    const resClick = await request('/api/publicidad/statistics/event', 'POST', {}, {
      type: 'CLICK',
      bannerId: bannerId,
      campaignId: campaignId,
      sponsorId: sponsorId,
      device: 'mobile',
      ip: '127.0.0.1'
    });

    if (resClick.status === 201 && resClick.data.id) {
      console.log(`  ✔ Éxito! Evento CLICK registrado con ID: ${resClick.data.id}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resClick.status}`, resClick.data || resClick.raw);
      process.exit(1);
    }

    // 8. Generar Estadísticas
    console.log('\n⏳ 8. Probando: Generar Estadísticas de Negocios...');
    const resStats = await request('/api/publicidad/statistics', 'GET');

    if (resStats.status === 200 && resStats.data.totalClicks !== undefined) {
      console.log('  ✔ Éxito! Estadísticas generadas exitosamente.');
      console.log(`    Total Sponsors: ${resStats.data.totalSponsors}`);
      console.log(`    Total Views: ${resStats.data.totalViews}`);
      console.log(`    Total Clics: ${resStats.data.totalClicks}`);
      console.log(`    CTR Promedio: ${resStats.data.ctr}%`);
      console.log(`    Uso Dispositivo (Desktop/Mobile/Tablet): ${JSON.stringify(resStats.data.deviceStats)}`);
    } else {
      console.log(`  ❌ Fallo. Status: ${resStats.status}`, resStats.data || resStats.raw);
      process.exit(1);
    }

    // Limpieza de datos creados en el test
    console.log('\n... Limpiando base de datos de pruebas...');
    await request(`/api/media/${fileId}?type=file`, 'DELETE');
    await request(`/api/publicidad/campaigns/${campaignId}`, 'DELETE');
    await request(`/api/publicidad/banners/${bannerId}`, 'DELETE');
    await request(`/api/publicidad/sponsors/${sponsorId}`, 'DELETE');
    console.log('  ✔ Limpieza completada.');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS FUE APROBADAS SATISFACTORIAMENTE! Fase 4 en orden.');
  } catch (error) {
    console.error('❌ Error de red durante la prueba:', error.message);
  }
}

run();
