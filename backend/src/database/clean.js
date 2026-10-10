const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function cleanDatabase() {
  console.log('🧹 Purging all dummy seed users and operational records from database...');
  try {
    // 1. Clean PostgreSQL database if connected
    await db.query(`
      TRUNCATE TABLE 
        notification_logs,
        audit_logs,
        broadcast_warnings,
        marketplace_orders,
        marketplace_listings,
        planting_records,
        farmer_verifications,
        users,
        risk_assessments,
        crop_recommendations,
        chat_messages
      RESTART IDENTITY CASCADE;
    `);

    // Reset sequences
    const seqs = [
      'users_id_seq',
      'planting_records_id_seq',
      'marketplace_listings_id_seq',
      'marketplace_orders_id_seq',
      'broadcast_warnings_id_seq',
      'farmer_verifications_id_seq',
      'notification_logs_id_seq',
      'audit_logs_id_seq',
      'risk_assessments_id_seq',
      'crop_recommendations_id_seq',
      'chat_messages_id_seq'
    ];
    for (const s of seqs) {
      await db.query(`ALTER SEQUENCE IF EXISTS ${s} RESTART WITH 1`).catch(() => {});
    }

    // 2. Clean local fallback JSON store as well
    const jsonPath = path.join(__dirname, '../../data/asvanna_db.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        jsonData.users = [];
        jsonData.planting_records = [];
        jsonData.marketplace_listings = [];
        jsonData.marketplace_orders = [];
        jsonData.broadcast_warnings = [];
        jsonData.farmer_verifications = [];
        jsonData.notification_logs = [];
        jsonData.chat_messages = [];
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log('✅ Fallback local JSON database cleaned');
      } catch (jsonErr) {
        console.warn('⚠️ Note on JSON clean:', jsonErr.message);
      }
    }

    const checkUsers = await db.query('SELECT count(*) FROM users');
    const checkPlantings = await db.query('SELECT count(*) FROM planting_records');
    const checkCrops = await db.query('SELECT count(*) FROM crops');

    console.log('✨ Database clean complete!');
    console.log(`  Users remaining: ${checkUsers.rows[0].count}`);
    console.log(`  Plantings remaining: ${checkPlantings.rows[0].count}`);
    console.log(`  Master Crops preserved: ${checkCrops.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Clean database error:', err);
    process.exit(1);
  }
}

cleanDatabase();
