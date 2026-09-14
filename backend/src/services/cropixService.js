const axios = require('axios');
const db = require('../config/database');
const config = require('../config/config');

class CropixService {
  /**
   * Sync or fetch demand benchmark for a crop in Badulla district
   * Attempts CROPIX national platform API first, falls back to local database benchmark
   */
  static async getDemandBenchmark(cropId, district = 'Badulla', targetMonth = null, targetYear = null) {
    const month = targetMonth || (new Date().getMonth() + 1);
    const year = targetYear || new Date().getFullYear();

    // 1. Check local database first
    const localRes = await db.query(
      `SELECT * FROM cropix_demand_benchmarks
       WHERE crop_id = $1 AND district = $2 AND target_month = $3 AND target_year = $4`,
      [cropId, district, month, year]
    );

    if (localRes.rows.length > 0) {
      return {
        ...localRes.rows[0],
        source: 'CROPIX_LOCAL_BENCHMARK'
      };
    }

    // 2. Attempt CROPIX API if URL is configured
    if (config.external.cropixApiUrl) {
      try {
        const apiRes = await axios.get(`${config.external.cropixApiUrl}/demand-benchmarks`, {
          params: { crop_id: cropId, district, month, year },
          timeout: 4000
        });
        if (apiRes.data && apiRes.data.regional_quota_kg) {
          const fetched = apiRes.data;
          // Cache in local table
          await db.query(
            `INSERT INTO cropix_demand_benchmarks (crop_id, district, target_month, target_year, national_demand_kg, regional_quota_kg, current_market_gap_kg)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (crop_id, district, target_month, target_year) DO UPDATE SET
               national_demand_kg = EXCLUDED.national_demand_kg,
               regional_quota_kg = EXCLUDED.regional_quota_kg,
               current_market_gap_kg = EXCLUDED.current_market_gap_kg`,
            [cropId, district, month, year, fetched.national_demand_kg, fetched.regional_quota_kg, fetched.current_market_gap_kg]
          );
          return { ...fetched, source: 'CROPIX_LIVE_API' };
        }
      } catch (err) {
        // Fall through to standard crop baseline
      }
    }

    // 3. Fallback to standard crop demand from crops table
    const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [cropId]);
    if (cropRes.rows.length === 0) throw new Error('Crop not found');
    const crop = cropRes.rows[0];

    const standardDemand = parseFloat(crop.standard_demand_kg || (crop.avg_yield_per_acre_kg * 12));
    const regionalQuota = Math.round(standardDemand * 0.25); // Badulla district quota ~25% of upcountry demand

    const fallbackRecord = {
      crop_id: cropId,
      district,
      target_month: month,
      target_year: year,
      national_demand_kg: standardDemand,
      regional_quota_kg: regionalQuota,
      current_market_gap_kg: Math.round(regionalQuota * 0.3),
      source: 'DOA_EXTENSION_BASELINE'
    };

    // Store in DB for subsequent fast lookups
    try {
      await db.query(
        `INSERT INTO cropix_demand_benchmarks (crop_id, district, target_month, target_year, national_demand_kg, regional_quota_kg, current_market_gap_kg)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (crop_id, district, target_month, target_year) DO NOTHING`,
        [cropId, district, month, year, standardDemand, regionalQuota, fallbackRecord.current_market_gap_kg]
      );
    } catch (e) {}

    return fallbackRecord;
  }

  /**
   * Officer update of regional demand quota from official circulars
   */
  static async updateQuota(cropId, district, targetMonth, targetYear, regionalQuotaKg, nationalDemandKg) {
    const res = await db.query(
      `INSERT INTO cropix_demand_benchmarks (crop_id, district, target_month, target_year, national_demand_kg, regional_quota_kg, current_market_gap_kg, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       ON CONFLICT (crop_id, district, target_month, target_year) DO UPDATE SET
         national_demand_kg = EXCLUDED.national_demand_kg,
         regional_quota_kg = EXCLUDED.regional_quota_kg,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [cropId, district, targetMonth, targetYear, nationalDemandKg, regionalQuotaKg, regionalQuotaKg]
    );
    return res.rows[0];
  }
}

module.exports = CropixService;
