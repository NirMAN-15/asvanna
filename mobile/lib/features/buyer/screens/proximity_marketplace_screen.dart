import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/surplus_listing_model.dart';
import '../../../core/localization/app_translations.dart';
import 'surplus_detail_screen.dart';
import '../../auth/login_screen.dart';
import '../../farmer/widgets/presentation_demo_panel.dart';

class ProximityMarketplaceScreen extends StatefulWidget {
  const ProximityMarketplaceScreen({super.key});

  @override
  State<ProximityMarketplaceScreen> createState() => _ProximityMarketplaceScreenState();
}

class _ProximityMarketplaceScreenState extends State<ProximityMarketplaceScreen> {
  String _selectedCropFilter = 'All';

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final buyer = appState.buyerProfile;
    final listings = appState.filteredSurplusListings.where((l) {
      if (_selectedCropFilter == 'All') return true;
      return l.cropName.toLowerCase() == _selectedCropFilter.toLowerCase();
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              buyer?.businessName ?? 'Zero-Waste Marketplace',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              '${buyer?.category ?? "Bulk Buyer"} • Bandarawela Zone',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'University Demo Showcase',
            icon: const Icon(Icons.auto_awesome_rounded, color: AppColors.goldAccent),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                builder: (_) => const PresentationDemoPanel(),
              );
            },
          ),
          IconButton(
            tooltip: 'Switch Account / Log Out',
            icon: const Icon(Icons.logout_rounded, color: AppColors.accent),
            onPressed: () {
              appState.logout();
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.buyer)),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Proximity Radius Selector Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
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
                          const Icon(Icons.radar_rounded, color: AppColors.accent, size: 22),
                          const SizedBox(width: 8),
                          Text(
                            tr('proximity_radius'),
                            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Within ${appState.selectedRadiusKm.toStringAsFixed(0)} KM',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accent,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.accent,
                      inactiveTrackColor: AppColors.accent.withOpacity(0.2),
                      thumbColor: AppColors.accent,
                    ),
                    child: Slider(
                      value: appState.selectedRadiusKm,
                      min: 1.0,
                      max: 10.0,
                      divisions: 9,
                      label: '${appState.selectedRadiusKm.toStringAsFixed(0)} km',
                      onChanged: (val) => appState.setMarketRadius(val),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('1 KM (Local)', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      Text('5 KM (Catering Zone)', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accent)),
                      Text('10 KM (Regional)', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Visual Radar Map Preview Widget
            _buildRadarMapWidget(appState.selectedRadiusKm, listings),
            const SizedBox(height: 16),

            // Filter Chips
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  'All',
                  'Leeks',
                  'Cabbage',
                  'Tomatoes',
                  'Beetroot',
                  'Carrot',
                ].map((cropName) {
                  final isSelected = _selectedCropFilter == cropName;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(cropName),
                      selected: isSelected,
                      selectedColor: AppColors.accent,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedCropFilter = cropName);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Results count
            Text(
              'Available Fresh Surplus Batches (${listings.length})',
              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),

            if (listings.isEmpty)
              _buildEmptyMarketplace()
            else
              ...listings.map((item) => _buildSurplusCard(context, item, tr)),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildRadarMapWidget(double radiusKm, List<SurplusListing> listings) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F2B1D),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
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
                  const Icon(Icons.satellite_alt_rounded, color: Color(0xFF81C784), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Live Upcountry Surplus Radar',
                    style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${listings.length} Farms Active',
                  style: const TextStyle(color: Color(0xFF81C784), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Mini Map Visualizer
          Container(
            height: 110,
            decoration: BoxDecoration(
              color: const Color(0xFF143826),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E5238)),
            ),
            child: Stack(
              children: [
                // Concentric Range Rings
                Center(
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white12, width: 1),
                    ),
                  ),
                ),
                Center(
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white24, width: 1),
                    ),
                  ),
                ),
                // Center Buyer Pin
                const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.location_on, color: Color(0xFFFFD54F), size: 20),
                      Text('Your Kitchen', style: TextStyle(fontSize: 9, color: Colors.white70, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                // Nearby Farm Pins
                const Positioned(
                  top: 15,
                  left: 30,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🥬', style: TextStyle(fontSize: 14)),
                      SizedBox(width: 2),
                      Text('Heeloya (1.5km)', style: TextStyle(fontSize: 9, color: Colors.white70)),
                    ],
                  ),
                ),
                const Positioned(
                  top: 25,
                  right: 25,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🥗', style: TextStyle(fontSize: 14)),
                      SizedBox(width: 2),
                      Text('Diyatalawa (3.8km)', style: TextStyle(fontSize: 9, color: Colors.white70)),
                    ],
                  ),
                ),
                const Positioned(
                  bottom: 15,
                  left: 45,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🍅', style: TextStyle(fontSize: 14)),
                      SizedBox(width: 2),
                      Text('Kinigama (2.3km)', style: TextStyle(fontSize: 9, color: Colors.white70)),
                    ],
                  ),
                ),
                const Positioned(
                  bottom: 12,
                  right: 35,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🟣', style: TextStyle(fontSize: 14)),
                      SizedBox(width: 2),
                      Text('Welimada (4.6km)', style: TextStyle(fontSize: 9, color: Colors.white70)),
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

  Widget _buildSurplusCard(BuildContext context, SurplusListing item, String Function(String) tr) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SurplusDetailScreen(listing: item),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: item.isUrgent ? AppColors.riskCritical.withOpacity(0.3) : const Color(0xFFE2EBE2),
            width: item.isUrgent ? 1.5 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(item.cropEmoji, style: const TextStyle(fontSize: 28)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            item.cropName,
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (item.isUrgent)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.riskCriticalBg,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                tr('urgent_clearance'),
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.riskCritical,
                                ),
                              ),
                            ),
                        ],
                      ),
                      Text(
                        'Farmer: ${item.farmerName} • ${item.farmLocation}',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.near_me_outlined, size: 13, color: AppColors.accent),
                      const SizedBox(width: 4),
                      Text(
                        '${item.distanceKm} km',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.accent,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Price & Quantity Bar
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF7FAF7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Available Volume', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      Text(
                        '${item.availableQuantityKg.toStringAsFixed(0)} Kg',
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Rs. ${item.regularMarketPricePerKgLkr.toStringAsFixed(0)}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              decoration: TextDecoration.lineThrough,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Rs. ${item.askingPricePerKgLkr.toStringAsFixed(0)} / Kg',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryDark,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Save ${item.discountPercentage.toStringAsFixed(0)}% vs Market Price',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    item.notes,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted, fontStyle: FontStyle.italic),
                  ),
                ),
                Text(
                  'View & Buy →',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyMarketplace() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Column(
          children: [
            const Text('🔍', style: TextStyle(fontSize: 40)),
            const SizedBox(height: 8),
            Text(
              'No surplus crops within current radius',
              style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              'Try expanding your radius slider above to 7 km or 10 km.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
