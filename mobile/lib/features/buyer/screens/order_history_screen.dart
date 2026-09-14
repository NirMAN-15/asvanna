import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');

    final orders = [
      {
        'id': 'ORD-8821',
        'crop': 'Leeks 🥬',
        'farmer': 'Sunil Bandara (Kinigama)',
        'quantity': 350.0,
        'cost': 45500.0,
        'saved': 31500.0,
        'date': DateTime.now().subtract(const Duration(days: 2)),
        'status': 'Completed Pickup',
      },
      {
        'id': 'ORD-8794',
        'crop': 'Cabbage 🥗',
        'farmer': 'Kamal Jayawardena (Diyatalawa)',
        'quantity': 500.0,
        'cost': 45000.0,
        'saved': 25000.0,
        'date': DateTime.now().subtract(const Duration(days: 6)),
        'status': 'Completed Pickup',
      },
      {
        'id': 'ORD-8750',
        'crop': 'Tomatoes 🍅',
        'farmer': 'Sarath Gunasekara (Heeloya)',
        'quantity': 200.0,
        'cost': 24000.0,
        'saved': 14000.0,
        'date': DateTime.now().subtract(const Duration(days: 12)),
        'status': 'Completed Pickup',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Procurement & Waste Prevention'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Sustainability Impact Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF004D40), Color(0xFF00796B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF004D40).withOpacity(0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('🌱', style: TextStyle(fontSize: 22)),
                      const SizedBox(width: 8),
                      Text(
                        'Your Zero-Waste Impact',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Direct 5km local procurement prevents upcountry post-harvest spoilage and cuts middleman markup.',
                    style: GoogleFonts.inter(fontSize: 12, color: Colors.white70, height: 1.3),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white24),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildImpactItem('Surplus Saved', '1,050 Kg', Icons.eco_outlined),
                      _buildImpactItem('Total Savings', 'Rs. 70,500', Icons.savings_outlined),
                      _buildImpactItem('Batches', '3 Orders', Icons.check_circle_outline),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'Past Surplus Procurements',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...orders.map((ord) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2ECE2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          ord['crop'] as String,
                          style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primarySoft,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            ord['status'] as String,
                            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Farmer: ${ord['farmer']}',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                    ),
                    Text(
                      'Procured on ${dateFormat.format(ord['date'] as DateTime)} • Order #${ord['id']}',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: Color(0xFFEFF4EF)),
                    const SizedBox(height: 6),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Volume: ${(ord['quantity'] as double).toStringAsFixed(0)} Kg',
                          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Rs. ${(ord['cost'] as double).toStringAsFixed(0)} Paid',
                              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            Text(
                              'Saved Rs. ${(ord['saved'] as double).toStringAsFixed(0)}',
                              style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildImpactItem(String label, String val, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: Colors.white70),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
      ],
    );
  }
}
