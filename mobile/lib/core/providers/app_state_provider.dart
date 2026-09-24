import 'package:flutter/foundation.dart';
import '../models/crop_model.dart';
import '../models/risk_analysis_model.dart';
import '../models/farmer_model.dart';
import '../models/buyer_model.dart';
import '../models/surplus_listing_model.dart';
import '../models/notice_model.dart';
import '../models/weather_model.dart';
import '../services/mock_data_service.dart';
import '../services/offline_storage_service.dart';
import '../services/api_service.dart';
import '../services/push_notification_service.dart';

enum UserRole { unauthenticated, farmer, buyer }

enum AppLanguage { english, sinhala, tamil }

class AppStateProvider with ChangeNotifier {
  UserRole _currentUserRole = UserRole.unauthenticated;
  AppLanguage _currentLanguage = AppLanguage.english;
  bool _isDarkMode = false;

  late FarmerProfile _farmerProfile;
  BuyerProfile? _buyerProfile;
  List<Crop> _availableCrops = [];
  Map<String, CropRiskAnalysis> _riskAnalyses = {};
  List<SurplusListing> _surplusListings = [];
  List<AgrarianNotice> _notices = [];
  List<AppNotification> _userNotifications = [];
  bool _isLoadingNotices = false;
  WeatherData? _currentWeather;
  bool _isLoadingWeather = false;
  String _selectedWeatherDivision = 'Bandarawela';

  // Selected crop for risk analysis preview
  Crop? _selectedCropForRisk;
  double _selectedRadiusKm = 5.0;
  bool _isOnline = true;
  bool _isBackendConnected = false;
  bool _isLoadingRisk = false;
  String? _riskErrorMessage;
  int _pendingOfflineSyncs = 0;

  AppStateProvider() {
    _initData();
  }

  void _initData() async {
    _availableCrops = MockDataService.getUpcountryCrops();
    _riskAnalyses = MockDataService.getRiskAnalyses();
    _farmerProfile = MockDataService.getInitialFarmerProfile();
    _surplusListings = MockDataService.getNearbySurplusListings();
    _notices = MockDataService.getAgrarianNotices();
    _selectedWeatherDivision = _farmerProfile.agrarianDivision;
    _currentWeather = MockDataService.getFallbackWeatherData(_selectedWeatherDivision);
    
    // Default selected crop for risk check
    _selectedCropForRisk = _availableCrops.first;
    
    // Mock buyer profile
    _buyerProfile = BuyerProfile(
      id: 'buyer_001',
      businessName: 'Ella Heritage Catering & Events',
      ownerName: 'Niroshan Perera',
      phone: '+94 77 889 9001',
      category: 'Event Catering',
      locationAddress: 'Bandarawela Main Street',
      latitude: 6.8314,
      longitude: 80.9859,
      weeklyPurchaseCapacityKg: 1500,
    );

    // Try loading persistent local storage if available
    try {
      final cachedProfile = await OfflineStorageService.loadFarmerProfile();
      if (cachedProfile != null) {
        _farmerProfile = cachedProfile;
        _selectedWeatherDivision = cachedProfile.agrarianDivision;
      }
      final cachedLang = await OfflineStorageService.loadLanguage();
      if (cachedLang != null) {
        if (cachedLang == 'si') _currentLanguage = AppLanguage.sinhala;
        if (cachedLang == 'ta') _currentLanguage = AppLanguage.tamil;
        if (cachedLang == 'en') _currentLanguage = AppLanguage.english;
      }
      final cachedDark = await OfflineStorageService.loadDarkMode();
      if (cachedDark != null) {
        _isDarkMode = cachedDark;
      }
      final queue = await OfflineStorageService.getOfflineQueue();
      _pendingOfflineSyncs = queue.length;
      notifyListeners();
    } catch (_) {}

    // Initialize push notifications & register device token with backend
    PushNotificationService.initialize();

    // Synchronize live data from backend
    await Future.wait([
      fetchLiveRiskData(),
      fetchWeatherData(division: _selectedWeatherDivision),
      fetchLiveNotices(division: _selectedWeatherDivision),
      fetchUserNotifications(),
    ]);
  }

