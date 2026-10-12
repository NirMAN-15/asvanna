import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/crop_model.dart';
import '../models/risk_analysis_model.dart';
import '../models/surplus_listing_model.dart';
import '../models/notice_model.dart';
import '../models/weather_model.dart';
import 'mock_data_service.dart';
import 'offline_storage_service.dart';

class ApiService {
  // Configurable base URL for backend connection
  static String baseUrl = _resolveInitialBaseUrl();
  static bool useMockFallback = true;
  static bool isOnlineMode = true;

  static String _resolveInitialBaseUrl() {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }

  static void setBaseUrl(String url) {
    baseUrl = url;
  }

  // Health check to verify backend connectivity (with smart candidate fallback)
  static Future<bool> checkBackendHealth() async {
    final candidateHosts = [
      baseUrl.replaceAll('/api/v1', ''),
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://10.0.2.2:5000',
    ];

    for (final host in candidateHosts) {
      try {
        final response = await http
            .get(Uri.parse('$host/health'))
            .timeout(const Duration(milliseconds: 1500));
        if (response.statusCode == 200) {
          baseUrl = '$host/api/v1';
          isOnlineMode = true;
          return true;
        }
      } catch (_) {}
    }

    isOnlineMode = false;
    return false;
  }

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

  // 2. Fetch Risk Analysis for Single Crop (GET /api/v1/risk/:cropId/detailed)
  static Future<CropRiskAnalysis?> getRiskAnalysis(
    String cropId, {
    String district = 'Badulla',
    String division = 'Bandarawela',
    String lang = 'en',
  }) async {
    try {
      // Clean ID for query (e.g. crop_leeks -> leeks)
      final cleanId = cropId.replaceFirst(RegExp(r'^crop_'), '');

      // 1. Fetch risk evaluation from backend
      final riskUri = Uri.parse('$baseUrl/risk/$cleanId/detailed?district=$district');
      final response = await http.get(riskUri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'] as Map<String, dynamic>?;

        if (data != null) {
          // 2. Fetch dynamic smart recommendations for alternatives
          List<CropRecommendation> recommendations = [];
          try {
            final recsUri = Uri.parse('$baseUrl/recommendations?district=$district&cropId=$cleanId');
            final recResponse = await http.get(recsUri).timeout(const Duration(seconds: 3));
            if (recResponse.statusCode == 200) {
              final recBody = jsonDecode(recResponse.body);
              final recList = (recBody['data'] as List<dynamic>?) ?? [];
              recommendations = recList
                  .map((r) => CropRecommendation.fromJson(r as Map<String, dynamic>, lang: lang))
                  .toList();
            }
          } catch (_) {
            // Optional recommendations query failure is non-fatal
          }

          // If no recommendations returned from endpoint, check fallback recommendations
          if (recommendations.isEmpty) {
            final mockData = MockDataService.getRiskAnalyses()[cropId];
            if (mockData != null) {
              recommendations = mockData.alternativeRecommendations;
            }
          }

          isOnlineMode = true;
          return CropRiskAnalysis.fromJson(data, recommendations: recommendations, lang: lang);
        }
      }
    } catch (err) {
      if (kDebugMode) {
        print('Backend risk fetch failed for $cropId: $err. Falling back to local intelligence.');
      }
    }

    // Fallback to local intelligence model
    if (useMockFallback) {
      final analyses = MockDataService.getRiskAnalyses();
      final direct = analyses[cropId];
      if (direct != null) return direct;

      // Try normalized key
      for (final entry in analyses.entries) {
        if (entry.key.contains(cropId.replaceAll('crop_', '')) ||
            cropId.contains(entry.key.replaceAll('crop_', ''))) {
          return entry.value;
        }
      }
    }
    return null;
  }

  // 3. Fetch Regional Risk Summary across all crops (GET /api/v1/risk/regional)
  static Future<Map<String, CropRiskAnalysis>> getRegionalRiskSummary({
    String district = 'Badulla',
    String lang = 'en',
  }) async {
    final Map<String, CropRiskAnalysis> result = {};

    try {
      final uri = Uri.parse('$baseUrl/risk/regional?district=$district');
      final response = await http.get(uri).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final list = (body['data'] as List<dynamic>?) ?? [];

        for (final item in list) {
          final analysis = CropRiskAnalysis.fromJson(item as Map<String, dynamic>, lang: lang);
          result[analysis.cropId] = analysis;
          
          final cropData = item['crop'] as Map<String, dynamic>?;
          if (cropData != null) {
            final code = cropData['code']?.toString().toLowerCase();
            if (code != null) {
              result['crop_$code'] = analysis;
              result[code] = analysis;
            }
            final id = cropData['id']?.toString();
            if (id != null) {
              result[id] = analysis;
            }
          }
        }

        if (result.isNotEmpty) {
          isOnlineMode = true;
          return result;
        }
      }
    } catch (err) {
      if (kDebugMode) {
        print('Regional risk summary fetch failed: $err. Using local intelligence.');
      }
    }

