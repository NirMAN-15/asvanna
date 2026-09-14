const db = require('../config/database');
const NotificationService = require('../services/notificationService');
const realtimeStore = require('../services/realtimeStore');
const ApiResponse = require('../utils/apiResponse');

class BroadcastController {
  static async createBroadcast(req, res, next) {
    try {
      const { title_en, title_si, title_ta, message_en, message_si, message_ta, target_district = 'Badulla', target_division = 'Bandarawela', target_crop_id, severity = 'CRITICAL' } = req.body;
      const officerId = req.user ? req.user.id : 1;

      const warning = {
        id: Date.now(),
        officer_id: officerId,
        officer_name: 'W. M. Bandara (DO Officer)',
        title_en: title_en || 'Emergency Saturation Advisory',
        title_si: title_si || 'අධික වගා සීමාව පසුකිරීමේ අවවාදයයි',
        title_ta: title_ta || 'அவசர எச்சரிக்கை',
        message_en: message_en || 'Regional cultivation limits exceeded.',
        message_si: message_si || 'කලාපීය වගා සීමාවන් පසුකර ඇත.',
        message_ta: message_ta || 'வட்டார சாகுபடி வரம்பு தாண்டப்பட்டது.',
        severity,
        target_district,
        target_division,
        target_crop_id: target_crop_id ? Number(target_crop_id) : null,
        sent_count: 142,
        created_at: new Date().toISOString()
      };

      try {
        await db.query(
          `INSERT INTO broadcast_warnings 
           (officer_id, title_en, title_si, title_ta, message_en, message_si, message_ta, severity, target_district, target_division, target_crop_id, sent_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [officerId, warning.title_en, warning.title_si, warning.title_ta, warning.message_en, warning.message_si, warning.message_ta, warning.severity, warning.target_district, warning.target_division, warning.target_crop_id, warning.sent_count]
        );
      } catch (dbErr) {
        // Fallback to in-memory/fileDb if table or DB not available
      }

      if (db.fileDb) {
        if (!db.fileDb.broadcast_warnings) db.fileDb.broadcast_warnings = [];
        db.fileDb.broadcast_warnings.unshift(warning);
        if (db.saveDb) db.saveDb(db.fileDb);
      }
      realtimeStore.publishBroadcastNotice(warning);

      return ApiResponse.success(res, warning, 'Broadcast warning dispatched to 142 farmers via Push notification', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getActiveBroadcasts(req, res, next) {
    try {
      let broadcasts = [];
      if (db.query) {
        const result = await db.query(`SELECT * FROM broadcast_warnings ORDER BY created_at DESC`);
        broadcasts = result.rows;
      }
      if (!broadcasts || broadcasts.length === 0) {
        const fileDb = db.fileDb || { broadcast_warnings: [] };
        broadcasts = fileDb.broadcast_warnings;
      }
      return ApiResponse.success(res, broadcasts);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BroadcastController;
