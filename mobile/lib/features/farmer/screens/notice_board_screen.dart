import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/models/notice_model.dart';

class NoticeBoardScreen extends StatelessWidget {
  const NoticeBoardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final notices = appState.notices;
    final dateFormat = DateFormat('MMM dd, yyyy');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agrarian Notice Board'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notices.length,
        itemBuilder: (context, i) {
          final n = notices[i];

          Color priorityColor = AppColors.primary;
          Color priorityBg = AppColors.primarySoft;
          String priorityLabel = 'GENERAL';

          if (n.priority == NoticePriority.urgent) {
            priorityColor = AppColors.riskCritical;
            priorityBg = AppColors.riskCriticalBg;
            priorityLabel = 'URGENT DIRECTIVE';
          } else if (n.priority == NoticePriority.high) {
            priorityColor = AppColors.riskModerate;
            priorityBg = AppColors.riskModerateBg;
            priorityLabel = 'HIGH PRIORITY';
          }

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: priorityColor.withOpacity(0.3), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
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
                        const Icon(Icons.verified, size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          'Official',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
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
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),

                Text(
                  n.description,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(color: Color(0xFFEFF4EF)),
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
                          color: AppColors.textMuted,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      dateFormat.format(n.date),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textMuted,
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
