class BuyerProfile {
  final String id;
  final String businessName;
  final String ownerName;
  final String phone;
  final String category; // 'Event Catering', 'Hotel / Restaurant', 'Wholesale Bulk Buyer', 'Retail Shop'
  final String locationAddress;
  final double latitude;
  final double longitude;
  final double weeklyPurchaseCapacityKg;
  final DateTime? joinedDate;

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
    this.joinedDate,
  });

  BuyerProfile copyWith({
    String? id,
    String? businessName,
    String? ownerName,
    String? phone,
    String? category,
    String? locationAddress,
    double? latitude,
    double? longitude,
    double? weeklyPurchaseCapacityKg,
    DateTime? joinedDate,
  }) {
    return BuyerProfile(
      id: id ?? this.id,
      businessName: businessName ?? this.businessName,
      ownerName: ownerName ?? this.ownerName,
      phone: phone ?? this.phone,
      category: category ?? this.category,
      locationAddress: locationAddress ?? this.locationAddress,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      weeklyPurchaseCapacityKg: weeklyPurchaseCapacityKg ?? this.weeklyPurchaseCapacityKg,
      joinedDate: joinedDate ?? this.joinedDate,
    );
  }
}
