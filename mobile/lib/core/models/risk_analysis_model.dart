import 'crop_model.dart';

class RiskFactorBreakdown {
  final int overPlantingScore;
  final String overPlantingWeight;
  final int overPlantingRatio;
  final double demandQuotaKg;
  final double currentPlantedKg;

  final int weatherScore;
  final String weatherWeight;
  final double temperatureScore;
  final double rainfallScore;
  final String weatherAdvisory;

  final int seasonalScore;
  final String seasonalWeight;
  final String currentSeason;
  final String seasonStatus;

  final int priceScore;
  final String priceWeight;
  final double volatilityPercentage;
  final double currentPrice;

  const RiskFactorBreakdown({
    this.overPlantingScore = 0,
    this.overPlantingWeight = '45%',
    this.overPlantingRatio = 0,
    this.demandQuotaKg = 0,
    this.currentPlantedKg = 0,
    this.weatherScore = 0,
    this.weatherWeight = '25%',
    this.temperatureScore = 0,
    this.rainfallScore = 0,
    this.weatherAdvisory = '',
    this.seasonalScore = 0,
    this.seasonalWeight = '15%',
    this.currentSeason = 'MAHA',
    this.seasonStatus = 'IN_SEASON',
    this.priceScore = 0,
    this.priceWeight = '15%',
    this.volatilityPercentage = 0,
    this.currentPrice = 0,
  });

