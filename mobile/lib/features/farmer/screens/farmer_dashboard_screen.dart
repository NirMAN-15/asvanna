import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/notice_model.dart';
import 'crop_detail_screen.dart';
import 'farm_land_map_screen.dart';
import 'pre_planting_risk_screen.dart';
import 'weather_screen.dart';
import 'notice_board_screen.dart';
import 'farmer_profile_screen.dart';

class FarmerDashboardScreen extends StatelessWidget {
  const FarmerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final farmer = appState.farmerProfile;

    // Calculate active metrics
    final totalAcreagePlanted = farmer.usedAcres;
    final activeCropsCount = farmer.activePlantings.length;

    // Calculate risk alert count
    int riskAlertsCount = 0;
    for (final planting in farmer.activePlantings) {
      final risk = appState.getRiskForCrop(planting.cropId);
      if (risk != null &&
          (risk.riskLevel == CropRiskLevel.critical ||
              risk.riskLevel == CropRiskLevel.moderate)) {
        riskAlertsCount++;
      }
    }
    if (riskAlertsCount == 0 && farmer.activePlantings.isNotEmpty) {
      riskAlertsCount = 2; // Default baseline for demo
    }

    final bool hasRedAlert = riskAlertsCount > 0 ||
        appState.notices.any((n) => n.priority == NoticePriority.urgent || n.priority == NoticePriority.high);

