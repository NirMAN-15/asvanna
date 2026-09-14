import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';

class DirectChatScreen extends StatefulWidget {
  final String farmerName;
  final String cropName;
  final double requestedQuantityKg;
  final double totalCostLkr;

  const DirectChatScreen({
    super.key,
    required this.farmerName,
    required this.cropName,
    required this.requestedQuantityKg,
    required this.totalCostLkr,
  });

  @override
  State<DirectChatScreen> createState() => _DirectChatScreenState();
}

class _DirectChatScreenState extends State<DirectChatScreen> {
  final _messageController = TextEditingController();
  late List<Map<String, dynamic>> _messages;

  @override
  void initState() {
    super.initState();
    _messages = [
      {
        'isMe': true,
        'text': 'Hello ${widget.farmerName}, I am interested in purchasing ${widget.requestedQuantityKg.toStringAsFixed(0)} Kg of ${widget.cropName} for my catering function tomorrow morning. Total: Rs. ${widget.totalCostLkr.toStringAsFixed(0)}.',
        'time': 'Just now',
      },
      {
        'isMe': false,
        'text': 'Ayubowan! Yes, the ${widget.cropName} lot is packed in crates and ready for pickup at our farm in Heeloya. What time will your transport arrive?',
        'time': 'Just now',
      },
    ];
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _send() {
    if (_messageController.text.trim().isNotEmpty) {
      setState(() {
        _messages.add({
          'isMe': true,
          'text': _messageController.text.trim(),
          'time': 'Just now',
        });
      });
      _messageController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.farmerName,
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            Text(
              '${widget.cropName} Surplus Purchase (${widget.requestedQuantityKg.toStringAsFixed(0)} Kg)',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone, color: AppColors.accent),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Connecting phone call to ${widget.farmerName}...')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Order summary mini header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppColors.accent.withOpacity(0.08),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Order: ${widget.requestedQuantityKg.toStringAsFixed(0)} Kg ${widget.cropName}',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                ),
                Text(
                  'Total: Rs. ${widget.totalCostLkr.toStringAsFixed(0)}',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accent),
                ),
              ],
            ),
          ),

          // Messages
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
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
                      color: isMe ? AppColors.accent : Colors.white,
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomLeft: !isMe ? const Radius.circular(0) : const Radius.circular(16),
                        bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(16),
                      ),
                      border: !isMe ? Border.all(color: const Color(0xFFE2ECE2)) : null,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
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
                            fontSize: 13,
                            color: isMe ? Colors.white : AppColors.textPrimary,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          msg['time'] as String,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: isMe ? Colors.white70 : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Chat Input
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Coordinate pickup time & details...',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF2F5F2),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppColors.accent,
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