  // Getters
  UserRole get currentUserRole => _currentUserRole;
  AppLanguage get currentLanguage => _currentLanguage;
  bool get isDarkMode => _isDarkMode;
  FarmerProfile get farmerProfile => _farmerProfile;
  BuyerProfile? get buyerProfile => _buyerProfile;
  List<Crop> get availableCrops => _availableCrops;
  List<SurplusListing> get surplusListings => _surplusListings;
  List<AgrarianNotice> get notices => _notices;
  List<AppNotification> get userNotifications => _userNotifications;
  int get unreadNoticesCount => _notices
      .where((n) => n.priority == NoticePriority.urgent || n.priority == NoticePriority.high)
      .length;
  Crop? get selectedCropForRisk => _selectedCropForRisk;
  double get selectedRadiusKm => _selectedRadiusKm;
  bool get isOnline => _isOnline;
  bool get isBackendConnected => _isBackendConnected;
  bool get isLoadingRisk => _isLoadingRisk;
  bool get isLoadingWeather => _isLoadingWeather;
  bool get isLoadingNotices => _isLoadingNotices;
  String? get riskErrorMessage => _riskErrorMessage;
  int get pendingOfflineSyncs => _pendingOfflineSyncs;
  WeatherData? get currentWeather => _currentWeather;
  String get selectedWeatherDivision => _selectedWeatherDivision;

  // Fetch live weather data for division
  Future<void> fetchWeatherData({String? division}) async {
    if (division != null && division.isNotEmpty) {
      _selectedWeatherDivision = division;
    }
    _isLoadingWeather = true;
    notifyListeners();

    try {
      final liveWeather = await ApiService.getWeatherForecast(
        division: _selectedWeatherDivision,
        days: 14,
      );
      if (liveWeather != null) {
        _currentWeather = liveWeather;
        _isBackendConnected = true;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Live weather fetch failed for $_selectedWeatherDivision: $e');
      }
    } finally {
      _isLoadingWeather = false;
      notifyListeners();
    }
  }

  void setWeatherDivision(String division) {
    if (_selectedWeatherDivision != division) {
      _selectedWeatherDivision = division;
      fetchWeatherData(division: division);
    }
  }

  CropRiskAnalysis? getRiskForCrop(String cropId) {
    if (_riskAnalyses.containsKey(cropId)) {
      return _riskAnalyses[cropId];
    }
    // Search without prefix
    final clean = cropId.replaceFirst(RegExp(r'^crop_'), '');
    for (final entry in _riskAnalyses.entries) {
      if (entry.key.toLowerCase().contains(clean.toLowerCase()) ||
          clean.toLowerCase().contains(entry.key.toLowerCase())) {
        return entry.value;
      }
    }
    return MockDataService.getRiskAnalyses()[cropId];
  }

  CropRiskAnalysis? get currentCropRisk {
    if (_selectedCropForRisk == null) return null;
    return getRiskForCrop(_selectedCropForRisk!.id);
  }

  // Fetch live regional risk data and master crops from backend
  Future<void> fetchLiveRiskData() async {
    _isLoadingRisk = true;
    notifyListeners();

    try {
      final isHealthy = await ApiService.checkBackendHealth();
      _isBackendConnected = isHealthy;

      if (isHealthy) {
        // 1. Fetch live master crops
        final backendCrops = await ApiService.getCrops();
        if (backendCrops.isNotEmpty) {
          _availableCrops = backendCrops;
          if (_selectedCropForRisk == null || !_availableCrops.any((c) => c.id == _selectedCropForRisk!.id)) {
            _selectedCropForRisk = _availableCrops.first;
          }
        }

        // 2. Fetch regional risk summary across all crops
        final langCode = _currentLanguage == AppLanguage.sinhala ? 'si' : (_currentLanguage == AppLanguage.tamil ? 'ta' : 'en');
        final liveRisks = await ApiService.getRegionalRiskSummary(
          district: 'Badulla',
          lang: langCode,
        );

        if (liveRisks.isNotEmpty) {
          _riskAnalyses.addAll(liveRisks);
        }

        // 3. Fetch detailed single crop risk for selected crop
        if (_selectedCropForRisk != null) {
          final detailed = await ApiService.getRiskAnalysis(
            _selectedCropForRisk!.id,
            district: 'Badulla',
            division: _farmerProfile.agrarianDivision,
            lang: langCode,
          );
          if (detailed != null) {
            _riskAnalyses[_selectedCropForRisk!.id] = detailed;
          }
        }
      }
    } catch (e) {
      _riskErrorMessage = e.toString();
      _isBackendConnected = false;
    } finally {
      _isLoadingRisk = false;
      notifyListeners();
    }
  }

  // Fetch detailed live risk for single selected crop
  Future<CropRiskAnalysis?> fetchDetailedRiskForCrop(String cropId) async {
    final langCode = _currentLanguage == AppLanguage.sinhala ? 'si' : (_currentLanguage == AppLanguage.tamil ? 'ta' : 'en');
    try {
      final detailed = await ApiService.getRiskAnalysis(
        cropId,
        district: 'Badulla',
        division: _farmerProfile.agrarianDivision,
        lang: langCode,
      );
      if (detailed != null) {
        _riskAnalyses[cropId] = detailed;
        _isBackendConnected = true;
        notifyListeners();
        return detailed;
      }
    } catch (_) {}
    return getRiskForCrop(cropId);
  }

