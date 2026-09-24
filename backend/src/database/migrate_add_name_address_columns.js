/**
 * Migration Script: Add first_name, middle_name, last_name, address_line1, address_line2, city, postal_code
 * to PostgreSQL users table and backfill existing records.
 */
const db = require('../config/database');
const { splitFullName, splitAddress } = require('../utils/nameAddressUtils');

async function migrate() {
  console.log('🔄 Running migration: Add discrete name & address columns to users table...');

  try {
    // 1. Add columns to users table
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bandarawela',
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) DEFAULT '90100';
    `);
    console.log('✅ Columns verified/added in PostgreSQL.');

    // 2. Fetch all users to backfill empty split fields
    const usersRes = await db.query('SELECT id, full_name, address, division FROM users');
    if (usersRes && usersRes.rows) {
      for (const u of usersRes.rows) {
        const { first_name, middle_name, last_name } = splitFullName(u.full_name);
        const { address_line1, address_line2, city, postal_code } = splitAddress(u.address, u.division || 'Bandarawela');

        await db.query(
          `UPDATE users SET 
            first_name = COALESCE(first_name, $1),
            middle_name = COALESCE(middle_name, $2),
            last_name = COALESCE(last_name, $3),
            address_line1 = COALESCE(address_line1, $4),
            address_line2 = COALESCE(address_line2, $5),
            city = COALESCE(city, $6),
            postal_code = COALESCE(postal_code, $7)
          WHERE id = $8`,
          [first_name, middle_name, last_name, address_line1, address_line2, city, postal_code, u.id]
        );
      }
      console.log(`✅ Backfilled name & address components for ${usersRes.rows.length} existing users.`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
