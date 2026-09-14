const db = require('../config/database');
const config = require('../config/config');
const WeatherService = require('./weatherService');
const CropixService = require('./cropixService');
const PriceService = require('./priceService');

class RiskEngineService {
  /**
   * Evaluate comprehensive multi-factor planting risk for a specific crop and district
   * Factors:
   * 1. Over-Planting Risk (45%)
   * 2. Weather Risk (25%)
   * 3. Seasonal Risk (15%)
   * 4. Historical Price Risk (15%)
   */
  static async evaluateCropRisk(cropId, district = 'Badulla') {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Get Crop Details
    const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [cropId]);
    if (cropRes.rows.length === 0) throw new Error('Crop not found');
    const crop = cropRes.rows[0];

    // 2. FACTOR 1: Over-Planting Risk (45% weight)
    const plantingAgg = await db.query(
      `SELECT
         COALESCE(SUM(land_size_acres), 0) as total_acres,
         COALESCE(SUM(expected_yield_kg), 0) as total_yield,
         COUNT(*) as plot_count
       FROM planting_records
       WHERE crop_id = $1 AND district = $2 AND status IN ('PLANTED', 'GROWING')`,
      [cropId, district]
    );

    const plantingRow = (plantingAgg && plantingAgg.rows && plantingAgg.rows[0]) ? plantingAgg.rows[0] : {};
    const totalPlantedAcres = parseFloat(plantingRow.total_acres) || 0;
    const rawEstimatedSupplyKg = parseFloat(plantingRow.total_yield) || (totalPlantedAcres * crop.avg_yield_per_acre_kg);
    const activePlotsCount = parseInt(plantingRow.plot_count, 10) || 0;

    // Retrieve Demand Benchmark via CropixService
    const demandBenchmark = await CropixService.getDemandBenchmark(cropId, district, currentMonth, currentYear);
    const targetDemandKg = parseFloat(demandBenchmark.regional_quota_kg) || (crop.avg_yield_per_acre_kg * 12);

    // Calculate overplanting ratio
    const supplyDemandRatio = targetDemandKg > 0 ? (rawEstimatedSupplyKg / targetDemandKg) * 100 : 0;
    let overPlantingScore = 0;
    if (supplyDemandRatio < 50) {
      overPlantingScore = Math.round(supplyDemandRatio * 0.4);
    } else if (supplyDemandRatio <= 75) {
      overPlantingScore = Math.round(20 + ((supplyDemandRatio - 50) * 1.2));
    } else if (supplyDemandRatio <= 100) {
      overPlantingScore = Math.round(50 + ((supplyDemandRatio - 75) * 1.6));
    } else {
      overPlantingScore = 100;
    }

    // 3. FACTOR 2: Weather Risk (25% weight) - Bandarawela calibrated
    const weatherForecast = await WeatherService.getForecast();
    const weatherEvaluation = await WeatherService.evaluateCropWeatherSuitability(crop, weatherForecast);
    const weatherRiskScore = weatherEvaluation.weatherRiskScore;

    // 4. FACTOR 3: Seasonal Suitability Risk (15% weight)
    const seasonRes = await db.query(
      `SELECT * FROM crop_seasons
       WHERE crop_id = $1
       ORDER BY suitability_score DESC`,
      [cropId]
    );

    let seasonalRiskScore = 30; // Default moderate
    let currentSeasonName = (currentMonth >= 10 || currentMonth <= 3) ? 'MAHA' : ((currentMonth >= 5 && currentMonth <= 8) ? 'YALA' : 'INTER_MONSOON');

    if (seasonRes.rows.length > 0) {
      const matchingSeason = seasonRes.rows.find(s => s.season_name === currentSeasonName);
      if (matchingSeason) {
        if (matchingSeason.suitability === 'BEST') seasonalRiskScore = 10;
        else if (matchingSeason.suitability === 'GOOD') seasonalRiskScore = 25;
        else if (matchingSeason.suitability === 'MODERATE') seasonalRiskScore = 50;
        else seasonalRiskScore = 80;
      }
    }

    // 5. FACTOR 4: Historical Price Risk (15% weight)
    const priceAnalysis = await PriceService.getCropPriceHistory(cropId, 60);
    let priceRiskScore = 20; // Default
    if (priceAnalysis.metrics && priceAnalysis.metrics.volatilityPercentage) {
      const vol = priceAnalysis.metrics.volatilityPercentage;
      if (vol > 35) priceRiskScore = 80;
      else if (vol > 20) priceRiskScore = 50;
      else if (vol > 10) priceRiskScore = 30;
      else priceRiskScore = 15;
    }

