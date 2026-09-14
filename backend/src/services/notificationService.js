const { messaging } = require('../config/firebase');
const db = require('../config/database');

class NotificationService {
  /**
   * Broadcast in-app & FCM push alert to specified users (FREE, zero paid SMS)
   */
  static async sendAlert({ userIds, title, body, notificationType = 'BROADCAST', broadcastId = null, data = {} }) {
    console.log(`📢 Dispatching alert to ${userIds.length} users: "${title}"`);

    // Fetch user FCM tokens and details
    const usersRes = await db.query(
      `SELECT id, full_name, phone, fcm_token, language_preference FROM users WHERE id = ANY($1::int[])`,
      [userIds]
    );

    const fcmTokens = [];
    const logsToInsert = [];

    usersRes.rows.forEach(user => {
      if (user.fcm_token) fcmTokens.push(user.fcm_token);

      logsToInsert.push({
        userId: user.id,
        broadcastId,
        type: notificationType,
        channel: user.fcm_token ? 'FCM' : 'IN_APP',
        title,
        body,
        token: user.fcm_token || null
      });
    });

    let fcmSuccess = 0;
    let fcmFailure = 0;

    // Send via Firebase Cloud Messaging if available
    if (messaging && fcmTokens.length > 0) {
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: fcmTokens,
          notification: { title, body },
          data: {
            ...data,
            notificationType,
            timestamp: String(Date.now())
          }
        });
        fcmSuccess = response.successCount;
        fcmFailure = response.failureCount;
      } catch (err) {
        console.warn('⚠️ FCM multicast failed, falling back to In-App Notice Board archive:', err.message);
      }
    }

    // Persist all alerts into notification_logs for In-App Notice Board
    for (const log of logsToInsert) {
      try {
        await db.query(
          `INSERT INTO notification_logs (user_id, broadcast_id, notification_type, channel, title, body, status, fcm_token)
           VALUES ($1, $2, $3, $4, $5, $6, 'DELIVERED', $7)`,
          [log.userId, log.broadcastId, log.type, log.channel, log.title, log.body, log.token]
        );
      } catch (e) {
        // Non-blocking log error
      }
    }

    return {
      totalRecipients: userIds.length,
      fcmDispatched: fcmTokens.length,
      fcmSuccess,
      fcmFailure,
      inAppArchived: logsToInsert.length
    };
  }

  /**
   * Get In-App notification history for a user
   */
  static async getUserNotifications(userId, limit = 50) {
    const res = await db.query(
      `SELECT id, broadcast_id, notification_type, channel, title, body, status, attempted_at, delivered_at
       FROM notification_logs
       WHERE user_id = $1
       ORDER BY attempted_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    const res = await db.query(
      `UPDATE notification_logs
       SET status = 'READ', delivered_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return res.rows[0];
  }
}

module.exports = NotificationService;
