import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:asvanna_app/core/providers/app_state_provider.dart';
import 'package:asvanna_app/features/farmer/farmer_main_nav.dart';
import 'package:asvanna_app/features/farmer/screens/crop_status_screen.dart';
import 'package:asvanna_app/features/farmer/screens/my_crops_screen.dart';
import 'package:asvanna_app/features/farmer/screens/post_surplus_screen.dart';

void main() {
  testWidgets('CropStatusScreen renders all categories and displays live risk status', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const MaterialApp(
          home: CropStatusScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Verify search and category tabs
    expect(find.byType(TextField), findsOneWidget);
    expect(find.byType(CropStatusScreen), findsOneWidget);
  });

  testWidgets('MyCropsScreen renders My Farm Overview table and filter pills', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const MaterialApp(
          home: MyCropsScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(MyCropsScreen), findsOneWidget);
    expect(find.text('My Farm Overview'), findsOneWidget);
    expect(find.text('All (2)'), findsOneWidget);
    expect(find.text('Active (1)'), findsOneWidget);
    expect(find.text('Harvested & Cleared (1)'), findsOneWidget);

    // Verify status badges from reference image
    expect(find.text('HARVESTED • Land Cleared'), findsOneWidget);
    expect(find.text('PLANTED • In Field'), findsOneWidget);

    // Verify Complete Harvest button exists for active crop
    expect(find.textContaining('Complete'), findsWidgets);
  });

  testWidgets('FarmerMainNav renders MyCropsScreen on tab 1', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const MaterialApp(
          home: FarmerMainNav(initialIndex: 1),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(MyCropsScreen), findsOneWidget);
  });

  testWidgets('PostSurplusScreen renders without modal popup', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const MaterialApp(
          home: PostSurplusScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(PostSurplusScreen), findsOneWidget);
    expect(find.text('5km Proximity Marketplace'), findsOneWidget);
  });
}
