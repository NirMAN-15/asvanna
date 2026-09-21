import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/localization/app_translations.dart';

class PriceTrendsScreen extends StatefulWidget {
  const PriceTrendsScreen({super.key});

  @override
  State<PriceTrendsScreen> createState() => _PriceTrendsScreenState();
}

class _PriceTrendsScreenState extends State<PriceTrendsScreen> {
  late Crop _selectedCrop;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _selectedCrop = appState.availableCrops.first;
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = appState.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final currentPrice = _selectedCrop.currentMarketPricePerKg;
    final avgPrice = _selectedCrop.historicalAveragePricePerKg;
    final diffPct = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice * 100) : 0.0;
    final isPositiveDiff = diffPct >= 0;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0B1120) : AppColors.background,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        elevation: 0.5,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(
                  tr('price_intel_title'),
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.dashHeaderTitle,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isDark ? const Color(0xFF22C55E) : const Color(0xFFA5D6A7)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.location_on, size: 10, color: isDark ? const Color(0xFF4ADE80) : AppColors.primary),
                      const SizedBox(width: 2),
                      Text(
                        'Bandarawela',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Text(
              'බණ්ඩාරවෙල වෙළඳපොළ සහ මිල විශ්ලේෂණය',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: isDark ? const Color(0xFF94A3B8) : AppColors.dashHeaderDate,
              ),
            ),
          ],
        ),
        actions: [
          // Theme Mode Toggle Action Button
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: IconButton(
              tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
              icon: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Container(
                  key: ValueKey<bool>(isDark),
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFFFBBF24).withValues(alpha: 0.15) : const Color(0xFF0F172A).withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                    color: isDark ? const Color(0xFFFBBF24) : const Color(0xFF334155),
                    size: 19,
                  ),
                ),
              ),
              onPressed: () {
                appState.toggleDarkMode();
              },
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Upcountry Crop Selector Chips
            _buildCropSelector(appState, isDark),
            const SizedBox(height: 16),

            // 2. High-Contrast Hero Price Card with 6-Month Chart
            _buildPriceOverviewCard(currentPrice, avgPrice, diffPct, isPositiveDiff, tr),
            const SizedBox(height: 18),

            // 3. Bandarawela Relevant Wholesale Benchmarks
            _buildWholesaleBenchmarks(currentPrice, isDark, tr),
            const SizedBox(height: 16),

            // 4. Local Transport & Highest Net Profit Advisory Card
            _buildTransportNetProfitCard(isDark),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // 1. Crop Selector Chips (Horizontal Scroll)
  Widget _buildCropSelector(AppStateProvider appState, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'SELECT CROP / වගාව තෝරන්න',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
                color: isDark ? const Color(0xFF94A3B8) : AppColors.textMuted,
              ),
            ),
            Text(
              'Upcountry Crops',
              style: GoogleFonts.inter(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 42,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: appState.availableCrops.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final c = appState.availableCrops[i];
              final isSelected = c.id == _selectedCrop.id;
              
              final Color chipBg = isSelected
                  ? AppColors.asvannaButtonGreen
                  : (isDark ? const Color(0xFF1E293B) : Colors.white);
              
              final Color borderColor = isSelected
                  ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                  : (isDark ? const Color(0xFF334155) : const Color(0xFFDDE5DD));

              final Color textColor = isSelected
                  ? Colors.white
                  : (isDark ? const Color(0xFFCBD5E1) : AppColors.textPrimary);

              return GestureDetector(
                onTap: () {
                  setState(() => _selectedCrop = c);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: chipBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: borderColor,
                      width: 1.2,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.asvannaButtonGreen.withValues(alpha: 0.25),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(c.iconEmoji, style: const TextStyle(fontSize: 15)),
                      const SizedBox(width: 6),
                      Text(
                        '${c.name} (${c.sinhalaName})',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: textColor,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.check_circle_rounded, size: 14, color: AppColors.asvannaLightGreen),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // 2. High-Contrast Hero Price Card
  Widget _buildPriceOverviewCard(
    double currentPrice,
    double avgPrice,
    double diffPct,
    bool isPositiveDiff,
    String Function(String) tr,
  ) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF144D34), Color(0xFF0F3A27)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF144D34).withValues(alpha: 0.22),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Price Header (Flexible with no overflow)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Keppetipola / Local Benchmark',
                      style: GoogleFonts.inter(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFA7F3D0),
                      ),
                    ),
                    const SizedBox(height: 2),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: 'Rs. ${currentPrice.toStringAsFixed(0)}',
                            style: GoogleFonts.poppins(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          TextSpan(
                            text: ' / kg',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFFA7F3D0),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPositiveDiff
                          ? const Color(0xFF10B981).withValues(alpha: 0.25)
                          : const Color(0xFFEF4444).withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isPositiveDiff
                            ? const Color(0xFF34D399).withValues(alpha: 0.5)
                            : const Color(0xFFF87171).withValues(alpha: 0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isPositiveDiff ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                          color: isPositiveDiff ? const Color(0xFF6EE7B7) : const Color(0xFFFCA5A5),
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${isPositiveDiff ? '+' : ''}${diffPct.toStringAsFixed(0)}% vs Avg',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isPositiveDiff ? const Color(0xFF6EE7B7) : const Color(0xFFFCA5A5),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '6-Mo Avg: Rs. ${avgPrice.toStringAsFixed(0)}/kg',
                    style: GoogleFonts.inter(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFD1FAE5).withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 6-Month Chart Container
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.show_chart_rounded, size: 14, color: Color(0xFF6EE7B7)),
                        const SizedBox(width: 6),
                        Text(
                          tr('price_trend_6m'),
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFD1FAE5),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      'Bandarawela Basin',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFFA7F3D0).withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 120,
                  child: LineChart(
                    LineChartData(
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        horizontalInterval: avgPrice > 50 ? avgPrice * 0.25 : 20,
                        getDrawingHorizontalLine: (value) => FlLine(
                          color: Colors.white.withValues(alpha: 0.08),
                          strokeWidth: 1,
                          dashArray: [4, 4],
                        ),
                      ),
                      titlesData: FlTitlesData(
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 20,
                            getTitlesWidget: (value, meta) {
                              const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
                              final index = value.toInt();
                              if (index >= 0 && index < months.length) {
                                return Padding(
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Text(
                                    months[index],
                                    style: GoogleFonts.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFFA7F3D0),
                                    ),
                                  ),
                                );
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: [
                            FlSpot(0, avgPrice * 0.88),
                            FlSpot(1, avgPrice * 1.02),
                            FlSpot(2, avgPrice * 1.20),
                            FlSpot(3, avgPrice * 1.14),
                            FlSpot(4, currentPrice * 1.04),
                            FlSpot(5, currentPrice),
                          ],
                          isCurved: true,
                          curveSmoothness: 0.35,
                          color: const Color(0xFF4ADE80),
                          barWidth: 2.8,
                          isStrokeCapRound: true,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, percent, barData, index) {
                              return FlDotCirclePainter(
                                radius: 3.5,
                                color: Colors.white,
                                strokeWidth: 2,
                                strokeColor: const Color(0xFF144D34),
                              );
                            },
                          ),
                          belowBarData: BarAreaData(
                            show: true,
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFF4ADE80).withValues(alpha: 0.38),
                                const Color(0xFF4ADE80).withValues(alpha: 0.0),
                              ],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Bottom Insight Strip
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Text('💡', style: TextStyle(fontSize: 13)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _getInsightForCrop(_selectedCrop.name),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFFD1FAE5),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBBF24).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFFBBF24).withValues(alpha: 0.35)),
                ),
                child: Text(
                  'Sell Now',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFFDE68A),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 3. Wholesale Benchmarks Table for Bandarawela
  Widget _buildWholesaleBenchmarks(double basePrice, bool isDark, String Function(String) tr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${tr('wholesale_benchmarks')} (තොග මිල)',
              style: GoogleFonts.poppins(
                fontSize: 14.5,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppColors.dashHeaderTitle,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF143E23) : const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'HARTI Live',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isDark ? const Color(0xFF86EFAC) : AppColors.primaryDark,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        _buildBenchmarkCard(
          name: 'Keppetipola Dedicated Economic Centre',
          location: '14 km from Bandarawela',
          tag: 'Nearest Hub',
          isNearest: true,
          price: (basePrice * 1.0).toStringAsFixed(0),
          change: '+4.8%',
          isPositive: true,
          isDark: isDark,
        ),
        _buildBenchmarkCard(
          name: 'Bandarawela Wholesale Market',
          location: 'Local Town Direct Hub',
          tag: 'Local',
          isNearest: false,
          price: (basePrice * 0.96).toStringAsFixed(0),
          change: '+1.5%',
          isPositive: true,
          isDark: isDark,
        ),
        _buildBenchmarkCard(
          name: 'Manning Market (Colombo)',
          location: '185 km • Dispatch Benchmark',
          tag: 'Terminal',
          isNearest: false,
          price: (basePrice * 1.08).toStringAsFixed(0),
          change: '+5.2%',
          isPositive: true,
          isDark: isDark,
        ),
        _buildBenchmarkCard(
          name: 'Nuwara Eliya Wholesale Centre',
          location: '42 km • Regional Hub',
          tag: 'Regional',
          isNearest: false,
          price: (basePrice * 0.94).toStringAsFixed(0),
          change: '+0.8%',
          isPositive: true,
          isDark: isDark,
        ),
        _buildBenchmarkCard(
          name: 'Dambulla Economic Centre',
          location: '150 km • Central Hub',
          tag: 'Central',
          isNearest: false,
          price: (basePrice * 0.92).toStringAsFixed(0),
          change: '-1.8%',
          isPositive: false,
          isDark: isDark,
        ),
      ],
    );
  }

  Widget _buildBenchmarkCard({
    required String name,
    required String location,
    required String tag,
    required bool isNearest,
    required String price,
    required String change,
    required bool isPositive,
    required bool isDark,
  }) {
    final Color cardBg = isDark
        ? (isNearest ? const Color(0xFF132B20) : const Color(0xFF1E293B))
        : Colors.white;

    final Color borderColor = isDark
        ? (isNearest ? const Color(0xFF059669) : const Color(0xFF334155))
        : (isNearest ? const Color(0xFFA7F3D0) : const Color(0xFFE8EFE8));

    final Color iconBg = isDark
        ? (isNearest ? const Color(0xFF064E3B) : const Color(0xFF334155))
        : (isNearest ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9));

    final Color tagBg = isDark
        ? (isNearest ? const Color(0xFF064E3B) : const Color(0xFF334155))
        : (isNearest ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9));

    final Color tagTextColor = isDark
        ? (isNearest ? const Color(0xFF6EE7B7) : const Color(0xFF94A3B8))
        : (isNearest ? AppColors.primaryDark : AppColors.dashHeaderDate);

    final Color titleColor = isDark ? Colors.white : AppColors.dashHeaderTitle;
    final Color locationColor = isDark ? const Color(0xFF94A3B8) : AppColors.dashHeaderDate;
    final Color priceColor = isDark ? const Color(0xFF6EE7B7) : AppColors.dashHeaderTitle;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: borderColor,
          width: isNearest ? 1.4 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Icon and Details (Wrapped in Expanded to guarantee no overflow)
          Expanded(
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      isNearest ? '📍' : '🏪',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              name,
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: titleColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: tagBg,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              tag,
                              style: GoogleFonts.inter(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                                color: tagTextColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 1),
                      Text(
                        location,
                        style: GoogleFonts.inter(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w400,
                          color: locationColor,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Price & Change Pill
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Rs. $price',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: priceColor,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                decoration: BoxDecoration(
                  color: isDark
                      ? (isPositive ? const Color(0xFF064E3B) : const Color(0xFF450A0A))
                      : (isPositive ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  change,
                  style: GoogleFonts.inter(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? (isPositive ? const Color(0xFF6EE7B7) : const Color(0xFFFCA5A5))
                        : (isPositive ? const Color(0xFF15803D) : const Color(0xFFB91C1C)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 4. Local Transport & Highest Net Profit Advisory Card
  Widget _buildTransportNetProfitCard(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF062817) : const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? const Color(0xFF065F46) : const Color(0xFFBBF7D0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🚛', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Best Net Margin for Bandarawela',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: isDark ? const Color(0xFF6EE7B7) : const Color(0xFF166534),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF064E3B) : const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Net Profit',
                        style: GoogleFonts.inter(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: isDark ? const Color(0xFF86EFAC) : const Color(0xFF15803D),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'Selling ${_selectedCrop.name} (${_selectedCrop.sinhalaName}) at Keppetipola Dedicated Economic Centre (14 km) yields the highest net return today after deducting local transport costs.',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w400,
                    color: isDark ? const Color(0xFFD1FAE5) : const Color(0xFF14532D),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getInsightForCrop(String cropName) {
    final nameLower = cropName.toLowerCase();
    if (nameLower.contains('leek')) {
      return 'High buying interest at Keppetipola centre today';
    } else if (nameLower.contains('cabbage')) {
      return 'Stable wholesale rates across Badulla & Welimada';
    } else if (nameLower.contains('carrot')) {
      return 'Strong farmgate demand from Bandarawela & Welimada';
    } else if (nameLower.contains('potato')) {
      return 'Premium rates for local Welimada/Bandarawela harvest';
    } else if (nameLower.contains('bean')) {
      return 'High demand from outstation wholesale lorries';
    } else if (nameLower.contains('tomato')) {
      return 'Supply stabilizing from Matale & Badulla routes';
    }
    return 'Optimal local trading margins this week';
  }
}
