const assert = require('assert');
const { splitFullName, formatFullName, splitAddress, formatAddress } = require('../src/utils/nameAddressUtils');
const db = require('../src/config/database');

async function runTests() {
  console.log('🧪 Testing Name and Address Decomposition & Database Integration...\n');

  // TEST 1: Unit tests for splitFullName
  console.log('1. Testing splitFullName utility:');
  const n1 = splitFullName('nirman achintha wedikkara');
  assert.strictEqual(n1.first_name, 'nirman');
  assert.strictEqual(n1.middle_name, 'achintha');
  assert.strictEqual(n1.last_name, 'wedikkara');
  console.log('  ✅ "nirman achintha wedikkara" ->', n1);

  const n2 = splitFullName('Kapila Bandara');
  assert.strictEqual(n2.first_name, 'Kapila');
  assert.strictEqual(n2.middle_name, null);
  assert.strictEqual(n2.last_name, 'Bandara');
  console.log('  ✅ "Kapila Bandara" ->', n2);

  const n3 = splitFullName('W. M. Bandara (DO Officer)');
  assert.strictEqual(n3.first_name, 'W.');
  assert.strictEqual(n3.middle_name, 'M.');
  assert.strictEqual(n3.last_name, 'Bandara');
  console.log('  ✅ "W. M. Bandara (DO Officer)" ->', n3);

  const n4 = splitFullName('Wedikkarage Nirman Achintha Wedikkara');
  assert.strictEqual(n4.first_name, 'Wedikkarage');
  assert.strictEqual(n4.middle_name, 'Nirman Achintha');
  assert.strictEqual(n4.last_name, 'Wedikkara');
  console.log('  ✅ "Wedikkarage Nirman Achintha Wedikkara" ->', n4);

  // TEST 2: Unit tests for splitAddress
  console.log('\n2. Testing splitAddress utility:');
  const a1 = splitAddress('No 45, Temple Road, Bindunuwewa, Bandarawela, 90100');
  assert.strictEqual(a1.address_line1, 'No 45');
  assert.strictEqual(a1.address_line2, 'Temple Road, Bindunuwewa');
  assert.strictEqual(a1.city, 'Bandarawela');
  assert.strictEqual(a1.postal_code, '90100');
  console.log('  ✅ "No 45, Temple Road, Bindunuwewa, Bandarawela, 90100" ->', a1);

  const a2 = splitAddress('Main Street, Welimada');
  assert.strictEqual(a2.address_line1, 'Main Street');
  assert.strictEqual(a2.address_line2, null);
  assert.strictEqual(a2.city, 'Welimada');
  console.log('  ✅ "Main Street, Welimada" ->', a2);

  // TEST 3: Database Insertion with discrete fields
  console.log('\n3. Testing Database Insertion with discrete name & address fields:');
  const testPhone = '0778899001';
  // Delete if exists first
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone]);

  const insertRes = await db.query(
    `INSERT INTO users (
      first_name, middle_name, last_name, full_name,
      phone, nic, password_hash, role,
      district, division, gnd_division,
      address_line1, address_line2, city, postal_code, address,
      verification_status, is_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *`,
    [
      'Nirman', 'Achintha', 'Wedikkara', 'Nirman Achintha Wedikkara',
      testPhone, '200012345678', 'dummy_hash', 'FARMER',
      'Badulla', 'Bandarawela', 'Central',
      'No. 55', 'Hill Crest Avenue', 'Bandarawela', '90100', 'No. 55, Hill Crest Avenue, Bandarawela, 90100',
      'APPROVED', true
    ]
  );

  const created = insertRes.rows[0];
  assert.strictEqual(created.first_name, 'Nirman');
  assert.strictEqual(created.middle_name, 'Achintha');
  assert.strictEqual(created.last_name, 'Wedikkara');
  assert.strictEqual(created.address_line1, 'No. 55');
  assert.strictEqual(created.address_line2, 'Hill Crest Avenue');
  assert.strictEqual(created.city, 'Bandarawela');
  assert.strictEqual(created.postal_code, '90100');
  console.log('  ✅ Inserted user verified with all separate columns:', {
    id: created.id,
    first_name: created.first_name,
    middle_name: created.middle_name,
    last_name: created.last_name,
    full_name: created.full_name,
    address_line1: created.address_line1,
    address_line2: created.address_line2,
    city: created.city,
    postal_code: created.postal_code
  });

  // Clean up test user
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone]);

  console.log('\n🎉 ALL TESTS PASSED! Discrete name and address fields are fully operational.');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
