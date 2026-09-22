import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/notice_model.dart';
import '../../../core/localization/app_translations.dart';
import 'crop_detail_screen.dart';
import 'farm_land_map_screen.dart';
import 'pre_planting_risk_screen.dart';
import 'weather_screen.dart';
import 'notice_board_screen.dart';
import 'farmer_profile_screen.dart';
import 'planting_entry_screen.dart';
import 'price_trends_screen.dart';
import '../widgets/post_surplus_modal.dart';

class FarmerDashboardScreen extends StatefulWidget {
  const FarmerDashboardScreen({super.key});

  @override
  State<FarmerDashboardScreen> createState() => _FarmerDashboardScreenState();
}

class _FarmerDashboardScreenState extends State<FarmerDashboardScreen> {
  String _cropFilter = 'all'; // 'all', 'at_risk', 'safe'

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final farmer = appState.farmerProfile;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    // Identify which of the farmer's planted crops have active risk
    final List<Map<String, dynamic>> atRiskPlantings = [];
    final List<Map<String, dynamic>> safePlantings = [];

    for (final planting in farmer.activePlantings) {
      final risk = appState.getRiskForCrop(planting.cropId);
      final isCritical = risk != null && risk.riskLevel == CropRiskLevel.critical;
      final isModerate = risk != null && risk.riskLevel == CropRiskLevel.moderate;

      // Fallback heuristics for demo crops
      final nameLower = planting.cropName.toLowerCase();
      final hasGlutRisk = isCritical || (risk == null && nameLower.contains('leek'));
      final hasModerateRisk = isModerate || (risk == null && nameLower.contains('carrot'));

      if (hasGlutRisk || hasModerateRisk) {
        atRiskPlantings.add({
          'planting': planting,
          'risk': risk,
          'isCritical': hasGlutRisk,
        });
      } else {
        safePlantings.add({
          'planting': planting,
          'risk': risk,
          'isCritical': false,
        });
      }
    }

    final int riskAlertsCount = atRiskPlantings.length;
    final bool hasRedAlert = riskAlertsCount > 0 ||
        appState.notices.any((n) => n.priority == NoticePriority.urgent || n.priority == NoticePriority.high);

    final String formattedDate = DateFormat('EEEE, d MMM yyyy').format(DateTime.now());

