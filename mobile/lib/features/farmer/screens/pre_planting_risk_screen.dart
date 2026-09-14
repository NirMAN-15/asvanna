import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';
import '../widgets/crop_comparison_modal.dart';

class PrePlantingRiskScreen extends StatefulWidget {
  final Crop? initialCrop;

  const PrePlantingRiskScreen({super.key, this.initialCrop});

  @override
  State<PrePlantingRiskScreen> createState() => _PrePlantingRiskScreenState();
}

class _PrePlantingRiskScreenState extends State<PrePlantingRiskScreen> {
  late Crop _selectedCrop;
  final _searchController = TextEditingController();
  String _searchQuery = '';
  double _simulatedAcreage = 1.0;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _selectedCrop = widget.initialCrop ?? appState.selectedCropForRisk ?? appState.availableCrops.first;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final risk = appState.getRiskForCrop(_selectedCrop.id);

    final filteredCrops = appState.availableCrops.where((c) {
      final query = _searchQuery.toLowerCase();
      return c.name.toLowerCase().contains(query) || c.sinhalaName.contains(query);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('risk_engine')),
        actions: [
          IconButton(
            tooltip: 'Side-by-Side Comparison',
            icon: const Icon(Icons.compare_arrows_rounded, color: AppColors.primary),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                builder: (_) => CropComparisonModal(primaryCrop: _selectedCrop),
              );
            },
          ),
          IconButton(
            tooltip: 'How Risk is Calculated',
            icon: const Icon(Icons.info_outline, color: AppColors.primary),
            onPressed: () => _showRiskCalculationExplainer(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: tr('search_crop'),
                prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 14),

            // Horizontal Crop Selector Chips
            SizedBox(
              height: 48,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: filteredCrops.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final crop = filteredCrops[index];
                  final isSelected = crop.id == _selectedCrop.id;
                  final cropRisk = appState.getRiskForCrop(crop.id);

                  Color dotColor = AppColors.riskSafe;
                  if (cropRisk?.riskLevel == CropRiskLevel.critical) {
                    dotColor = AppColors.riskCritical;
                  } else if (cropRisk?.riskLevel == CropRiskLevel.moderate) {
                    dotColor = AppColors.riskModerate;
                  }

                  return ChoiceChip(
                    label: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(crop.iconEmoji, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 6),
                        Text(
                          '${crop.name} (${crop.sinhalaName})',
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white : dotColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? AppColors.primary : const Color(0xFFDCE6DC),
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedCrop = crop);
                        appState.selectCropForRisk(crop);
                      }
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 18),

            if (risk == null)
              const Center(child: Text('No risk analysis data available for this crop.'))
            else ...[
              // Main Risk Gauge Card
              _buildRiskAssessmentCard(risk, tr),
              const SizedBox(height: 18),

              // Interactive Acreage Simulation Card
              _buildAcreageSimulatorCard(risk),
              const SizedBox(height: 18),

              // Regional Planted vs Target Demand
              _buildAcreageComparisonCard(risk),
              const SizedBox(height: 18),

              // Price Impact Forecast
              _buildPriceImpactCard(risk),
              const SizedBox(height: 18),

              // Alternative Crop Recommendations
              if (risk.alternativeRecommendations.isNotEmpty) ...[
                _buildAlternativeRecommendationsSection(context, risk, appState, tr),
                const SizedBox(height: 20),
              ],

              // Action Buttons: Compare vs Proceed
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.compare_arrows_rounded),
                      label: const Text('Compare Crops'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                          ),
                          builder: (_) => CropComparisonModal(primaryCrop: _selectedCrop),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.check_circle_outline),
                      label: Text('Plant ${_selectedCrop.name}'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: risk.riskLevel == CropRiskLevel.critical
                            ? AppColors.riskModerate
                            : AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PlantingEntryScreen(preSelectedCrop: _selectedCrop),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRiskAssessmentCard(CropRiskAnalysis risk, String Function(String) tr) {
    Color statusColor;
    Color statusBg;
    IconData statusIcon;

    switch (risk.riskLevel) {
      case CropRiskLevel.safe:
        statusColor = AppColors.riskSafe;
        statusBg = AppColors.riskSafeBg;
        statusIcon = Icons.check_circle_rounded;
        break;
      case CropRiskLevel.moderate:
        statusColor = AppColors.riskModerate;
        statusBg = AppColors.riskModerateBg;
        statusIcon = Icons.info_rounded;
        break;
      case CropRiskLevel.critical:
        statusColor = AppColors.riskCritical;
        statusBg = AppColors.riskCriticalBg;
        statusIcon = Icons.warning_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: statusColor.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.08),
            blurRadius: 14,
            offset: const Offset(0, 5),
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
                  color: statusBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(statusIcon, color: statusColor, size: 30),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        risk.riskTitle.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${risk.cropEmoji} ${risk.cropName} Risk Status',
                      style: GoogleFonts.poppins(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${risk.saturationPercentage.toStringAsFixed(1)}%',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: statusColor,
                    ),
                  ),
                  Text(
                    'Saturation',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            risk.warningMessage,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: statusColor,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            risk.agronomicAdvice,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcreageSimulatorCard(CropRiskAnalysis risk) {
    final simulatedSaturation = ((risk.regionalPlantedAcres + _simulatedAcreage) / risk.regionalMaxTargetAcres) * 100;
    final simulatedYieldKg = _simulatedAcreage * _selectedCrop.expectedYieldKgPerAcre;
    final projectedHarvestPrice = risk.predictedHarvestPriceLkr;
    final simulatedRevenue = simulatedYieldKg * projectedHarvestPrice;
    final potentialLoss = risk.priceDropRiskPercentage > 0
        ? (simulatedYieldKg * (_selectedCrop.currentMarketPricePerKg - projectedHarvestPrice))
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FBF9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('🧮', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    'Interactive Sowing Simulator',
                    style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_simulatedAcreage.toStringAsFixed(1)} Acres',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Adjust the slider to see how your planned land area impacts the regional market & revenue:',
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 10),

          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.primary,
              thumbColor: AppColors.primary,
            ),
            child: Slider(
              value: _simulatedAcreage,
              min: 0.25,
              max: 3.0,
              divisions: 11,
              label: '${_simulatedAcreage.toStringAsFixed(2)} Acres',
              onChanged: (val) => setState(() => _simulatedAcreage = val),
            ),
          ),
          const SizedBox(height: 8),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2EBE2)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Simulated Saturation:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                    Text(
                      '${risk.saturationPercentage.toStringAsFixed(1)}% ➔ ${simulatedSaturation.toStringAsFixed(1)}%',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: simulatedSaturation > 100 ? AppColors.riskCritical : AppColors.primaryDark,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Est. Harvest Volume:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                    Text('~${simulatedYieldKg.toStringAsFixed(0)} Kg', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Projected Revenue:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                    Text('Rs. ${simulatedRevenue.toStringAsFixed(0)}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                  ],
                ),
                if (potentialLoss > 0) ...[
                  const SizedBox(height: 6),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Glut Price Drop Risk Loss:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.riskCritical, fontWeight: FontWeight.w600)),
                      Text(
                        '- Rs. ${potentialLoss.toStringAsFixed(0)}',
                        style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.riskCritical),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcreageComparisonCard(CropRiskAnalysis risk) {
    final saturation = risk.saturationPercentage;
    final ratio = (saturation / 100.0).clamp(0.0, 2.0);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2EBE2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Regional Planting vs Market Target',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                'Bandarawela Division',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Meter
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: (ratio / 1.5).clamp(0.0, 1.0),
              minHeight: 12,
              backgroundColor: const Color(0xFFE8EFE8),
              valueColor: AlwaysStoppedAnimation<Color>(
                saturation > 120
                    ? AppColors.riskCritical
                    : saturation > 85
                        ? AppColors.riskModerate
                        : AppColors.riskSafe,
              ),
            ),
          ),
          const SizedBox(height: 14),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMiniMetric(
                'Currently Sown',
                '${risk.regionalPlantedAcres.toStringAsFixed(0)} Acres',
                AppColors.textPrimary,
              ),
              _buildMiniMetric(
                'Max Market Demand',
                '${risk.regionalMaxTargetAcres.toStringAsFixed(0)} Acres',
                AppColors.primaryDark,
              ),
              _buildMiniMetric(
                'Status',
                saturation > 100 ? '+${(saturation - 100).toStringAsFixed(0)}% Excess' : '${(100 - saturation).toStringAsFixed(0)}% Room',
                saturation > 100 ? AppColors.riskCritical : AppColors.riskSafe,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniMetric(String title, String value, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }

  Widget _buildPriceImpactCard(CropRiskAnalysis risk) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2EBE2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Price Forecast at Harvest Time',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Icon(Icons.show_chart, color: AppColors.primary),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAF8),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Current Spot Price', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 4),
                      Text(
                        'Rs. ${risk.currentMarketPriceLkr.toStringAsFixed(0)} /kg',
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: risk.priceDropRiskPercentage > 0 ? AppColors.riskCriticalBg : AppColors.riskSafeBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Predicted Harvest Price',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: risk.priceDropRiskPercentage > 0 ? AppColors.riskCritical : AppColors.riskSafe,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Rs. ${risk.predictedHarvestPriceLkr.toStringAsFixed(0)} /kg',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: risk.priceDropRiskPercentage > 0 ? AppColors.riskCritical : AppColors.riskSafe,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (risk.priceDropRiskPercentage > 0) ...[
            const SizedBox(height: 8),
            Text(
              '⚠️ Warning: Projected ${risk.priceDropRiskPercentage.toStringAsFixed(1)}% price drop due to synchronized trend-planting glut.',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.riskCritical,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAlternativeRecommendationsSection(
    BuildContext context,
    CropRiskAnalysis risk,
    AppStateProvider appState,
    String Function(String) tr,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('💡', style: TextStyle(fontSize: 18)),
            const SizedBox(width: 8),
            Text(
              tr('recommended_alternatives'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Planting these crops balances the regional market and protects your revenue.',
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 12),
        ...risk.alternativeRecommendations.map((rec) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
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
                    Text(rec.emoji, style: const TextStyle(fontSize: 26)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            rec.cropName,
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark,
                            ),
                          ),
                          Text(
                            '+${rec.profitBoostPercentage.toStringAsFixed(1)}% Profit Margin vs Leeks',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        visualDensity: VisualDensity.compact,
                      ),
                      onPressed: () {
                        final altCrop = appState.availableCrops.firstWhere((c) => c.id == rec.cropId);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PlantingEntryScreen(preSelectedCrop: altCrop),
                          ),
                        );
                      },
                      child: Text(tr('adopt_crop'), style: const TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  rec.reason,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.textPrimary, height: 1.3),
                ),
                const SizedBox(height: 6),
                Text(
                  'Est. Revenue: ~Rs. ${(rec.estimatedRevenuePerAcreLkr / 1000000).toStringAsFixed(2)} Million / Acre',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.secondary),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  void _showRiskCalculationExplainer(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('How Asvanna Calculates Risk', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Text(
          'Asvanna compares total registered farmer acreage in the Bandarawela Agrarian Division against historical consumption and national wholesale purchasing benchmarks (HARTI / Manning Market datasets).\n\nWhen registered planting exceeds 85% of regional demand, early warning alerts are triggered to prevent market glut at harvest time.',
          style: GoogleFonts.inter(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Understood'),
          ),
        ],
      ),
    );
  }
}
