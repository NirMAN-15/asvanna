const assert = require('assert');
const db = require('../src/config/database');

async function testNameSynthesis() {
  console.log('🧪 Testing Database name synthesis...');
  const testPhone = '0779998833';

  // Cleanup
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone]);

  // Case 1: Insert user with first_name, middle_name, and last_name (no full_name in params)
  const res = await db.query(
    'INSERT INTO users (first_name, middle_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    ['Sunil', 'Kithsiri', 'Dissanayake', testPhone, 'FARMER']
  );

  const u = res.rows[0];
  console.log('Resulting DB User:');
  console.log('  first_name:', u.first_name);
  console.log('  middle_name:', u.middle_name);
  console.log('  last_name:', u.last_name);
  console.log('  full_name (synthesized in DB):', u.full_name);

  assert.strictEqual(u.first_name, 'Sunil');
  assert.strictEqual(u.middle_name, 'Kithsiri');
  assert.strictEqual(u.last_name, 'Dissanayake');
  assert.strictEqual(u.full_name, 'Sunil Kithsiri Dissanayake');

  // Case 2: Insert user with only first_name and last_name (no middle name)
  const testPhone2 = '0779998844';
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone2]);

  const res2 = await db.query(
    'INSERT INTO users (first_name, middle_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    ['Kamal', null, 'Perera', testPhone2, 'OFFICER']
  );

  const u2 = res2.rows[0];
  console.log('\nResulting DB Officer:');
  console.log('  first_name:', u2.first_name);
  console.log('  middle_name:', u2.middle_name);
  console.log('  last_name:', u2.last_name);
  console.log('  full_name (synthesized in DB):', u2.full_name);

  assert.strictEqual(u2.first_name, 'Kamal');
  assert.strictEqual(u2.middle_name, null);
  assert.strictEqual(u2.last_name, 'Perera');
  assert.strictEqual(u2.full_name, 'Kamal Perera');

  // Case 3: Insert Buyer with first_name, middle_name, last_name, business_name
  const testPhone3 = '0779998855';
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone3]);

  const res3 = await db.query(
    'INSERT INTO users (first_name, middle_name, last_name, phone, role, business_name, business_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    ['Samantha', 'Pradeep', 'Gunaratne', testPhone3, 'BUYER', 'Green Leaf Hotel & Catering', 'Hotel']
  );

  const u3 = res3.rows[0];
  console.log('\nResulting DB Buyer:');
  console.log('  first_name:', u3.first_name);
  console.log('  middle_name:', u3.middle_name);
  console.log('  last_name:', u3.last_name);
  console.log('  full_name (synthesized in DB):', u3.full_name);
  console.log('  business_name:', u3.business_name);

  assert.strictEqual(u3.first_name, 'Samantha');
  assert.strictEqual(u3.middle_name, 'Pradeep');
  assert.strictEqual(u3.last_name, 'Gunaratne');
  assert.strictEqual(u3.full_name, 'Samantha Pradeep Gunaratne');
  assert.strictEqual(u3.business_name, 'Green Leaf Hotel & Catering');

  // Case 4: Insert with address_line1, address_line2, city, postal_code (no address in params)
  const testPhone4 = '0779998866';
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone4]);

  const res4 = await db.query(
    'INSERT INTO users (first_name, last_name, phone, role, address_line1, address_line2, city, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    ['Chaminda', 'Silva', testPhone4, 'FARMER', 'Hilltop Farm', 'Haputale Road', 'Bandarawela', '90100']
  );

  const u4 = res4.rows[0];
  console.log('\nResulting DB User with Address:');
  console.log('  address_line1:', u4.address_line1);
  console.log('  address_line2:', u4.address_line2);
  console.log('  city:', u4.city);
  console.log('  postal_code:', u4.postal_code);
  console.log('  address (synthesized in DB):', u4.address);

  assert.strictEqual(u4.address_line1, 'Hilltop Farm');
  assert.strictEqual(u4.address_line2, 'Haputale Road');
  assert.strictEqual(u4.city, 'Bandarawela');
  assert.strictEqual(u4.postal_code, '90100');
  assert.strictEqual(u4.address, 'Hilltop Farm, Haputale Road, Bandarawela, 90100');

  // Cleanup
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone]);
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone2]);
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone3]);
  await db.query('DELETE FROM users WHERE phone = $1', [testPhone4]);

  console.log('\n🎉 ALL DATABASE NAME & ADDRESS SYNTHESIS TESTS PASSED!');
  process.exit(0);
}

testNameSynthesis().catch(err => {
  console.error(err);
  process.exit(1);
});
