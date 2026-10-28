import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../providers/app_state_provider.dart';

/// Shows a modern, multilingual language selection dialog.
/// Supports Sinhala, English, and Tamil with dedicated Noto fonts to prevent tofu/missing glyphs.
void showLanguageSelectionDialog(BuildContext context, AppStateProvider appState) {
  final isDark = context.isDarkMode;

  showDialog(
    context: context,
    builder: (dialogContext) {
      return AlertDialog(
        backgroundColor: context.cardBg,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        title: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF14532D) : const Color(0xFFDCFCE7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.language_rounded,
                color: AppColors.asvannaButtonGreen,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Select Language',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: context.titleText,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: 'භාෂාව තෝරන්න',
                          style: GoogleFonts.notoSansSinhala(
                            fontSize: 11.5,
                            color: context.subText,
                          ),
                        ),
                        TextSpan(
                          text: ' • ',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            color: context.subText,
                          ),
                        ),
                        TextSpan(
                          text: 'மொழியைத் தேர்வுசெய்க',
                          style: GoogleFonts.notoSansTamil(
                            fontSize: 11.5,
                            color: context.subText,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            _buildLanguageOption(
              context: dialogContext,
              appState: appState,
              isDark: isDark,
              language: AppLanguage.sinhala,
              badgeText: 'සිං',
              nativeName: 'සිංහල',
              englishName: 'Sinhala',
              isSinhala: true,
            ),
            const SizedBox(height: 8),
            _buildLanguageOption(
              context: dialogContext,
              appState: appState,
              isDark: isDark,
              language: AppLanguage.english,
              badgeText: 'EN',
              nativeName: 'English',
              englishName: 'English',
              isEnglish: true,
            ),
            const SizedBox(height: 8),
            _buildLanguageOption(
              context: dialogContext,
              appState: appState,
              isDark: isDark,
              language: AppLanguage.tamil,
              badgeText: 'த',
              nativeName: 'தமிழ்',
              englishName: 'Tamil',
              isTamil: true,
            ),
          ],
        ),
      );
    },
  );
}

Widget _buildLanguageOption({
  required BuildContext context,
  required AppStateProvider appState,
  required bool isDark,
  required AppLanguage language,
  required String badgeText,
  required String nativeName,
  required String englishName,
  bool isSinhala = false,
  bool isEnglish = false,
  bool isTamil = false,
}) {
  final isSelected = appState.currentLanguage == language;

  TextStyle titleStyle;
  if (isSinhala) {
    titleStyle = GoogleFonts.notoSansSinhala(
      fontSize: 15,
      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
          : context.titleText,
    );
  } else if (isTamil) {
    titleStyle = GoogleFonts.notoSansTamil(
      fontSize: 15,
      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
          : context.titleText,
    );
  } else {
    titleStyle = GoogleFonts.inter(
      fontSize: 15,
      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
          : context.titleText,
    );
  }

  TextStyle badgeStyle;
  if (isSinhala) {
    badgeStyle = GoogleFonts.notoSansSinhala(
      fontSize: 13,
      fontWeight: FontWeight.bold,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D))
          : context.subText,
    );
  } else if (isTamil) {
    badgeStyle = GoogleFonts.notoSansTamil(
      fontSize: 14,
      fontWeight: FontWeight.bold,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D))
          : context.subText,
    );
  } else {
    badgeStyle = GoogleFonts.inter(
      fontSize: 13,
      fontWeight: FontWeight.bold,
      color: isSelected
          ? (isDark ? const Color(0xFF4ADE80) : const Color(0xFF15803D))
          : context.subText,
    );
  }

  return Material(
    color: isSelected
        ? (isDark
            ? const Color(0xFF16A34A).withValues(alpha: 0.15)
            : const Color(0xFFF0FDF4))
        : (isDark ? const Color(0xFF1E293B).withValues(alpha: 0.5) : const Color(0xFFF8FAFC)),
    borderRadius: BorderRadius.circular(16),
    child: InkWell(
      onTap: () {
        appState.setLanguage(language);
        Navigator.pop(context);
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            // Styled Language Badge Container
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isSelected
                    ? (isDark ? const Color(0xFF14532D) : const Color(0xFFDCFCE7))
                    : (isDark ? const Color(0xFF0F172A) : Colors.white),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected
                      ? (isDark ? const Color(0xFF22C55E) : const Color(0xFF86EFAC))
                      : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  width: 1,
                ),
              ),
              alignment: Alignment.center,
              child: Text(badgeText, style: badgeStyle),
            ),
            const SizedBox(width: 12),

            // Language Titles
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(nativeName, style: titleStyle),
                  if (nativeName != englishName)
                    Text(
                      englishName,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: context.subText,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
            ),

            // Selection indicator
            if (isSelected)
              Container(
                width: 26,
                height: 26,
                decoration: const BoxDecoration(
                  color: AppColors.asvannaButtonGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  size: 16,
                  color: Colors.white,
                ),
              )
            else
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                    width: 1.5,
                  ),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}
