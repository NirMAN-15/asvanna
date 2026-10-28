class ProcurementPreferences {
  final List<String> preferredCategories;
  final List<String> preferredCrops;
  final double weeklyCapacityKg;
  final double maxRadiusKm;
  final String frequency; // 'Daily', '2-3 Times a Week', 'Weekly', 'Bi-weekly'
  final String qualityGrade; // 'Grade A (Export / Star Hotel)', 'Grade B (Standard Retail)', 'Any Fresh Harvest'
  final String deliveryMode; // 'Farmgate Direct Pickup', 'Farmer Delivery to Store', 'Flexible'
  final bool autoAlertOnSurplus;
  final double? minPriceAlert;

  const ProcurementPreferences({
    required this.preferredCategories,
    required this.preferredCrops,
    required this.weeklyCapacityKg,
    required this.maxRadiusKm,
    required this.frequency,
    required this.qualityGrade,
    required this.deliveryMode,
    this.autoAlertOnSurplus = true,
    this.minPriceAlert,
  });

  factory ProcurementPreferences.defaultPreferences() {
    return const ProcurementPreferences(
      preferredCategories: ['Upcountry Vegetables', 'Root Vegetables'],
      preferredCrops: ['Carrot', 'Leeks', 'Potato', 'Beetroot', 'Cabbage'],
      weeklyCapacityKg: 1500,
      maxRadiusKm: 5.0,
      frequency: 'Weekly',
      qualityGrade: 'Grade A (Export / Star Hotel)',
      deliveryMode: 'Farmgate Direct Pickup',
      autoAlertOnSurplus: true,
      minPriceAlert: null,
    );
  }

  ProcurementPreferences copyWith({
    List<String>? preferredCategories,
    List<String>? preferredCrops,
    double? weeklyCapacityKg,
    double? maxRadiusKm,
    String? frequency,
    String? qualityGrade,
    String? deliveryMode,
    bool? autoAlertOnSurplus,
    double? minPriceAlert,
  }) {
    return ProcurementPreferences(
      preferredCategories: preferredCategories ?? this.preferredCategories,
      preferredCrops: preferredCrops ?? this.preferredCrops,
      weeklyCapacityKg: weeklyCapacityKg ?? this.weeklyCapacityKg,
      maxRadiusKm: maxRadiusKm ?? this.maxRadiusKm,
      frequency: frequency ?? this.frequency,
      qualityGrade: qualityGrade ?? this.qualityGrade,
      deliveryMode: deliveryMode ?? this.deliveryMode,
      autoAlertOnSurplus: autoAlertOnSurplus ?? this.autoAlertOnSurplus,
      minPriceAlert: minPriceAlert ?? this.minPriceAlert,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'preferredCategories': preferredCategories,
      'preferredCrops': preferredCrops,
      'weeklyCapacityKg': weeklyCapacityKg,
      'maxRadiusKm': maxRadiusKm,
      'frequency': frequency,
      'qualityGrade': qualityGrade,
      'deliveryMode': deliveryMode,
      'autoAlertOnSurplus': autoAlertOnSurplus,
      'minPriceAlert': minPriceAlert,
    };
  }

  factory ProcurementPreferences.fromJson(Map<String, dynamic> json) {
    return ProcurementPreferences(
      preferredCategories: (json['preferredCategories'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Upcountry Vegetables', 'Root Vegetables'],
      preferredCrops: (json['preferredCrops'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Carrot', 'Leeks', 'Potato', 'Beetroot', 'Cabbage'],
      weeklyCapacityKg: (json['weeklyCapacityKg'] as num?)?.toDouble() ?? 1500.0,
      maxRadiusKm: (json['maxRadiusKm'] as num?)?.toDouble() ?? 5.0,
      frequency: json['frequency']?.toString() ?? 'Weekly',
      qualityGrade: json['qualityGrade']?.toString() ?? 'Grade A (Export / Star Hotel)',
      deliveryMode: json['deliveryMode']?.toString() ?? 'Farmgate Direct Pickup',
      autoAlertOnSurplus: json['autoAlertOnSurplus'] as bool? ?? true,
      minPriceAlert: (json['minPriceAlert'] as num?)?.toDouble(),
    );
  }
}

class NotificationSettingsModel {
  final bool surplusAlerts5km;
  final bool orderStatusAlerts;
  final bool priceAlerts;
  final bool urgentAdvisories;
  final bool pushSound;

  const NotificationSettingsModel({
    this.surplusAlerts5km = true,
    this.orderStatusAlerts = true,
    this.priceAlerts = true,
    this.urgentAdvisories = true,
    this.pushSound = true,
  });

  factory NotificationSettingsModel.defaultSettings() {
    return const NotificationSettingsModel(
      surplusAlerts5km: true,
      orderStatusAlerts: true,
      priceAlerts: true,
      urgentAdvisories: true,
      pushSound: true,
    );
  }

  NotificationSettingsModel copyWith({
    bool? surplusAlerts5km,
    bool? orderStatusAlerts,
    bool? priceAlerts,
    bool? urgentAdvisories,
    bool? pushSound,
  }) {
    return NotificationSettingsModel(
      surplusAlerts5km: surplusAlerts5km ?? this.surplusAlerts5km,
      orderStatusAlerts: orderStatusAlerts ?? this.orderStatusAlerts,
      priceAlerts: priceAlerts ?? this.priceAlerts,
      urgentAdvisories: urgentAdvisories ?? this.urgentAdvisories,
      pushSound: pushSound ?? this.pushSound,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'surplusAlerts5km': surplusAlerts5km,
      'orderStatusAlerts': orderStatusAlerts,
      'priceAlerts': priceAlerts,
      'urgentAdvisories': urgentAdvisories,
      'pushSound': pushSound,
    };
  }

  factory NotificationSettingsModel.fromJson(Map<String, dynamic> json) {
    return NotificationSettingsModel(
      surplusAlerts5km: json['surplusAlerts5km'] as bool? ?? true,
      orderStatusAlerts: json['orderStatusAlerts'] as bool? ?? true,
      priceAlerts: json['priceAlerts'] as bool? ?? true,
      urgentAdvisories: json['urgentAdvisories'] as bool? ?? true,
      pushSound: json['pushSound'] as bool? ?? true,
    );
  }
}