    // 6. COMPOSITE WEIGHTED RISK SCORE
    const compositeRiskScore = Math.round(
      (overPlantingScore * 0.45) +
      (weatherRiskScore * 0.25) +
      (seasonalRiskScore * 0.15) +
      (priceRiskScore * 0.15)
    );

    // Determine Risk Level (Safe: 0-40, Warning: 41-65, Over-planted: 66-100)
    let riskLevel = 'SAFE';
    if (compositeRiskScore >= config.riskThresholds.warning) {
      riskLevel = 'OVER_PLANTED';
    } else if (compositeRiskScore >= config.riskThresholds.safe) {
      riskLevel = 'WARNING';
    }

    // 7. Store / Update in risk_assessments table
    await db.query(
      `INSERT INTO risk_assessments (
        crop_id, district, total_planted_acres, estimated_supply_kg, target_demand_kg,
        risk_percentage, risk_level, over_planting_score, weather_risk_score,
        seasonal_risk_score, price_risk_score, composite_risk_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        cropId, district, totalPlantedAcres, rawEstimatedSupplyKg, targetDemandKg,
        compositeRiskScore, riskLevel, overPlantingScore, weatherRiskScore,
        seasonalRiskScore, priceRiskScore, compositeRiskScore
      ]
    );

    return {
      crop: {
        id: crop.id,
        code: crop.crop_code,
        nameEn: crop.name_en,
        nameSi: crop.name_si,
        nameTa: crop.name_ta,
        category: crop.category,
        standardPricePerKg: crop.standard_price_per_kg
      },
      district,
      division: 'Bandarawela',
      activePlotsCount,
      totalPlantedAcres,
      estimatedSupplyKg: rawEstimatedSupplyKg,
      targetDemandKg,
      riskPercentage: compositeRiskScore,
      riskLevel,
      factors: {
        overPlanting: {
          score: overPlantingScore,
          weight: '45%',
          ratio: Math.round(supplyDemandRatio),
          demandQuotaKg: targetDemandKg,
          currentPlantedKg: rawEstimatedSupplyKg
        },
        weather: {
          score: weatherRiskScore,
          weight: '25%',
          temperatureScore: weatherEvaluation.temperatureScore,
          rainfallScore: weatherEvaluation.rainfallScore,
          advisory: weatherEvaluation.advisory
        },
        seasonal: {
          score: seasonalRiskScore,
          weight: '15%',
          currentSeason: currentSeasonName,
          status: seasonalRiskScore <= 25 ? 'IN_SEASON' : 'OFF_SEASON'
        },
        price: {
          score: priceRiskScore,
          weight: '15%',
          volatilityPercentage: priceAnalysis.metrics.volatilityPercentage,
          currentPrice: priceAnalysis.metrics.currentPrice
        }
      },
      thresholds: {
        safe: config.riskThresholds.safe,
        warning: config.riskThresholds.warning
      },
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Get regional risk summary across all crops in Badulla / Bandarawela
   */
  static async getRegionalRiskSummary(district = 'Badulla') {
    const cropsRes = await db.query('SELECT * FROM crops ORDER BY id ASC');
    const summary = [];

    for (const crop of cropsRes.rows) {
      try {
        const risk = await this.evaluateCropRisk(crop.id, district);
        summary.push(risk);
      } catch (err) {
        console.warn(`Could not evaluate risk for crop ${crop.crop_code}:`, err.message);
      }
    }

    return summary;
  }

  /**
   * Smart Search for farmers: search crop by name before sowing
   */
  static async smartSearch(queryText, district = 'Badulla') {
    const trimmed = queryText.trim().toLowerCase();
    const cropsRes = await db.query(
      `SELECT * FROM crops
       WHERE LOWER(crop_code) LIKE $1
          OR LOWER(name_en) LIKE $1
          OR LOWER(name_si) LIKE $1
          OR LOWER(name_ta) LIKE $1
       LIMIT 5`,
      [`%${trimmed}%`]
    );

    if (cropsRes.rows.length === 0) return { matches: [] };

    const results = [];
    for (const crop of cropsRes.rows) {
      const risk = await this.evaluateCropRisk(crop.id, district);
      results.push(risk);
    }

    return { matches: results };
  }
}

module.exports = RiskEngineService;
