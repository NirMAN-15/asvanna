const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/config');
const ApiResponse = require('../utils/apiResponse');
const { splitFullName, formatFullName, splitAddress, formatAddress } = require('../utils/nameAddressUtils');

class AuthController {
  static async register(req, res, next) {
    try {
      const {
        first_name, middle_name, last_name, full_name,
        phone, nic, password, role,
        district, division, gnd_division,
        address_line1, address_line2, city, postal_code, address,
        latitude, longitude, total_land_size,
        business_name, business_type
      } = req.body;

      if (!['OFFICER', 'FARMER', 'BUYER'].includes(role)) {
        return ApiResponse.error(res, 'Invalid role.', 400);
      }

      // Check existing phone or NIC
      const existing = await db.query(
        'SELECT id FROM users WHERE phone = $1 OR (nic IS NOT NULL AND nic = $2)',
        [phone, nic]
      );
      if (existing && existing.rows && existing.rows.length > 0) {
        return ApiResponse.error(res, 'A user with this phone number or NIC already exists.', 400);
      }

      // 1. Resolve discrete name parts & full_name
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
        resolvedFull = 'User';
      }

      // 2. Resolve discrete address parts & address
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

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Farmers & Officers require verification by policy
      const verification_status = role === 'BUYER' ? 'APPROVED' : 'PENDING';
      const is_verified = role === 'BUYER';
      const landSize = (role === 'FARMER' && total_land_size) ? parseFloat(total_land_size) : null;

      const result = await db.query(
        `INSERT INTO users (
          first_name, middle_name, last_name, full_name,
          phone, nic, password_hash, role,
          district, division, gnd_division,
          address_line1, address_line2, city, postal_code, address,
          latitude, longitude, total_land_size,
          business_name, business_type,
          verification_status, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING id, first_name, middle_name, last_name, full_name, phone, nic, role,
                  district, division, gnd_division,
                  address_line1, address_line2, city, postal_code, address,
                  latitude, longitude, total_land_size,
                  business_name, business_type, verification_status, is_verified, created_at`,
        [
          resolvedFirst, resolvedMiddle, resolvedLast, resolvedFull,
          phone, nic, password_hash, role,
          district || 'Badulla', division || 'Bandarawela', gnd_division || null,
          resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal, resolvedAddr,
          latitude || 6.8304, longitude || 80.9878, landSize,
          business_name || null, business_type || null,
          verification_status, is_verified
        ]
      );

      const user = result.rows[0];

      // If farmer, register in verification queue for Divisional Officer
      if (role === 'FARMER') {
        await db.query(
          `INSERT INTO farmer_verifications (farmer_id, verification_status, nic_verified, land_gps_verified, land_size_verified)
           VALUES ($1, 'PENDING', FALSE, FALSE, FALSE)
           ON CONFLICT (farmer_id) DO NOTHING`,
          [user.id]
        );
      }

      const expiresIn = role === 'OFFICER' ? config.jwt.officerExpiresIn : config.jwt.farmerExpiresIn;
      const token = jwt.sign(
        { id: user.id, role: user.role, phone: user.phone, district: user.district, division: user.division },
        config.jwt.secret,
        { expiresIn }
      );

      let message = 'User registered successfully.';
      if (role === 'FARMER') {
        message = 'Registration submitted. Your account is pending verification by the Bandarawela Divisional Officer.';
      } else if (role === 'OFFICER') {
        message = 'Officer registration submitted. Account requires Super Admin approval before activation.';
      }

      return ApiResponse.success(res, { user, token, verification_status }, message, 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { phone, password, role } = req.body;

      const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
      if (!result || !result.rows || result.rows.length === 0) {
        return ApiResponse.error(res, 'Invalid phone number or password.', 401);
      }

      const user = result.rows[0];

      if (role && user.role !== role && user.role !== 'ADMIN') {
        return ApiResponse.error(res, `Account exists but role is ${user.role}, not ${role}.`, 403);
      }

      if (user.is_active === false) {
        return ApiResponse.error(res, 'Your account has been deactivated. Please contact support.', 403);
      }

      if (!password) {
        return ApiResponse.error(res, 'Password is required.', 400);
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid phone number or password.', 401);
      }

      // Check verification status
      let verificationNote = null;
      if (user.role === 'FARMER') {
        if (user.verification_status === 'REJECTED') {
          // Fetch rejection reason
          const verRes = await db.query('SELECT rejection_reason FROM farmer_verifications WHERE farmer_id = $1', [user.id]);
          const reason = verRes.rows.length > 0 ? verRes.rows[0].rejection_reason : 'Details could not be verified by officer';
          return ApiResponse.error(res, `Farmer account verification was rejected: ${reason}`, 403);
        }
        if (user.verification_status === 'PENDING') {
          verificationNote = 'Your profile is awaiting verification by the Divisional Officer. Some features are restricted until approval.';
        }
      }

      const expiresIn = user.role === 'OFFICER' ? config.jwt.officerExpiresIn : config.jwt.farmerExpiresIn;
      const token = jwt.sign(
        { id: user.id, role: user.role, phone: user.phone, district: user.district, division: user.division },
        config.jwt.secret,
        { expiresIn }
      );

      delete user.password_hash;
      return ApiResponse.success(res, { user, token, verificationNote }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const result = await db.query(
        `SELECT
           id, first_name, middle_name, last_name, full_name, phone, nic, email, role, language_preference,
           district, division, gnd_division, address_line1, address_line2, city, postal_code, address,
           latitude, longitude, total_land_size, preferred_search_radius,
           business_name, business_type, profile_photo_url, verification_status, is_verified, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );
      if (result.rows.length === 0) return ApiResponse.error(res, 'User not found', 404);
      return ApiResponse.success(res, result.rows[0], 'User profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const {
        first_name, middle_name, last_name, full_name,
        email, language_preference,
        address_line1, address_line2, city, postal_code, address,
        preferred_search_radius, business_name, business_type,
        profile_photo_url
      } = req.body;

      // Current user to sync
      const currentRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      const current = currentRes.rows[0] || {};

      let resolvedFirst = first_name !== undefined ? first_name : current.first_name;
      let resolvedMiddle = middle_name !== undefined ? middle_name : current.middle_name;
      let resolvedLast = last_name !== undefined ? last_name : current.last_name;
      let resolvedFull = full_name !== undefined ? full_name : current.full_name;

      if ((first_name !== undefined || last_name !== undefined) && full_name === undefined) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      } else if (full_name !== undefined && first_name === undefined && last_name === undefined) {
        const parts = splitFullName(full_name);
        resolvedFirst = parts.first_name;
        resolvedMiddle = parts.middle_name;
        resolvedLast = parts.last_name;
      }

      let resolvedAddr1 = address_line1 !== undefined ? address_line1 : current.address_line1;
      let resolvedAddr2 = address_line2 !== undefined ? address_line2 : current.address_line2;
      let resolvedCity = city !== undefined ? city : current.city || current.division || 'Bandarawela';
      let resolvedPostal = postal_code !== undefined ? postal_code : current.postal_code || '90100';
      let resolvedAddr = address !== undefined ? address : current.address;

      if ((address_line1 !== undefined || city !== undefined) && address === undefined) {
        resolvedAddr = formatAddress(resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal);
      } else if (address !== undefined && address_line1 === undefined) {
        const addrParts = splitAddress(address, resolvedCity, resolvedPostal);
        resolvedAddr1 = addrParts.address_line1;
        resolvedAddr2 = addrParts.address_line2;
        resolvedCity = addrParts.city;
        resolvedPostal = addrParts.postal_code;
      }

      const result = await db.query(
        `UPDATE users
         SET first_name = $1,
             middle_name = $2,
             last_name = $3,
             full_name = $4,
             email = COALESCE($5, email),
             language_preference = COALESCE($6, language_preference),
             address_line1 = $7,
             address_line2 = $8,
             city = $9,
             postal_code = $10,
             address = $11,
             preferred_search_radius = COALESCE($12, preferred_search_radius),
             business_name = COALESCE($13, business_name),
             business_type = COALESCE($14, business_type),
             profile_photo_url = COALESCE($15, profile_photo_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $16
         RETURNING id, first_name, middle_name, last_name, full_name, phone, nic, email, role,
                   language_preference, district, division, gnd_division,
                   address_line1, address_line2, city, postal_code, address,
                   latitude, longitude, total_land_size, preferred_search_radius,
                   business_name, business_type, profile_photo_url, verification_status, is_verified`,
        [
          resolvedFirst, resolvedMiddle, resolvedLast, resolvedFull,
          email, language_preference,
          resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal, resolvedAddr,
          preferred_search_radius, business_name, business_type,
          profile_photo_url, req.user.id
        ]
      );

      return ApiResponse.success(res, result.rows[0], 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateFcmToken(req, res, next) {
    try {
      const { fcm_token } = req.body;
      await db.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [fcm_token, req.user.id]);
      return ApiResponse.success(res, null, 'FCM token updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
