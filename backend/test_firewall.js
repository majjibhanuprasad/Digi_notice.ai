const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const payload = postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : null;
    const reqOptions = { ...options, headers: { ...options.headers } };
    if (payload) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? (() => { try { return JSON.parse(data); } catch { return data; } })() : null
        });
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

async function runFirewallTests() {
  console.log('🛡️  Starting DigiNotice AI Firewall & Security Hardening Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check & Security Headers (Helmet)
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });

    const hasNosniff = res.headers['x-content-type-options'] === 'nosniff';
    const hasFrameguard = res.headers['x-frame-options'] === 'SAMEORIGIN';
    const hidesPoweredBy = !res.headers['x-powered-by'];
    const bodyOk = res.body && res.body.status === 'ok' && res.body.firewall === 'active';

    if (hasNosniff && hasFrameguard && hidesPoweredBy && bodyOk) {
      console.log('✅ Test 1 Passed: HTTP Security Headers Firewall active (nosniff, SAMEORIGIN, no X-Powered-By, active health)');
      passed++;
    } else {
      console.error('❌ Test 1 Failed: Headers check failed', { hasNosniff, hasFrameguard, hidesPoweredBy, body: res.body });
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 1 Error:', err.message);
    failed++;
  }

  // Test 2: Unauthenticated Request to Protected AI Route
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/generate-notice',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { topic: 'Annual Sports Meet', audience: 'All Students' });

    if (res.statusCode === 401) {
      console.log('✅ Test 2 Passed: Route Authorization Firewall blocked unauthenticated request to /api/ai/generate-notice (401 Unauthorized)');
      passed++;
    } else {
      console.error(`❌ Test 2 Failed: Expected 401, got ${res.statusCode}`, res.body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 2 Error:', err.message);
    failed++;
  }

  // Get tokens for student and admin
  let studentToken = null;
  let adminToken = null;

  try {
    const studentLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'student1@college.edu', password: 'password123' });
    studentToken = studentLogin.body?.token;

    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'superadmin@college.edu', password: 'admin123' });
    adminToken = adminLogin.body?.token;
  } catch (err) {
    console.error('Login error:', err.message);
  }

  // Test 3: Student attempting Admin-Only AI Generation (Role Firewall)
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/generate-notice',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, { topic: 'Test Hackathon Notice' });

    if (res.statusCode === 403) {
      console.log('✅ Test 3 Passed: Role Authorization Firewall blocked STUDENT from admin-only AI generation (403 Forbidden)');
      passed++;
    } else {
      console.error(`❌ Test 3 Failed: Expected 403, got ${res.statusCode}`, res.body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 Error:', err.message);
    failed++;
  }

  // Test 4: Super Admin accessing AI Generation (Authorized Access)
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/generate-notice',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { topic: 'Campus Innovation Fair', audience: 'All Students' });

    if (res.statusCode === 200 && res.body?.title) {
      console.log('✅ Test 4 Passed: Super Admin authorized successfully through route firewall (200 OK)');
      passed++;
    } else {
      console.error(`❌ Test 4 Failed: Expected 200, got ${res.statusCode}`, res.body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 Error:', err.message);
    failed++;
  }

  // Test 5: CORS Firewall - Allowed Origin
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      headers: { 'Origin': 'http://localhost:5173' }
    });

    if (res.headers['access-control-allow-origin'] === 'http://localhost:5173') {
      console.log('✅ Test 5 Passed: CORS Firewall permitted legitimate frontend origin (http://localhost:5173)');
      passed++;
    } else {
      console.error('❌ Test 5 Failed: CORS header missing for allowed origin', res.headers);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 5 Error:', err.message);
    failed++;
  }

  // Test 6: CORS Firewall - Block Unauthorized Foreign Origin
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notices/kiosk',
      method: 'GET',
      headers: { 'Origin': 'https://malicious-attacker-domain.evil' }
    });

    if (res.statusCode === 403 && (typeof res.body === 'object' && res.body.error === 'CORS Block')) {
      console.log('✅ Test 6 Passed: CORS Firewall blocked unauthorized external origin (403 CORS Block)');
      passed++;
    } else {
      console.error(`❌ Test 6 Failed: Expected 403 CORS block, got ${res.statusCode}`, res.body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 Error:', err.message);
    failed++;
  }

  // Test 7: Prototype Pollution / Malicious Payload Sanitizer
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{"email":"test@test.com","password":"123","__proto__":{"polluted":true}}');

    if (res.statusCode === 400 && res.body?.message?.includes('Firewall Block')) {
      console.log('✅ Test 7 Passed: Payload Sanitizer Firewall blocked prototype pollution exploit (400 Bad Request)');
      passed++;
    } else {
      console.error(`❌ Test 7 Failed: Expected 400 Firewall Block, got ${res.statusCode}`, res.body);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 Error:', err.message);
    failed++;
  }

  // Test 8: Rate Limiter Headers
  try {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'student1@college.edu', password: 'password123' });

    const hasLimit = res.headers['ratelimit-limit'] !== undefined;
    const hasRemaining = res.headers['ratelimit-remaining'] !== undefined;

    if (hasLimit && hasRemaining) {
      console.log(`✅ Test 8 Passed: Rate Limiting Firewall active (Limit: ${res.headers['ratelimit-limit']}, Remaining: ${res.headers['ratelimit-remaining']})`);
      passed++;
    } else {
      console.error('❌ Test 8 Failed: Rate limiting headers not found', res.headers);
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 Error:', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🛡️  FIREWALL AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runFirewallTests();
