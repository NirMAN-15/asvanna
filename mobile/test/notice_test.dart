import 'package:flutter_test/flutter_test.dart';
import 'package:asvanna_app/core/models/notice_model.dart';
import 'package:asvanna_app/core/services/mock_data_service.dart';
import 'package:asvanna_app/core/services/push_notification_service.dart';

void main() {
  group('Agrarian Notice & Notification Push Tests', () {
    test('Mock notices load properly with required fields and priorities', () {
      final notices = MockDataService.getAgrarianNotices();
      expect(notices.isNotEmpty, true);
      expect(notices.any((n) => n.priority == NoticePriority.urgent), true);
      expect(notices.any((n) => n.priority == NoticePriority.high), true);
      expect(notices.first.title.isNotEmpty, true);
      expect(notices.first.department.isNotEmpty, true);
    });

    test('AgrarianNotice parses multi-lingual JSON in English, Sinhala, Tamil', () {
      final jsonPayload = {
        'id': 'notice_101',
        'title': 'Leeks Over-production Warning',
        'title_en': 'Leeks Over-production Warning',
        'title_si': 'ලීක්ස් අතිරික්ත අනතුරු ඇඟවීම',
        'title_ta': 'லீக்ஸ் அதிக உற்பத்தி எச்சரிக்கை',
        'description': 'Pause planting Leeks due to regional quota completion.',
        'description_en': 'Pause planting Leeks due to regional quota completion.',
        'description_si': 'බණ්ඩාරවෙල කලාපයේ ලීක්ස් වගාව තාවකාලිකව නවත්වන්න.',
        'description_ta': 'பண்டாரவளையில் லீக்ஸ் பயிரிடுவதை தற்காலிகமாக நிறுத்துங்கள்.',
        'priority': 'urgent',
        'category': 'Crop Directive',
        'department': 'Department of Agrarian Development',
        'issued_by': 'Bandarawela Agrarian Services Centre',
        'date': '2026-09-24T06:00:00.000Z',
        'is_official': true,
      };

      // 1. English
      final noticeEn = AgrarianNotice.fromJson(jsonPayload, lang: 'en');
      expect(noticeEn.id, 'notice_101');
      expect(noticeEn.title, 'Leeks Over-production Warning');
      expect(noticeEn.description, contains('Pause planting Leeks'));
      expect(noticeEn.priority, NoticePriority.urgent);
      expect(noticeEn.category, 'Crop Directive');
      expect(noticeEn.isOfficial, true);

      // 2. Sinhala
      final noticeSi = AgrarianNotice.fromJson(jsonPayload, lang: 'si');
      expect(noticeSi.title, 'ලීක්ස් අතිරික්ත අනතුරු ඇඟවීම');
      expect(noticeSi.description, contains('බණ්ඩාරවෙල කලාපයේ'));

      // 3. Tamil
      final noticeTa = AgrarianNotice.fromJson(jsonPayload, lang: 'ta');
      expect(noticeTa.title, 'லீக்ஸ் அதிக உற்பத்தி எச்சரிக்கை');
      expect(noticeTa.description, contains('பண்டாரவளையில்'));
    });

    test('Notice priority and severity fallback mapping', () {
      final criticalJson = {
        'id': 'n1',
        'title': 'Critical Alert',
        'severity': 'CRITICAL',
        'body': 'Emergency alert',
      };
      final criticalNotice = AgrarianNotice.fromJson(criticalJson);
      expect(criticalNotice.priority, NoticePriority.urgent);

      final highJson = {
        'id': 'n2',
        'title': 'High Advisory',
        'priority': 'HIGH',
      };
      final highNotice = AgrarianNotice.fromJson(highJson);
      expect(highNotice.priority, NoticePriority.high);

      final lowJson = {
        'id': 'n3',
        'title': 'Low Advisory',
        'priority': 'LOW',
      };
      final lowNotice = AgrarianNotice.fromJson(lowJson);
      expect(lowNotice.priority, NoticePriority.low);
    });

    test('AppNotification deserializes delivered and read payloads', () {
      final notifJson = {
        'id': 'notif_001',
        'title': 'Emergency Alert',
        'body': 'Urgent notice dispatched',
        'notification_type': 'BROADCAST',
        'status': 'DELIVERED',
        'created_at': '2026-09-24T07:00:00.000Z',
      };

      final notif = AppNotification.fromJson(notifJson);
      expect(notif.id, 'notif_001');
      expect(notif.title, 'Emergency Alert');
      expect(notif.type, 'BROADCAST');
      expect(notif.isRead, false);
      expect(notif.status, 'DELIVERED');
    });

    test('PushNotificationService initializes with demo device token', () async {
      await PushNotificationService.initialize();
      expect(PushNotificationService.isInitialized, true);
      expect(PushNotificationService.fcmToken, isNotNull);
      expect(PushNotificationService.fcmToken!.startsWith('fcm_asvanna_bandarawela_'), true);
    });
  });
}
