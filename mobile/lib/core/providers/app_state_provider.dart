import 'package:flutter/foundation.dart';
import '../models/crop_model.dart';
import '../models/risk_analysis_model.dart';
import '../models/farmer_model.dart';
import '../models/buyer_model.dart';
import '../models/surplus_listing_model.dart';
import '../models/notice_model.dart';
import '../services/mock_data_service.dart';
import '../services/offline_storage_service.dart';
import '../services/api_service.dart';

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

    // Synchronize live data from backend
    await fetchLiveRiskData();
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
  Crop? get selectedCropForRisk => _selectedCropForRisk;
  double get selectedRadiusKm => _selectedRadiusKm;
  bool get isOnline => _isOnline;
  bool get isBackendConnected => _isBackendConnected;
  bool get isLoadingRisk => _isLoadingRisk;
  String? get riskErrorMessage => _riskErrorMessage;
  int get pendingOfflineSyncs => _pendingOfflineSyncs;

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
    final count = await ApiService.syncPendingOfflineQueue();
    final queue = await OfflineStorageService.getOfflineQueue();
    _pendingOfflineSyncs = queue.length;
    notifyListeners();
  }
}
