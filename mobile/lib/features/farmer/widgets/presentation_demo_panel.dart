import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/models/risk_analysis_model.dart';
import '../../../core/models/surplus_listing_model.dart';

class PresentationDemoPanel extends StatelessWidget {
  const PresentationDemoPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('🪄', style: TextStyle(fontSize: 22)),
                    const SizedBox(width: 8),
                    Text(
                      'University Presentation Showcase',
                      style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            Text(
              'Quickly load live test scenarios for your ITUM supervisor & examination panel.',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),

            // Scenario 1: Saturated Leek Glut
            _buildScenarioCard(
              context,
              title: 'Scenario 1: Upcountry Leek Crisis (Over-Planting)',
              description: 'Simulates 620 acres planted in Bandarawela (163% saturation) with a 57% price crash risk. Recommends Beetroot (+38.5% profit).',
              badgeColor: AppColors.riskCritical,
              badgeText: 'CRITICAL ALERT DEMO',
              onApply: () {
                final leekCrop = appState.availableCrops.firstWhere((c) => c.id == 'crop_leeks');
                appState.selectCropForRisk(leekCrop);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Loaded Scenario 1: Leek Over-planting crisis active in Risk Engine.'),
                    backgroundColor: AppColors.riskCritical,
                  ),
                );
              },
            ),
            const SizedBox(height: 12),

            // Scenario 2: High Opportunity Beetroot Deficit
            _buildScenarioCard(
              context,
              title: 'Scenario 2: Beetroot Deficit (High Profit Window)',
              description: 'Shows regional under-cultivation (42% saturation). Ideal 70-day crop before monsoon arrival with premium farmgate margins.',
              badgeColor: AppColors.riskSafe,
              badgeText: 'HIGH PROFIT OPPORTUNITY',
              onApply: () {
                final beetCrop = appState.availableCrops.firstWhere((c) => c.id == 'crop_beetroot');
                appState.selectCropForRisk(beetCrop);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Loaded Scenario 2: Beetroot high-opportunity window active.'),
                    backgroundColor: AppColors.primary,
                  ),
                );
              },
            ),
            const SizedBox(height: 12),

            // Scenario 3: 5km Zero-Waste Perishable Clearance
            _buildScenarioCard(
              context,
              title: 'Scenario 3: 5km Zero-Waste Catering Clearance',
              description: 'Loads urgent 450kg Leek harvest in Kinigama (2.3km away) with 41% discount for local wedding & hotel caterers.',
              badgeColor: AppColors.accent,
              badgeText: 'MARKETPLACE DEMO',
              onApply: () {
                appState.setRole(UserRole.buyer);
                appState.setMarketRadius(5.0);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Loaded Scenario 3: Switched to Buyer View with 5km proximity listings.'),
                    backgroundColor: AppColors.accent,
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            // Reset Data Button
            OutlinedButton.icon(
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reset All Mock Data to Default'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('All demonstration data reset to initial values.')),
                );
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildScenarioCard(
    BuildContext context, {
    required String title,
    required String description,
    required Color badgeColor,
    required String badgeText,
    required VoidCallback onApply,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAF9),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2EBE2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeText,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: badgeColor),
                ),
              ),
              TextButton(
                style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                onPressed: onApply,
                child: const Text('Launch Scenario →', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary, height: 1.3),
          ),
        ],
      ),
    );
  }
}
