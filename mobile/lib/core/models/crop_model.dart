enum CropRiskLevel { safe, moderate, critical }

class Crop {
  final String id;
  final String name;
  final String sinhalaName;
  final String category;
  final int maturityDays;
  final double expectedYieldKgPerAcre;
  final double currentMarketPricePerKg;
  final double historicalAveragePricePerKg;
  final String iconEmoji;
  final String imageUrl;

  const Crop({
    required this.id,
    required this.name,
    required this.sinhalaName,
    required this.category,
    required this.maturityDays,
    required this.expectedYieldKgPerAcre,
    required this.currentMarketPricePerKg,
    required this.historicalAveragePricePerKg,
    required this.iconEmoji,
    this.imageUrl = '',
  });

  factory Crop.fromJson(Map<String, dynamic> json) {
    return Crop(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      sinhalaName: json['sinhalaName'] ?? '',
      category: json['category'] ?? 'Vegetable',
      maturityDays: json['maturityDays'] ?? 90,
      expectedYieldKgPerAcre: (json['expectedYieldKgPerAcre'] as num?)?.toDouble() ?? 5000.0,
      currentMarketPricePerKg: (json['currentMarketPricePerKg'] as num?)?.toDouble() ?? 150.0,
      historicalAveragePricePerKg: (json['historicalAveragePricePerKg'] as num?)?.toDouble() ?? 140.0,
      iconEmoji: json['iconEmoji'] ?? '🌱',
      imageUrl: json['imageUrl'] ?? '',
    );
  }
}

class PlantedCropEntry {
  final String id;
  final String cropId;
  final String cropName;
  final String cropEmoji;
  final double allocatedAcres;
  final DateTime plantingDate;
  final DateTime expectedHarvestDate;
  final double projectedYieldKg;
  final String status; // 'growing', 'harvest_ready', 'harvested'
  final String agrarianDivision;

  PlantedCropEntry({
    required this.id,
    required this.cropId,
    required this.cropName,
    required this.cropEmoji,
    required this.allocatedAcres,
    required this.plantingDate,
    required this.expectedHarvestDate,
    required this.projectedYieldKg,
    this.status = 'growing',
    this.agrarianDivision = 'Bandarawela',
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'crop_id': cropId,
      'crop_name': cropName,
      'crop_emoji': cropEmoji,
      'allocated_acres': allocatedAcres,
      'planting_date': plantingDate.toIso8601String(),
      'expected_harvest_date': expectedHarvestDate.toIso8601String(),
      'projected_yield_kg': projectedYieldKg,
      'status': status,
      'agrarian_division': agrarianDivision,
    };
  }

  int get daysRemaining {
    final now = DateTime.now();
    return expectedHarvestDate.difference(now).inDays;
  }

  double get growthProgress {
    final totalDays = expectedHarvestDate.difference(plantingDate).inDays;
    if (totalDays <= 0) return 1.0;
    final elapsedDays = DateTime.now().difference(plantingDate).inDays;
    return (elapsedDays / totalDays).clamp(0.0, 1.0);
  }
}
