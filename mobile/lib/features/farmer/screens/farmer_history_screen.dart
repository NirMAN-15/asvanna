import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';

class FarmerHistoryScreen extends StatefulWidget {
  const FarmerHistoryScreen({super.key});

  @override
  State<FarmerHistoryScreen> createState() => _FarmerHistoryScreenState();
}

class _FarmerHistoryScreenState extends State<FarmerHistoryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Mock past harvest history data
  final List<Map<String, dynamic>> _harvestHistory = [
    {
      'cropName': 'Cabbage',
      'sinhalaName': 'ගෝවා',
      'emoji': '🥗',
      'harvestDate': '2026-08-15',
      'acres': 1.0,
      'yieldKg': 7800.0,
      'earnings': 936000.0,
      'status': 'Completed',
    },
    {
      'cropName': 'Carrots',
      'sinhalaName': 'කැරට්',
      'emoji': '🥕',
      'harvestDate': '2026-07-20',
      'acres': 0.8,
      'yieldKg': 5600.0,
      'earnings': 1008000.0,
      'status': 'Completed',
    },
    {
      'cropName': 'Leeks',
      'sinhalaName': 'ලීක්ස්',
      'emoji': '🥬',
      'harvestDate': '2026-06-10',
      'acres': 1.2,
      'yieldKg': 9200.0,
      'earnings': 1104000.0,
      'status': 'Completed',
    },
    {
      'cropName': 'Beetroot',
      'sinhalaName': 'බීට්රූට්',
      'emoji': '🟣',
      'harvestDate': '2026-05-02',
      'acres': 0.5,
      'yieldKg': 3400.0,
      'earnings': 578000.0,
      'status': 'Completed',
    },
  ];

  // Mock surplus sales history data (5km zero-waste marketplace)
  final List<Map<String, dynamic>> _surplusSalesHistory = [
    {
      'cropName': 'Upcountry Potato',
      'sinhalaName': 'අර්තාපල්',
      'emoji': '🥔',
      'buyerName': 'Grand Bandarawela Resort',
      'soldDate': '2026-09-18',
      'quantityKg': 250.0,
      'pricePerKg': 380.0,
      'totalEarned': 95000.0,
      'status': 'Delivered',
    },
    {
      'cropName': 'Beetroot',
      'sinhalaName': 'බීට්රූට්',
      'emoji': '🟣',
      'buyerName': 'Heeloya Agro Caterers',
      'soldDate': '2026-09-05',
      'quantityKg': 120.0,
      'pricePerKg': 250.0,
      'totalEarned': 30000.0,
      'status': 'Delivered',
    },
    {
      'cropName': 'Carrot Grade A',
      'sinhalaName': 'කැරට්',
      'emoji': '🥕',
      'buyerName': 'Ella Eco Lodge Kitchen',
      'soldDate': '2026-08-22',
      'quantityKg': 180.0,
      'pricePerKg': 210.0,
      'totalEarned': 37800.0,
      'status': 'Delivered',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    // Calculate totals
    final totalHarvestKg = _harvestHistory.fold(0.0, (sum, item) => sum + (item['yieldKg'] as double));
    final totalSurplusEarnings = _surplusSalesHistory.fold(0.0, (sum, item) => sum + (item['totalEarned'] as double));

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          'Cultivation & Sales History',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
          labelColor: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
          unselectedLabelColor: context.subText,
          labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 13.5),
          unselectedLabelStyle: GoogleFonts.inter(fontWeight: FontWeight.w500, fontSize: 13.5),
          tabs: const [
            Tab(
              icon: Icon(Icons.agriculture_rounded, size: 18),
              text: 'Harvest History',
            ),
            Tab(
              icon: Icon(Icons.storefront_rounded, size: 18),
              text: '5km Surplus Sales',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Top Overall Summary Metrics Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.9) : Colors.white,
              border: Border(
                bottom: BorderSide(color: context.dividerColor, width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Past Harvest',
                        style: GoogleFonts.inter(fontSize: 11.5, color: context.subText, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${(totalHarvestKg / 1000).toStringAsFixed(1)} Tons',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: context.titleText,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(width: 1, height: 32, color: context.dividerColor),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Surplus Revenue',
                        style: GoogleFonts.inter(fontSize: 11.5, color: context.subText, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Rs. ${(totalSurplusEarnings / 1000).toStringAsFixed(1)}k',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Harvest History List
                _buildHarvestHistoryList(context, isDark, tr),

                // Tab 2: Surplus Sales History List
                _buildSurplusSalesHistoryList(context, isDark, tr),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Tab 1: Harvest History List
  Widget _buildHarvestHistoryList(BuildContext context, bool isDark, String Function(String) tr) {
    if (_harvestHistory.isEmpty) {
      return Center(
        child: Text(
          'No harvest records found',
          style: GoogleFonts.inter(fontSize: 14, color: context.subText),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _harvestHistory.length,
      itemBuilder: (context, index) {
        final item = _harvestHistory[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.88) : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: context.cardBorder.withValues(alpha: 0.8)),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Emoji Box
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(item['emoji'] as String, style: const TextStyle(fontSize: 24)),
                ),
              ),
              const SizedBox(width: 14),

              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${item['cropName']} (${item['sinhalaName']})',
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: context.titleText,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Harvested',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Harvested: ${item['harvestDate']} • ${item['acres']} Acres',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        color: context.subText,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Yield: ${(item['yieldKg'] as double).toStringAsFixed(0)} kg',
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: context.titleText,
                          ),
                        ),
                        Text(
                          'Value ~Rs. ${(item['earnings'] as double).toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // Tab 2: Surplus Sales History List
  Widget _buildSurplusSalesHistoryList(BuildContext context, bool isDark, String Function(String) tr) {
    if (_surplusSalesHistory.isEmpty) {
      return Center(
        child: Text(
          'No surplus sales records found',
          style: GoogleFonts.inter(fontSize: 14, color: context.subText),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _surplusSalesHistory.length,
      itemBuilder: (context, index) {
        final item = _surplusSalesHistory[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.88) : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: context.cardBorder.withValues(alpha: 0.8)),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Emoji Box
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF451A03) : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(item['emoji'] as String, style: const TextStyle(fontSize: 24)),
                ),
              ),
              const SizedBox(width: 14),

              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${item['cropName']}',
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: context.titleText,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            item['status'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Buyer: ${item['buyerName']}',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: context.subText,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 1),
                    Text(
                      'Date: ${item['soldDate']}',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: context.mutedText,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${(item['quantityKg'] as double).toStringAsFixed(0)} kg @ Rs. ${(item['pricePerKg'] as double).toStringAsFixed(0)}/kg',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: context.titleText,
                          ),
                        ),
                        Text(
                          'Rs. ${(item['totalEarned'] as double).toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
