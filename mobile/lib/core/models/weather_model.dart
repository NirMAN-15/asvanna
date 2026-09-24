import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class WeatherLocation {
  final String name;
  final String district;
  final String province;
  final int elevationMeters;
  final String elevationText;
  final double latitude;
  final double longitude;

  WeatherLocation({
    required this.name,
    required this.district,
    required this.province,
    required this.elevationMeters,
    required this.elevationText,
    required this.latitude,
    required this.longitude,
  });

  factory WeatherLocation.fromJson(Map<String, dynamic> json) {
    return WeatherLocation(
      name: json['name']?.toString() ?? 'Bandarawela',
      district: json['district']?.toString() ?? 'Badulla',
      province: json['province']?.toString() ?? 'Uva',
      elevationMeters: (json['elevationMeters'] is num) ? (json['elevationMeters'] as num).toInt() : 1230,
      elevationText: json['elevationText']?.toString() ?? '${json['elevationMeters'] ?? 1230}m • ${json['district'] ?? 'Badulla'} District',
      latitude: (json['latitude'] is num) ? (json['latitude'] as num).toDouble() : 6.8304,
      longitude: (json['longitude'] is num) ? (json['longitude'] as num).toDouble() : 80.9878,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'district': district,
    'province': province,
    'elevationMeters': elevationMeters,
    'elevationText': elevationText,
    'latitude': latitude,
    'longitude': longitude,
  };
}

class AgriculturalScores {
  final double tempScore;
  final double rainScore;
  final double diseaseScore;
  final int suitabilityScore;
  final int weatherRiskScore;

  AgriculturalScores({
    required this.tempScore,
    required this.rainScore,
    required this.diseaseScore,
    required this.suitabilityScore,
    required this.weatherRiskScore,
  });

  factory AgriculturalScores.fromJson(Map<String, dynamic> json) {
    return AgriculturalScores(
      tempScore: (json['tempScore'] is num) ? (json['tempScore'] as num).toDouble() : 90.0,
      rainScore: (json['rainScore'] is num) ? (json['rainScore'] as num).toDouble() : 90.0,
      diseaseScore: (json['diseaseScore'] is num) ? (json['diseaseScore'] as num).toDouble() : 80.0,
      suitabilityScore: (json['suitabilityScore'] is num) ? (json['suitabilityScore'] as num).toInt() : 85,
      weatherRiskScore: (json['weatherRiskScore'] is num) ? (json['weatherRiskScore'] as num).toInt() : 15,
    );
  }

  Map<String, dynamic> toJson() => {
    'tempScore': tempScore,
    'rainScore': rainScore,
    'diseaseScore': diseaseScore,
    'suitabilityScore': suitabilityScore,
    'weatherRiskScore': weatherRiskScore,
  };
}

class DiseaseAdvisory {
  final String name;
  final String risk;
  final String? colorHex;
  final String advice;

  DiseaseAdvisory({
    required this.name,
    required this.risk,
    this.colorHex,
    required this.advice,
  });

  factory DiseaseAdvisory.fromJson(Map<String, dynamic> json) {
    return DiseaseAdvisory(
      name: json['name']?.toString() ?? '',
      risk: json['risk']?.toString() ?? 'Safe',
      colorHex: json['color']?.toString(),
      advice: json['advice']?.toString() ?? '',
    );
  }

  Color get color {
    if (colorHex != null && colorHex!.startsWith('#')) {
      final hex = colorHex!.replaceFirst('#', '');
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      }
    }
    final r = risk.toLowerCase();
    if (r.contains('critical') || r.contains('frost') || r.contains('severe') || r.contains('high')) {
      return AppColors.riskCritical;
    } else if (r.contains('mod') || r.contains('warning') || r.contains('caution')) {
      return AppColors.riskModerate;
    }
    return AppColors.riskSafe;
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'risk': risk,
    'color': colorHex,
    'advice': advice,
  };
}

class HourlyForecast {
  final String time;
  final String temp;
  final double tempValue;
  final String icon;
  final String rain;
  final int rainProb;
  final int humidity;

  HourlyForecast({
    required this.time,
    required this.temp,
    required this.tempValue,
    required this.icon,
    required this.rain,
    required this.rainProb,
    required this.humidity,
  });

