const bcrypt = require('bcryptjs');
const db = require('../config/database');
const ValidationService = require('../services/validationService');
const ApiResponse = require('../utils/apiResponse');
const { splitFullName, formatFullName, splitAddress, formatAddress } = require('../utils/nameAddressUtils');

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
          id, first_name, middle_name, last_name, full_name, phone, nic, email,
          district, division, gnd_division,
          address_line1, address_line2, city, postal_code, address,
          latitude, longitude, total_land_size, business_name,
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
   * Verify and approve or reject farmer registration
   */
  static async reviewFarmer(req, res, next) {
    try {
      const { farmerId } = req.params;
      const {
        approved,
        nicVerified = true,
        landGpsVerified = true,
        landSizeVerified = true,
        rejectionReason
      } = req.body;
      const officerId = req.user ? req.user.id : 1;

      const result = await ValidationService.reviewFarmer(
        farmerId,
        officerId,
        {
          approved: Boolean(approved),
          nicVerified: Boolean(nicVerified),
          landGpsVerified: Boolean(landGpsVerified),
          landSizeVerified: Boolean(landSizeVerified),
          rejectionReason
        }
      );

      return ApiResponse.success(
        res,
        result,
        approved ? 'Farmer account verified and approved' : 'Farmer registration rejected'
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/officer/farmer-updates/pending
   * List pending farmer profile updates awaiting divisional officer approval
   */
  static async getFarmerProfileRequests(req, res, next) {
    try {
      const result = await db.query(
        `SELECT id, first_name, middle_name, last_name, full_name, phone, nic, email,
                district, division, gnd_division, address_line1, address_line2, city, postal_code, address,
                total_land_size, last_profile_update_at, pending_profile_updates, profile_update_status
         FROM users
         WHERE role = 'FARMER' AND profile_update_status = 'PENDING'
         ORDER BY last_profile_update_at DESC`
      );
      return ApiResponse.success(res, result.rows || [], 'Pending profile change requests retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/officer/farmer-updates/:farmerId/review
   * Approve or reject farmer profile details change
   */
  static async reviewFarmerProfileRequest(req, res, next) {
    try {
      const { farmerId } = req.params;
      const { approved, rejectionReason } = req.body;

      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [farmerId]);
      if (userRes.rows.length === 0) return ApiResponse.error(res, 'Farmer not found', 404);
      const farmer = userRes.rows[0];

      if (approved) {
        let pending = farmer.pending_profile_updates;
        if (typeof pending === 'string') {
          try { pending = JSON.parse(pending); } catch (e) {}
        }
        pending = pending || {};

        const updateRes = await db.query(
          `UPDATE users
           SET full_name = COALESCE($1, full_name),
               first_name = COALESCE($2, first_name),
               middle_name = COALESCE($3, middle_name),
               last_name = COALESCE($4, last_name),
               gnd_division = COALESCE($5, gnd_division),
               total_land_size = COALESCE($6, total_land_size),
               address_line1 = COALESCE($7, address_line1),
               address_line2 = COALESCE($8, address_line2),
               city = COALESCE($9, city),
               postal_code = COALESCE($10, postal_code),
               address = COALESCE($11, address),
               profile_update_status = 'APPROVED',
               pending_profile_updates = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $12
           RETURNING *`,
          [
            pending.full_name || null,
            pending.first_name || null,
            pending.middle_name || null,
            pending.last_name || null,
            pending.gnd_division || null,
            pending.total_land_size !== undefined ? parseFloat(pending.total_land_size) : null,
            pending.address_line1 || null,
            pending.address_line2 || null,
            pending.city || null,
            pending.postal_code || null,
            pending.address || null,
            farmerId
          ]
        );

        return ApiResponse.success(res, updateRes.rows[0], 'Farmer profile updates approved and officially synchronized');
      } else {
        const updateRes = await db.query(
          `UPDATE users
           SET profile_update_status = 'REJECTED',
               pending_profile_updates = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
          [farmerId]
        );
        return ApiResponse.success(res, updateRes.rows[0], 'Farmer profile updates rejected');
      }
    } catch (err) {
      next(err);
    }
  }


  /**
   * PUT /api/v1/officer/farmers/:farmerId
   * Update farmer details by Divisional Officer
   */
  static async updateFarmerDetails(req, res, next) {
    try {
      const { farmerId } = req.params;
      const {
        first_name, middle_name, last_name, full_name,
        phone, nic, district, division, gnd_division,
        address_line1, address_line2, city, postal_code, address,
        total_land_size, latitude, longitude,
        verification_status, is_active, password
      } = req.body;

      // Check if farmer exists
      const userRes = await db.query("SELECT * FROM users WHERE id = $1 AND role = 'FARMER'", [farmerId]);
      if (userRes.rows.length === 0) {
        return ApiResponse.error(res, 'Farmer not found.', 404);
      }
      const existing = userRes.rows[0];

      // Resolve name
      let resolvedFirst = first_name !== undefined ? (first_name || null) : existing.first_name;
      let resolvedMiddle = middle_name !== undefined ? (middle_name || null) : existing.middle_name;
      let resolvedLast = last_name !== undefined ? (last_name || null) : existing.last_name;
      let resolvedFull = full_name !== undefined ? (full_name || null) : existing.full_name;

      if ((!resolvedFirst || !resolvedLast) && resolvedFull) {
        const nameParts = splitFullName(resolvedFull);
        resolvedFirst = resolvedFirst || nameParts.first_name;
        resolvedMiddle = resolvedMiddle !== null ? resolvedMiddle : nameParts.middle_name;
        resolvedLast = resolvedLast || nameParts.last_name;
      }
      if (resolvedFirst || resolvedLast) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      }

      // Resolve address
      let resolvedCity = city !== undefined ? city : (existing.city || existing.division || 'Bandarawela');
      let resolvedPostal = postal_code !== undefined ? postal_code : (existing.postal_code || '90100');
      let resolvedAddr1 = address_line1 !== undefined ? (address_line1 || null) : existing.address_line1;
      let resolvedAddr2 = address_line2 !== undefined ? (address_line2 || null) : existing.address_line2;
      let resolvedAddr = address !== undefined ? (address || null) : existing.address;

      if (!resolvedAddr1 && resolvedAddr) {
        const addrParts = splitAddress(resolvedAddr, resolvedCity, resolvedPostal);
        resolvedAddr1 = addrParts.address_line1;
        resolvedAddr2 = addrParts.address_line2;
        resolvedCity = addrParts.city;
        resolvedPostal = addrParts.postal_code;
      }
      if (resolvedAddr1) {
        resolvedAddr = formatAddress(resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal);
      }

      // Password update if provided
      let passwordHash = existing.password_hash;
      if (password && password.trim().length > 0) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password.trim(), salt);
      }

      const updateRes = await db.query(
        `UPDATE users
         SET
           first_name = $1,
           middle_name = $2,
           last_name = $3,
           full_name = $4,
           phone = COALESCE($5, phone),
           nic = COALESCE($6, nic),
           district = COALESCE($7, district),
           division = COALESCE($8, division),
           gnd_division = COALESCE($9, gnd_division),
           address_line1 = $10,
           address_line2 = $11,
           city = $12,
           postal_code = $13,
           address = $14,
           total_land_size = COALESCE($15, total_land_size),
           latitude = COALESCE($16, latitude),
           longitude = COALESCE($17, longitude),
           verification_status = COALESCE($18, verification_status),
           is_active = COALESCE($19, is_active),
           password_hash = $20,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $21
         RETURNING id, first_name, middle_name, last_name, full_name, phone, nic, email,
                   district, division, gnd_division,
                   address_line1, address_line2, city, postal_code, address,
                   total_land_size, latitude, longitude,
                   verification_status, is_verified, is_active, created_at, updated_at`,
        [
          resolvedFirst, resolvedMiddle, resolvedLast, resolvedFull,
          phone !== undefined ? phone.trim() : null,
          nic !== undefined ? nic.trim().toUpperCase() : null,
          district || null,
          division || null,
          gnd_division || null,
          resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal, resolvedAddr,
          total_land_size !== undefined && total_land_size !== null ? parseFloat(total_land_size) : null,
          latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
          longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
          verification_status || null,
          is_active !== undefined ? Boolean(is_active) : null,
          passwordHash,
          farmerId
        ]
      );

      return ApiResponse.success(res, updateRes.rows[0], 'Farmer details updated successfully by officer');
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
        first_name, middle_name, last_name, full_name,
        phone, nic, district = 'Badulla', division = 'Bandarawela',
        gnd_division, address_line1, address_line2, city, postal_code, address,
        total_land_size, latitude, longitude, password
      } = req.body;
      const officerId = req.user ? req.user.id : 1;

      let resolvedFirst = first_name || null;
      let resolvedMiddle = middle_name !== undefined ? middle_name : null;
      let resolvedLast = last_name || null;
      let resolvedFull = full_name || null;

      if ((!resolvedFirst || !resolvedLast) && resolvedFull) {
        const nameParts = splitFullName(resolvedFull);
        resolvedFirst = resolvedFirst || nameParts.first_name;
        resolvedMiddle = resolvedMiddle !== null ? resolvedMiddle : nameParts.middle_name;
        resolvedLast = resolvedLast || nameParts.last_name;
      }
      if (!resolvedFull && resolvedFirst) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      }
      if (!resolvedFull) {
        resolvedFull = 'Farmer';
      }

      let resolvedCity = city || division || 'Bandarawela';
      let resolvedPostal = postal_code || '90100';
      let resolvedAddr1 = address_line1 || null;
      let resolvedAddr2 = address_line2 !== undefined ? address_line2 : null;
      let resolvedAddr = address || null;

      if (!resolvedAddr1 && resolvedAddr) {
        const addrParts = splitAddress(resolvedAddr, resolvedCity, resolvedPostal);
        resolvedAddr1 = addrParts.address_line1;
        resolvedAddr2 = addrParts.address_line2;
        resolvedCity = addrParts.city;
        resolvedPostal = addrParts.postal_code;
      }
      if (!resolvedAddr && resolvedAddr1) {
        resolvedAddr = formatAddress(resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal);
      }

      const rawPassword = password && password.trim() ? password.trim() : 'asvanna123';
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = await bcrypt.hash(rawPassword, salt);

      const result = await db.query(
        `INSERT INTO users (
          first_name, middle_name, last_name, full_name,
          phone, nic, password_hash, role,
          district, division, gnd_division,
          address_line1, address_line2, city, postal_code, address,
          total_land_size, latitude, longitude,
          verification_status, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'FARMER', $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'APPROVED', TRUE)
        RETURNING id, first_name, middle_name, last_name, full_name, phone, nic,
                  district, division, gnd_division,
                  address_line1, address_line2, city, postal_code, address,
                  total_land_size, is_verified, created_at`,
        [
          resolvedFirst, resolvedMiddle, resolvedLast, resolvedFull,
          phone, nic, defaultPassword,
          district, division, gnd_division || null,
          resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal, resolvedAddr,
          total_land_size || 1.0,
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

      return ApiResponse.success(res, {
        ...newFarmer,
        credentials: {
          identifier: newFarmer.nic || newFarmer.phone,
          nic: newFarmer.nic,
          phone: newFarmer.phone,
          password: rawPassword
        }
      }, 'Farmer registered and approved via proxy by Divisional Officer', 201);
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
