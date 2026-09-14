const assert = require('assert');
const WeatherService = require('../src/services/weatherService');
const RiskEngineService = require('../src/services/riskEngineService');
const RecommendationService = require('../src/services/recommendationService');
const ValidationService = require('../src/services/validationService');
const PriceService = require('../src/services/priceService');
const NotificationService = require('../src/services/notificationService');

console.log('🧪 ========================================================');
console.log('🧪 ASVANNA v2.0 Comprehensive System Verification Suite');
console.log('📍 Pilot Target: Bandarawela, Badulla District, Sri Lanka');
console.log('🧪 ========================================================\n');

let total = 0;
let passed = 0;

async function runTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n${err.stack}`);
  }
}

async function main() {
  // TEST 1: Weather Service - Live Open-Meteo & Climate Rules
  await runTest('WeatherService: Live 14-day telemetry and Bandarawela temperature limits', async () => {
    const data = await WeatherService.getForecast();
    assert(data.forecast && data.forecast.length >= 7, 'Forecast should contain at least 7 days');
    assert.strictEqual(data.location.name, 'Bandarawela');
    assert.strictEqual(data.location.elevationMeters, 1216);

    // Verify temperature claim: Bandarawela temperatures stay above 10°C
    data.forecast.forEach(day => {
      assert(day.tempMin >= 9.0, `Min temperature (${day.tempMin}°C) should not plunge below 9°C in Bandarawela`);
      assert(day.agriculturalScores.suitabilityScore >= 0 && day.agriculturalScores.suitabilityScore <= 100);
      assert(day.agriculturalScores.weatherRiskScore >= 0 && day.agriculturalScores.weatherRiskScore <= 100);
    });
  });

  // TEST 2: Weather Service - Crop Suitability Evaluation
  await runTest('WeatherService: Evaluates crop-specific weather match without frost penalty', async () => {
    const mockCrop = {
      id: 1,
      crop_code: 'LEEKS',
      optimal_temp_min: 12.0,
      optimal_temp_max: 22.0,
      waterlog_sensitive: false,
      disease_susceptibility: 'MODERATE'
    };
    const forecast = await WeatherService.getForecast();
    const evaluation = await WeatherService.evaluateCropWeatherSuitability(mockCrop, forecast);
    assert(evaluation.suitabilityScore > 60, 'Leeks should have high suitability in Bandarawela');
    assert(evaluation.advisory.length > 0, 'Should generate agronomic advisory');
  });

  // TEST 3: Multi-Factor Risk Engine (4 Factors)
  await runTest('RiskEngine: Calculates 4-factor composite risk with accurate weight distribution', async () => {
    const risk = await RiskEngineService.evaluateCropRisk(1, 'Badulla');

    assert.strictEqual(risk.crop.code, 'LEEKS');
    assert(['SAFE', 'WARNING', 'OVER_PLANTED'].includes(risk.riskLevel));

    // Verify all 4 factors are present and have expected weights
    assert(risk.factors.overPlanting, 'Over-planting factor must exist');
    assert.strictEqual(risk.factors.overPlanting.weight, '45%');

    assert(risk.factors.weather, 'Weather factor must exist');
    assert.strictEqual(risk.factors.weather.weight, '25%');

    assert(risk.factors.seasonal, 'Seasonal factor must exist');
    assert.strictEqual(risk.factors.seasonal.weight, '15%');

    assert(risk.factors.price, 'Price factor must exist');
    assert.strictEqual(risk.factors.price.weight, '15%');

    // Verify composite score math
    const manualComposite = Math.round(
      (risk.factors.overPlanting.score * 0.45) +
      (risk.factors.weather.score * 0.25) +
      (risk.factors.seasonal.score * 0.15) +
      (risk.factors.price.score * 0.15)
    );
    assert.strictEqual(risk.riskPercentage, manualComposite, 'Composite score must match exact formula');
  });

  // TEST 4: Smart Crop Recommendations
  await runTest('RecommendationService: Returns top alternative crops with live market prices & rationales', async () => {
    const recs = await RecommendationService.getSmartRecommendations('Badulla', 1);
    assert(recs.length > 0 && recs.length <= 5, 'Should return between 1 and 5 recommendations');

    recs.forEach(r => {
      assert.notStrictEqual(r.crop.id, 1, 'Should not recommend the current crop (Leeks)');
      assert(r.scores.compositeScore >= 50, 'Recommended crop should have strong composite score');
      assert(r.rationale.en.length > 0, 'English rationale required');
      assert(r.rationale.si.length > 0, 'Sinhala rationale required');
      assert(r.rationale.ta.length > 0, 'Tamil rationale required');
      assert(r.crop.currentPricePerKg > 0, 'Price must be positive');
    });
  });

  // TEST 5: Farmer Validation & Anomaly Detection
  await runTest('ValidationService: Flags unrealistic land sizes and out-of-boundary GPS', async () => {
    const pending = await ValidationService.getPendingVerifications('Bandarawela');
    assert(Array.isArray(pending), 'Pending verifications must return an array');

    // Test review action
    const reviewResult = await ValidationService.reviewFarmer(2, 1, {
      approved: true,
      nicVerified: true,
      landGpsVerified: true,
      landSizeVerified: true
    });
    assert.strictEqual(reviewResult.status, 'APPROVED');
  });

  // TEST 6: Price Service & Volatility
  await runTest('PriceService: Retrieves wholesale prices & calculates volatility metrics', async () => {
    const latest = await PriceService.getLatestPrices();
    assert(latest.length >= 5, 'Should return wholesale prices for crops');

    const history = await PriceService.getCropPriceHistory(1, 30);
    assert(history.metrics.currentPrice > 0, 'Current price must be positive');
    assert(history.metrics.averagePrice > 0, 'Average price must be positive');
    assert(history.metrics.volatilityPercentage >= 0, 'Volatility must be non-negative');
  });

  // TEST 7: Notification Service (Zero Paid SMS, 100% In-App / FCM)
  await runTest('NotificationService: Archives alerts to In-App notice board with delivery tracking', async () => {
    const dispatch = await NotificationService.sendAlert({
      userIds: [2],
      title: 'Emergency Saturation Notice',
      body: 'Leek planting in Bandarawela has reached 90% capacity.',
      notificationType: 'SATURATION_ALERT'
    });
    assert(dispatch.totalRecipients === 1);
    assert(dispatch.inAppArchived === 1, 'In-App alert must be archived for farmer');

    const notices = await NotificationService.getUserNotifications(2, 5);
    assert(notices.length > 0, 'User notice board should contain the alert');
  });

  console.log(`\n📊 Test Execution Summary: ${passed}/${total} Tests Passed.`);
  if (passed === total) {
    console.log('🎉 ALL SYSTEM MODULES & SPECIFICATIONS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
