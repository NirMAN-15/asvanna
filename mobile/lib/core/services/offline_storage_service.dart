import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/crop_model.dart';
import '../models/farmer_model.dart';

class OfflineStorageService {
  static const String _keyFarmerProfile = 'asvanna_farmer_profile';
  static const String _keyLanguage = 'asvanna_language';
  static const String _keyOfflineQueue = 'asvanna_offline_queue';

  // Save Farmer Profile locally
  static Future<bool> saveFarmerProfile(FarmerProfile profile) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final map = {
        'id': profile.id,
        'fullName': profile.fullName,
        'phone': profile.phone,
        'nic': profile.nic,
        'agrarianDivision': profile.agrarianDivision,
        'gndDivision': profile.gndDivision,
        'totalLandAcres': profile.totalLandAcres,
        'activePlantings': profile.activePlantings.map((p) => p.toJson()).toList(),
      };
      return await prefs.setString(_keyFarmerProfile, jsonEncode(map));
    } catch (e) {
      return false;
    }
  }

  // Load Farmer Profile from offline storage
  static Future<FarmerProfile?> loadFarmerProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_keyFarmerProfile);
      if (jsonStr == null) return null;

      final Map<String, dynamic> map = jsonDecode(jsonStr);
      final plantingsList = (map['activePlantings'] as List?) ?? [];
      final activePlantings = plantingsList.map((p) {
        return PlantedCropEntry(
          id: p['id'] ?? '',
          cropId: p['crop_id'] ?? '',
          cropName: p['crop_name'] ?? '',
          cropEmoji: p['crop_emoji'] ?? '🌱',
          allocatedAcres: (p['allocated_acres'] as num?)?.toDouble() ?? 1.0,
          plantingDate: DateTime.tryParse(p['planting_date'] ?? '') ?? DateTime.now(),
          expectedHarvestDate: DateTime.tryParse(p['expected_harvest_date'] ?? '') ?? DateTime.now().add(const Duration(days: 90)),
          projectedYieldKg: (p['projected_yield_kg'] as num?)?.toDouble() ?? 5000.0,
          status: p['status'] ?? 'growing',
          agrarianDivision: p['agrarian_division'] ?? 'Bandarawela',
        );
      }).toList();

      return FarmerProfile(
        id: map['id'] ?? 'farmer_001',
        fullName: map['fullName'] ?? '',
        phone: map['phone'] ?? '',
        nic: map['nic'] ?? '',
        agrarianDivision: map['agrarianDivision'] ?? 'Bandarawela',
        gndDivision: map['gndDivision'] ?? 'Heeloya West (GND 142)',
        totalLandAcres: (map['totalLandAcres'] as num?)?.toDouble() ?? 3.5,
        activePlantings: activePlantings,
      );
    } catch (e) {
      return null;
    }
  }

  // Save selected language
  static Future<void> saveLanguage(String langCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLanguage, langCode);
  }

  // Load language
  static Future<String?> loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyLanguage);
  }

  // Queue offline planting for background sync when connection resumes
  static Future<void> queueOfflinePlanting(Map<String, dynamic> plantingPayload) async {
    final prefs = await SharedPreferences.getInstance();
    final currentQueueStr = prefs.getString(_keyOfflineQueue) ?? '[]';
    final List list = jsonDecode(currentQueueStr);
    list.add(plantingPayload);
    await prefs.setString(_keyOfflineQueue, jsonEncode(list));
  }

  // Get pending offline sync queue
  static Future<List<Map<String, dynamic>>> getOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_keyOfflineQueue);
    if (str == null) return [];
    final List list = jsonDecode(str);
    return list.map((item) => Map<String, dynamic>.from(item)).toList();
  }

  // Clear offline sync queue after successful upload
  static Future<void> clearOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyOfflineQueue);
  }
}
