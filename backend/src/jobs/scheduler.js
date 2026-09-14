const cron = require('node-cron');
const runWeatherSyncJob = require('./weatherSyncJob');
const runRiskRecalculationJob = require('./riskRecalculationJob');
const runListingExpiryJob = require('./listingExpiryJob');
const config = require('../config/config');

function initScheduler() {
  console.log('🕒 Initializing ASVANNA Automated Background Job Scheduler...');

  // 1. Weather sync every 6 hours (0 */6 * * *)
  cron.schedule('0 */6 * * *', () => {
    runWeatherSyncJob();
  });

  // 2. Risk engine recalculation every 12 hours (0 */12 * * *)
  cron.schedule('0 */12 * * *', () => {
    runRiskRecalculationJob();
  });

  // 3. Marketplace listing & order expiry check every 15 minutes (*/15 * * * *)
  cron.schedule('*/15 * * * *', () => {
    runListingExpiryJob();
  });

  // Optional: run an initial weather sync on boot
  runWeatherSyncJob();

  console.log('✅ Background Scheduler initialized (Weather: 6h, Risk: 12h, Expiry: 15m)');
}

module.exports = { initScheduler };
