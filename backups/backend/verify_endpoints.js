const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';

// Generate tokens for verification
const adminToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);
const socioToken = jwt.sign({ userId: 26, role: 'SOCIO' }, JWT_SECRET); // Martin Perez

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
  console.log('Testing Endpoints on localhost:5000...');
  
  try {
    // 1. Test GET /api/socios
    console.log('Testing GET /api/socios (Admin Token):');
    const resSocios = await request('/api/socios', 'GET', null, adminToken);
    console.log(`  Status: ${resSocios.status} (Expected: 200)`);
    console.log(`  Count: ${resSocios.data ? resSocios.data.length : 0}`);
    console.log(`  Sample: ${resSocios.data && resSocios.data.length > 0 ? resSocios.data[0].firstName + ' ' + resSocios.data[0].lastName : 'N/A'}`);

    // 2. Test GET /api/members/me
    console.log('\nTesting GET /api/members/me (Socio Token):');
    const resMe = await request('/api/members/me', 'GET', null, socioToken);
    console.log(`  Status: ${resMe.status} (Expected: 200)`);
    console.log(`  Member Name: ${resMe.data ? resMe.data.firstName + ' ' + resMe.data.lastName : 'N/A'}`);
    console.log(`  Socio Number: ${resMe.data ? resMe.data.socioNumber : 'N/A'}`);

    // 3. Test GET /api/reservas/bookings
    console.log('\nTesting GET /api/reservas/bookings (Admin Token):');
    const resBookings = await request('/api/reservas/bookings', 'GET', null, adminToken);
    console.log(`  Status: ${resBookings.status} (Expected: 200)`);
    console.log(`  Bookings Count: ${resBookings.data ? resBookings.data.length : 0}`);
  } catch (error) {
    console.error('Error running endpoint tests:', error);
  }
}

run();
