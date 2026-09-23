import 'package:flutter_test/flutter_test.dart';
import 'package:asvanna_app/core/models/weather_model.dart';
import 'package:asvanna_app/core/services/mock_data_service.dart';

void main() {
  group('Weather Model & Offline Intelligence Tests', () {
    test('WeatherData fromJson and fallback parsing works correctly', () {
      final fallback = MockDataService.getFallbackWeatherData('Bandarawela');
      expect(fallback.location.name, 'Bandarawela');
      expect(fallback.location.district, 'Badulla');
      expect(fallback.current.temp, '21°C');
      expect(fallback.hourly.length, greaterThanOrEqualTo(4));
      expect(fallback.diseases.isNotEmpty, true);
    });

    test('Nuwara Eliya fallback detects frost alert and low temp', () {
      final nuwara = MockDataService.getFallbackWeatherData('Nuwara Eliya');
      expect(nuwara.location.name, 'Nuwara Eliya');
      expect(nuwara.location.elevationMeters, 1868);
      expect(nuwara.current.frostRisk, isNotNull);
      expect(nuwara.diseases.any((d) => d.name.contains('Frost')), true);
    });

    test('Welimada fallback provides agricultural scores', () {
      final welimada = MockDataService.getFallbackWeatherData('Welimada');
      expect(welimada.location.name, 'Welimada');
      expect(welimada.current.agriculturalScores, isNotNull);
      expect(welimada.current.agriculturalScores!.suitabilityScore, greaterThan(80));
    });

    test('WeatherData deserializes live backend JSON payload structure', () {
      final jsonPayload = {
        'location': {
          'name': 'Bandarawela',
          'district': 'Badulla',
          'province': 'Uva',
          'elevationMeters': 1230,
          'elevationText': '1,230m • Badulla District',
          'latitude': 6.8304,
          'longitude': 80.9878,
        },
        'current': {
          'date': '2026-09-24',
          'temp': '22°C',
          'tempMin': 15.0,
          'tempMax': 24.5,
          'tempAvg': 19.8,
          'humidity': '82%',
          'humidityAvg': 82,
          'rainfallMm': 3.4,
          'wind': '12 km/h',
          'windSpeedMax': 12.0,
          'rainProb': '65%',
          'precipitationProbability': 65,
          'condition': 'Scattered Showers',
          'emoji': '🌧️',
          'elevation': '1,230m • Badulla District',
          'agScore': '88/100 (Safe)',
          'agriculturalScores': {
            'tempScore': 95.0,
            'rainScore': 85.0,
            'diseaseScore': 80.0,
            'suitabilityScore': 88,
            'weatherRiskScore': 12,
          }
        },
        'hourly': [
          {
            'time': '06:00',
            'temp': '16°C',
            'tempValue': 16.0,
            'icon': '⛅',
            'rain': '10%',
            'rainProb': 10,
            'humidity': 85,
          },
          {
            'time': '12:00',
            'temp': '23°C',
            'tempValue': 23.0,
            'icon': '🌧️',
            'rain': '65%',
            'rainProb': 65,
            'humidity': 78,
          }
        ],
        'forecast': [
          {
            'date': '2026-09-24',
            'temp': '22°C',
            'tempMin': 15.0,
            'tempMax': 24.5,
            'tempAvg': 19.8,
            'humidityAvg': 82,
            'rainfallMm': 3.4,
            'windSpeedMax': 12.0,
            'precipitationProbability': 65,
            'rainProb': '65%',
            'condition': 'Scattered Showers',
            'emoji': '🌧️',
          }
        ],
        'diseases': [
          {
            'name': 'Late Blight (තක්කාලි/අල පාළු රෝගය)',
            'risk': 'High Risk',
            'color': '#DC2626',
            'advice': 'High humidity (82%). Avoid overhead irrigation.',
          }
        ],
        'fetchedAt': '2026-09-24T00:00:00.000Z',
        'source': 'OPEN_METEO_LIVE',
      };

      final data = WeatherData.fromJson(jsonPayload);
      expect(data.location.name, 'Bandarawela');
      expect(data.current.temp, '22°C');
      expect(data.current.emoji, '🌧️');
      expect(data.hourly.length, 2);
      expect(data.forecast.length, 1);
      expect(data.diseases.length, 1);
      expect(data.diseases.first.name, contains('Late Blight'));
      expect(data.source, 'OPEN_METEO_LIVE');
    });
  });
}
