class SurplusListing {
  final String id;
  final String farmerId;
  final String farmerName;
  final String farmerPhone;
  final String cropName;
  final String cropEmoji;
  final double availableQuantityKg;
  final double askingPricePerKgLkr;
  final double regularMarketPricePerKgLkr;
  final DateTime harvestedDate;
  final String farmLocation;
  final double distanceKm;
  final bool isUrgent; // urgent perishable clearance
  final String qualityGrade; // 'Grade A Export', 'Grade A Local', 'Grade B'
  final String notes;
  final String imageUrl;
  final String variety;
  final String category; // 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Other'

  SurplusListing({
    required this.id,
    required this.farmerId,
    required this.farmerName,
    required this.farmerPhone,
    required this.cropName,
    required this.cropEmoji,
    required this.availableQuantityKg,
    required this.askingPricePerKgLkr,
    required this.regularMarketPricePerKgLkr,
    required this.harvestedDate,
    required this.farmLocation,
    required this.distanceKm,
    this.isUrgent = false,
    this.qualityGrade = 'Grade A Local',
    this.notes = '',
    this.imageUrl = '',
    this.variety = 'Local Variety',
    this.category = 'Vegetables',
  });

  double get discountPercentage {
    if (regularMarketPricePerKgLkr <= 0) return 0.0;
    final diff = regularMarketPricePerKgLkr - askingPricePerKgLkr;
    if (diff <= 0) return 0.0;
    return (diff / regularMarketPricePerKgLkr) * 100;
  }

  String get freshnessBadge {
    final diffHours = DateTime.now().difference(harvestedDate).inHours;
    if (diffHours <= 12) return 'Harvested today';
    if (diffHours <= 24) return '1 day old';
    if (diffHours <= 48) return '2 days old';
    return '3+ days old';
  }
}
