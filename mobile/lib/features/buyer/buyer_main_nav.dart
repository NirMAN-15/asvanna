import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'screens/proximity_marketplace_screen.dart';
import 'screens/order_history_screen.dart';
import '../auth/role_selection_screen.dart';

class BuyerMainNav extends StatefulWidget {
  const BuyerMainNav({super.key});

  @override
  State<BuyerMainNav> createState() => _BuyerMainNavState();
}

class _BuyerMainNavState extends State<BuyerMainNav> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ProximityMarketplaceScreen(),
    OrderHistoryScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          backgroundColor: Colors.white,
          indicatorColor: AppColors.accent.withOpacity(0.15),
          elevation: 0,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.explore_outlined),
              selectedIcon: Icon(Icons.explore, color: AppColors.accent),
              label: '5km Surplus Market',
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined),
              selectedIcon: Icon(Icons.receipt_long, color: AppColors.accent),
              label: 'My Orders & Savings',
            ),
          ],
        ),
      ),
    );
  }
}
