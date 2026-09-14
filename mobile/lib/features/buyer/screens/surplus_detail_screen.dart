import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/surplus_listing_model.dart';
import 'direct_chat_screen.dart';

class SurplusDetailScreen extends StatefulWidget {
  final SurplusListing listing;

  const SurplusDetailScreen({super.key, required this.listing});

  @override
  State<SurplusDetailScreen> createState() => _SurplusDetailScreenState();
}

class _SurplusDetailScreenState extends State<SurplusDetailScreen> {
  late double _selectedQuantity;

  @override
  void initState() {
    super.initState();
    _selectedQuantity = (widget.listing.availableQuantityKg * 0.5).clamp(25.0, widget.listing.availableQuantityKg);
  }

  void _showOrderConfirmationDialog(BuildContext context, double totalCost, double totalSavings) {
    final orderId = 'ASV-5KM-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final dateFormat = DateFormat('MMM dd, yyyy');

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        contentPadding: const EdgeInsets.all(20),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified_rounded, color: AppColors.primary, size: 40),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                'Digital Pickup Voucher',
                style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            Center(
              child: Text(
                'Order #$orderId',
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
              ),
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),

            _buildReceiptRow('Crop Ordered:', '${widget.listing.cropEmoji} ${widget.listing.cropName} (${_selectedQuantity.toStringAsFixed(0)} Kg)'),
            _buildReceiptRow('Unit Rate:', 'Rs. ${widget.listing.askingPricePerKgLkr.toStringAsFixed(0)} / Kg'),
            _buildReceiptRow('Total Amount:', 'Rs. ${totalCost.toStringAsFixed(0)}', isBold: true),
            _buildReceiptRow('Money Saved:', 'Rs. ${totalSavings.toStringAsFixed(0)} (vs Market)', isHighlight: true),
            _buildReceiptRow('Pickup Farm:', widget.listing.farmLocation),
            _buildReceiptRow('Farmer:', '${widget.listing.farmerName} (${widget.listing.farmerPhone})'),
            _buildReceiptRow('Pickup Date:', dateFormat.format(DateTime.now())),

            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F8F4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFD6E8D6)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_2_rounded, size: 36, color: AppColors.primaryDark),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Show this voucher to the farmer at the farmgate upon vehicle loading.',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent),
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => DirectChatScreen(
                            farmerName: widget.listing.farmerName,
                            cropName: widget.listing.cropName,
                            requestedQuantityKg: _selectedQuantity,
                            totalCostLkr: totalCost,
                          ),
                        ),
                      );
                    },
                    child: const Text('Open Chat'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
                color: isHighlight ? AppColors.primary : (isBold ? AppColors.textPrimary : AppColors.textSecondary),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.listing;
    final totalCost = _selectedQuantity * item.askingPricePerKgLkr;
    final regularCost = _selectedQuantity * item.regularMarketPricePerKgLkr;
    final totalSavings = regularCost - totalCost;
    final dateFormat = DateFormat('MMM dd, yyyy (hh:mm a)');

    return Scaffold(
      appBar: AppBar(
        title: Text('${item.cropName} Surplus Lot'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Crop Hero Box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2ECE2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(item.cropEmoji, style: const TextStyle(fontSize: 44)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              item.cropName,
                              style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            if (item.isUrgent)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.riskCriticalBg,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'URGENT CLEARANCE',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.riskCritical),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Quality: ${item.qualityGrade}',
                          style: GoogleFonts.inter(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          'Harvested: ${dateFormat.format(item.harvestedDate)}',
                          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Farmer & Farm Location Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2ECE2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Farmer & Pickup Details', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppColors.primarySoft,
                        child: Icon(Icons.person, color: AppColors.primary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.farmerName, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
                            Text('${item.farmLocation} • ${item.distanceKm} km from your kitchen', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFBF9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, size: 16, color: AppColors.textMuted),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.notes,
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quantity Selection & Price Calculation
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.accent.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Purchase Quantity', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
                      Text(
                        '${_selectedQuantity.toStringAsFixed(0)} Kg',
                        style: GoogleFonts.poppins(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.accent),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppColors.accent,
                      thumbColor: AppColors.accent,
                    ),
                    child: Slider(
                      value: _selectedQuantity,
                      min: 25.0,
                      max: item.availableQuantityKg,
                      divisions: (item.availableQuantityKg / 25).round().clamp(1, 50),
                      label: '${_selectedQuantity.toStringAsFixed(0)} Kg',
                      onChanged: (val) => setState(() => _selectedQuantity = val),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Min: 25 Kg', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                      Text('Max Available: ${item.availableQuantityKg.toStringAsFixed(0)} Kg', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 10),

                  // Financial summary
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Unit Price:', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                      Text('Rs. ${item.askingPricePerKgLkr.toStringAsFixed(0)} / Kg', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Wholesale Market Benchmark:', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                      Text('Rs. ${item.regularMarketPricePerKgLkr.toStringAsFixed(0)} / Kg', style: GoogleFonts.inter(fontSize: 13, decoration: TextDecoration.lineThrough, color: AppColors.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Order Amount:', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
                      Text(
                        'Rs. ${totalCost.toStringAsFixed(0)}',
                        style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '🎉 You save Rs. ${totalSavings.toStringAsFixed(0)} and prevent ~${_selectedQuantity.toStringAsFixed(0)} Kg of food waste!',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Book Order Button
            ElevatedButton.icon(
              icon: const Icon(Icons.bookmark_added_rounded),
              label: const Text('Reserve Batch & Generate Pickup Voucher', style: TextStyle(fontSize: 15)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              onPressed: () => _showOrderConfirmationDialog(context, totalCost, totalSavings),
            ),
            const SizedBox(height: 12),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.call),
                    label: const Text('Call Farmer'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary, width: 1.5),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Calling farmer ${item.farmerName}: ${item.farmerPhone}...')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.chat_bubble_outline),
                    label: const Text('Direct Chat'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.accent,
                      side: const BorderSide(color: AppColors.accent, width: 1.5),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => DirectChatScreen(
                            farmerName: item.farmerName,
                            cropName: item.cropName,
                            requestedQuantityKg: _selectedQuantity,
                            totalCostLkr: totalCost,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
