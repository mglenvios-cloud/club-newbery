const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jn_2026';
const testToken = jwt.sign({ userId: 1, role: 'ADMIN' }, JWT_SECRET);

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
      // Check if it's a PDF
      const contentType = res.headers['content-type'];
      if (contentType === 'application/pdf') {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ status: res.statusCode, type: 'pdf', length: buffer.length });
        });
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, type: 'json', data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, type: 'raw', raw: data });
          }
        });
      }
    });

    req.on('error', err => reject(err));

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// First, start the express server programmatically so we can hit it
const app = require('../index.js');

async function run() {
  console.log("Waiting for server to start...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("\n1. Testing GET /api/finanzas/payment-methods...");
  try {
    const res = await request('/api/finanzas/payment-methods', 'GET', null, testToken);
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (e) {
    console.error("Payment methods test failed:", e);
  }

  console.log("\n2. Testing GET /api/finanzas/invoices/9 (as ADMIN)...");
  try {
    // Note: invoice ID 9 must exist. Let's query one from database first
    const prisma = require('../prismaClient');
    const invoice = await prisma.invoice.findFirst();
    if (invoice) {
      const res = await request(`/api/finanzas/invoices/${invoice.id}`, 'GET', null, testToken);
      console.log("Status:", res.status);
      console.log("Content-Type:", res.type);
      console.log("PDF length (bytes):", res.length);
    } else {
      console.log("No invoices found in database to test.");
    }
  } catch (e) {
    console.error("Invoice PDF test failed:", e);
  }

  console.log("\nTesting completed. Exiting...");
  process.exit(0);
}

run();
