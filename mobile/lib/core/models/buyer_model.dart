class BuyerProfile {
  final String id;
  final String businessName;
  final String ownerName;
  final String phone;
  final String category; // 'Event Catering', 'Hotel / Restaurant', 'Wholesale Bulk Buyer', 'Supermarket Supplier'
  final String locationAddress;
  final double latitude;
  final double longitude;
  final double weeklyPurchaseCapacityKg;

  BuyerProfile({
    required this.id,
    required this.businessName,
    required this.ownerName,
    required this.phone,
    required this.category,
    required this.locationAddress,
    required this.latitude,
    required this.longitude,
    required this.weeklyPurchaseCapacityKg,
  });
}
