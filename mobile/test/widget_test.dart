import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:asvanna_app/core/providers/app_state_provider.dart';
import 'package:asvanna_app/main.dart';

void main() {
  testWidgets('AsvannaApp root smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppStateProvider(),
        child: const AsvannaApp(),
      ),
    );
    expect(find.byType(AsvannaApp), findsOneWidget);
  });
}
