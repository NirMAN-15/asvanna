import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_state_provider.dart';
import '../../core/localization/app_translations.dart';
import 'screens/farmer_dashboard_screen.dart';
import 'screens/pre_planting_risk_screen.dart';
import 'screens/notice_board_screen.dart';
import 'screens/farmer_profile_screen.dart';

class FarmerMainNav extends StatefulWidget {
  final int initialIndex;
  const FarmerMainNav({super.key, this.initialIndex = 0});

  @override
  State<FarmerMainNav> createState() => _FarmerMainNavState();
}

class _FarmerMainNavState extends State<FarmerMainNav> {
  late int _currentIndex;

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

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);
    final unreadCount = appState.unreadNoticesCount;

    final List<Widget> screens = [
      FarmerDashboardScreen(onTabSelected: _onItemTapped),
      const PrePlantingRiskScreen(),
      const NoticeBoardScreen(),
      const FarmerProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: context.navBarBg,
          border: Border(
            top: BorderSide(
              color: isDark ? const Color(0xFF334155) : Colors.grey.withValues(alpha: 0.12),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.3) : Colors.black.withValues(alpha: 0.04),
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
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Expanded(
                      child: _buildNavItem(
                        index: 0,
                        label: tr('nav_home'),
                        icon: Icons.home_outlined,
                        activeIcon: Icons.home_rounded,
                        isActive: _currentIndex == 0,
                        isDark: isDark,
                      ),
                    ),
                    Expanded(
                      child: _buildNavItem(
                        index: 1,
                        label: tr('nav_my_crops'),
                        icon: Icons.eco_outlined,
                        activeIcon: Icons.eco_rounded,
                        isActive: _currentIndex == 1,
                        isDark: isDark,
                      ),
                    ),
                    Expanded(
                      child: _buildNavItem(
                        index: 2,
                        label: tr('nav_notification'),
                        icon: Icons.notifications_outlined,
                        activeIcon: Icons.notifications_rounded,
                        isActive: _currentIndex == 2,
                        isDark: isDark,
                        badgeCount: unreadCount,
                      ),
                    ),
                    Expanded(
                      child: _buildNavItem(
                        index: 3,
                        label: tr('nav_profile'),
                        icon: Icons.person_outline_rounded,
                        activeIcon: Icons.person_rounded,
                        isActive: _currentIndex == 3,
                        isDark: isDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 2),
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
    int badgeCount = 0,
  }) {
    final activeColor = isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen;
    final inactiveColor = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);

    return InkWell(
      onTap: () => _onItemTapped(index),
      borderRadius: BorderRadius.circular(12),
      splashColor: activeColor.withValues(alpha: 0.1),
      highlightColor: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: isActive ? activeColor : inactiveColor,
                  size: 24,
                ),
                if (badgeCount > 0)
                  Positioned(
                    top: -3,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.dashAlertRed,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        badgeCount > 99 ? '99+' : '$badgeCount',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
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
}
