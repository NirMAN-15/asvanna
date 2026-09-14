const db = require('../config/database');
const WeatherService = require('./weatherService');
const PriceService = require('./priceService');

class CropService {
  /**
   * Get all registered crops with optional search and category filtering
   */
  static async getAllCrops(category = null, search = null) {
    let query = 'SELECT * FROM crops';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.toLowerCase().trim()}%`);
      conditions.push(`(LOWER(name_en) LIKE $${params.length} OR LOWER(name_si) LIKE $${params.length} OR LOWER(name_ta) LIKE $${params.length} OR LOWER(crop_code) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';
    const res = await db.query(query, params);
    return res.rows;
  }

  /**
   * Get comprehensive profile for a single crop
   */
  static async getCropProfile(cropId) {
    const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [cropId]);
    if (cropRes.rows.length === 0) throw new Error('Crop not found');
    const crop = cropRes.rows[0];

    // Get seasonal mappings
    const seasonRes = await db.query(
      'SELECT season_name, optimal_start_month, optimal_end_month, suitability, suitability_score, notes FROM crop_seasons WHERE crop_id = $1 ORDER BY optimal_start_month ASC',
      [cropId]
    );

    // Get current weather suitability
    const weatherData = await WeatherService.getForecast();
    const weatherEval = await WeatherService.evaluateCropWeatherSuitability(crop, weatherData);

    // Get price history for past 30 days
    const priceData = await PriceService.getCropPriceHistory(cropId, 30);

    // Get current regional cultivation stats
    const plantingStats = await db.query(
      `SELECT
         COALESCE(SUM(land_size_acres), 0) as total_acres,
         COALESCE(SUM(expected_yield_kg), 0) as total_yield_kg,
         COUNT(*) as plots_count
       FROM planting_records
       WHERE crop_id = $1 AND district = 'Badulla' AND status IN ('PLANTED', 'GROWING')`,
      [cropId]
    );

    return {
      crop,
      seasons: seasonRes.rows,
      weatherSuitability: weatherEval,
      prices: priceData,
      currentCultivation: {
        district: 'Badulla',
        division: 'Bandarawela',
        totalPlantedAcres: parseFloat(plantingStats.rows[0].total_acres) || 0,
        expectedHarvestYieldKg: parseFloat(plantingStats.rows[0].total_yield_kg) || 0,
        activePlotsCount: parseInt(plantingStats.rows[0].plots_count, 10) || 0
      }
    };
  }
}

module.exports = CropService;
