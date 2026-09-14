const RecommendationService = require('../services/recommendationService');
const ApiResponse = require('../utils/apiResponse');

class RecommendationController {
  static async getRecommendations(req, res, next) {
    try {
      const { district = 'Badulla', cropId } = req.query;
      const recommendations = await RecommendationService.getSmartRecommendations(district, cropId);
      return ApiResponse.success(res, recommendations);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RecommendationController;