  factory RiskFactorBreakdown.fromJson(Map<String, dynamic> json) {
    final op = (json['overPlanting'] as Map<String, dynamic>?) ?? {};
    final we = (json['weather'] as Map<String, dynamic>?) ?? {};
    final se = (json['seasonal'] as Map<String, dynamic>?) ?? {};
    final pr = (json['price'] as Map<String, dynamic>?) ?? {};

    return RiskFactorBreakdown(
      overPlantingScore: (op['score'] as num?)?.toInt() ?? 0,
      overPlantingWeight: op['weight']?.toString() ?? '45%',
      overPlantingRatio: (op['ratio'] as num?)?.toInt() ?? 0,
      demandQuotaKg: (op['demandQuotaKg'] as num?)?.toDouble() ?? 0.0,
      currentPlantedKg: (op['currentPlantedKg'] as num?)?.toDouble() ?? 0.0,
      weatherScore: (we['score'] as num?)?.toInt() ?? 0,
      weatherWeight: we['weight']?.toString() ?? '25%',
      temperatureScore: (we['temperatureScore'] as num?)?.toDouble() ?? 0.0,
      rainfallScore: (we['rainfallScore'] as num?)?.toDouble() ?? 0.0,
      weatherAdvisory: we['advisory']?.toString() ?? '',
      seasonalScore: (se['score'] as num?)?.toInt() ?? 0,
      seasonalWeight: se['weight']?.toString() ?? '15%',
      currentSeason: se['currentSeason']?.toString() ?? 'MAHA',
      seasonStatus: se['status']?.toString() ?? 'IN_SEASON',
      priceScore: (pr['score'] as num?)?.toInt() ?? 0,
      priceWeight: pr['weight']?.toString() ?? '15%',
      volatilityPercentage: (pr['volatilityPercentage'] as num?)?.toDouble() ?? 0.0,
      currentPrice: (pr['currentPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class CropRecommendation {
  final String cropId;
  final String cropName;
  final String emoji;
  final String reason;
  final double profitBoostPercentage;
  final double estimatedRevenuePerAcreLkr;

  const CropRecommendation({
    required this.cropId,
    required this.cropName,
    required this.emoji,
    required this.reason,
    required this.profitBoostPercentage,
    required this.estimatedRevenuePerAcreLkr,
  });

  factory CropRecommendation.fromJson(Map<String, dynamic> json, {String lang = 'en'}) {
    final crop = (json['crop'] as Map<String, dynamic>?) ?? json;
    final scores = (json['scores'] as Map<String, dynamic>?) ?? {};
    final rationale = (json['rationale'] as Map<String, dynamic>?) ?? {};

    final code = crop['code']?.toString() ?? crop['crop_code']?.toString() ?? '';
    final rawId = crop['id']?.toString() ?? code.toLowerCase();
    final normalizedId = rawId.startsWith('crop_') ? rawId : 'crop_${code.toLowerCase()}';

    String name = crop['nameEn'] ?? crop['name_en'] ?? crop['name'] ?? 'Crop';
    if (lang == 'si' && (crop['nameSi'] != null || crop['name_si'] != null)) {
      name = crop['nameSi'] ?? crop['name_si'];
    }

    String reasonText = rationale[lang] ?? rationale['en'] ?? json['reason'] ?? 'High regional demand and optimal weather suitability.';
    
    final marketGapScore = (scores['marketGapScore'] as num?)?.toDouble() ?? 30.0;
    final standardPrice = (crop['standardPricePerKg'] as num?)?.toDouble() ?? (crop['standard_price_per_kg'] as num?)?.toDouble() ?? 250.0;
    final avgYield = (crop['avgYieldPerAcreKg'] as num?)?.toDouble() ?? (crop['avg_yield_per_acre_kg'] as num?)?.toDouble() ?? 6000.0;
    final estRev = (crop['estimatedRevenuePerAcreLkr'] as num?)?.toDouble() ?? (avgYield * standardPrice);

    return CropRecommendation(
      cropId: normalizedId,
      cropName: name,
      emoji: CropRiskAnalysis.getEmojiForCrop(code.isNotEmpty ? code : name),
      reason: reasonText,
      profitBoostPercentage: marketGapScore > 0 ? marketGapScore * 0.6 : 25.0,
      estimatedRevenuePerAcreLkr: estRev,
    );
  }
}

class CropRiskAnalysis {
  final String cropId;
  final String cropName;
  final String cropEmoji;
  final CropRiskLevel riskLevel;
  final double regionalPlantedAcres;
  final double regionalMaxTargetAcres;
  final double saturationPercentage;
  final double currentMarketPriceLkr;
  final double predictedHarvestPriceLkr;
  final double priceDropRiskPercentage;
  final String warningMessage;
  final String agronomicAdvice;
  final List<CropRecommendation> alternativeRecommendations;

  // Live Backend Multi-Factor Breakdown Details
  final int compositeRiskScore;
  final String district;
  final String division;
  final int activePlotsCount;
  final double estimatedSupplyKg;
  final double targetDemandKg;
  final RiskFactorBreakdown? factors;
  final DateTime? evaluatedAt;
  final bool isLiveBackend;

  const CropRiskAnalysis({
    required this.cropId,
    required this.cropName,
    required this.cropEmoji,
    required this.riskLevel,
    required this.regionalPlantedAcres,
    required this.regionalMaxTargetAcres,
    required this.saturationPercentage,
    required this.currentMarketPriceLkr,
    required this.predictedHarvestPriceLkr,
    required this.priceDropRiskPercentage,
    required this.warningMessage,
    required this.agronomicAdvice,
    required this.alternativeRecommendations,
    this.compositeRiskScore = 0,
    this.district = 'Badulla',
    this.division = 'Bandarawela',
    this.activePlotsCount = 0,
    this.estimatedSupplyKg = 0,
    this.targetDemandKg = 0,
    this.factors,
    this.evaluatedAt,
    this.isLiveBackend = false,
  });

  static String getEmojiForCrop(String codeOrName) {
    final lower = codeOrName.toLowerCase();
    if (lower.contains('leek')) return '🥬';
    if (lower.contains('cabbage')) return '🥗';
    if (lower.contains('carrot')) return '🥕';
    if (lower.contains('beet')) return '🟣';
    if (lower.contains('potato')) return '🥔';
    if (lower.contains('bean')) return '🫘';
    if (lower.contains('tomato')) return '🍅';
    if (lower.contains('capsicum') || lower.contains('pepper') || lower.contains('bell')) return '🫑';
    if (lower.contains('radish')) return '🥢';
    if (lower.contains('knol')) return '🥦';
    if (lower.contains('onion') || lower.contains('spring')) return '🧅';
    if (lower.contains('lettuce')) return '🥬';
    if (lower.contains('celery')) return '🌿';
    if (lower.contains('broccoli')) return '🥦';
    if (lower.contains('cauliflower')) return '🥦';
    if (lower.contains('pumpkin')) return '🎃';
    if (lower.contains('gourd')) return '🥒';
    if (lower.contains('cucumber')) return '🥒';
    if (lower.contains('chili')) return '🌶️';
    if (lower.contains('spinach') || lower.contains('gotukola') || lower.contains('kangkung') || lower.contains('green')) return '🥬';
    return '🌱';
  }

  factory CropRiskAnalysis.fromJson(
    Map<String, dynamic> json, {
    List<CropRecommendation>? recommendations,
    String lang = 'en',
  }) {
    final crop = (json['crop'] as Map<String, dynamic>?) ?? {};
    final factorData = (json['factors'] as Map<String, dynamic>?) ?? {};
    final parsedFactors = RiskFactorBreakdown.fromJson(factorData);

    final rawLevel = json['riskLevel']?.toString().toUpperCase() ?? 'SAFE';
    CropRiskLevel riskLevel;
    if (rawLevel == 'OVER_PLANTED' || rawLevel == 'CRITICAL' || rawLevel == 'HIGH') {
      riskLevel = CropRiskLevel.critical;
    } else if (rawLevel == 'WARNING' || rawLevel == 'MODERATE' || rawLevel == 'MEDIUM') {
      riskLevel = CropRiskLevel.moderate;
    } else {
      riskLevel = CropRiskLevel.safe;
    }

    final code = crop['code']?.toString() ?? crop['crop_code']?.toString() ?? '';
    final rawId = crop['id']?.toString() ?? code.toLowerCase();
    final normalizedCropId = rawId.startsWith('crop_') ? rawId : 'crop_${code.toLowerCase()}';

    String cropName = crop['nameEn'] ?? crop['name_en'] ?? crop['name'] ?? 'Crop';
    if (lang == 'si' && (crop['nameSi'] != null || crop['name_si'] != null)) {
      cropName = crop['nameSi'] ?? crop['name_si'];
    }

    final emoji = getEmojiForCrop(code.isNotEmpty ? code : cropName);

    final totalPlantedAcres = (json['totalPlantedAcres'] as num?)?.toDouble() ??
        (parsedFactors.currentPlantedKg > 0 ? (parsedFactors.currentPlantedKg / 8000.0) : 0.0);
    
    final targetDemandKg = (json['targetDemandKg'] as num?)?.toDouble() ?? parsedFactors.demandQuotaKg;
    final estimatedSupplyKg = (json['estimatedSupplyKg'] as num?)?.toDouble() ?? parsedFactors.currentPlantedKg;
    
    // Calculate target acres: demand / avg yield
    final double regionalMaxTargetAcres = targetDemandKg > 0
        ? (targetDemandKg / 8000.0)
        : (totalPlantedAcres > 0 ? totalPlantedAcres * 1.3 : 300.0);

    final compositeScore = (json['riskPercentage'] as num?)?.toInt() ??
        (json['compositeRiskScore'] as num?)?.toInt() ?? 0;

    double saturationPercentage = parsedFactors.overPlantingRatio.toDouble();
    if (saturationPercentage <= 0 && targetDemandKg > 0) {
      saturationPercentage = (estimatedSupplyKg / targetDemandKg) * 100;
    }
    if (saturationPercentage <= 0) {
      saturationPercentage = compositeScore.toDouble();
    }

    final currentMarketPrice = parsedFactors.currentPrice > 0
        ? parsedFactors.currentPrice
        : ((crop['standardPricePerKg'] as num?)?.toDouble() ?? (crop['standard_price_per_kg'] as num?)?.toDouble() ?? 250.0);

    // Calculate predicted harvest price & drop risk based on saturation
    double predictedPrice = currentMarketPrice;
    double priceDropRisk = 0.0;
    if (saturationPercentage > 100) {
      final excess = saturationPercentage - 100;
      priceDropRisk = (excess * 0.6).clamp(10.0, 65.0);
      predictedPrice = currentMarketPrice * (1.0 - (priceDropRisk / 100.0));
    } else if (saturationPercentage > 75) {
      priceDropRisk = ((saturationPercentage - 75) * 0.4).clamp(5.0, 20.0);
      predictedPrice = currentMarketPrice * (1.0 - (priceDropRisk / 100.0));
    }

    // Dynamic localized warning message
    String warning;
    if (riskLevel == CropRiskLevel.critical) {
      warning = 'CRITICAL ALERT: Over ${totalPlantedAcres.toStringAsFixed(0)} acres registered in ${json['district'] ?? 'Badulla'}. High risk of ~${priceDropRisk.toStringAsFixed(0)}% price drop at harvest.';
    } else if (riskLevel == CropRiskLevel.moderate) {
      warning = 'CAUTION: Planting volume is approaching ${saturationPercentage.toStringAsFixed(0)}% of regional quota. Stagger sowing to prevent supply peak.';
    } else {
      warning = 'SAFE TO SOW: High market demand with healthy regional quota margin. Weather outlook is favorable.';
    }

    // Dynamic agronomic advice incorporating weather & seasonal factors
    String advice = parsedFactors.weatherAdvisory.isNotEmpty
        ? parsedFactors.weatherAdvisory
        : 'Agrarian Services recommend monitoring local economic centre price trends before harvest.';
    if (parsedFactors.seasonStatus == 'IN_SEASON') {
      advice += ' Optimal cultivation window for ${parsedFactors.currentSeason} season.';
    }

    return CropRiskAnalysis(
      cropId: normalizedCropId,
      cropName: cropName,
      cropEmoji: emoji,
      riskLevel: riskLevel,
      regionalPlantedAcres: totalPlantedAcres,
      regionalMaxTargetAcres: regionalMaxTargetAcres,
      saturationPercentage: saturationPercentage,
      currentMarketPriceLkr: currentMarketPrice,
      predictedHarvestPriceLkr: predictedPrice,
      priceDropRiskPercentage: priceDropRisk,
      warningMessage: warning,
      agronomicAdvice: advice,
      alternativeRecommendations: recommendations ?? [],
      compositeRiskScore: compositeScore,
      district: json['district']?.toString() ?? 'Badulla',
      division: json['division']?.toString() ?? 'Bandarawela',
      activePlotsCount: (json['activePlotsCount'] as num?)?.toInt() ?? 0,
      estimatedSupplyKg: estimatedSupplyKg,
      targetDemandKg: targetDemandKg,
      factors: parsedFactors,
      evaluatedAt: json['evaluatedAt'] != null ? DateTime.tryParse(json['evaluatedAt'].toString()) : DateTime.now(),
      isLiveBackend: true,
    );
  }

  double get totalPlantedAcres => regionalPlantedAcres;

  String get riskTitle {
    switch (riskLevel) {
      case CropRiskLevel.safe:
        return 'Safe to Plant';
      case CropRiskLevel.moderate:
        return 'Moderate Risk';
      case CropRiskLevel.critical:
        return 'Over-Planted Alert';
    }
  }

  String get riskDescription {
    switch (riskLevel) {
      case CropRiskLevel.safe:
        return 'Demand is high and regional planting volume is well balanced. Healthy profit expected.';
      case CropRiskLevel.moderate:
        return 'Planting volume is approaching market threshold. Monitor market closely.';
      case CropRiskLevel.critical:
        return 'Severe over-planting detected in Bandarawela division. High risk of supply glut and price collapse.';
    }
  }
}
