import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  String _selectedDivision = 'Bandarawela';

  final Map<String, Map<String, dynamic>> _divisionWeatherData = {
    'Bandarawela': {
      'temp': '21°C',
      'condition': 'Scattered Afternoon Showers',
      'emoji': '⛅',
      'elevation': '1,230m • Badulla District',
      'rainProb': '75%',
      'humidity': '84%',
      'wind': '14 km/h',
      'agScore': '88/100 (Safe)',
      'hourly': [
        {'time': '06:00', 'temp': '15°C', 'icon': '⛅', 'rain': '10%'},
        {'time': '09:00', 'temp': '19°C', 'icon': '☀️', 'rain': '15%'},
        {'time': '12:00', 'temp': '23°C', 'icon': '⛅', 'rain': '35%'},
        {'time': '15:00', 'temp': '21°C', 'icon': '🌧️', 'rain': '80%'},
        {'time': '18:00', 'temp': '18°C', 'icon': '🌧️', 'rain': '70%'},
        {'time': '21:00', 'temp': '16°C', 'icon': '☁️', 'rain': '30%'},
      ],
      'diseases': [
        {
          'name': 'Late Blight (තක්කාලි/අල පාළු රෝගය)',
          'risk': 'High Risk',
          'color': AppColors.riskCritical,
          'advice': 'High humidity (84%) + 14°C night temp. Avoid sprinkler irrigation after 2 PM.',
        },
        {
          'name': 'Downy Mildew (ගෝවා පුස් රෝගය)',
          'risk': 'Moderate',
          'color': AppColors.riskModerate,
          'advice': 'Ensure adequate row ventilation in cabbage nurseries.',
        },
        {
          'name': 'Root Rot (මුල් කුණුවීම)',
          'risk': 'Safe',
          'color': AppColors.riskSafe,
          'advice': 'Soil drainage in Heeloya valley remains within healthy thresholds.',
        },
      ],
    },
    'Nuwara Eliya': {
      'temp': '16°C',
      'condition': 'Mist & Intermittent Drizzle',
      'emoji': '🌧️',
      'elevation': '1,868m • Central Province',
      'rainProb': '85%',
      'humidity': '92%',
      'wind': '18 km/h',
      'frostRisk': 'HIGH RISK (Night: 7°C)',
      'hourly': [
        {'time': '06:00', 'temp': '9°C', 'icon': '🌫️', 'rain': '40%'},
        {'time': '09:00', 'temp': '13°C', 'icon': '⛅', 'rain': '30%'},
        {'time': '12:00', 'temp': '17°C', 'icon': '🌧️', 'rain': '75%'},
        {'time': '15:00', 'temp': '15°C', 'icon': '🌧️', 'rain': '90%'},
        {'time': '18:00', 'temp': '12°C', 'icon': '🌧️', 'rain': '80%'},
        {'time': '21:00', 'temp': '8°C', 'icon': '🌫️', 'rain': '45%'},
      ],
      'diseases': [
        {
          'name': 'Ground Frost Damage (මල් තුෂාර හානිය)',
          'risk': 'Severe Frost Alert',
          'color': AppColors.riskCritical,
          'advice': 'Night temperatures dropping to 7°C. Cover sensitive potato & leek beds with polythene mulch.',
        },
        {
          'name': 'Late Blight (අර්තාපල් පාළු රෝගය)',
          'risk': 'Critical Risk',
          'color': AppColors.riskCritical,
          'advice': 'Persistent leaf wetness. Apply protective copper fungicide when rain stops.',
        },
      ],
    },
    'Welimada': {
      'temp': '24°C',
      'condition': 'Partly Sunny & Mild Breeze',
      'emoji': '☀️',
      'elevation': '1,060m • Uva Province',
      'rainProb': '30%',
      'humidity': '72%',
      'wind': '11 km/h',
      'frostRisk': 'None (Night: 17°C)',
      'hourly': [
        {'time': '06:00', 'temp': '18°C', 'icon': '⛅', 'rain': '5%'},
        {'time': '09:00', 'temp': '22°C', 'icon': '☀️', 'rain': '10%'},
        {'time': '12:00', 'temp': '25°C', 'icon': '🌤️', 'rain': '20%'},
        {'time': '15:00', 'temp': '24°C', 'icon': '⛅', 'rain': '35%'},
        {'time': '18:00', 'temp': '20°C', 'icon': '⛅', 'rain': '25%'},
        {'time': '21:00', 'temp': '17°C', 'icon': '🌙', 'rain': '10%'},
      ],
      'diseases': [
        {
          'name': 'Powdery Mildew (අළු පුස්)',
          'risk': 'Low Risk',
          'color': AppColors.riskSafe,
          'advice': 'Favorable conditions across Welimada plains for beans & capsicum.',
        },
      ],
    },
  };

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final currentData = _divisionWeatherData[_selectedDivision]!;
    final hourly = currentData['hourly'] as List<Map<String, dynamic>>;
    final diseases = currentData['diseases'] as List<Map<String, dynamic>>;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      appBar: AppBar(
        title: Text(
          tr('weather_intelligence'),
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: context.titleText,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Division Selector Chips
            SizedBox(
              height: 42,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: ['Bandarawela', 'Nuwara Eliya', 'Welimada'].map((div) {
                  final isSel = _selectedDivision == div;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(div),
                      selected: isSel,
                      selectedColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
                      backgroundColor: context.cardBg,
                      labelStyle: TextStyle(
                        color: isSel ? Colors.white : context.titleText,
                        fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedDivision = div);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 14),

            // Hero Weather Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _selectedDivision == 'Nuwara Eliya'
                      ? [const Color(0xFF1E293B), const Color(0xFF334155)]
                      : [const Color(0xFF1E3A5F), const Color(0xFF0F766E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1B4F72).withValues(alpha: 0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$_selectedDivision Division',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            currentData['elevation'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          tr('radar_synced'),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(currentData['emoji'] as String, style: const TextStyle(fontSize: 48)),
                      const SizedBox(width: 14),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentData['temp'] as String,
                            style: GoogleFonts.poppins(
                              fontSize: 38,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            currentData['condition'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.95),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white24),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildWeatherStat('Rain Prob', currentData['rainProb'] as String, Icons.water_drop_outlined),
                      _buildWeatherStat('Humidity', currentData['humidity'] as String, Icons.waves_outlined),
                      _buildWeatherStat('Wind', currentData['wind'] as String, Icons.air),
                      _buildWeatherStat('Ag Score', (currentData['agScore'] ?? currentData['frostRisk'] ?? '85/100') as String, Icons.eco_outlined),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Hourly Rain Forecast Carousel
            Text(
              tr('hourly_forecast'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 96,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: hourly.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, i) {
                  final h = hourly[i];
                  return Container(
                    width: 72,
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
                    decoration: BoxDecoration(
                      color: context.cardBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: context.cardBorder),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Text(h['time'] as String, style: GoogleFonts.inter(fontSize: 11, color: context.mutedText)),
                        Text(h['icon'] as String, style: const TextStyle(fontSize: 18)),
                        Text(
                          h['temp'] as String,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: context.titleText,
                          ),
                        ),
                        Text(
                          h['rain'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: (int.tryParse((h['rain'] as String).replaceAll('%', '')) ?? 0) > 50
                                ? AppColors.riskCritical
                                : (isDark ? const Color(0xFF4ADE80) : AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Crop Disease Vulnerability Index
            Text(
              tr('disease_advisories'),
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: context.titleText,
              ),
            ),
            const SizedBox(height: 10),

            ...diseases.map((d) {
              final color = d['color'] as Color;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: context.cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: color.withValues(alpha: 0.3), width: 1.2),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.shield_outlined, color: color, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                d['name'] as String,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: context.titleText,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  d['risk'] as String,
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            d['advice'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: context.subText,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildWeatherStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 16),
        const SizedBox(height: 3),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
      ],
    );
  }
}
