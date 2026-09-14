const db = require('../config/database');

async function runListingExpiryJob() {
  console.log('⏰ [JOB] Running marketplace listing & order expiry check...');
  try {
    // 1. Expire outdated listings
    const expiredListings = await db.query(
      `UPDATE marketplace_listings
       SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'AVAILABLE' AND available_to < CURRENT_DATE
       RETURNING id`
    );

    // 2. Expire pending orders that passed 30-minute deadline
    const expiredOrders = await db.query(
      `UPDATE marketplace_orders
       SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'PENDING' AND response_deadline < CURRENT_TIMESTAMP
       RETURNING id`
    );

    console.log(`✅ [JOB] Expired ${expiredListings.rows.length} listings and ${expiredOrders.rows.length} overdue orders.`);
  } catch (err) {
    console.error('❌ [JOB] Marketplace expiry job failed:', err.message);
  }
}

module.exports = runListingExpiryJob;
