const cron = require('node-cron');
const runWeatherSyncJob = require('./weatherSyncJob');
const runRiskRecalculationJob = require('./riskRecalculationJob');
const runListingExpiryJob = require('./listingExpiryJob');
const runDailyMarketSyncJob = require('./dailyMarketSyncJob');
const config = require('../config/config');

function initScheduler() {
  console.log('🕒 Initializing ASVANNA Automated Background Job Scheduler...');

  // 1. Daily Market Sync & 36-Month Rolling Window (Every night at 00:05 AM)
  cron.schedule('5 0 * * *', () => {
    runDailyMarketSyncJob();
  });

  // 2. Weather sync every 6 hours (0 */6 * * *)
  cron.schedule('0 */6 * * *', () => {
    runWeatherSyncJob();
  });

  // 3. Risk engine recalculation every 12 hours (0 */12 * * *)
  cron.schedule('0 */12 * * *', () => {
    runRiskRecalculationJob();
  });

  // 4. Marketplace listing & order expiry check every 15 minutes (*/15 * * * *)
  cron.schedule('*/15 * * * *', () => {
    runListingExpiryJob();
  });

  // Initial sync on boot
  runDailyMarketSyncJob();
  runWeatherSyncJob();

  console.log('✅ Background Scheduler initialized (Daily Market: 00:05, Weather: 6h, Risk: 12h, Expiry: 15m)');
}

module.exports = { initScheduler };
