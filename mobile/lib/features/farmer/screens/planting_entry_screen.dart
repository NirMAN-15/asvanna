import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/services/mock_data_service.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';

class PlantingEntryScreen extends StatefulWidget {
  final Crop? preSelectedCrop;

  const PlantingEntryScreen({
    super.key,
    this.preSelectedCrop,
  });

  @override
  State<PlantingEntryScreen> createState() => _PlantingEntryScreenState();
}

class _PlantingEntryScreenState extends State<PlantingEntryScreen> {
  late Crop _selectedPlantingCrop;
  double _allocatedAcres = 1.0;
  final TextEditingController _acresController = TextEditingController(text: '1');
  final TextEditingController _perchesController = TextEditingController(text: '0');
  DateTime _plantingDate = DateTime.now();
  late DateTime _expectedHarvestDate;

  @override
  void initState() {
    super.initState();

    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final crops = appState.availableCrops;
    if (widget.preSelectedCrop != null) {
      _selectedPlantingCrop = crops.firstWhere(
        (c) => c.id == widget.preSelectedCrop!.id,
        orElse: () => widget.preSelectedCrop!,
      );
    } else {
      _selectedPlantingCrop = crops.isNotEmpty ? crops.first : MockDataService.getUpcountryCrops().first;
    }
    _expectedHarvestDate = _plantingDate.add(Duration(days: _selectedPlantingCrop.maturityDays));
  }

  @override
  void dispose() {
    _acresController.dispose();
    _perchesController.dispose();
    super.dispose();
  }

  // --- Stage 1 Handlers ---
  void _onPlantingCropSelected(Crop crop) {
    setState(() {
      _selectedPlantingCrop = crop;
      _expectedHarvestDate = _plantingDate.add(Duration(days: crop.maturityDays));
    });
  }

  void _onLandAreaChanged() {
    final acres = double.tryParse(_acresController.text.trim()) ?? 0.0;
    final perches = double.tryParse(_perchesController.text.trim()) ?? 0.0;
    final total = acres + (perches / 160.0);
    setState(() {
      _allocatedAcres = total > 0 ? double.parse(total.toStringAsFixed(3)) : 0.0;
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
    final acres = double.tryParse(_acresController.text.trim()) ?? 0.0;
    final perches = double.tryParse(_perchesController.text.trim()) ?? 0.0;
    final totalAcres = acres + (perches / 160.0);

    if (totalAcres <= 0) {
      final errorMsg = lang == AppLanguage.sinhala
          ? 'කරුණාකර වලංගු ඉඩම් ප්‍රමාණයක් (අක්කර හෝ පර්චස්) ඇතුළත් කරන්න.'
          : (lang == AppLanguage.tamil
              ? 'தயவுசெய்து சரியான நிலப்பரப்பை (ஏக்கர் அல்லது பேர்ச்) உள்ளிடவும்.'
              : 'Please enter a valid land area in Acres or Perches.');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMsg),
          backgroundColor: AppColors.riskCritical,
        ),
      );
      return;
    }

    if (totalAcres > farmer.availableAcres) {
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
      allocatedAcres: totalAcres,
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

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          tr('log_planting_title'),
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
      ),
      body: _buildUltraSimplePlantingStage(context, appState, tr, lang),
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
          _buildCropDropdownSelector(
            context: context,
            crops: appState.availableCrops,
            selectedCrop: _selectedPlantingCrop,
            activeColor: isDark ? AppColors.darkEmerald : AppColors.primary,
            onSelect: _onPlantingCropSelected,
            lang: lang,
          ),
          const SizedBox(height: 18),

          // Step 2: Land Area (Manual Typing for Acres & Perches)
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
                '${tr('available_land')}: ${farmer.availableAcres.toStringAsFixed(1)} ${tr('acre_unit')} (${(farmer.availableAcres * 160).round()} ${tr('perch_unit')})',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkEmerald : AppColors.primaryDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildLandAreaManualInput(
            context: context,
            appState: appState,
            tr: tr,
            lang: lang,
            isDark: isDark,
          ),
          const SizedBox(height: 18),

