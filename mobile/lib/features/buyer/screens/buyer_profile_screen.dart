import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/buyer_model.dart';
import '../../../core/models/buyer_preferences_model.dart';
import '../../../core/widgets/language_selection_dialog.dart';
import '../../auth/login_screen.dart';

class BuyerProfileScreen extends StatelessWidget {
  final void Function(int tabIndex)? onTabSelected;

  const BuyerProfileScreen({super.key, this.onTabSelected});

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showLanguageSelectionDialog(context, appState);
  }

  void _showEditProfileDialog(BuildContext context, AppStateProvider appState) {
    final buyer = appState.buyerProfile;
    final nameController = TextEditingController(text: buyer?.ownerName ?? 'Kamal Perera');
    final businessController = TextEditingController(text: buyer?.businessName ?? 'Fresh Mart');
    final phoneController = TextEditingController(text: buyer?.phone ?? '071 234 5678');
    final addressController = TextEditingController(text: buyer?.locationAddress ?? 'Anuradhapura Town');

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Edit Buyer Profile',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18, color: context.titleText),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Owner / Contact Name'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: businessController,
                decoration: const InputDecoration(labelText: 'Business Name'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(labelText: 'Location / City'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.asvannaButtonGreen),
            onPressed: () {
              if (buyer != null) {
                appState.registerBuyer(
                  businessName: businessController.text.trim(),
                  ownerName: nameController.text.trim(),
                  phone: phoneController.text.trim(),
                  category: buyer.category,
                  address: addressController.text.trim(),
                  weeklyCapacityKg: buyer.weeklyPurchaseCapacityKg,
                );
              }
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Buyer profile updated successfully!')),
              );
            },
            child: const Text('Save Changes', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    final buyer = appState.buyerProfile;

    String langLabel = 'සිංහල';
    if (lang == AppLanguage.english) langLabel = 'English';
    if (lang == AppLanguage.tamil) langLabel = 'தமிழ்';

    final totalOrders = appState.buyerOrders.length;
    final totalSpent = appState.totalBuyerSpent;
    final totalSpentFormatted = totalSpent > 0 ? 'Rs. ${totalSpent.toStringAsFixed(0)}' : 'Rs. 45,000';
    final farmersCount = appState.uniqueFarmersCount > 0 ? appState.uniqueFarmersCount : 8;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── 1. HEADER BAR (Logo + App Name | Language + Bell) ──
              _buildHeaderBar(context, appState, langLabel),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                child: Column(
                  children: [
                    // ── 2. PROFILE HERO SECTION ──
                    _buildProfileHeroCard(context, appState, buyer, isDark),
                    const SizedBox(height: 16),

                    // ── 3. STATS ROW (3 boxes) ──
                    _buildStatsRow(context, isDark, totalOrders, totalSpentFormatted, farmersCount),
                    const SizedBox(height: 18),

                    // ── 4. MENU LIST CARD ──
                    _buildMenuListCard(context, appState, isDark, langLabel),
                    const SizedBox(height: 20),

                    // ── 5. LOGOUT BUTTON ──
                    OutlinedButton.icon(
                      icon: const Icon(Icons.logout_rounded, color: Color(0xFFDC2626)),
                      label: Text(
                        'Logout',
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFDC2626),
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFFCA5A5), width: 1.5),
                        backgroundColor: isDark ? const Color(0xFF450A0A).withValues(alpha: 0.3) : const Color(0xFFFEF2F2),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        appState.logout();
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.buyer)),
                          (route) => false,
                        );
                      },
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ],
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
        ],
      ),
    );
  }

  // 2. Profile Hero Section
  Widget _buildProfileHeroCard(BuildContext context, AppStateProvider appState, BuyerProfile? buyer, bool isDark) {
    final ownerName = buyer?.ownerName ?? 'Kamal Perera';
    final businessName = buyer?.businessName ?? 'Fresh Mart';
    final category = buyer?.category ?? 'Retail Shop';
    final location = buyer?.locationAddress ?? 'Anuradhapura';
    final phone = buyer?.phone ?? '071 234 5678';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF143E23).withValues(alpha: 0.35) : const Color(0xFFE8F5E9).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isDark ? const Color(0xFF22C55E).withValues(alpha: 0.3) : const Color(0xFFC8E6C9),
          width: 1.2,
        ),
      ),
      child: Column(
        children: [
          // Circular Avatar
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              border: Border.all(color: const Color(0xFF16A34A), width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: const Icon(
              Icons.person_rounded,
              size: 44,
              color: Color(0xFF16A34A),
            ),
          ),
          const SizedBox(height: 12),

          // Owner Name
          Text(
            ownerName,
            style: GoogleFonts.poppins(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 4),

          // Business Name + Category Pill
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '🏪 $businessName',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: context.subText,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF166534) : const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? const Color(0xFF22C55E) : const Color(0xFF86EFAC),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  category,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Contact Details
          Text(
            '📍 $location',
            style: GoogleFonts.inter(fontSize: 13, color: context.subText),
          ),
          const SizedBox(height: 2),
          Text(
            '📞 $phone',
            style: GoogleFonts.inter(fontSize: 13, color: context.subText),
          ),
          const SizedBox(height: 2),
          Text(
            '📅 Joined Oct 2026',
            style: GoogleFonts.inter(fontSize: 12, color: context.subText.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 14),

          // Edit Profile Button
          OutlinedButton.icon(
            icon: const Icon(Icons.edit_outlined, size: 16),
            label: Text(
              'Edit Profile',
              style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
              side: BorderSide(
                color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                width: 1.5,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              backgroundColor: isDark ? Colors.transparent : Colors.white.withValues(alpha: 0.9),
            ),
            onPressed: () => _showEditProfileDialog(context, appState),
          ),
        ],
      ),
    );
  }

  // 3. Stats Row
  Widget _buildStatsRow(BuildContext context, bool isDark, int totalOrders, String totalSpent, int farmersCount) {
    return Row(
      children: [
        Expanded(
          child: _buildStatBox(
            context,
            isDark,
            '$totalOrders',
            'Total Orders',
            const Color(0xFF15803D),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatBox(
            context,
            isDark,
            totalSpent,
            'Total Spent',
            const Color(0xFFD97706),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatBox(
            context,
            isDark,
            '$farmersCount',
            'Farmers\nConnected',
            const Color(0xFF0284C7),
          ),
        ),
      ],
    );
  }

  Widget _buildStatBox(BuildContext context, bool isDark, String value, String label, Color accentColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            value,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: context.titleText,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: context.subText,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  // 4. Menu List Card
  Widget _buildMenuListCard(BuildContext context, AppStateProvider appState, bool isDark, String langLabel) {
    final prefs = appState.procurementPreferences;
    final unreadCount = appState.unreadNotificationsCount;

    return Container(
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // 1. Language
          _buildMenuItem(
            icon: Icons.language_rounded,
            iconColor: const Color(0xFF0284C7),
            title: 'Language',
            subtitle: 'සිංහල / English / தமிழ்',
            trailingText: langLabel,
            onTap: () => _showLanguageDialog(context, appState),
            context: context,
          ),
          _buildDivider(context),

          // 2. Procurement Preferences
          _buildMenuItem(
            icon: Icons.tune_rounded,
            iconColor: const Color(0xFF16A34A),
            title: 'Procurement Preferences',
            subtitle: '${prefs.maxRadiusKm.toInt()}km radius • ${prefs.weeklyCapacityKg.toInt()} kg/wk',
            trailingText: '${prefs.preferredCrops.length} crops',
            onTap: () => _showProcurementPreferencesSheet(context, appState),
            context: context,
          ),
          _buildDivider(context),

          // 3. Notification System
          _buildMenuItem(
            icon: Icons.notifications_active_outlined,
            iconColor: const Color(0xFFCA8A04),
            title: 'Notification System',
            subtitle: 'Surplus alerts, order updates & alerts',
            badgeCount: unreadCount,
            onTap: () => _showNotificationSystemSheet(context, appState),
            context: context,
          ),
          _buildDivider(context),

          // 4. Change Password
          _buildMenuItem(
            icon: Icons.lock_reset_rounded,
            iconColor: const Color(0xFF2563EB),
            title: 'Change Password',
            subtitle: 'Update account security credentials',
            onTap: () => _showChangePasswordDialog(context, appState),
            context: context,
          ),
          _buildDivider(context),

          // 5. Terms & Privacy
          _buildMenuItem(
            icon: Icons.description_outlined,
            iconColor: const Color(0xFF64748B),
            title: 'Terms & Privacy',
            subtitle: 'Zero-waste policy & 5km farmgate charter',
            onTap: () {
              showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  backgroundColor: context.cardBg,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  title: const Text('Terms & Zero-Waste Policy'),
                  content: const Text(
                    'Aswenna connects commercial food buyers with verified smallholder farmers within a 5km proximity radius to eliminate food waste and guarantee fresh produce.\n\nAll transactions are backed by farmgate verification vouchers with 0% broker commission.',
                  ),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
                  ],
                ),
              );
            },
            context: context,
          ),
        ],
      ),
    );
  }

  // Procurement Preferences Bottom Sheet
  void _showProcurementPreferencesSheet(BuildContext context, AppStateProvider appState) {
    final isDark = context.isDarkMode;
    final currentPrefs = appState.procurementPreferences;

    final allCategories = [
      'Upcountry Vegetables',
      'Root Vegetables',
      'Leafy Greens',
      'Adaptable Vegetables',
      'Spices & Herbs'
    ];

    final allCrops = [
      'Carrot', 'Leeks', 'Potato', 'Beetroot',
      'Cabbage', 'Green Beans', 'Tomato', 'Capsicum',
      'Knol-Khol', 'Radish', 'Spring Onion', 'Broccoli'
    ];

    List<String> selectedCategories = List.from(currentPrefs.preferredCategories);
    List<String> selectedCrops = List.from(currentPrefs.preferredCrops);
    double capacity = currentPrefs.weeklyCapacityKg;
    double radius = currentPrefs.maxRadiusKm;
    String frequency = currentPrefs.frequency;
    String deliveryMode = currentPrefs.deliveryMode;
    bool autoAlert = currentPrefs.autoAlertOnSurplus;
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Container(
              height: MediaQuery.of(sheetContext).size.height * 0.88,
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                children: [
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 12, bottom: 8),
                      width: 48,
                      height: 5,
                      decoration: BoxDecoration(
                        color: context.dividerColor,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF16A34A).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.tune_rounded, color: Color(0xFF16A34A), size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Procurement Preferences',
                                style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  color: context.titleText,
                                ),
                              ),
                              Text(
                                'මිලදී ගැනීමේ මනාප සැකසුම්',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: context.subText,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.close_rounded, color: context.subText),
                          onPressed: () => Navigator.pop(sheetContext),
                        ),
                      ],
                    ),
                  ),
                  Divider(height: 1, color: context.dividerColor),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: context.softGreenBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.asvannaButtonGreen.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.eco_rounded, color: AppColors.asvannaButtonGreen, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Aswenna matches you with local verified farmers within your radius who produce your preferred crops.',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: context.titleText,
                                    height: 1.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Preferred Crop Categories',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: allCategories.map((cat) {
                            final isSelected = selectedCategories.contains(cat);
                            return FilterChip(
                              label: Text(cat),
                              selected: isSelected,
                              labelStyle: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : context.titleText,
                              ),
                              selectedColor: AppColors.asvannaButtonGreen,
                              backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                              checkmarkColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              onSelected: (val) {
                                setModalState(() {
                                  if (val) {
                                    selectedCategories.add(cat);
                                  } else {
                                    selectedCategories.remove(cat);
                                  }
                                });
                              },
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Priority Crops (Target Vegetables)',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: allCrops.map((crop) {
                            final isSelected = selectedCrops.contains(crop);
                            return FilterChip(
                              label: Text(crop),
                              selected: isSelected,
                              labelStyle: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : context.titleText,
                              ),
                              selectedColor: const Color(0xFF15803D),
                              backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                              checkmarkColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              onSelected: (val) {
                                setModalState(() {
                                  if (val) {
                                    selectedCrops.add(crop);
                                  } else {
                                    selectedCrops.remove(crop);
                                  }
                                });
                              },
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Max Sourcing Radius',
                              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.asvannaButtonGreen.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${radius.toStringAsFixed(1)} km',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.asvannaButtonGreen,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Slider(
                          value: radius,
                          min: 1.0,
                          max: 25.0,
                          divisions: 24,
                          activeColor: AppColors.asvannaButtonGreen,
                          onChanged: (val) => setModalState(() => radius = val),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Weekly Purchase Capacity',
                              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${capacity.toInt()} kg / wk',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF2563EB),
                                ),
                              ),
                            ),
                          ],
                        ),
                        Slider(
                          value: capacity,
                          min: 100,
                          max: 5000,
                          divisions: 49,
                          activeColor: const Color(0xFF2563EB),
                          onChanged: (val) => setModalState(() => capacity = val),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'Procurement Frequency',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: ['Daily', '2-3 Times / Wk', 'Weekly'].map((freq) {
                            final isSel = frequency == freq;
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: ChoiceChip(
                                  label: Center(child: Text(freq, style: TextStyle(fontSize: 12, fontWeight: isSel ? FontWeight.bold : FontWeight.normal))),
                                  selected: isSel,
                                  selectedColor: AppColors.asvannaButtonGreen,
                                  labelStyle: TextStyle(color: isSel ? Colors.white : context.titleText),
                                  onSelected: (_) => setModalState(() => frequency = freq),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Delivery & Logistics Mode',
                          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: context.titleText),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: ['Farmgate Direct Pickup', 'Farmer Delivery to Store', 'Flexible'].map((mode) {
                            final isSel = deliveryMode == mode;
                            return ChoiceChip(
                              label: Text(mode),
                              selected: isSel,
                              selectedColor: AppColors.asvannaButtonGreen,
                              labelStyle: TextStyle(color: isSel ? Colors.white : context.titleText, fontSize: 12),
                              onSelected: (_) => setModalState(() => deliveryMode = mode),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 14),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            'Surplus Harvest Priority Alert',
                            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: context.titleText),
                          ),
                          subtitle: Text(
                            'Receive instant notification when matching surplus is posted within radius',
                            style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                          ),
                          value: autoAlert,
                          activeColor: AppColors.asvannaButtonGreen,
                          onChanged: (val) => setModalState(() => autoAlert = val),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.asvannaButtonGreen,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 2,
                        ),
                        onPressed: isSaving ? null : () async {
                          setModalState(() => isSaving = true);
                          final updated = currentPrefs.copyWith(
                            preferredCategories: selectedCategories,
                            preferredCrops: selectedCrops,
                            weeklyCapacityKg: capacity,
                            maxRadiusKm: radius,
                            frequency: frequency,
                            deliveryMode: deliveryMode,
                            autoAlertOnSurplus: autoAlert,
                          );
                          await appState.saveProcurementPreferences(updated);
                          if (sheetContext.mounted) {
                            Navigator.pop(sheetContext);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                backgroundColor: AppColors.dashSafeGreen,
                                content: Text('Procurement preferences saved & synced to cloud!'),
                              ),
                            );
                          }
                        },
                        child: isSaving
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                'Save Preferences / සුරකින්න',
                                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // Notification System Bottom Sheet
  void _showNotificationSystemSheet(BuildContext context, AppStateProvider appState) {
    final notifications = appState.userNotifications;
    final settings = appState.notificationSettings;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return DefaultTabController(
          length: 2,
          child: Container(
            height: MediaQuery.of(sheetContext).size.height * 0.85,
            decoration: BoxDecoration(
              color: context.cardBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              children: [
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 8),
                    width: 48,
                    height: 5,
                    decoration: BoxDecoration(
                      color: context.dividerColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEAB308).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.notifications_active_outlined, color: Color(0xFFCA8A04), size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Notification System',
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                color: context.titleText,
                              ),
                            ),
                            Text(
                              'දැනුම්දීම් සහ ඇඟවීම් පද්ධතිය',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: context.subText,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.close_rounded, color: context.subText),
                        onPressed: () => Navigator.pop(sheetContext),
                      ),
                    ],
                  ),
                ),
                TabBar(
                  labelColor: AppColors.asvannaButtonGreen,
                  unselectedLabelColor: context.subText,
                  indicatorColor: AppColors.asvannaButtonGreen,
                  indicatorWeight: 3,
                  labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
                  tabs: [
                    Tab(
                      text: 'Notifications (${notifications.length})',
                    ),
                    const Tab(
                      text: 'Alert Preferences',
                    ),
                  ],
                ),
                Divider(height: 1, color: context.dividerColor),
                Expanded(
                  child: TabBarView(
                    children: [
                      _buildNotificationsListView(sheetContext, appState),
                      _buildNotificationSettingsView(sheetContext, appState, settings),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildNotificationsListView(BuildContext sheetContext, AppStateProvider appState) {
    final notifications = appState.userNotifications;

    if (notifications.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.notifications_none_rounded, size: 56, color: sheetContext.subText.withValues(alpha: 0.5)),
              const SizedBox(height: 12),
              Text(
                'No new notifications',
                style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: sheetContext.titleText),
              ),
              const SizedBox(height: 6),
              Text(
                'You are all caught up with 5km surplus alerts and order updates.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 12, color: sheetContext.subText),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        if (appState.unreadNotificationsCount > 0)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${appState.unreadNotificationsCount} Unread',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.dashAlertRed),
                ),
                TextButton.icon(
                  icon: const Icon(Icons.done_all_rounded, size: 16, color: AppColors.asvannaButtonGreen),
                  label: Text('Mark all as read', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.asvannaButtonGreen)),
                  onPressed: () => appState.markAllNotificationsAsRead(),
                ),
              ],
            ),
          ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => Divider(height: 1, color: sheetContext.dividerColor),
            itemBuilder: (context, index) {
              final n = notifications[index];
              final isRead = n.status.toUpperCase() == 'READ';
              IconData icon = Icons.notifications_rounded;
              Color iconCol = const Color(0xFFEAB308);

              if (n.type.toLowerCase().contains('order')) {
                icon = Icons.receipt_long_rounded;
                iconCol = const Color(0xFF3B82F6);
              } else if (n.type.toLowerCase().contains('surplus')) {
                icon = Icons.eco_rounded;
                iconCol = const Color(0xFF16A34A);
              } else if (n.type.toLowerCase().contains('price')) {
                icon = Icons.trending_up_rounded;
                iconCol = const Color(0xFFF97316);
              }

              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                leading: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: iconCol.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: iconCol, size: 22),
                    ),
                    if (!isRead)
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          width: 9,
                          height: 9,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                  ],
                ),
                title: Text(
                  n.title,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                    color: sheetContext.titleText,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 2),
                    Text(
                      n.body,
                      style: GoogleFonts.inter(fontSize: 12, color: sheetContext.subText),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${n.timestamp.hour.toString().padLeft(2, '0')}:${n.timestamp.minute.toString().padLeft(2, '0')} • ${n.timestamp.day}/${n.timestamp.month}/${n.timestamp.year}',
                      style: GoogleFonts.inter(fontSize: 10, color: sheetContext.subText.withValues(alpha: 0.7)),
                    ),
                  ],
                ),
                onTap: () {
                  if (!isRead) {
                    appState.markNotificationRead(n.id);
                  }
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNotificationSettingsView(
    BuildContext sheetContext,
    AppStateProvider appState,
    NotificationSettingsModel settings,
  ) {
    bool surplus = settings.surplusAlerts5km;
    bool orders = settings.orderStatusAlerts;
    bool prices = settings.priceAlerts;
    bool advisories = settings.urgentAdvisories;
    bool sound = settings.pushSound;
    bool isSaving = false;

    return StatefulBuilder(
      builder: (ctx, setSettingsState) {
        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Notification & Alert Preferences',
              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: sheetContext.titleText),
            ),
            const SizedBox(height: 4),
            Text(
              'Choose what notifications you want to receive on your device.',
              style: GoogleFonts.inter(fontSize: 12, color: sheetContext.subText),
            ),
            const SizedBox(height: 16),

            _buildSwitchTile(
              context: sheetContext,
              icon: Icons.eco_rounded,
              iconColor: const Color(0xFF16A34A),
              title: '5km Surplus Harvest Alerts',
              subtitle: 'Immediate push notification when local verified farmers log surplus crops within your search radius',
              value: surplus,
              onChanged: (val) => setSettingsState(() => surplus = val),
            ),
            Divider(height: 1, color: sheetContext.dividerColor),

            _buildSwitchTile(
              context: sheetContext,
              icon: Icons.receipt_long_rounded,
              iconColor: const Color(0xFF2563EB),
              title: 'Order Status & Farmgate Vouchers',
              subtitle: 'Alerts when farmers accept orders or issue digital QR verification vouchers for pickup',
              value: orders,
              onChanged: (val) => setSettingsState(() => orders = val),
            ),
            Divider(height: 1, color: sheetContext.dividerColor),

            _buildSwitchTile(
              context: sheetContext,
              icon: Icons.trending_up_rounded,
              iconColor: const Color(0xFFF97316),
              title: 'Wholesale Market Rate Alerts',
              subtitle: 'Daily morning wholesale price trends from Keppetipola & Manning Economic Centers',
              value: prices,
              onChanged: (val) => setSettingsState(() => prices = val),
            ),
            Divider(height: 1, color: sheetContext.dividerColor),

            _buildSwitchTile(
              context: sheetContext,
              icon: Icons.thunderstorm_outlined,
              iconColor: const Color(0xFF9333EA),
              title: 'Agrarian Directives & Weather Warnings',
              subtitle: 'Official government circulars, frost/blight advisories & severe rain radar warnings',
              value: advisories,
              onChanged: (val) => setSettingsState(() => advisories = val),
            ),
            Divider(height: 1, color: sheetContext.dividerColor),

            _buildSwitchTile(
              context: sheetContext,
              icon: Icons.volume_up_outlined,
              iconColor: const Color(0xFF0D9488),
              title: 'Sound & Vibration',
              subtitle: 'Play alert tone for critical zero-waste clearance postings',
              value: sound,
              onChanged: (val) => setSettingsState(() => sound = val),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.asvannaButtonGreen,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: isSaving ? null : () async {
                  setSettingsState(() => isSaving = true);
                  final updated = settings.copyWith(
                    surplusAlerts5km: surplus,
                    orderStatusAlerts: orders,
                    priceAlerts: prices,
                    urgentAdvisories: advisories,
                    pushSound: sound,
                  );
                  await appState.saveNotificationSettings(updated);
                  if (sheetContext.mounted) {
                    Navigator.pop(sheetContext);
                    ScaffoldMessenger.of(sheetContext).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.dashSafeGreen,
                        content: Text('Notification settings updated & synced!'),
                      ),
                    );
                  }
                },
                child: isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        'Save Alert Preferences',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14),
                      ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSwitchTile({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: context.titleText),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(fontSize: 11, color: context.subText, height: 1.3),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            activeColor: AppColors.asvannaButtonGreen,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  // Change Password Dialog
  void _showChangePasswordDialog(BuildContext context, AppStateProvider appState) {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();

    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    String? errorMessage;
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              backgroundColor: context.cardBg,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.lock_reset_rounded, color: Color(0xFF2563EB), size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Change Password',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            color: context.titleText,
                          ),
                        ),
                        Text(
                          'මුරපදය වෙනස් කිරීම',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: context.subText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                errorMessage!,
                                style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFDC2626), fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    Text('Current Password', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: context.subText)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: currentController,
                      obscureText: obscureCurrent,
                      decoration: InputDecoration(
                        hintText: 'Enter current password',
                        prefixIcon: const Icon(Icons.lock_outline, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(obscureCurrent ? Icons.visibility_off : Icons.visibility, size: 20),
                          onPressed: () => setDialogState(() => obscureCurrent = !obscureCurrent),
                        ),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text('New Password', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: context.subText)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: newController,
                      obscureText: obscureNew,
                      decoration: InputDecoration(
                        hintText: 'At least 6 characters',
                        prefixIcon: const Icon(Icons.lock_open_rounded, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility, size: 20),
                          onPressed: () => setDialogState(() => obscureNew = !obscureNew),
                        ),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text('Confirm New Password', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: context.subText)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: confirmController,
                      obscureText: obscureConfirm,
                      decoration: InputDecoration(
                        hintText: 'Re-enter new password',
                        prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(obscureConfirm ? Icons.visibility_off : Icons.visibility, size: 20),
                          onPressed: () => setDialogState(() => obscureConfirm = !obscureConfirm),
                        ),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isLoading ? null : () => Navigator.pop(dialogCtx),
                  child: Text('Cancel', style: GoogleFonts.inter(color: context.subText, fontWeight: FontWeight.w600)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.asvannaButtonGreen,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  ),
                  onPressed: isLoading ? null : () async {
                    final curr = currentController.text.trim();
                    final np = newController.text.trim();
                    final cp = confirmController.text.trim();

                    if (curr.isEmpty || np.isEmpty || cp.isEmpty) {
                      setDialogState(() => errorMessage = 'Please enter all password fields');
                      return;
                    }
                    if (np.length < 6) {
                      setDialogState(() => errorMessage = 'New password must be at least 6 characters');
                      return;
                    }
                    if (np != cp) {
                      setDialogState(() => errorMessage = 'New password and confirmation do not match');
                      return;
                    }

                    setDialogState(() {
                      isLoading = true;
                      errorMessage = null;
                    });

                    final res = await appState.changePassword(
                      currentPassword: curr,
                      newPassword: np,
                    );

                    setDialogState(() => isLoading = false);

                    if (res['success'] == true) {
                      if (dialogCtx.mounted) {
                        Navigator.pop(dialogCtx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.dashSafeGreen,
                            content: Text(res['message'] ?? 'Password updated successfully!'),
                          ),
                        );
                      }
                    } else {
                      setDialogState(() => errorMessage = res['message'] ?? 'Failed to update password');
                    }
                  },
                  child: isLoading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('Change Password', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    Color? iconColor,
    required String title,
    String? subtitle,
    String? trailingText,
    int? badgeCount,
    required VoidCallback onTap,
    required BuildContext context,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: (iconColor ?? context.titleText).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: iconColor ?? context.titleText),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: context.titleText,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: context.subText,
                        textStyle: const TextStyle(
                          fontFamilyFallback: [
                            'Noto Sans Tamil',
                            'Noto Sans Sinhala',
                            'Nirmala UI',
                            'sans-serif',
                          ],
                        ),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            if (badgeCount != null && badgeCount > 0) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$badgeCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 6),
            ] else if (trailingText != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: context.softGreenBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  trailingText,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.asvannaButtonGreen,
                    textStyle: const TextStyle(
                      fontFamilyFallback: [
                        'Noto Sans Tamil',
                        'Noto Sans Sinhala',
                        'Nirmala UI',
                        'sans-serif',
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),
            ],
            Icon(Icons.chevron_right_rounded, size: 20, color: context.subText),
          ],
        ),
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Divider(height: 1, thickness: 1, color: context.dividerColor.withValues(alpha: 0.6));
  }
}
