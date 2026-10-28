import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import 'planting_entry_screen.dart';
import 'pre_planting_risk_screen.dart';

enum CropFilterTab { all, active, harvested }

class MyCropsScreen extends StatefulWidget {
  const MyCropsScreen({super.key});

  @override
  State<MyCropsScreen> createState() => _MyCropsScreenState();
}

class _MyCropsScreenState extends State<MyCropsScreen>
    with SingleTickerProviderStateMixin {
  CropFilterTab _selectedTab = CropFilterTab.all;
  late AnimationController _fabController;

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fabController.forward();
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  // Helper: Short month name
  String _shortMonth(int month) {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month.clamp(1, 12)];
  }

  // Helper: Format date as "Aug 20" (short) or "Aug 20, 2026" (long)
  String _formatDateShort(DateTime date) {
    return '${_shortMonth(date.month)} ${date.day}';
  }

  String _formatDateFull(DateTime date) {
    return '${_shortMonth(date.month)} ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final farmer = appState.farmerProfile;
    final plantings = farmer.activePlantings;
    final totalUsedAcres = farmer.usedAcres;
    final totalLandAcres = farmer.totalLandAcres;
    final landPercentage = farmer.landUtilizationPercentage;

    // Filtered lists
    final activePlantings = plantings
        .where((p) => p.status != 'harvested' && p.status != 'cancelled')
        .toList();
    final harvestedPlantings =
        plantings.where((p) => p.status == 'harvested').toList();

    List<PlantedCropEntry> displayedPlantings;
    switch (_selectedTab) {
      case CropFilterTab.active:
        displayedPlantings = activePlantings;
        break;
      case CropFilterTab.harvested:
        displayedPlantings = harvestedPlantings;
        break;
      case CropFilterTab.all:
        displayedPlantings = plantings;
        break;
    }

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('nav_my_crops'),
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: context.titleText,
              ),
            ),
            Text(
              '${farmer.fullName.isNotEmpty ? farmer.fullName : "Farmer"} • ${farmer.gndDivision}, ${farmer.agrarianDivision}',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: context.subText,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
          );
        },
        backgroundColor: isDark ? const Color(0xFF22C55E) : AppColors.asvannaButtonGreen,
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, size: 20),
        label: Text(
          tr('plant_new_crop'),
          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.asvannaButtonGreen,
        onRefresh: () async {
          await appState.syncOfflineQueue();
          await Future.delayed(const Duration(milliseconds: 300));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Farm at a Glance Card
              _buildFarmAtAGlance(
                context: context,
                usedAcres: totalUsedAcres,
                totalAcres: totalLandAcres,
                landPercentage: landPercentage,
                harvestedCount: harvestedPlantings.length,
                isDark: isDark,
              ),
              const SizedBox(height: 20),

              // 2. Quick Stats Row
              _buildQuickStatsRow(
                context: context,
                totalCrops: plantings.length,
                activeCrops: activePlantings.length,
                harvestedCrops: harvestedPlantings.length,
                isDark: isDark,
              ),
              const SizedBox(height: 20),

              // 3. Filter Tabs
              _buildFilterSection(
                allCount: plantings.length,
                activeCount: activePlantings.length,
                harvestedCount: harvestedPlantings.length,
                isDark: isDark,
              ),
              const SizedBox(height: 16),

              // 4. Crop Cards List
              if (displayedPlantings.isEmpty)
                _buildEmptyState(context, tr, isDark)
              else
                ...displayedPlantings.map((p) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: _buildCropCard(
                        context: context,
                        entry: p,
                        appState: appState,
                        isDark: isDark,
                        tr: tr,
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. FARM AT A GLANCE (Land Utilization Card)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Widget _buildFarmAtAGlance({
    required BuildContext context,
    required double usedAcres,
    required double totalAcres,
    required double landPercentage,
    required int harvestedCount,
    required bool isDark,
  }) {
    final availableAcres = (totalAcres - usedAcres).clamp(0.0, totalAcres);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF143E23) : const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.landscape_rounded,
                  size: 18,
                  color: Color(0xFF059669),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Farm at a Glance',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: context.titleText,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF143E23) : const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${landPercentage.toStringAsFixed(0)}% Used',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF059669),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Big numbers
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                usedAcres.toStringAsFixed(2),
                style: GoogleFonts.poppins(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: context.titleText,
                  height: 1.0,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 3, left: 4),
                child: Text(
                  '/ ${totalAcres.toStringAsFixed(2)} Acres',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: context.subText,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: Stack(
              children: [
                Container(
                  height: 7,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: (landPercentage / 100).clamp(0.0, 1.0),
                  child: Container(
                    height: 7,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: landPercentage > 85
                            ? [const Color(0xFFFBBF24), const Color(0xFFF59E0B)]
                            : [const Color(0xFF10B981), const Color(0xFF34D399)],
                      ),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '✓ ${availableAcres.toStringAsFixed(2)} Acres Free',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: context.subText,
                ),
              ),
              if (harvestedCount > 0)
                Text(
                  '$harvestedCount harvest cleared',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF0D9488),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. QUICK STATS ROW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Widget _buildQuickStatsRow({
    required BuildContext context,
    required int totalCrops,
    required int activeCrops,
    required int harvestedCrops,
    required bool isDark,
  }) {
    return Row(
      children: [
        Expanded(
          child: _buildStatChip(
            icon: Icons.eco_rounded,
            label: 'Total',
            value: '$totalCrops',
            color: const Color(0xFF3B82F6),
            bgColor: isDark
                ? const Color(0xFF1E3A5F)
                : const Color(0xFFEFF6FF),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatChip(
            icon: Icons.spa_rounded,
            label: 'Active',
            value: '$activeCrops',
            color: const Color(0xFF10B981),
            bgColor: isDark
                ? const Color(0xFF143E23)
                : const Color(0xFFECFDF5),
            isDark: isDark,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatChip(
            icon: Icons.agriculture_rounded,
            label: 'Harvested',
            value: '$harvestedCrops',
            color: const Color(0xFFF59E0B),
            bgColor: isDark
                ? const Color(0xFF3D2E0A)
                : const Color(0xFFFFFBEB),
            isDark: isDark,
          ),
        ),
      ],
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    required Color bgColor,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF1E293B),
            ),
          ),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isDark
                  ? const Color(0xFF94A3B8)
                  : const Color(0xFF64748B),
            ),
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. FILTER SECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Widget _buildFilterSection({
    required int allCount,
    required int activeCount,
    required int harvestedCount,
    required bool isDark,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'My Farm Overview',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : const Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip(
                title: 'All',
                count: allCount,
                isSelected: _selectedTab == CropFilterTab.all,
                onTap: () =>
                    setState(() => _selectedTab = CropFilterTab.all),
                isDark: isDark,
              ),
              const SizedBox(width: 8),
              _buildFilterChip(
                title: 'Active',
                count: activeCount,
                icon: Icons.spa_rounded,
                isSelected: _selectedTab == CropFilterTab.active,
                onTap: () =>
                    setState(() => _selectedTab = CropFilterTab.active),
                isDark: isDark,
                activeColor: const Color(0xFF10B981),
              ),
              const SizedBox(width: 8),
              _buildFilterChip(
                title: 'Harvested',
                count: harvestedCount,
                icon: Icons.check_circle_rounded,
                isSelected: _selectedTab == CropFilterTab.harvested,
                onTap: () => setState(
                    () => _selectedTab = CropFilterTab.harvested),
                isDark: isDark,
                activeColor: const Color(0xFFF59E0B),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip({
    required String title,
    required int count,
    IconData? icon,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
    Color? activeColor,
  }) {
    final chipColor = activeColor ?? const Color(0xFF064E3B);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? chipColor
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected
                ? chipColor
                : (isDark
                    ? const Color(0xFF334155)
                    : const Color(0xFFE2E8F0)),
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: chipColor.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 15,
                color: isSelected
                    ? Colors.white
                    : (isDark
                        ? const Color(0xFF94A3B8)
                        : const Color(0xFF64748B)),
              ),
              const SizedBox(width: 6),
            ],
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? Colors.white
                    : (isDark
                        ? const Color(0xFFE2E8F0)
                        : const Color(0xFF475569)),
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.2)
                    : (isDark
                        ? const Color(0xFF334155)
                        : const Color(0xFFF1F5F9)),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? Colors.white
                      : (isDark
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF64748B)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. CROP CARD — Clean, User-Friendly Design
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Widget _buildCropCard({
    required BuildContext context,
    required PlantedCropEntry entry,
    required AppStateProvider appState,
    required bool isDark,
    required String Function(String) tr,
  }) {
    final isHarvested = entry.status == 'harvested';
    final progress = entry.growthProgress;
    final daysLeft = entry.daysRemaining;

    // Status colors
    final statusColor = isHarvested
        ? const Color(0xFF0D9488)
        : const Color(0xFF059669);
    final statusBg = isHarvested
        ? (isDark ? const Color(0xFF0F2D2D) : const Color(0xFFF0FDFA))
        : (isDark ? const Color(0xFF143E23) : const Color(0xFFF0FDF4));

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? const Color(0xFF334155)
              : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.2)
                : Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header: Emoji + Name + Status ──
                Row(
                  children: [
                    // Crop Emoji Avatar
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          entry.cropEmoji,
                          style: const TextStyle(fontSize: 24),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Name + Sinhala
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.cropName,
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? Colors.white
                                  : const Color(0xFF1E293B),
                            ),
                          ),
                          if (entry.cropSinhalaName != null &&
                              entry.cropSinhalaName!.isNotEmpty)
                            Text(
                              entry.cropSinhalaName!,
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                        ],
                      ),
                    ),

                    // Status Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: statusColor.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isHarvested
                                ? Icons.check_circle_rounded
                                : Icons.spa_rounded,
                            size: 12,
                            color: statusColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isHarvested ? 'Harvested' : 'Active',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // ── Key Info: 2-column grid (no overflow) ──
                Row(
                  children: [
                    // Left column
                    Expanded(
                      child: _buildKeyValue(
                        label: 'Area',
                        value: '${entry.allocatedAcres.toStringAsFixed(2)} Acres',
                        icon: Icons.crop_square_rounded,
                        isDark: isDark,
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Right column
                    Expanded(
                      child: _buildKeyValue(
                        label: 'Est. Yield',
                        value: isHarvested
                            ? '${(entry.actualYieldKg ?? entry.projectedYieldKg).toStringAsFixed(0)} kg'
                            : '${entry.projectedYieldKg.toStringAsFixed(0)} kg',
                        icon: Icons.inventory_2_outlined,
                        isDark: isDark,
                        valueColor: const Color(0xFF059669),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // ── Progress / Status Section ──
                if (!isHarvested) ...[
                  // Growth Progress Bar
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF0F172A)
                          : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  daysLeft <= 0
                                      ? Icons.celebration_rounded
                                      : (daysLeft <= 7
                                          ? Icons.timer
                                          : Icons.trending_up_rounded),
                                  size: 15,
                                  color: daysLeft <= 0
                                      ? const Color(0xFF059669)
                                      : (daysLeft <= 7
                                          ? const Color(0xFFF59E0B)
                                          : (isDark
                                              ? const Color(0xFF94A3B8)
                                              : const Color(0xFF64748B))),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  daysLeft > 0
                                      ? '$daysLeft days to harvest'
                                      : 'Ready to harvest!',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: daysLeft <= 0
                                        ? const Color(0xFF059669)
                                        : (daysLeft <= 7
                                            ? const Color(0xFFF59E0B)
                                            : (isDark
                                                ? const Color(0xFFCBD5E1)
                                                : const Color(0xFF475569))),
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              '${(progress * 100).toStringAsFixed(0)}%',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF10B981),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: progress,
                            minHeight: 5,
                            backgroundColor: isDark
                                ? const Color(0xFF334155)
                                : const Color(0xFFE2E8F0),
                            valueColor:
                                AlwaysStoppedAnimation<Color>(
                              progress >= 1.0
                                  ? const Color(0xFFF59E0B)
                                  : const Color(0xFF10B981),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _formatDateShort(entry.plantingDate),
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: isDark
                                    ? const Color(0xFF64748B)
                                    : const Color(0xFF94A3B8),
                              ),
                            ),
                            Text(
                              _formatDateShort(
                                  entry.expectedHarvestDate),
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: isDark
                                    ? const Color(0xFF64748B)
                                    : const Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Harvested info
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF0F2D2D)
                          : const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFF5EEAD4)
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          size: 16,
                          color: Color(0xFF0D9488),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Harvest Complete • Land Cleared',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF0D9488),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // ── Bottom Action Bar ──
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF0F172A)
                  : const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              border: Border(
                top: BorderSide(
                  color: isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                if (!isHarvested) ...[
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.agriculture_rounded,
                      label: 'Complete Harvest',
                      color: const Color(0xFF065F46),
                      bgColor: isDark
                          ? const Color(0xFF143E23)
                          : const Color(0xFFECFDF5),
                      onTap: () => _showHarvestCompletionModal(
                          context, entry, appState),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                _buildIconAction(
                  icon: Icons.bar_chart_rounded,
                  color: const Color(0xFFD97706),
                  bgColor: isDark
                      ? const Color(0xFF3D2E0A)
                      : const Color(0xFFFFFBEB),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) =>
                              const PrePlantingRiskScreen()),
                    );
                  },
                ),
                const SizedBox(width: 8),
                _buildIconAction(
                  icon: Icons.delete_outline_rounded,
                  color: const Color(0xFFDC2626),
                  bgColor: isDark
                      ? const Color(0xFF3D1111)
                      : const Color(0xFFFEF2F2),
                  onTap: () =>
                      _confirmDeleteCrop(context, entry, appState),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Key-value display widget for crop card
  Widget _buildKeyValue({
    required String label,
    required String value,
    required IconData icon,
    required bool isDark,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 18,
            color: valueColor ??
                (isDark
                    ? const Color(0xFF64748B)
                    : const Color(0xFF94A3B8)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? const Color(0xFF64748B)
                        : const Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  value,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: valueColor ??
                        (isDark
                            ? Colors.white
                            : const Color(0xFF1E293B)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: bgColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIconAction({
    required IconData icon,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: bgColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon, size: 18, color: color),
        ),
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. HARVEST COMPLETION MODAL — Simplified
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  void _showHarvestCompletionModal(
    BuildContext context,
    PlantedCropEntry crop,
    AppStateProvider appState,
  ) {
    final yieldController = TextEditingController(
      text: crop.projectedYieldKg.toStringAsFixed(0),
    );
    final notesController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = ctx.isDarkMode;

        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : Colors.white,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Modal Header ──
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 20, 12, 20),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF064E3B), Color(0xFF047857)],
                    ),
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  child: Row(
                    children: [
                      // Crop emoji
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            crop.cropEmoji,
                            style: const TextStyle(fontSize: 22),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Complete Harvest',
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              crop.displayName,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: Colors.white
                                    .withValues(alpha: 0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close_rounded,
                            color: Colors.white70),
                      ),
                    ],
                  ),
                ),

                // ── Modal Body ──
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Land release info — compact
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0xFF143E23)
                              : const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                              color: const Color(0xFF86EFAC)
                                  .withValues(alpha: 0.5)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFF0D3320)
                                    : const Color(0xFFD1FAE5),
                                borderRadius:
                                    BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.crop_free_rounded,
                                size: 20,
                                color: Color(0xFF059669),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${crop.allocatedAcres.toStringAsFixed(2)} Acres will be released',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: isDark
                                          ? const Color(0xFF4ADE80)
                                          : const Color(0xFF065F46),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Land returns to your available balance',
                                    style: GoogleFonts.inter(
                                      fontSize: 11.5,
                                      color: isDark
                                          ? const Color(0xFF94A3B8)
                                          : const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Crop summary — compact 2-column
                      Row(
                        children: [
                          Expanded(
                            child: _buildModalSummaryItem(
                              label: 'Planted',
                              value: _formatDateFull(crop.plantingDate),
                              isDark: isDark,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildModalSummaryItem(
                              label: 'Target Harvest',
                              value: _formatDateFull(
                                  crop.expectedHarvestDate),
                              isDark: isDark,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Input: Actual Harvest Output
                      Text(
                        'Actual Harvested Output',
                        style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: ctx.titleText),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: yieldController,
                        keyboardType:
                            const TextInputType.numberWithOptions(
                                decimal: true),
                        style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: ctx.titleText),
                        decoration: InputDecoration(
                          hintText: '0',
                          hintStyle: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? const Color(0xFF475569)
                                : const Color(0xFFCBD5E1),
                          ),
                          filled: true,
                          fillColor: isDark
                              ? const Color(0xFF1E293B)
                              : const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 14),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: isDark
                                  ? const Color(0xFF334155)
                                  : const Color(0xFFE2E8F0),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: isDark
                                  ? const Color(0xFF334155)
                                  : const Color(0xFFE2E8F0),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                              color: Color(0xFF059669),
                              width: 2,
                            ),
                          ),
                          suffixText: 'kg',
                          suffixStyle: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF059669),
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Est. ${crop.projectedYieldKg.toStringAsFixed(0)} kg — adjust to actual weight',
                        style: GoogleFonts.inter(
                            fontSize: 11, color: ctx.subText),
                      ),

                      const SizedBox(height: 16),

                      // Input: Notes (compact)
                      Text(
                        'Notes (Optional)',
                        style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: ctx.titleText),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: notesController,
                        style: GoogleFonts.inter(
                            fontSize: 13, color: ctx.titleText),
                        decoration: InputDecoration(
                          hintText: 'Quality, grade, pickup notes...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 13,
                            color: isDark
                                ? const Color(0xFF475569)
                                : const Color(0xFFCBD5E1),
                          ),
                          filled: true,
                          fillColor: isDark
                              ? const Color(0xFF1E293B)
                              : const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: isDark
                                  ? const Color(0xFF334155)
                                  : const Color(0xFFE2E8F0),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: isDark
                                  ? const Color(0xFF334155)
                                  : const Color(0xFFE2E8F0),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                              color: Color(0xFF059669),
                              width: 2,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.pop(ctx),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 14),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(14)),
                                side: BorderSide(
                                  color: isDark
                                      ? const Color(0xFF334155)
                                      : const Color(0xFFE2E8F0),
                                ),
                              ),
                              child: Text(
                                'Cancel',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? const Color(0xFF94A3B8)
                                      : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                final actualYield = double.tryParse(
                                        yieldController.text
                                            .trim()) ??
                                    crop.projectedYieldKg;
                                appState.completeHarvest(
                                  plantingId: crop.id,
                                  actualYieldKg: actualYield,
                                  harvestNotes:
                                      notesController.text.trim(),
                                );
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context)
                                    .showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        '✓ ${crop.allocatedAcres.toStringAsFixed(2)} Acres released back to available balance.'),
                                    backgroundColor:
                                        const Color(0xFF047857),
                                    behavior:
                                        SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12),
                                    ),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    const Color(0xFF065F46),
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(
                                        vertical: 14),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(14)),
                                elevation: 0,
                              ),
                              icon: const Icon(
                                  Icons
                                      .check_circle_outline_rounded,
                                  size: 18),
                              label: Text(
                                'Confirm & Release',
                                style: GoogleFonts.inter(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14),
                              ),
                            ),
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
      },
    );
  }

  // Compact summary item for modal
  Widget _buildModalSummaryItem({
    required String label,
    required String value,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: isDark
            ? const Color(0xFF1E293B)
            : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark
              ? const Color(0xFF334155)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10.5,
              fontWeight: FontWeight.w500,
              color: isDark
                  ? const Color(0xFF64748B)
                  : const Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : const Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. DELETE CROP CONFIRMATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  void _confirmDeleteCrop(
    BuildContext context,
    PlantedCropEntry crop,
    AppStateProvider appState,
  ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.delete_outline_rounded,
                  color: Color(0xFFDC2626)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text('Delete Crop Record?',
                  style: GoogleFonts.poppins(
                      fontSize: 17, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        content: Text(
          'Remove ${crop.displayName}? This will permanently delete the record and adjust your land allocation.',
          style: GoogleFonts.inter(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: GoogleFonts.inter(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              appState.deletePlantingEntry(crop.id);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      'Removed ${crop.displayName} from your farm records.'),
                  backgroundColor: const Color(0xFFDC2626),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: const Text('Delete Record'),
          ),
        ],
      ),
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. EMPTY STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Widget _buildEmptyState(
      BuildContext context, String Function(String) tr, bool isDark) {
    return Container(
      width: double.infinity,
      padding:
          const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? const Color(0xFF334155)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: isDark
                    ? [
                        const Color(0xFF143E23),
                        const Color(0xFF0D3320),
                      ]
                    : [
                        const Color(0xFFECFDF5),
                        const Color(0xFFD1FAE5),
                      ],
              ),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(
                Icons.eco_rounded,
                size: 36,
                color: Color(0xFF10B981),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No crops found',
            style: GoogleFonts.poppins(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: context.titleText,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Log new plantings to track harvest\ncountdown, calculate yields, and\nmanage your farm records.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: context.subText,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlantingEntryScreen()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? const Color(0xFF22C55E) : AppColors.asvannaButtonGreen,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            icon: const Icon(Icons.add_rounded, size: 18),
            label: Text(
              tr('plant_new_crop'),
              style: GoogleFonts.inter(fontSize: 12.5, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
