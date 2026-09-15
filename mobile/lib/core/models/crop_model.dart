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
    final code = json['crop_code']?.toString() ?? json['code']?.toString() ?? '';
    final rawId = json['id']?.toString() ?? code.toLowerCase();
    final normalizedId = rawId.startsWith('crop_') ? rawId : (code.isNotEmpty ? 'crop_${code.toLowerCase()}' : rawId);

    final name = json['name_en'] ?? json['nameEn'] ?? json['name'] ?? 'Crop';
    final sinhala = json['name_si'] ?? json['nameSi'] ?? json['sinhalaName'] ?? name;
    
    // Auto map emoji
    final lower = (code.isNotEmpty ? code : name).toLowerCase();
    String emoji = json['iconEmoji'] ?? '🌱';
    if (emoji == '🌱') {
      if (lower.contains('leek')) emoji = '🥬';
      else if (lower.contains('cabbage')) emoji = '🥗';
      else if (lower.contains('carrot')) emoji = '🥕';
      else if (lower.contains('beet')) emoji = '🟣';
      else if (lower.contains('potato')) emoji = '🥔';
      else if (lower.contains('bean')) emoji = '🫘';
      else if (lower.contains('tomato')) emoji = '🍅';
      else if (lower.contains('capsicum') || lower.contains('pepper') || lower.contains('bell')) emoji = '🫑';
      else if (lower.contains('radish')) emoji = '🥢';
      else if (lower.contains('knol')) emoji = '🥦';
      else if (lower.contains('onion') || lower.contains('spring')) emoji = '🧅';
      else if (lower.contains('lettuce')) emoji = '🥬';
      else if (lower.contains('celery')) emoji = '🌿';
      else if (lower.contains('broccoli') || lower.contains('cauliflower')) emoji = '🥦';
      else if (lower.contains('pumpkin')) emoji = '🎃';
      else if (lower.contains('gourd') || lower.contains('cucumber')) emoji = '🥒';
      else if (lower.contains('chili')) emoji = '🌶️';
    }

    final price = (json['standard_price_per_kg'] as num?)?.toDouble() ??
        (json['currentMarketPricePerKg'] as num?)?.toDouble() ??
        (json['current_price_per_kg'] as num?)?.toDouble() ?? 150.0;

    final histPrice = (json['historicalAveragePricePerKg'] as num?)?.toDouble() ??
        (json['price_range_min'] as num?)?.toDouble() ?? price * 0.9;

    final yieldKg = (json['avg_yield_per_acre_kg'] as num?)?.toDouble() ??
        (json['expectedYieldKgPerAcre'] as num?)?.toDouble() ?? 5000.0;

    final maturity = (json['growth_duration_days'] as num?)?.toInt() ??
        (json['maturityDays'] as num?)?.toInt() ?? 90;

    return Crop(
      id: normalizedId,
      name: name,
      sinhalaName: sinhala,
      category: json['category'] ?? 'Upcountry Vegetable',
      maturityDays: maturity,
      expectedYieldKgPerAcre: yieldKg,
      currentMarketPricePerKg: price,
      historicalAveragePricePerKg: histPrice,
      iconEmoji: emoji,
      imageUrl: json['image_url'] ?? json['imageUrl'] ?? '',
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
