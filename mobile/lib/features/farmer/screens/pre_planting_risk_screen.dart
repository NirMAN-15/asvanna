import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';

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
            tooltip: tr('how_risk_calculated'),
            icon: const Icon(Icons.info_outline, color: AppColors.primary),
            onPressed: () => _showRiskCalculationExplainer(context, tr),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await appState.fetchLiveRiskData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Live Backend Connection & Intelligence Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: appState.isBackendConnected ? const Color(0xFFE8F5E9) : const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: appState.isBackendConnected ? AppColors.riskSafe.withOpacity(0.5) : AppColors.riskModerate.withOpacity(0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: appState.isBackendConnected ? AppColors.riskSafe : AppColors.riskModerate,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          appState.isBackendConnected ? '⚡ Live AI Risk Engine (Bandarawela)' : '📶 Local Intelligence Engine',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: appState.isBackendConnected ? AppColors.primaryDark : AppColors.riskModerate,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (appState.isLoadingRisk)
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                    ),
                ],
              ),
              const SizedBox(height: 10),

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
                      visualDensity: VisualDensity.compact,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      labelPadding: const EdgeInsets.symmetric(horizontal: 4),
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

                // Multi-Factor Risk Assessment Breakdown Card (4 Backend Weighted Factors)
                if (risk.factors != null) ...[
                  _buildMultiFactorBreakdownCard(risk, tr),
                  const SizedBox(height: 18),
                ],

                // Interactive Acreage Simulation Card
                _buildAcreageSimulatorCard(risk, tr),
                const SizedBox(height: 18),

                // Regional Planted vs Target Demand
                _buildAcreageComparisonCard(risk, tr),
              const SizedBox(height: 18),

              // Price Impact Forecast
              _buildPriceImpactCard(risk, tr),
              const SizedBox(height: 18),

              // Alternative Crop Recommendations
              if (risk.alternativeRecommendations.isNotEmpty) ...[
                _buildAlternativeRecommendationsSection(context, risk, appState, tr),
                const SizedBox(height: 20),
              ],

              // Action Button: Proceed to Plant
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.check_circle_outline),
                  label: Text('${tr('plant_crop_btn')} ${_selectedCrop.name}'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: risk.riskLevel == CropRiskLevel.critical
                        ? AppColors.riskModerate
                        : AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
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
              const SizedBox(height: 24),
            ],
          ],
        ),
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
                      '${risk.cropEmoji} ${risk.cropName} ${tr('risk_status')}',
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
                    tr('saturation'),
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

  Widget _buildMultiFactorBreakdownCard(CropRiskAnalysis risk, String Function(String) tr) {
    final factors = risk.factors;
    if (factors == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2EBE2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
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
              Row(
                children: [
                  const Text('⚙️', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    'Multi-Factor AI Assessment',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
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
                  '${risk.district} / ${risk.division}',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 1. Overplanting factor (45%)
          _buildFactorRow(
            icon: '🌾',
            title: 'Over-Planting Risk (${factors.overPlantingWeight} Weight)',
            detail: '${factors.currentPlantedKg.toStringAsFixed(0)} Kg Planted / ${factors.demandQuotaKg.toStringAsFixed(0)} Kg Target Quota (${factors.overPlantingRatio}% ratio)',
            status: factors.overPlantingScore >= 65 ? 'High Glut Risk' : (factors.overPlantingScore >= 40 ? 'Moderate' : 'Safe Window'),
            statusColor: factors.overPlantingScore >= 65 ? AppColors.riskCritical : (factors.overPlantingScore >= 40 ? AppColors.riskModerate : AppColors.riskSafe),
          ),
          const Divider(height: 20),

          // 2. Weather factor (25%)
          _buildFactorRow(
            icon: '⛅',
            title: 'Agro-Weather Suitability (${factors.weatherWeight} Weight)',
            detail: factors.weatherAdvisory.isNotEmpty ? factors.weatherAdvisory : 'Temp Score: ${factors.temperatureScore.toStringAsFixed(0)}% • Rain Score: ${factors.rainfallScore.toStringAsFixed(0)}%',
            status: factors.weatherScore <= 20 ? 'Optimal' : (factors.weatherScore <= 50 ? 'Favorable' : 'Weather Risk'),
            statusColor: factors.weatherScore <= 20 ? AppColors.riskSafe : (factors.weatherScore <= 50 ? AppColors.riskModerate : AppColors.riskCritical),
          ),
          const Divider(height: 20),

          // 3. Seasonal factor (15%)
          _buildFactorRow(
            icon: '🗓️',
            title: 'Seasonal Fit (${factors.seasonalWeight} Weight)',
            detail: 'Current Season: ${factors.currentSeason} • Status: ${factors.seasonStatus.replaceAll('_', ' ')}',
            status: factors.seasonStatus == 'IN_SEASON' ? 'In Season' : 'Off Season',
            statusColor: factors.seasonStatus == 'IN_SEASON' ? AppColors.riskSafe : AppColors.riskModerate,
          ),
          const Divider(height: 20),

          // 4. Price Volatility factor (15%)
          _buildFactorRow(
            icon: '📈',
            title: 'Price Volatility Risk (${factors.priceWeight} Weight)',
            detail: 'Spot Price: Rs. ${factors.currentPrice.toStringAsFixed(0)}/kg • Volatility: ${factors.volatilityPercentage.toStringAsFixed(1)}%',
            status: factors.priceScore >= 60 ? 'High Volatility' : (factors.priceScore >= 35 ? 'Moderate' : 'Stable'),
            statusColor: factors.priceScore >= 60 ? AppColors.riskCritical : (factors.priceScore >= 35 ? AppColors.riskModerate : AppColors.riskSafe),
          ),
        ],
      ),
    );
  }

  Widget _buildFactorRow({
    required String icon,
    required String title,
    required String detail,
    required String status,
    required Color statusColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(icon, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 6),
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: statusColor,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          detail,
          style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
        ),
      ],
    );
  }

  Widget _buildAcreageSimulatorCard(CropRiskAnalysis risk, String Function(String) tr) {
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
              Expanded(
                child: Row(
                  children: [
                    const Text('🧮', style: TextStyle(fontSize: 18)),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        tr('simulator_title'),
                        style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_simulatedAcreage.toStringAsFixed(1)} ${tr('acre_unit')}',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            tr('simulator_desc'),
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
              label: '${_simulatedAcreage.toStringAsFixed(2)} ${tr('acre_unit')}',
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
                    Text(tr('simulated_saturation'), style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
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
                    Text(tr('est_harvest_vol'), style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                    Text('~${simulatedYieldKg.toStringAsFixed(0)} Kg', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(tr('projected_revenue'), style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                    Text('Rs. ${simulatedRevenue.toStringAsFixed(0)}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primaryDark)),
                  ],
                ),
                if (potentialLoss > 0) ...[
                  const SizedBox(height: 6),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(tr('glut_risk_loss'), style: GoogleFonts.inter(fontSize: 12, color: AppColors.riskCritical, fontWeight: FontWeight.w600)),
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

  Widget _buildAcreageComparisonCard(CropRiskAnalysis risk, String Function(String) tr) {
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
              Expanded(
                child: Text(
                  tr('regional_planting_target'),
                  style: GoogleFonts.poppins(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                tr('division_label'),
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
              Expanded(
                child: _buildMiniMetric(
                  tr('currently_sown'),
                  '${risk.regionalPlantedAcres.toStringAsFixed(0)} ${tr('acre_unit')}',
                  AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildMiniMetric(
                  tr('max_demand'),
                  '${risk.regionalMaxTargetAcres.toStringAsFixed(0)} ${tr('acre_unit')}',
                  AppColors.primaryDark,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildMiniMetric(
                  tr('status_label'),
                  saturation > 100 ? '+${(saturation - 100).toStringAsFixed(0)}% ${tr('excess_label')}' : '${(100 - saturation).toStringAsFixed(0)}% ${tr('room_label')}',
                  saturation > 100 ? AppColors.riskCritical : AppColors.riskSafe,
                ),
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
        Text(
          title,
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 13.5,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildPriceImpactCard(CropRiskAnalysis risk, String Function(String) tr) {
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
                tr('price_forecast_harvest'),
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
                      Text(tr('current_spot_price'), style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
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
                        tr('predicted_harvest_price'),
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
          tr('alt_crops_desc'),
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

  void _showRiskCalculationExplainer(BuildContext context, String Function(String) tr) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(tr('how_asvanna_calc_title'), style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Text(
          tr('how_asvanna_calc_body'),
          style: GoogleFonts.inter(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(tr('understood')),
          ),
        ],
      ),
    );
  }
}
