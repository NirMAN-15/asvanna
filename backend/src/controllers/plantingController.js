const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const RiskEngineService = require('../services/riskEngineService');

class PlantingController {
  static async logPlanting(req, res, next) {
    try {
      const {
        crop_id,
        land_size_acres,
        planting_date,
        latitude,
        longitude,
        district = 'Badulla',
        division = 'Bandarawela',
        farmer_id // provided when DO enters proxy data
      } = req.body;

      const targetFarmerId = req.user.role === 'OFFICER' && farmer_id ? farmer_id : req.user.id;
      const enteredByType = req.user.role === 'OFFICER' ? 'OFFICER' : 'FARMER';
      const officerId = req.user.role === 'OFFICER' ? req.user.id : null;

      // Enforce verified farmer gate
      if (req.user.role === 'FARMER') {
        const userRes = await db.query('SELECT verification_status FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length > 0 && userRes.rows[0].verification_status !== 'APPROVED') {
          return ApiResponse.error(
            res,
            'Your farmer account is pending verification by the Bandarawela Divisional Officer. You cannot log plantings until your NIC and land details are approved.',
            403
          );
        }
      }

      // 1. Fetch Crop details for duration and yield
      const cropRes = await db.query('SELECT * FROM crops WHERE id = $1', [crop_id]);
      if (cropRes.rows.length === 0) return ApiResponse.error(res, 'Invalid crop ID', 400);
      const crop = cropRes.rows[0];

      const acres = parseFloat(land_size_acres);
      const expectedYieldKg = acres * parseFloat(crop.avg_yield_per_acre_kg);

      const pDate = new Date(planting_date);
      const expectedHarvestDate = new Date(pDate.getTime() + crop.growth_duration_days * 24 * 60 * 60 * 1000);

      // 2. Insert Record
      const insertRes = await db.query(
        `INSERT INTO planting_records 
         (farmer_id, crop_id, land_size_acres, expected_yield_kg, planting_date, expected_harvest_date, latitude, longitude, district, division, status, entered_by_type, officer_id, sync_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PLANTED', $11, $12, 'SYNCED')
         RETURNING *`,
        [targetFarmerId, crop_id, acres, expectedYieldKg, planting_date, expectedHarvestDate.toISOString().split('T')[0], latitude, longitude, district, division, enteredByType, officerId]
      );

      // 3. Immediately evaluate updated crop risk
      const riskStatus = await RiskEngineService.evaluateCropRisk(crop_id, district);

      return ApiResponse.success(
        res,
        {
          record: insertRes.rows[0],
          riskAssessment: riskStatus
        },
        'Planting record logged successfully',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  static async getFarmerPlantings(req, res, next) {
    try {
      const farmerId = req.params.farmerId || req.user.id;
      const result = await db.query(
        `SELECT pr.*, c.name_en, c.name_si, c.name_ta, c.crop_code
         FROM planting_records pr
         JOIN crops c ON pr.crop_id = c.id
         WHERE pr.farmer_id = $1
         ORDER BY pr.created_at DESC`,
        [farmerId]
      );
      return ApiResponse.success(res, result.rows);
    } catch (err) {
      next(err);
    }
  }

  static async getRegionalPlantings(req, res, next) {
    try {
      const { district = 'Badulla', division, crop_id } = req.query;
      let query = `
        SELECT pr.*, c.name_en, c.name_si, c.name_ta, c.crop_code, u.full_name as farmer_name, u.phone as farmer_phone
        FROM planting_records pr
        JOIN crops c ON pr.crop_id = c.id
        JOIN users u ON pr.farmer_id = u.id
        WHERE pr.district = $1
      `;
      const params = [district];

      if (division) {
        params.push(division);
        query += ` AND pr.division = $${params.length}`;
      }
      if (crop_id) {
        params.push(crop_id);
        query += ` AND pr.crop_id = $${params.length}`;
      }

      query += ' ORDER BY pr.planting_date DESC LIMIT 500';
      const result = await db.query(query, params);
      return ApiResponse.success(res, result.rows);
    } catch (err) {
      next(err);
    }
  }

  static async deletePlanting(req, res, next) {
    try {
      const { id } = req.params;
      
      // Ensure the user owns this record or is an officer/admin
      const checkRes = await db.query('SELECT farmer_id FROM planting_records WHERE id = $1', [id]);
      if (checkRes.rows.length === 0) return ApiResponse.error(res, 'Record not found', 404);
      
      if (req.user.role === 'FARMER' && checkRes.rows[0].farmer_id !== req.user.id) {
        return ApiResponse.error(res, 'Unauthorized to delete this record', 403);
      }

      await db.query('DELETE FROM planting_records WHERE id = $1', [id]);
      return ApiResponse.success(res, null, 'Planting record removed successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PlantingController;
