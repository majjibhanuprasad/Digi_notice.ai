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

async function runE2ETests() {
  console.log('🚀 Running Full E2E Workflow Verification through Firewall...\n');
  let passed = 0;

  // 1. Kiosk Display (Public Route allowed)
  const kioskRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notices/kiosk',
    method: 'GET',
    headers: { 'Origin': 'http://localhost:5173' }
  });
  if (kioskRes.statusCode === 200 && Array.isArray(kioskRes.body)) {
    console.log(`✅ [1/5] Kiosk Display API: ${kioskRes.body.length} notices returned to public display`);
    passed++;
  } else {
    console.error('❌ [1/5] Kiosk Display API Failed', kioskRes.statusCode);
  }

  // 2. Student Flow (Login -> Get Notices -> Ask AI)
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' }
  }, { email: 'student1@college.edu', password: 'password123' });

  const studentToken = studentLogin.body?.token;
  if (studentLogin.statusCode === 200 && studentToken) {
    console.log('✅ [2/5] Student Authentication succeeded');
    passed++;

    // Student Ask AI Assistant
    const firstNoticeId = kioskRes.body[0]?._id;
    const aiAskRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/ask',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`,
        'Origin': 'http://localhost:5173'
      }
    }, { noticeId: firstNoticeId, question: 'What are the key deadlines mentioned in this announcement?' });

    if (aiAskRes.statusCode === 200 && aiAskRes.body?.answer) {
      console.log('✅ [3/5] Student AI Assistant query successfully answered through firewall');
      passed++;
    } else {
      console.error('❌ [3/5] Student AI Assistant query failed', aiAskRes.statusCode, aiAskRes.body);
    }
  }

  // 3. Super Admin Flow (Login -> Analytics -> AI Generate Notice)
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' }
  }, { email: 'superadmin@college.edu', password: 'admin123' });

  const adminToken = adminLogin.body?.token;
  if (adminLogin.statusCode === 200 && adminToken) {
    console.log('✅ [4/5] Super Admin Authentication succeeded');
    passed++;

    // Admin AI Generate Notice
    const aiGenRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/generate-notice',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'Origin': 'http://localhost:5173'
      }
    }, { topic: 'Annual Tech Symposium 2026', audience: 'All Engineering Students' });

    if (aiGenRes.statusCode === 200 && aiGenRes.body?.title) {
      console.log(`✅ [5/5] Admin AI Notice Generation succeeded through firewall: "${aiGenRes.body.title}"`);
      passed++;
    } else {
      console.error('❌ [5/5] Admin AI Notice Generation failed', aiGenRes.statusCode, aiGenRes.body);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎯 E2E FLOW RESULT: ${passed}/5 PASSED`);
  console.log(`========================================\n`);
  process.exit(passed === 5 ? 0 : 1);
}

runE2ETests();
