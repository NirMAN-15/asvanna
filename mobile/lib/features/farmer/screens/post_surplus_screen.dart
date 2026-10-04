import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/services/mock_data_service.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';

class PostSurplusScreen extends StatefulWidget {
  final Crop? preSelectedCrop;

  const PostSurplusScreen({
    super.key,
    this.preSelectedCrop,
  });

  @override
  State<PostSurplusScreen> createState() => _PostSurplusScreenState();
}

class _PostSurplusScreenState extends State<PostSurplusScreen> {
  final _formKey = GlobalKey<FormState>();
  late Crop _selectedCrop;
  final _quantityController = TextEditingController(text: '350');
  final _priceController = TextEditingController(text: '140');
  final _notesController = TextEditingController(text: 'Fresh harvest, washed and graded in 25kg bags.');

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final crops = appState.availableCrops;
    if (widget.preSelectedCrop != null) {
      _selectedCrop = crops.firstWhere(
        (c) => c.id == widget.preSelectedCrop!.id,
        orElse: () => widget.preSelectedCrop!,
      );
    } else {
      _selectedCrop = crops.isNotEmpty
          ? crops.first
          : MockDataService.getUpcountryCrops().first;
    }
    _priceController.text = (_selectedCrop.currentMarketPricePerKg * 0.75).round().toString();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _priceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _onCropSelected(Crop crop) {
    setState(() {
      _selectedCrop = crop;
      _priceController.text = (crop.currentMarketPricePerKg * 0.75).round().toString();
    });
  }

