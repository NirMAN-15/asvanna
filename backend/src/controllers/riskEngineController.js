const RiskEngineService = require('../services/riskEngineService');
const ApiResponse = require('../utils/apiResponse');

class RiskEngineController {
  static async getCropRisk(req, res, next) {
    try {
      const { cropId } = req.params;
      const { district = 'Badulla' } = req.query;
      const risk = await RiskEngineService.evaluateCropRisk(cropId, district);
      return ApiResponse.success(res, risk, 'Crop risk evaluated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getDetailedCropRisk(req, res, next) {
    try {
      const { cropId } = req.params;
      const { district = 'Badulla' } = req.query;
      const risk = await RiskEngineService.evaluateCropRisk(cropId, district);
      return ApiResponse.success(res, risk, 'Detailed multi-factor risk breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getRegionalRiskSummary(req, res, next) {
    try {
      const { district = 'Badulla' } = req.query;
      const summary = await RiskEngineService.getRegionalRiskSummary(district);
      return ApiResponse.success(res, summary, 'Regional risk summary retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getHeatmapData(req, res, next) {
    try {
      const { district = 'Badulla' } = req.query;
      const summary = await RiskEngineService.getRegionalRiskSummary(district);

      // Transform for GIS heatmap visualization
      const heatmap = summary.map(item => ({
        cropId: item.crop.id,
        cropCode: item.crop.code,
        nameEn: item.crop.nameEn,
        nameSi: item.crop.nameSi,
        nameTa: item.crop.nameTa,
        riskLevel: item.riskLevel,
        riskScore: item.riskPercentage,
        plantedAcres: item.totalPlantedAcres,
        estimatedSupplyKg: item.estimatedSupplyKg,
        demandQuotaKg: item.targetDemandKg,
        color: item.riskLevel === 'OVER_PLANTED' ? '#EF4444' : (item.riskLevel === 'WARNING' ? '#F59E0B' : '#10B981')
      }));

      return ApiResponse.success(res, heatmap, 'Regional heatmap risk datasets');
    } catch (err) {
      next(err);
    }
  }

  static async smartSearch(req, res, next) {
    try {
      const { query, district = 'Badulla' } = req.body;
      if (!query) {
        return ApiResponse.error(res, 'Search query is required', 400);
      }

      const results = await RiskEngineService.smartSearch(query, district);
      return ApiResponse.success(res, results, 'Smart search results');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RiskEngineController;
