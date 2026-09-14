const CropService = require('../services/cropService');
const ApiResponse = require('../utils/apiResponse');

class CropController {
  static async getAllCrops(req, res, next) {
    try {
      const { category, search } = req.query;
      const crops = await CropService.getAllCrops(category, search);
      return ApiResponse.success(res, crops, 'Crops list retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getCropProfile(req, res, next) {
    try {
      const { cropId } = req.params;
      const profile = await CropService.getCropProfile(cropId);
      return ApiResponse.success(res, profile, 'Crop profile retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CropController;
