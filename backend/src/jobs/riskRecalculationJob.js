const RiskEngineService = require('../services/riskEngineService');

async function runRiskRecalculationJob() {
  console.log('⏰ [JOB] Running scheduled regional risk recalculation for Badulla / Bandarawela...');
  try {
    const summary = await RiskEngineService.getRegionalRiskSummary('Badulla');
    console.log(`✅ [JOB] Risk recalculation complete across ${summary.length} crops.`);
  } catch (err) {
    console.error('❌ [JOB] Risk recalculation failed:', err.message);
  }
}

module.exports = runRiskRecalculationJob;
