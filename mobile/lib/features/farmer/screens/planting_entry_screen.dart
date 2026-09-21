import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';

class PlantingEntryScreen extends StatefulWidget {
  final Crop? preSelectedCrop;
  final int initialStage; // 0 for Log Planting, 1 for Post Surplus

  const PlantingEntryScreen({
    super.key,
    this.preSelectedCrop,
    this.initialStage = 0,
  });

  @override
  State<PlantingEntryScreen> createState() => _PlantingEntryScreenState();
}

class _PlantingEntryScreenState extends State<PlantingEntryScreen> {
  late int _selectedStage; // 0 = Log Planting, 1 = Post Surplus

  // --- Stage 1: Log Planting State ---
  late Crop _selectedPlantingCrop;
  double _allocatedAcres = 1.0;
  DateTime _plantingDate = DateTime.now();
  late DateTime _expectedHarvestDate;

  // --- Stage 2: Post Surplus State ---
  late Crop _selectedSurplusCrop;
  double _surplusQuantityKg = 350.0;
  late double _surplusPricePerKg;

  @override
  void initState() {
    super.initState();
    _selectedStage = widget.initialStage;

    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _selectedPlantingCrop = widget.preSelectedCrop ?? appState.availableCrops.first;
    _expectedHarvestDate = _plantingDate.add(Duration(days: _selectedPlantingCrop.maturityDays));

    _selectedSurplusCrop = widget.preSelectedCrop ?? appState.availableCrops.first;
    _surplusPricePerKg = (_selectedSurplusCrop.currentMarketPricePerKg * 0.75).roundToDouble();
  }

  // --- Stage 1 Handlers ---
  void _onPlantingCropSelected(Crop crop) {
    setState(() {
      _selectedPlantingCrop = crop;
      _expectedHarvestDate = _plantingDate.add(Duration(days: crop.maturityDays));
    });
  }

  void _adjustAcres(double delta, double maxAvailable) {
    setState(() {
      double next = _allocatedAcres + delta;
      if (next < 0.25) next = 0.25;
      if (next > maxAvailable) next = maxAvailable;
      _allocatedAcres = double.parse(next.toStringAsFixed(2));
    });
  }

