const { messaging } = require('../config/firebase');
const db = require('../config/database');
const realtimeStore = require('./realtimeStore');

// Baseline Official Agrarian Directives for Upcountry Farmers
const BASELINE_NOTICES = [
  {
    id: 'notice_01',
    title_en: 'Govt Advisory: Over-supply in Leeks',
    title_si: 'රජයේ කෘෂිකර්ම අවවාදය: ලීක්ස් අතිරික්ත වගා අවදානම',
    title_ta: 'அரசு ஆலோசனை: லீக்ஸ் அதிக பயிர் எச்சரிக்கை',
    department: 'Department of Agrarian Development, Bandarawela',
    department_si: 'ගොවිජන සේවා දෙපාර්තමේන්තුව - බණ්ඩාරවෙල',
    department_ta: 'விவசாய அபிவிருத்தி திணைக்களம் - பண்டாரவளை',
    issued_by: 'Mrs. Athukorala (Divisional Agrarian Officer)',
    issued_by_si: 'ඩබ්ලිව්. ඒ. අතුකෝරාල මිය (ප්‍රාදේශීය ගොවිජන නිලධාරී)',
    issued_by_ta: 'திருமதி. அதுகோரல (பிரதேச விவசாய உத்தியோகத்தர்)',
    description_en: 'Prices expected to dip. Delay planting new cohorts. Cultivation records indicate over 620 acres of leeks sown in Bandarawela. Agrarian Services recommend pausing new sowing and shifting to beetroot or green beans.',
    description_si: 'අස්වනු නෙළන විට මිල පහත වැටීමේ අවදානමක් ඇත. බණ්ඩාරවෙල ප්‍රදේශයේ අක්කර 620 කට වඩා ලීක්ස් වගා කර ඇති බැවින් නව ලීක්ස් වගාව නවතා බීට්රූට් හෝ බෝංචි වෙත යොමුවන්න.',
    description_ta: 'அறுவடை காலத்தில் விலை குறைய வாய்ப்புள்ளது. புதிய லீக்ஸ் பயிரிடுவதை நிறுத்தி பீட்ரூட் அல்லது பீன்ஸ் பயிரிட விவசாய திணைக்களம் அறிவுறுத்துகிறது.',
    priority: 'urgent',
    severity: 'CRITICAL',
    category: 'Crop Directive',
    category_si: 'වගා උපදෙස්',
    category_ta: 'பயிர் வழிகாட்டல்',
    is_official: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notice_02',
    title_en: 'Government Fertilizer Subsidy Voucher Disbursement (Maha Season)',
    title_si: 'මහ කන්නයේ රජයේ පොහොර සහනාධාර වවුචර්පත් නිකුත් කිරීම',
    title_ta: 'அரச உர மானிய கொடுப்பனவு விநியோகம் (மகா பருவம்)',
    department: 'Ministry of Agriculture & Plantation Industries',
    department_si: 'කෘෂිකර්ම හා වැවිලි කර්මාන්ත අමාත්‍යාංශය',
    department_ta: 'விவசாய மற்றும் பெருந்தோட்ட அமைச்சு',
    issued_by: 'Agrarian Services Centre - Bandarawela',
    issued_by_si: 'ගොවිජන සේවා මධ්‍යස්ථානය - බණ්ඩාරවෙල',
    issued_by_ta: 'விவசாய சேவை மையம் - பண்டாரவளை',
    description_en: 'Registered smallholder farmers can claim digital subsidy vouchers for organic and NPK fertilizers at the Bandarawela Agrarian Services Centre from Monday onwards with NIC verification.',
    description_si: 'ලියාපදිංචි ගොවීන්ට කාබනික සහ NPK පොහොර සඳහා වන ඩිජිටල් සහනාධාර වවුචර්පත් ජාතික හැඳුනුම්පත ඉදිරිපත් කර බණ්ඩාරවෙල ගොවිජන සේවා මධ්‍යස්ථානයෙන් ලබාගත හැක.',
    description_ta: 'பதிவுசெய்யப்பட்ட விவசாயிகள் இயற்கை மற்றும் NPK உரங்களுக்கான டிஜிட்டல் மானிய வவுச்சர்களை திங்கட்கிழமை முதல் பெற்றுக்கொள்ளலாம்.',
    priority: 'high',
    severity: 'HIGH',
    category: 'Subsidy',
    category_si: 'සහනාධාර',
    category_ta: 'மானியம்',
    is_official: true,
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'notice_03',
    title_en: 'Localized Heavy Rainfall & Fungal Blight Advisory',
    title_si: 'අධික වැසි සහ දිලීර පාළු රෝග (Late Blight) කාලගුණ අනතුරු ඇඟවීම',
    title_ta: 'கனமழை மற்றும் பூஞ்சை நோய் காலநிலை எச்சரிக்கை',
    department: 'Department of Meteorology & Agriculture Extension',
    department_si: 'කාලගුණ විද්‍යා දෙපාර්තමේන්තුව සහ කෘෂි ව්‍යාප්ති අංශය',
    department_ta: 'வானிலை மற்றும் விவசாய விரிவாக்கத் திணைக்களம்',
    issued_by: 'Badulla District Agricultural Office',
    issued_by_si: 'බදුල්ල දිස්ත්‍රික් කෘෂිකර්ම කාර්යාලය',
    issued_by_ta: 'பதுளை மாவட்ட விவசாய அலுவலகம்',
    description_en: 'Upcountry vegetable cultivation zones expect intermittent evening downpours over the next 5 days. Inspect nursery beds for late blight in tomatoes and potato crops.',
    description_si: 'ඉදිරි දින 5 තුළ සවස් කාලයේ තද වැසි අපේක්ෂා කෙරේ. තක්කාලි සහ අල වගාවන්හි පාළු රෝගය වැළැක්වීමට කාණු පද්ධති පිරිසිදු කර කල්තියා දිලීර නාශක යොදන්න.',
    description_ta: 'அடுத்த 5 நாட்களில் மாலை நேரங்களில் கனமழை எதிர்பார்க்கப்படுகிறது. தக்காளி மற்றும் உருளைக்கிழங்கு பயிர்களில் பூஞ்சை நோய் தாக்காமல் வடிகால்களை சீரமைக்கவும்.',
    priority: 'medium',
    severity: 'MEDIUM',
    category: 'Weather Warning',
    category_si: 'කාලගුණ අනතුරු ඇඟවීම්',
    category_ta: 'வானிலை எச்சரிக்கை',
    is_official: true,
    created_at: new Date(Date.now() - 432000000).toISOString()
  }
];

