import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';

class DirectChatScreen extends StatefulWidget {
  final String? farmerName;
  final String? cropName;
  final double? requestedQuantityKg;
  final double? totalCostLkr;
  final String? farmerPhone;
  final String? farmerAvatar;
  final bool showAppBarBack;

  const DirectChatScreen({
    super.key,
    this.farmerName,
    this.cropName,
    this.requestedQuantityKg,
    this.totalCostLkr,
    this.farmerPhone,
    this.farmerAvatar,
    this.showAppBarBack = true,
  });

  @override
  State<DirectChatScreen> createState() => _DirectChatScreenState();
}

class _DirectChatScreenState extends State<DirectChatScreen> {
  final _messageController = TextEditingController();
  late String _activeFarmer;
  late String _activeCrop;
  late double _activeQty;
  late double _activeCost;
  late String _activePhone;
  late List<Map<String, dynamic>> _messages;

  @override
  void initState() {
    super.initState();
    _activeFarmer = widget.farmerName ?? 'Sunil Bandara';
    _activeCrop = widget.cropName ?? 'Leeks';
    _activeQty = widget.requestedQuantityKg ?? 50.0;
    _activeCost = widget.totalCostLkr ?? 6500.0;
    _activePhone = widget.farmerPhone ?? '+94 71 456 7890';

    if (_activeFarmer.contains('Sunil')) {
      _messages = [
        {
          'isMe': true,
          'text': 'Hello Sunil Bandara, I am interested in purchasing ${_activeQty.toStringAsFixed(0)} Kg of $_activeCrop for my shop/kitchen tomorrow morning. Total: Rs. ${_activeCost.toStringAsFixed(0)}.',
          'time': '10:30 AM',
        },
        {
          'isMe': false,
          'text': 'Ayubowan! Yes, the $_activeCrop lot is packed in crates and ready for pickup at our farm. What time will your vehicle arrive?',
          'time': '10:34 AM',
        },
        {
          'isMe': true,
          'text': 'Our driver will arrive around 11:30 AM with 5 empty crates. Please keep the pickup voucher ready.',
          'time': '10:38 AM',
        },
      ];
    } else if (_activeFarmer.contains('Nirman')) {
      _messages = [
        {
          'isMe': true,
          'text': 'Hello Nirman, are the 20 Kg Tomatoes still available for pickup today?',
          'time': 'Yesterday, 3:15 PM',
        },
        {
          'isMe': false,
          'text': 'Ayubowan! Ready at the farmgate. Total is Rs. 3,600 on voucher.',
          'time': 'Yesterday, 3:20 PM',
        },
      ];
    } else if (_activeFarmer.contains('Kamal')) {
      _messages = [
        {
          'isMe': true,
          'text': 'Hi Kamal, coordinating pickup for 100 Kg of Cabbage tomorrow morning.',
          'time': 'Oct 26, 9:00 AM',
        },
        {
          'isMe': false,
          'text': 'Lot is harvested fresh and packed. Total Rs. 9,000. Ready by 10 AM.',
          'time': 'Oct 26, 9:15 AM',
        },
      ];
    } else if (_activeFarmer.contains('Saman')) {
      _messages = [
        {
          'isMe': true,
          'text': 'Hi Saman, inquiring about the 40 Kg Carrots lot.',
          'time': 'Oct 24, 2:00 PM',
        },
        {
          'isMe': false,
          'text': 'Carrots graded and bagged in 10kg crates. Ready whenever you are.',
          'time': 'Oct 24, 2:10 PM',
        },
      ];
    } else {
      _messages = [
        {
          'isMe': true,
          'text': 'Hello $_activeFarmer, I am coordinating pickup for ${_activeQty.toStringAsFixed(0)} Kg of $_activeCrop. Total: Rs. ${_activeCost.toStringAsFixed(0)}.',
          'time': 'Today',
        },
        {
          'isMe': false,
          'text': 'Ayubowan! Ready at the farmgate. Total is Rs. ${_activeCost.toStringAsFixed(0)} on voucher.',
          'time': 'Today',
        },
      ];
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _send() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _messages.add({
          'isMe': true,
          'text': text,
          'time': 'Just now',
        });
      });
      _messageController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: widget.showAppBarBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                onPressed: () => Navigator.of(context).pop(),
              )
            : null,
        titleSpacing: widget.showAppBarBack ? 0 : 16,
        title: Row(
          children: [
            if (widget.farmerAvatar != null) ...[
              CircleAvatar(
                radius: 18,
                backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE8F5E9),
                child: Text(widget.farmerAvatar!, style: const TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 10),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _activeFarmer,
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '$_activeCrop Surplus Pickup (${_activeQty.toStringAsFixed(0)} Kg)',
                    style: GoogleFonts.inter(fontSize: 11, color: context.subText),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone, color: AppColors.asvannaButtonGreen),
            tooltip: 'Call Farmer',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Calling farmer $_activeFarmer ($_activePhone)...'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Order summary banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: isDark ? const Color(0xFF132B20) : const Color(0xFFE8F5E9),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.receipt_long_rounded, size: 16, color: Color(0xFF15803D)),
                    const SizedBox(width: 6),
                    Text(
                      'Batch: ${_activeQty.toStringAsFixed(0)} Kg $_activeCrop',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF15803D)),
                    ),
                  ],
                ),
                Text(
                  'Total: Rs. ${_activeCost.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF15803D)),
                ),
              ],
            ),
          ),

          // Message bubbles
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final msg = _messages[i];
                final isMe = msg['isMe'] as bool;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.78,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isMe
                          ? (isDark ? const Color(0xFF16A34A) : AppColors.asvannaButtonGreen)
                          : context.cardBg,
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomLeft: !isMe ? const Radius.circular(0) : const Radius.circular(16),
                        bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(16),
                      ),
                      border: !isMe ? Border.all(color: context.cardBorder) : null,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['text'] as String,
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            color: isMe ? Colors.white : context.titleText,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time'] as String,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: isMe ? Colors.white70 : context.subText,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: context.cardBg,
              border: Border(top: BorderSide(color: context.cardBorder)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      style: GoogleFonts.inter(fontSize: 14, color: context.titleText),
                      decoration: InputDecoration(
                        hintText: 'Coordinate pickup time & details...',
                        hintStyle: GoogleFonts.inter(fontSize: 13, color: context.subText),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppColors.asvannaButtonGreen,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: _send,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