  factory HourlyForecast.fromJson(Map<String, dynamic> json) {
    final rainRaw = json['rain']?.toString() ?? '${json['rainProb'] ?? 0}%';
    final rainClean = int.tryParse(rainRaw.replaceAll('%', '')) ?? (json['rainProb'] is num ? (json['rainProb'] as num).toInt() : 0);
    final tempVal = (json['tempValue'] is num)
        ? (json['tempValue'] as num).toDouble()
        : (double.tryParse(json['temp']?.toString().replaceAll('°C', '') ?? '20') ?? 20.0);

    return HourlyForecast(
      time: json['time']?.toString() ?? '12:00',
      temp: json['temp']?.toString() ?? '${tempVal.round()}°C',
      tempValue: tempVal,
      icon: json['icon']?.toString() ?? '⛅',
      rain: rainRaw,
      rainProb: rainClean,
      humidity: (json['humidity'] is num) ? (json['humidity'] as num).toInt() : 75,
    );
  }

  Map<String, dynamic> toJson() => {
    'time': time,
    'temp': temp,
    'tempValue': tempValue,
    'icon': icon,
    'rain': rain,
    'rainProb': rainProb,
    'humidity': humidity,
  };
}

class DailyForecast {
  final String date;
  final String temp;
  final double tempMin;
  final double tempMax;
  final double tempAvg;
  final int humidityAvg;
  final double rainfallMm;
  final double windSpeedMax;
  final int precipitationProbability;
  final String rainProb;
  final String condition;
  final String emoji;
  final AgriculturalScores? agriculturalScores;

  DailyForecast({
    required this.date,
    required this.temp,
    required this.tempMin,
    required this.tempMax,
    required this.tempAvg,
    required this.humidityAvg,
    required this.rainfallMm,
    required this.windSpeedMax,
    required this.precipitationProbability,
    required this.rainProb,
    required this.condition,
    required this.emoji,
    this.agriculturalScores,
  });

