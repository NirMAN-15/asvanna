import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'farm_land_map_screen.dart';
import '../widgets/presentation_demo_panel.dart';
import '../../auth/login_screen.dart';

class FarmerProfileScreen extends StatelessWidget {
  const FarmerProfileScreen({super.key});

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
    final farmer = appState.farmerProfile;

    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Farmer Profile',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: AppColors.dashHeaderTitle,
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            tooltip: 'University Demo Showcase',
            icon: const Icon(Icons.auto_awesome_rounded, color: AppColors.goldAccent),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                builder: (_) => const PresentationDemoPanel(),
              );
            },
          ),
          IconButton(
            tooltip: 'Log Out',
            icon: const Icon(Icons.logout_rounded, color: AppColors.primary),
            onPressed: () {
              appState.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.farmer)),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.asvannaButtonGreen, width: 2.5),
                          image: const DecorationImage(
                            image: NetworkImage(
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                            ),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: AppColors.dashSafeGreen,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, size: 12, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    farmer.fullName,
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.dashHeaderTitle,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${farmer.gndDivision}, ${farmer.agrarianDivision}',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.dashHeaderDate,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_rounded, size: 15, color: AppColors.asvannaButtonGreen),
                        const SizedBox(width: 6),
                        Text(
                          'Verified Agrarian Registered Farmer',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.asvannaButtonGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Farmland Statistics Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Farmland Holdings',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.dashHeaderTitle,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const FarmLandMapScreen()),
                          );
                        },
                        child: Text(
                          'View Map',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            color: AppColors.asvannaButtonGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildHoldingItem(
                          'Total Land',
                          '${farmer.totalLandAcres.toStringAsFixed(1)} Ac',
                          Icons.landscape_outlined,
                          AppColors.asvannaButtonGreen,
                        ),
                      ),
                      Expanded(
                        child: _buildHoldingItem(
                          'Cultivated',
                          '${farmer.usedAcres.toStringAsFixed(1)} Ac',
                          Icons.eco_outlined,
                          AppColors.dashSafeGreen,
                        ),
                      ),
                      Expanded(
                        child: _buildHoldingItem(
                          'Available',
                          '${farmer.availableAcres.toStringAsFixed(1)} Ac',
                          Icons.check_circle_outline,
                          AppColors.goldAccent,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Settings & Tools List
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.language_rounded, color: AppColors.asvannaButtonGreen, size: 20),
                    ),
                    title: Text(
                      'App Language',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          lang == AppLanguage.english
                              ? 'English'
                              : lang == AppLanguage.sinhala
                                  ? 'සිංහල'
                                  : 'தமிழ்',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.dashHeaderDate,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                      ],
                    ),
                    onTap: () => _showLanguageDialog(context, appState),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.auto_awesome_rounded, color: Color(0xFFD97706), size: 20),
                    ),
                    title: Text(
                      'Presentation Demo Panel',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        builder: (_) => const PresentationDemoPanel(),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.dashMetricAlertBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.logout_rounded, color: AppColors.dashAlertRed, size: 20),
                    ),
                    title: Text(
                      'Sign Out',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.dashAlertRed,
                      ),
                    ),
                    onTap: () {
                      appState.logout();
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.farmer)),
                        (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildHoldingItem(String label, String value, IconData icon, Color iconColor) {
    return Column(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.dashHeaderTitle,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: AppColors.dashHeaderDate,
          ),
        ),
      ],
    );
  }
}
