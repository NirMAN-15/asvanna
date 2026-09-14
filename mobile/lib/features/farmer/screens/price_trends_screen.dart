import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';

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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Market & Price Intelligence'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Crop Selector Chips
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: appState.availableCrops.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final c = appState.availableCrops[i];
                  final isSelected = c.id == _selectedCrop.id;
                  return ChoiceChip(
                    label: Text('${c.iconEmoji} ${c.name}'),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (val) {
                      if (val) setState(() => _selectedCrop = c);
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 18),

            // Price Overview Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2EBE2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Current Manning / HARTI Price',
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
                          ),
                          Text(
                            'Rs. ${_selectedCrop.currentMarketPricePerKg.toStringAsFixed(0)} / Kg',
                            style: GoogleFonts.poppins(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primarySoft,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Avg: Rs. ${_selectedCrop.historicalAveragePricePerKg.toStringAsFixed(0)}/kg',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  Text(
                    '6-Month Price Trend (LKR / Kg)',
                    style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),

                  // FL Chart line graph
                  SizedBox(
                    height: 180,
                    child: LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: true, drawVerticalLine: false),
                        titlesData: FlTitlesData(
                          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
                                if (value.toInt() >= 0 && value.toInt() < months.length) {
                                  return Text(months[value.toInt()], style: const TextStyle(fontSize: 10));
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
                              FlSpot(0, _selectedCrop.historicalAveragePricePerKg * 0.9),
                              FlSpot(1, _selectedCrop.historicalAveragePricePerKg * 1.05),
                              FlSpot(2, _selectedCrop.historicalAveragePricePerKg * 1.2),
                              FlSpot(3, _selectedCrop.historicalAveragePricePerKg * 1.15),
                              FlSpot(4, _selectedCrop.currentMarketPricePerKg),
                              FlSpot(5, _selectedCrop.currentMarketPricePerKg * 0.95),
                            ],
                            isCurved: true,
                            color: AppColors.primary,
                            barWidth: 3,
                            dotData: const FlDotData(show: true),
                            belowBarData: BarAreaData(
                              show: true,
                              color: AppColors.primary.withOpacity(0.12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Wholesale Market Benchmark Table
            Text(
              'Wholesale Center Benchmarks',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            _buildMarketRow('Manning Market (Colombo)', 'Rs. ${_selectedCrop.currentMarketPricePerKg.toStringAsFixed(0)}', '+5.2%'),
            _buildMarketRow('Dambulla Economic Centre', 'Rs. {(_selectedCrop.currentMarketPricePerKg * 0.92).toStringAsFixed(0)}', '-2.1%'),
            _buildMarketRow('Keppetipola Dedicated Market', 'Rs. {(_selectedCrop.currentMarketPricePerKg * 0.88).toStringAsFixed(0)}', '+1.4%'),
            _buildMarketRow('Nuwara Eliya Wholesale', 'Rs. {(_selectedCrop.currentMarketPricePerKg * 0.85).toStringAsFixed(0)}', '+0.8%'),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMarketRow(String market, String price, String change) {
    final isPos = change.startsWith('+');
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8EFE8)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(market, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
          Row(
            children: [
              Text(price, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Text(
                change,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isPos ? AppColors.riskSafe : AppColors.riskCritical,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