  factory DailyForecast.fromJson(Map<String, dynamic> json) {
    final tMin = (json['tempMin'] is num) ? (json['tempMin'] as num).toDouble() : 15.0;
    final tMax = (json['tempMax'] is num) ? (json['tempMax'] as num).toDouble() : 24.0;
    final tAvg = (json['tempAvg'] is num) ? (json['tempAvg'] as num).toDouble() : ((tMin + tMax) / 2);
    final pProb = (json['precipitationProbability'] is num) ? (json['precipitationProbability'] as num).toInt() : 40;

    return DailyForecast(
      date: json['date']?.toString() ?? '',
      temp: json['temp']?.toString() ?? '${tAvg.round()}°C',
      tempMin: tMin,
      tempMax: tMax,
      tempAvg: tAvg,
      humidityAvg: (json['humidityAvg'] is num) ? (json['humidityAvg'] as num).toInt() : 75,
      rainfallMm: (json['rainfallMm'] is num) ? (json['rainfallMm'] as num).toDouble() : 0.0,
      windSpeedMax: (json['windSpeedMax'] is num) ? (json['windSpeedMax'] as num).toDouble() : 12.0,
      precipitationProbability: pProb,
      rainProb: json['rainProb']?.toString() ?? '$pProb%',
      condition: json['condition']?.toString() ?? 'Partly Cloudy',
      emoji: json['emoji']?.toString() ?? '⛅',
      agriculturalScores: json['agriculturalScores'] != null && json['agriculturalScores'] is Map<String, dynamic>
          ? AgriculturalScores.fromJson(json['agriculturalScores'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'date': date,
    'temp': temp,
    'tempMin': tempMin,
    'tempMax': tempMax,
    'tempAvg': tempAvg,
    'humidityAvg': humidityAvg,
    'rainfallMm': rainfallMm,
    'windSpeedMax': windSpeedMax,
    'precipitationProbability': precipitationProbability,
    'rainProb': rainProb,
    'condition': condition,
    'emoji': emoji,
    'agriculturalScores': agriculturalScores?.toJson(),
  };
}

class CurrentWeather {
  final String date;
  final String temp;
  final double tempMin;
  final double tempMax;
  final double tempAvg;
  final String humidity;
  final int humidityAvg;
  final double rainfallMm;
  final String wind;
  final double windSpeedMax;
  final String rainProb;
  final int precipitationProbability;
  final String condition;
  final String emoji;
  final String elevation;
  final String agScore;
  final String? frostRisk;
  final AgriculturalScores? agriculturalScores;

  CurrentWeather({
    required this.date,
    required this.temp,
    required this.tempMin,
    required this.tempMax,
    required this.tempAvg,
    required this.humidity,
    required this.humidityAvg,
    required this.rainfallMm,
    required this.wind,
    required this.windSpeedMax,
    required this.rainProb,
    required this.precipitationProbability,
    required this.condition,
    required this.emoji,
    required this.elevation,
    required this.agScore,
    this.frostRisk,
    this.agriculturalScores,
  });

  factory CurrentWeather.fromJson(Map<String, dynamic> json) {
    final tMin = (json['tempMin'] is num) ? (json['tempMin'] as num).toDouble() : 15.0;
    final tMax = (json['tempMax'] is num) ? (json['tempMax'] as num).toDouble() : 24.0;
    final tAvg = (json['tempAvg'] is num) ? (json['tempAvg'] as num).toDouble() : ((tMin + tMax) / 2);
    final humVal = (json['humidityAvg'] is num)
        ? (json['humidityAvg'] as num).toInt()
        : (int.tryParse(json['humidity']?.toString().replaceAll('%', '') ?? '75') ?? 75);
    final rainProbVal = (json['precipitationProbability'] is num)
        ? (json['precipitationProbability'] as num).toInt()
        : (int.tryParse(json['rainProb']?.toString().replaceAll('%', '') ?? '40') ?? 40);
    final windSpeed = (json['windSpeedMax'] is num)
        ? (json['windSpeedMax'] as num).toDouble()
        : (double.tryParse(json['wind']?.toString().replaceAll(RegExp(r'[^0-9.]'), '') ?? '14') ?? 14.0);

    return CurrentWeather(
      date: json['date']?.toString() ?? DateTime.now().toIso8601String().split('T')[0],
      temp: json['temp']?.toString() ?? '${tAvg.round()}°C',
      tempMin: tMin,
      tempMax: tMax,
      tempAvg: tAvg,
      humidity: json['humidity']?.toString() ?? '$humVal%',
      humidityAvg: humVal,
      rainfallMm: (json['rainfallMm'] is num) ? (json['rainfallMm'] as num).toDouble() : 0.0,
      wind: json['wind']?.toString() ?? '${windSpeed.round()} km/h',
      windSpeedMax: windSpeed,
      rainProb: json['rainProb']?.toString() ?? '$rainProbVal%',
      precipitationProbability: rainProbVal,
      condition: json['condition']?.toString() ?? 'Partly Cloudy',
      emoji: json['emoji']?.toString() ?? '⛅',
      elevation: json['elevation']?.toString() ?? '1,230m • Badulla District',
      agScore: json['agScore']?.toString() ?? '88/100 (Safe)',
      frostRisk: json['frostRisk']?.toString(),
      agriculturalScores: json['agriculturalScores'] != null && json['agriculturalScores'] is Map<String, dynamic>
          ? AgriculturalScores.fromJson(json['agriculturalScores'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'date': date,
    'temp': temp,
    'tempMin': tempMin,
    'tempMax': tempMax,
    'tempAvg': tempAvg,
    'humidity': humidity,
    'humidityAvg': humidityAvg,
    'rainfallMm': rainfallMm,
    'wind': wind,
    'windSpeedMax': windSpeedMax,
    'rainProb': rainProb,
    'precipitationProbability': precipitationProbability,
    'condition': condition,
    'emoji': emoji,
    'elevation': elevation,
    'agScore': agScore,
    'frostRisk': frostRisk,
    'agriculturalScores': agriculturalScores?.toJson(),
  };
}

class WeatherData {
  final WeatherLocation location;
  final CurrentWeather current;
  final List<HourlyForecast> hourly;
  final List<DailyForecast> forecast;
  final List<DiseaseAdvisory> diseases;
  final String fetchedAt;
  final String source;

  WeatherData({
    required this.location,
    required this.current,
    required this.hourly,
    required this.forecast,
    required this.diseases,
    required this.fetchedAt,
    required this.source,
  });

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    final locData = json['location'] as Map<String, dynamic>? ?? {};
    final curData = json['current'] as Map<String, dynamic>? ?? {};
    final hourlyList = (json['hourly'] as List<dynamic>?) ?? [];
    final forecastList = (json['forecast'] as List<dynamic>?) ?? [];
    final diseaseList = (json['diseases'] as List<dynamic>?) ?? [];

    return WeatherData(
      location: WeatherLocation.fromJson(locData),
      current: CurrentWeather.fromJson(curData),
      hourly: hourlyList.map((h) => HourlyForecast.fromJson(h as Map<String, dynamic>)).toList(),
      forecast: forecastList.map((f) => DailyForecast.fromJson(f as Map<String, dynamic>)).toList(),
      diseases: diseaseList.map((d) => DiseaseAdvisory.fromJson(d as Map<String, dynamic>)).toList(),
      fetchedAt: json['fetchedAt']?.toString() ?? DateTime.now().toIso8601String(),
      source: json['source']?.toString() ?? 'OPEN_METEO_LIVE',
    );
  }

  Map<String, dynamic> toJson() => {
    'location': location.toJson(),
    'current': current.toJson(),
    'hourly': hourly.map((h) => h.toJson()).toList(),
    'forecast': forecast.map((f) => f.toJson()).toList(),
    'diseases': diseases.map((d) => d.toJson()).toList(),
    'fetchedAt': fetchedAt,
    'source': source,
  };
}
