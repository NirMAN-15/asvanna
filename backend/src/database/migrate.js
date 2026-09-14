const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
  console.log('🚀 Running database migrations for ASVANNA...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    await db.query(sql);
    console.log('✅ Database schema migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