          // Step 3: Planting Date (Clean & Simple)
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
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? const Color(0xFF334155) : context.cardBorder),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: context.softGreenBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.calendar_today_rounded,
                      color: isDark ? AppColors.darkEmerald : AppColors.primaryDark,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dateFormat.format(_plantingDate),
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: context.titleText,
                          ),
                        ),
                        Text(
                          '${tr('expected_harvest_date')}: ${dateFormat.format(_expectedHarvestDate)}',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: context.subText,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: context.cardBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.edit_calendar_outlined, size: 14, color: isDark ? AppColors.darkEmerald : AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          lang == AppLanguage.sinhala ? 'වෙනස් කරන්න' : (lang == AppLanguage.tamil ? 'மாற்று' : 'Change'),
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkEmerald : AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
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

  // --- Helper Widgets ---
  Widget _buildCropThumbnail(Crop crop, {double size = 42}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasImage = crop.imageUrl.trim().isNotEmpty;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFEFF7EE),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFC8E6C9),
          width: 1.2,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: hasImage
          ? Image.network(
              crop.imageUrl,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Center(
                child: Text(
                  crop.iconEmoji,
                  style: TextStyle(fontSize: size * 0.52),
                ),
              ),
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Center(
                  child: Text(
                    crop.iconEmoji,
                    style: TextStyle(fontSize: size * 0.52),
                  ),
                );
              },
            )
          : Center(
              child: Text(
                crop.iconEmoji,
                style: TextStyle(fontSize: size * 0.52),
              ),
            ),
    );
  }

  Widget _buildCropDropdownSelector({
    required BuildContext context,
    required List<Crop> crops,
    required Crop selectedCrop,
    required Color activeColor,
    required ValueChanged<Crop> onSelect,
    required AppLanguage lang,
  }) {
    final isDark = context.isDarkMode;
    final String currencyUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');
    String tr(String key) => AppTranslations.tr(lang, key);

    // Safeguard to ensure selectedCrop is present in crops
    final safeSelectedCrop = crops.firstWhere(
      (c) => c.id == selectedCrop.id,
      orElse: () => crops.isNotEmpty ? crops.first : selectedCrop,
    );

    return Container(
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: activeColor.withValues(alpha: isDark ? 0.6 : 0.4),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: activeColor.withValues(alpha: isDark ? 0.2 : 0.06),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<Crop>(
          value: safeSelectedCrop,
          isExpanded: true,
          dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          elevation: 6,
          menuMaxHeight: 400,
          itemHeight: 64,
          icon: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: activeColor.withValues(alpha: isDark ? 0.2 : 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.keyboard_arrow_down_rounded,
              color: activeColor,
              size: 22,
            ),
          ),
          selectedItemBuilder: (BuildContext context) {
            return crops.map<Widget>((Crop crop) {
              final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
              final secondaryName = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;

              return Row(
                children: [
                  _buildCropThumbnail(crop, size: 42),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '$primaryName ($secondaryName)',
                          style: GoogleFonts.poppins(
                            fontSize: 14.5,
                            fontWeight: FontWeight.bold,
                            color: context.titleText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${crop.category} • ~${crop.maturityDays} ${tr('days_left')} • $currencyUnit ${crop.currentMarketPricePerKg.toStringAsFixed(0)}/kg',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: context.subText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }).toList();
          },
          items: crops.map((Crop crop) {
            final isSelected = crop.id == safeSelectedCrop.id;
            final primaryName = lang == AppLanguage.sinhala ? crop.sinhalaName : crop.name;
            final secondaryName = lang == AppLanguage.sinhala ? crop.name : crop.sinhalaName;

            return DropdownMenuItem<Crop>(
              value: crop,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                decoration: BoxDecoration(
                  color: isSelected ? activeColor.withValues(alpha: isDark ? 0.18 : 0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _buildCropThumbnail(crop, size: 38),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            primaryName,
                            style: GoogleFonts.poppins(
                              fontSize: 13.5,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                              color: isSelected ? activeColor : context.titleText,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '$secondaryName • ${crop.category}',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: context.subText,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '$currencyUnit ${crop.currentMarketPricePerKg.toStringAsFixed(0)}/kg',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.primaryDark,
                          ),
                        ),
                        Text(
                          '~${crop.maturityDays} ${tr('days_left')}',
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            color: context.subText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 6),
                    if (isSelected)
                      Icon(Icons.check_circle_rounded, color: activeColor, size: 18)
                    else
                      const SizedBox(width: 18),
                  ],
                ),
              ),
            );
          }).toList(),
          onChanged: (val) {
            if (val != null) onSelect(val);
          },
        ),
      ),
    );
  }

  Widget _buildLandAreaManualInput({
    required BuildContext context,
    required AppStateProvider appState,
    required String Function(String) tr,
    required AppLanguage lang,
    required bool isDark,
  }) {
    final farmer = appState.farmerProfile;
    final maxAvailableAcres = farmer.availableAcres;
    final currentTotalPerches = (_allocatedAcres * 160).round();
    final isExceeded = _allocatedAcres > maxAvailableAcres;

    final String acreLabel = lang == AppLanguage.sinhala ? 'අක්කර (Acres)' : (lang == AppLanguage.tamil ? 'ஏக்கர் (Acres)' : 'Acres');
    final String perchLabel = lang == AppLanguage.sinhala ? 'පර්චස් (Perches)' : (lang == AppLanguage.tamil ? 'பேர்ச் (Perches)' : 'Perches');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isExceeded
              ? AppColors.riskCritical
              : (isDark ? const Color(0xFF334155) : context.cardBorder),
          width: isExceeded ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Side-by-side Manual Text Fields
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Acres Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('🌿', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            acreLabel,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: context.titleText,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _acresController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.titleText,
                      ),
                      decoration: InputDecoration(
                        hintText: '0',
                        hintStyle: GoogleFonts.poppins(color: context.subText),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        suffixText: tr('acre_unit'),
                        suffixStyle: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: context.subText,
                        ),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAF8),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : context.cardBorder),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : context.cardBorder),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: isDark ? AppColors.darkEmerald : AppColors.primary,
                            width: 1.5,
                          ),
                        ),
                      ),
                      onChanged: (_) => _onLandAreaChanged(),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Perches Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('📐', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            perchLabel,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: context.titleText,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _perchesController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.titleText,
                      ),
                      decoration: InputDecoration(
                        hintText: '0',
                        hintStyle: GoogleFonts.poppins(color: context.subText),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        suffixText: tr('perch_unit'),
                        suffixStyle: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: context.subText,
                        ),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAF8),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : context.cardBorder),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : context.cardBorder),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: isDark ? AppColors.darkEmerald : AppColors.primary,
                            width: 1.5,
                          ),
                        ),
                      ),
                      onChanged: (_) => _onLandAreaChanged(),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Total Summary & Note Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isExceeded
                  ? AppColors.riskCritical.withValues(alpha: 0.12)
                  : (isDark ? const Color(0xFF0F2E1B) : const Color(0xFFE8F5E9)),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isExceeded
                    ? AppColors.riskCritical.withValues(alpha: 0.4)
                    : (isDark ? AppColors.darkEmerald : AppColors.primary).withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isExceeded ? Icons.warning_amber_rounded : Icons.check_circle_outline_rounded,
                  size: 18,
                  color: isExceeded ? AppColors.riskCritical : (isDark ? AppColors.darkEmerald : AppColors.primaryDark),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: isExceeded
                      ? Text(
                          lang == AppLanguage.sinhala
                              ? 'ඉඩම ප්‍රමාණවත් නොවේ! ඔබට ඇත්තේ ${maxAvailableAcres.toStringAsFixed(1)} Ac පමණි.'
                              : (lang == AppLanguage.tamil
                                  ? 'நிலம் போதாது! உங்களிடம் ${maxAvailableAcres.toStringAsFixed(1)} Ac மட்டுமே உள்ளது.'
                                  : 'Exceeds limit! You only have ${maxAvailableAcres.toStringAsFixed(1)} Ac free.'),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.riskCritical,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${tr('step_land_area')}: ${_allocatedAcres.toStringAsFixed(2)} ${tr('acre_unit')}',
                              style: GoogleFonts.poppins(
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : AppColors.primaryDark,
                              ),
                            ),
                            Text(
                              '($currentTotalPerches ${tr('perch_unit')} • 1 Ac = 160 P)',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: isDark ? AppColors.darkEmerald : AppColors.primaryDark,
                              ),
                            ),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
