import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../screens/planting_entry_screen.dart';

class CropComparisonModal extends StatefulWidget {
  final Crop primaryCrop;

  const CropComparisonModal({super.key, required this.primaryCrop});

  @override
  State<CropComparisonModal> createState() => _CropComparisonModalState();
}

class _CropComparisonModalState extends State<CropComparisonModal> {
  late Crop _cropA;
  late Crop _cropB;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _cropA = widget.primaryCrop;
    // Select an alternative crop (default to Beetroot or first different crop)
    _cropB = appState.availableCrops.firstWhere(
      (c) => c.id != _cropA.id,
      orElse: () => appState.availableCrops.last,
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final riskA = appState.getRiskForCrop(_cropA.id);
    final riskB = appState.getRiskForCrop(_cropB.id);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('⚖️', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 8),
                  Text(
                    'Side-by-Side Crop Comparison',
                    style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          Text(
            'Compare market saturation, cultivation cycle, and projected harvest return.',
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),

          // Crop Selectors Header
          Row(
            children: [
              // Left Crop Selector
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F6F4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFDDE5DD)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<Crop>(
                      value: _cropA,
                      isExpanded: true,
                      items: appState.availableCrops.map((c) {
                        return DropdownMenuItem(
                          value: c,
                          child: Text('${c.iconEmoji} ${c.name}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _cropA = val);
                      },
                    ),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.0),
                child: Text('VS', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted)),
              ),
              // Right Crop Selector
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<Crop>(
                      value: _cropB,
                      isExpanded: true,
                      items: appState.availableCrops.map((c) {
                        return DropdownMenuItem(
                          value: c,
                          child: Text('${c.iconEmoji} ${c.name}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _cropB = val);
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Comparison Table Body
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  _buildComparisonRow(
                    metric: 'Risk Level',
                    valA: riskA?.riskTitle ?? 'Unknown',
                    valB: riskB?.riskTitle ?? 'Unknown',
                    colorA: _getRiskColor(riskA?.riskLevel),
                    colorB: _getRiskColor(riskB?.riskLevel),
                    isHighlight: true,
                  ),
                  _buildComparisonRow(
                    metric: 'Regional Saturation',
                    valA: '${riskA?.saturationPercentage.toStringAsFixed(1)}%',
                    valB: '${riskB?.saturationPercentage.toStringAsFixed(1)}%',
                    colorA: (riskA?.saturationPercentage ?? 0) > 100 ? AppColors.riskCritical : AppColors.primaryDark,
                    colorB: (riskB?.saturationPercentage ?? 0) > 100 ? AppColors.riskCritical : AppColors.primaryDark,
                  ),
                  _buildComparisonRow(
                    metric: 'Maturity Duration',
                    valA: '${_cropA.maturityDays} Days',
                    valB: '${_cropB.maturityDays} Days',
                  ),
                  _buildComparisonRow(
                    metric: 'Avg Yield / Acre',
                    valA: '${_cropA.expectedYieldKgPerAcre.toStringAsFixed(0)} Kg',
                    valB: '${_cropB.expectedYieldKgPerAcre.toStringAsFixed(0)} Kg',
                  ),
                  _buildComparisonRow(
                    metric: 'Current Spot Price',
                    valA: 'Rs. ${_cropA.currentMarketPricePerKg.toStringAsFixed(0)} /kg',
                    valB: 'Rs. ${_cropB.currentMarketPricePerKg.toStringAsFixed(0)} /kg',
                  ),
                  _buildComparisonRow(
                    metric: 'Predicted Harvest Price',
                    valA: 'Rs. ${riskA?.predictedHarvestPriceLkr.toStringAsFixed(0)} /kg',
                    valB: 'Rs. ${riskB?.predictedHarvestPriceLkr.toStringAsFixed(0)} /kg',
                    colorA: (riskA?.priceDropRiskPercentage ?? 0) > 0 ? AppColors.riskCritical : AppColors.primaryDark,
                    colorB: (riskB?.priceDropRiskPercentage ?? 0) > 0 ? AppColors.riskCritical : AppColors.primaryDark,
                  ),
                  _buildComparisonRow(
                    metric: 'Est. Revenue / Acre',
                    valA: 'Rs. ${((_cropA.expectedYieldKgPerAcre * (riskA?.predictedHarvestPriceLkr ?? _cropA.currentMarketPricePerKg)) / 1000000).toStringAsFixed(2)}M',
                    valB: 'Rs. ${((_cropB.expectedYieldKgPerAcre * (riskB?.predictedHarvestPriceLkr ?? _cropB.currentMarketPricePerKg)) / 1000000).toStringAsFixed(2)}M',
                    isHighlight: true,
                  ),
                  const SizedBox(height: 16),

                  // Smart Recommendation Verdict Banner
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.psychology_outlined, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Text(
                              'Asvanna Agronomic Verdict:',
                              style: GoogleFonts.inter(fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _getVerdictText(_cropA, _cropB, riskA, riskB),
                          style: GoogleFonts.inter(fontSize: 12, height: 1.4, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Action button to adopt winning crop
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PlantingEntryScreen(preSelectedCrop: _cropB),
                ),
              );
            },
            child: Text('Adopt ${_cropB.name} (${_cropB.sinhalaName})', style: const TextStyle(fontSize: 15)),
          ),
        ],
      ),
    );
  }

  Color _getRiskColor(CropRiskLevel? level) {
    if (level == CropRiskLevel.critical) return AppColors.riskCritical;
    if (level == CropRiskLevel.moderate) return AppColors.riskModerate;
    return AppColors.riskSafe;
  }

  String _getVerdictText(Crop cropA, Crop cropB, CropRiskAnalysis? riskA, CropRiskAnalysis? riskB) {
    if ((riskA?.saturationPercentage ?? 0) > 100 && (riskB?.saturationPercentage ?? 0) < 80) {
      return '${cropA.name} is currently heavily over-planted in Bandarawela (163% saturation). Switching to ${cropB.name} protects you from an estimated ${(riskA?.priceDropRiskPercentage ?? 0).toStringAsFixed(0)}% price collapse and delivers a higher return.';
    }
    return '${cropB.name} has a balanced regional supply (${(riskB?.saturationPercentage ?? 0).toStringAsFixed(0)}% saturation) and steady wholesale demand in Dambulla & Colombo Manning markets.';
  }

  Widget _buildComparisonRow({
    required String metric,
    required String valA,
    required String valB,
    Color? colorA,
    Color? colorB,
    bool isHighlight = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isHighlight ? const Color(0xFFF9FAF9) : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFEEF3EE)),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 4,
            child: Text(
              metric,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              valA,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: colorA ?? AppColors.textPrimary,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              valB,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: colorB ?? AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
