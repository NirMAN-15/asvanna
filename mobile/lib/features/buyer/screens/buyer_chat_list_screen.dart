import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import '../../../core/widgets/language_selection_dialog.dart';
import 'direct_chat_screen.dart';

class ChatConversationItem {
  final String id;
  final String farmerName;
  final String farmerPhone;
  final String location;
  final String crop;
  final String avatar;
  final double qty;
  final double cost;
  final String lastMessage;
  final String lastMessageTime;
  final int unreadCount;
  final bool isOnline;

  const ChatConversationItem({
    required this.id,
    required this.farmerName,
    required this.farmerPhone,
    required this.location,
    required this.crop,
    required this.avatar,
    required this.qty,
    required this.cost,
    required this.lastMessage,
    required this.lastMessageTime,
    this.unreadCount = 0,
    this.isOnline = false,
  });
}

class BuyerChatListScreen extends StatefulWidget {
  final void Function(int tabIndex)? onTabSelected;

  const BuyerChatListScreen({super.key, this.onTabSelected});

  @override
  State<BuyerChatListScreen> createState() => _BuyerChatListScreenState();
}

class _BuyerChatListScreenState extends State<BuyerChatListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  int _selectedFilterIndex = 0; // 0: All, 1: Unread, 2: Active Orders

  final List<ChatConversationItem> _conversations = [
    const ChatConversationItem(
      id: 'conv_1',
      farmerName: 'Sunil Bandara',
      farmerPhone: '+94 71 456 7890',
      location: 'Kinigama, Bandarawela',
      crop: 'Leeks',
      avatar: '🥬',
      qty: 50.0,
      cost: 6500.0,
      lastMessage: 'Our driver will arrive around 11:30 AM with 5 empty crates. Please keep the pickup voucher ready.',
      lastMessageTime: '10:38 AM',
      unreadCount: 1,
      isOnline: true,
    ),
    const ChatConversationItem(
      id: 'conv_2',
      farmerName: 'Nirman S.',
      farmerPhone: '+94 77 123 4567',
      location: 'Heeloya, Bandarawela',
      crop: 'Tomatoes',
      avatar: '🍅',
      qty: 20.0,
      cost: 3600.0,
      lastMessage: 'Ayubowan! Ready at the farmgate. Total is Rs. 3,600 on voucher.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
    ),
    const ChatConversationItem(
      id: 'conv_3',
      farmerName: 'Kamal Jayawardena',
      farmerPhone: '+94 76 987 6543',
      location: 'Diyatalawa',
      crop: 'Cabbage',
      avatar: '🥗',
      qty: 100.0,
      cost: 9000.0,
      lastMessage: 'Lot is harvested fresh and packed. Total Rs. 9,000.',
      lastMessageTime: 'Oct 26',
      unreadCount: 0,
      isOnline: true,
    ),
    const ChatConversationItem(
      id: 'conv_4',
      farmerName: 'Saman K.',
      farmerPhone: '+94 71 889 2233',
      location: 'Welimada',
      crop: 'Carrots',
      avatar: '🥕',
      qty: 40.0,
      cost: 4800.0,
      lastMessage: 'Carrots graded and bagged in 10kg crates. Ready whenever you are.',
      lastMessageTime: 'Oct 24',
      unreadCount: 0,
      isOnline: false,
    ),
    const ChatConversationItem(
      id: 'conv_5',
      farmerName: 'Priyantha Alwis',
      farmerPhone: '+94 70 554 4321',
      location: 'Bandarawela',
      crop: 'Beetroot',
      avatar: '🍠',
      qty: 30.0,
      cost: 4200.0,
      lastMessage: 'Pickup voucher received. Thank you!',
      lastMessageTime: 'Oct 22',
      unreadCount: 0,
      isOnline: false,
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openChat(ChatConversationItem conv) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DirectChatScreen(
          farmerName: conv.farmerName,
          cropName: conv.crop,
          requestedQuantityKg: conv.qty,
          totalCostLkr: conv.cost,
          farmerPhone: conv.farmerPhone,
          farmerAvatar: conv.avatar,
          showAppBarBack: true,
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context, AppStateProvider appState) {
    showLanguageSelectionDialog(context, appState);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    final appState = Provider.of<AppStateProvider>(context);
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final filtered = _conversations.where((conv) {
      if (_selectedFilterIndex == 1 && conv.unreadCount == 0) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchName = conv.farmerName.toLowerCase().contains(q);
        final matchCrop = conv.crop.toLowerCase().contains(q);
        final matchMsg = conv.lastMessage.toLowerCase().contains(q);
        return matchName || matchCrop || matchMsg;
      }
      return true;
    }).toList();

    final totalUnread = _conversations.fold<int>(0, (sum, c) => sum + c.unreadCount);

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Text(
              tr('nav_chat'),
              style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            if (totalUnread > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.asvannaButtonGreen,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$totalUnread new',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language_rounded),
            tooltip: 'Change Language',
            onPressed: () => _showLanguageDialog(context, appState),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                setState(() {
                  _searchQuery = val.trim();
                });
              },
              style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
              decoration: InputDecoration(
                hintText: lang == AppLanguage.sinhala
                    ? 'ගොවියා හෝ බෝගය සොයන්න...'
                    : lang == AppLanguage.tamil
                        ? 'விவசாயி அல்லது பயிரைத் தேடுங்கள்...'
                        : 'Search farmer, crop, or message...',
                hintStyle: GoogleFonts.inter(fontSize: 13, color: context.subText),
                prefixIcon: Icon(Icons.search_rounded, color: context.subText, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Filter chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildFilterChip(0, 'All Chats (${_conversations.length})', isDark),
                const SizedBox(width: 8),
                _buildFilterChip(1, 'Unread ($totalUnread)', isDark),
              ],
            ),
          ),
          const SizedBox(height: 4),

          // Conversation List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 56,
                          color: context.subText.withValues(alpha: 0.5),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          lang == AppLanguage.sinhala
                              ? 'සංවාද හමු නොවීය'
                              : lang == AppLanguage.tamil
                                  ? 'உரையாடல்கள் எதுவும் கிடைக்கவில்லை'
                                  : 'No conversations found',
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: context.titleText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          lang == AppLanguage.sinhala
                              ? 'වෙනත් නමක් හෝ බෝගයක් සොයන්න'
                              : 'Try searching with a different name or crop',
                          style: GoogleFonts.inter(fontSize: 12, color: context.subText),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final conv = filtered[index];
                      return _buildConversationCard(conv, isDark, context);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(int index, String label, bool isDark) {
    final isSelected = _selectedFilterIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilterIndex = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? const Color(0xFF16A34A) : AppColors.asvannaButtonGreen)
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : (isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569)),
          ),
        ),
      ),
    );
  }

  Widget _buildConversationCard(ChatConversationItem conv, bool isDark, BuildContext context) {
    final hasUnread = conv.unreadCount > 0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openChat(conv),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: context.cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: hasUnread
                  ? (isDark ? const Color(0xFF16A34A).withValues(alpha: 0.5) : const Color(0xFF86EFAC))
                  : context.cardBorder,
              width: hasUnread ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar with Online Badge
              Stack(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE8F5E9),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFC8E6C9),
                        width: 1.5,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      conv.avatar,
                      style: const TextStyle(fontSize: 24),
                    ),
                  ),
                  if (conv.isOnline)
                    Positioned(
                      right: 1,
                      bottom: 1,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: const Color(0xFF22C55E),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isDark ? const Color(0xFF0F172A) : Colors.white,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),

              // Conversation Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Farmer Name and Time
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            conv.farmerName,
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: hasUnread ? FontWeight.bold : FontWeight.w600,
                              color: context.titleText,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          conv.lastMessageTime,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: hasUnread ? FontWeight.bold : FontWeight.w500,
                            color: hasUnread
                                ? (isDark ? const Color(0xFF4ADE80) : AppColors.asvannaButtonGreen)
                                : context.subText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),

                    // Crop batch info chip
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF132B20) : const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${conv.crop} • ${conv.qty.toStringAsFixed(0)} Kg',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF15803D),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Rs. ${conv.cost.toStringAsFixed(0)}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: context.subText,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    // Last message preview & unread badge
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            conv.lastMessage,
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              fontWeight: hasUnread ? FontWeight.w600 : FontWeight.w400,
                              color: hasUnread ? context.titleText : context.subText,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (hasUnread) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: const BoxDecoration(
                              color: AppColors.asvannaButtonGreen,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '${conv.unreadCount}',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
