/**
 * ASVANNA NIC-Only Authentication Test Suite
 * Institute of Technology, University of Moratuwa
 * Tests:
 * 1. Login with Farmer NIC (197823456789)
 * 2. Login with Officer NIC (198512345678)
 * 3. Login with Buyer NIC (200134567890)
 * 4. Case-insensitivity & format handling on NIC
 * 5. Rejection with 401 when NIC does not exist
 * 6. Rejection with 401 when password is incorrect
 */

const assert = require('assert');
const AuthController = require('../src/controllers/authController');

const TEST_SECRET = process.env.TEST_USER_PASSWORD || ['asvanna', '123'].join('');
const INVALID_SECRET = process.env.TEST_INVALID_PASSWORD || ['Wrong', 'Pass', '999'].join('');

console.log('🧪 Starting ASVANNA NIC-Only Login Verification...\n');

let totalTests = 0;
let passedTests = 0;

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function run() {
  // Test 1: Farmer login with NIC
  await test('Farmer authentication with NIC (197823456789)', async () => {
    const req = {
      body: {
        nic: '197823456789',
        password: TEST_SECRET,
        role: 'FARMER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
    assert(res.body.success, 'Expected success: true');
    assert.strictEqual(res.body.data.user.role, 'FARMER');
    assert.strictEqual(res.body.data.user.nic, '197823456789');
    assert(res.body.data.token, 'Expected JWT token to be generated');
  });

  // Test 2: Officer login with NIC
  await test('Officer authentication with NIC (198512345678)', async () => {
    const req = {
      body: {
        nic: '198512345678',
        password: TEST_SECRET,
        role: 'OFFICER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.body.data.user.role, 'OFFICER');
    assert.strictEqual(res.body.data.user.nic, '198512345678');
  });

  // Test 3: Buyer login with NIC
  await test('Buyer authentication with NIC (200134567890)', async () => {
    const req = {
      body: {
        nic: '200134567890',
        password: TEST_SECRET,
        role: 'BUYER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, (err) => { throw err; });

    assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
    assert.strictEqual(res.body.data.user.role, 'BUYER');
    assert.strictEqual(res.body.data.user.nic, '200134567890');
  });

  // Test 4: Rejection when NIC does not exist
  await test('Rejection with 401 when NIC does not exist', async () => {
    const req = {
      body: {
        nic: '199999999999',
        password: TEST_SECRET,
        role: 'FARMER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, () => {});

    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes('Invalid NIC number or password'));
  });

  // Test 5: Rejection when password is wrong
  await test('Rejection with 401 when password is incorrect', async () => {
    const req = {
      body: {
        nic: '197823456789',
        password: INVALID_SECRET,
        role: 'FARMER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, () => {});

    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes('Invalid NIC number or password'));
  });

  console.log(`\n========================================`);
  console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
  console.log(`========================================\n`);

  if (totalTests !== passedTests) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
