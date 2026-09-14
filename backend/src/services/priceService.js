const db = require('../config/database');

class PriceService {
  /**
   * Get latest wholesale prices for all crops at Keppetipola / Dambulla
   */
  static async getLatestPrices(marketName = 'Keppetipola Economic Centre') {
    const query = `
      SELECT DISTINCT ON (c.id)
        c.id as crop_id,
        c.crop_code,
        c.name_en,
        c.name_si,
        c.name_ta,
        c.standard_price_per_kg,
        c.price_range_min,
        c.price_range_max,
        COALESCE(ph.price_per_kg, c.standard_price_per_kg) as current_price_per_kg,
        ph.price_date as latest_price_date,
        ph.market_name
      FROM crops c
      LEFT JOIN price_history ph ON ph.crop_id = c.id
      ORDER BY c.id, ph.price_date DESC NULLS LAST
    `;
    const res = await db.query(query);
    return res.rows;
  }

  /**
   * Get historical price trend for a specific crop over a period (30, 90, 180, 365 days)
   */
  static async getCropPriceHistory(cropId, days = 90, marketName = 'Keppetipola Economic Centre') {
    const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [cropId]);
    if (cropRes.rows.length === 0) throw new Error('Crop not found');
    const crop = cropRes.rows[0];

    const historyRes = await db.query(
      `SELECT price_per_kg, price_date, market_name, source
       FROM price_history
       WHERE crop_id = $1 AND price_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
       ORDER BY price_date ASC`,
      [cropId, days]
    );

    let records = historyRes.rows;

    // Calculate statistical metrics
    let avgPrice = parseFloat(crop.standard_price_per_kg);
    let minPrice = parseFloat(crop.price_range_min || crop.standard_price_per_kg * 0.7);
    let maxPrice = parseFloat(crop.price_range_max || crop.standard_price_per_kg * 1.4);
    let volatility = 15.0; // Default %

    if (records.length > 0) {
      const prices = records.map(r => parseFloat(r.price_per_kg));
      const sum = prices.reduce((a, b) => a + b, 0);
      avgPrice = Math.round((sum / prices.length) * 100) / 100;
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);

      // Standard deviation for price volatility
      const variance = prices.reduce((acc, p) => acc + Math.pow(p - avgPrice, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      volatility = avgPrice > 0 ? Math.round((stdDev / avgPrice) * 1000) / 10 : 0;
    }

    return {
      crop: {
        id: crop.id,
        code: crop.crop_code,
        nameEn: crop.name_en,
        nameSi: crop.name_si,
        nameTa: crop.name_ta,
        standardPrice: crop.standard_price_per_kg
      },
      market: marketName,
      timeframeDays: days,
      metrics: {
        currentPrice: records.length > 0 ? parseFloat(records[records.length - 1].price_per_kg) : avgPrice,
        averagePrice: avgPrice,
        lowestPrice: minPrice,
        highestPrice: maxPrice,
        volatilityPercentage: volatility
      },
      history: records
    };
  }

  /**
   * Log daily wholesale price for a crop (Officer tool)
   */
  static async recordPrice(cropId, pricePerKg, priceDate = null, marketName = 'Keppetipola Economic Centre', officerId = null) {
    const targetDate = priceDate || new Date().toISOString().split('T')[0];

    const res = await db.query(
      `INSERT INTO price_history (crop_id, market_name, price_per_kg, price_date, source, entered_by)
       VALUES ($1, $2, $3, $4, 'OFFICER_ENTRY', $5)
       ON CONFLICT (crop_id, market_name, price_date) DO UPDATE SET
         price_per_kg = EXCLUDED.price_per_kg,
         entered_by = EXCLUDED.entered_by
       RETURNING *`,
      [cropId, marketName, pricePerKg, targetDate, officerId]
    );

    // Update standard price in crops table if today's price
    await db.query(
      'UPDATE crops SET standard_price_per_kg = $1 WHERE id = $2',
      [pricePerKg, cropId]
    );

    return res.rows[0];
  }

  /**
   * Batch log prices for multiple crops at once (Officer batch input)
   */
  static async recordBatchPrices(entries, officerId = null, marketName = 'Keppetipola Economic Centre') {
    const results = [];
    const today = new Date().toISOString().split('T')[0];

    for (const item of entries) {
      const rec = await this.recordPrice(item.cropId, item.pricePerKg, item.priceDate || today, marketName, officerId);
      results.push(rec);
    }

    return results;
  }
}

module.exports = PriceService;
