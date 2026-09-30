import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/localization/app_translations.dart';
import 'weather_screen.dart';
import 'pre_planting_risk_screen.dart';
import 'planting_entry_screen.dart';
import 'price_trends_screen.dart';
import 'farmer_profile_screen.dart';
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
    final isDark = context.isDarkMode;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Select Language / භාෂාව / மொழி',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: context.titleText,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Text('🇱🇰', style: TextStyle(fontSize: 22)),
              title: Text(
                'සිංහල (Sinhala)',
                style: GoogleFonts.inter(color: context.titleText, fontWeight: FontWeight.w600),
              ),
              trailing: appState.currentLanguage == AppLanguage.sinhala
                  ? Icon(Icons.check_circle, color: isDark ? const Color(0xFF4ADE80) : AppColors.primary)
                  : null,
              onTap: () {
                appState.setLanguage(AppLanguage.sinhala);
                Navigator.pop(context);
              },
            ),
            Divider(color: context.dividerColor),
            ListTile(
              leading: const Text('🇬🇧', style: TextStyle(fontSize: 22)),
              title: Text(
                'English',
                style: GoogleFonts.inter(color: context.titleText, fontWeight: FontWeight.w600),
              ),
              trailing: appState.currentLanguage == AppLanguage.english
                  ? Icon(Icons.check_circle, color: isDark ? const Color(0xFF4ADE80) : AppColors.primary)
                  : null,
              onTap: () {
                appState.setLanguage(AppLanguage.english);
                Navigator.pop(context);
              },
            ),
            Divider(color: context.dividerColor),
            ListTile(
              leading: const Text('🇱🇰', style: TextStyle(fontSize: 22)),
              title: Text(
                'தமிழ் (Tamil)',
                style: GoogleFonts.inter(color: context.titleText, fontWeight: FontWeight.w600),
              ),
              trailing: appState.currentLanguage == AppLanguage.tamil
                  ? Icon(Icons.check_circle, color: isDark ? const Color(0xFF4ADE80) : AppColors.primary)
                  : null,
              onTap: () {
                appState.setLanguage(AppLanguage.tamil);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final farmer = appState.farmerProfile;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);
    final isDark = context.isDarkMode;

    final greetingText = _getDynamicGreeting(tr);
    final rawFarmerName = farmer.fullName.trim();
    final farmerName = rawFarmerName.isNotEmpty ? rawFarmerName : 'Nirman Senanayake';

    String langLabel = 'සිංහල';
    if (lang == AppLanguage.english) langLabel = 'English';
    if (lang == AppLanguage.tamil) langLabel = 'தமிழ்';

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: Stack(
          children: [
            // 1. LAYER 1: CLEARLY VISIBLE GROWING PLANT SPROUT IN BACKGROUND
            Positioned.fill(
              child: IgnorePointer(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Plant Sprout Artwork Image
                    Positioned(
                      bottom: -20,
                      child: Opacity(
                        opacity: isDark ? 0.28 : 0.42,
                        child: Image.network(
                          'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=800&auto=format&fit=crop&q=85',
                          width: 320,
                          height: 380,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                        ),
                      ),
                    ),
                    // Ambient Light Gradient Overlay
                    Container(
                      decoration: BoxDecoration(
                        gradient: RadialGradient(
                          center: const Alignment(0.0, 0.4),
                          radius: 0.9,
                          colors: [
                            (isDark ? const Color(0xFF0B1120) : const Color(0xFFF4F9F4)).withValues(alpha: 0.2),
                            isDark ? const Color(0xFF0B1120) : const Color(0xFFF4F9F4),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 2. LAYER 2: FOREGROUND CONTENT (Translucent Frosted Cards)
            LayoutBuilder(
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
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Top Section: Header & Attractive Weather Widget
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // 1. Top Header: Avatar + Dynamic Greeting & Name + Language
                                _buildTopHeader(context, appState, greetingText, farmerName, langLabel),
                                const SizedBox(height: 12),

                                // 2. Attractive, Glanceable Agro-Weather Widget
                                _buildAttractiveWeatherWidget(context, appState, tr),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // 3. THE 4 EXPANDED ACTION CARDS WITH EMBEDDED IMAGES (2x2 Grid)
                            _build2x2ActionGrid(
                              context: context,
                              tr: tr,
                            ),
                            const SizedBox(height: 6),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // 1. Top Header: Avatar + Greeting & Name + Language Button
  Widget _buildTopHeader(
    BuildContext context,
    AppStateProvider appState,
    String greeting,
    String farmerName,
    String langLabel,
  ) {
    final isDark = context.isDarkMode;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Profile Avatar with online status dot
        GestureDetector(
          onTap: () {
            if (onTabSelected != null) {
              onTabSelected!(3); // Switch to Profile tab
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FarmerProfileScreen()),
              );
            }
          },
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.asvannaButtonGreen.withValues(alpha: 0.35),
                    width: 2,
                  ),
                  image: const DecorationImage(
                    image: NetworkImage(
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                    ),
                    fit: BoxFit.cover,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              ),
              Positioned(
                bottom: 1,
                right: 1,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFF16A34A),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark ? const Color(0xFF0B1120) : Colors.white,
                      width: 2,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),

        // Greeting & Farmer Name
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                greeting,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: context.subText,
                  letterSpacing: -0.1,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                farmerName,
                style: GoogleFonts.poppins(
                  fontSize: 17.5,
                  fontWeight: FontWeight.w700,
                  color: context.titleText,
                  letterSpacing: -0.3,
                  height: 1.2,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),

        // Language Selector Pill
        GestureDetector(
          onTap: () => _showLanguageDialog(context, appState),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.85) : Colors.white.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.cardBorder.withValues(alpha: 0.8), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  langLabel,
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: context.titleText,
                  ),
                ),
                const SizedBox(width: 2),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 15,
                  color: context.subText,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 2. Attractive, Glanceable Agro-Weather Widget (Frosted Glass with highlighted condition & rain probability)
  Widget _buildAttractiveWeatherWidget(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
  ) {
    final isDark = context.isDarkMode;
    final weather = appState.currentWeather;
    final current = weather?.current;
    final locationName = weather?.location.name ?? appState.selectedWeatherDivision;
    final tempStr = current?.temp ?? '21°C';
    final emojiStr = current?.emoji ?? '⛅';
    final conditionStr = current?.condition ?? 'Scattered Showers';
    final rainProbStr = current?.rainProb ?? '75%';
    final advisoryText = (weather != null && weather.diseases.isNotEmpty)
        ? weather.diseases.first.advice
        : 'Rain forecast around 4 PM • Optimal soil moisture';

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const WeatherScreen()),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.85) : Colors.white.withValues(alpha: 0.88),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? const Color(0xFF0369A1).withValues(alpha: 0.4) : const Color(0xFFBAE6FD).withValues(alpha: 0.8),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.2) : const Color(0xFF0284C7).withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Row: Weather Icon + Temp & Location + Condition & Rain Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Left: Weather Icon & Temp Info
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0C4A6E).withValues(alpha: 0.5) : const Color(0xFFF0F9FF),
                          borderRadius: BorderRadius.circular(13),
                          border: Border.all(
                            color: isDark ? const Color(0xFF0369A1).withValues(alpha: 0.5) : const Color(0xFFE0F2FE),
                            width: 1,
                          ),
                        ),
                        child: Center(
                          child: Text(emojiStr, style: const TextStyle(fontSize: 22)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.baseline,
                              textBaseline: TextBaseline.alphabetic,
                              children: [
                                Text(
                                  tempStr,
                                  style: GoogleFonts.poppins(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: context.titleText,
                                    height: 1.0,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    locationName,
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: context.subText,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              conditionStr,
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7),
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
                const SizedBox(width: 8),

                // Right: Highlighted Rain Probability Pill
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0284C7),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0284C7).withValues(alpha: 0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('💧', style: TextStyle(fontSize: 10)),
                          const SizedBox(width: 3),
                          Text(
                            '$rainProbStr Rain',
                            style: GoogleFonts.inter(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'High probability',
                      style: GoogleFonts.inter(
                        fontSize: 9,
                        fontWeight: FontWeight.w500,
                        color: context.subText,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Bottom Micro-Advisory Strip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: context.softGreenBg.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Text('🌱', style: TextStyle(fontSize: 12)),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      advisoryText,
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w500,
                        color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.chevron_right_rounded,
                    size: 14,
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

  // 3. 2x2 Grid of Main Action Cards with Embedded Images & Translucent Surfaces
  Widget _build2x2ActionGrid({
    required BuildContext context,
    required String Function(String) tr,
  }) {
    return Column(
      children: [
        // Row 1: Crop status (Top Left) & Plant new crop (Top Right)
        Row(
          children: [
            // Card 1: Crop status
            Expanded(
              child: _buildImageActionCard(
                context: context,
                title: tr('crop_status'),
                imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),

            // Card 2: Plant new crop
            Expanded(
              child: _buildImageActionCard(
                context: context,
                title: tr('plant_new_crop'),
                imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
                isPrimaryEmphasis: true,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
                  );
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 2: Sell surplus (Bottom Left) & Market price (Bottom Right)
        Row(
          children: [
            // Card 3: Sell surplus
            Expanded(
              child: _buildImageActionCard(
                context: context,
                title: tr('sell_surplus'),
                imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
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

            // Card 4: Market price
            Expanded(
              child: _buildImageActionCard(
                context: context,
                title: tr('market_price'),
                imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80',
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

  // Single Grid Action Card Widget with Embedded Image & Frosted Translucent Surface
  Widget _buildImageActionCard({
    required BuildContext context,
    required String title,
    required String imageUrl,
    required VoidCallback onTap,
    bool isPrimaryEmphasis = false,
  }) {
    final isDark = context.isDarkMode;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        height: 180,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.88) : Colors.white.withValues(alpha: 0.90),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: isPrimaryEmphasis
                ? AppColors.asvannaButtonGreen.withValues(alpha: isDark ? 0.7 : 0.45)
                : (isDark ? const Color(0xFF334155).withValues(alpha: 0.8) : const Color(0xFFD1FAE5).withValues(alpha: 0.8)),
            width: isPrimaryEmphasis ? 1.6 : 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Image Area
            Expanded(
              flex: 7,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        child: const Center(
                          child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.asvannaButtonGreen),
                          ),
                        ),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE8F5E9),
                        child: Center(
                          child: Icon(
                            Icons.image_outlined,
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                            size: 30,
                          ),
                        ),
                      );
                    },
                  ),
                  // Gentle gradient overlay for high contrast
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.black12, Colors.transparent, Colors.black26],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Content Area (Centralized Title)
            Expanded(
              flex: 3,
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                child: Text(
                  title,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: context.titleText,
                    letterSpacing: -0.2,
                    height: 1.15,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
