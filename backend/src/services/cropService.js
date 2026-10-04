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

  /**
   * Create a new crop / vegetable (Officer/Admin)
   */
  static async createCrop(data) {
    const {
      crop_code,
      name_en,
      name_si,
      name_ta,
      category = 'Upcountry Vegetable',
      growth_duration_days = 90,
      avg_yield_per_acre_kg = 5000,
      standard_price_per_kg = 150.00,
      standard_demand_kg = 100000.00,
      image_url,
      description_en,
      description_si,
      description_ta
    } = data;

    const query = `
      INSERT INTO crops (
        crop_code, name_en, name_si, name_ta, category,
        growth_duration_days, avg_yield_per_acre_kg, standard_price_per_kg,
        standard_demand_kg, image_url, description_en, description_si, description_ta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      crop_code || `CROP_${Date.now()}`,
      name_en,
      name_si || name_en,
      name_ta || name_en,
      category,
      parseInt(growth_duration_days, 10) || 90,
      parseFloat(avg_yield_per_acre_kg) || 5000,
      parseFloat(standard_price_per_kg) || 150.00,
      parseFloat(standard_demand_kg) || 100000.00,
      image_url || null,
      description_en || null,
      description_si || null,
      description_ta || null
    ];

    const res = await db.query(query, values);
    return res.rows[0];
  }

  /**
   * Update an existing crop / vegetable (Officer/Admin)
   */
  static async updateCrop(cropId, data) {
    const {
      name_en,
      name_si,
      name_ta,
      category,
      growth_duration_days,
      avg_yield_per_acre_kg,
      standard_price_per_kg,
      standard_demand_kg,
      image_url,
      description_en,
      description_si,
      description_ta
    } = data;

    const query = `
      UPDATE crops
      SET
        name_en = COALESCE($1, name_en),
        name_si = COALESCE($2, name_si),
        name_ta = COALESCE($3, name_ta),
        category = COALESCE($4, category),
        growth_duration_days = COALESCE($5, growth_duration_days),
        avg_yield_per_acre_kg = COALESCE($6, avg_yield_per_acre_kg),
        standard_price_per_kg = COALESCE($7, standard_price_per_kg),
        standard_demand_kg = COALESCE($8, standard_demand_kg),
        image_url = COALESCE($9, image_url),
        description_en = COALESCE($10, description_en),
        description_si = COALESCE($11, description_si),
        description_ta = COALESCE($12, description_ta)
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      name_en || null,
      name_si || null,
      name_ta || null,
      category || null,
      growth_duration_days !== undefined ? parseInt(growth_duration_days, 10) : null,
      avg_yield_per_acre_kg !== undefined ? parseFloat(avg_yield_per_acre_kg) : null,
      standard_price_per_kg !== undefined ? parseFloat(standard_price_per_kg) : null,
      standard_demand_kg !== undefined ? parseFloat(standard_demand_kg) : null,
      image_url !== undefined ? image_url : null,
      description_en || null,
      description_si || null,
      description_ta || null,
      cropId
    ];

    const res = await db.query(query, values);
    if (res.rows.length === 0) throw new Error('Crop not found');
    return res.rows[0];
  }
}

module.exports = CropService;
