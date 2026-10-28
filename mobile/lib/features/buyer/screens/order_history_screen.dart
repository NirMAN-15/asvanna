import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/buyer_order_model.dart';
import '../../../core/widgets/language_selection_dialog.dart';
import 'direct_chat_screen.dart';

class OrderHistoryScreen extends StatefulWidget {
  final void Function(int tabIndex)? onTabSelected;

  const OrderHistoryScreen({super.key, this.onTabSelected});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  int _selectedFilterIndex = 0; // 0: All, 1: Active, 2: Completed

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showLanguageSelectionDialog(context, appState);
  }

  void _showCancelConfirmation(BuildContext context, AppStateProvider appState, BuyerOrder order) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Cancel Order?',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18, color: context.titleText),
        ),
        content: Text(
          'Are you sure you want to cancel order #${order.id} for ${order.quantityKg.toStringAsFixed(0)} Kg of ${order.cropName}?',
          style: GoogleFonts.inter(fontSize: 13, color: context.subText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
            onPressed: () {
              appState.cancelBuyerOrder(order.id);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Order #${order.id} cancelled.')),
              );
            },
            child: const Text('Yes, Cancel', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showVoucherDialog(BuildContext context, BuyerOrder order) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Center(
          child: Text(
            'Digital Pickup Voucher',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18, color: context.titleText),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.qr_code_2_rounded, size: 48, color: Color(0xFF15803D)),
            ),
            const SizedBox(height: 12),
            Text(
              'Order #${order.id}',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.asvannaButtonGreen),
            ),
            const SizedBox(height: 8),
            Text(
              '${order.cropEmoji} ${order.cropName} — ${order.quantityKg.toStringAsFixed(0)} Kg',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16, color: context.titleText),
            ),
            Text(
              'Total Amount: Rs. ${order.totalAmount.toStringAsFixed(0)}',
              style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, color: const Color(0xFF15803D)),
            ),
            const SizedBox(height: 10),
            Divider(color: context.dividerColor),
            const SizedBox(height: 6),
            Text(
              'Farmer: ${order.farmerName}',
              style: GoogleFonts.inter(fontSize: 12, color: context.subText),
            ),
            Text(
              'Location: ${order.farmLocation}',
              style: GoogleFonts.inter(fontSize: 12, color: context.subText),
            ),
            Text(
              'Date: ${dateFormat.format(order.orderedAt)}',
              style: GoogleFonts.inter(fontSize: 12, color: context.subText),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Text(
                'Show this screen to the farmer upon pickup verification.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF166534)),
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.asvannaButtonGreen),
            onPressed: () => Navigator.pop(context),
            child: const Text('Done', style: TextStyle(color: Colors.white)),
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

    String langLabel = 'සිංහල';
    if (lang == AppLanguage.english) langLabel = 'English';
    if (lang == AppLanguage.tamil) langLabel = 'தமிழ்';

    final allOrders = appState.buyerOrders;
    final filteredOrders = allOrders.where((o) {
      if (_selectedFilterIndex == 1) {
        return o.status == OrderStatus.pending || o.status == OrderStatus.accepted;
      }
      if (_selectedFilterIndex == 2) {
        return o.status == OrderStatus.completed || o.status == OrderStatus.rejected;
      }
      return true; // All
    }).toList();

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── 1. HEADER BAR (Logo + App Name | Language + Bell) ──
            _buildHeaderBar(context, appState, langLabel),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── 2. PAGE TITLE ──
                    Row(
                      children: [
                        const Text('📦', style: TextStyle(fontSize: 24)),
                        const SizedBox(width: 8),
                        Text(
                          'ඇණවුම් (Orders)',
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: context.titleText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // ── 3. TAB BAR CHIPS (All / Active / Completed) ──
                    _buildTabBar(context, isDark, allOrders),
                    const SizedBox(height: 16),

                    // ── 4. ORDER CARDS LIST ──
                    if (filteredOrders.isEmpty)
                      _buildEmptyOrdersState(context, isDark)
                    else
                      ...filteredOrders.map((order) => _buildOrderCard(context, appState, order, isDark)),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
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

  // 3. Tab Bar
  Widget _buildTabBar(BuildContext context, bool isDark, List<BuyerOrder> allOrders) {
    final activeCount = allOrders.where((o) => o.status == OrderStatus.pending || o.status == OrderStatus.accepted).length;
    final completedCount = allOrders.where((o) => o.status == OrderStatus.completed || o.status == OrderStatus.rejected).length;

    final tabs = [
      {'label': 'All (${allOrders.length})', 'index': 0},
      {'label': 'Active ($activeCount)', 'index': 1},
      {'label': 'Completed ($completedCount)', 'index': 2},
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isSelected = _selectedFilterIndex == tab['index'];
          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedFilterIndex = tab['index'] as int);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (isDark ? const Color(0xFF16A34A) : AppColors.asvannaButtonGreen)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  tab['label'] as String,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    color: isSelected ? Colors.white : context.subText,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // 4. Order Card (Matching Mockup)
  Widget _buildOrderCard(BuildContext context, AppStateProvider appState, BuyerOrder order, bool isDark) {
    final dateFormat = DateFormat('MMM dd, yyyy');

    Color borderAccentColor;
    switch (order.status) {
      case OrderStatus.pending:
        borderAccentColor = const Color(0xFFF59E0B);
        break;
      case OrderStatus.accepted:
        borderAccentColor = const Color(0xFF0284C7);
        break;
      case OrderStatus.completed:
        borderAccentColor = const Color(0xFF16A34A);
        break;
      case OrderStatus.rejected:
        borderAccentColor = const Color(0xFFDC2626);
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top accent strip
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: borderAccentColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Product + Status Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '${order.cropName} — ${order.variety}',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: context.titleText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: order.statusBgColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: order.statusColor.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        _getOrderStatusLabel(order.status),
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          fontWeight: FontWeight.bold,
                          color: order.statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                // Quantity and Amount
                Text(
                  'Qty: ${order.quantityKg.toStringAsFixed(0)}kg • Rs. ${order.totalAmount.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D),
                  ),
                ),
                const SizedBox(height: 4),

                // Farmer info
                Text(
                  '🌾 Farmer: ${order.farmerName}',
                  style: GoogleFonts.inter(fontSize: 12.5, color: context.subText),
                ),
                const SizedBox(height: 2),

                // Date
                Text(
                  '📅 ${dateFormat.format(order.orderedAt)}',
                  style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                ),
                const SizedBox(height: 14),

                // Action Buttons
                _buildActionButtons(context, appState, order, isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getOrderStatusLabel(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending:
        return '⏳ Pending';
      case OrderStatus.accepted:
        return '✅ Confirmed';
      case OrderStatus.completed:
        return '🎉 Completed';
      case OrderStatus.rejected:
        return '❌ Cancelled';
    }
  }

  Widget _buildActionButtons(BuildContext context, AppStateProvider appState, BuyerOrder order, bool isDark) {
    if (order.status == OrderStatus.pending) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFDC2626),
                side: const BorderSide(color: Color(0xFFF87171), width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 11),
              ),
              onPressed: () => _showCancelConfirmation(context, appState, order),
              child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                side: BorderSide(
                  color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                  width: 1.5,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 11),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => DirectChatScreen(
                      farmerName: order.farmerName,
                      cropName: order.cropName,
                      requestedQuantityKg: order.quantityKg,
                      totalCostLkr: order.totalAmount,
                      showAppBarBack: true,
                    ),
                  ),
                );
              },
              child: const Text('Chat', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      );
    } else if (order.status == OrderStatus.accepted) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              icon: const Icon(Icons.qr_code_2_rounded, size: 16),
              label: const Text('Pickup Voucher', style: TextStyle(fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF0284C7),
                side: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 11),
              ),
              onPressed: () => _showVoucherDialog(context, order),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                side: BorderSide(
                  color: isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen,
                  width: 1.5,
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 11),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => DirectChatScreen(
                      farmerName: order.farmerName,
                      cropName: order.cropName,
                      requestedQuantityKg: order.quantityKg,
                      totalCostLkr: order.totalAmount,
                      showAppBarBack: true,
                    ),
                  ),
                );
              },
              child: const Text('Chat', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      );
    } else {
      // Completed or Rejected
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.white),
          label: const Text('Reorder', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.asvannaButtonGreen,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
          onPressed: () {
            widget.onTabSelected?.call(0); // Go to Marketplace
          },
        ),
      );
    }
  }

  Widget _buildEmptyOrdersState(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 50, horizontal: 20),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Text('📦', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text(
            'No orders in this tab',
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: context.titleText),
          ),
          const SizedBox(height: 6),
          Text(
            'Browse nearby surplus crops and place orders with farmgate pickup.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 12, color: context.subText),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.asvannaButtonGreen,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => widget.onTabSelected?.call(0),
            child: const Text('Browse Marketplace', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
