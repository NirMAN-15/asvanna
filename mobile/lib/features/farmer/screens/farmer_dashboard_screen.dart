import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import '../../../core/widgets/language_selection_dialog.dart';
import 'weather_screen.dart';
import 'pre_planting_risk_screen.dart';
import 'planting_entry_screen.dart';
import 'price_trends_screen.dart';
import '../widgets/post_surplus_modal.dart';

class FarmerDashboardScreen extends StatelessWidget {
  final void Function(int tabIndex)? onTabSelected;

  const FarmerDashboardScreen({super.key, this.onTabSelected});

  String _getDynamicGreeting(String Function(String) tr) {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return tr('greeting_morning');
    } else if (hour < 17) {
      return tr('greeting_afternoon');
    } else {
      return tr('greeting_evening');
    }
  }

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showLanguageSelectionDialog(context, appState);
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final farmer = appState.farmerProfile;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final greetingText = _getDynamicGreeting(tr);
    final rawFarmerName = farmer.fullName.trim();
    final farmerName = rawFarmerName.isNotEmpty ? rawFarmerName : 'Nirman Senanayake';
    final firstName = farmerName.split(' ').first;
    final farmerDistrict = appState.selectedWeatherDivision.trim().isNotEmpty
        ? appState.selectedWeatherDivision.trim()
        : 'Anuradhapura';

    String langLabel = 'සිංහල';
    if (lang == AppLanguage.english) langLabel = 'English';
    if (lang == AppLanguage.tamil) langLabel = 'தமிழ்';

    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return RefreshIndicator(
              color: AppColors.asvannaButtonGreen,
              onRefresh: () async {
                await appState.syncOfflineQueue();
                await Future.delayed(const Duration(milliseconds: 300));
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── 1. HEADER BAR ──
                      _buildHeaderBar(context, appState, langLabel),

                      // ── Content ──
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 16),

                            // ── 2. GREETING + PROFILE AVATAR ──
                            _buildGreetingSection(context, greetingText, firstName, farmerName, farmerDistrict, isDark),
                            const SizedBox(height: 16),

                            // ── 3. WEATHER CARD ──
                            _buildWeatherCard(context, appState, tr, isDark),
                            const SizedBox(height: 16),

                            // ── 4. QUICK STATS ROW ──
                            _buildQuickStatsRow(context, appState, tr, isDark),
                            const SizedBox(height: 16),

                            // ── 5. QUICK ACTIONS GRID ──
                            _buildQuickActionsGrid(context, tr, isDark),
                            const SizedBox(height: 24),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════
  // 1. HEADER BAR
  // ══════════════════════════════════════════════
  Widget _buildHeaderBar(
    BuildContext context,
    AppStateProvider appState,
    String langLabel,
  ) {
    final isDark = context.isDarkMode;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark
                ? const Color(0xFF1E293B)
                : const Color(0xFFE8F0E8),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/aswanna_logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.asvannaButtonGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.eco_rounded, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Aswenna',
                style: GoogleFonts.poppins(
                  fontSize: 21,
                  fontWeight: FontWeight.w800,
                  color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                  letterSpacing: -0.5,
                  height: 1.0,
                ),
              ),
            ],
          ),
          const Spacer(),
          GestureDetector(
            onTap: () => _showLanguageDialog(context, appState),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF1E293B)
                    : const Color(0xFFF1F5F1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFD4E6D4),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    langLabel,
                    style: appState.currentLanguage == AppLanguage.tamil
                        ? GoogleFonts.notoSansTamil(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: context.titleText,
                          )
                        : (appState.currentLanguage == AppLanguage.sinhala
                            ? GoogleFonts.notoSansSinhala(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: context.titleText,
                              )
                            : GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: context.titleText,
                              )),
                  ),
                  const SizedBox(width: 3),
                  Icon(
                    Icons.keyboard_arrow_down_rounded,
                    size: 16,
                    color: context.subText,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  // 2. GREETING + PROFILE AVATAR
  // ══════════════════════════════════════════════
  Widget _buildGreetingSection(
    BuildContext context,
    String greeting,
    String firstName,
    String fullName,
    String district,
    bool isDark,
  ) {
    final initial = firstName.isNotEmpty ? firstName[0].toUpperCase() : 'F';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$greeting 👋',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: context.subText,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                firstName,
                style: GoogleFonts.poppins(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: context.titleText,
                  letterSpacing: -0.5,
                  height: 1.15,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    size: 14,
                    color: context.subText,
                  ),
                  const SizedBox(width: 3),
                  Text(
                    district,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: context.subText,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Profile Avatar
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF34D399), Color(0xFF059669)],
            ),
            border: Border.all(
              color: isDark
                  ? const Color(0xFF6EE7B7).withValues(alpha: 0.3)
                  : const Color(0xFFA7F3D0),
              width: 2.5,
            ),
          ),
          child: Center(
            child: Text(
              initial,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ══════════════════════════════════════════════
  // 3. WEATHER CARD — Gradient Glass Design
  // ══════════════════════════════════════════════
  Widget _buildWeatherCard(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
    bool isDark,
  ) {
    final weather = appState.currentWeather;
    final current = weather?.current;
    final locationName = weather?.location.name ?? appState.selectedWeatherDivision;
    final tempStr = current?.temp ?? '29°C';
    final emojiStr = current?.emoji ?? '⛅';
    final conditionStr = current?.condition ?? 'Scattered Clouds';
    final rainProbStr = current?.rainProb ?? '75%';
    final advisoryText = (weather != null && weather.diseases.isNotEmpty)
        ? weather.diseases.first.advice
        : 'Rain expected at 4 PM • Good for irrigation';

    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => const WeatherScreen()));
      },
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? [const Color(0xFF0C4A6E), const Color(0xFF075985)]
                : [const Color(0xFF0369A1), const Color(0xFF0EA5E9)],
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0284C7).withValues(alpha: isDark ? 0.3 : 0.2),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Decorative circles
            Positioned(
              right: -20,
              top: -20,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              right: 30,
              bottom: -15,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.04),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Top row: emoji + temp + rain badge
                  Row(
                    children: [
                      Text(emojiStr, style: const TextStyle(fontSize: 44)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tempStr,
                              style: GoogleFonts.poppins(
                                fontSize: 30,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                height: 1.0,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              conditionStr,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFFBAE6FD),
                              ),
                            ),
                            Text(
                              locationName,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.white.withValues(alpha: 0.6),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Rain badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('💧', style: TextStyle(fontSize: 12)),
                            const SizedBox(width: 4),
                            Text(
                              rainProbStr,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Advisory strip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Text('🌱', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            advisoryText,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFFE0F2FE),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.chevron_right_rounded,
                          size: 16,
                          color: Color(0xFFBAE6FD),
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
    );
  }

  // ══════════════════════════════════════════════
  // 4. QUICK STATS ROW — 3 Chips
  // ══════════════════════════════════════════════
  Widget _buildQuickStatsRow(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
    bool isDark,
  ) {
    final cropsCount = appState.farmerProfile.activePlantings.length;
    final ordersCount = appState.pendingOrdersCount;
    final noticesCount = appState.unreadNoticesCount;

    return Row(
      children: [
        Expanded(
          child: _buildStatChip(
            context: context,
            emoji: '🌾',
            count: cropsCount,
            label: tr('nav_my_crops'),
            isDark: isDark,
            onTap: () => onTabSelected?.call(1),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatChip(
            context: context,
            emoji: '📦',
            count: ordersCount,
            label: tr('nav_orders'),
            isDark: isDark,
            onTap: () => onTabSelected?.call(2),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatChip(
            context: context,
            emoji: '🔔',
            count: noticesCount,
            label: 'Notices',
            isDark: isDark,
            onTap: () => onTabSelected?.call(3),
          ),
        ),
      ],
    );
  }

  Widget _buildStatChip({
    required BuildContext context,
    required String emoji,
    required int count,
    required String label,
    required bool isDark,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.15 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: context.titleText,
              ),
            ),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: context.subText,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════
  // 5. QUICK ACTIONS — Icon-based 2×2 Grid
  // ══════════════════════════════════════════════
  Widget _buildQuickActionsGrid(
    BuildContext context,
    String Function(String) tr,
    bool isDark,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: context.titleText,
          ),
        ),
        const SizedBox(height: 12),

        Row(
          children: [
            // Crop Risk — Dark green card
            Expanded(
              child: _buildActionCard(
                context: context,
                icon: Icons.analytics_outlined,
                title: tr('crop_status'),
                subtitle: 'Check before planting',
                isDark: isDark,
                isHero: true,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Plant Crop — Bordered accent card
            Expanded(
              child: _buildActionCard(
                context: context,
                icon: Icons.add_circle_outline_rounded,
                title: tr('plant_new_crop'),
                subtitle: 'Register new planting',
                isDark: isDark,
                isPrimary: true,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Sell Surplus
            Expanded(
              child: _buildActionCard(
                context: context,
                icon: Icons.storefront_outlined,
                title: tr('sell_surplus'),
                subtitle: '5km marketplace',
                isDark: isDark,
                iconColor: const Color(0xFFF59E0B),
                iconBg: isDark ? const Color(0xFF3D2E0A) : const Color(0xFFFFFBEB),
                onTap: () => showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => const PostSurplusModal(),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Market Prices
            Expanded(
              child: _buildActionCard(
                context: context,
                icon: Icons.trending_up_rounded,
                title: tr('market_price'),
                subtitle: 'HARTI daily rates',
                isDark: isDark,
                iconColor: const Color(0xFF3B82F6),
                iconBg: isDark ? const Color(0xFF1E3A5F) : const Color(0xFFEFF6FF),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PriceTrendsScreen()),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required VoidCallback onTap,
    bool isHero = false,
    bool isPrimary = false,
    Color? iconColor,
    Color? iconBg,
  }) {
    final bgColor = isHero
        ? (isDark ? const Color(0xFF0D3320) : const Color(0xFF064E3B))
        : (isDark ? const Color(0xFF1E293B) : Colors.white);

    final textColor = isHero
        ? Colors.white
        : context.titleText;

    final subColor = isHero
        ? Colors.white.withValues(alpha: 0.6)
        : context.subText;

    final defaultIconColor = isHero
        ? const Color(0xFF6EE7B7)
        : (isDark ? const Color(0xFF4ADE80) : const Color(0xFF059669));

    final defaultIconBg = isHero
        ? Colors.white.withValues(alpha: 0.12)
        : (isDark ? const Color(0xFF143E23) : const Color(0xFFECFDF5));

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 130,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
          border: isPrimary
              ? Border.all(
                  color: isDark ? const Color(0xFF22C55E) : const Color(0xFF10B981),
                  width: 2,
                )
              : (isHero
                  ? null
                  : Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      width: 1,
                    )),
          boxShadow: [
            BoxShadow(
              color: isHero
                  ? const Color(0xFF064E3B).withValues(alpha: 0.3)
                  : Colors.black.withValues(alpha: isDark ? 0.15 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          children: [
            if (isHero)
              Positioned(
                right: -10,
                bottom: -10,
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.05),
                  ),
                ),
              ),

            if (isPrimary)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF22C55E) : const Color(0xFF10B981),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'NEW',
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),

            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: iconBg ?? defaultIconBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    size: 22,
                    color: iconColor ?? defaultIconColor,
                  ),
                ),
                const Spacer(),
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: subColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
