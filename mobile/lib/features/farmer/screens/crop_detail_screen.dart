import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';

class CropDetailScreen extends StatelessWidget {
  final Crop crop;

  const CropDetailScreen({super.key, required this.crop});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final risk = appState.getRiskForCrop(crop.id);

    return Scaffold(
      appBar: AppBar(
        title: Text('${crop.name} (${crop.sinhalaName})'),
        actions: [
          IconButton(
            tooltip: 'Log Sowing',
            icon: const Icon(Icons.add_chart_rounded, color: AppColors.primary),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PlantingEntryScreen(preSelectedCrop: crop),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Crop Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2EBE2)),
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
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(crop.iconEmoji, style: const TextStyle(fontSize: 46)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          crop.name,
                          style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${crop.sinhalaName} • ${crop.category}',
                          style: GoogleFonts.inter(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Maturity: ~${crop.maturityDays} Days • Avg Yield: ${crop.expectedYieldKgPerAcre.toStringAsFixed(0)} Kg/Acre',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Market Risk Status Mini Banner
            if (risk != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: risk.riskLevel == CropRiskLevel.critical
                      ? AppColors.riskCriticalBg
                      : risk.riskLevel == CropRiskLevel.moderate
                          ? AppColors.riskModerateBg
                          : AppColors.riskSafeBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: risk.riskLevel == CropRiskLevel.critical
                        ? AppColors.riskCritical.withOpacity(0.4)
                        : AppColors.primary.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      risk.riskLevel == CropRiskLevel.critical
                          ? Icons.warning_amber_rounded
                          : Icons.check_circle_outline,
                      color: risk.riskLevel == CropRiskLevel.critical
                          ? AppColors.riskCritical
                          : AppColors.primary,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Current Risk: ${risk.riskTitle} (${risk.saturationPercentage.toStringAsFixed(1)}% Saturation)',
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: risk.riskLevel == CropRiskLevel.critical ? AppColors.riskCritical : AppColors.primaryDark),
                          ),
                          Text(
                            'Predicted harvest return: Rs. ${risk.predictedHarvestPriceLkr.toStringAsFixed(0)} / Kg',
                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4-Stage Growth Lifecycle Timeline
            Text(
              'Cultivation Stages & Growth Timeline',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            _buildGrowthStage(
              stageNumber: '1',
              title: 'Nursery & Sowing Stage (Day 1 – 20)',
              description: 'Prepare raised nursery beds in Bandarawela red-yellow podzolic soil. Apply well-decomposed compost at 10 tonnes/acre.',
              icon: Icons.grass_rounded,
            ),
            _buildGrowthStage(
              stageNumber: '2',
              title: 'Vegetative Growth & Tiller Development (Day 21 – 50)',
              description: 'First top dressing (Urea + MOP). Monitor soil moisture and irrigate in early morning to prevent fungal spore germination.',
              icon: Icons.eco_rounded,
            ),
            _buildGrowthStage(
              stageNumber: '3',
              title: 'Bulbing / Head Formation (Day 51 – 75)',
              description: 'Apply potassium-rich organic booster. Inspect for late blight or thrips. Ensure weed-free bed furrows.',
              icon: Icons.spa_rounded,
            ),
            _buildGrowthStage(
              stageNumber: '4',
              title: 'Harvest Maturity & Post-Harvest Cooling (Day 75 – ${crop.maturityDays})',
              description: 'Harvest during cool morning hours. Avoid exposure to direct sunlight. Pack in plastic crates instead of poly-sacks to reduce bruising by 25%.',
              icon: Icons.inventory_2_outlined,
              isLast: true,
            ),

            const SizedBox(height: 20),

            // Agronomic & Soil Care Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2ECE2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.terrain_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Upcountry Soil & Climate Suitability',
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildAgronomicSpec('Optimal Soil pH:', '5.8 – 6.5 (Loamy, Well-drained)'),
                  _buildAgronomicSpec('Altitude Range:', '1,000m – 1,850m (Bandarawela & Nuwara Eliya)'),
                  _buildAgronomicSpec('Rainfall Sensitivity:', 'Sensitive to waterlogging; requires raised beds'),
                  _buildAgronomicSpec('Recommended Fertilizer:', 'NPK (12-12-17+2) + Organic Poultry/Compost'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Post-Harvest Zero-Waste Handling
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primarySoft,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.recycling_rounded, color: AppColors.primaryDark, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Asvanna Zero-Waste Handling Guide',
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '• Post-harvest losses for ${crop.name} in Badulla district average 32% due to rough transport.\n• If local wholesale bidding is depressed, use Asvanna\'s 5km marketplace to sell directly to nearby event caterers within 6 hours of harvest to preserve 100% farmgate value.',
                    style: GoogleFonts.inter(fontSize: 12, height: 1.4, color: AppColors.textPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Button: Sowing
            ElevatedButton.icon(
              icon: const Icon(Icons.add_chart_rounded),
              label: Text('Log ${crop.name} Planting Entry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PlantingEntryScreen(preSelectedCrop: crop),
                  ),
                );
              },
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildGrowthStage({
    required String stageNumber,
    required String title,
    required String description,
    required IconData icon,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  stageNumber,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 65,
                color: const Color(0xFFC8DEC8),
              ),
          ],
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAgronomicSpec(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 135,
            child: Text(label, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          ),
          Expanded(
            child: Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          ),
        ],
      ),
    );
  }
}
