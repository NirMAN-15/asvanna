import 'package:flutter_test/flutter_test.dart';
import 'package:asvanna_app/core/models/crop_model.dart';
import 'package:asvanna_app/core/models/risk_analysis_model.dart';
import 'package:asvanna_app/core/services/mock_data_service.dart';
import 'package:asvanna_app/core/localization/app_translations.dart';
import 'package:asvanna_app/core/providers/app_state_provider.dart';

void main() {
  group('Asvanna Pre-Planting Risk Engine Tests', () {
    test('Leeks should be flagged as critical over-planted in Bandarawela', () {
      final risks = MockDataService.getRiskAnalyses();
      final leekRisk = risks['crop_leeks'];

      expect(leekRisk, isNotNull);
      expect(leekRisk!.riskLevel, equals(CropRiskLevel.critical));
      expect(leekRisk.saturationPercentage, greaterThan(100.0));
      expect(leekRisk.priceDropRiskPercentage, greaterThan(40.0));
      expect(leekRisk.alternativeRecommendations.isNotEmpty, isTrue);
    });

    test('Beetroot and Green Beans should have safe capacity room, Carrots with caution', () {
      final risks = MockDataService.getRiskAnalyses();
      final beetRisk = risks['crop_beetroot'];
      final beansRisk = risks['crop_beans'];
      final carrotRisk = risks['crop_carrot'];

      expect(beetRisk!.riskLevel, equals(CropRiskLevel.safe));
      expect(beetRisk.saturationPercentage, lessThan(80.0));
      expect(beansRisk!.riskLevel, equals(CropRiskLevel.safe));
      expect(carrotRisk!.riskLevel, equals(CropRiskLevel.moderate));
    });

    test('Should parse backend 4-factor risk JSON correctly into CropRiskAnalysis', () {
      final sampleBackendJson = {
        'crop': {
          'id': 1,
          'code': 'LEEKS',
          'nameEn': 'Leeks',
          'nameSi': 'ලීක්ස්',
          'category': 'Upcountry Vegetable',
          'standardPricePerKg': 280.0
        },
        'district': 'Badulla',
        'division': 'Bandarawela',
        'activePlotsCount': 3,
        'totalPlantedAcres': 4.5,
        'estimatedSupplyKg': 36000.0,
        'targetDemandKg': 25000.0,
        'riskPercentage': 75,
        'riskLevel': 'OVER_PLANTED',
        'factors': {
          'overPlanting': {
            'score': 85,
            'weight': '45%',
            'ratio': 144,
            'demandQuotaKg': 25000.0,
            'currentPlantedKg': 36000.0
          },
          'weather': {
            'score': 15,
            'weight': '25%',
            'temperatureScore': 95.0,
            'rainfallScore': 80.0,
            'advisory': 'Optimal growing temperatures in Bandarawela.'
          },
          'seasonal': {
            'score': 10,
            'weight': '15%',
            'currentSeason': 'MAHA',
            'status': 'IN_SEASON'
          },
          'price': {
            'score': 40,
            'weight': '15%',
            'volatilityPercentage': 18.5,
            'currentPrice': 280.0
          }
        },
        'evaluatedAt': '2026-09-15T02:00:00.000Z'
      };

      final parsed = CropRiskAnalysis.fromJson(sampleBackendJson);

      expect(parsed.cropId, equals('crop_leeks'));
      expect(parsed.cropName, equals('Leeks'));
      expect(parsed.cropEmoji, equals('🥬'));
      expect(parsed.riskLevel, equals(CropRiskLevel.critical));
      expect(parsed.isLiveBackend, isTrue);
      expect(parsed.activePlotsCount, equals(3));
      expect(parsed.totalPlantedAcres, equals(4.5));
      expect(parsed.saturationPercentage, equals(144.0));
      expect(parsed.factors, isNotNull);
      expect(parsed.factors!.overPlantingScore, equals(85));
      expect(parsed.factors!.weatherScore, equals(15));
      expect(parsed.factors!.seasonalScore, equals(10));
      expect(parsed.factors!.priceScore, equals(40));
      expect(parsed.factors!.currentSeason, equals('MAHA'));
    });

    test('Should parse backend recommendations JSON properly', () {
      final sampleRecJson = {
        'crop': {
          'id': 4,
          'code': 'BEETROOT',
          'nameEn': 'Beetroot',
          'nameSi': 'බීට්රූට්',
          'standardPricePerKg': 260.0,
          'avgYieldPerAcreKg': 8000.0
        },
        'scores': {
          'compositeScore': 88,
          'marketGapScore': 80
        },
        'rationale': {
          'en': 'High market demand in Badulla with 80% unmet quota.',
          'si': 'බණ්ඩාරවෙල කලාපයේ 80%ක ඉහළ වෙළෙඳපොළ ඉල්ලුමක් පවතී.'
        }
      };

      final rec = CropRecommendation.fromJson(sampleRecJson, lang: 'en');
      expect(rec.cropId, equals('crop_beetroot'));
      expect(rec.cropName, equals('Beetroot'));
      expect(rec.emoji, equals('🟣'));
      expect(rec.profitBoostPercentage, greaterThan(20.0));
      expect(rec.estimatedRevenuePerAcreLkr, equals(2080000.0));
    });
  });

  group('Farmer Land Acreage Validation Tests', () {
    test('Should reject planting exceeding available free land', () {
      final appState = AppStateProvider();
      final farmer = appState.farmerProfile;
      final freeLand = farmer.availableAcres;

      final crops = MockDataService.getUpcountryCrops();
      final testCrop = crops.first;

      // Try allocating more land than available
      final success = appState.addPlantingEntry(
        crop: testCrop,
        allocatedAcres: freeLand + 5.0,
        plantingDate: DateTime.now(),
        expectedHarvestDate: DateTime.now().add(const Duration(days: 90)),
      );

      expect(success, isFalse);
    });
  });

  group('Multi-Language Localization Tests', () {
    test('Translations should return Sinhala and Tamil text properly', () {
      final sinhalaTitle = AppTranslations.tr(AppLanguage.sinhala, 'app_title');
      final tamilTitle = AppTranslations.tr(AppLanguage.tamil, 'app_title');

      expect(sinhalaTitle, equals('අස්වැන්න'));
      expect(tamilTitle, equals('அஸ்வன்ன'));
    });
  });
}
