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

  static async createCrop(req, res, next) {
    try {
      const newCrop = await CropService.createCrop(req.body);
      return ApiResponse.success(res, newCrop, 'Crop created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateCrop(req, res, next) {
    try {
      const { cropId } = req.params;
      const updated = await CropService.updateCrop(cropId, req.body);
      return ApiResponse.success(res, updated, 'Crop updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CropController;
