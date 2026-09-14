const bcrypt = require('bcryptjs');
const db = require('../config/database');
const ValidationService = require('../services/validationService');
const ApiResponse = require('../utils/apiResponse');

class OfficerController {
  /**
   * GET /api/v1/officer/farmers
   * Get all registered farmers in officer jurisdiction
   */
  static async getFarmerDirectory(req, res, next) {
    try {
      const { status } = req.query;
      let query = `
        SELECT
          id, full_name, phone, nic, email, district, division, gnd_division,
          address, latitude, longitude, total_land_size, business_name,
          verification_status, is_verified, is_active, created_at
        FROM users
        WHERE role = 'FARMER'
      `;
      const params = [];

      if (status) {
        params.push(status);
        query += ` AND verification_status = $1`;
      }

      query += ` ORDER BY created_at DESC`;
      const result = await db.query(query, params);

      return ApiResponse.success(res, result.rows || [], 'Farmer directory retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/officer/verifications/pending
   * List pending farmer registrations with automated anomaly detection
   */
  static async getPendingVerifications(req, res, next) {
    try {
      const division = (req.user && req.user.division) || 'Bandarawela';
      const pendingList = await ValidationService.getPendingVerifications(division);
      return ApiResponse.success(res, pendingList, `${pendingList.length} pending farmer verifications`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/officer/verifications/:farmerId
   * Approve or reject a farmer's registration with verification checklist
   */
  static async reviewFarmer(req, res, next) {
    try {
      const { farmerId } = req.params;
      const { approved, nicVerified, landGpsVerified, landSizeVerified, rejectionReason } = req.body;
      const officerId = req.user ? req.user.id : 1;

      const result = await ValidationService.reviewFarmer(farmerId, officerId, {
        approved: Boolean(approved),
        nicVerified: Boolean(nicVerified),
        landGpsVerified: Boolean(landGpsVerified),
        landSizeVerified: Boolean(landSizeVerified),
        rejectionReason
      });

      return ApiResponse.success(res, result, `Farmer account ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/officer/proxy-register
   * Officer registers a farmer on their behalf (verified immediately)
   */
  static async registerFarmerProxy(req, res, next) {
    try {
      const {
        full_name, phone, nic, district = 'Badulla', division = 'Bandarawela',
        gnd_division, address, total_land_size, latitude, longitude
      } = req.body;
      const officerId = req.user ? req.user.id : 1;

      const salt = await bcrypt.genSalt(10);
      const defaultPassword = await bcrypt.hash('asvanna123', salt);

      const result = await db.query(
        `INSERT INTO users (
          full_name, phone, nic, password_hash, role,
          district, division, gnd_division, address,
          total_land_size, latitude, longitude,
          verification_status, is_verified
        ) VALUES ($1, $2, $3, $4, 'FARMER', $5, $6, $7, $8, $9, $10, $11, 'APPROVED', TRUE)
        RETURNING id, full_name, phone, nic, district, division, gnd_division, address, total_land_size, is_verified, created_at`,
        [
          full_name, phone, nic, defaultPassword, district, division,
          gnd_division, address, total_land_size || 1.0,
          latitude || 6.8304, longitude || 80.9878
        ]
      );

      const newFarmer = result.rows[0];

      // Insert approved verification log
      await db.query(
        `INSERT INTO farmer_verifications (farmer_id, verification_status, nic_verified, land_gps_verified, land_size_verified, verified_by, verified_at)
         VALUES ($1, 'APPROVED', TRUE, TRUE, TRUE, $2, CURRENT_TIMESTAMP)`,
        [newFarmer.id, officerId]
      );

      return ApiResponse.success(res, newFarmer, 'Farmer registered and approved via proxy by Divisional Officer', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/officer/analytics/summary
   * Regional cultivation and participation analytics
   */
  static async getRegionalAnalytics(req, res, next) {
    try {
      const farmersCountRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER' AND is_active = TRUE");
      const verifiedCountRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER' AND verification_status = 'APPROVED'");
      const pendingCountRes = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'FARMER' AND verification_status = 'PENDING'");

      const plantingsAgg = await db.query(
        `SELECT
           c.id as crop_id,
           c.crop_code,
           c.name_en,
           c.name_si,
           c.name_ta,
           COALESCE(SUM(p.land_size_acres), 0) as total_acres,
           COALESCE(SUM(p.expected_yield_kg), 0) as total_yield_kg,
           COUNT(p.id) as active_plots
         FROM crops c
         LEFT JOIN planting_records p ON p.crop_id = c.id AND p.status IN ('PLANTED', 'GROWING') AND p.district = 'Badulla'
         GROUP BY c.id
         ORDER BY total_acres DESC`
      );

      return ApiResponse.success(res, {
        region: { district: 'Badulla', division: 'Bandarawela', province: 'Uva' },
        farmerStats: {
          totalRegistered: parseInt(farmersCountRes.rows[0].count, 10),
          verifiedApproved: parseInt(verifiedCountRes.rows[0].count, 10),
          pendingVerification: parseInt(pendingCountRes.rows[0].count, 10)
        },
        cultivationDistribution: plantingsAgg.rows.map(r => ({
          cropId: r.crop_id,
          code: r.crop_code,
          nameEn: r.name_en,
          nameSi: r.name_si,
          nameTa: r.name_ta,
          plantedAcres: parseFloat(r.total_acres),
          expectedYieldKg: parseFloat(r.total_yield_kg),
          activePlots: parseInt(r.active_plots, 10)
        }))
      }, 'Regional analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/officer/analytics/forecast
   * 30/60/90 day projected surplus & harvest schedule
   */
  static async getForecasting(req, res, next) {
    try {
      const harvestRes = await db.query(
        `SELECT
           c.name_en as crop_name,
           c.crop_code,
           p.expected_harvest_date,
           p.expected_yield_kg,
           p.land_size_acres,
           u.full_name as farmer_name,
           u.phone as farmer_phone
         FROM planting_records p
         JOIN crops c ON c.id = p.crop_id
         JOIN users u ON u.id = p.farmer_id
         WHERE p.status IN ('PLANTED', 'GROWING')
           AND p.expected_harvest_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
         ORDER BY p.expected_harvest_date ASC`
      );

      return ApiResponse.success(res, harvestRes.rows, 'Harvest projection for next 90 days');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/officer/export-report
   */
  static async exportReport(req, res, next) {
    try {
      const officerName = req.user ? req.user.full_name : 'W. M. Bandara (DO Bandarawela)';
      const report = {
        title: 'Department of Agriculture - Bandarawela Regional Cultivation Summary',
        generatedAt: new Date().toISOString(),
        officer: officerName,
        district: 'Badulla',
        division: 'Bandarawela',
        reportType: 'OFFICIAL_GOVERNMENT_SUMMARY'
      };
      return ApiResponse.success(res, report, 'Regional cultivation report generated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OfficerController;
