import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/surplus_listing_model.dart';
import '../../../core/localization/app_translations.dart';
import '../../../core/widgets/language_selection_dialog.dart';
import 'surplus_detail_screen.dart';

class ProximityMarketplaceScreen extends StatefulWidget {
  final void Function(int tabIndex)? onTabSelected;

  const ProximityMarketplaceScreen({super.key, this.onTabSelected});

  @override
  State<ProximityMarketplaceScreen> createState() => _ProximityMarketplaceScreenState();
}

class _ProximityMarketplaceScreenState extends State<ProximityMarketplaceScreen> {
  String _selectedCategory = 'All';
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  bool _showRadiusFilter = false;
  bool _isProductDropdownOpen = false;
  String _selectedCropKey = '';

  final List<Map<String, String>> _productList = [
    {
      'key': '',
      'en': 'All Products',
      'si': 'සියලු නිෂ්පාදන',
      'ta': 'அனைத்து பொருட்கள்',
      'emoji': '🌿',
    },
    {
      'key': 'leeks',
      'en': 'Leeks',
      'si': 'ලීක්ස්',
      'ta': 'லீக்ஸ்',
      'emoji': '🥬',
    },
    {
      'key': 'tomato',
      'en': 'Tomatoes',
      'si': 'තක්කාලි',
      'ta': 'தக்காளி',
      'emoji': '🍅',
    },
    {
      'key': 'carrot',
      'en': 'Carrots',
      'si': 'කැරට්',
      'ta': 'கேரட்',
      'emoji': '🥕',
    },
    {
      'key': 'cabbage',
      'en': 'Cabbage',
      'si': 'ගෝවා',
      'ta': 'முட்டைக்கோஸ்',
      'emoji': '🥗',
    },
    {
      'key': 'beetroot',
      'en': 'Beetroot',
      'si': 'බීට්රූට්',
      'ta': 'பீட்ரூட்',
      'emoji': '🟣',
    },
    {
      'key': 'rice',
      'en': 'Red Rice',
      'si': 'රතු සහල්',
      'ta': 'சிவப்பு அரிசி',
      'emoji': '🌾',
    },
    {
      'key': 'banana',
      'en': 'Banana (Ambul)',
      'si': 'ඇඹුල් කෙසෙල්',
      'ta': 'வாழைப்பழம்',
      'emoji': '🍌',
    },
    {
      'key': 'chilli',
      'en': 'Green Chilli',
      'si': 'අමු මිරිස්',
      'ta': 'பச்சை மிளகாய்',
      'emoji': '🌶️',
    },
    {
      'key': 'pepper',
      'en': 'Bell Pepper (Capsicum)',
      'si': 'මාළු මිරිස්',
      'ta': 'குடைமிளகாய்',
      'emoji': '🫑',
    },
    {
      'key': 'beans',
      'en': 'Green Beans',
      'si': 'බෝංචි',
      'ta': 'பீன்ස්',
      'emoji': '🫘',
    },
    {
      'key': 'potato',
      'en': 'Upcountry Potato',
      'si': 'අර්තාපල්',
      'ta': 'உருளைக்கிழங்கு',
      'emoji': '🥔',
    },
  ];


  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _getDynamicGreeting(String Function(String) tr) {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return tr('greeting_morning');
    } else if (hour < 17) {
      return tr('greeting_afternoon');
    } else {
      return tr('greeting_evening');
    }
  }

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showLanguageSelectionDialog(context, appState);
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final buyer = appState.buyerProfile;
    final greeting = _getDynamicGreeting(tr);
    final ownerName = buyer?.ownerName ?? 'Kamal Perera';
    final businessName = buyer?.businessName ?? 'Fresh Mart';
    final categoryName = buyer?.category ?? 'Retail Shop';
    final locationName = buyer?.locationAddress ?? 'Anuradhapura';

    String langLabel = 'සිංහල';
    if (lang == AppLanguage.english) langLabel = 'English';
    if (lang == AppLanguage.tamil) langLabel = 'தமிழ்';

    // Filter listings by radius, category, and search query
    final listings = appState.surplusListings.where((l) {
      if (l.distanceKm > appState.selectedRadiusKm) return false;
      if (_selectedCategory != 'All' && l.category.toLowerCase() != _selectedCategory.toLowerCase()) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final selectedKey = _selectedCropKey.toLowerCase();
        final matchCrop = l.cropName.toLowerCase().contains(query) ||
            (selectedKey.isNotEmpty && l.cropName.toLowerCase().contains(selectedKey));
        final matchVariety = l.variety.toLowerCase().contains(query);
        final matchFarmer = l.farmerName.toLowerCase().contains(query);
        if (!matchCrop && !matchVariety && !matchFarmer) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.asvannaButtonGreen,
          onRefresh: () async {
            await Future.delayed(const Duration(milliseconds: 300));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── 1. HEADER BAR (Logo + App Name | Language + Bell Badge) ──
                _buildHeaderBar(context, appState, langLabel),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 14),

                      // ── 2. GREETING & BUYER IDENTITY SECTION ──
                      _buildGreetingSection(context, greeting, ownerName, businessName, categoryName, locationName),
                      const SizedBox(height: 14),

                      // ── 3. SEARCH BAR & FILTER BUTTON ──
                      _buildSearchBar(context, isDark, tr, lang),
                      const SizedBox(height: 12),

                      // ── 3B. EXPANDABLE PROXIMITY RADIUS SLIDER ──
                      if (_showRadiusFilter) ...[
                        _buildRadiusSliderCard(context, appState, isDark, tr),
                        const SizedBox(height: 12),
                      ],


                      // ── 6. SECTION HEADER ("Fresh Near You") ──
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                const Text('🌿', style: TextStyle(fontSize: 18)),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    tr('fresh_near_you'),
                                    style: GoogleFonts.poppins(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                      color: context.titleText,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _selectedCategory = 'All';
                                _searchQuery = '';
                                _selectedCropKey = '';
                                _isProductDropdownOpen = false;
                                _searchController.clear();
                              });
                            },
                            child: Text(
                              'See All >',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // ── 7. PRODUCT CARDS (HORIZONTAL LIST) ──
                      if (listings.isEmpty)
                        _buildEmptyState(context, isDark)
                      else
                        ...listings.map((item) => _buildProductCard(context, item, isDark)),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // 1. Header Bar with Logo
  Widget _buildHeaderBar(BuildContext context, AppStateProvider appState, String langLabel) {
    final isDark = context.isDarkMode;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE8F0E8),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset(
                'assets/images/aswanna_logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.asvannaButtonGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.eco_rounded, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Aswenna',
                style: GoogleFonts.poppins(
                  fontSize: 21,
                  fontWeight: FontWeight.w800,
                  color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                  letterSpacing: -0.5,
                  height: 1.0,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Language selector
          GestureDetector(
            onTap: () => _showLanguageDialog(context, appState),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFD4E6D4),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    langLabel,
                    style: appState.currentLanguage == AppLanguage.tamil
                        ? GoogleFonts.notoSansTamil(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: context.titleText,
                          )
                        : (appState.currentLanguage == AppLanguage.sinhala
                            ? GoogleFonts.notoSansSinhala(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: context.titleText,
                              )
                            : GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: context.titleText,
                              )),
                  ),
                  const SizedBox(width: 3),
                  Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: context.subText),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Notification Bell with Badge
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFD4E6D4),
                    width: 1,
                  ),
                ),
                child: Icon(
                  Icons.notifications_outlined,
                  size: 20,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Color(0xFFDC2626),
                    shape: BoxShape.circle,
                  ),
                  child: const Text(
                    '2',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white, height: 1),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. Greeting Section
  Widget _buildGreetingSection(
    BuildContext context,
    String greeting,
    String ownerName,
    String businessName,
    String categoryName,
    String locationName,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$greeting 👋',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: context.subText,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          ownerName,
          style: GoogleFonts.poppins(
            fontSize: 23,
            fontWeight: FontWeight.w800,
            color: context.titleText,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 3),
        Row(
          children: [
            Icon(Icons.storefront_rounded, size: 14, color: context.subText),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                '$businessName — $categoryName',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: context.subText,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Row(
          children: [
            Icon(Icons.location_on_rounded, size: 14, color: context.subText),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                locationName,
                style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 3. Search Bar with Dropdown List
  Widget _buildSearchBar(BuildContext context, bool isDark, String Function(String) tr, AppLanguage lang) {
    final langKey = lang == AppLanguage.sinhala ? 'si' : (lang == AppLanguage.tamil ? 'ta' : 'en');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _isProductDropdownOpen
                        ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                        : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                    width: _isProductDropdownOpen ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(left: 12, right: 8),
                      child: Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
                        onTap: () {
                          setState(() => _isProductDropdownOpen = true);
                        },
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val.trim();
                            _selectedCropKey = '';
                            _isProductDropdownOpen = true;
                          });
                        },
                        decoration: InputDecoration(
                          hintText: tr('search_products'),
                          hintStyle: GoogleFonts.inter(fontSize: 13, color: context.subText),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    if (_searchQuery.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                            _selectedCropKey = '';
                          });
                        },
                      ),
                    // Dropdown list toggle arrow
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _isProductDropdownOpen = !_isProductDropdownOpen;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        color: Colors.transparent,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              height: 22,
                              width: 1,
                              color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              _isProductDropdownOpen
                                  ? Icons.keyboard_arrow_up_rounded
                                  : Icons.keyboard_arrow_down_rounded,
                              size: 22,
                              color: _isProductDropdownOpen
                                  ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                                  : const Color(0xFF64748B),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () {
                setState(() => _showRadiusFilter = !_showRadiusFilter);
              },
              child: Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: _showRadiusFilter
                      ? (isDark ? const Color(0xFF16A34A) : AppColors.asvannaButtonGreen)
                      : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1)),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _showRadiusFilter
                        ? Colors.transparent
                        : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  ),
                ),
                child: Icon(
                  Icons.tune_rounded,
                  color: _showRadiusFilter ? Colors.white : context.titleText,
                  size: 20,
                ),
              ),
            ),
          ],
        ),

        // Dropdown List Popup / Menu Container
        if (_isProductDropdownOpen) ...[
          const SizedBox(height: 8),
          _buildProductDropdownMenu(context, isDark, langKey),
        ],
      ],
    );
  }

  Widget _buildProductDropdownMenu(BuildContext context, bool isDark, String langKey) {
    final query = _searchQuery.toLowerCase();
    final filteredProducts = _productList.where((p) {
      if (query.isEmpty) return true;
      final en = (p['en'] ?? '').toLowerCase();
      final si = (p['si'] ?? '').toLowerCase();
      final ta = (p['ta'] ?? '').toLowerCase();
      final key = (p['key'] ?? '').toLowerCase();
      return en.contains(query) || si.contains(query) || ta.contains(query) || key.contains(query);
    }).toList();

    return Container(
      constraints: const BoxConstraints(maxHeight: 250),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF16A34A).withValues(alpha: 0.6) : const Color(0xFF86EFAC),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header of dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF132B20) : const Color(0xFFE8F5E9),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.list_alt_rounded, size: 16, color: Color(0xFF15803D)),
                    const SizedBox(width: 6),
                    Text(
                      langKey == 'si'
                          ? 'නිෂ්පාදන ලැයිස්තුව (තෝරන්න)'
                          : (langKey == 'ta' ? 'பொருட்கள் பட்டியல்' : 'Products Dropdown List'),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF15803D),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => setState(() => _isProductDropdownOpen = false),
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    ),
                    child: Icon(Icons.close_rounded, size: 16, color: context.subText),
                  ),
                ),
              ],
            ),
          ),

          // Scrollable item list
          Flexible(
            child: filteredProducts.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      langKey == 'si' ? 'ගැලපෙන නිෂ්පාදන හමු නොවීය' : 'No matching products found',
                      style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    itemCount: filteredProducts.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      thickness: 0.5,
                      color: context.dividerColor,
                      indent: 14,
                      endIndent: 14,
                    ),
                    itemBuilder: (context, index) {
                      final item = filteredProducts[index];
                      final isSelected = (_selectedCropKey.isEmpty && item['key']!.isEmpty) ||
                          (_selectedCropKey.isNotEmpty && _selectedCropKey.toLowerCase() == item['key']!.toLowerCase());

                      final displayName = item[langKey] ?? item['en']!;
                      final secondaryName = langKey != 'en' ? item['en']! : '';

                      return InkWell(
                        onTap: () {
                          setState(() {
                            if (item['key']!.isEmpty) {
                              _searchController.clear();
                              _searchQuery = '';
                              _selectedCropKey = '';
                            } else {
                              _selectedCropKey = item['key']!;
                              _searchQuery = item['key']!;
                              _searchController.text = item['en']!;
                            }
                            _isProductDropdownOpen = false;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          color: isSelected
                              ? (isDark ? const Color(0xFF16A34A).withValues(alpha: 0.15) : const Color(0xFFE8F5E9))
                              : Colors.transparent,
                          child: Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
                                  shape: BoxShape.circle,
                                ),
                                alignment: Alignment.center,
                                child: Text(item['emoji'] ?? '🌿', style: const TextStyle(fontSize: 16)),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      displayName,
                                      style: GoogleFonts.inter(
                                        fontSize: 13,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                        color: isSelected
                                            ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                                            : context.titleText,
                                      ),
                                    ),
                                    if (secondaryName.isNotEmpty)
                                      Text(
                                        secondaryName,
                                        style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                                      ),
                                  ],
                                ),
                              ),
                              if (isSelected)
                                const Icon(
                                  Icons.check_circle_rounded,
                                  color: AppColors.asvannaButtonGreen,
                                  size: 18,
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // 3B. Expandable Radius Slider Card
  Widget _buildRadiusSliderCard(BuildContext context, AppStateProvider appState, bool isDark, String Function(String) tr) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF22C55E).withValues(alpha: 0.4) : const Color(0xFFBBF7D0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
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
                    const Icon(Icons.radar_rounded, color: Color(0xFF16A34A), size: 20),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        tr('proximity_radius'),
                        style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: context.titleText),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF14532D) : const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Within ${appState.selectedRadiusKm.toStringAsFixed(0)} KM',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D),
                  ),
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.asvannaButtonGreen,
              inactiveTrackColor: isDark ? const Color(0xFF334155) : const Color(0xFFDCFCE7),
              thumbColor: AppColors.asvannaButtonGreen,
              trackHeight: 4,
            ),
            child: Slider(
              value: appState.selectedRadiusKm,
              min: 1.0,
              max: 20.0,
              divisions: 19,
              onChanged: (val) => appState.setMarketRadius(val),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('1 KM (Local)', style: GoogleFonts.inter(fontSize: 11, color: context.subText)),
              Text('5 KM (Fresh Zone)', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF16A34A))),
              Text('20 KM (Regional)', style: GoogleFonts.inter(fontSize: 11, color: context.subText)),
            ],
          ),
        ],
      ),
    );
  }


  // 7. Product Card (Horizontal Layout)
  Widget _buildProductCard(BuildContext context, SurplusListing item, bool isDark) {
    final isHarvestToday = item.freshnessBadge.contains('today');
    final badgeBg = isHarvestToday
        ? (isDark ? const Color(0xFF14532D) : const Color(0xFFDCFCE7))
        : (isDark ? const Color(0xFF78350F) : const Color(0xFFFEF3C7));
    final badgeTextColor = isHarvestToday
        ? (isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D))
        : (isDark ? const Color(0xFFFDE68A) : const Color(0xFFB45309));
    final badgeIcon = isHarvestToday ? '🟢' : '🟡';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => SurplusDetailScreen(listing: item)),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: item.isUrgent
                ? const Color(0xFFEF4444).withValues(alpha: 0.5)
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            width: item.isUrgent ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Image
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 95,
                height: 95,
                child: item.imageUrl.isNotEmpty
                    ? Image.network(
                        item.imageUrl,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, progress) {
                          if (progress == null) return child;
                          return Container(
                            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                            child: const Center(
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.asvannaButtonGreen),
                              ),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) => _buildImageFallback(item, isDark),
                      )
                    : _buildImageFallback(item, isDark),
              ),
            ),
            const SizedBox(width: 10),

            // Right Content Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Crop Name & Variety
                  Text(
                    '${item.cropName} — ${item.variety}',
                    style: GoogleFonts.poppins(
                      fontSize: 14.5,
                      fontWeight: FontWeight.bold,
                      color: context.titleText,
                      height: 1.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),

                  // Price
                  Text(
                    'Rs. ${item.askingPricePerKgLkr.toStringAsFixed(0)}/kg',
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D),
                    ),
                  ),
                  const SizedBox(height: 2),

                  // Farmer & Distance
                  Text(
                    '🌾 Farmer: ${item.farmerName} • 📍 ${item.distanceKm.toStringAsFixed(1)}km away',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: context.subText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Freshness badge & Available Quantity Bar (Responsive Wrap)
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      // Freshness badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: badgeBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$badgeIcon ${item.freshnessBadge}',
                          style: GoogleFonts.inter(
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: badgeTextColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),

                      // Quantity info
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Available: ${item.availableQuantityKg.toStringAsFixed(0)}kg',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: context.titleText,
                            ),
                            maxLines: 1,
                          ),
                          const SizedBox(height: 2),
                          Container(
                            width: 50,
                            height: 3.5,
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: (item.availableQuantityKg / 500).clamp(0.2, 1.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.asvannaButtonGreen,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageFallback(SurplusListing item, bool isDark) {
    return Container(
      color: isDark ? const Color(0xFF1E3A2F) : const Color(0xFFE8F5E9),
      child: Center(
        child: Text(item.cropEmoji, style: const TextStyle(fontSize: 40)),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Text('🥬', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text(
            'No surplus batches found',
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: context.titleText),
          ),
          const SizedBox(height: 6),
          Text(
            'Try widening your radius slider above or searching for another crop.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 12, color: context.subText),
          ),
        ],
      ),
    );
  }
}
