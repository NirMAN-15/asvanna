const NotificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
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
