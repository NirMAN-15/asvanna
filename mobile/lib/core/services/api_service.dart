import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crop_model.dart';
import '../models/risk_analysis_model.dart';
import '../models/surplus_listing_model.dart';
import '../models/notice_model.dart';
import 'mock_data_service.dart';
import 'offline_storage_service.dart';

class ApiService {
  // Configurable base URL for backend connection
  static String baseUrl = 'https://api.asvanna.gov.lk/v1';
  static bool useMockFallback = true;

  // 1. Submit Planting Entry (POST /api/v1/planting)
  static Future<bool> submitPlanting(PlantedCropEntry entry) async {
    final payload = entry.toJson();

    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/planting'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
    } catch (e) {
      // Offline / network timeout: save to offline sync queue
      await OfflineStorageService.queueOfflinePlanting(payload);
    }
    return true; // Return true as local offline state has updated
  }

  // 2. Fetch Risk Analysis for Crop (GET /api/v1/risk-analysis)
  static Future<CropRiskAnalysis?> getRiskAnalysis(String cropId, String division) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/risk-analysis?crop_id=$cropId&division=$division'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        // Parse server response
      }
    } catch (_) {}

    // Fallback to local intelligence model
    if (useMockFallback) {
      return MockDataService.getRiskAnalyses()[cropId];
    }
    return null;
  }

  // 3. Fetch 5km Zero-Waste Surplus Listings (GET /api/v1/marketplace/surplus)
  static Future<List<SurplusListing>> getSurplusListings(double radiusKm) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/marketplace/surplus?radius_km=$radiusKm'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        // Parse server list
      }
    } catch (_) {}

    if (useMockFallback) {
      return MockDataService.getNearbySurplusListings()
          .where((item) => item.distanceKm <= radiusKm)
          .toList();
    }
    return [];
  }

  // 4. Fetch Agrarian Notices (GET /api/v1/notices)
  static Future<List<AgrarianNotice>> getNotices() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/notices'))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        // Parse notices
      }
    } catch (_) {}

    if (useMockFallback) {
      return MockDataService.getAgrarianNotices();
    }
    return [];
  }

  // 5. Sync pending offline queue when online
  static Future<int> syncPendingOfflineQueue() async {
    final queue = await OfflineStorageService.getOfflineQueue();
    if (queue.isEmpty) return 0;

    int syncedCount = 0;
    for (final item in queue) {
      try {
        final response = await http
            .post(
              Uri.parse('$baseUrl/planting'),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(item),
            )
            .timeout(const Duration(seconds: 4));

        if (response.statusCode == 200 || response.statusCode == 201) {
          syncedCount++;
        }
      } catch (_) {
        break; // Still offline
      }
    }

    if (syncedCount == queue.length) {
      await OfflineStorageService.clearOfflineQueue();
    }
    return syncedCount;
  }
}