    // Filter crops based on selected chip
    List<PlantedCropEntry> displayedPlantings = farmer.activePlantings;
    if (_cropFilter == 'at_risk') {
      displayedPlantings = atRiskPlantings.map((e) => e['planting'] as PlantedCropEntry).toList();
    } else if (_cropFilter == 'safe') {
      displayedPlantings = safePlantings.map((e) => e['planting'] as PlantedCropEntry).toList();
    }

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.asvannaButtonGreen,
          onRefresh: () async {
            await appState.syncOfflineQueue();
            await Future.delayed(const Duration(milliseconds: 300));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Clean Top Header (Profile Avatar & Greeting on left, Notification Bell on right)
                _buildTopGreetingHeader(context, farmer.fullName, formattedDate, hasRedAlert, tr),
                const SizedBox(height: 14),

                // 2. Localized Agro-Weather Intelligence Card
                _buildAgroWeatherCard(context, tr),
                const SizedBox(height: 16),

                // 3. 2x2 High-Contrast Big Action Grid (Age 30-50 Farmer Friendly)
                _buildBigActionGrid(context, tr),
                const SizedBox(height: 22),

                // 5. "My Planted Crops" Section Header with Filter Chips & Risk Status
                _buildCurrentCropsHeader(
                  context: context,
                  totalCount: farmer.activePlantings.length,
                  atRiskCount: atRiskPlantings.length,
                  safeCount: safePlantings.length,
                  tr: tr,
                ),
                const SizedBox(height: 12),

                // 6. Active Crops List / Grid Cards with detailed Risk Status
                _buildCurrentCropsList(context, appState, displayedPlantings, tr),
                const SizedBox(height: 20),

                // 7. Farmland Acreage Utilization Card
                _buildLandUtilizationCard(context, farmer, tr),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // 1. Top Greeting Header: Farmer Avatar + Greeting on Left, Bell on Right
  Widget _buildTopGreetingHeader(
    BuildContext context,
    String fullName,
    String dateText,
    bool hasRedAlert,
    String Function(String) tr,
  ) {
    final firstName = fullName.trim().isEmpty ? 'Nirman' : fullName.split(' ').first;
    final greetingText = '${tr('greeting')}, $firstName';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left side: Farmer Profile Avatar + Greeting & Date
        Expanded(
          child: Row(
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FarmerProfileScreen()),
                  );
                },
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.asvannaButtonGreen.withOpacity(0.35), width: 2),
                    image: const DecorationImage(
                      image: NetworkImage(
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                      ),
                      fit: BoxFit.cover,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      greetingText,
                      style: GoogleFonts.poppins(
                        fontSize: 18.5,
                        fontWeight: FontWeight.w700,
                        color: context.titleText,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateText,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: context.subText,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),

        // Right side: Notification bell button with red alert indicator
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NoticeBoardScreen()),
            );
          },
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: hasRedAlert ? const Color(0xFFFEE2E2) : context.cardBg,
              shape: BoxShape.circle,
              border: Border.all(
                color: hasRedAlert ? const Color(0xFFFCA5A5) : context.cardBorder,
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: (hasRedAlert ? AppColors.dashAlertRed : Colors.black).withOpacity(0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(
                  hasRedAlert ? Icons.notifications_active_rounded : Icons.notifications_outlined,
                  color: hasRedAlert ? AppColors.dashAlertRed : context.titleText,
                  size: 22,
                ),
                if (hasRedAlert)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: AppColors.dashAlertRed,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 2. Agro-Weather Intelligence Card
  Widget _buildAgroWeatherCard(BuildContext context, String Function(String) tr) {
    final isDark = context.isDarkMode;
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const WeatherScreen()),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: context.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('agro_weather_title'),
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: context.subText,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '21°C',
                          style: GoogleFonts.poppins(
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            color: context.titleText,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Bandarawela',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF374151),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Text('🌧️', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 5),
                        Text(
                          tr('rain_prob_label'),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E3A2B) : const Color(0xFFF0FDF4),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark ? const Color(0xFF2E5E43) : const Color(0xFFDCFCE7),
                      width: 1.5,
                    ),
                  ),
                  child: const Center(
                    child: Text('⛅', style: TextStyle(fontSize: 26)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: context.softGreenBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Text('🌱', style: TextStyle(fontSize: 13)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      tr('soil_advisory_text'),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 16,
                    color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 3. 2x2 Big High-Contrast Action Grid (Age 30-50 Friendly)
  Widget _buildBigActionGrid(BuildContext context, String Function(String) tr) {
    return Column(
      children: [
        Row(
          children: [
            // Card 1: Add Planting
            Expanded(
              child: _buildBigActionButton(
                context: context,
                icon: Icons.eco_rounded,
                title: tr('add_planting_btn'),
                subtitle: 'Add Planting',
                bgGradient: const LinearGradient(
                  colors: [Color(0xFF155437), Color(0xFF1B6B46)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                iconBg: Colors.white.withOpacity(0.18),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),

            // Card 2: Safe Crops (Risk Engine)
            Expanded(
              child: _buildBigActionButton(
                context: context,
                icon: Icons.shield_rounded,
                title: tr('safe_crops_btn'),
                subtitle: 'Safe Crops',
                bgGradient: const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF10B981)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                iconBg: Colors.white.withOpacity(0.18),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
                  );
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            // Card 3: Sell Surplus
            Expanded(
              child: _buildBigActionButton(
                context: context,
                icon: Icons.shopping_basket_rounded,
                title: tr('sell_surplus_btn'),
                subtitle: 'Sell Surplus',
                bgGradient: const LinearGradient(
                  colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                iconBg: Colors.white.withOpacity(0.18),
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => const PostSurplusModal(),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),

            // Card 4: Market Prices
            Expanded(
              child: _buildBigActionButton(
                context: context,
                icon: Icons.local_offer_rounded,
                title: tr('market_prices_btn'),
                subtitle: 'Market Prices',
                bgGradient: const LinearGradient(
                  colors: [Color(0xFF0D9488), Color(0xFF14B8A6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                iconBg: Colors.white.withOpacity(0.18),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PriceTrendsScreen()),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBigActionButton({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required Gradient bgGradient,
    required Color iconBg,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: 114,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          gradient: bgGradient,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.1,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withOpacity(0.88),
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

  // 5. Section Header with Filter Chips: My Planted Crops
  Widget _buildCurrentCropsHeader({
    required BuildContext context,
    required int totalCount,
    required int atRiskCount,
    required int safeCount,
    required String Function(String) tr,
  }) {
    final isDark = context.isDarkMode;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '${tr('my_current_crops')} ($totalCount)',
                style: GoogleFonts.poppins(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w700,
                  color: context.titleText,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
                );
              },
              child: Text(
                tr('manage'),
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Filter Chips Row (All | At Risk | Safe)
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip(
                context: context,
                label: '${tr('filter_all')} ($totalCount)',
                value: 'all',
                isSelected: _cropFilter == 'all',
                activeBg: isDark ? const Color(0xFF334155) : AppColors.dashHeaderTitle,
                activeText: Colors.white,
              ),
              const SizedBox(width: 8),
              _buildFilterChip(
                context: context,
                label: '⚠️ ${tr('filter_at_risk')} ($atRiskCount)',
                value: 'at_risk',
                isSelected: _cropFilter == 'at_risk',
                activeBg: const Color(0xFFDC2626),
                activeText: Colors.white,
                badgeDotColor: AppColors.dashAlertRed,
              ),
              const SizedBox(width: 8),
              _buildFilterChip(
                context: context,
                label: '✅ ${tr('filter_safe')} ($safeCount)',
                value: 'safe',
                isSelected: _cropFilter == 'safe',
                activeBg: AppColors.primary,
                activeText: Colors.white,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip({
    required BuildContext context,
    required String label,
    required String value,
    required bool isSelected,
    required Color activeBg,
    required Color activeText,
    Color? badgeDotColor,
  }) {
    final isDark = context.isDarkMode;
    return InkWell(
      onTap: () {
        setState(() {
          _cropFilter = value;
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeBg : context.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? activeBg : context.cardBorder,
            width: 1.2,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? activeText : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF4B5563)),
          ),
        ),
      ),
    );
  }

  // 6. List of Planted Crop Cards with prominent Risk Indicators
  Widget _buildCurrentCropsList(
    BuildContext context,
    AppStateProvider appState,
    List<PlantedCropEntry> plantings,
    String Function(String) tr,
  ) {
    if (plantings.isEmpty) {
      return Container(
        height: 110,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: context.cardBorder),
        ),
        child: Center(
          child: Text(
            tr('no_active_crops'),
            style: GoogleFonts.inter(color: context.subText),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: plantings.map((p) {
          final risk = appState.getRiskForCrop(p.cropId);
          return Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: _buildCropCard(context, appState, p, risk, tr),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCropCard(
    BuildContext context,
    AppStateProvider appState,
    PlantedCropEntry planting,
    dynamic risk,
    String Function(String) tr,
  ) {
    final isDark = context.isDarkMode;
    Color pillBg = isDark ? const Color(0xFF143E23) : AppColors.dashPillGreenBg;
    Color pillTextColor = isDark ? const Color(0xFF86EFAC) : AppColors.dashSafeText;
    Color borderColor = context.cardBorder;
    String badgeText = tr('safe_badge');
    String riskSubNote = 'Market Demand Healthy';
    String emoji = planting.cropEmoji.isNotEmpty ? planting.cropEmoji : '🌱';

    final nameLower = planting.cropName.toLowerCase();
    if (emoji == '🌱') {
      if (nameLower.contains('carrot')) emoji = '🥕';
      else if (nameLower.contains('leek')) emoji = '🥬';
      else if (nameLower.contains('beet')) emoji = '🟣';
      else if (nameLower.contains('cabbage')) emoji = '🥗';
      else if (nameLower.contains('potato')) emoji = '🥔';
      else if (nameLower.contains('tomato')) emoji = '🍅';
      else if (nameLower.contains('capsicum') || nameLower.contains('pepper')) emoji = '🫑';
      else if (nameLower.contains('bean')) emoji = '🫘';
    }

    if (risk != null) {
      if (risk.riskLevel == CropRiskLevel.critical) {
        pillBg = isDark ? const Color(0xFF450A0A) : AppColors.dashPillRedBg;
        pillTextColor = isDark ? const Color(0xFFFCA5A5) : AppColors.dashAlertRed;
        borderColor = const Color(0xFFFCA5A5);
        badgeText = tr('overplanted_badge');
        riskSubNote = '⚠️ ${risk.priceDropRiskPercentage.toStringAsFixed(0)}% Price Drop Risk';
      } else if (risk.riskLevel == CropRiskLevel.moderate) {
        pillBg = isDark ? const Color(0xFF451A03) : AppColors.dashPillAmberBg;
        pillTextColor = isDark ? const Color(0xFFFCD34D) : AppColors.dashCautionText;
        borderColor = const Color(0xFFFCD34D);
        badgeText = tr('caution_badge');
        riskSubNote = '⚡ ${risk.saturationPercentage.toStringAsFixed(0)}% Quota Saturated';
      }
    } else {
      if (nameLower.contains('leek')) {
        pillBg = isDark ? const Color(0xFF450A0A) : AppColors.dashPillRedBg;
        pillTextColor = isDark ? const Color(0xFFFCA5A5) : AppColors.dashAlertRed;
        borderColor = const Color(0xFFFCA5A5);
        badgeText = tr('overplanted_badge');
        riskSubNote = '⚠️ Over-Planted Glut Risk';
      } else if (nameLower.contains('carrot')) {
        pillBg = isDark ? const Color(0xFF451A03) : AppColors.dashPillAmberBg;
        pillTextColor = isDark ? const Color(0xFFFCD34D) : AppColors.dashCautionText;
        borderColor = const Color(0xFFFCD34D);
        badgeText = tr('caution_badge');
        riskSubNote = '⚡ Approaching Saturation';
      }
    }

    return InkWell(
      onTap: () {
        final matchedCrop = appState.availableCrops.firstWhere(
          (c) => c.id == planting.cropId,
          orElse: () => appState.availableCrops.first,
        );
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CropDetailScreen(crop: matchedCrop),
          ),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 165,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor, width: 1.4),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Emoji and Status Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(emoji, style: const TextStyle(fontSize: 28)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: pillBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    badgeText,
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: pillTextColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Crop Name & Acreage
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  planting.cropName,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: context.titleText,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${planting.allocatedAcres.toStringAsFixed(1)} ${tr('acre_unit')}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: context.subText,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${planting.daysRemaining} ${tr('days_to_harvest')}',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: context.subText,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Risk Sub-Note & Progress Bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: planting.growthProgress,
                    minHeight: 5,
                    backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      badgeText == tr('safe_badge')
                          ? AppColors.primary
                          : (badgeText == tr('caution_badge')
                              ? AppColors.dashCautionAmber
                              : AppColors.dashAlertRed),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  riskSubNote,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: pillTextColor,
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

  // 7. Farmland Utilization Card
  Widget _buildLandUtilizationCard(BuildContext context, dynamic farmer, String Function(String) tr) {
    final isDark = context.isDarkMode;
    final used = farmer.usedAcres;
    final total = farmer.totalLandAcres;
    final percent = farmer.landUtilizationPercentage / 100.0;

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const FarmLandMapScreen()),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: context.cardBorder),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      tr('land_usage'),
                      style: GoogleFonts.poppins(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                        color: context.titleText,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(
                      Icons.map_outlined,
                      size: 15,
                      color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: context.softGreenBg,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '${(percent * 100).toStringAsFixed(0)}% ${tr('utilized')}',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: percent,
                minHeight: 8,
                backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE8EFE8),
                valueColor: AlwaysStoppedAnimation<Color>(
                  isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem(context, tr('total_land'), '$total ${tr('acre_unit')}', Icons.landscape_outlined),
                _buildStatItem(context, tr('cultivated_label'), '${used.toStringAsFixed(1)} ${tr('acre_unit')}', Icons.eco_outlined),
                _buildStatItem(context, tr('available_land'), '${farmer.availableAcres.toStringAsFixed(1)} ${tr('acre_unit')}', Icons.check_circle_outline),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: context.subText),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.inter(fontSize: 10.5, color: context.subText),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
      ],
    );
  }
}

