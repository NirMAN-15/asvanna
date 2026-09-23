import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/notice_model.dart';
import '../../../core/localization/app_translations.dart';
import '../../../core/services/push_notification_service.dart';

class NoticeBoardScreen extends StatefulWidget {
  const NoticeBoardScreen({super.key});

  @override
  State<NoticeBoardScreen> createState() => _NoticeBoardScreenState();
}

class _NoticeBoardScreenState extends State<NoticeBoardScreen> {
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Crop Directive',
    'Weather Warning',
    'Subsidy',
    'Disease Alert',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppStateProvider>(context, listen: false).fetchLiveNotices();
    });
  }

  void _showNoticeDetailDialog(BuildContext context, AgrarianNotice notice) {
    final isDark = context.isDarkMode;
    final dateFormat = DateFormat('EEEE, MMMM dd, yyyy • hh:mm a');

    Color priorityColor = const Color(0xFF16A34A);
    Color priorityBg = const Color(0xFFDCFCE7);
    String priorityLabel = 'GENERAL NOTICE';

    if (notice.priority == NoticePriority.urgent) {
      priorityColor = const Color(0xFFDC2626);
      priorityBg = const Color(0xFFFEE2E2);
      priorityLabel = 'URGENT DIRECTIVE';
    } else if (notice.priority == NoticePriority.high) {
      priorityColor = const Color(0xFFD97706);
      priorityBg = const Color(0xFFFEF3C7);
      priorityLabel = 'HIGH PRIORITY';
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        contentPadding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: priorityBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    priorityLabel,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: priorityColor,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (isDark ? const Color(0xFF22C55E) : AppColors.primary)
                        .withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified,
                          size: 13,
                          color: isDark ? const Color(0xFF4ADE80) : AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        'Verified Circular',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              notice.title,
              style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                notice.description,
                style: GoogleFonts.inter(
                  fontSize: 13.5,
                  color: context.subText,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: context.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.account_balance_rounded, size: 16, color: Color(0xFF64748B)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            notice.department,
                            style: GoogleFonts.inter(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: context.titleText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Issued by: ${notice.issuedBy}',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: context.mutedText,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      dateFormat.format(notice.date),
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        color: context.mutedText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Close',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openPushAlertComposer(BuildContext context) {
    final titleController = TextEditingController(text: 'Emergency Market Advisory: Leeks Sowing Halt');
    final descController = TextEditingController(
        text: 'Bandarawela Agrarian Services Centre urges farmers to pause sowing Leeks immediately due to 125% market saturation.');
    String category = 'Crop Directive';
    NoticePriority priority = NoticePriority.urgent;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) {
          final isDark = modalCtx.isDarkMode;

          return Padding(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.campaign_rounded, color: Color(0xFFDC2626), size: 22),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Push Agrarian Alert',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: modalCtx.titleText,
                              ),
                            ),
                            Text(
                              'Broadcast live push notice to regional farmers',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: modalCtx.subText,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(modalCtx),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Category selector
                Text(
                  'Category',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: modalCtx.titleText,
                  ),
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  children: ['Crop Directive', 'Weather Warning', 'Disease Alert', 'Subsidy'].map((cat) {
                    final isSel = category == cat;
                    return ChoiceChip(
                      label: Text(cat),
                      selected: isSel,
                      selectedColor: AppColors.primarySoft,
                      labelStyle: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                        color: isSel ? AppColors.primary : modalCtx.subText,
                      ),
                      onSelected: (_) => setModalState(() => category = cat),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),

                // Priority selector
                Text(
                  'Priority Level',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: modalCtx.titleText,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('Urgent')),
                        selected: priority == NoticePriority.urgent,
                        selectedColor: const Color(0xFFFEE2E2),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: priority == NoticePriority.urgent
                              ? const Color(0xFFDC2626)
                              : modalCtx.subText,
                        ),
                        onSelected: (_) => setModalState(() => priority = NoticePriority.urgent),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('High')),
                        selected: priority == NoticePriority.high,
                        selectedColor: const Color(0xFFFEF3C7),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: priority == NoticePriority.high
                              ? const Color(0xFFD97706)
                              : modalCtx.subText,
                        ),
                        onSelected: (_) => setModalState(() => priority = NoticePriority.high),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: const Center(child: Text('Medium')),
                        selected: priority == NoticePriority.medium,
                        selectedColor: const Color(0xFFDCFCE7),
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: priority == NoticePriority.medium
                              ? const Color(0xFF16A34A)
                              : modalCtx.subText,
                        ),
                        onSelected: (_) => setModalState(() => priority = NoticePriority.medium),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Title field
                TextField(
                  controller: titleController,
                  decoration: InputDecoration(
                    labelText: 'Notice Headline',
                    filled: true,
                    fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),

                // Description field
                TextField(
                  controller: descController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Notice Details / Directive',
                    filled: true,
                    fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),

                // Dispatch button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.send_rounded, size: 18),
                    label: Text(
                      'Dispatch Push Broadcast',
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () async {
                      final title = titleController.text.trim();
                      final desc = descController.text.trim();
                      if (title.isEmpty || desc.isEmpty) return;

                      Navigator.pop(modalCtx);

                      final appState = Provider.of<AppStateProvider>(context, listen: false);
                      await appState.sendPushNotificationAlert(
                        title: title,
                        description: desc,
                        category: category,
                        priority: priority,
                      );

                      if (context.mounted) {
                        PushNotificationService.showPushAlertBanner(
                          context,
                          title: title,
                          message: desc,
                          priority: priority,
                          category: category,
                        );

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: const Color(0xFF16A34A),
                            content: Text(
                              'Alert dispatched to backend & pushed to registered devices.',
                              style: GoogleFonts.inter(color: Colors.white),
                            ),
                          ),
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final notices = appState.notices;
    final dateFormat = DateFormat('MMM dd, yyyy');

    // Filter by selected category
    final filteredNotices = _selectedCategory == 'All'
        ? notices
        : notices.where((n) {
            final catLower = n.category.toLowerCase();
            final selLower = _selectedCategory.toLowerCase();
            return catLower.contains(selLower) || selLower.contains(catLower);
          }).toList();

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          tr('notice_board_title'),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Push Test Alert',
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFDC2626).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.campaign_rounded, color: Color(0xFFDC2626), size: 20),
            ),
            onPressed: () => _openPushAlertComposer(context),
          ),
          IconButton(
            tooltip: 'Refresh Notices',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => appState.fetchLiveNotices(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFFDC2626),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_alert_rounded, size: 20),
        label: Text(
          'Push Alert',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
        onPressed: () => _openPushAlertComposer(context),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await appState.fetchLiveNotices();
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Top live status & urgent stats summary header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status banner
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: context.cardBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: appState.isBackendConnected
                                  ? const Color(0xFF22C55E)
                                  : const Color(0xFFF59E0B),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              appState.isBackendConnected
                                  ? 'Connected to Agrarian Services Gateway (Live Sync)'
                                  : 'Operating on Local Agrarian Intelligence Baseline',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: context.titleText,
                              ),
                            ),
                          ),
                          if (appState.isLoadingNotices)
                            const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Filter chips
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _categories.map((category) {
                          final isSelected = _selectedCategory == category;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(category),
                              selected: isSelected,
                              showCheckmark: false,
                              selectedColor: isDark
                                  ? const Color(0xFF14532D)
                                  : AppColors.primarySoft,
                              backgroundColor: context.cardBg,
                              side: BorderSide(
                                color: isSelected
                                    ? (isDark ? const Color(0xFF22C55E) : AppColors.primary)
                                    : context.cardBorder,
                              ),
                              labelStyle: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                color: isSelected
                                    ? (isDark ? const Color(0xFF4ADE80) : AppColors.primary)
                                    : context.subText,
                              ),
                              onSelected: (_) {
                                setState(() {
                                  _selectedCategory = category;
                                });
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Notice Cards List
            if (filteredNotices.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inbox_outlined, size: 48, color: context.mutedText),
                      const SizedBox(height: 12),
                      Text(
                        'No notices in $_selectedCategory category',
                        style: GoogleFonts.inter(fontSize: 14, color: context.subText),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final n = filteredNotices[i];

                      Color priorityColor = isDark ? const Color(0xFF4ADE80) : AppColors.primary;
                      Color priorityBg = isDark ? const Color(0xFF143E23) : AppColors.primarySoft;
                      String priorityLabel = tr('general_priority');

                      if (n.priority == NoticePriority.urgent) {
                        priorityColor = isDark ? const Color(0xFFFCA5A5) : AppColors.riskCritical;
                        priorityBg = isDark ? const Color(0xFF450A0A) : AppColors.riskCriticalBg;
                        priorityLabel = tr('urgent_directive');
                      } else if (n.priority == NoticePriority.high) {
                        priorityColor = isDark ? const Color(0xFFFCD34D) : AppColors.riskModerate;
                        priorityBg = isDark ? const Color(0xFF451A03) : AppColors.riskModerateBg;
                        priorityLabel = tr('high_priority');
                      }

                      return GestureDetector(
                        onTap: () => _showNoticeDetailDialog(context, n),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: context.cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: priorityColor.withValues(alpha: 0.3),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isDark
                                    ? Colors.black.withValues(alpha: 0.2)
                                    : Colors.black.withValues(alpha: 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: priorityBg,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      priorityLabel,
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: priorityColor,
                                      ),
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.verified,
                                        size: 14,
                                        color: isDark
                                            ? const Color(0xFF4ADE80)
                                            : AppColors.primary,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        tr('official_badge'),
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: isDark
                                              ? const Color(0xFF4ADE80)
                                              : AppColors.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                n.title,
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: context.titleText,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                n.description,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: context.subText,
                                  height: 1.4,
                                ),
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 12),
                              Divider(color: context.dividerColor),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Issued by: ${n.issuedBy}',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontStyle: FontStyle.italic,
                                        color: context.mutedText,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    dateFormat.format(n.date),
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: context.mutedText,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    childCount: filteredNotices.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
