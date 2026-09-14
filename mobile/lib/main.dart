import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/app_state_provider.dart';
import 'features/auth/login_screen.dart';
import 'features/farmer/farmer_main_nav.dart';
import 'features/buyer/buyer_main_nav.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppStateProvider()),
      ],
      child: const AsvannaApp(),
    ),
  );
}

class AsvannaApp extends StatelessWidget {
  const AsvannaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Asvanna - The Zero-Waste Marketplace',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: Consumer<AppStateProvider>(
        builder: (context, appState, child) {
          switch (appState.currentUserRole) {
            case UserRole.farmer:
              return const FarmerMainNav();
            case UserRole.buyer:
              return const BuyerMainNav();
            case UserRole.unauthenticated:
              return const LoginScreen();
          }
        },
      ),
    );
  }
}
