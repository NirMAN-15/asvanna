/**
 * Test Suite: Officer Proxy Registration & Farmer Edit Management
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const assert = require('assert');
const OfficerController = require('../src/controllers/officerController');
const AuthController = require('../src/controllers/authController');
const db = require('../src/config/database');

console.log('🧪 Starting Officer Proxy Registration & Farmer Edit Verification...\n');

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

async function run() {
  const testNic = '199298765432';
  const testPhone = '0779988776';
  const testPassword = 'customPass123';

  // Cleanup any leftover test user
  await db.query("DELETE FROM users WHERE nic = $1 OR phone = $2", [testNic, testPhone]);

  // Test 1: Register farmer proxy with custom password
  console.log('Test 1: Officer registers farmer via proxy...');
  const regReq = {
    user: { id: 2, role: 'OFFICER', division: 'Bandarawela' },
    body: {
      first_name: 'Nimal',
      middle_name: 'Siripala',
      last_name: 'Gunasekara',
      nic: testNic,
      phone: testPhone,
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Bindunuwewa',
      address_line1: 'No 45, High Road',
      city: 'Bandarawela',
      postal_code: '90100',
      total_land_size: 3.5,
      password: testPassword
    }
  };
  const regRes = createMockRes();
  await OfficerController.registerFarmerProxy(regReq, regRes, (err) => { throw err; });

  assert.strictEqual(regRes.statusCode, 201, `Expected 201, got ${regRes.statusCode}`);
  assert(regRes.body.success, 'Expected success: true');
  const createdFarmer = regRes.body.data;
  assert.strictEqual(createdFarmer.is_verified, true, 'Officer-created farmer must be verified');
  assert.strictEqual(createdFarmer.credentials.password, testPassword);
  console.log(`  ✅ Farmer created successfully. ID: ${createdFarmer.id}, Verified: ${createdFarmer.is_verified}`);

  // Test 2: Login with the created farmer account via NIC and password
  console.log('\nTest 2: Authenticate with created farmer account via NIC...');
  const loginReq = {
    body: {
      nic: testNic,
      password: testPassword,
      role: 'FARMER'
    }
  };
  const loginRes = createMockRes();
  await AuthController.login(loginReq, loginRes, (err) => { throw err; });

  assert.strictEqual(loginRes.statusCode, 200, `Expected 200, got ${loginRes.statusCode}`);
  assert(loginRes.body.success, 'Expected login success: true');
  assert.strictEqual(loginRes.body.data.user.role, 'FARMER');
  assert.strictEqual(loginRes.body.data.user.nic, testNic);
  console.log('  ✅ Created farmer successfully logged in with NIC & Password');

  // Test 3: Officer updates farmer details
  console.log('\nTest 3: Officer updates farmer details via PUT /farmers/:farmerId...');
  const updateReq = {
    params: { farmerId: createdFarmer.id },
    user: { id: 2, role: 'OFFICER' },
    body: {
      first_name: 'Nimal',
      middle_name: 'Siripala',
      last_name: 'Gunasekara-Perera',
      phone: testPhone,
      nic: testNic,
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Heel Oya',
      address_line1: 'No 78, Temple Road',
      city: 'Bandarawela',
      postal_code: '90100',
      total_land_size: 4.8
    }
  };
  const updateRes = createMockRes();
  await OfficerController.updateFarmerDetails(updateReq, updateRes, (err) => { throw err; });

  assert.strictEqual(updateRes.statusCode, 200, `Expected 200, got ${updateRes.statusCode}`);
  assert(updateRes.body.success, 'Expected update success: true');
  assert.strictEqual(updateRes.body.data.last_name, 'Gunasekara-Perera');
  assert.strictEqual(parseFloat(updateRes.body.data.total_land_size), 4.8);
  assert.strictEqual(updateRes.body.data.gnd_division, 'Heel Oya');
  console.log('  ✅ Officer updated farmer details successfully');

  // Cleanup test user
  await db.query("DELETE FROM users WHERE id = $1", [createdFarmer.id]);
  console.log('  🧹 Cleaned up test user');

  console.log('\n========================================');
  console.log('All Proxy Registration & Edit Tests Passed! (3/3)');
  console.log('========================================\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