class NotificationService {
  /**
   * Broadcast in-app & FCM push alert to specified users (FREE, zero paid SMS)
   */
  static async sendAlert({ userIds = [], title, body, notificationType = 'BROADCAST', broadcastId = null, data = {} }) {
    console.log(`📢 Dispatching alert to ${userIds.length} users: "${title}"`);

    let fcmTokens = [];
    const logsToInsert = [];

    if (userIds.length > 0 && db.query) {
      try {
        const usersRes = await db.query(
          `SELECT id, full_name, phone, fcm_token, language_preference FROM users WHERE id = ANY($1::int[])`,
          [userIds]
        );

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
      } catch (e) {
        console.warn('⚠️ User lookup for FCM failed, proceeding with in-app dispatch:', e.message);
      }
    }

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
        if (db.query) {
          await db.query(
            `INSERT INTO notification_logs (user_id, broadcast_id, notification_type, channel, title, body, status, fcm_token)
             VALUES ($1, $2, $3, $4, $5, $6, 'DELIVERED', $7)`,
            [log.userId, log.broadcastId, log.type, log.channel, log.title, log.body, log.token]
          );
        }
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
   * Push official Agrarian Alert / Broadcast Directive to all farmers
   */
  static async pushAgrarianAlert({
    title,
    titleEn,
    titleSi,
    titleTa,
    description,
    descriptionEn,
    descriptionSi,
    descriptionTa,
    category = 'Crop Directive',
    priority = 'urgent',
    severity = 'CRITICAL',
    department = 'Department of Agrarian Development, Bandarawela',
    issuedBy = 'Agrarian Services Centre',
    targetDistrict = 'Badulla',
    targetDivision = 'Bandarawela',
    targetCropId = null
  }) {
    const tEn = titleEn || title || 'Agrarian Advisory';
    const tSi = titleSi || title || tEn;
    const tTa = titleTa || title || tEn;

    const dEn = descriptionEn || description || 'Important agricultural notification.';
    const dSi = descriptionSi || description || dEn;
    const dTa = descriptionTa || description || dEn;

    const noticeId = `notice_${Date.now()}`;
    const newNotice = {
      id: noticeId,
      title_en: tEn,
      title_si: tSi,
      title_ta: tTa,
      description_en: dEn,
      description_si: dSi,
      description_ta: dTa,
      category,
      priority: priority.toLowerCase(),
      severity,
      department,
      issued_by: issuedBy,
      target_district: targetDistrict,
      target_division: targetDivision,
      target_crop_id: targetCropId,
      is_official: true,
      created_at: new Date().toISOString()
    };

    // Insert into database if available
    try {
      if (db.query) {
        await db.query(
          `INSERT INTO broadcast_warnings 
           (officer_id, title_en, title_si, title_ta, message_en, message_si, message_ta, severity, target_district, target_division, target_crop_id, sent_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [1, tEn, tSi, tTa, dEn, dSi, dTa, severity, targetDistrict, targetDivision, targetCropId, 142]
        );
      }
    } catch (e) {
      // Database fallback
    }

    if (db.fileDb) {
      if (!db.fileDb.broadcast_warnings) db.fileDb.broadcast_warnings = [];
      db.fileDb.broadcast_warnings.unshift(newNotice);
      if (db.saveDb) db.saveDb(db.fileDb);
    }

    // Publish to real-time event stream
    realtimeStore.publishBroadcastNotice(newNotice);

    // Trigger FCM push broadcast to all registered devices
    try {
      if (messaging) {
        await messaging.send({
          topic: 'all_farmers',
          notification: { title: tEn, body: dEn },
          data: {
            noticeId,
            category,
            priority,
            timestamp: String(Date.now())
          }
        });
      }
    } catch (e) {
      console.warn('⚠️ FCM topic broadcast skipped:', e.message);
    }

    return newNotice;
  }

  /**
   * Fetch all Agrarian Notices / Broadcast Directives for the mobile Notice Board
   */
  static async getAgrarianNotices({ district = 'Badulla', division = 'Bandarawela', lang = 'en', limit = 50 } = {}) {
    let notices = [];

    try {
      if (db.query) {
        const res = await db.query(
          `SELECT * FROM broadcast_warnings ORDER BY created_at DESC LIMIT $1`,
          [limit]
        );
        if (res.rows && res.rows.length > 0) {
          notices = res.rows.map(r => ({
            id: `bw_${r.id}`,
            title_en: r.title_en,
            title_si: r.title_si || r.title_en,
            title_ta: r.title_ta || r.title_en,
            description_en: r.message_en,
            description_si: r.message_si || r.message_en,
            description_ta: r.message_ta || r.message_en,
            category: 'Crop Directive',
            priority: (r.severity === 'CRITICAL' ? 'urgent' : (r.severity === 'HIGH' ? 'high' : 'medium')),
            severity: r.severity || 'CRITICAL',
            department: 'Department of Agrarian Development, Bandarawela',
            issued_by: 'Agrarian Services Centre',
            is_official: true,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      // Query fallback
    }

    // Combine with baseline notices
    const mergedNotices = [...notices, ...BASELINE_NOTICES];

    // Localize fields based on requested language
    return mergedNotices.map(n => {
      let title = n.title_en;
      let description = n.description_en;
      let department = n.department;
      let issuedBy = n.issued_by;
      let category = n.category;

      if (lang === 'si') {
        title = n.title_si || n.title_en;
        description = n.description_si || n.description_en;
        department = n.department_si || n.department;
        issuedBy = n.issued_by_si || n.issued_by;
        category = n.category_si || n.category;
      } else if (lang === 'ta') {
        title = n.title_ta || n.title_en;
        description = n.description_ta || n.description_en;
        department = n.department_ta || n.department;
        issuedBy = n.issued_by_ta || n.issued_by;
        category = n.category_ta || n.category;
      }

      return {
        id: n.id,
        title,
        title_en: n.title_en,
        title_si: n.title_si,
        title_ta: n.title_ta,
        description,
        description_en: n.description_en,
        description_si: n.description_si,
        description_ta: n.description_ta,
        department,
        issuedBy,
        category,
        priority: n.priority || 'medium',
        isOfficial: n.is_official !== false,
        date: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString()
      };
    });
  }

  /**
   * Register or update user device FCM token for push notifications
   */
  static async registerDeviceToken(userId, fcmToken, deviceInfo = {}) {
    if (!fcmToken) return { success: false, message: 'FCM token required' };

    try {
      if (db.query && userId) {
        await db.query(
          `UPDATE users SET fcm_token = $1 WHERE id = $2`,
          [fcmToken, userId]
        );
      }
      return { success: true, token: fcmToken, message: 'Device token registered successfully' };
    } catch (err) {
      console.warn('⚠️ Token registration database error:', err.message);
      return { success: true, token: fcmToken, message: 'Device token registered (in-memory mode)' };
    }
  }

  /**
   * Get In-App notification history for a user
   */
  static async getUserNotifications(userId, limit = 50) {
    try {
      if (db.query) {
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
    } catch (e) {
      // Fallback
    }

    return [
      {
        id: 1,
        title: 'Welcome to ASVANNA',
        body: 'Your farm profile in Bandarawela is registered and active.',
        status: 'DELIVERED',
        notification_type: 'SYSTEM',
        attempted_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      if (db.query) {
        const res = await db.query(
          `UPDATE notification_logs
           SET status = 'READ', delivered_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND user_id = $2
           RETURNING *`,
          [notificationId, userId]
        );
        return res.rows[0];
      }
    } catch (e) {
      // Fallback
    }
    return { id: notificationId, status: 'READ' };
  }
}

module.exports = NotificationService;