  void _submit(AppStateProvider appState) {
    if (_formKey.currentState!.validate()) {
      final qty = double.tryParse(_quantityController.text.trim()) ?? 100.0;
      final price = double.tryParse(_priceController.text.trim()) ?? _selectedCrop.currentMarketPricePerKg;
      final lang = appState.currentLanguage;

      appState.addSurplusListing(
        cropName: _selectedCrop.name,
        cropEmoji: _selectedCrop.iconEmoji,
        quantityKg: qty,
        askingPricePerKg: price,
        regularPricePerKg: _selectedCrop.currentMarketPricePerKg,
        isUrgent: false,
        notes: _notesController.text.trim(),
      );

      Navigator.pop(context);

      final cropName = lang == AppLanguage.sinhala ? _selectedCrop.sinhalaName : _selectedCrop.name;
      final successMsg = lang == AppLanguage.sinhala
          ? '$cropName අතිරික්ත අස්වැන්න සාර්ථකව පළ කරන ලදී! 5km ඇතුළත ගැණුම්කරුවන්ට දැනුම් දෙනු ලැබේ.'
          : (lang == AppLanguage.tamil
              ? '$cropName உபரி விளைச்சல் வெற்றிகரமாக பட்டியலிடப்பட்டது! 5 கி.மீ எல்லைக்குள் உள்ள வாங்குபவர்களுக்கு அறிவிக்கப்படும்.'
              : '$cropName surplus listed successfully! Local buyers within 5km are being notified.');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(successMsg),
          backgroundColor: AppColors.badgeHarvest,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    final String currencyUnit = lang == AppLanguage.sinhala ? 'රු.' : (lang == AppLanguage.tamil ? 'ரூ.' : 'Rs.');

    final double qty = double.tryParse(_quantityController.text.trim()) ?? 0.0;
    final double price = double.tryParse(_priceController.text.trim()) ?? 0.0;
    final double totalEstimatedValue = qty * price;

    final String titleText = lang == AppLanguage.sinhala
        ? 'අතිරික්ත අස්වැන්න විකිණීම'
        : (lang == AppLanguage.tamil ? 'உபரி விளைச்சல் விற்பனை' : 'Sell Surplus Produce');

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          titleText,
          style: GoogleFonts.poppins(
            fontSize: 17,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 5km Marketplace Info Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF38230B) : const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? const Color(0xFFD97706).withValues(alpha: 0.5) : const Color(0xFFFDE68A),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD97706).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text('📍', style: TextStyle(fontSize: 22)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == AppLanguage.sinhala
                                ? 'කි.මී. 5 ක්ෂණික ශුන්‍ය නාස්ති වෙළඳපොළ'
                                : (lang == AppLanguage.tamil ? '5 கி.மீ பூஜ்ஜிய விரய சந்தை' : '5km Proximity Marketplace'),
                            style: GoogleFonts.poppins(
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              color: isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            lang == AppLanguage.sinhala
                                ? 'කි.මී. 5 ඇතුළත හෝටල්, උත්සව සැපයුම්කරුවන් සහ තොග ගැනුම්කරුවන් වෙත සෘජුව අලෙවි කරන්න.'
                                : (lang == AppLanguage.tamil
                                    ? '5 கி.மீ எல்லைக்குள் உள்ள வாங்குபவர்களுடன் நேரடியாக இணையுங்கள்.'
                                    : 'Connect directly with event caterers and bulk buyers within 5km.'),
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              color: isDark ? const Color(0xFFFDE68A).withValues(alpha: 0.85) : const Color(0xFFB45309),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Step 1: Select Crop
              Text(
                lang == AppLanguage.sinhala ? '1. බෝගය තෝරන්න' : (lang == AppLanguage.tamil ? '1. பயிரைத் தேர்ந்தெடுக்கவும்' : '1. Select Crop Produce'),
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
                selectedCrop: _selectedCrop,
                activeColor: const Color(0xFFD97706),
                onSelect: _onCropSelected,
                lang: lang,
              ),
              const SizedBox(height: 18),

              // Step 2: Quantity & Asking Price
              Text(
                lang == AppLanguage.sinhala ? '2. ප්‍රමාණය සහ ඔබගේ මිල' : (lang == AppLanguage.tamil ? '2. அளவு மற்றும் விலை' : '2. Quantity & Asking Price'),
                style: GoogleFonts.poppins(
                  fontSize: 14.5,
                  fontWeight: FontWeight.bold,
                  color: context.titleText,
                ),
              ),
              const SizedBox(height: 10),
              _buildQuantityAndPriceCard(
                context: context,
                isDark: isDark,
                lang: lang,
                currencyUnit: currencyUnit,
              ),
              const SizedBox(height: 18),

              // Step 3: Notes / Condition
              Text(
                lang == AppLanguage.sinhala ? '3. අස්වනු තත්ත්වය සහ ඇසුරුම් විස්තර' : (lang == AppLanguage.tamil ? '3. மேலதிக குறிப்புகள்' : '3. Condition & Packaging Notes'),
                style: GoogleFonts.poppins(
                  fontSize: 14.5,
                  fontWeight: FontWeight.bold,
                  color: context.titleText,
                ),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _notesController,
                maxLines: 2,
                style: GoogleFonts.inter(fontSize: 13.5, color: context.titleText),
                decoration: InputDecoration(
                  hintText: lang == AppLanguage.sinhala
                      ? 'උදා: අද උදෑසන නෙළන ලද නැවුම් අස්වැන්න, කිලෝ 25 මළුවල අසුරා ඇත.'
                      : 'e.g. Fresh harvest from this morning, sorted & packed in 25kg crates.',
                  hintStyle: GoogleFonts.inter(fontSize: 12.5, color: context.subText),
                  filled: true,
                  fillColor: context.cardBg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: context.cardBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: context.cardBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: Color(0xFFD97706), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Live Summary Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF38230B) : const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFFFD54F),
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '📦 ${lang == AppLanguage.sinhala ? 'මුළු ප්‍රමාණය' : 'Total Quantity'}:',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                color: isDark ? const Color(0xFFFDE68A) : AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${qty.toStringAsFixed(0)} Kg',
                              style: GoogleFonts.poppins(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: isDark ? Colors.white : const Color(0xFFD97706),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          width: 1,
                          height: 38,
                          color: (isDark ? const Color(0xFFFBBF24) : const Color(0xFFFFD54F)).withValues(alpha: 0.5),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '💰 ${lang == AppLanguage.sinhala ? 'මුළු අපේක්ෂිත වටිනාකම' : 'Total Est. Value'}:',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                color: isDark ? const Color(0xFFFDE68A) : AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '$currencyUnit ${totalEstimatedValue.toStringAsFixed(0)}',
                              style: GoogleFonts.poppins(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: isDark ? const Color(0xFFFCD34D) : const Color(0xFFD97706),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(
                          Icons.radar_rounded,
                          color: isDark ? const Color(0xFFFCD34D) : const Color(0xFFD97706),
                          size: 16,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            lang == AppLanguage.sinhala
                                ? 'කි.මී. 5ක් ඇතුළත ගැණුම්කරුවන්ට ක්ෂණික දැනුම්දීම් ලැබේ'
                                : (lang == AppLanguage.tamil
                                    ? '5 கி.மீ எல்லைக்குள் வாங்குபவர்கள் உடனடியாக இணைக்கப்படுவார்கள்'
                                    : '5km proximity buyers receive instant notification'),
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              color: isDark ? const Color(0xFFFDE68A) : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action Button
              ElevatedButton.icon(
                icon: const Text('📦', style: TextStyle(fontSize: 18)),
                label: Text(
                  lang == AppLanguage.sinhala
                      ? '5km වෙළඳපොළට එක්කරන්න'
                      : (lang == AppLanguage.tamil ? '5 கி.மீ சந்தையில் சேர்க்கவும்' : 'Publish to 5km Marketplace'),
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD97706),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                onPressed: () => _submit(appState),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuantityAndPriceCard({
    required BuildContext context,
    required bool isDark,
    required AppLanguage lang,
    required String currencyUnit,
  }) {
    final double marketPrice = _selectedCrop.currentMarketPricePerKg;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : context.cardBorder,
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Quantity Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('📦', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            lang == AppLanguage.sinhala ? 'ප්‍රමාණය (Kg)' : 'Quantity (Kg)',
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
                      controller: _quantityController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.titleText,
                      ),
                      decoration: InputDecoration(
                        hintText: '0',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        suffixText: 'Kg',
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
                          borderSide: const BorderSide(
                            color: Color(0xFFD97706),
                            width: 1.5,
                          ),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Enter quantity' : null,
                      onChanged: (_) => setState(() {}),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Asking Price Field
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text('💰', style: TextStyle(fontSize: 13)),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            lang == AppLanguage.sinhala ? 'මිල ($currencyUnit/Kg)' : 'Price ($currencyUnit/Kg)',
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
                      controller: _priceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: context.titleText,
                      ),
                      decoration: InputDecoration(
                        hintText: '0',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        suffixText: '$currencyUnit/Kg',
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
                          borderSide: const BorderSide(
                            color: Color(0xFFD97706),
                            width: 1.5,
                          ),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Enter price' : null,
                      onChanged: (_) => setState(() {}),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Market Price Reference Note
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  size: 15,
                  color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    lang == AppLanguage.sinhala
                        ? 'වෙළඳපොළ මිල: $currencyUnit ${marketPrice.toStringAsFixed(0)}/Kg (25% වට්ටමක් නිර්දේශ කෙරේ)'
                        : 'Spot Price: $currencyUnit ${marketPrice.toStringAsFixed(0)}/Kg (25% off recommended)',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: context.subText,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

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
                          '${crop.category} • $currencyUnit ${crop.currentMarketPricePerKg.toStringAsFixed(0)}/kg',
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
                            color: isDark ? const Color(0xFFFBBF24) : const Color(0xFFD97706),
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
}