  void _selectPlantingDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _plantingDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );
    if (picked != null) {
      setState(() {
        _plantingDate = picked;
        _expectedHarvestDate = picked.add(Duration(days: _selectedPlantingCrop.maturityDays));
      });
    }
  }

  void _submitPlanting(AppStateProvider appState) {
    final farmer = appState.farmerProfile;
    final lang = appState.currentLanguage;
    if (_allocatedAcres > farmer.availableAcres) {
      final msg = lang == AppLanguage.english
          ? 'Not enough land available. You only have ${farmer.availableAcres.toStringAsFixed(1)} acres free.'
          : lang == AppLanguage.tamil
              ? 'போதுமான நிலம் இல்லை. உங்களிடம் ${farmer.availableAcres.toStringAsFixed(1)} ஏக்கர் மட்டுமே உள்ளது.'
              : 'ඉඩම ප්‍රමාණවත් නොවේ. ඔබට ඇත්තේ ${farmer.availableAcres.toStringAsFixed(1)} අක්කර පමණි.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: AppColors.riskCritical,
        ),
      );
      return;
    }

    final success = appState.addPlantingEntry(
      crop: _selectedPlantingCrop,
      allocatedAcres: _allocatedAcres,
      plantingDate: _plantingDate,
      expectedHarvestDate: _expectedHarvestDate,
    );

    if (success) {
      final cropName = lang == AppLanguage.sinhala ? _selectedPlantingCrop.sinhalaName : _selectedPlantingCrop.name;
      final successMsg = lang == AppLanguage.english
          ? '$cropName planting entry logged successfully!'
          : lang == AppLanguage.tamil
              ? '$cropName பயிர்செய்கை வெற்றிகரமாக பதிவு செய்யப்பட்டது!'
              : '$cropName වගාව සාර්ථකව සටහන් විය!';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(successMsg),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.pop(context);
    }
  }

  // --- Stage 2 Handlers ---
  void _onSurplusCropSelected(Crop crop) {
    setState(() {
      _selectedSurplusCrop = crop;
      _surplusPricePerKg = (crop.currentMarketPricePerKg * 0.75).roundToDouble();
    });
  }

  void _adjustSurplusQty(double delta) {
    setState(() {
      double next = _surplusQuantityKg + delta;
      if (next < 50) next = 50;
      _surplusQuantityKg = next;
    });
  }

  void _submitSurplus(AppStateProvider appState) {
    final lang = appState.currentLanguage;
    appState.addSurplusListing(
      cropName: _selectedSurplusCrop.name,
      cropEmoji: _selectedSurplusCrop.iconEmoji,
      quantityKg: _surplusQuantityKg,
      askingPricePerKg: _surplusPricePerKg,
      regularPricePerKg: _selectedSurplusCrop.currentMarketPricePerKg,
      isUrgent: true,
      notes: 'Fresh harvest from Bandarawela.',
    );

    final cropName = lang == AppLanguage.sinhala ? _selectedSurplusCrop.sinhalaName : _selectedSurplusCrop.name;
    final surplusMsg = lang == AppLanguage.english
        ? '$cropName surplus published to 5km marketplace!'
        : lang == AppLanguage.tamil
            ? '$cropName உபரி 5 கி.மீ சந்தையில் வெளியிடப்பட்டது!'
            : '$cropName අතිරික්තය කි.මී. 5 වෙළඳපොළට සාර්ථකව පළකරන ලදී!';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(surplusMsg),
        backgroundColor: AppColors.badgeHarvest,
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          _selectedStage == 0 ? tr('log_planting_tab') : tr('post_surplus_tab'),
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Segmented Tab Selector
          Container(
            color: context.cardBg,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF3EF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: context.cardBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStageTab(
                      context: context,
                      stageIndex: 0,
                      label: '🌱 ${tr('log_planting_tab')}',
                      activeColor: isDark ? AppColors.darkEmerald : AppColors.primary,
                      isSelected: _selectedStage == 0,
                    ),
                  ),
                  Expanded(
                    child: _buildStageTab(
                      context: context,
                      stageIndex: 1,
                      label: '🏪 ${tr('post_surplus_tab')}',
                      activeColor: AppColors.badgeHarvest,
                      isSelected: _selectedStage == 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Divider(height: 1, color: context.cardBorder),

          // Stage Content
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: _selectedStage == 0
                  ? _buildUltraSimplePlantingStage(context, appState, tr, lang)
                  : _buildUltraSimpleSurplusStage(context, appState, tr, lang),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStageTab({
    required BuildContext context,
    required int stageIndex,
    required String label,
    required Color activeColor,
    required bool isSelected,
  }) {
    final isDark = context.isDarkMode;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedStage = stageIndex;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? (isDark ? const Color(0xFF1E293B) : Colors.white) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? activeColor : context.subText,
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // ULTRA-SIMPLE STAGE 1: Log New Planting
  // ==========================================
  Widget _buildUltraSimplePlantingStage(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
    AppLanguage lang,
  ) {
    final isDark = context.isDarkMode;
    final farmer = appState.farmerProfile;
    final projectedYield = _allocatedAcres * _selectedPlantingCrop.expectedYieldKgPerAcre;
    final projectedRevenue = projectedYield * _selectedPlantingCrop.currentMarketPricePerKg;
    final dateFormat = DateFormat('yyyy MMM dd');
    final String currencyUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');

    return SingleChildScrollView(
      key: const ValueKey('stage_simple_planting'),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step 1: Select Crop
          Text(
            tr('step_select_crop'),
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 10),
          _buildCropCardGrid(
            context: context,
            crops: appState.availableCrops,
            selectedCrop: _selectedPlantingCrop,
            activeColor: isDark ? AppColors.darkEmerald : AppColors.primary,
            onSelect: _onPlantingCropSelected,
            lang: lang,
          ),
          const SizedBox(height: 18),

          // Step 2: Land Area Stepper
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                tr('step_land_area'),
                style: GoogleFonts.poppins(
                  fontSize: 14.5,
                  fontWeight: FontWeight.bold,
                  color: context.titleText,
                ),
              ),
              Text(
                '${tr('available_land')}: ${farmer.availableAcres.toStringAsFixed(1)} ${tr('acre_unit')}',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkEmerald : AppColors.primaryDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildStepperBox(
            context: context,
            displayValue: '${_allocatedAcres.toStringAsFixed(2)} ${tr('acre_unit')}',
            onMinus: () => _adjustAcres(-0.25, farmer.availableAcres),
            onPlus: () => _adjustAcres(0.25, farmer.availableAcres),
            presetChips: [
              _buildPresetChip(context, '0.25 ${tr('acre_unit')}', () => setState(() => _allocatedAcres = 0.25)),
              _buildPresetChip(context, '0.5 ${tr('acre_unit')}', () => setState(() => _allocatedAcres = 0.5)),
              _buildPresetChip(context, '1.0 ${tr('acre_unit')}', () => setState(() => _allocatedAcres = 1.0)),
              _buildPresetChip(context, '2.0 ${tr('acre_unit')}', () => setState(() => _allocatedAcres = 2.0 <= farmer.availableAcres ? 2.0 : farmer.availableAcres)),
            ],
          ),
          const SizedBox(height: 18),

          // Step 3: Planting Date
          Text(
            tr('step_planting_date'),
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: _selectPlantingDate,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.03),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: context.softGreenBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.calendar_today_rounded, color: isDark ? AppColors.darkEmerald : AppColors.primaryDark, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '📅 ${dateFormat.format(_plantingDate)} (${tr('today_label')})',
                          style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: context.titleText),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${tr('expected_harvest_date')}: ${dateFormat.format(_expectedHarvestDate)} (~${_selectedPlantingCrop.maturityDays} ${tr('days_left')})',
                          style: GoogleFonts.inter(fontSize: 11.5, color: context.subText),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.edit_calendar, size: 20, color: isDark ? AppColors.darkEmerald : AppColors.primary),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Summary Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: (isDark ? AppColors.darkEmerald : AppColors.primary).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('📦 ${tr('est_harvest_label')}', style: GoogleFonts.inter(fontSize: 11.5, color: isDark ? AppColors.darkEmerald : AppColors.primaryDark)),
                      const SizedBox(height: 2),
                      Text(
                        '~${projectedYield.toStringAsFixed(0)} Kg',
                        style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.primaryDark),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 36, color: (isDark ? AppColors.darkEmerald : AppColors.primary).withValues(alpha: 0.3)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('💰 ${tr('est_revenue_label')}', style: GoogleFonts.inter(fontSize: 11.5, color: isDark ? AppColors.darkEmerald : AppColors.primaryDark)),
                      const SizedBox(height: 2),
                      Text(
                        '$currencyUnit ${projectedRevenue.toStringAsFixed(0)}',
                        style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: isDark ? Colors.white : AppColors.primaryDark),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Giant Action Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Text('🌱', style: TextStyle(fontSize: 20)),
              label: Text(
                tr('save_planting_btn'),
                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.asvannaButtonGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 3,
              ),
              onPressed: () => _submitPlanting(appState),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // ==========================================
  // ULTRA-SIMPLE STAGE 2: Post Surplus Produce
  // ==========================================
  Widget _buildUltraSimpleSurplusStage(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
    AppLanguage lang,
  ) {
    final isDark = context.isDarkMode;
    final totalValue = _surplusQuantityKg * _surplusPricePerKg;
    final String currencyUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');

    return SingleChildScrollView(
      key: const ValueKey('stage_simple_surplus'),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step 1: Select Crop
          Text(
            tr('step_select_crop'),
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 10),
          _buildCropCardGrid(
            context: context,
            crops: appState.availableCrops,
            selectedCrop: _selectedSurplusCrop,
            activeColor: AppColors.badgeHarvest,
            onSelect: _onSurplusCropSelected,
            lang: lang,
          ),
          const SizedBox(height: 18),

          // Step 2: Quantity Stepper (Kg)
          Text(
            tr('step_quantity_kg'),
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 10),
          _buildStepperBox(
            context: context,
            displayValue: '${_surplusQuantityKg.toStringAsFixed(0)} Kg',
            onMinus: () => _adjustSurplusQty(-50),
            onPlus: () => _adjustSurplusQty(50),
            presetChips: [
              _buildPresetChip(context, '100 Kg', () => setState(() => _surplusQuantityKg = 100)),
              _buildPresetChip(context, '250 Kg', () => setState(() => _surplusQuantityKg = 250)),
              _buildPresetChip(context, '500 Kg', () => setState(() => _surplusQuantityKg = 500)),
              _buildPresetChip(context, '1,000 Kg', () => setState(() => _surplusQuantityKg = 1000)),
            ],
          ),
          const SizedBox(height: 18),

          // Step 3: Price per Kg
          Text(
            tr('step_asking_price'),
            style: GoogleFonts.poppins(
              fontSize: 14.5,
              fontWeight: FontWeight.bold,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: context.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.cardBorder),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${tr('current_spot_price')}: $currencyUnit ${_selectedSurplusCrop.currentMarketPricePerKg.toStringAsFixed(0)} / Kg',
                      style: GoogleFonts.inter(fontSize: 11.5, color: context.subText),
                    ),
                    Text(
                      '$currencyUnit ${_surplusPricePerKg.toStringAsFixed(0)} / Kg',
                      style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.badgeHarvest),
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: AppColors.badgeHarvest),
                      onPressed: () {
                        if (_surplusPricePerKg > 20) {
                          setState(() => _surplusPricePerKg -= 5);
                        }
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle_outline, color: AppColors.badgeHarvest),
                      onPressed: () {
                        setState(() => _surplusPricePerKg += 5);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Summary Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF38230B) : const Color(0xFFFFF8E1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFFFD54F)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('📦 ${tr('total_value_label')}:', style: GoogleFonts.inter(fontSize: 13, color: isDark ? const Color(0xFFFDE68A) : AppColors.textSecondary)),
                    Text(
                      '$currencyUnit ${totalValue.toStringAsFixed(0)}',
                      style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.bold, color: isDark ? const Color(0xFFFCD34D) : AppColors.badgeHarvest),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.location_on, color: isDark ? const Color(0xFFFCD34D) : AppColors.badgeHarvest, size: 16),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        tr('radius_5km_notify'),
                        style: GoogleFonts.inter(fontSize: 11.5, color: isDark ? const Color(0xFFFDE68A) : AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          // Giant Action Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: const Text('📦', style: TextStyle(fontSize: 20)),
              label: Text(
                tr('publish_surplus_btn'),
                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.badgeHarvest,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 3,
              ),
              onPressed: () => _submitSurplus(appState),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // --- Helper Widgets ---
  Widget _buildCropCardGrid({
    required BuildContext context,
    required List<Crop> crops,
    required Crop selectedCrop,
    required Color activeColor,
    required ValueChanged<Crop> onSelect,
    required AppLanguage lang,
  }) {
    final isDark = context.isDarkMode;

    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: crops.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, index) {
          final crop = crops[index];
          final isSelected = crop.id == selectedCrop.id;

          final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
          final secondaryName = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;

          return GestureDetector(
            onTap: () => onSelect(crop),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 88,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
              decoration: BoxDecoration(
                color: isSelected ? activeColor.withValues(alpha: isDark ? 0.2 : 0.1) : context.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? activeColor : context.cardBorder,
                  width: isSelected ? 2.2 : 1.2,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: activeColor.withValues(alpha: 0.25),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
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
                      color: isSelected ? activeColor : context.titleText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    secondaryName,
                    style: GoogleFonts.inter(
                      fontSize: 9.5,
                      color: isSelected ? activeColor : context.subText,
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

  Widget _buildStepperBox({
    required BuildContext context,
    required String displayValue,
    required VoidCallback onMinus,
    required VoidCallback onPlus,
    required List<Widget> presetChips,
  }) {
    final isDark = context.isDarkMode;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF3EF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(12),
                ),
                icon: Icon(Icons.remove, size: 22, color: context.titleText),
                onPressed: onMinus,
              ),
              Text(
                displayValue,
                style: GoogleFonts.poppins(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: context.titleText,
                ),
              ),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF3EF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(12),
                ),
                icon: Icon(Icons.add, size: 22, color: context.titleText),
                onPressed: onPlus,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: presetChips,
          ),
        ],
      ),
    );
  }

  Widget _buildPresetChip(BuildContext context, String label, VoidCallback onTap) {
    final isDark = context.isDarkMode;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: context.cardBorder),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: context.titleText,
          ),
        ),
      ),
    );
  }
}
