import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_state_provider.dart';
import '../../core/localization/app_translations.dart';
import 'farmer_registration_screen.dart';
import 'buyer_registration_screen.dart';
import '../farmer/farmer_main_nav.dart';
import '../buyer/buyer_main_nav.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    final isDark = context.isDarkMode;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
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
              leading: const Text('🇬🇧', style: TextStyle(fontSize: 22)),
              title: Text(
                'English',
                style: GoogleFonts.inter(color: context.titleText),
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
                'සිංහල (Sinhala)',
                style: GoogleFonts.inter(color: context.titleText),
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
              leading: const Text('🇱🇰', style: TextStyle(fontSize: 22)),
              title: Text(
                'தமிழ் (Tamil)',
                style: GoogleFonts.inter(color: context.titleText),
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
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: isDark
                  ? [
                      const Color(0xFF0F172A),
                      const Color(0xFF0B1120),
                    ]
                  : [
                      const Color(0xFFE8F5E9),
                      const Color(0xFFF6F8F6),
                    ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top controls: Dark mode toggle & language switch
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      tooltip: isDark ? 'Light Mode' : 'Dark Mode',
                      icon: Icon(
                        isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                        color: isDark ? const Color(0xFFFBBF24) : AppColors.asvannaButtonGreen,
                      ),
                      onPressed: () => appState.toggleDarkMode(),
                    ),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: context.cardBg,
                        side: BorderSide(color: context.cardBorder),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      icon: Icon(
                        Icons.language,
                        size: 16,
                        color: isDark ? const Color(0xFF4ADE80) : AppColors.primaryDark,
                      ),
                      label: Text(
                        lang == AppLanguage.english
                            ? 'English'
                            : lang == AppLanguage.sinhala
                                ? 'සිංහල'
                                : 'தமிழ்',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFF4ADE80) : AppColors.primaryDark,
                        ),
                      ),
                      onPressed: () => _showLanguageDialog(context, appState),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Official Aswenna Logo & Header
                Center(
                  child: Container(
                    width: 86,
                    height: 86,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black,
                      border: Border.all(
                        color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                        width: 3,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (isDark ? const Color(0xFF4ADE80) : AppColors.primary).withValues(alpha: 0.25),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/aswanna_logo.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(
                            child: Icon(Icons.eco, color: Colors.greenAccent, size: 46),
                          );
                        },
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Center(
                  child: Text(
                    tr('app_title'),
                    style: GoogleFonts.poppins(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.0,
                      color: isDark ? const Color(0xFF4ADE80) : AppColors.primaryDark,
                    ),
                  ),
                ),
                Center(
                  child: Text(
                    tr('app_subtitle'),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: context.subText,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: context.softGreenBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      tr('pilot_zone'),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF86EFAC) : AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const Spacer(),

                Text(
                  tr('select_role'),
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: context.titleText,
                  ),
                ),
                const SizedBox(height: 14),

                // Role Card 1: Farmer
                _RoleCard(
                  title: tr('farmer_role'),
                  subtitle: tr('farmer_role_desc'),
                  iconEmoji: '🧑‍🌾',
                  badgeColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                  onTap: () {
                    appState.setRole(UserRole.farmer);
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const FarmerMainNav()),
                    );
                  },
                ),
                const SizedBox(height: 14),

                // Role Card 2: Buyer / Caterer
                _RoleCard(
                  title: tr('buyer_role'),
                  subtitle: tr('buyer_role_desc'),
                  iconEmoji: '🏢',
                  badgeColor: isDark ? const Color(0xFF2DD4BF) : AppColors.accent,
                  onTap: () {
                    appState.setRole(UserRole.buyer);
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (_) => const BuyerMainNav()),
                    );
                  },
                ),

                const Spacer(),

                // Register Links
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const FarmerRegistrationScreen()),
                        );
                      },
                      child: Text(
                        tr('new_farmer_reg'),
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFF4ADE80) : AppColors.primaryDark,
                        ),
                      ),
                    ),
                    Text('•', style: TextStyle(color: context.mutedText)),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const BuyerRegistrationScreen()),
                        );
                      },
                      child: Text(
                        tr('buyer_onboarding'),
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFF2DD4BF) : AppColors.accent,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String iconEmoji;
  final Color badgeColor;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.iconEmoji,
    required this.badgeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: context.cardBorder, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: badgeColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                iconEmoji,
                style: const TextStyle(fontSize: 28),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: context.titleText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: context.subText,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 16,
              color: context.mutedText,
            ),
          ],
        ),
      ),
    );
  }
}

