import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/providers/app_state_provider.dart';
import 'post_surplus_screen.dart';

enum PlantedFilterCategory { all, growing, harvestReady, atRisk }

class MyCropsScreen extends StatefulWidget {
  const MyCropsScreen({super.key});

  @override
  State<MyCropsScreen> createState() => _MyCropsScreenState();
}

class _MyCropsScreenState extends State<MyCropsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  PlantedFilterCategory _activeFilter = PlantedFilterCategory.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Crop _getMatchedCrop(PlantedCropEntry planting, List<Crop> allCrops) {
    return allCrops.firstWhere(
      (c) => c.id == planting.cropId || c.name.toLowerCase() == planting.cropName.toLowerCase(),
      orElse: () => Crop(
        id: planting.cropId,
        name: planting.cropName,
        sinhalaName: planting.cropName,
        category: 'Upcountry Vegetable',
        maturityDays: planting.expectedHarvestDate.difference(planting.plantingDate).inDays.abs(),
        expectedYieldKgPerAcre: planting.allocatedAcres > 0 ? (planting.projectedYieldKg / planting.allocatedAcres) : 5000,
        currentMarketPricePerKg: 180,
        historicalAveragePricePerKg: 160,
        iconEmoji: planting.cropEmoji,
        imageUrl: '',
      ),
    );
  }

  CropRiskLevel _getPlantingRiskLevel(PlantedCropEntry planting, AppStateProvider appState) {
    final risk = appState.getRiskForCrop(planting.cropId);
    if (risk != null) return risk.riskLevel;
    final nameLower = planting.cropName.toLowerCase();
    if (nameLower.contains('leek')) return CropRiskLevel.critical;
    if (nameLower.contains('cabbage') || nameLower.contains('carrot') || nameLower.contains('tomato')) {
      return CropRiskLevel.moderate;
    }
    return CropRiskLevel.safe;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final farmer = appState.farmerProfile;
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    final allCrops = appState.availableCrops;
    final activePlantings = farmer.activePlantings;

    // Filter farmer's planted crops
    final query = _searchQuery.trim().toLowerCase();
    final filteredPlantings = <PlantedCropEntry>[];

    int growingCount = 0;
    int harvestReadyCount = 0;
    int atRiskCount = 0;
    double totalExpectedHarvestKg = 0;

    for (final planting in activePlantings) {
      final matchedCrop = _getMatchedCrop(planting, allCrops);
      final riskLevel = _getPlantingRiskLevel(planting, appState);
      final isHarvestReady = planting.daysRemaining <= 0 || planting.growthProgress >= 0.95;

      totalExpectedHarvestKg += planting.projectedYieldKg;

      if (isHarvestReady) {
        harvestReadyCount++;
      } else {
        growingCount++;
      }

      if (riskLevel == CropRiskLevel.critical) {
        atRiskCount++;
      }

      final nameLower = planting.cropName.toLowerCase();
      final sinhalaLower = matchedCrop.sinhalaName.toLowerCase();
      final matchesSearch = query.isEmpty ||
          nameLower.contains(query) ||
          sinhalaLower.contains(query);

      if (!matchesSearch) continue;

      switch (_activeFilter) {
        case PlantedFilterCategory.all:
          filteredPlantings.add(planting);
          break;
        case PlantedFilterCategory.growing:
          if (!isHarvestReady) filteredPlantings.add(planting);
          break;
        case PlantedFilterCategory.harvestReady:
          if (isHarvestReady) filteredPlantings.add(planting);
          break;
        case PlantedFilterCategory.atRisk:
          if (riskLevel == CropRiskLevel.critical) filteredPlantings.add(planting);
          break;
      }
    }

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang == AppLanguage.sinhala
                  ? 'මගේ වගාවන්'
                  : (lang == AppLanguage.tamil ? 'எனது பயிர்கள்' : 'My Planted Crops'),
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            Text(
              '${farmer.fullName} • ${farmer.agrarianDivision} Agrarian Division',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: context.subText,
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
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
              // 1. Farmland Cultivation Summary Card
              _buildCultivationSummaryBanner(
                context: context,
                farmer: farmer,
                activeCount: activePlantings.length,
                totalHarvestKg: totalExpectedHarvestKg,
                atRiskCount: atRiskCount,
                lang: lang,
                isDark: isDark,
              ),
              const SizedBox(height: 14),

              // 2. Search & Filter Bar
              TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
                decoration: InputDecoration(
                  hintText: lang == AppLanguage.sinhala
                      ? 'වගා කළ බෝග සොයන්න (ලීක්ස්, කැරට්...)'
                      : 'Search your planted crops...',
                  hintStyle: GoogleFonts.inter(fontSize: 13, color: context.mutedText),
                  prefixIcon: Icon(
                    Icons.search,
                    color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                    size: 20,
                  ),
                  filled: true,
                  fillColor: context.inputBg,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
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
                          icon: Icon(Icons.clear, color: context.subText, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                ),
              ),
              const SizedBox(height: 12),

              // 3. Filter Category Pills (All, Growing, Ready for Harvest, At Risk)
              _buildFilterCategoryChips(
                context: context,
                totalCount: activePlantings.length,
                growingCount: growingCount,
                harvestReadyCount: harvestReadyCount,
                atRiskCount: atRiskCount,
                lang: lang,
                isDark: isDark,
              ),
              const SizedBox(height: 16),

              // 4. Farmer's Planted Crops List ONLY
              if (filteredPlantings.isNotEmpty) ...[
                ...filteredPlantings.map((planting) {
                  final matchedCrop = _getMatchedCrop(planting, allCrops);
                  return _buildDedicatedPlantingCard(
                    context: context,
                    planting: planting,
                    crop: matchedCrop,
                    appState: appState,
                    lang: lang,
                    isDark: isDark,
                  );
                }),
              ] else ...[
                // Empty State
                _buildEmptyPlantingState(
                  context: context,
                  hasAnyPlantings: activePlantings.isNotEmpty,
                  lang: lang,
                  isDark: isDark,
                ),
              ],
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Farmland Cultivation Summary Banner
  Widget _buildCultivationSummaryBanner({
    required BuildContext context,
    required dynamic farmer,
    required int activeCount,
    required double totalHarvestKg,
    required int atRiskCount,
    required AppLanguage lang,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Row: Total Planted Acreage & Total Projected Harvest
          Row(
            children: [
              // Cultivated Land Area
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF052E16) : const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Text('🌾', style: TextStyle(fontSize: 22)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${farmer.usedAcres.toStringAsFixed(1)} / ${farmer.totalLandAcres.toStringAsFixed(1)} Ac',
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: context.titleText,
                            ),
                          ),
                          Text(
                            lang == AppLanguage.sinhala
                                ? 'වගා කළ ඉඩම (${farmer.landUtilizationPercentage.toStringAsFixed(0)}%)'
                                : 'Cultivated (${farmer.landUtilizationPercentage.toStringAsFixed(0)}%)',
                            style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              Container(width: 1, height: 38, color: context.dividerColor),
              const SizedBox(width: 12),

              // Total Estimated Harvest
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E3A8A) : const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Text('⚖️', style: TextStyle(fontSize: 22)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${totalHarvestKg.toInt()} kg',
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isDark ? const Color(0xFF38BDF8) : const Color(0xFF0284C7),
                            ),
                          ),
                          Text(
                            lang == AppLanguage.sinhala ? 'මුළු අපේක්ෂිත අස්වැන්න' : 'Total Est. Yield',
                            style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Bottom Alert if any planting has glut risk
          if (atRiskCount > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF450A0A) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5)),
              ),
              child: Row(
                children: [
                  const Text('⚠️', style: TextStyle(fontSize: 13)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      lang == AppLanguage.sinhala
                          ? 'ඔබගේ වගාවන්ගෙන් $atRiskCount කට ප්‍රාදේශීය අධික වගා අවදානමක් පවතී.'
                          : '$atRiskCount of your planted crops are in regional over-supply risk.',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // 3. Filter Category Pills
  Widget _buildFilterCategoryChips({
    required BuildContext context,
    required int totalCount,
    required int growingCount,
    required int harvestReadyCount,
    required int atRiskCount,
    required AppLanguage lang,
    required bool isDark,
  }) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterPill(
            label: '${lang == AppLanguage.sinhala ? 'සියලු වගාවන්' : 'All Crops'} ($totalCount)',
            isSelected: _activeFilter == PlantedFilterCategory.all,
            activeColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
            onTap: () => setState(() => _activeFilter = PlantedFilterCategory.all),
            context: context,
            isDark: isDark,
          ),
          const SizedBox(width: 8),
          _buildFilterPill(
            label: '🌱 ${lang == AppLanguage.sinhala ? 'වර්ධනය වෙමින්' : 'Growing'} ($growingCount)',
            isSelected: _activeFilter == PlantedFilterCategory.growing,
            activeColor: isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A),
            onTap: () => setState(() => _activeFilter = PlantedFilterCategory.growing),
            context: context,
            isDark: isDark,
          ),
          const SizedBox(width: 8),
          _buildFilterPill(
            label: '🌾 ${lang == AppLanguage.sinhala ? 'අස්වනු නෙළීමට සූදානම්' : 'Ready to Harvest'} ($harvestReadyCount)',
            isSelected: _activeFilter == PlantedFilterCategory.harvestReady,
            activeColor: const Color(0xFFD97706),
            onTap: () => setState(() => _activeFilter = PlantedFilterCategory.harvestReady),
            context: context,
            isDark: isDark,
          ),
          if (atRiskCount > 0) ...[
            const SizedBox(width: 8),
            _buildFilterPill(
              label: '⚠️ ${lang == AppLanguage.sinhala ? 'අවදානම්' : 'At Risk'} ($atRiskCount)',
              isSelected: _activeFilter == PlantedFilterCategory.atRisk,
              activeColor: isDark ? const Color(0xFFF87171) : const Color(0xFFDC2626),
              onTap: () => setState(() => _activeFilter = PlantedFilterCategory.atRisk),
              context: context,
              isDark: isDark,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFilterPill({
    required String label,
    required bool isSelected,
    required Color activeColor,
    required VoidCallback onTap,
    required BuildContext context,
    required bool isDark,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected
              ? activeColor.withValues(alpha: isDark ? 0.25 : 0.12)
              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? activeColor : context.cardBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? activeColor : context.subText,
          ),
        ),
      ),
    );
  }

  // 4. Dedicated Planting Record Card for Farmer's Active Plantings
  Widget _buildDedicatedPlantingCard({
    required BuildContext context,
    required PlantedCropEntry planting,
    required Crop crop,
    required AppStateProvider appState,
    required AppLanguage lang,
    required bool isDark,
  }) {
    final risk = appState.getRiskForCrop(planting.cropId);
    final riskLevel = _getPlantingRiskLevel(planting, appState);
    final isCriticalRisk = riskLevel == CropRiskLevel.critical;

    final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
    final secondaryName = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;
    final dateFormat = DateFormat('yyyy MMM dd');

    final progress = planting.growthProgress;
    final progressPercentage = (progress * 100).toInt();
    final daysRemaining = planting.daysRemaining;
    final isHarvestReady = daysRemaining <= 0 || progress >= 0.95;

    final perches = (planting.allocatedAcres * 160).round();

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isCriticalRisk
              ? (isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5))
              : context.cardBorder,
          width: isCriticalRisk ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black.withValues(alpha: 0.25) : Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Header: Crop Emoji/Avatar + Name & Harvest Status Badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Crop Avatar Squircle
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF7EE),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFC8E6C9),
                      width: 1.2,
                    ),
                  ),
                  child: Center(
                    child: Text(crop.iconEmoji, style: const TextStyle(fontSize: 26)),
                  ),
                ),
                const SizedBox(width: 12),

                // Crop Name & Category
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        primaryName,
                        style: GoogleFonts.poppins(
                          fontSize: 16.5,
                          fontWeight: FontWeight.bold,
                          color: context.titleText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '$secondaryName • ${crop.category}',
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          color: context.subText,
                        ),
                      ),
                    ],
                  ),
                ),

                // Harvest Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isHarvestReady
                        ? (isDark ? const Color(0xFF451A03) : const Color(0xFFFEF3C7))
                        : (isDark ? const Color(0xFF052E16) : const Color(0xFFDCFCE7)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isHarvestReady ? const Color(0xFFD97706) : const Color(0xFF16A34A),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    isHarvestReady
                        ? (lang == AppLanguage.sinhala ? '🌾 අස්වනු කාලය' : '🌾 Harvest Ready')
                        : (lang == AppLanguage.sinhala ? '🌱 වර්ධනය වෙමින්' : '🌱 Growing'),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isHarvestReady
                          ? (isDark ? const Color(0xFFFBBF24) : const Color(0xFFB45309))
                          : (isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // 2. Metrics 2x2 Strip: Land Sown, Expected Yield, Sown Date, Harvest Date
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Land Sown
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == AppLanguage.sinhala ? 'වගා කළ බිම' : 'Allocated Land',
                            style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${planting.allocatedAcres.toStringAsFixed(1)} Ac ($perches Perch)',
                            style: GoogleFonts.poppins(
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              color: context.titleText,
                            ),
                          ),
                        ],
                      ),
                      // Est. Yield
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            lang == AppLanguage.sinhala ? 'අපේක්ෂිත අස්වැන්න' : 'Expected Yield',
                            style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${planting.projectedYieldKg.toInt()} kg',
                            style: GoogleFonts.poppins(
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Divider(height: 1, color: context.dividerColor),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Sown Date
                      Text(
                        '${lang == AppLanguage.sinhala ? 'සිටුවූයේ' : 'Sown'}: ${dateFormat.format(planting.plantingDate)}',
                        style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                      ),
                      // Harvest Date
                      Text(
                        '${lang == AppLanguage.sinhala ? 'අස්වැන්න' : 'Harvest'}: ${dateFormat.format(planting.expectedHarvestDate)}',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: context.titleText),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 3. Growth Timeline / Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isHarvestReady
                      ? (lang == AppLanguage.sinhala ? 'අස්වනු නෙළීමට සුදුසුම කාලයයි' : 'Optimal time to harvest')
                      : '⏱️ ${daysRemaining > 0 ? '$daysRemaining ${lang == AppLanguage.sinhala ? 'දින ඉතිරියි' : 'days left'}' : (lang == AppLanguage.sinhala ? 'අද දින' : 'Today')}',
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: isHarvestReady ? const Color(0xFFD97706) : context.subText,
                  ),
                ),
                Text(
                  '$progressPercentage% ${lang == AppLanguage.sinhala ? 'වර්ධනය' : 'grown'}',
                  style: GoogleFonts.inter(
                    fontSize: 11.5,
                    fontWeight: FontWeight.bold,
                    color: isHarvestReady ? const Color(0xFFD97706) : AppColors.asvannaButtonGreen,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                minHeight: 7,
                backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                valueColor: AlwaysStoppedAnimation<Color>(
                  isHarvestReady
                      ? const Color(0xFFD97706)
                      : (isCriticalRisk ? const Color(0xFFDC2626) : AppColors.asvannaButtonGreen),
                ),
              ),
            ),

            // 4. Over-Planting Market Warning if applicable
            if (isCriticalRisk) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF450A0A) : const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: isDark ? const Color(0xFF991B1B) : const Color(0xFFFCA5A5)),
                ),
                child: Row(
                  children: [
                    const Text('⚠️', style: TextStyle(fontSize: 13)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        lang == AppLanguage.sinhala
                            ? 'ප්‍රාදේශීය අධික වගාව නිසා අස්වනු මිල රු. ${(risk?.predictedHarvestPriceLkr ?? 95).toStringAsFixed(0)}/kg දක්වා පහත වැටීමේ අවදානමක්'
                            : 'Glut warning: Projected price drop to Rs. ${(risk?.predictedHarvestPriceLkr ?? 95).toStringAsFixed(0)}/kg at harvest.',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFFCA5A5) : const Color(0xFFDC2626),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 14),

            // 5. Action Buttons (Sell Surplus 5km & View Details)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFD97706),
                      side: const BorderSide(color: Color(0xFFD97706), width: 1.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    icon: const Text('📦', style: TextStyle(fontSize: 14)),
                    label: Text(
                      lang == AppLanguage.sinhala ? 'අතිරික්තය විකුණන්න' : 'Sell Surplus (5km)',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PostSurplusScreen(preSelectedCrop: crop),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                      foregroundColor: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    icon: const Icon(Icons.info_outline_rounded, size: 16),
                    label: Text(
                      lang == AppLanguage.sinhala ? 'වගා විස්තර' : 'View Details',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => _showPlantedDetailDialog(context, planting, crop, risk, lang, isDark),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Planted Crop Detail Dialog
  void _showPlantedDetailDialog(
    BuildContext context,
    PlantedCropEntry planting,
    Crop crop,
    CropRiskAnalysis? risk,
    AppLanguage lang,
    bool isDark,
  ) {
    final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
    final currencySymbol = lang == AppLanguage.sinhala ? 'රු.' : 'Rs.';
    final dateFormat = DateFormat('yyyy MMMM dd');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: BoxDecoration(
            color: context.cardBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(crop.iconEmoji, style: const TextStyle(fontSize: 28)),
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
                            '${planting.allocatedAcres.toStringAsFixed(1)} Acres • Sown ${dateFormat.format(planting.plantingDate)}',
                            style: GoogleFonts.inter(fontSize: 11.5, color: context.subText),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(Icons.close_rounded, color: context.subText),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Summary Stats
              Row(
                children: [
                  Expanded(
                    child: _buildModalStatItem(
                      label: lang == AppLanguage.sinhala ? 'අපේක්ෂිත අස්වැන්න' : 'Est. Yield',
                      value: '${planting.projectedYieldKg.toInt()} kg',
                      icon: '⚖️',
                      context: context,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildModalStatItem(
                      label: lang == AppLanguage.sinhala ? 'වෙළඳපොළ මිල' : 'Market Price',
                      value: '$currencySymbol ${crop.currentMarketPricePerKg.toStringAsFixed(0)}/kg',
                      icon: '💰',
                      context: context,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildModalStatItem(
                      label: lang == AppLanguage.sinhala ? 'ඉතිරි දින ගණන' : 'Days Remaining',
                      value: '${planting.daysRemaining} days',
                      icon: '⏱️',
                      context: context,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildModalStatItem(
                      label: lang == AppLanguage.sinhala ? 'අස්වනු දිනය' : 'Harvest Date',
                      value: dateFormat.format(planting.expectedHarvestDate),
                      icon: '📅',
                      context: context,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Button to Sell Surplus
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD97706),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Text('📦', style: TextStyle(fontSize: 16)),
                  label: Text(
                    lang == AppLanguage.sinhala ? '5km වෙළඳපොළට අතිරික්තය පළකරන්න' : 'Post to 5km Surplus Marketplace',
                    style: GoogleFonts.poppins(fontSize: 13.5, fontWeight: FontWeight.bold),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PostSurplusScreen(preSelectedCrop: crop),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Widget _buildModalStatItem({
    required String label,
    required String value,
    required String icon,
    required BuildContext context,
  }) {
    final isDark = context.isDarkMode;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 12)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 13.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // Empty Plantings State
  Widget _buildEmptyPlantingState({
    required BuildContext context,
    required bool hasAnyPlantings,
    required AppLanguage lang,
    required bool isDark,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.cardBorder),
      ),
      child: Column(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF052E16) : const Color(0xFFDCFCE7),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text('🌱', style: TextStyle(fontSize: 34)),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            hasAnyPlantings
                ? (_searchQuery.isNotEmpty ? 'කිසිදු වගාවක් හමු නොවීය' : 'මෙම කාණ්ඩයේ වගාවන් නොමැත')
                : (lang == AppLanguage.sinhala
                    ? 'තවමත් වගාවන් ඇතුළත් කර නොමැත'
                    : 'No planted crops recorded yet'),
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            lang == AppLanguage.sinhala
                ? 'ඔබ වගා කළ බෝග මෙහි සටහන් කර අස්වනු සහ වෙළඳපොළ තත්ත්වය නිරීක්ෂණය කරන්න.'
                : 'Log the crops you have sown to track growth milestones and regional market prices.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 12.5,
              color: context.subText,
            ),
          ),
        ],
      ),
    );
  }
}
