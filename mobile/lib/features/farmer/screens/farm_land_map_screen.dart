import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';
import 'crop_detail_screen.dart';

class FarmLandMapScreen extends StatelessWidget {
  const FarmLandMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final farmer = appState.farmerProfile;
    final plantings = farmer.activePlantings;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmland Terraces & Plots Map'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Farm Overview Header
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2EBE2)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
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
                      Row(
                        children: [
                          const Text('🗺️', style: TextStyle(fontSize: 24)),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${farmer.fullName}\'s Farm Plots',
                                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '${farmer.gndDivision}, ${farmer.agrarianDivision}',
                                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primarySoft,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${farmer.totalLandAcres} Acres Total',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(),
                  const SizedBox(height: 8),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildSummaryItem('Active Plots', '${plantings.length}', Icons.eco_outlined, AppColors.primary),
                      _buildSummaryItem('Cultivated', '${farmer.usedAcres.toStringAsFixed(1)} Ac', Icons.pie_chart_outline, AppColors.primaryDark),
                      _buildSummaryItem('Free Sowing Land', '${farmer.availableAcres.toStringAsFixed(1)} Ac', Icons.add_circle_outline, AppColors.accent),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Visual Terraces & Plots Interactive Layout
            Text(
              'Interactive Plot & Terrace Layout',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Tap on any active plot to inspect crop care schedules or tap free plots to plan sowing.',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),

            // Plot 1: Carrot
            if (plantings.isNotEmpty)
              _buildPlotCard(
                context,
                plotName: 'Plot A — Heeloya Valley Terraces',
                cropName: plantings[0].cropName,
                cropEmoji: plantings[0].cropEmoji,
                cropId: plantings[0].cropId,
                allocatedAcres: plantings[0].allocatedAcres,
                status: 'Growing (Day 45 / 90)',
                color: const Color(0xFFE8F5E9),
                borderColor: AppColors.primary,
                daysLeft: plantings[0].daysRemaining,
                progress: plantings[0].growthProgress,
                appState: appState,
              ),
            const SizedBox(height: 12),

            // Plot 2: Beetroot
            if (plantings.length > 1)
              _buildPlotCard(
                context,
                plotName: 'Plot B — Mid-Slope Terraces',
                cropName: plantings[1].cropName,
                cropEmoji: plantings[1].cropEmoji,
                cropId: plantings[1].cropId,
                allocatedAcres: plantings[1].allocatedAcres,
                status: 'Growing (Day 20 / 70)',
                color: const Color(0xFFF3E5F5),
                borderColor: const Color(0xFF8E24AA),
                daysLeft: plantings[1].daysRemaining,
                progress: plantings[1].growthProgress,
                appState: appState,
              ),
            const SizedBox(height: 12),

            // Plot 3: Available Free Land
            if (farmer.availableAcres > 0)
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
                  );
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7FAF7),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.primary,
                      width: 1.5,
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primary, size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Plot C — Upper Ridge (Free Land)',
                                  style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primarySoft,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${farmer.availableAcres.toStringAsFixed(1)} Acres Ready',
                                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Prepared soil, fallow rest complete. Tap to check pre-planting risk & sow.',
                              style: GoogleFonts.inter(fontSize: 12, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  Widget _buildPlotCard(
    BuildContext context, {
    required String plotName,
    required String cropName,
    required String cropEmoji,
    required String cropId,
    required double allocatedAcres,
    required String status,
    required Color color,
    required Color borderColor,
    required int daysLeft,
    required double progress,
    required AppStateProvider appState,
  }) {
    return InkWell(
      onTap: () {
        final crops = appState.availableCrops;
        final matchedCrop = crops.firstWhere((c) => c.id == cropId, orElse: () => crops.first);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => CropDetailScreen(crop: matchedCrop)),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor.withOpacity(0.4), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(cropEmoji, style: const TextStyle(fontSize: 26)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            plotName,
                            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primarySoft,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '$allocatedAcres Acres',
                              style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$cropName • $status',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: const Color(0xFFE8EFE8),
                valueColor: AlwaysStoppedAnimation<Color>(borderColor),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${(progress * 100).toStringAsFixed(0)}% Growth Progress',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                ),
                Text(
                  '$daysLeft Days to Harvest →',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
