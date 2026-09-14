import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
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

  // --- Stage 1: Log Planting Form State ---
  final _plantingFormKey = GlobalKey<FormState>();
  late Crop _selectedPlantingCrop;
  final _acresController = TextEditingController(text: '1.0');
  DateTime _plantingDate = DateTime.now();
  late DateTime _expectedHarvestDate;

  // --- Stage 2: Post Surplus Form State ---
  final _surplusFormKey = GlobalKey<FormState>();
  late Crop _selectedSurplusCrop;
  final _surplusQuantityController = TextEditingController(text: '350');
  final _surplusPriceController = TextEditingController(text: '140');
  final _surplusNotesController = TextEditingController(
    text: 'Fresh harvest, washed and graded in 25kg bags.',
  );
  bool _isUrgentSurplus = true;

  @override
  void initState() {
    super.initState();
    _selectedStage = widget.initialStage;

    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _selectedPlantingCrop = widget.preSelectedCrop ?? appState.availableCrops.first;
    _expectedHarvestDate = _plantingDate.add(Duration(days: _selectedPlantingCrop.maturityDays));

    _selectedSurplusCrop = widget.preSelectedCrop ?? appState.availableCrops.first;
    _surplusPriceController.text =
        (_selectedSurplusCrop.currentMarketPricePerKg * 0.75).toStringAsFixed(0);
  }

  @override
  void dispose() {
    _acresController.dispose();
    _surplusQuantityController.dispose();
    _surplusPriceController.dispose();
    _surplusNotesController.dispose();
    super.dispose();
  }

  // --- Stage 1 Handlers ---
  void _onPlantingCropChanged(Crop newCrop) {
    setState(() {
      _selectedPlantingCrop = newCrop;
      _expectedHarvestDate = _plantingDate.add(Duration(days: newCrop.maturityDays));
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

  void _selectHarvestDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _expectedHarvestDate,
      firstDate: _plantingDate.add(const Duration(days: 15)),
      lastDate: _plantingDate.add(const Duration(days: 200)),
    );
    if (picked != null) {
      setState(() {
        _expectedHarvestDate = picked;
      });
    }
  }

  void _submitPlanting() {
    if (_plantingFormKey.currentState!.validate()) {
      final acres = double.tryParse(_acresController.text) ?? 1.0;
      final appState = Provider.of<AppStateProvider>(context, listen: false);

      final success = appState.addPlantingEntry(
        crop: _selectedPlantingCrop,
        allocatedAcres: acres,
        plantingDate: _plantingDate,
        expectedHarvestDate: _expectedHarvestDate,
      );

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${_selectedPlantingCrop.name} (${_selectedPlantingCrop.sinhalaName}) planting logged successfully! Shared with Agrarian Services.',
            ),
            backgroundColor: AppColors.primary,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Cannot allocate $acres Acres. You only have ${appState.farmerProfile.availableAcres.toStringAsFixed(1)} Acres free.',
            ),
            backgroundColor: AppColors.riskCritical,
          ),
        );
      }
    }
  }

  // --- Stage 2 Handlers ---
  void _onSurplusCropChanged(Crop newCrop) {
    setState(() {
      _selectedSurplusCrop = newCrop;
      _surplusPriceController.text =
          (newCrop.currentMarketPricePerKg * 0.75).toStringAsFixed(0);
    });
  }

  void _submitSurplus() {
    if (_surplusFormKey.currentState!.validate()) {
      final qty = double.tryParse(_surplusQuantityController.text) ?? 100.0;
      final price =
          double.tryParse(_surplusPriceController.text) ?? _selectedSurplusCrop.currentMarketPricePerKg;
      final appState = Provider.of<AppStateProvider>(context, listen: false);

      appState.addSurplusListing(
        cropName: _selectedSurplusCrop.name,
        cropEmoji: _selectedSurplusCrop.iconEmoji,
        quantityKg: qty,
        askingPricePerKg: price,
        regularPricePerKg: _selectedSurplusCrop.currentMarketPricePerKg,
        isUrgent: _isUrgentSurplus,
        notes: _surplusNotesController.text.trim(),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${_selectedSurplusCrop.name} surplus published! Local buyers within 5km are notified.',
          ),
          backgroundColor: AppColors.badgeHarvest,
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          _selectedStage == 0 ? tr('log_planting_title') : 'Post Surplus Produce',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.dashHeaderTitle,
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // 2-Stage Segmented Toggle
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF3EF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStageTab(
                      stageIndex: 0,
                      label: 'Log New Planting',
                      icon: Icons.eco_outlined,
                      activeColor: AppColors.asvannaButtonGreen,
                      isSelected: _selectedStage == 0,
                    ),
                  ),
                  Expanded(
                    child: _buildStageTab(
                      stageIndex: 1,
                      label: 'Post Surplus',
                      icon: Icons.storefront_rounded,
                      activeColor: AppColors.badgeHarvest,
                      isSelected: _selectedStage == 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE5EBE5)),

          // Active Stage Content
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: _selectedStage == 0
                  ? _buildLogPlantingStage(context, appState, tr)
                  : _buildPostSurplusStage(context, appState),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStageTab({
    required int stageIndex,
    required String label,
    required IconData icon,
    required Color activeColor,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedStage = stageIndex;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? activeColor : AppColors.dashHeaderDate,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? activeColor : AppColors.dashHeaderDate,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // STAGE 1: Log New Planting Entry
  // ==========================================
  Widget _buildLogPlantingStage(
    BuildContext context,
    AppStateProvider appState,
    String Function(String) tr,
  ) {
    final farmer = appState.farmerProfile;
    final risk = appState.getRiskForCrop(_selectedPlantingCrop.id);
    final acres = double.tryParse(_acresController.text) ?? 1.0;
    final projectedYield = acres * _selectedPlantingCrop.expectedYieldKgPerAcre;
    final dateFormat = DateFormat('EEE, MMM dd, yyyy');

    return SingleChildScrollView(
      key: const ValueKey('stage_planting'),
      padding: const EdgeInsets.all(18.0),
      child: Form(
        key: _plantingFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Available Acreage Header Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFDCFCE7), width: 1.2),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    tr('available_free_land'),
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.dashHeaderTitle,
                    ),
                  ),
                  Text(
                    '${farmer.availableAcres.toStringAsFixed(1)} / ${farmer.totalLandAcres} Acres',
                    style: GoogleFonts.inter(
                      fontSize: 14.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.asvannaButtonGreen,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Crop Selection Dropdown
            Text(
              tr('select_crop_to_plant'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<Crop>(
              value: _selectedPlantingCrop,
              decoration: InputDecoration(
                labelText: 'Upcountry Vegetable',
                prefixIcon: const Icon(Icons.eco_outlined, color: AppColors.asvannaButtonGreen),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
              ),
              items: appState.availableCrops.map((c) {
                return DropdownMenuItem(
                  value: c,
                  child: Row(
                    children: [
                      Text(c.iconEmoji, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 10),
                      Text('${c.name} (${c.sinhalaName})'),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) _onPlantingCropChanged(val);
              },
            ),
            const SizedBox(height: 14),

            // Regional Risk Status Callout
            if (risk != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: risk.riskLevel == CropRiskLevel.critical
                      ? AppColors.riskCriticalBg
                      : risk.riskLevel == CropRiskLevel.moderate
                          ? AppColors.riskModerateBg
                          : AppColors.riskSafeBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: risk.riskLevel == CropRiskLevel.critical
                        ? AppColors.riskCritical.withOpacity(0.4)
                        : risk.riskLevel == CropRiskLevel.moderate
                            ? AppColors.dashCautionAmber.withOpacity(0.4)
                            : AppColors.asvannaButtonGreen.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      risk.riskLevel == CropRiskLevel.critical
                          ? Icons.warning_amber_rounded
                          : risk.riskLevel == CropRiskLevel.moderate
                              ? Icons.info_outline_rounded
                              : Icons.check_circle_outline,
                      color: risk.riskLevel == CropRiskLevel.critical
                          ? AppColors.riskCritical
                          : risk.riskLevel == CropRiskLevel.moderate
                              ? AppColors.dashCautionText
                              : AppColors.asvannaButtonGreen,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '${risk.riskTitle}: ${risk.saturationPercentage.toStringAsFixed(0)}% regional saturation in ${farmer.agrarianDivision}.',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: risk.riskLevel == CropRiskLevel.critical
                              ? AppColors.riskCritical
                              : risk.riskLevel == CropRiskLevel.moderate
                                  ? AppColors.dashCautionText
                                  : AppColors.asvannaButtonGreen,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
            ],

            // Acreage Input
            Text(
              tr('allocated_land_area'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _acresController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                labelText: 'Cultivated Area (Acres)',
                prefixIcon: const Icon(Icons.square_foot_outlined, color: AppColors.asvannaButtonGreen),
                suffixText: 'Acres',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
              ),
              onChanged: (v) => setState(() {}),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Please enter allocated acreage';
                final val = double.tryParse(v);
                if (val == null || val <= 0) return 'Enter a valid number';
                if (val > farmer.availableAcres) {
                  return 'Exceeds available land (${farmer.availableAcres.toStringAsFixed(1)} Acres)';
                }
                return null;
              },
            ),
            const SizedBox(height: 18),

            // Cultivation Schedule (Sowing & Expected Harvest Date)
            Text(
              tr('cultivation_schedule'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            const SizedBox(height: 8),

            // Sowing Date
            InkWell(
              onTap: _selectPlantingDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5EBE5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, color: AppColors.asvannaButtonGreen, size: 20),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Sowing / Planting Date',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.dashHeaderDate),
                        ),
                        Text(
                          dateFormat.format(_plantingDate),
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Spacer(),
                    const Icon(Icons.edit_calendar, size: 18, color: AppColors.dashHeaderDate),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Expected Harvest Date
            InkWell(
              onTap: _selectHarvestDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5EBE5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.event_available_outlined, color: AppColors.badgeHarvest, size: 20),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Expected Harvest Date (~${_selectedPlantingCrop.maturityDays} days)',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.dashHeaderDate),
                        ),
                        Text(
                          dateFormat.format(_expectedHarvestDate),
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Spacer(),
                    const Icon(Icons.edit_calendar, size: 18, color: AppColors.dashHeaderDate),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Projected Yield & Farmgate Revenue Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEFF3EF)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
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
                      Text(
                        'Projected Yield:',
                        style: GoogleFonts.inter(fontSize: 13, color: AppColors.dashHeaderDate),
                      ),
                      Text(
                        '~${projectedYield.toStringAsFixed(0)} Kg',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.asvannaButtonGreen,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Est. Farmgate Revenue:',
                        style: GoogleFonts.inter(fontSize: 13, color: AppColors.dashHeaderDate),
                      ),
                      Text(
                        'Rs. ${(projectedYield * _selectedPlantingCrop.currentMarketPricePerKg).toStringAsFixed(0)}',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.badgeHarvest,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Planting Button
            ElevatedButton.icon(
              icon: const Icon(Icons.check_circle_outline, color: Colors.white),
              label: Text(
                tr('submit_planting_btn'),
                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.asvannaButtonGreen,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _submitPlanting,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // STAGE 2: Post Surplus Produce
  // ==========================================
  Widget _buildPostSurplusStage(BuildContext context, AppStateProvider appState) {
    final qty = double.tryParse(_surplusQuantityController.text) ?? 0.0;
    final price = double.tryParse(_surplusPriceController.text) ?? 0.0;
    final totalEstimatedValue = qty * price;

    return SingleChildScrollView(
      key: const ValueKey('stage_surplus'),
      padding: const EdgeInsets.all(18.0),
      child: Form(
        key: _surplusFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Proximity Marketplace Info Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8F0),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFFD199), width: 1.2),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.badgeHarvest.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.storefront_rounded,
                      color: AppColors.badgeHarvest,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '5km Proximity Zero-Waste Market',
                          style: GoogleFonts.poppins(
                            fontSize: 13.5,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF943A00),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Broadcast directly to registered event caterers, hotels, and bulk buyers within 5km for immediate pickup.',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: const Color(0xFF78350F),
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Select Crop Dropdown
            Text(
              'Select Harvested Crop',
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<Crop>(
              value: _selectedSurplusCrop,
              decoration: InputDecoration(
                labelText: 'Crop Produce',
                prefixIcon: const Icon(Icons.eco_outlined, color: AppColors.badgeHarvest),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
              ),
              items: appState.availableCrops.map((c) {
                return DropdownMenuItem(
                  value: c,
                  child: Row(
                    children: [
                      Text(c.iconEmoji, style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 10),
                      Text('${c.name} (${c.sinhalaName})'),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) _onSurplusCropChanged(val);
              },
            ),
            const SizedBox(height: 16),

            // Quantity & Asking Price Row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Available Quantity',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.dashHeaderTitle,
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _surplusQuantityController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(
                          hintText: 'e.g. 350',
                          suffixText: 'Kg',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                          ),
                        ),
                        onChanged: (v) => setState(() {}),
                        validator: (v) => v == null || v.isEmpty ? 'Enter quantity' : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Asking Price',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.dashHeaderTitle,
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _surplusPriceController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(
                          hintText: 'e.g. 140',
                          prefixText: 'Rs. ',
                          suffixText: '/Kg',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                          ),
                        ),
                        onChanged: (v) => setState(() {}),
                        validator: (v) => v == null || v.isEmpty ? 'Enter price' : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Wholesale Market Benchmark: Rs. ${_selectedSurplusCrop.currentMarketPricePerKg.toStringAsFixed(0)}/Kg',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.dashHeaderDate),
            ),
            const SizedBox(height: 16),

            // Urgent Perishable Clearance Switch
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5EBE5)),
              ),
              child: SwitchListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                title: Text(
                  'Urgent Perishable Clearance',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 13.5,
                    color: AppColors.dashHeaderTitle,
                  ),
                ),
                subtitle: Text(
                  'Priority push notification to buyers within 5km radius',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.dashHeaderDate),
                ),
                value: _isUrgentSurplus,
                activeColor: AppColors.badgeHarvest,
                onChanged: (val) => setState(() => _isUrgentSurplus = val),
              ),
            ),
            const SizedBox(height: 16),

            // Quality & Condition Notes
            Text(
              'Produce Condition / Packaging Notes',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _surplusNotesController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'e.g. Freshly harvested this morning, washed and bagged in 25kg crates.',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5EBE5)),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Total Estimated Value Calculation Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEFF3EF)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Listing Value:',
                    style: GoogleFonts.inter(fontSize: 13.5, color: AppColors.dashHeaderDate),
                  ),
                  Text(
                    'Rs. ${totalEstimatedValue.toStringAsFixed(0)}',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.badgeHarvest,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Publish Surplus Button
            ElevatedButton.icon(
              icon: const Icon(Icons.send_rounded, color: Colors.white),
              label: Text(
                'Publish to 5km Marketplace',
                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.badgeHarvest,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _submitSurplus,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
