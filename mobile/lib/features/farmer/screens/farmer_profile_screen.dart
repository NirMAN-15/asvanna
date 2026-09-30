import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'farm_land_map_screen.dart';
import 'farmer_history_screen.dart';
import '../../auth/login_screen.dart';

class FarmerProfileScreen extends StatelessWidget {
  const FarmerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    final farmer = appState.farmerProfile;

    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          tr('profile_title'),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: context.titleText,
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            tooltip: tr('sign_out'),
            icon: Icon(Icons.logout_rounded, color: isDark ? const Color(0xFFFCA5A5) : AppColors.primary),
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
                color: context.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.04),
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
                          border: Border.all(
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                            width: 2.5,
                          ),
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
                      color: context.titleText,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${farmer.gndDivision}, ${farmer.agrarianDivision}',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: context.subText,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: context.softGreenBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_rounded,
                          size: 15,
                          color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                        ),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            tr('verified_farmer'),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
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
                color: context.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.04),
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
                        tr('farmland_holdings'),
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: context.titleText,
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
                          tr('view_map'),
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
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
                          context,
                          tr('total_land'),
                          '${farmer.totalLandAcres.toStringAsFixed(1)} ${tr('acre_unit')}',
                          Icons.landscape_outlined,
                          isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                        ),
                      ),
                      Expanded(
                        child: _buildHoldingItem(
                          context,
                          tr('cultivated_label'),
                          '${farmer.usedAcres.toStringAsFixed(1)} ${tr('acre_unit')}',
                          Icons.eco_outlined,
                          AppColors.dashSafeGreen,
                        ),
                      ),
                      Expanded(
                        child: _buildHoldingItem(
                          context,
                          tr('available_land'),
                          '${farmer.availableAcres.toStringAsFixed(1)} ${tr('acre_unit')}',
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
                color: context.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withOpacity(0.2) : Colors.black.withOpacity(0.04),
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
                        color: context.softGreenBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.history_rounded,
                        color: isDark ? const Color(0xFF86EFAC) : AppColors.asvannaButtonGreen,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      'Cultivation & Sales History',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: context.titleText,
                      ),
                    ),
                    subtitle: Text(
                      'Harvest records & 5km surplus sales',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: context.subText,
                      ),
                    ),
                    trailing: Icon(Icons.chevron_right_rounded, color: context.subText),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FarmerHistoryScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, color: context.dividerColor),
                  SwitchListTile(
                    secondary: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF334155) : AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                        color: isDark ? const Color(0xFFFBBF24) : AppColors.asvannaButtonGreen,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      'Dark Mode / අඳුරු තේමාව',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: context.titleText,
                      ),
                    ),
                    subtitle: Text(
                      isDark ? 'Dark theme active' : 'Light theme active',
                      style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                    ),
                    value: isDark,
                    activeThumbColor: const Color(0xFF4ADE80),
                    onChanged: (val) {
                      appState.setDarkMode(val);
                    },
                  ),
                  Divider(height: 1, color: context.dividerColor),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF450A0A) : AppColors.dashMetricAlertBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.logout_rounded, color: AppColors.dashAlertRed, size: 20),
                    ),
                    title: Text(
                      tr('sign_out'),
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

  Widget _buildHoldingItem(BuildContext context, String label, String value, IconData icon, Color iconColor) {
    return Column(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: context.subText,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
