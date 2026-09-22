import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
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
      backgroundColor: context.scaffoldBg,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Crop Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(context.isDarkMode ? 0.3 : 0.04),
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
                      color: context.softGreenBg,
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
                          style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, color: context.titleText),
                        ),
                        Text(
                          '${crop.sinhalaName} • ${crop.category}',
                          style: GoogleFonts.inter(fontSize: 13, color: context.isDarkMode ? AppColors.darkEmerald : AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${tr('maturity_label')} ~${crop.maturityDays} Days • ${tr('avg_yield_label')} ${crop.expectedYieldKgPerAcre.toStringAsFixed(0)} Kg/Acre',
                          style: GoogleFonts.inter(fontSize: 11, color: context.subText),
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
                      ? (context.isDarkMode ? const Color(0xFF450A0A) : AppColors.riskCriticalBg)
                      : risk.riskLevel == CropRiskLevel.moderate
                          ? (context.isDarkMode ? const Color(0xFF38230B) : AppColors.riskModerateBg)
                          : (context.isDarkMode ? const Color(0xFF143E23) : AppColors.riskSafeBg),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: risk.riskLevel == CropRiskLevel.critical
                        ? (context.isDarkMode ? const Color(0xFFF87171) : AppColors.riskCritical.withOpacity(0.4))
                        : (context.isDarkMode ? AppColors.darkEmerald.withOpacity(0.4) : AppColors.primary.withOpacity(0.3)),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      risk.riskLevel == CropRiskLevel.critical
                          ? Icons.warning_amber_rounded
                          : Icons.check_circle_outline,
                      color: risk.riskLevel == CropRiskLevel.critical
                          ? (context.isDarkMode ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                          : (context.isDarkMode ? AppColors.darkEmerald : AppColors.primary),
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Current Risk: ${risk.riskTitle} (${risk.saturationPercentage.toStringAsFixed(1)}% ${tr('saturation')})',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: risk.riskLevel == CropRiskLevel.critical
                                  ? (context.isDarkMode ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                                  : (context.isDarkMode ? AppColors.darkEmerald : AppColors.primaryDark),
                            ),
                          ),
                          Text(
                            'Predicted harvest return: Rs. ${risk.predictedHarvestPriceLkr.toStringAsFixed(0)} / Kg',
                            style: GoogleFonts.inter(fontSize: 11, color: context.subText),
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
              tr('growth_stages_title'),
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: context.titleText),
            ),
            const SizedBox(height: 10),

            _buildGrowthStage(
              context: context,
              stageNumber: '1',
              title: 'Nursery & Sowing Stage (Day 1 – 20)',
              description: 'Prepare raised nursery beds in Bandarawela red-yellow podzolic soil. Apply well-decomposed compost at 10 tonnes/acre.',
              icon: Icons.grass_rounded,
            ),
            _buildGrowthStage(
              context: context,
              stageNumber: '2',
              title: 'Vegetative Growth & Tiller Development (Day 21 – 50)',
              description: 'First top dressing (Urea + MOP). Monitor soil moisture and irrigate in early morning to prevent fungal spore germination.',
              icon: Icons.eco_rounded,
            ),
            _buildGrowthStage(
              context: context,
              stageNumber: '3',
              title: 'Bulbing / Head Formation (Day 51 – 75)',
              description: 'Apply potassium-rich organic booster. Inspect for late blight or thrips. Ensure weed-free bed furrows.',
              icon: Icons.spa_rounded,
            ),
            _buildGrowthStage(
              context: context,
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
                color: context.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.terrain_rounded, color: context.isDarkMode ? AppColors.darkEmerald : AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        tr('soil_climate_title'),
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: context.titleText),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildAgronomicSpec(context, 'Optimal Soil pH:', '5.8 – 6.5 (Loamy, Well-drained)'),
                  _buildAgronomicSpec(context, 'Altitude Range:', '1,000m – 1,850m (Bandarawela & Nuwara Eliya)'),
                  _buildAgronomicSpec(context, 'Rainfall Sensitivity:', 'Sensitive to waterlogging; requires raised beds'),
                  _buildAgronomicSpec(context, 'Recommended Fertilizer:', 'NPK (12-12-17+2) + Organic Poultry/Compost'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Post-Harvest Zero-Waste Handling
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: context.softGreenBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: (context.isDarkMode ? AppColors.darkEmerald : AppColors.primary).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.recycling_rounded, color: context.isDarkMode ? AppColors.darkEmerald : AppColors.primaryDark, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        tr('zero_waste_guide_title'),
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: context.isDarkMode ? AppColors.darkEmerald : AppColors.primaryDark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '• Post-harvest losses for ${crop.name} in Badulla district average 32% due to rough transport.\n• If local wholesale bidding is depressed, use Asvanna\'s 5km marketplace to sell directly to nearby event caterers within 6 hours of harvest to preserve 100% farmgate value.',
                    style: GoogleFonts.inter(fontSize: 12, height: 1.4, color: context.titleText),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Button: Sowing
            ElevatedButton.icon(
              icon: const Icon(Icons.add_chart_rounded, color: Colors.white),
              label: Text('${tr('log_sowing_btn')} (${crop.name})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.asvannaButtonGreen,
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
    required BuildContext context,
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
                color: context.isDarkMode ? AppColors.darkEmerald : AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  stageNumber,
                  style: TextStyle(color: context.isDarkMode ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 65,
                color: context.cardBorder,
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
                  style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: context.titleText),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: GoogleFonts.inter(fontSize: 12, color: context.subText, height: 1.3),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAgronomicSpec(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 135,
            child: Text(label, style: GoogleFonts.inter(fontSize: 11, color: context.subText, fontWeight: FontWeight.w600)),
          ),
          Expanded(
            child: Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: context.titleText)),
          ),
        ],
      ),
    );
  }
}
