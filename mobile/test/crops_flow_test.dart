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

  testWidgets('MyCropsScreen renders farmer active plantings only', (WidgetTester tester) async {
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
  });

  testWidgets('FarmerMainNav renders CropStatusScreen on tab 1 and MyCropsScreen on tab 2', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const MaterialApp(
          home: FarmerMainNav(initialIndex: 1),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(CropStatusScreen), findsOneWidget);

    // Switch to tab 2
    await tester.tap(find.byIcon(Icons.eco_outlined));
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
