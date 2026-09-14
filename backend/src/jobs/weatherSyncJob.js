const WeatherService = require('../services/weatherService');

async function runWeatherSyncJob() {
  console.log('⏰ [JOB] Running scheduled weather sync for Bandarawela (Open-Meteo)...');
  try {
    const result = await WeatherService.getForecast();
    console.log(`✅ [JOB] Weather sync complete: ${result.forecast ? result.forecast.length : 0} days cached.`);
  } catch (err) {
    console.error('❌ [JOB] Weather sync failed:', err.message);
  }
}

module.exports = runWeatherSyncJob;