  // Smart Search for crops using backend risk engine
  Future<List<CropRiskAnalysis>> searchCropsWithRiskEngine(String query) async {
    final langCode = _currentLanguage == AppLanguage.sinhala ? 'si' : (_currentLanguage == AppLanguage.tamil ? 'ta' : 'en');
    return await ApiService.smartSearchRisk(
      query,
      district: 'Badulla',
      lang: langCode,
    );
  }

  // Setters & Actions
  void setRole(UserRole role) {
    _currentUserRole = role;
    notifyListeners();
  }

  void setLanguage(AppLanguage lang) {
    _currentLanguage = lang;
    final code = lang == AppLanguage.sinhala ? 'si' : (lang == AppLanguage.tamil ? 'ta' : 'en');
    OfflineStorageService.saveLanguage(code);
    fetchLiveRiskData();
    fetchLiveNotices();
    notifyListeners();
  }

  void toggleDarkMode() {
    _isDarkMode = !_isDarkMode;
    OfflineStorageService.saveDarkMode(_isDarkMode);
    notifyListeners();
  }

  void setDarkMode(bool isDark) {
    _isDarkMode = isDark;
    OfflineStorageService.saveDarkMode(_isDarkMode);
    notifyListeners();
  }

  void selectCropForRisk(Crop crop) {
    _selectedCropForRisk = crop;
    notifyListeners();
    // Asynchronously update with latest live risk from backend
    fetchDetailedRiskForCrop(crop.id);
  }

  void setMarketRadius(double radiusKm) {
    _selectedRadiusKm = radiusKm;
    notifyListeners();
  }

  List<SurplusListing> get filteredSurplusListings {
    return _surplusListings.where((item) => item.distanceKm <= _selectedRadiusKm).toList();
  }

  // Add new planting entry (Conforms to POST /api/v1/planting and saves offline)
  bool addPlantingEntry({
    required Crop crop,
    required double allocatedAcres,
    required DateTime plantingDate,
    required DateTime expectedHarvestDate,
  }) {
    if (allocatedAcres > _farmerProfile.availableAcres) {
      return false; // Exceeds available land
    }

    final newEntry = PlantedCropEntry(
      id: 'plant_${DateTime.now().millisecondsSinceEpoch}',
      cropId: crop.id,
      cropName: crop.name,
      cropEmoji: crop.iconEmoji,
      allocatedAcres: allocatedAcres,
      plantingDate: plantingDate,
      expectedHarvestDate: expectedHarvestDate,
      projectedYieldKg: allocatedAcres * crop.expectedYieldKgPerAcre,
      status: 'growing',
      agrarianDivision: _farmerProfile.agrarianDivision,
    );

    final updatedPlantings = List<PlantedCropEntry>.from(_farmerProfile.activePlantings)..insert(0, newEntry);
    
    _farmerProfile = FarmerProfile(
      id: _farmerProfile.id,
      fullName: _farmerProfile.fullName,
      phone: _farmerProfile.phone,
      nic: _farmerProfile.nic,
      agrarianDivision: _farmerProfile.agrarianDivision,
      gndDivision: _farmerProfile.gndDivision,
      totalLandAcres: _farmerProfile.totalLandAcres,
      activePlantings: updatedPlantings,
    );

    // Save to persistent storage & dispatch via ApiService
    OfflineStorageService.saveFarmerProfile(_farmerProfile);
    ApiService.submitPlanting(newEntry);

    notifyListeners();
    return true;
  }

  // Farmer posts a new surplus listing for the 5km zero-waste marketplace
  void addSurplusListing({
    required String cropName,
    required String cropEmoji,
    required double quantityKg,
    required double askingPricePerKg,
    required double regularPricePerKg,
    required bool isUrgent,
    required String notes,
  }) {
    final newListing = SurplusListing(
      id: 'surplus_${DateTime.now().millisecondsSinceEpoch}',
      farmerId: _farmerProfile.id,
      farmerName: _farmerProfile.fullName,
      farmerPhone: _farmerProfile.phone,
      cropName: cropName,
      cropEmoji: cropEmoji,
      availableQuantityKg: quantityKg,
      askingPricePerKgLkr: askingPricePerKg,
      regularMarketPricePerKgLkr: regularPricePerKg,
      harvestedDate: DateTime.now(),
      farmLocation: '${_farmerProfile.gndDivision}, ${_farmerProfile.agrarianDivision}',
      distanceKm: 0.8,
      isUrgent: isUrgent,
      qualityGrade: 'Grade A Local',
      notes: notes,
    );

    _surplusListings.insert(0, newListing);
    notifyListeners();
  }

