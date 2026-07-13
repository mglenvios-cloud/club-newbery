const http = require('http');

const API_URL = 'http://localhost:5000';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(dataStr);
    req.end();
  });
}

function get(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers
    };

    const req = http.request(options, (res) => {
      const contentType = res.headers['content-type'];
      if (contentType === 'application/pdf') {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ status: res.statusCode, headers: res.headers, type: 'pdf', length: buffer.length });
        });
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, type: 'json', data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, type: 'raw', raw: data });
          }
        });
      }
    });

    req.on('error', err => reject(err));
    req.end();
  });
}

async function validate() {
  console.log("==================================================");
  console.log("🚀 INICIANDO VALIDACIÓN FUNCIONAL PROGRAMÁTICA");
  console.log("==================================================\n");

  const results = {};

  // 1. LOGIN ADMIN
  console.log("🔑 [1] Iniciando sesión como ADMIN...");
  let adminToken = null;
  try {
    const resLogin = await post('/api/auth/login', { email: 'admin', password: 'admin' });
    if (resLogin.status === 200 && resLogin.data.token) {
      adminToken = resLogin.data.token;
      console.log("   ✅ Login ADMIN exitoso. Token obtenido.");
      results.adminLogin = "OK";
    } else {
      console.log("   ❌ Login ADMIN fallido:", resLogin.status, resLogin.data);
      results.adminLogin = "FAIL";
    }
  } catch (e) {
    console.error("   ❌ Error en login ADMIN:", e.message);
    results.adminLogin = "FAIL";
  }

  // 2. COMPROBACIÓN DASHBOARD ADMIN (LECTURA DE TODAS LAS TARJETAS KPI)
  if (adminToken) {
    console.log("\n📊 [2] Probando endpoints del Dashboard como ADMIN...");
    const endpoints = [
      { name: 'Socios', path: '/api/socios' },
      { name: 'Reservas/Bookings', path: '/api/reservas/bookings' },
      { name: 'Transactions', path: '/api/transactions' },
      { name: 'Payments', path: '/api/finanzas/payments' },
      { name: 'News', path: '/api/news' },
      { name: 'Media', path: '/api/media' }
    ];

    results.adminKPIs = "OK";
    for (const ep of endpoints) {
      try {
        const res = await get(ep.path, adminToken);
        if (res.status === 200) {
          console.log(`   ✅ KPI ${ep.name} (${ep.path}): Carga exitosa. Status: 200. Registros: ${res.data?.length ?? 0}`);
        } else {
          console.log(`   ❌ KPI ${ep.name} (${ep.path}): Falló con Status ${res.status}`);
          results.adminKPIs = "FAIL";
        }
      } catch (e) {
        console.log(`   ❌ KPI ${ep.name} (${ep.path}): Error ${e.message}`);
        results.adminKPIs = "FAIL";
      }
    }
  }

  // 3. LOGIN FUTSAL & VERIFICACIÓN DE PERMISOS
  console.log("\n🔑 [3] Iniciando sesión como FUTSAL...");
  let futsalToken = null;
  try {
    const resLogin = await post('/api/auth/login', { email: 'futsal', password: 'futsal' });
    if (resLogin.status === 200 && resLogin.data.token) {
      futsalToken = resLogin.data.token;
      console.log("   ✅ Login FUTSAL exitoso. Token obtenido.");
      results.futsalLogin = "OK";
    } else {
      console.log("   ❌ Login FUTSAL fallido:", resLogin.status, resLogin.data);
      results.futsalLogin = "FAIL";
    }
  } catch (e) {
    console.error("   ❌ Error en login FUTSAL:", e.message);
    results.futsalLogin = "FAIL";
  }

  if (futsalToken) {
    console.log("\n📊 [4] Probando lectura del Dashboard como FUTSAL...");
    const endpoints = [
      { name: 'Socios', path: '/api/socios' },
      { name: 'Reservas/Bookings', path: '/api/reservas/bookings' },
      { name: 'Transactions', path: '/api/transactions' },
      { name: 'Payments', path: '/api/finanzas/payments' }
    ];

    results.futsalKPIs = "OK";
    for (const ep of endpoints) {
      try {
        const res = await get(ep.path, futsalToken);
        if (res.status === 200) {
          console.log(`   ✅ KPI ${ep.name} (${ep.path}): Carga exitosa para FUTSAL. Status: 200. Registros: ${res.data?.length ?? 0}`);
        } else {
          console.log(`   ❌ KPI ${ep.name} (${ep.path}): Falló con Status ${res.status}`);
          results.futsalKPIs = "FAIL";
        }
      } catch (e) {
        console.log(`   ❌ KPI ${ep.name} (${ep.path}): Error ${e.message}`);
        results.futsalKPIs = "FAIL";
      }
    }

    console.log("\n🔒 [5] Probando restricción de ESCRITURA para FUTSAL...");
    try {
      const resWrite = await post('/api/socios', {
        nombre: 'Futsal',
        apellido: 'Test',
        DNI: '12345678',
        fechaNacimiento: '1995-01-01',
        email: 'futsal.test@example.com'
      }, futsalToken); // note: write functions expect token, let's pass token manually
      
      // Let's make post accept token too
      // Wait, we'll modify post below to support it, let's just make it a standard post
    } catch {}

    // Let's do a manual write post request with headers
    try {
      const dataStr = JSON.stringify({ concept: 'TEST', amount: 100, memberName: 'Test' });
      const res = await new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/transactions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${futsalToken}`,
            'Content-Length': Buffer.byteLength(dataStr)
          }
        };
        const req = http.request(options, res => resolve(res.statusCode));
        req.write(dataStr);
        req.end();
      });
      if (res === 403) {
        console.log("   ✅ Escritura denegada (403 Forbidden) para FUTSAL. Correcto.");
        results.writeExclusivity = "OK";
      } else {
        console.log("   ❌ Escritura no denegada! Status:", res);
        results.writeExclusivity = "FAIL";
      }
    } catch (e) {
      console.log("   ❌ Error en prueba de escritura:", e.message);
      results.writeExclusivity = "FAIL";
    }
  }

  // 4. PORTAL DEL SOCIO & MEDIOS DE PAGO DINÁMICOS
  console.log("\n🔑 [6] Iniciando sesión como SOCIO (Martin Perez)...");
  let socioToken = null;
  try {
    const resLogin = await post('/api/auth/login', { email: 'martin.perez.47542096@example.com', password: 'socio123' });
    if (resLogin.status === 200 && resLogin.data.token) {
      socioToken = resLogin.data.token;
      console.log("   ✅ Login SOCIO exitoso. Token obtenido.");
      results.socioLogin = "OK";
    } else {
      console.log("   ❌ Login SOCIO fallido:", resLogin.status, resLogin.data);
      results.socioLogin = "FAIL";
    }
  } catch (e) {
    console.error("   ❌ Error en login SOCIO:", e.message);
    results.socioLogin = "FAIL";
  }

  if (socioToken) {
    console.log("\n💳 [7] Obteniendo medios de pago dinámicos (/api/finanzas/payment-methods)...");
    try {
      const resMethods = await get('/api/finanzas/payment-methods', socioToken);
      if (resMethods.status === 200) {
        console.log("   ✅ Medios de pago cargados desde el backend. Métodos activos:");
        console.log(resMethods.data);
        const methodIds = resMethods.data.map(m => m.id);
        if (methodIds.includes('MERCADOPAGO') && methodIds.includes('TRANSFERENCIA') && methodIds.includes('EFECTIVO') && !methodIds.includes('TARJETA')) {
          console.log("   ✅ Filtro dinámico correcto: Mercado Pago, Transferencia y Efectivo están activos. Tarjeta está inactiva y no se listó.");
          results.paymentMethods = "OK";
        } else {
          console.log("   ❌ Lista de métodos incorrecta o inactivos no filtrados.");
          results.paymentMethods = "FAIL";
        }
      } else {
        console.log("   ❌ Error al obtener medios de pago. Status:", resMethods.status);
        results.paymentMethods = "FAIL";
      }
    } catch (e) {
      console.log("   ❌ Error en prueba de medios de pago:", e.message);
      results.paymentMethods = "FAIL";
    }

    // 5. RECIBO PDF VALIDATION
    console.log("\n🧾 [8] Descargando comprobante de pago en formato PDF (/api/finanzas/invoices/:id)...");
    try {
      const prisma = require('../prismaClient');
      const invoice = await prisma.invoice.findFirst();
      if (invoice) {
        console.log(`   Descargando comprobante ID ${invoice.id} (Número ${invoice.numero})...`);
        const resPdf = await get(`/api/finanzas/invoices/${invoice.id}`, socioToken);
        if (resPdf.status === 200 && resPdf.type === 'pdf') {
          console.log(`   ✅ Descarga exitosa. Content-Type: application/pdf. Tamaño: ${resPdf.length} bytes.`);
          results.pdfInvoice = "OK";
        } else {
          console.log(`   ❌ Descarga fallida. Status: ${resPdf.status}. Tipo: ${resPdf.type}`);
          results.pdfInvoice = "FAIL";
        }
      } else {
        console.log("   ⚠ No hay comprobantes en la BD para probar descarga de PDF.");
        results.pdfInvoice = "SKIP";
      }
    } catch (e) {
      console.log("   ❌ Error en descarga de PDF:", e.message);
      results.pdfInvoice = "FAIL";
    }

    // 6. RESERVAS
    console.log("\n🏟️ [9] Creando reserva deportiva...");
    try {
      const prisma = require('../prismaClient');
      const facility = await prisma.facility.findFirst({ where: { status: 'ACTIVE' } });
      if (facility) {
        console.log(`   Utilizando Cancha ID ${facility.id} (${facility.name})...`);
        const bookingDate = '2026-09-01';
        
        // Registrar booking via API
        const bookingData = JSON.stringify({
          nombreCliente: 'Martin Perez Test',
          telefono: '11223344',
          email: 'martin.perez.47542096@example.com',
          facilityId: facility.id,
          fecha: bookingDate,
          horaInicio: '10:00',
          horaFin: '11:00',
          tipoReserva: 'SOCIO'
        });

        const resBooking = await new Promise((resolve) => {
          const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/reservas/bookings',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${socioToken}`,
              'Content-Length': Buffer.byteLength(bookingData)
            }
          };
          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
          });
          req.write(bookingData);
          req.end();
        });

        if (resBooking.status === 201) {
          console.log(`   ✅ Reserva registrada exitosamente via API. ID: ${resBooking.data.id}`);
          
          // Verificar en la tabla Booking con Prisma
          const savedBooking = await prisma.booking.findUnique({
            where: { id: resBooking.data.id }
          });
          if (savedBooking) {
            console.log(`   ✅ Booking verificado en la tabla 'Booking' de Prisma.`);
            
            // Verificar que aparezca en el listado administrativo
            const adminBookings = await get('/api/reservas/bookings', adminToken);
            const foundInAdminList = adminBookings.data.some(b => b.id === resBooking.data.id);
            if (foundInAdminList) {
              console.log("   ✅ Booking visible en el listado del panel administrativo. Excelente.");
              results.reservas = "OK";
            } else {
              console.log("   ❌ Booking no aparece en el listado administrativo.");
              results.reservas = "FAIL";
            }

            // Cleanup
            await prisma.booking.delete({ where: { id: resBooking.data.id } });
            console.log("   🧹 Reserva de prueba eliminada.");
          } else {
            console.log("   ❌ No se encontró el registro en la base de datos.");
            results.reservas = "FAIL";
          }
        } else {
          console.log("   ❌ Error al registrar reserva via API. Status:", resBooking.status, resBooking.data);
          results.reservas = "FAIL";
        }
      } else {
        console.log("   ⚠ No hay instalaciones activas en la BD para probar.");
        results.reservas = "SKIP";
      }
    } catch (e) {
      console.log("   ❌ Error en prueba de reservas:", e.message);
      results.reservas = "FAIL";
    }
  }

  console.log("\n==================================================");
  console.log("📊 RESULTADOS DE LA VALIDACIÓN FUNCIONAL");
  console.log("==================================================");
  console.log(JSON.stringify(results, null, 2));
  console.log("==================================================\n");

  process.exit(0);
}

validate();
