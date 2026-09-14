const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/config');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  static async register(req, res, next) {
    try {
      const {
        full_name, phone, nic, password, role,
        district, division, gnd_division, address,
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

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Farmers & Officers require verification by policy
      const verification_status = role === 'BUYER' ? 'APPROVED' : 'PENDING';
      const is_verified = role === 'BUYER';
      const landSize = (role === 'FARMER' && total_land_size) ? parseFloat(total_land_size) : null;

      const result = await db.query(
        `INSERT INTO users (
          full_name, phone, nic, password_hash, role,
          district, division, gnd_division, address,
          latitude, longitude, total_land_size,
          business_name, business_type,
          verification_status, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, full_name, phone, nic, role, district, division, gnd_division, address, latitude, longitude, total_land_size, business_name, business_type, verification_status, is_verified, created_at`,
        [
          full_name, phone, nic, password_hash, role,
          district || 'Badulla', division || 'Bandarawela', gnd_division || null, address || null,
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
           id, full_name, phone, nic, email, role, language_preference,
           district, division, gnd_division, address, latitude, longitude,
           total_land_size, preferred_search_radius, business_name, business_type,
           profile_photo_url, verification_status, is_verified, created_at
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
        full_name, email, language_preference,
        address, preferred_search_radius, business_name, business_type,
        profile_photo_url
      } = req.body;

      const result = await db.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             email = COALESCE($2, email),
             language_preference = COALESCE($3, language_preference),
             address = COALESCE($4, address),
             preferred_search_radius = COALESCE($5, preferred_search_radius),
             business_name = COALESCE($6, business_name),
             business_type = COALESCE($7, business_type),
             profile_photo_url = COALESCE($8, profile_photo_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING id, full_name, phone, nic, email, role, language_preference, district, division, gnd_division, address, latitude, longitude, total_land_size, preferred_search_radius, business_name, business_type, profile_photo_url, verification_status, is_verified`,
        [
          full_name, email, language_preference,
          address, preferred_search_radius, business_name, business_type,
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