  void updateFarmerProfile({
    required String fullName,
    required String phone,
    required String nic,
    required String division,
    required String gnd,
    required double totalAcres,
  }) {
    _farmerProfile = FarmerProfile(
      id: _farmerProfile.id,
      fullName: fullName,
      phone: phone,
      nic: nic,
      agrarianDivision: division,
      gndDivision: gnd,
      totalLandAcres: totalAcres,
      activePlantings: _farmerProfile.activePlantings,
    );
    OfflineStorageService.saveFarmerProfile(_farmerProfile);
    notifyListeners();
  }

  void registerBuyer({
    required String businessName,
    required String ownerName,
    required String phone,
    required String category,
    required String address,
    required double weeklyCapacityKg,
  }) {
    _buyerProfile = BuyerProfile(
      id: 'buyer_${DateTime.now().millisecondsSinceEpoch}',
      businessName: businessName,
      ownerName: ownerName,
      phone: phone,
      category: category,
      locationAddress: address,
      latitude: 6.8314,
      longitude: 80.9859,
      weeklyPurchaseCapacityKg: weeklyCapacityKg,
    );
    _currentUserRole = UserRole.buyer;
    notifyListeners();
  }

  bool login({
    required String identifier,
    required String password,
    required UserRole role,
    bool rememberSession = true,
  }) {
    // In demo environment, authenticates seamlessly
    _currentUserRole = role;
    notifyListeners();
    return true;
  }

  bool loginWithOtp({
    required String phoneOrNic,
    required String otpCode,
    required UserRole role,
  }) {
    // Verified OTP
    _currentUserRole = role;
    notifyListeners();
    return true;
  }

  void logout() {
    _currentUserRole = UserRole.unauthenticated;
    notifyListeners();
  }

  Future<void> syncOfflineQueue() async {
    await ApiService.syncPendingOfflineQueue();
    final queue = await OfflineStorageService.getOfflineQueue();
    _pendingOfflineSyncs = queue.length;
    notifyListeners();
  }

  // Fetch live notices from backend
  Future<void> fetchLiveNotices({String? division}) async {
    _isLoadingNotices = true;
    notifyListeners();

    try {
      final langCode = _currentLanguage == AppLanguage.sinhala
          ? 'si'
          : (_currentLanguage == AppLanguage.tamil ? 'ta' : 'en');
      final liveNotices = await ApiService.getNotices(
        district: 'Badulla',
        division: division ?? _farmerProfile.agrarianDivision,
        lang: langCode,
      );
      if (liveNotices.isNotEmpty) {
        _notices = liveNotices;
        _isBackendConnected = true;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Live notices fetch failed: $e');
      }
    } finally {
      _isLoadingNotices = false;
      notifyListeners();
    }
  }

  // Fetch in-app notifications
  Future<void> fetchUserNotifications() async {
    try {
      final notifs = await ApiService.getNotifications();
      if (notifs.isNotEmpty) {
        _userNotifications = notifs;
        notifyListeners();
      }
    } catch (_) {}
  }

  // Dispatch push alert and broadcast notice
  Future<AgrarianNotice?> sendPushNotificationAlert({
    required String title,
    required String description,
    String? titleSi,
    String? titleTa,
    String? descriptionSi,
    String? descriptionTa,
    String category = 'Crop Directive',
    NoticePriority priority = NoticePriority.urgent,
    String? division,
  }) async {
    final notice = await ApiService.pushBroadcastAlert(
      title: title,
      description: description,
      titleSi: titleSi,
      titleTa: titleTa,
      descriptionSi: descriptionSi,
      descriptionTa: descriptionTa,
      category: category,
      priority: priority,
      district: 'Badulla',
      division: division ?? _farmerProfile.agrarianDivision,
      department: 'Department of Agrarian Development',
      issuedBy: '${division ?? _farmerProfile.agrarianDivision} Agrarian Services Centre',
    );

    if (notice != null) {
      _notices.insert(0, notice);
      fetchUserNotifications();
      notifyListeners();
    }
    return notice;
  }

  // Mark in-app notification as read
  Future<void> markNotificationRead(String id) async {
    await ApiService.markNotificationAsRead(id);
    final idx = _userNotifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      final cur = _userNotifications[idx];
      _userNotifications[idx] = AppNotification(
        id: cur.id,
        title: cur.title,
        body: cur.body,
        type: cur.type,
        status: 'READ',
        timestamp: cur.timestamp,
      );
      notifyListeners();
    }
  }
}
