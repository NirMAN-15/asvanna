import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_state_provider.dart';
import '../../core/localization/app_translations.dart';
import 'screens/farmer_dashboard_screen.dart';
import 'screens/pre_planting_risk_screen.dart';
import 'screens/price_trends_screen.dart';
import 'screens/planting_entry_screen.dart';
import 'screens/farmer_profile_screen.dart';

class FarmerMainNav extends StatefulWidget {
  final int initialIndex;
  const FarmerMainNav({super.key, this.initialIndex = 0});

  @override
  State<FarmerMainNav> createState() => _FarmerMainNavState();
}

class _FarmerMainNavState extends State<FarmerMainNav> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    FarmerDashboardScreen(),
    PrePlantingRiskScreen(),
    PriceTrendsScreen(),
    FarmerProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  void _onItemTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _onAddTapped() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: context.navBarBg,
          border: Border(
            top: BorderSide(
              color: isDark ? const Color(0xFF334155) : Colors.grey.withOpacity(0.12),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.3) : Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(
                      index: 0,
                      label: tr('nav_home'),
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home_rounded,
                      isActive: _currentIndex == 0,
                      isDark: isDark,
                    ),
                    _buildNavItem(
                      index: 1,
                      label: tr('nav_search'),
                      icon: Icons.search_rounded,
                      activeIcon: Icons.search_rounded,
                      isActive: _currentIndex == 1,
                      isDark: isDark,
                    ),
                    _buildCenterAddButton(),
                    _buildNavItem(
                      index: 2,
                      label: tr('nav_market'),
                      icon: Icons.storefront_outlined,
                      activeIcon: Icons.storefront_rounded,
                      isActive: _currentIndex == 2,
                      isDark: isDark,
                    ),
                    _buildNavItem(
                      index: 3,
                      label: tr('nav_profile'),
                      icon: Icons.person_outline_rounded,
                      activeIcon: Icons.person_rounded,
                      isActive: _currentIndex == 3,
                      isDark: isDark,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              // Home Indicator Bar
              Center(
                child: Container(
                  width: 134,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : Colors.black26,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData icon,
    required IconData activeIcon,
    required bool isActive,
    required bool isDark,
  }) {
    final activeColor = isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen;
    final inactiveColor = isDark ? const Color(0xFF94A3B8) : AppColors.dashHeaderDate;

    return InkWell(
      onTap: () => _onItemTapped(index),
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive ? activeColor : inactiveColor,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCenterAddButton() {
    return GestureDetector(
      onTap: _onAddTapped,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppColors.asvannaButtonGreen,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.asvannaButtonGreen.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.add,
            color: Colors.white,
            size: 26,
          ),
        ),
      ),
    );
  }
}
