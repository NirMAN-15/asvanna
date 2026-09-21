import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/notice_model.dart';
import '../../../core/localization/app_translations.dart';

class NoticeBoardScreen extends StatelessWidget {
  const NoticeBoardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final notices = appState.notices;
    final dateFormat = DateFormat('MMM dd, yyyy');

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
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notices.length,
        itemBuilder: (context, i) {
          final n = notices[i];

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

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: context.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: priorityColor.withValues(alpha: 0.3), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: isDark ? Colors.black.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.03),
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
                    Row(
                      children: [
                        Icon(Icons.verified, size: 14, color: isDark ? const Color(0xFF4ADE80) : AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          tr('official_badge'),
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFF4ADE80) : AppColors.primary,
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
          );
        },
      ),
    );
  }
}

