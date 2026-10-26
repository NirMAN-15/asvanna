const NotificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  /**
   * GET /api/v1/notifications or /api/v1/notices
   * Get all official agrarian notices & directives
   */
  static async getNotices(req, res, next) {
    try {
      const { district = 'Badulla', division = 'Bandarawela', lang = 'en', limit = 50 } = req.query;
      const notices = await NotificationService.getAgrarianNotices({
        district,
        division,
        lang,
        limit: parseInt(limit, 10)
      });
      return ApiResponse.success(res, notices, 'Agrarian notices retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/notifications/push
   * Push a new agrarian notice / emergency broadcast to farmers
   */
  static async pushAlert(req, res, next) {
    try {
      const {
        title,
        title_en,
        title_si,
        title_ta,
        description,
        description_en,
        description_si,
        description_ta,
        category = 'Crop Directive',
        priority = 'urgent',
        severity = 'CRITICAL',
        department,
        issuedBy,
        targetDistrict,
        targetDivision,
        targetCropId
      } = req.body;

      const notice = await NotificationService.pushAgrarianAlert({
        title,
        titleEn: title_en || title,
        titleSi: title_si || title,
        titleTa: title_ta || title,
        description,
        descriptionEn: description_en || description,
        descriptionSi: description_si || description,
        descriptionTa: description_ta || description,
        category,
        priority,
        severity,
        department,
        issuedBy,
        targetDistrict,
        targetDivision,
        targetCropId
      });

      return ApiResponse.success(res, notice, 'Push notification dispatched and archived to Notice Board', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/notifications/register-token
   * Register mobile device FCM token
   */
  static async registerToken(req, res, next) {
    try {
      const { fcm_token, fcmToken, token, device_info, deviceInfo } = req.body;
      const resolvedToken = fcm_token || fcmToken || token;
      const userId = req.user ? req.user.id : 2;

      const result = await NotificationService.registerDeviceToken(userId, resolvedToken, device_info || deviceInfo);
      return ApiResponse.success(res, result, 'FCM device token registered for push notifications');
    } catch (err) {
      next(err);
    }
  }

  static async getMyNotifications(req, res, next) {
    try {
      const userId = req.user ? req.user.id : 2;
      const limit = parseInt(req.query.limit, 10) || 50;
      const notifications = await NotificationService.getUserNotifications(userId, limit);
      return ApiResponse.success(res, notifications, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : 2;
      const updated = await NotificationService.markAsRead(id, userId);
      return ApiResponse.success(res, updated, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
