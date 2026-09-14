import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:asvanna_app/core/providers/app_state_provider.dart';
import 'package:asvanna_app/features/auth/login_screen.dart';
import 'package:asvanna_app/features/auth/buyer_registration_screen.dart';
import 'package:asvanna_app/features/auth/farmer_registration_screen.dart';

Widget createTestApp(Widget child) {
  return MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => AppStateProvider()),
    ],
    child: MaterialApp(
      home: child,
    ),
  );
}

Finder findRichTextContaining(String pattern) {
  return find.byWidgetPredicate(
    (widget) => widget is RichText && widget.text.toPlainText().contains(pattern),
  );
}

void main() {
  group('Asvanna Authentication Screens UI & Flow Tests', () {
    testWidgets('LoginScreen renders header, role tabs, inputs, and action buttons', (tester) async {
      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      // Brand headers
      expect(find.text('ASVANNA'), findsOneWidget);
      expect(find.text('Unified Access Portal for Agricultural Stakeholders'), findsOneWidget);

      // 2-tab role selector
      expect(find.text('Farmer'), findsOneWidget);
      expect(find.text('Local Buyer'), findsOneWidget);

      // Form labels and placeholders
      expect(find.text('Phone Number or NIC'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Forgot?'), findsOneWidget);
      expect(find.text('Remember session (8 Hours)'), findsOneWidget);

      // Buttons and dividers
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('SECURE ACCESS'), findsOneWidget);
      expect(find.text('Login with OTP'), findsOneWidget);
      expect(findRichTextContaining('Contact Support'), findsOneWidget);
    });

    testWidgets('LoginScreen switches role tab on tap', (tester) async {
      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      // Tap on Local Buyer tab
      await tester.tap(find.text('Local Buyer'));
      await tester.pumpAndSettle();

      expect(findRichTextContaining('Register as Buyer'), findsOneWidget);

      // Tap on Farmer tab
      await tester.tap(find.text('Farmer'));
      await tester.pumpAndSettle();

      expect(findRichTextContaining('Register as Farmer'), findsOneWidget);
    });

    testWidgets('LoginScreen opens OTP sheet when Login with OTP is tapped', (tester) async {
      await tester.pumpWidget(createTestApp(const LoginScreen()));
      await tester.pumpAndSettle();

      // Tap Login with OTP button
      await tester.tap(find.text('Login with OTP'));
      await tester.pumpAndSettle();

      expect(find.text('Instant OTP Login'), findsOneWidget);
      expect(find.text('Enter 6-Digit OTP Code:'), findsOneWidget);
    });

    testWidgets('BuyerRegistrationScreen renders all form fields matching reference design', (tester) async {
      await tester.pumpWidget(createTestApp(const BuyerRegistrationScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Back'), findsOneWidget);
      expect(find.text('Become a Local Buyer'), findsOneWidget);
      expect(find.text('Fill in your business details to start sourcing.'), findsOneWidget);

      expect(find.text('Business Name'), findsOneWidget);
      expect(find.text('Buyer Category'), findsOneWidget);
      expect(find.text('Contact Person Name'), findsOneWidget);
      expect(find.text('NIC Number'), findsOneWidget);
      expect(find.text('Mobile Phone Number'), findsOneWidget);
      expect(find.text('+94'), findsOneWidget);
      expect(find.text('Delivery Address'), findsOneWidget);
      expect(find.text('Create Buyer Account'), findsOneWidget);
      expect(findRichTextContaining('Log in here'), findsOneWidget);
    });

    testWidgets('FarmerRegistrationScreen renders all form fields', (tester) async {
      await tester.pumpWidget(createTestApp(const FarmerRegistrationScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Back'), findsOneWidget);
      expect(find.text('Become a Registered Farmer'), findsOneWidget);
      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Farmland (Acres)'), findsOneWidget);
      expect(find.text('Agrarian Services Division'), findsOneWidget);
      expect(find.text('Create Farmer Account'), findsOneWidget);
      expect(findRichTextContaining('Log in here'), findsOneWidget);
    });
  });
}
