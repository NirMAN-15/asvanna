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

enum RiskCategoryFilter { safe, medium, high }

class PrePlantingRiskScreen extends StatefulWidget {
  final Crop? initialCrop;

  const PrePlantingRiskScreen({super.key, this.initialCrop});

  @override
  State<PrePlantingRiskScreen> createState() => _PrePlantingRiskScreenState();
}

class _PrePlantingRiskScreenState extends State<PrePlantingRiskScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  RiskCategoryFilter _activeFilter = RiskCategoryFilter.safe;
  double _modalSimulatedAcreage = 1.0;

  @override
  void initState() {
    super.initState();
    if (widget.initialCrop != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final appState = Provider.of<AppStateProvider>(context, listen: false);
        final level = _getCropRiskLevel(widget.initialCrop!, appState);
        if (mounted) {
          setState(() {
            switch (level) {
              case CropRiskLevel.safe:
                _activeFilter = RiskCategoryFilter.safe;
                break;
              case CropRiskLevel.moderate:
                _activeFilter = RiskCategoryFilter.medium;
                break;
              case CropRiskLevel.critical:
                _activeFilter = RiskCategoryFilter.high;
                break;
            }
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  CropRiskLevel _getCropRiskLevel(Crop crop, AppStateProvider appState) {
    final cropId = crop.id;
    final risk = appState.getRiskForCrop(cropId);
    if (risk != null) return risk.riskLevel;
    final nameLower = crop.name.toLowerCase();
    if (nameLower.contains('leek')) return CropRiskLevel.critical;
    if (nameLower.contains('cabbage') || nameLower.contains('carrot') || nameLower.contains('tomato')) {
      return CropRiskLevel.moderate;
    }
    return CropRiskLevel.safe;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    // Group crops into 3 categories
    final allCrops = appState.availableCrops;
    final safeCrops = <Crop>[];
    final mediumCrops = <Crop>[];
    final highCrops = <Crop>[];

    final query = _searchQuery.trim().toLowerCase();

    for (final crop in allCrops) {
      final nameLower = crop.name.toLowerCase();
      final sinhalaLower = crop.sinhalaName.toLowerCase();
      final matchesSearch = query.isEmpty ||
          nameLower.contains(query) ||
          sinhalaLower.contains(query);

      if (!matchesSearch) continue;

      final riskLevel = _getCropRiskLevel(crop, appState);
      switch (riskLevel) {
        case CropRiskLevel.safe:
          safeCrops.add(crop);
          break;
        case CropRiskLevel.moderate:
          mediumCrops.add(crop);
          break;
        case CropRiskLevel.critical:
          highCrops.add(crop);
          break;
      }
    }

    final totalSafeCount = allCrops.where((c) => _getCropRiskLevel(c, appState) == CropRiskLevel.safe).length;
    final totalMedCount = allCrops.where((c) => _getCropRiskLevel(c, appState) == CropRiskLevel.moderate).length;
    final totalHighCount = allCrops.where((c) => _getCropRiskLevel(c, appState) == CropRiskLevel.critical).length;

    List<Crop> displayedCrops;
    switch (_activeFilter) {
      case RiskCategoryFilter.safe:
        displayedCrops = safeCrops;
        break;
      case RiskCategoryFilter.medium:
        displayedCrops = mediumCrops;
        break;
      case RiskCategoryFilter.high:
        displayedCrops = highCrops;
        break;
    }

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('crop_status'),
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
                    color: isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 5),
                Text(
                  'Bandarawela Agrarian Division • Live',
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
              // 1. Search Bar
              TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
                decoration: InputDecoration(
                  hintText: tr('search_crop'),
                  hintStyle: GoogleFonts.inter(fontSize: 13.5, color: context.mutedText),
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
              const SizedBox(height: 14),

              // 2. 3-Part Category Tabs (Safe, Medium Risk, High Risk)
              _build3CategoryTabs(
                context: context,
                safeCount: totalSafeCount,
                medCount: totalMedCount,
                highCount: totalHighCount,
                tr: tr,
              ),
              const SizedBox(height: 16),

              // 3. Crops List for the Selected Category (No redundant category banner)
              if (displayedCrops.isNotEmpty) ...[
                ...displayedCrops.map((crop) => _buildCropCard(
                      context: context,
                      crop: crop,
                      appState: appState,
                      tr: tr,
                      lang: lang,
                    )),
              ] else
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.search_off_rounded,
                          size: 40,
                          color: context.mutedText,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _searchQuery.isNotEmpty
                              ? 'No crops found matching "$_searchQuery"'
                              : 'No crops in this category',
                          style: GoogleFonts.inter(fontSize: 13.5, color: context.subText),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // 3-Part Category Tabs
  Widget _build3CategoryTabs({
    required BuildContext context,
    required int safeCount,
    required int medCount,
    required int highCount,
    required String Function(String) tr,
  }) {
    final isDark = context.isDarkMode;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cardBorder.withValues(alpha: 0.6)),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _buildCategoryTabItem(
              context: context,
              title: tr('safe_crops_cat'),
              count: safeCount,
              isSelected: _activeFilter == RiskCategoryFilter.safe,
              activeColor: isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A),
              activeBg: isDark ? const Color(0xFF052E16) : Colors.white,
              icon: Icons.check_circle_rounded,
              onTap: () => setState(() => _activeFilter = RiskCategoryFilter.safe),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: _buildCategoryTabItem(
              context: context,
              title: tr('medium_risk_cat'),
              count: medCount,
              isSelected: _activeFilter == RiskCategoryFilter.medium,
              activeColor: isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706),
              activeBg: isDark ? const Color(0xFF451A03) : Colors.white,
              icon: Icons.warning_amber_rounded,
              onTap: () => setState(() => _activeFilter = RiskCategoryFilter.medium),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: _buildCategoryTabItem(
              context: context,
              title: tr('high_risk_cat'),
              count: highCount,
              isSelected: _activeFilter == RiskCategoryFilter.high,
              activeColor: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
              activeBg: isDark ? const Color(0xFF450A0A) : Colors.white,
              icon: Icons.error_outline_rounded,
              onTap: () => setState(() => _activeFilter = RiskCategoryFilter.high),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryTabItem({
    required BuildContext context,
    required String title,
    required int count,
    required bool isSelected,
    required Color activeColor,
    required Color activeBg,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final isDark = context.isDarkMode;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected ? activeBg : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: isSelected
              ? Border.all(color: activeColor.withValues(alpha: isDark ? 0.7 : 0.35), width: 1.5)
              : null,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: activeColor.withValues(alpha: 0.12),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 14,
                  color: isSelected ? activeColor : context.subText,
                ),
                const SizedBox(width: 4),
                Text(
                  '$count',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? activeColor : context.titleText,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected
                    ? (isDark ? Colors.white : const Color(0xFF0F172A))
                    : context.subText,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // Simplified Crop Card without AI clutter
  Widget _buildCropCard({
    required BuildContext context,
    required Crop crop,
    required AppStateProvider appState,
    required String Function(String) tr,
    required AppLanguage lang,
  }) {
    final isDark = context.isDarkMode;
    final risk = appState.getRiskForCrop(crop.id);
    final riskLevel = _getCropRiskLevel(crop, appState);

    // Saturation percentage
    final double saturation = risk?.saturationPercentage ??
        (riskLevel == CropRiskLevel.critical
            ? 163.0
            : (riskLevel == CropRiskLevel.moderate ? 88.0 : 42.0));

    Color statusColor;
    String statusLabel;
    String saturationStatus;

    switch (riskLevel) {
      case CropRiskLevel.safe:
        statusColor = isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A);
        statusLabel = lang == AppLanguage.sinhala ? 'ආරක්ෂිතයි' : 'Safe to Plant';
        saturationStatus = lang == AppLanguage.sinhala ? 'ඉහළ ඉල්ලුම' : 'High Demand';
        break;
      case CropRiskLevel.moderate:
        statusColor = isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706);
        statusLabel = lang == AppLanguage.sinhala ? 'සැලකිලිමත් වන්න' : 'Medium Risk';
        saturationStatus = lang == AppLanguage.sinhala ? 'කෝටාව පිරෙමින්' : 'Near Saturation';
        break;
      case CropRiskLevel.critical:
        statusColor = isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626);
        statusLabel = lang == AppLanguage.sinhala ? 'වගාවෙන් වළකින්න' : 'DO NOT PLANT';
        saturationStatus = lang == AppLanguage.sinhala ? 'අධික අතිරික්තය' : 'Severe Glut';
        break;
    }

    final dynamic rawPrimary = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
    final String primaryName = (rawPrimary is String && rawPrimary.isNotEmpty)
        ? rawPrimary
        : (crop.name.isNotEmpty ? crop.name : 'Crop');

    final dynamic rawSecondary = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;
    final String secondaryName = (rawSecondary is String && rawSecondary.isNotEmpty)
        ? rawSecondary
        : (crop.sinhalaName.isNotEmpty ? crop.sinhalaName : '');

    final currencySymbol = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');

    final dynamic rawUrl = crop.imageUrl;
    final String imageUrl = (rawUrl is String && rawUrl.isNotEmpty)
        ? rawUrl
        : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=600&auto=format&fit=crop&q=80';

    final dynamic rawEmoji = crop.iconEmoji;
    final String emoji = (rawEmoji is String && rawEmoji.isNotEmpty) ? rawEmoji : '🌱';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: riskLevel == CropRiskLevel.critical
              ? (isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5))
              : context.cardBorder,
          width: riskLevel == CropRiskLevel.critical ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () => _showCropDetailBottomSheet(context, crop, risk, riskLevel, appState, tr, lang),
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Photo Header
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                child: SizedBox(
                  height: 120,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: const Color(0xFF1E293B),
                          child: Center(
                            child: Text(emoji, style: const TextStyle(fontSize: 44)),
                          ),
                        ),
                      ),
                      // Subtle gradient for contrast
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.15),
                                Colors.black.withValues(alpha: 0.72),
                              ],
                            ),
                          ),
                        ),
                      ),
                      // Status Badge (Top-Left)
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.95),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                statusLabel,
                                style: GoogleFonts.inter(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Bottom Row: Crop Names & Market Price
                      Positioned(
                        left: 12,
                        right: 12,
                        bottom: 10,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    primaryName,
                                    style: GoogleFonts.poppins(
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    secondaryName,
                                    style: GoogleFonts.inter(
                                      fontSize: 11.5,
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4.5),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '$currencySymbol ${crop.currentMarketPricePerKg.toStringAsFixed(0)} / kg',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. Card Body: Simple Key Metrics & Quota
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stat Metrics Row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: context.cardBorder.withValues(alpha: 0.6)),
                            ),
                            child: Row(
                              children: [
                                const Text('⏱️', style: TextStyle(fontSize: 13)),
                                const SizedBox(width: 6),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${crop.maturityDays} Days',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: context.titleText,
                                      ),
                                    ),
                                    Text(
                                      tr('days_to_harvest'),
                                      style: GoogleFonts.inter(
                                        fontSize: 9.5,
                                        color: context.mutedText,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: context.cardBorder.withValues(alpha: 0.6)),
                            ),
                            child: Row(
                              children: [
                                const Text('⚖️', style: TextStyle(fontSize: 13)),
                                const SizedBox(width: 6),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${crop.expectedYieldKgPerAcre.toInt()} kg',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: context.titleText,
                                      ),
                                    ),
                                    Text(
                                      lang == AppLanguage.sinhala ? 'අක්කරයකට' : 'Per acre yield',
                                      style: GoogleFonts.inter(
                                        fontSize: 9.5,
                                        color: context.mutedText,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Regional Planting Quota Progress
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          tr('quota_label'),
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: context.subText,
                          ),
                        ),
                        Text(
                          '${saturation.toStringAsFixed(0)}% ($saturationStatus)',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: (saturation / 100).clamp(0.0, 1.0),
                        minHeight: 6,
                        backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                        valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Action Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          riskLevel == CropRiskLevel.critical
                              ? (lang == AppLanguage.sinhala ? 'විකල්ප සහ විස්තර බලන්න' : 'View Alternatives')
                              : tr('view_risk_analysis'),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          Icons.arrow_forward_rounded,
                          size: 14,
                          color: statusColor,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 5. Interactive Risk Detail Bottom Sheet Modal
  void _showCropDetailBottomSheet(
    BuildContext context,
    Crop crop,
    CropRiskAnalysis? risk,
    CropRiskLevel riskLevel,
    AppStateProvider appState,
    String Function(String) tr,
    AppLanguage lang,
  ) {
    final isDark = context.isDarkMode;
    final dynamic rawPrimary = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
    final String primaryName = (rawPrimary is String && rawPrimary.isNotEmpty)
        ? rawPrimary
        : (crop.name.isNotEmpty ? crop.name : 'Crop');

    final dynamic rawSecondary = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;
    final String secondaryName = (rawSecondary is String && rawSecondary.isNotEmpty)
        ? rawSecondary
        : (crop.sinhalaName.isNotEmpty ? crop.sinhalaName : '');

    final currencySymbol = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');
    final dynamic rawEmoji = crop.iconEmoji;
    final String emoji = (rawEmoji is String && rawEmoji.isNotEmpty) ? rawEmoji : '🌱';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final simulatedYield = _modalSimulatedAcreage * crop.expectedYieldKgPerAcre;
            final projectedHarvestPrice = risk?.predictedHarvestPriceLkr ?? crop.currentMarketPricePerKg;
            final simulatedRevenue = simulatedYield * projectedHarvestPrice;

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: const [
                  BoxShadow(color: Colors.black38, blurRadius: 20, offset: Offset(0, -4)),
                ],
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: context.dividerColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Modal Header (Crop Name & Close)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text(emoji, style: const TextStyle(fontSize: 26)),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  primaryName,
                                  style: GoogleFonts.poppins(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: context.titleText,
                                  ),
                                ),
                                Text(
                                  secondaryName,
                                  style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.close_rounded, color: context.subText),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Traffic Light Risk Banner
                    _buildModalRiskBanner(riskLevel, primaryName, tr, isDark),
                    const SizedBox(height: 14),

                    // 4 Stat Grid Cards
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 2.2,
                      children: [
                        _buildModalStatCard(
                          label: tr('expected_price_label'),
                          value: '$currencySymbol ${crop.currentMarketPricePerKg.toStringAsFixed(0)}/kg',
                          isDark: isDark,
                        ),
                        _buildModalStatCard(
                          label: 'Projected Harvest Price',
                          value: '$currencySymbol ${projectedHarvestPrice.toStringAsFixed(0)}/kg',
                          isDark: isDark,
                          isHighlight: riskLevel != CropRiskLevel.safe,
                        ),
                        _buildModalStatCard(
                          label: 'Growth Duration',
                          value: '${crop.maturityDays} Days',
                          isDark: isDark,
                        ),
                        _buildModalStatCard(
                          label: 'Expected Yield/Acre',
                          value: '${crop.expectedYieldKgPerAcre.toStringAsFixed(0)} kg',
                          isDark: isDark,
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Agronomic Advice Quote
                    if (risk != null && risk.agronomicAdvice.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: context.softGreenBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('🌱', style: TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                risk.agronomicAdvice,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  height: 1.4,
                                  color: isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Interactive Sowing Simulator
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: context.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                tr('simulator_title'),
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: context.titleText,
                                ),
                              ),
                              Text(
                                '${_modalSimulatedAcreage.toStringAsFixed(1)} ${tr('acre_unit')}',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                          Slider(
                            value: _modalSimulatedAcreage,
                            min: 0.25,
                            max: 3.0,
                            divisions: 11,
                            activeColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                            onChanged: (val) {
                              setModalState(() => _modalSimulatedAcreage = val);
                            },
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '~${simulatedYield.toStringAsFixed(0)} Kg Est. Yield',
                                style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                              ),
                              Text(
                                'Est. Rev: $currencySymbol ${simulatedRevenue.toStringAsFixed(0)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: riskLevel == CropRiskLevel.critical
                                      ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                                      : (isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Action Button
                    if (riskLevel == CropRiskLevel.critical) ...[
                      // Switch to safe alternative or plant anyway
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Text('🔄', style: TextStyle(fontSize: 18)),
                          label: Text(
                            '${tr('switch_to_safe_crop')} (Beetroot / Pepper)',
                            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            Navigator.pop(modalContext);
                            setState(() => _activeFilter = RiskCategoryFilter.safe);
                          },
                        ),
                      ),
                      const SizedBox(height: 6),
                      Center(
                        child: TextButton(
                          onPressed: () {
                            Navigator.pop(modalContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PlantingEntryScreen(preSelectedCrop: crop),
                              ),
                            );
                          },
                          child: Text(
                            tr('plant_anyway_btn'),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: context.mutedText,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                    ] else ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Text('🌱', style: TextStyle(fontSize: 18)),
                          label: Text(
                            '${tr('start_planting_btn')} $primaryName',
                            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            Navigator.pop(modalContext);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PlantingEntryScreen(preSelectedCrop: crop),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildModalRiskBanner(CropRiskLevel level, String cropName, String Function(String) tr, bool isDark) {
    Color bg;
    Color border;
    Color text;
    String title;
    IconData icon;

    switch (level) {
      case CropRiskLevel.safe:
        bg = isDark ? const Color(0xFF052E16) : const Color(0xFFDCFCE7);
        border = isDark ? const Color(0xFF15803D) : const Color(0xFF86EFAC);
        text = isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A);
        title = tr('good_to_plant_now');
        icon = Icons.check_circle_rounded;
        break;
      case CropRiskLevel.moderate:
        bg = isDark ? const Color(0xFF451A03) : const Color(0xFFFEF3C7);
        border = isDark ? const Color(0xFFB45309) : const Color(0xFFFDE68A);
        text = isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706);
        title = tr('caution_plant_state');
        icon = Icons.warning_amber_rounded;
        break;
      case CropRiskLevel.critical:
        bg = isDark ? const Color(0xFF450A0A) : const Color(0xFFFEE2E2);
        border = isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5);
        text = isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626);
        title = tr('do_not_plant_now');
        icon = Icons.cancel_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(icon, color: text, size: 22),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: text,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModalStatCard({
    required String label,
    required String value,
    required bool isDark,
    bool isHighlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAF9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isHighlight
              ? (isDark ? const Color(0xFFF87171) : const Color(0xFFFCA5A5))
              : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isHighlight
                  ? (isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical)
                  : context.titleText,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 9.5,
              fontWeight: FontWeight.w500,
              color: context.mutedText,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  void _showRiskCalculationExplainer(BuildContext context, String Function(String) tr) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(
          tr('how_asvanna_calc_title'),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 16,
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


