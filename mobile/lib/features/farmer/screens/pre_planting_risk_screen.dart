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
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final risk = appState.getRiskForCrop(_selectedCrop.id);

    final filteredCrops = appState.availableCrops.where((c) {
      final query = _searchQuery.toLowerCase();
      return c.name.toLowerCase().contains(query) || c.sinhalaName.contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('crop_advice_title'),
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            Row(
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF4ADE80) : AppColors.riskSafe,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  'Bandarawela • Live Advisory',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: context.subText,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: tr('how_risk_calculated'),
            icon: Icon(
              Icons.info_outline,
              color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
            ),
            onPressed: () => _showRiskCalculationExplainer(context, tr),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
        onRefresh: () async {
          await appState.fetchLiveRiskData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Bar (Simple & Clean)
              TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
                decoration: InputDecoration(
                  hintText: tr('search_crop'),
                  hintStyle: GoogleFonts.inter(fontSize: 14, color: context.mutedText),
                  prefixIcon: Icon(
                    Icons.search,
                    color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                  ),
                  filled: true,
                  fillColor: context.inputBg,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: context.inputBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: context.inputBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(
                      color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                      width: 1.5,
                    ),
                  ),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear, color: context.subText),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 16),

              // 1. Big Visual Crop Selector Cards (High-Contrast & Farmer Friendly)
              Text(
                tr('select_crop_label'),
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: context.subText,
                ),
              ),
              const SizedBox(height: 10),
              _buildBigCropSelector(appState, filteredCrops, lang),
              const SizedBox(height: 18),

              if (risk == null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 30),
                  child: Center(
                    child: Text(
                      'No risk analysis data available for this crop.',
                      style: GoogleFonts.inter(color: context.subText),
                    ),
                  ),
                )
              else ...[
                // 2. ONE Giant Traffic-Light Status Card
                _buildTrafficLightStatusCard(risk, tr, lang),
                const SizedBox(height: 16),

                // 3. 3 Simple Key Facts (Price, Weather, Market)
                _buildSimpleKeyFactsCard(risk, tr, lang),
                const SizedBox(height: 16),

                // 4. Simple Acreage Profit Estimator
                _buildSimpleAcreageEstimator(risk, tr, lang),
                const SizedBox(height: 20),

                // 5. Giant Single Action Button (Proceed or Switch to Safe Alternative)
                _buildGiantActionButton(context, risk, appState, tr, lang),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // 1. Big Visual Crop Selector Cards (Zero-Overflow & Localized)
  Widget _buildBigCropSelector(AppStateProvider appState, List<Crop> crops, AppLanguage lang) {
    final isDark = context.isDarkMode;
    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: crops.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final crop = crops[index];
          final isSelected = crop.id == _selectedCrop.id;
          final cropRisk = appState.getRiskForCrop(crop.id);
          final isCritical = cropRisk?.riskLevel == CropRiskLevel.critical ||
              (cropRisk == null && crop.name.toLowerCase().contains('leek'));

          Color borderColor = context.cardBorder;
          Color bgColor = context.cardBg;

          if (isSelected) {
            borderColor = isCritical
                ? AppColors.riskCritical
                : (isDark ? const Color(0xFF4ADE80) : AppColors.primary);
            bgColor = isCritical
                ? (isDark ? const Color(0xFF450A0A) : const Color(0xFFFFEBEE))
                : (isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9));
          }

          final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
          final secondaryName = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;

          return GestureDetector(
            onTap: () {
              setState(() => _selectedCrop = crop);
              appState.selectCropForRisk(crop);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 88,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: borderColor,
                  width: isSelected ? 2.2 : 1.2,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: (isCritical ? AppColors.riskCritical : AppColors.primary).withValues(alpha: 0.2),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        )
                      ]
                    : [],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(crop.iconEmoji, style: const TextStyle(fontSize: 26)),
                  const SizedBox(height: 3),
                  Text(
                    primaryName,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      color: isSelected
                          ? (isCritical
                              ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                              : (isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark))
                          : context.titleText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    secondaryName,
                    style: GoogleFonts.inter(
                      fontSize: 9.5,
                      color: isSelected
                          ? (isCritical
                              ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                              : (isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark))
                          : context.mutedText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // 2. Single Giant Traffic-Light Status Card (Fully Localized)
  Widget _buildTrafficLightStatusCard(CropRiskAnalysis risk, String Function(String) tr, AppLanguage lang) {
    final isDark = context.isDarkMode;
    Color cardBg;
    Color borderColor;
    Color textColor;
    IconData statusIcon;
    String statusTitle;
    String simpleAdvice;

    final cropDisplayName = lang == AppLanguage.sinhala ? _selectedCrop.sinhalaName : _selectedCrop.name;

    switch (risk.riskLevel) {
      case CropRiskLevel.critical:
        cardBg = isDark ? const Color(0xFF3B1212) : const Color(0xFFFFEBEE);
        borderColor = isDark ? const Color(0xFFF87171) : AppColors.riskCritical;
        textColor = isDark ? const Color(0xFFFCA5A5) : const Color(0xFFC62828);
        statusIcon = Icons.cancel_rounded;
        statusTitle = tr('do_not_plant_now');
        simpleAdvice = lang == AppLanguage.english
            ? 'Too many farmers in Bandarawela have already planted $cropDisplayName. Harvest prices are projected to drop by ~57%.'
            : lang == AppLanguage.tamil
                ? 'පண்டාරවளையில் ஏற்கனவே அதிகமான விவசாயிகள் $cropDisplayName நட்டுள்ளனர். அறுவடையின் போது விலை ~57% குறையும்.'
                : 'බණ්ඩාරවෙල ප්‍රදේශයේ දැනටමත් $cropDisplayName ඕනෑවට වඩා වගා කර ඇත. අස්වැන්න නෙළන විට මිල 57% කින් පමණ පහත වැටී පාඩු විය හැක.';
        break;
      case CropRiskLevel.moderate:
        cardBg = isDark ? const Color(0xFF38230B) : const Color(0xFFFFF8E1);
        borderColor = isDark ? const Color(0xFFFBBF24) : const Color(0xFFFFA000);
        textColor = isDark ? const Color(0xFFFDE68A) : const Color(0xFFE65100);
        statusIcon = Icons.warning_amber_rounded;
        statusTitle = tr('caution_plant_state');
        simpleAdvice = lang == AppLanguage.english
            ? 'Regional target is 75% saturated. Sowing smaller acreage is recommended.'
            : lang == AppLanguage.tamil
                ? 'பிராந்திய இலக்கில் 75% நிறைவடைந்துள்ளது. குறைந்த பரப்பளவில் நடவு செய்யவும்.'
                : 'ප්‍රාදේශීය වගා ඉලක්කයෙන් 75% ක් දැනටමත් සම්පූර්ණ වී ඇත. සුළු බිම් ප්‍රමාණයක පමණක් වගා කිරීම සුදුසුය.';
        break;
      case CropRiskLevel.safe:
        cardBg = isDark ? const Color(0xFF0F311C) : const Color(0xFFE8F5E9);
        borderColor = isDark ? const Color(0xFF4ADE80) : AppColors.primary;
        textColor = isDark ? const Color(0xFF86EFAC) : const Color(0xFF1B5E20);
        statusIcon = Icons.check_circle_rounded;
        statusTitle = tr('good_to_plant_now');
        simpleAdvice = lang == AppLanguage.english
            ? 'High market demand in Bandarawela. Weather and price outlook are optimal for $cropDisplayName.'
            : lang == AppLanguage.tamil
                ? 'பண்டාරවளையில் அதிக சந்தை தேவை. வானிலை மற்றும் விலைகள் $cropDisplayName பயிருக்கு உகந்ததாக உள்ளன.'
                : 'වෙළඳපොළේ ඉහළ ඉල්ලුමක් පවතී. ඉදිරි කාලගුණය සහ මිල ගණන් $cropDisplayName සඳහා ඉතා යෝග්‍ය වේ.';
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 2.0),
        boxShadow: [
          BoxShadow(
            color: borderColor.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Big Status Icon
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(statusIcon, color: borderColor, size: 42),
          ),
          const SizedBox(height: 12),

          // Status Title
          Text(
            statusTitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: textColor,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),

          // Friendly explanation
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(12),
              border: isDark ? Border.all(color: context.cardBorder) : null,
            ),
            child: Text(
              simpleAdvice,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? const Color(0xFFE2E8F0) : AppColors.textPrimary,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 3. 3 Simple Key Facts Cards (Fully Localized)
  Widget _buildSimpleKeyFactsCard(CropRiskAnalysis risk, String Function(String) tr, AppLanguage lang) {
    final isDark = context.isDarkMode;
    final isCritical = risk.riskLevel == CropRiskLevel.critical;
    final isModerate = risk.riskLevel == CropRiskLevel.moderate;

    final String priceUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');
    final String priceText = isCritical
        ? '$priceUnit ${risk.predictedHarvestPriceLkr.toStringAsFixed(0)} / Kg (-57% ${tr('price_loss_label')})'
        : '$priceUnit ${risk.currentMarketPriceLkr.toStringAsFixed(0)} / Kg (${tr('price_stable_label')})';

    final Color priceColor = isCritical
        ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
        : (isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark);

    final String marketText = isCritical
        ? tr('market_demand_glut')
        : isModerate
            ? tr('market_demand_filling')
            : tr('market_demand_high');

    final Color marketColor = isCritical
        ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
        : (isModerate
            ? (isDark ? const Color(0xFFFCD34D) : AppColors.riskModerate)
            : (isDark ? const Color(0xFF86EFAC) : AppColors.riskSafe));

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.cardBorder),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Fact 1: Price
          _buildFactRow(
            icon: '💰',
            label: tr('expected_price_label'),
            value: priceText,
            valueColor: priceColor,
          ),
          Divider(height: 18, color: context.dividerColor),

          // Fact 2: Weather
          _buildFactRow(
            icon: '🌧️',
            label: tr('weather_condition_label'),
            value: tr('weather_summary_text'),
            valueColor: isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark,
          ),
          Divider(height: 18, color: context.dividerColor),

          // Fact 3: Market Demand
          _buildFactRow(
            icon: '🛒',
            label: tr('market_demand_label'),
            value: marketText,
            valueColor: marketColor,
          ),
        ],
      ),
    );
  }

  Widget _buildFactRow({
    required String icon,
    required String label,
    required String value,
    required Color valueColor,
  }) {
    return Row(
      children: [
        Text(icon, style: const TextStyle(fontSize: 22)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 11, color: context.mutedText, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13.5,
                  fontWeight: FontWeight.bold,
                  color: valueColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 4. Simple Acreage Profit Estimator (Fully Localized)
  Widget _buildSimpleAcreageEstimator(CropRiskAnalysis risk, String Function(String) tr, AppLanguage lang) {
    final isDark = context.isDarkMode;
    final simulatedYieldKg = _simulatedAcreage * _selectedCrop.expectedYieldKgPerAcre;
    final projectedHarvestPrice = risk.predictedHarvestPriceLkr;
    final simulatedRevenue = simulatedYieldKg * projectedHarvestPrice;
    final String currencyUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cardBorder),
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
                    tr('simulator_title'),
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: context.titleText,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: context.softGreenBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_simulatedAcreage.toStringAsFixed(1)} ${tr('acre_unit')}',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
              thumbColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
              inactiveTrackColor: isDark ? const Color(0xFF334155) : const Color(0xFFD6E2D6),
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
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: context.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tr('est_harvest_label'), style: GoogleFonts.inter(fontSize: 11, color: context.mutedText)),
                      Text(
                        '~${simulatedYieldKg.toStringAsFixed(0)} Kg',
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: context.titleText),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: context.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tr('est_revenue_label'), style: GoogleFonts.inter(fontSize: 11, color: context.mutedText)),
                      Text(
                        '$currencyUnit ${simulatedRevenue.toStringAsFixed(0)}',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: risk.riskLevel == CropRiskLevel.critical
                              ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                              : (isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 5. Giant Single Action Button (Fully Localized)
  Widget _buildGiantActionButton(
    BuildContext context,
    CropRiskAnalysis risk,
    AppStateProvider appState,
    String Function(String) tr,
    AppLanguage lang,
  ) {
    final isDark = context.isDarkMode;
    final isCritical = risk.riskLevel == CropRiskLevel.critical;

    // Find recommended safe crop if available
    final Crop alternativeCrop = (risk.alternativeRecommendations.isNotEmpty
            ? appState.availableCrops.cast<Crop?>().firstWhere(
                (c) => c?.id == risk.alternativeRecommendations.first.cropId,
                orElse: () => null,
              )
            : null) ??
        appState.availableCrops.firstWhere(
          (c) => c.id != _selectedCrop.id,
          orElse: () => _selectedCrop,
        );

    final altCropName = lang == AppLanguage.sinhala ? alternativeCrop.sinhalaName : alternativeCrop.name;
    final currentCropName = lang == AppLanguage.sinhala ? _selectedCrop.sinhalaName : _selectedCrop.name;

    if (isCritical) {
      return Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Text('👉', style: TextStyle(fontSize: 18)),
              label: Text(
                '${tr('switch_to_safe_crop')}: $altCropName',
                style: GoogleFonts.poppins(fontSize: 14.5, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 3,
              ),
              onPressed: () {
                setState(() {
                  _selectedCrop = alternativeCrop;
                });
                appState.selectCropForRisk(alternativeCrop);
              },
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PlantingEntryScreen(preSelectedCrop: _selectedCrop),
                ),
              );
            },
            child: Text(
              tr('plant_anyway_btn'),
              style: GoogleFonts.inter(
                fontSize: 12.5,
                color: context.mutedText,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      );
    }

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        icon: const Text('🌱', style: TextStyle(fontSize: 20)),
        label: Text(
          '${tr('start_planting_btn')} $currentCropName',
          style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 3,
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
    );
  }

  void _showRiskCalculationExplainer(BuildContext context, String Function(String) tr) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        title: Text(
          tr('how_asvanna_calc_title'),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
        content: Text(
          tr('how_asvanna_calc_body'),
          style: GoogleFonts.inter(
            fontSize: 13,
            height: 1.4,
            color: context.subText,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              tr('understood'),
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                color: context.isDarkMode ? const Color(0xFF4ADE80) : AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}


