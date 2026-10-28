import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/buyer_order_model.dart';
import '../../../core/localization/app_translations.dart';

class FarmerOrdersScreen extends StatefulWidget {
  const FarmerOrdersScreen({super.key});

  @override
  State<FarmerOrdersScreen> createState() => _FarmerOrdersScreenState();
}

class _FarmerOrdersScreenState extends State<FarmerOrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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

    final allOrders = appState.buyerOrders;
    final pendingOrders = allOrders.where((o) => o.status == OrderStatus.pending).toList();
    final activeOrders = allOrders.where((o) => o.status == OrderStatus.accepted).toList();
    final historyOrders = allOrders
        .where((o) => o.status == OrderStatus.completed || o.status == OrderStatus.rejected)
        .toList();

    final activeColor = isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        backgroundColor: context.scaffoldBg,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('nav_orders'),
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            Text(
              lang == AppLanguage.sinhala
                  ? 'ගැනුම්කරුවන්ගේ ඇණවුම් කළමනාකරණය'
                  : (lang == AppLanguage.tamil
                      ? 'வாங்குபவர் ஆர்டர் மேலாண்மை'
                      : 'Manage incoming buyer orders'),
              style: GoogleFonts.inter(
                fontSize: 11.5,
                color: context.subText,
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: activeColor,
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
              unselectedLabelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
              labelColor: Colors.white,
              unselectedLabelColor: context.subText,
              dividerColor: Colors.transparent,
              tabs: [
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(lang == AppLanguage.sinhala ? 'නොබලාත' : 'Pending'),
                      if (pendingOrders.isNotEmpty) ...
                        [
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: _tabController.index == 0
                                  ? Colors.white.withValues(alpha: 0.3)
                                  : AppColors.dashAlertRed,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '${pendingOrders.length}',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                    ],
                  ),
                ),
                Tab(text: lang == AppLanguage.sinhala ? 'ක්‍රියාකාරී' : 'Active'),
                Tab(text: lang == AppLanguage.sinhala ? 'ඉතිහාසය' : 'History'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderList(
            context: context,
            orders: pendingOrders,
            isDark: isDark,
            lang: lang,
            appState: appState,
            emptyIcon: Icons.hourglass_empty_rounded,
            emptyMsg: lang == AppLanguage.sinhala
                ? 'නව ඇණවුම් නොමැත'
                : 'No pending orders',
            emptySubMsg: lang == AppLanguage.sinhala
                ? 'ගැනුම්කරුවන් ඔබගේ අතිරික්ත නිෂ්පාදන ලේලියේ ඇණවුම් කළ විට මෙහි දිස්වේ'
                : 'When buyers order from your surplus listings, they will appear here',
          ),
          _buildOrderList(
            context: context,
            orders: activeOrders,
            isDark: isDark,
            lang: lang,
            appState: appState,
            emptyIcon: Icons.local_shipping_outlined,
            emptyMsg: lang == AppLanguage.sinhala
                ? 'ක්‍රියාකාරී ඇණවුම් නොමැත'
                : 'No active orders',
            emptySubMsg: lang == AppLanguage.sinhala
                ? 'ඔබ පිළිගත් ඇණවුම් මෙහි දිස්වේ'
                : 'Accepted orders will show here',
          ),
          _buildOrderList(
            context: context,
            orders: historyOrders,
            isDark: isDark,
            lang: lang,
            appState: appState,
            emptyIcon: Icons.history_rounded,
            emptyMsg: lang == AppLanguage.sinhala
                ? 'ඉතිහාසය හිස්'
                : 'No order history',
            emptySubMsg: lang == AppLanguage.sinhala
                ? 'සම්පූර්ණ කළ හෝ ප්‍රතික්ෂේප කළ ඇණවුම් මෙහි දිස්වේ'
                : 'Completed or rejected orders will appear here',
          ),
        ],
      ),
    );
  }

  Widget _buildOrderList({
    required BuildContext context,
    required List<BuyerOrder> orders,
    required bool isDark,
    required AppLanguage lang,
    required AppStateProvider appState,
    required IconData emptyIcon,
    required String emptyMsg,
    required String emptySubMsg,
  }) {
    if (orders.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: Icon(emptyIcon, size: 48, color: context.subText),
              ),
              const SizedBox(height: 16),
              Text(
                emptyMsg,
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: context.titleText,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                emptySubMsg,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: context.subText,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _buildOrderCard(
          context: context,
          order: orders[index],
          isDark: isDark,
          lang: lang,
          appState: appState,
        );
      },
    );
  }

  Widget _buildOrderCard({
    required BuildContext context,
    required BuyerOrder order,
    required bool isDark,
    required AppLanguage lang,
    required AppStateProvider appState,
  }) {
    final activeColor = isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen;

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (order.status) {
      case OrderStatus.pending:
        statusColor = const Color(0xFFD97706);
        statusLabel = lang == AppLanguage.sinhala ? 'බලාපොරොත්තු' : 'Pending';
        statusIcon = Icons.schedule_rounded;
        break;
      case OrderStatus.accepted:
        statusColor = activeColor;
        statusLabel = lang == AppLanguage.sinhala ? 'පිළිගත්' : 'Accepted';
        statusIcon = Icons.check_circle_rounded;
        break;
      case OrderStatus.rejected:
        statusColor = AppColors.dashAlertRed;
        statusLabel = lang == AppLanguage.sinhala ? 'ප්‍රතික්ෂේප' : 'Rejected';
        statusIcon = Icons.cancel_rounded;
        break;
      case OrderStatus.completed:
        statusColor = const Color(0xFF6366F1);
        statusLabel = lang == AppLanguage.sinhala ? 'සම්පූර්ණ' : 'Completed';
        statusIcon = Icons.verified_rounded;
        break;
    }

    final diff = DateTime.now().difference(order.orderedAt);
    String timeAgo;
    if (diff.inMinutes < 60) {
      timeAgo = '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      timeAgo = '${diff.inHours}h ago';
    } else {
      timeAgo = '${diff.inDays}d ago';
    }

    // COMPACT PREVIEW CARD
    return GestureDetector(
      onTap: () => _showOrderDetailSheet(
        context: context,
        order: order,
        isDark: isDark,
        lang: lang,
        appState: appState,
        statusColor: statusColor,
        statusLabel: statusLabel,
        statusIcon: statusIcon,
        activeColor: activeColor,
        timeAgo: timeAgo,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: context.cardBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: order.status == OrderStatus.pending
                ? const Color(0xFFD97706).withValues(alpha: 0.5)
                : (isDark ? const Color(0xFF334155) : context.cardBorder),
            width: order.status == OrderStatus.pending ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row: Emoji avatar + Crop info + Status badge
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(order.cropEmoji, style: const TextStyle(fontSize: 24)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.cropName,
                          style: GoogleFonts.poppins(
                            fontSize: 14.5,
                            fontWeight: FontWeight.bold,
                            color: context.titleText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${order.id} • $timeAgo',
                          style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 11, color: statusColor),
                        const SizedBox(width: 3),
                        Text(
                          statusLabel,
                          style: GoogleFonts.inter(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Bottom row: Stats chips + Chevron
              Row(
                children: [
                  Expanded(
                    child: Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        _buildMiniChip(
                          icon: Icons.scale_rounded,
                          label: '${order.quantityKg.toStringAsFixed(0)} kg',
                          color: const Color(0xFF6366F1),
                          isDark: isDark,
                        ),
                        _buildMiniChip(
                          icon: Icons.account_balance_wallet_rounded,
                          label: 'Rs. ${order.totalAmount.toStringAsFixed(0)}',
                          color: const Color(0xFFD97706),
                          isDark: isDark,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  Icon(Icons.chevron_right_rounded, size: 18, color: context.subText),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniChip({
    required IconData icon,
    required String label,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: isDark ? 0.15 : 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: color),
          ),
        ],
      ),
    );
  }

  void _showOrderDetailSheet({
    required BuildContext context,
    required BuyerOrder order,
    required bool isDark,
    required AppLanguage lang,
    required AppStateProvider appState,
    required Color statusColor,
    required String statusLabel,
    required IconData statusIcon,
    required Color activeColor,
    required String timeAgo,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.78,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 4),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                  children: [
                    // Header
                    Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Text(order.cropEmoji, style: const TextStyle(fontSize: 28)),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                order.cropName,
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '${order.id} • $timeAgo',
                                style: GoogleFonts.inter(
                                  fontSize: 11.5,
                                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(statusIcon, size: 12, color: statusColor),
                              const SizedBox(width: 4),
                              Text(
                                statusLabel,
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
                    const SizedBox(height: 20),

                    // Buyer Details
                    _sheetSectionLabel(context, isDark, Icons.person_rounded, 'Buyer Details'),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAF8),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(9),
                            decoration: BoxDecoration(
                              color: activeColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.storefront_rounded, size: 20, color: activeColor),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  order.buyerBusiness,
                                  style: GoogleFonts.inter(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  order.buyerName,
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  order.buyerPhone,
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: activeColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Calling ${order.buyerPhone}...'),
                                  backgroundColor: activeColor,
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: activeColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: activeColor.withValues(alpha: 0.3)),
                              ),
                              child: Icon(Icons.phone_rounded, size: 20, color: activeColor),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Order Details
                    _sheetSectionLabel(context, isDark, Icons.receipt_long_rounded, 'Order Details'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _sheetDetailTile(
                            context: context,
                            isDark: isDark,
                            icon: Icons.scale_rounded,
                            label: 'Quantity',
                            value: '${order.quantityKg.toStringAsFixed(0)} kg',
                            color: const Color(0xFF6366F1),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _sheetDetailTile(
                            context: context,
                            isDark: isDark,
                            icon: Icons.payments_rounded,
                            label: 'Price / kg',
                            value: 'Rs. ${order.pricePerKg.toStringAsFixed(0)}',
                            color: activeColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _sheetDetailTile(
                      context: context,
                      isDark: isDark,
                      icon: Icons.account_balance_wallet_rounded,
                      label: 'Total Amount',
                      value: 'Rs. ${order.totalAmount.toStringAsFixed(0)}',
                      color: const Color(0xFFD97706),
                      fullWidth: true,
                    ),

                    if (order.notes.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      _sheetSectionLabel(context, isDark, Icons.notes_rounded, 'Special Notes'),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFFDE68A),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('📝', style: TextStyle(fontSize: 14)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                order.notes,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF78350F),
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),

                    if (order.status == OrderStatus.pending) ...[
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.close_rounded, size: 16),
                              label: Text(
                                lang == AppLanguage.sinhala ? 'ප්‍රතික්ෂේප' : 'Reject',
                                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.dashAlertRed,
                                side: BorderSide(color: AppColors.dashAlertRed.withValues(alpha: 0.5)),
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: () {
                                Navigator.pop(ctx);
                                _confirmAction(
                                  context: context,
                                  title: lang == AppLanguage.sinhala ? 'ඇණවුම ප්‍රතික්ෂේප කරන්නද?' : 'Reject this order?',
                                  subtitle: lang == AppLanguage.sinhala
                                      ? '${order.buyerBusiness} ගේ ඇණවුම ප්‍රතික්ෂේප වේ.'
                                      : 'The order from ${order.buyerBusiness} will be rejected.',
                                  confirmLabel: lang == AppLanguage.sinhala ? 'ප්‍රතික්ෂේප' : 'Reject',
                                  confirmColor: AppColors.dashAlertRed,
                                  onConfirm: () => appState.updateOrderStatus(order.id, OrderStatus.rejected),
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.check_rounded, size: 16),
                              label: Text(
                                lang == AppLanguage.sinhala ? 'ඇණවුම පිළිගන්න' : 'Accept Order',
                                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: activeColor,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 13),
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: () {
                                Navigator.pop(ctx);
                                _confirmAction(
                                  context: context,
                                  title: lang == AppLanguage.sinhala ? 'ඇණවුම පිළිගන්නද?' : 'Accept this order?',
                                  subtitle: lang == AppLanguage.sinhala
                                      ? '${order.quantityKg.toStringAsFixed(0)} kg ${order.cropName} - Rs. ${order.totalAmount.toStringAsFixed(0)}'
                                      : '${order.quantityKg.toStringAsFixed(0)} kg ${order.cropName} for Rs. ${order.totalAmount.toStringAsFixed(0)}',
                                  confirmLabel: lang == AppLanguage.sinhala ? 'පිළිගන්න' : 'Accept',
                                  confirmColor: activeColor,
                                  onConfirm: () {
                                    appState.updateOrderStatus(order.id, OrderStatus.accepted);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          lang == AppLanguage.sinhala
                                              ? 'ඇණවුම සාර්ථකව පිළිගන්නා ලදී!'
                                              : 'Order accepted! Buyer has been notified.',
                                        ),
                                        backgroundColor: activeColor,
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ],

                    if (order.status == OrderStatus.accepted) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.verified_rounded, size: 16),
                          label: Text(
                            lang == AppLanguage.sinhala ? 'බෙදා හැරීම සම්පූර්ණ' : 'Mark as Delivered',
                            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            Navigator.pop(ctx);
                            _confirmAction(
                              context: context,
                              title: lang == AppLanguage.sinhala ? 'බෙදා හැරීම සම්පූර්ණද?' : 'Mark as delivered?',
                              subtitle: lang == AppLanguage.sinhala
                                  ? 'ඇණවුම සම්පූර්ණ කළ ලෙස සලකුණු වේ.'
                                  : 'This order will be marked as completed.',
                              confirmLabel: lang == AppLanguage.sinhala ? 'සම්පූර්ණ' : 'Complete',
                              confirmColor: const Color(0xFF6366F1),
                              onConfirm: () => appState.updateOrderStatus(order.id, OrderStatus.completed),
                            );
                          },
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sheetSectionLabel(BuildContext context, bool isDark, IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 15, color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
        const SizedBox(width: 6),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            letterSpacing: 0.4,
          ),
        ),
      ],
    );
  }

  Widget _sheetDetailTile({
    required BuildContext context,
    required bool isDark,
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    bool fullWidth = false,
  }) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: isDark ? 0.12 : 0.07),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 13, color: color),
              const SizedBox(width: 5),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color.withValues(alpha: 0.85),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: fullWidth ? 17 : 15,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmAction({
    required BuildContext context,
    required String title,
    required String subtitle,
    required String confirmLabel,
    required Color confirmColor,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
        content: Text(
          subtitle,
          style: GoogleFonts.inter(fontSize: 13, color: context.subText),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: GoogleFonts.inter(color: context.subText)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: confirmColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(context);
              onConfirm();
            },
            child: Text(confirmLabel, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
