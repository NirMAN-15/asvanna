import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/app_state_provider.dart';
import '../../core/localization/app_translations.dart';
import 'farmer_registration_screen.dart';
import 'buyer_registration_screen.dart';
import '../farmer/farmer_main_nav.dart';
import '../buyer/buyer_main_nav.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(
          'Select Language / භාෂාව / மொழி',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Text('🇬🇧', style: TextStyle(fontSize: 22)),
              title: const Text('English'),
              trailing: appState.currentLanguage == AppLanguage.english
                  ? const Icon(Icons.check_circle, color: AppColors.primary)
                  : null,
              onTap: () {
                appState.setLanguage(AppLanguage.english);
                Navigator.pop(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Text('🇱🇰', style: TextStyle(fontSize: 22)),
              title: const Text('සිංහල (Sinhala)'),
              trailing: appState.currentLanguage == AppLanguage.sinhala
                  ? const Icon(Icons.check_circle, color: AppColors.primary)
                  : null,
              onTap: () {
                appState.setLanguage(AppLanguage.sinhala);
                Navigator.pop(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Text('🇱🇰', style: TextStyle(fontSize: 22)),
              title: const Text('தமிழ் (Tamil)'),
              trailing: appState.currentLanguage == AppLanguage.tamil
                  ? const Icon(Icons.check_circle, color: AppColors.primary)
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
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      body: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFFE8F5E9),
                Color(0xFFF6F8F6),
              ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top language switch button
                Align(
                  alignment: Alignment.topRight,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      backgroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFC8E6C9)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    icon: const Icon(Icons.language, size: 16, color: AppColors.primaryDark),
                    label: Text(
                      lang == AppLanguage.english
                          ? 'English'
                          : lang == AppLanguage.sinhala
                              ? 'සිංහල'
                              : 'தமிழ்',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    onPressed: () => _showLanguageDialog(context, appState),
                  ),
                ),
                const SizedBox(height: 10),

                // Logo & Header
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.15),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Text(
                      '🌾',
                      style: TextStyle(fontSize: 48),
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
                      color: AppColors.primaryDark,
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
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      tr('pilot_zone'),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
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
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 14),

                // Role Card 1: Farmer
                _RoleCard(
                  title: tr('farmer_role'),
                  subtitle: tr('farmer_role_desc'),
                  iconEmoji: '🧑‍🌾',
                  badgeColor: AppColors.primary,
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
                  badgeColor: AppColors.accent,
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
                        'New Farmer Registration',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ),
                    const Text('•', style: TextStyle(color: AppColors.textMuted)),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const BuyerRegistrationScreen()),
                        );
                      },
                      child: Text(
                        'Buyer Onboarding',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          color: AppColors.accent,
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2EBE2), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
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
                color: badgeColor.withOpacity(0.1),
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
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              size: 16,
              color: AppColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
