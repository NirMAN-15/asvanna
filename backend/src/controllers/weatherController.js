const WeatherService = require('../services/weatherService');
const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');

class WeatherController {
  /**
   * GET /api/v1/weather/current?division=Bandarawela&lat=6.83&lng=80.98
   */
  static async getCurrent(req, res, next) {
    try {
      const { division, lat, lng } = req.query;
      const data = await WeatherService.getForecast(
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        division
      );
      return ApiResponse.success(res, {
        location: data.location,
        current: data.current,
        hourly: data.hourly || [],
        diseases: data.diseases || [],
        fetchedAt: data.fetchedAt,
        source: data.source || 'OPEN_METEO_LIVE'
      }, `Current ${data.location.name} weather retrieved`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/weather/forecast?days=7|14&division=Bandarawela&lat=6.83&lng=80.98
   */
  static async getForecast(req, res, next) {
    try {
      const { division, lat, lng } = req.query;
      const days = parseInt(req.query.days, 10) || 14;
      const data = await WeatherService.getForecast(
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        division
      );
      const limitedForecast = data.forecast ? data.forecast.slice(0, days) : [];

      return ApiResponse.success(res, {
        location: data.location,
        current: data.current,
        hourly: data.hourly || [],
        forecast: limitedForecast,
        diseases: data.diseases || [],
        daysCount: limitedForecast.length,
        fetchedAt: data.fetchedAt,
        source: data.source || 'OPEN_METEO_LIVE'
      }, `${days}-day ${data.location.name} agricultural forecast retrieved`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/weather/agricultural-score?division=Bandarawela
   */
  static async getAgScores(req, res, next) {
    try {
      const { division, lat, lng } = req.query;
      const data = await WeatherService.getForecast(
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        division
      );
      const currentScores = data.current ? data.current.agriculturalScores : null;

      return ApiResponse.success(res, {
        location: data.location,
        currentDate: data.current ? data.current.date : null,
        scores: currentScores,
        interpretation: {
          scale: '0 to 100',
          weatherRiskScore: '0 = Safe, 100 = Critical Hazard',
          suitabilityScore: '100 = Optimal Growth, 0 = Inhospitable'
        }
      }, `${data.location.name} agricultural climate scores`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/weather/crop-suitability/:cropId
   */
  static async getCropWeatherSuitability(req, res, next) {
    try {
      const { cropId } = req.params;
      const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [cropId]);
      if (cropRes.rows.length === 0) {
        return ApiResponse.error(res, 'Crop not found', 404);
      }

      const crop = cropRes.rows[0];
      const weatherData = await WeatherService.getForecast();
      const assessment = await WeatherService.evaluateCropWeatherSuitability(crop, weatherData);

      return ApiResponse.success(res, {
        crop: {
          id: crop.id,
          code: crop.crop_code,
          nameEn: crop.name_en,
          nameSi: crop.name_si,
          nameTa: crop.name_ta
        },
        weatherAssessment: assessment
      }, 'Crop-specific weather evaluation retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/weather/backfill (Admin/Dev tool)
   */
  static async backfillHistory(req, res, next) {
    try {
      const { startDate = '2024-01-01', endDate = '2025-12-31' } = req.body;
      const result = await WeatherService.backfillHistoricalWeather(startDate, endDate);
      return ApiResponse.success(res, result, 'Historical weather backfilled');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WeatherController;
