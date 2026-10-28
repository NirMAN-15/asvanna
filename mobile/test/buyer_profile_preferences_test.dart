import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:asvanna_app/core/providers/app_state_provider.dart';
import 'package:asvanna_app/core/models/buyer_preferences_model.dart';
import 'package:asvanna_app/features/buyer/screens/buyer_profile_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Buyer Preferences & Models Unit Tests', () {
    test('ProcurementPreferences defaults and serialization', () {
      final defaultPrefs = ProcurementPreferences.defaultPreferences();
      expect(defaultPrefs.weeklyCapacityKg, 1500.0);
      expect(defaultPrefs.maxRadiusKm, 5.0);
      expect(defaultPrefs.preferredCrops.contains('Carrot'), isTrue);

      final json = defaultPrefs.toJson();
      final fromJson = ProcurementPreferences.fromJson(json);

      expect(fromJson.weeklyCapacityKg, defaultPrefs.weeklyCapacityKg);
      expect(fromJson.maxRadiusKm, defaultPrefs.maxRadiusKm);
      expect(fromJson.preferredCrops, defaultPrefs.preferredCrops);
      expect(fromJson.frequency, defaultPrefs.frequency);
    });

    test('NotificationSettingsModel defaults and serialization', () {
      final defaultSettings = NotificationSettingsModel.defaultSettings();
      expect(defaultSettings.surplusAlerts5km, isTrue);
      expect(defaultSettings.orderStatusAlerts, isTrue);
      expect(defaultSettings.priceAlerts, isTrue);

      final json = defaultSettings.toJson();
      final fromJson = NotificationSettingsModel.fromJson(json);

      expect(fromJson.surplusAlerts5km, isTrue);
      expect(fromJson.orderStatusAlerts, isTrue);
    });
  });

  group('BuyerProfileScreen Menu Items Tests', () {
    testWidgets('BuyerProfileScreen renders updated menu items and removes obsolete ones', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));

      await tester.pumpWidget(
        ChangeNotifierProvider<AppStateProvider>(
          create: (_) => AppStateProvider(),
          child: const MaterialApp(
            home: BuyerProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // 1. Verify updated items are present
      expect(find.text('Language'), findsOneWidget);
      expect(find.text('Procurement Preferences'), findsOneWidget);
      expect(find.text('Notification System'), findsOneWidget);
      expect(find.text('Change Password'), findsOneWidget);
      expect(find.text('Dark Mode'), findsOneWidget);
      expect(find.text('Terms & Privacy'), findsOneWidget);
      expect(find.text('Logout'), findsOneWidget);

      // 2. Verify obsolete items are removed
      expect(find.text('Favorite Products'), findsNothing);
      expect(find.text('Order History'), findsNothing);
      expect(find.text('Messages'), findsNothing);
    });

    testWidgets('Tapping Change Password opens modal with password input fields', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));

      await tester.pumpWidget(
        ChangeNotifierProvider<AppStateProvider>(
          create: (_) => AppStateProvider(),
          child: const MaterialApp(
            home: BuyerProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Change Password
      final changePasswordItem = find.text('Change Password');
      expect(changePasswordItem, findsOneWidget);
      await tester.tap(changePasswordItem);
      await tester.pumpAndSettle();

      // Verify dialog is opened with fields
      expect(find.text('Current Password'), findsOneWidget);
      expect(find.text('New Password'), findsOneWidget);
      expect(find.text('Confirm New Password'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);

      // Close dialog
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
    });

    testWidgets('Tapping Procurement Preferences opens bottom sheet', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));

      await tester.pumpWidget(
        ChangeNotifierProvider<AppStateProvider>(
          create: (_) => AppStateProvider(),
          child: const MaterialApp(
            home: BuyerProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Procurement Preferences
      final procurementItem = find.text('Procurement Preferences');
      await tester.ensureVisible(procurementItem);
      expect(procurementItem, findsOneWidget);
      await tester.tap(procurementItem);
      await tester.pumpAndSettle();

      // Verify sheet contents
      expect(find.text('Preferred Crop Categories'), findsOneWidget);
      expect(find.text('Save Preferences / සුරකින්න'), findsOneWidget);
    });

    testWidgets('Tapping Notification System opens bottom sheet with tabs', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(430, 932));

      await tester.pumpWidget(
        ChangeNotifierProvider<AppStateProvider>(
          create: (_) => AppStateProvider(),
          child: const MaterialApp(
            home: BuyerProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final notifItem = find.text('Notification System');
      await tester.ensureVisible(notifItem);
      expect(notifItem, findsOneWidget);
      await tester.tap(notifItem);
      await tester.pumpAndSettle();

      expect(find.text('Alert Preferences'), findsOneWidget);
    });
  });
}
