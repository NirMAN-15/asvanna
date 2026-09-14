const PriceService = require('../services/priceService');
const ApiResponse = require('../utils/apiResponse');

class PriceController {
  /**
   * GET /api/v1/prices/latest
   */
  static async getLatestPrices(req, res, next) {
    try {
      const { market = 'Keppetipola Economic Centre' } = req.query;
      const prices = await PriceService.getLatestPrices(market);
      return ApiResponse.success(res, prices, 'Latest wholesale prices retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/prices/:cropId/history?days=90&market=Keppetipola
   */
  static async getCropHistory(req, res, next) {
    try {
      const { cropId } = req.params;
      const { days = 90, market = 'Keppetipola Economic Centre' } = req.query;
      const data = await PriceService.getCropPriceHistory(cropId, parseInt(days, 10), market);
      return ApiResponse.success(res, data, 'Price history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/prices/record (Officer tool)
   */
  static async recordPrice(req, res, next) {
    try {
      const { cropId, pricePerKg, priceDate, market } = req.body;
      const officerId = req.user ? req.user.id : null;

      if (!cropId || !pricePerKg) {
        return ApiResponse.error(res, 'cropId and pricePerKg are required', 400);
      }

      const record = await PriceService.recordPrice(cropId, parseFloat(pricePerKg), priceDate, market, officerId);
      return ApiResponse.success(res, record, 'Price logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/prices/batch (Officer batch tool)
   */
  static async recordBatch(req, res, next) {
    try {
      const { entries, market } = req.body;
      const officerId = req.user ? req.user.id : null;

      if (!entries || !Array.isArray(entries)) {
        return ApiResponse.error(res, 'entries array is required', 400);
      }

      const results = await PriceService.recordBatchPrices(entries, officerId, market);
      return ApiResponse.success(res, results, `${results.length} crop prices logged successfully`, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PriceController;