    // Fallback to mock data
    if (useMockFallback) {
      return MockDataService.getRiskAnalyses();
    }
    return result;
  }

  // 4. Smart Search crop risk before sowing (POST /api/v1/risk/smart-search)
  static Future<List<CropRiskAnalysis>> smartSearchRisk(
    String query, {
    String district = 'Badulla',
    String lang = 'en',
  }) async {
    if (query.trim().isEmpty) return [];

    try {
      final uri = Uri.parse('$baseUrl/risk/smart-search');
      final response = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'query': query, 'district': district}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final matches = (body['data']?['matches'] as List<dynamic>?) ?? [];

        return matches
            .map((item) => CropRiskAnalysis.fromJson(item as Map<String, dynamic>, lang: lang))
            .toList();
      }
    } catch (err) {
      if (kDebugMode) {
        print('Smart search request failed: $err');
      }
    }

    // Fallback search in mock data
    final lower = query.toLowerCase();
    final all = MockDataService.getRiskAnalyses().values.where((r) =>
        r.cropName.toLowerCase().contains(lower) ||
        r.cropId.toLowerCase().contains(lower)).toList();
    return all;
  }

  // 5. Fetch Smart Crop Recommendations (GET /api/v1/recommendations)
  static Future<List<CropRecommendation>> getSmartRecommendations({
    String district = 'Badulla',
    String? cropId,
    String lang = 'en',
  }) async {
    try {
      final cleanId = cropId != null ? cropId.replaceFirst(RegExp(r'^crop_'), '') : null;
      final uri = Uri.parse('$baseUrl/recommendations?district=$district${cleanId != null ? '&cropId=$cleanId' : ''}');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final list = (body['data'] as List<dynamic>?) ?? [];
        return list
            .map((r) => CropRecommendation.fromJson(r as Map<String, dynamic>, lang: lang))
            .toList();
      }
    } catch (err) {
      if (kDebugMode) {
        print('Smart recommendations request failed: $err');
      }
    }

    // Fallback to top alternative recommendations from mock data
    final leekRecs = MockDataService.getRiskAnalyses()['crop_leeks']?.alternativeRecommendations;
    return leekRecs ?? [];
  }

  // 6. Fetch Master Crops List (GET /api/v1/crops)
  static Future<List<Crop>> getCrops() async {
    try {
      final uri = Uri.parse('$baseUrl/crops');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final list = (body['data'] as List<dynamic>?) ?? [];
        if (list.isNotEmpty) {
          return list.map((c) => Crop.fromJson(c as Map<String, dynamic>)).toList();
        }
      }
    } catch (_) {}

    return MockDataService.getUpcountryCrops();
  }

  // 7. Fetch 5km Zero-Waste Surplus Listings (GET /api/v1/marketplace/surplus)
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

  // 8. Fetch Agrarian Notices (GET /api/v1/notices)
  static Future<List<AgrarianNotice>> getNotices({
    String district = 'Badulla',
    String division = 'Bandarawela',
    String lang = 'en',
    int limit = 50,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/notices?district=$district&division=$division&lang=$lang&limit=$limit');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final list = (body['data'] as List<dynamic>?) ?? [];
        if (list.isNotEmpty) {
          isOnlineMode = true;
          return list
              .map((n) => AgrarianNotice.fromJson(n as Map<String, dynamic>, lang: lang))
              .toList();
        }
      }
    } catch (err) {
      if (kDebugMode) {
        print('Backend notices fetch failed: $err. Using local fallback.');
      }
    }

    if (useMockFallback) {
      return MockDataService.getAgrarianNotices();
    }
    return [];
  }

  // 8.1 Register Device Token for Push Notifications (POST /api/v1/notifications/register-token)
  static Future<bool> registerDeviceToken(String token, {Map<String, dynamic>? deviceInfo}) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/notifications/register-token'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'fcm_token': token,
              'device_info': deviceInfo ?? {'platform': defaultTargetPlatform.name, 'client': 'Asvanna Flutter App'},
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
    } catch (err) {
      if (kDebugMode) {
        print('Device token registration failed: $err');
      }
    }
    return false;
  }

  // 8.2 Push Agrarian Broadcast Notice / Notification (POST /api/v1/notifications/push)
  static Future<AgrarianNotice?> pushBroadcastAlert({
    required String title,
    required String description,
    String? titleSi,
    String? titleTa,
    String? descriptionSi,
    String? descriptionTa,
    String category = 'Crop Directive',
    NoticePriority priority = NoticePriority.urgent,
    String district = 'Badulla',
    String division = 'Bandarawela',
    String department = 'Department of Agrarian Development',
    String issuedBy = 'Bandarawela Agrarian Services Centre',
  }) async {
    final payload = {
      'title': title,
      'title_en': title,
      'title_si': titleSi ?? title,
      'title_ta': titleTa ?? title,
      'description': description,
      'description_en': description,
      'description_si': descriptionSi ?? description,
      'description_ta': descriptionTa ?? description,
      'category': category,
      'priority': priority.name,
      'severity': priority == NoticePriority.urgent
          ? 'CRITICAL'
          : (priority == NoticePriority.high ? 'HIGH' : 'MEDIUM'),
      'targetDistrict': district,
      'targetDivision': division,
      'department': department,
      'issuedBy': issuedBy,
    };

    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/notifications/push'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = jsonDecode(response.body);
        final data = body['data'] as Map<String, dynamic>?;
        if (data != null) {
          return AgrarianNotice.fromJson(data);
        }
      }
    } catch (err) {
      if (kDebugMode) {
        print('Push alert failed: $err');
      }
    }

    // Fallback local notice creation
    return AgrarianNotice(
      id: 'local_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      titleSi: titleSi,
      titleTa: titleTa,
      description: description,
      descriptionSi: descriptionSi,
      descriptionTa: descriptionTa,
      category: category,
      priority: priority,
      department: department,
      issuedBy: issuedBy,
      date: DateTime.now(),
      isOfficial: true,
    );
  }

  // 8.3 Fetch User In-App Notifications (GET /api/v1/notifications)
  static Future<List<AppNotification>> getNotifications({int limit = 50}) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/notifications?limit=$limit'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final list = (body['data'] as List<dynamic>?) ?? [];
        return list.map((n) => AppNotification.fromJson(n as Map<String, dynamic>)).toList();
      }
    } catch (_) {}
    return [];
  }

  // 8.4 Mark Notification as Read (PUT /api/v1/notifications/:id/read)
  static Future<bool> markNotificationAsRead(String id) async {
    try {
      final response = await http
          .put(Uri.parse('$baseUrl/notifications/$id/read'))
          .timeout(const Duration(seconds: 3));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 9. Fetch Live Weather Forecast & Agricultural Radar (GET /api/v1/weather/forecast)
  static Future<WeatherData?> getWeatherForecast({
    String division = 'Bandarawela',
    double? lat,
    double? lng,
    int days = 14,
  }) async {
    try {
      final queryParams = <String, String>{
        'division': division,
        'days': days.toString(),
      };
      if (lat != null) queryParams['lat'] = lat.toString();
      if (lng != null) queryParams['lng'] = lng.toString();

      final uri = Uri.parse('$baseUrl/weather/forecast').replace(queryParameters: queryParams);
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final data = body['data'] as Map<String, dynamic>?;
        if (data != null) {
          isOnlineMode = true;
          return WeatherData.fromJson(data);
        }
      }
    } catch (err) {
      if (kDebugMode) {
        print('Weather forecast fetch failed for $division: $err. Using local fallback.');
      }
    }

    if (useMockFallback) {
      return MockDataService.getFallbackWeatherData(division);
    }
    return null;
  }

  // 10. Fetch Current Weather Summary (GET /api/v1/weather/current)
  static Future<CurrentWeather?> getCurrentWeather({
    String division = 'Bandarawela',
    double? lat,
    double? lng,
  }) async {
    try {
      final queryParams = <String, String>{'division': division};
      if (lat != null) queryParams['lat'] = lat.toString();
      if (lng != null) queryParams['lng'] = lng.toString();

      final uri = Uri.parse('$baseUrl/weather/current').replace(queryParameters: queryParams);
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final cur = body['data']?['current'] as Map<String, dynamic>?;
        if (cur != null) {
          isOnlineMode = true;
          return CurrentWeather.fromJson(cur);
        }
      }
    } catch (_) {}

    if (useMockFallback) {
      return MockDataService.getFallbackWeatherData(division).current;
    }
    return null;
  }

  // 11. Fetch Crop Weather Suitability (GET /api/v1/weather/crop-suitability/:cropId)
  static Future<Map<String, dynamic>?> getCropWeatherSuitability(String cropId) async {
    try {
      final cleanId = cropId.replaceFirst(RegExp(r'^crop_'), '');
      final uri = Uri.parse('$baseUrl/weather/crop-suitability/$cleanId');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['data'] as Map<String, dynamic>?;
      }
    } catch (_) {}
    return null;
  }

  // 12. Sync pending offline queue when online
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
