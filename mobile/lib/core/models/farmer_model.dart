import 'crop_model.dart';

class FarmerProfile {
  final String id;
  final String fullName;
  final String phone;
  final String nic;
  final String agrarianDivision;
  final String gndDivision;
  final double totalLandAcres;
  final List<PlantedCropEntry> activePlantings;

  FarmerProfile({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.nic,
    this.agrarianDivision = 'Bandarawela',
    this.gndDivision = 'Heeloya',
    required this.totalLandAcres,
    this.activePlantings = const [],
  });

  double get usedAcres {
    return activePlantings
        .where((p) => p.status == 'growing')
        .fold(0.0, (sum, item) => sum + item.allocatedAcres);
  }

  double get availableAcres {
    final available = totalLandAcres - usedAcres;
    return available < 0 ? 0.0 : available;
  }

  double get landUtilizationPercentage {
    if (totalLandAcres <= 0) return 0.0;
    return (usedAcres / totalLandAcres * 100).clamp(0.0, 100.0);
  }
}
