const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function autoSeedIfEmpty() {
  console.log('🔍 Checking database baseline records...');

  // 1. Verify / Auto-Seed 11 Pilot Crops
  const cropCheck = await db.query('SELECT count(*) FROM crops');
  const cropCount = parseInt(cropCheck?.rows?.[0]?.count || '0', 10);
  if (cropCount < 11) {
    console.log(`⚠️ Crops table has ${cropCount} crops (< 11). Auto-seeding 11 pilot crops & price benchmarks...`);
    const seedCrops = require('./seed');
    await seedCrops();
  } else {
    console.log(`✅ 11 Pilot crops verified in database.`);
  }

  // 2. Verify / Auto-Seed Super Admin & Master User
  const adminCheck = await db.query("SELECT count(*) FROM users WHERE role = 'ADMIN'");
  const adminCount = parseInt(adminCheck?.rows?.[0]?.count || '0', 10);
  if (adminCount < 2) {
    console.log(`⚠️ Admin accounts missing (${adminCount} found). Auto-seeding Super Admin & Master User...`);
    const seedAdmin = require('./seed_admin');
    await seedAdmin();
  } else {
    console.log(`✅ Administrator accounts verified in database.`);
  }

  // 3. Verify / Auto-Seed 50 Test Farmers & Cultivation Records
  const farmerCheck = await db.query("SELECT count(*) FROM users WHERE role = 'FARMER'");
  const farmerCount = parseInt(farmerCheck?.rows?.[0]?.count || '0', 10);
  if (farmerCount < 50) {
    console.log(`⚠️ Farmer users missing (${farmerCount} found). Auto-seeding 50 test farmers and Bandarawela cultivation records...`);
    const seedBandarawela = require('./seed_bandarawela_cultivation');
    await seedBandarawela();
  } else {
    console.log(`✅ 50 Test Farmers verified in database.`);
  }

  // 4. Ensure local fileDb and TEST_FARMERS_CREDENTIALS.md are in sync
  try {
    const seedTestFarmers = require('./seed_test_farmers');
    await seedTestFarmers();
  } catch (syncErr) {
    // Non-critical credentials file generation notice
  }
}

async function runMigration() {
  console.log('🚀 Running database migrations for ASVANNA...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(sql);
    console.log('✅ Database schema migrated successfully!');

    // Automatically ensure baseline data is present
    await autoSeedIfEmpty();

    console.log('🏁 Migration & automated baseline verification complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
