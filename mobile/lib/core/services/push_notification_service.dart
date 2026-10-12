import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/notice_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import 'api_service.dart';

class PushNotificationService {
  static String? _fcmToken;
  static bool _isInitialized = false;

  static String? get fcmToken => _fcmToken;
  static bool get isInitialized => _isInitialized;

  /// Initialize Push Notification service & register FCM token with backend
  static Future<void> initialize() async {
    if (_isInitialized) return;

    // Generate/retrieve persistent demo device token for Bandarawela farmer
    final randomSuffix = Random().nextInt(999999).toString().padLeft(6, '0');
    _fcmToken = 'fcm_asvanna_bandarawela_$randomSuffix';

    try {
      await ApiService.registerDeviceToken(_fcmToken!);
      _isInitialized = true;
    } catch (_) {
      _isInitialized = true;
    }
  }

  /// Display a high-contrast in-app Push Notification Banner matching Asvanna design
  static void showPushAlertBanner(
    BuildContext context, {
    required String title,
    required String message,
    NoticePriority priority = NoticePriority.urgent,
    String category = 'Crop Directive',
    VoidCallback? onTap,
  }) {
    HapticFeedback.heavyImpact();

    final isDark = context.isDarkMode;
    Color headerBg = const Color(0xFFDC2626); // Critical Red
    IconData icon = Icons.warning_amber_rounded;

    if (priority == NoticePriority.high) {
      headerBg = const Color(0xFFD97706); // Amber
      icon = Icons.info_outline_rounded;
    } else if (priority == NoticePriority.medium || priority == NoticePriority.low) {
      headerBg = const Color(0xFF16A34A); // Asvanna Green
      icon = Icons.notifications_active_rounded;
    }

    final overlay = Overlay.of(context);
    late OverlayEntry overlayEntry;

    overlayEntry = OverlayEntry(
      builder: (ctx) => Positioned(
        top: MediaQuery.of(ctx).padding.top + 10,
        left: 14,
        right: 14,
        child: Material(
          color: Colors.transparent,
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: -50.0, end: 0.0),
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeOutBack,
            builder: (context, value, child) {
              return Transform.translate(
                offset: Offset(0, value),
                child: child,
              );
            },
            child: GestureDetector(
              onTap: () {
                overlayEntry.remove();
                if (onTap != null) onTap();
              },
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: headerBg.withValues(alpha: 0.4), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: headerBg.withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Top banner header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: headerBg,
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                      ),
                      child: Row(
                        children: [
                          Icon(icon, color: Colors.white, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'ASVANNA PUSH ALERT • $category'.toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const Text(
                            'Just now',
                            style: TextStyle(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    // Content
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: headerBg.withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.campaign_rounded, color: headerBg, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: GoogleFonts.poppins(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  message,
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: isDark ? const Color(0xFFCBD5E1) : AppColors.textSecondary,
                                    height: 1.3,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);

    // Auto dismiss after 4.5 seconds
    Future.delayed(const Duration(milliseconds: 4500), () {
      if (overlayEntry.mounted) {
        overlayEntry.remove();
      }
    });
  }
}