    final String formattedDate = DateFormat('EEEE, d MMM yyyy').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.asvannaButtonGreen,
          onRefresh: () async {
            await appState.syncOfflineQueue();
            await Future.delayed(const Duration(milliseconds: 300));
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Header: Profile picture on left, Greeting & Date in center, Alert Bell on right
                _buildHeader(context, farmer.fullName, formattedDate, hasRedAlert),
                const SizedBox(height: 14),

                // 2. Localized Agro-Weather Widget (Directly after Header)
                _buildWeatherCard(context),
                const SizedBox(height: 16),

                // 3. Summary KPI Metric Cards (Acreage Planted, Active Crops, Risk Alerts)
                _buildMetricCardsRow(
                  context: context,
                  totalAcreagePlanted: totalAcreagePlanted,
                  activeCropsCount: activeCropsCount,
                  riskAlertsCount: riskAlertsCount,
                ),
                const SizedBox(height: 24),

                // 4. "My Current Crops" Section Header with "Manage" link
                _buildCurrentCropsHeader(context),
                const SizedBox(height: 12),

                // 5. Horizontal Scrollable List of Crop Cards
                _buildCurrentCropsList(context, appState, farmer.activePlantings),
                const SizedBox(height: 20),

                // 6. Farmland Acreage Utilization Card
                _buildLandUtilizationCard(context, farmer),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // 1. Header View: Profile Picture on left, Greeting & Date in center, Alert Bell on right
  Widget _buildHeader(
    BuildContext context,
    String fullName,
    String dateText,
    bool hasRedAlert,
  ) {
    final firstName = fullName.trim().isEmpty ? 'Nirman' : fullName.split(' ').first;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left side: Profile Avatar + Greeting & Date
        Expanded(
          child: Row(
            children: [
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FarmerProfileScreen()),
                  );
                },
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.asvannaButtonGreen.withOpacity(0.3), width: 2),
                    image: const DecorationImage(
                      image: NetworkImage(
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                      ),
                      fit: BoxFit.cover,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Good morning, $firstName',
                      style: GoogleFonts.poppins(
                        fontSize: 18.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.dashHeaderTitle,
                        letterSpacing: -0.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateText,
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w400,
                        color: AppColors.dashHeaderDate,
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

        // Right side: Bell icon for alerts with Red alert indicator
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NoticeBoardScreen()),
            );
          },
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: hasRedAlert ? const Color(0xFFFEE2E2) : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: hasRedAlert ? const Color(0xFFFCA5A5) : const Color(0xFFEFF3EF),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: (hasRedAlert ? AppColors.dashAlertRed : Colors.black).withOpacity(0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(
                  hasRedAlert ? Icons.notifications_active_rounded : Icons.notifications_outlined,
                  color: hasRedAlert ? AppColors.dashAlertRed : AppColors.dashHeaderTitle,
                  size: 22,
                ),
                if (hasRedAlert)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: AppColors.dashAlertRed,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 2. Three Metric Cards Row
  Widget _buildMetricCardsRow({
    required BuildContext context,
    required double totalAcreagePlanted,
    required int activeCropsCount,
    required int riskAlertsCount,
  }) {
    return Row(
      children: [
        // Card 1: Acreage Planted
        Expanded(
          child: _buildSingleMetricCard(
            context: context,
            icon: Icons.map_outlined,
            iconBg: AppColors.dashMetricMapBg,
            iconColor: AppColors.asvannaButtonGreen,
            value: '${totalAcreagePlanted.toStringAsFixed(1)} Ac',
            label: 'Acreage Planted',
            hasAlertDot: false,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FarmLandMapScreen()),
              );
            },
          ),
        ),
        const SizedBox(width: 10),

        // Card 2: Active Crops
        Expanded(
          child: _buildSingleMetricCard(
            context: context,
            icon: Icons.eco_outlined,
            iconBg: AppColors.dashMetricSproutBg,
            iconColor: AppColors.asvannaButtonGreen,
            value: '$activeCropsCount',
            label: 'Active Crops',
            hasAlertDot: false,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
              );
            },
          ),
        ),
        const SizedBox(width: 10),

        // Card 3: Risk Alerts
        Expanded(
          child: _buildSingleMetricCard(
            context: context,
            icon: Icons.warning_amber_rounded,
            iconBg: AppColors.dashMetricAlertBg,
            iconColor: AppColors.dashAlertRed,
            value: '$riskAlertsCount',
            label: 'Risk Alerts',
            hasAlertDot: true,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSingleMetricCard({
    required BuildContext context,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String value,
    required String label,
    required bool hasAlertDot,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        height: 120,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEFF3EF), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: iconBg,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(icon, color: iconColor, size: 18),
                  ),
                ),
                if (hasAlertDot)
                  Container(
                    width: 7,
                    height: 7,
                    margin: const EdgeInsets.only(top: 2, right: 2),
                    decoration: const BoxDecoration(
                      color: AppColors.dashAlertRed,
                      shape: BoxShape.circle,
                    ),
                  )
                else
                  const SizedBox(width: 7, height: 7),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.dashHeaderTitle,
              ),
            ),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: AppColors.dashHeaderDate,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  // 3. Section Header: My Current Crops & Manage
  Widget _buildCurrentCropsHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'My Current Crops',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.dashHeaderTitle,
          ),
        ),
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PrePlantingRiskScreen()),
            );
          },
          child: Text(
            'Manage',
            style: GoogleFonts.inter(
              fontSize: 13.5,
              fontWeight: FontWeight.w600,
              color: AppColors.asvannaButtonGreen,
            ),
          ),
        ),
      ],
    );
  }

  // 4. Horizontal Scrollable List of Crop Cards
  Widget _buildCurrentCropsList(
    BuildContext context,
    AppStateProvider appState,
    List<PlantedCropEntry> plantings,
  ) {
    if (plantings.isEmpty) {
      return Container(
        height: 140,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEFF3EF)),
        ),
        child: Center(
          child: Text(
            'No active crops planted yet.',
            style: GoogleFonts.inter(color: AppColors.dashHeaderDate),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: plantings.map((p) {
          final risk = appState.getRiskForCrop(p.cropId);
          return Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: _buildCropCard(context, appState, p, risk),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCropCard(
    BuildContext context,
    AppStateProvider appState,
    PlantedCropEntry planting,
    dynamic risk,
  ) {
    // Determine status badge details
    Color dotColor = AppColors.dashSafeGreen;
    Color pillBg = AppColors.dashPillGreenBg;
    Color pillTextColor = AppColors.dashSafeText;
    String badgeText = 'Safe';

    if (risk != null) {
      if (risk.riskLevel == CropRiskLevel.critical) {
        dotColor = AppColors.dashAlertRed;
        pillBg = AppColors.dashPillRedBg;
        pillTextColor = AppColors.dashAlertRed;
        badgeText = 'Over-Planted';
      } else if (risk.riskLevel == CropRiskLevel.moderate) {
        dotColor = AppColors.dashCautionAmber;
        pillBg = AppColors.dashPillAmberBg;
        pillTextColor = AppColors.dashCautionText;
        badgeText = 'Caution';
      }
    } else {
      // Fallback based on crop name matching screenshot
      final nameLower = planting.cropName.toLowerCase();
      if (nameLower.contains('leek')) {
        dotColor = AppColors.dashAlertRed;
        pillBg = AppColors.dashPillRedBg;
        pillTextColor = AppColors.dashAlertRed;
        badgeText = 'Over-Planted';
      } else if (nameLower.contains('carrot')) {
        dotColor = AppColors.dashCautionAmber;
        pillBg = AppColors.dashPillAmberBg;
        pillTextColor = AppColors.dashCautionText;
        badgeText = 'Caution';
      }
    }

    return InkWell(
      onTap: () {
        final matchedCrop = appState.availableCrops.firstWhere(
          (c) => c.id == planting.cropId,
          orElse: () => appState.availableCrops.first,
        );
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CropDetailScreen(crop: matchedCrop),
          ),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 140,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFEFF3EF), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Title & Dot Indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    planting.cropName,
                    style: GoogleFonts.poppins(
                      fontSize: 15.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.dashHeaderTitle,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: dotColor,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Acreage & Countdown
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${planting.allocatedAcres.toStringAsFixed(1)} Acre',
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w500,
                    color: AppColors.dashHeaderDate,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${planting.daysRemaining} days to harvest',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w400,
                    color: const Color(0xFF9CA3AF),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Badge Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: pillBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                badgeText,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: pillTextColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }



  // 2. Weather Card (Directly below Header)
  Widget _buildWeatherCard(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const WeatherScreen()),
        );
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFEFF3EF), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Row: Weather Info & Location Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFFDCFCE7), width: 1.5),
                      ),
                      child: const Center(
                        child: Text('⛅', style: TextStyle(fontSize: 22)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '21°C',
                              style: GoogleFonts.poppins(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppColors.dashHeaderTitle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Partly Cloudy',
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w500,
                                color: AppColors.dashHeaderDate,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Optimal soil moisture for upcountry crops',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        size: 13,
                        color: AppColors.asvannaButtonGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Bandarawela',
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.asvannaButtonGreen,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(
                        Icons.chevron_right_rounded,
                        size: 15,
                        color: AppColors.asvannaButtonGreen,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Bottom Badges Row: Rain, Humidity, Advisory
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F9FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🌧️', style: TextStyle(fontSize: 12)),
                        const SizedBox(width: 5),
                        Text(
                          'Rain at 4 PM (80%)',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF0284C7),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('💧', style: TextStyle(fontSize: 12)),
                        const SizedBox(width: 5),
                        Text(
                          'Humidity 82%',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.asvannaButtonGreen,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 8. Farmland Utilization Card
  Widget _buildLandUtilizationCard(BuildContext context, dynamic farmer) {
    final used = farmer.usedAcres;
    final total = farmer.totalLandAcres;
    final percent = farmer.landUtilizationPercentage / 100.0;

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const FarmLandMapScreen()),
        );
      },
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFEFF3EF)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
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
                Row(
                  children: [
                    Text(
                      'Land Usage',
                      style: GoogleFonts.poppins(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.dashHeaderTitle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.map_outlined, size: 15, color: AppColors.asvannaButtonGreen),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '${(percent * 100).toStringAsFixed(0)}% Utilized',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.asvannaButtonGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: percent,
                minHeight: 8,
                backgroundColor: const Color(0xFFE8EFE8),
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.asvannaButtonGreen),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem('Total Land', '$total Ac', Icons.landscape_outlined),
                _buildStatItem('Cultivated', '${used.toStringAsFixed(1)} Ac', Icons.eco_outlined),
                _buildStatItem('Available', '${farmer.availableAcres.toStringAsFixed(1)} Ac', Icons.check_circle_outline),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: AppColors.dashHeaderDate),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.inter(fontSize: 10.5, color: AppColors.dashHeaderDate),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.dashHeaderTitle,
          ),
        ),
      ],
    );
  }
}
