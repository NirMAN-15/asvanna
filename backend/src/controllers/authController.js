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
        return ApiResponse.error(res, 'Invalid role. Public registration only supports FARMER, OFFICER, or BUYER.', 400);
      }

      // Strong password validation check
      if (!password || typeof password !== 'string' || password.length < 8) {
        return ApiResponse.error(res, 'Password must be at least 8 characters long.', 400);
      }
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;
      if (!strongPasswordRegex.test(password)) {
        return ApiResponse.error(
          res,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&* etc.).',
          400
        );
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
      if (resolvedFirst && resolvedLast) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      } else if (!resolvedFull && resolvedFirst) {
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
      if (resolvedAddr1) {
        resolvedAddr = formatAddress(resolvedAddr1, resolvedAddr2, resolvedCity, resolvedPostal);
      } else if (!resolvedAddr && resolvedAddr1) {
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

  static async registerAdmin(req, res, next) {
    try {
      const {
        first_name, middle_name, last_name, full_name,
        phone, nic, email, password, admin_key
      } = req.body;

      // 1. Verify special authorization key
      if (!admin_key || admin_key !== config.adminKey) {
        return ApiResponse.error(
          res,
          'Invalid admin authorization key. You must provide the valid special key to create an administrator.',
          403
        );
      }

      // 2. Strong password validation check
      if (!password || typeof password !== 'string' || password.length < 8) {
        return ApiResponse.error(res, 'Password must be at least 8 characters long.', 400);
      }
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;
      if (!strongPasswordRegex.test(password)) {
        return ApiResponse.error(
          res,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&* etc.).',
          400
        );
      }

      // 3. Check existing phone or NIC
      const existing = await db.query(
        'SELECT id FROM users WHERE phone = $1 OR (nic IS NOT NULL AND nic = $2)',
        [phone, nic]
      );
      if (existing && existing.rows && existing.rows.length > 0) {
        return ApiResponse.error(res, 'A user with this phone number or NIC already exists.', 400);
      }

      // 4. Resolve name parts & full_name
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
      if (resolvedFirst && resolvedLast) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      } else if (!resolvedFull && resolvedFirst) {
        resolvedFull = formatFullName(resolvedFirst, resolvedMiddle, resolvedLast);
      }
      if (!resolvedFull) {
        resolvedFull = 'System Administrator';
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO users (
          first_name, middle_name, last_name, full_name,
          phone, nic, email, password_hash, role,
          district, division, gnd_division,
          verification_status, is_verified, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ADMIN', 'Badulla', 'Bandarawela', 'Central', 'APPROVED', TRUE, TRUE)
        RETURNING id, first_name, middle_name, last_name, full_name, phone, nic, email, role,
                  district, division, verification_status, is_verified, created_at`,
        [
          resolvedFirst, resolvedMiddle, resolvedLast, resolvedFull,
          phone, nic || null, email || null, password_hash
        ]
      );

      const newAdmin = result.rows[0];

      // Record in audit log
      try {
        await db.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
           VALUES ($1, 'ADMIN_CREATED', 'USER', $2, $3)`,
          [
            req.user ? req.user.id : newAdmin.id,
            newAdmin.id,
            JSON.stringify({
              created_by: req.user ? req.user.id : 'SUPER_ADMIN_INIT',
              admin_phone: phone,
              created_at: new Date().toISOString()
            })
          ]
        );
      } catch (auditErr) {
        console.warn('Audit log write error:', auditErr.message);
      }

      return ApiResponse.success(res, { admin: newAdmin }, 'New administrator account created successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { nic, phone, identifier, password, role } = req.body;
      const userIdent = (nic || identifier || phone || '').trim();

      const result = await db.query(
        'SELECT * FROM users WHERE (nic IS NOT NULL AND LOWER(nic) = LOWER($1)) OR phone = $1',
        [userIdent]
      );
      if (!result || !result.rows || result.rows.length === 0) {
        return ApiResponse.error(res, 'Invalid NIC number or password.', 401);
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
        return ApiResponse.error(res, 'Invalid NIC number or password.', 401);
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

      // Dynamic role assumption for Admin / Superuser
      const isSuperUser = user.role === 'ADMIN';
      let effectiveRole = user.role;
      if (isSuperUser) {
        // If an Admin logs in through the Office portal (or default/Admin), they retain full ADMIN access!
        // If they explicitly chose FARMER or BUYER tabs, they assume that role for view testing.
        if (role === 'FARMER' || role === 'BUYER') {
          effectiveRole = role.toUpperCase();
        } else {
          // For OFFICER, ADMIN, or default: retain full ADMIN authority
          effectiveRole = 'ADMIN';
        }
      }

      const expiresIn = (effectiveRole === 'OFFICER' || effectiveRole === 'ADMIN')
        ? config.jwt.officerExpiresIn
        : config.jwt.farmerExpiresIn;

      const token = jwt.sign(
        {
          id: user.id,
          role: effectiveRole,
          original_role: user.role,
          is_admin: isSuperUser,
          phone: user.phone,
          district: user.district,
          division: user.division
        },
        config.jwt.secret,
        { expiresIn }
      );

      delete user.password_hash;
      user.role = effectiveRole;
      user.original_role = isSuperUser ? 'ADMIN' : user.role;
      user.is_admin = isSuperUser;
      user.can_switch_roles = isSuperUser;

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
           business_name, business_type, profile_photo_url, verification_status, is_verified,
           last_profile_update_at, pending_profile_updates, profile_update_status, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );
      if (result.rows.length === 0) return ApiResponse.error(res, 'User not found', 404);
      
      let userProfile = result.rows[0];

      // If user is a farmer and has pending profile updates, merge pending values for their self view
      if (userProfile.role === 'FARMER' && userProfile.profile_update_status === 'PENDING' && userProfile.pending_profile_updates) {
        const pending = typeof userProfile.pending_profile_updates === 'string'
          ? JSON.parse(userProfile.pending_profile_updates)
          : userProfile.pending_profile_updates;

        userProfile = {
          ...userProfile,
          full_name: pending.full_name || userProfile.full_name,
          first_name: pending.first_name || userProfile.first_name,
          middle_name: pending.middle_name || userProfile.middle_name,
          last_name: pending.last_name || userProfile.last_name,
          gnd_division: pending.gnd_division || userProfile.gnd_division,
          total_land_size: pending.total_land_size !== undefined ? pending.total_land_size : userProfile.total_land_size,
          address_line1: pending.address_line1 || userProfile.address_line1,
          address_line2: pending.address_line2 || userProfile.address_line2,
          city: pending.city || userProfile.city,
          postal_code: pending.postal_code || userProfile.postal_code,
          address: pending.address || userProfile.address,
          has_pending_profile_updates: true,
          pending_profile_details: pending
        };
      }

      return ApiResponse.success(res, userProfile, 'User profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const {
        first_name, middle_name, last_name, full_name,
        email, language_preference,
        gnd_division, total_land_size,
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

      // Special handling for FARMER:
      // 1) 2-Week cooldown rule
      // 2) Pending divisional officer approval
      if (req.user.role === 'FARMER') {
        if (current.last_profile_update_at) {
          const lastUpdate = new Date(current.last_profile_update_at).getTime();
          const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
          const timeSince = Date.now() - lastUpdate;
          if (timeSince < twoWeeksMs) {
            const daysRemaining = Math.ceil((twoWeeksMs - timeSince) / (24 * 60 * 60 * 1000));
            const availableDate = new Date(lastUpdate + twoWeeksMs).toLocaleDateString();
            return ApiResponse.error(
              res,
              `Farmers can only update profile details once every 2 weeks to ensure agrarian registry integrity. You can make your next update in ${daysRemaining} day(s) on ${availableDate}.`,
              429
            );
          }
        }

        const pendingUpdates = {
          first_name: resolvedFirst,
          middle_name: resolvedMiddle,
          last_name: resolvedLast,
          full_name: resolvedFull,
          gnd_division: gnd_division !== undefined ? gnd_division : current.gnd_division,
          total_land_size: total_land_size !== undefined ? parseFloat(total_land_size) : current.total_land_size,
          address_line1: resolvedAddr1,
          address_line2: resolvedAddr2,
          city: resolvedCity,
          postal_code: resolvedPostal,
          address: resolvedAddr,
          requested_at: new Date().toISOString(),
          previous_values: {
            full_name: current.full_name,
            gnd_division: current.gnd_division,
            total_land_size: current.total_land_size,
            address: current.address
          }
        };

        const updateRes = await db.query(
          `UPDATE users
           SET pending_profile_updates = $1,
               profile_update_status = 'PENDING',
               last_profile_update_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
           RETURNING id, first_name, middle_name, last_name, full_name, phone, nic, email, role,
                     language_preference, district, division, gnd_division,
                     address_line1, address_line2, city, postal_code, address,
                     latitude, longitude, total_land_size, preferred_search_radius,
                     business_name, business_type, profile_photo_url, verification_status, is_verified,
                     last_profile_update_at, pending_profile_updates, profile_update_status`,
          [JSON.stringify(pendingUpdates), req.user.id]
        );

        const updatedUser = updateRes.rows[0];
        const selfView = {
          ...updatedUser,
          ...pendingUpdates,
          has_pending_profile_updates: true,
          pending_profile_details: pendingUpdates
        };

        return ApiResponse.success(
          res,
          selfView,
          'Profile changes submitted successfully! Changes are visible on your personal account and will be reviewed by the Divisional Agrarian Officer.'
        );
      }

      // Non-farmer roles (or officers/admins): update directly
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
             gnd_division = COALESCE($16, gnd_division),
             total_land_size = COALESCE($17, total_land_size),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $18
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
          profile_photo_url, gnd_division, total_land_size ? parseFloat(total_land_size) : null,
          req.user.id
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
      await db.query(
        'UPDATE users SET fcm_token = $1 WHERE id = $2',
        [fcm_token, req.user.id]
      );
      return ApiResponse.success(res, null, 'FCM token updated');
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return ApiResponse.error(res, 'Current password and new password are required', 400);
      }

      const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      if (userRes.rows.length === 0) return ApiResponse.error(res, 'User not found', 404);
      
      const user = userRes.rows[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Incorrect current password', 401);
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

      return ApiResponse.success(res, null, 'Password updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
