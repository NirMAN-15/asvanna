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
