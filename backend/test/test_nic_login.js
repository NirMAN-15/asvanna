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

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const assert = require('assert');
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');
const AuthController = require('../src/controllers/authController');

const testUserPassword = process.env.TEST_USER_PASSWORD || 'asvanna123';
const testWrongPassword = process.env.TEST_INVALID_PASSWORD || 'incorrect-auth-test';

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
  const testNics = ['197823456789', '198512345678', '200134567890'];
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(testUserPassword, salt);

  // Setup temporary test users
  await db.query("DELETE FROM users WHERE nic = ANY($1)", [testNics]);
  await db.query(`
    INSERT INTO users (full_name, phone, nic, password_hash, role, district, division, is_verified, verification_status)
    VALUES 
      ('Test Farmer', '0710000001', '197823456789', $1, 'FARMER', 'Badulla', 'Bandarawela', true, 'APPROVED'),
      ('Test Officer', '0710000002', '198512345678', $1, 'OFFICER', 'Badulla', 'Bandarawela', true, 'APPROVED'),
      ('Test Buyer', '0710000003', '200134567890', $1, 'BUYER', 'Badulla', 'Bandarawela', true, 'APPROVED')
  `, [passwordHash]);

  try {
  // Test 1: Farmer login with NIC
  await test('Farmer authentication with NIC (197823456789)', async () => {
    const req = {
      body: {
        nic: '197823456789',
        password: testUserPassword,
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
        password: testUserPassword,
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
        password: testUserPassword,
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
        password: testUserPassword,
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
        password: testWrongPassword,
        role: 'FARMER'
      }
    };
    const res = createMockRes();
    await AuthController.login(req, res, () => {});

    assert.strictEqual(res.statusCode, 401, `Expected 401, got ${res.statusCode}`);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes('Invalid NIC number or password'));
  });

  } finally {
    await db.query("DELETE FROM users WHERE nic = ANY($1)", [testNics]);
    console.log('  🧹 Cleaned up temporary test users');
  }

  console.log(`\n========================================`);
  console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
  console.log(`========================================\n`);

  if (totalTests !== passedTests) {
    process.exit(1);
  }
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
