import 'package:flutter/material.dart';

enum OrderStatus { pending, accepted, rejected, completed }

class BuyerOrder {
  final String id;
  final String listingId;
  final String buyerName;
  final String buyerPhone;
  final String buyerBusiness;
  final String cropName;
  final String cropEmoji;
  final double quantityKg;
  final double pricePerKg;
  final DateTime orderedAt;
  OrderStatus status;
  final String notes;
  final String farmerName;
  final String farmerPhone;
  final String farmLocation;
  final String variety;

  BuyerOrder({
    required this.id,
    required this.listingId,
    required this.buyerName,
    required this.buyerPhone,
    required this.buyerBusiness,
    required this.cropName,
    required this.cropEmoji,
    required this.quantityKg,
    required this.pricePerKg,
    required this.orderedAt,
    this.status = OrderStatus.pending,
    this.notes = '',
    this.farmerName = 'Nirman Senanayake',
    this.farmerPhone = '+94 77 123 4567',
    this.farmLocation = 'Heeloya Valley, Bandarawela',
    this.variety = 'Local Variety',
  });

  double get totalAmount => quantityKg * pricePerKg;

  String get displayStatus {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.accepted:
        return 'Confirmed';
      case OrderStatus.completed:
        return 'Completed';
      case OrderStatus.rejected:
        return 'Cancelled';
    }
  }

  Color get statusColor {
    switch (status) {
      case OrderStatus.pending:
        return const Color(0xFFF59E0B); // Amber
      case OrderStatus.accepted:
        return const Color(0xFF0284C7); // Blue
      case OrderStatus.completed:
        return const Color(0xFF16A34A); // Green
      case OrderStatus.rejected:
        return const Color(0xFFDC2626); // Red
    }
  }

  Color get statusBgColor {
    switch (status) {
      case OrderStatus.pending:
        return const Color(0xFFFEF3C7);
      case OrderStatus.accepted:
        return const Color(0xFFE0F2FE);
      case OrderStatus.completed:
        return const Color(0xFFDCFCE7);
      case OrderStatus.rejected:
        return const Color(0xFFFEE2E2);
    }
  }
}
