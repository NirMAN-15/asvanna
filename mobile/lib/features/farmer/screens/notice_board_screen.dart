import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/notice_model.dart';
import '../../../core/localization/app_translations.dart';

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
                      Icon(
                        Icons.verified,
                        size: 13,
                        color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
                      ),
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
            tooltip: 'Refresh Notices',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => appState.fetchLiveNotices(),
          ),
        ],
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
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
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
                                      'Issued by: ${noticeDepartmentSignature(n)}',
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

  String noticeDepartmentSignature(AgrarianNotice n) {
    if (n.issuedBy.isNotEmpty) return n.issuedBy;
    return n.department;
  }
}
