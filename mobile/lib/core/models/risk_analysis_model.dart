import 'crop_model.dart';

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
  });

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
