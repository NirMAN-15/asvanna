import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';
import 'pre_planting_risk_screen.dart';
import '../widgets/post_surplus_modal.dart';

class MyCropsScreen extends StatelessWidget {
  const MyCropsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final farmer = appState.farmerProfile;
    final plantings = farmer.activePlantings;
    final totalUsedAcres = farmer.usedAcres;
    final totalLandAcres = farmer.totalLandAcres;
    final landPercentage = farmer.landUtilizationPercentage;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('nav_my_crops'),
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            Text(
              '${farmer.fullName.isNotEmpty ? farmer.fullName : "Farmer"} • ${farmer.gndDivision}, ${farmer.agrarianDivision}',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: context.subText,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: tr('crop_status'),
            icon: Icon(
              Icons.analytics_outlined,
              color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
              );
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.asvannaButtonGreen,
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.add_rounded),
        label: Text(
          tr('plant_new_crop'),
          style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13.5),
        ),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
          );
        },
      ),
      body: RefreshIndicator(
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
              // 1. Overview Summary Banner Card
              _buildSummaryCard(
                context: context,
                plantingsCount: plantings.length,
                usedAcres: totalUsedAcres,
                totalAcres: totalLandAcres,
                landPercentage: landPercentage,
                isDark: isDark,
                tr: tr,
              ),
              const SizedBox(height: 16),

              // Section Title & Counter
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Active Plantings (${plantings.length})',
                    style: GoogleFonts.poppins(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                      color: context.titleText,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
                      );
                    },
                    icon: Icon(
                      Icons.insights_rounded,
                      size: 16,
                      color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                    ),
                    label: Text(
                      'Market Risk',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // 2. Planted Crops List or Empty State
              if (plantings.isNotEmpty) ...[
                ...plantings.map((entry) => _buildPlantedCropCard(
                      context: context,
                      entry: entry,
                      appState: appState,
                      isDark: isDark,
                      tr: tr,
                    )),
              ] else
                _buildEmptyState(context, tr, isDark),

              const SizedBox(height: 80), // Padding for FloatingActionButton
            ],
          ),
        ),
      ),
    );
  }

  // 1. Summary Card
  Widget _buildSummaryCard({
    required BuildContext context,
    required int plantingsCount,
    required double usedAcres,
    required double totalAcres,
    required double landPercentage,
    required bool isDark,
    required String Function(String) tr,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Land Utilization',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: context.subText,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        '${usedAcres.toStringAsFixed(1)} / ${totalAcres.toStringAsFixed(1)}',
                        style: GoogleFonts.poppins(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: context.titleText,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Acres',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: context.subText,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF22C55E).withValues(alpha: 0.4) : const Color(0xFF86EFAC),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${landPercentage.toStringAsFixed(0)}% Planted',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: (landPercentage / 100).clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(
                landPercentage > 90 ? const Color(0xFFEAB308) : AppColors.asvannaButtonGreen,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 2. Individual Planted Crop Card
  Widget _buildPlantedCropCard({
    required BuildContext context,
    required PlantedCropEntry entry,
    required AppStateProvider appState,
    required bool isDark,
    required String Function(String) tr,
  }) {
    final progress = entry.growthProgress;
    final daysRemaining = entry.daysRemaining;
    final isHarvestReady = daysRemaining <= 0 || entry.status == 'harvest_ready';

    final plantingDateStr = '${entry.plantingDate.year}-${entry.plantingDate.month.toString().padLeft(2, '0')}-${entry.plantingDate.day.toString().padLeft(2, '0')}';
    final harvestDateStr = '${entry.expectedHarvestDate.year}-${entry.expectedHarvestDate.month.toString().padLeft(2, '0')}-${entry.expectedHarvestDate.day.toString().padLeft(2, '0')}';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.9) : Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isHarvestReady
              ? (isDark ? const Color(0xFF22C55E).withValues(alpha: 0.6) : const Color(0xFF86EFAC))
              : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Crop Emoji & Name + Harvest Ready Status
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    entry.cropEmoji.isNotEmpty ? entry.cropEmoji : '🌱',
                    style: const TextStyle(fontSize: 22),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.cropName,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: context.titleText,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${entry.allocatedAcres.toStringAsFixed(1)} Acres • Sown: $plantingDateStr',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: context.subText,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isHarvestReady
                      ? (isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9))
                      : (isDark ? const Color(0xFF0C4A6E) : const Color(0xFFF0F9FF)),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isHarvestReady
                        ? (isDark ? const Color(0xFF22C55E).withValues(alpha: 0.5) : const Color(0xFF86EFAC))
                        : (isDark ? const Color(0xFF0369A1).withValues(alpha: 0.5) : const Color(0xFFBAE6FD)),
                    width: 1,
                  ),
                ),
                child: Text(
                  isHarvestReady ? 'Harvest Ready' : '$daysRemaining Days Left',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isHarvestReady
                        ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                        : (isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Growth Stage Progress Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Growth Stage: ${(progress * 100).toStringAsFixed(0)}%',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: context.subText,
                ),
              ),
              Text(
                'Est. Harvest: $harvestDateStr',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: context.subText,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(
                isHarvestReady ? const Color(0xFF16A34A) : AppColors.asvannaButtonGreen,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Bottom Yield & Quick Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                children: [
                  Icon(Icons.scale_rounded, size: 15, color: context.subText),
                  const SizedBox(width: 4),
                  Text(
                    'Yield ~${entry.projectedYieldKg.toStringAsFixed(0)} kg',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: context.titleText,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  // Sell Surplus Button
                  OutlinedButton.icon(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (_) => const PostSurplusModal(),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      side: BorderSide(
                        color: isDark ? const Color(0xFFD97706) : const Color(0xFFD97706),
                        width: 1,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.storefront_rounded, size: 14, color: Color(0xFFD97706)),
                    label: Text(
                      tr('sell_surplus'),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFD97706),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Empty State Widget
  Widget _buildEmptyState(BuildContext context, String Function(String) tr, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48.0, horizontal: 16.0),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.eco_rounded,
                  size: 36,
                  color: AppColors.asvannaButtonGreen,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No active planted crops yet',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: context.titleText,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Log your plantings to track harvest countdown, calculate yields, and sell surplus directly.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.5,
                color: context.subText,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.asvannaButtonGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.add_rounded, size: 18),
              label: Text(
                tr('plant_new_crop'),
                style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
