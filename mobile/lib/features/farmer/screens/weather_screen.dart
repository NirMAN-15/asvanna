import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_state_provider.dart';
import '../../../core/localization/app_translations.dart';
import '../../../core/models/weather_model.dart';
import '../../../core/services/mock_data_service.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  final List<String> _divisions = [
    'Bandarawela',
    'Nuwara Eliya',
    'Welimada',
    'Badulla',
    'Keppetipola',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final appState = Provider.of<AppStateProvider>(context, listen: false);
      if (appState.currentWeather == null) {
        appState.fetchWeatherData();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);
    final isDark = context.isDarkMode;
    final lang = appState.currentLanguage;
    String tr(String key) => AppTranslations.tr(lang, key);

    final selectedDiv = appState.selectedWeatherDivision;
    final weatherData = appState.currentWeather ?? MockDataService.getFallbackWeatherData(selectedDiv);
    final hourly = weatherData.hourly;
    final diseases = weatherData.diseases;
    final forecast = weatherData.forecast;
    final isLoading = appState.isLoadingWeather;

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
        actions: [
          IconButton(
            icon: isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  )
                : const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Weather',
            onPressed: isLoading
                ? null
                : () => appState.fetchWeatherData(division: selectedDiv),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.asvannaButtonGreen,
        onRefresh: () async {
          await appState.fetchWeatherData(division: selectedDiv);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Division Selector Chips
              SizedBox(
                height: 42,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _divisions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final div = _divisions[index];
                    final isSel = selectedDiv.toLowerCase() == div.toLowerCase();
                    return ChoiceChip(
                      label: Text(div),
                      selected: isSel,
                      selectedColor: isDark ? const Color(0xFF16A34A) : AppColors.primary,
                      backgroundColor: context.cardBg,
                      labelStyle: TextStyle(
                        color: isSel ? Colors.white : context.titleText,
                        fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                      ),
                      onSelected: (val) {
                        if (val) {
                          appState.setWeatherDivision(div);
                        }
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 14),

              // 2. Hero Weather Card
              _buildHeroWeatherCard(context, weatherData, selectedDiv, tr),
              const SizedBox(height: 18),

              // 3. Hourly Forecast Carousel
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    tr('hourly_forecast'),
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: context.titleText,
                    ),
                  ),
                  if (isLoading)
                    Text(
                      'Syncing...',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              _buildHourlyCarousel(context, hourly, isDark),
              const SizedBox(height: 22),

              // 4. Crop Disease Vulnerability Index
              Text(
                tr('disease_advisories'),
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: context.titleText,
                ),
              ),
              const SizedBox(height: 10),
              ...diseases.map((d) => _buildDiseaseCard(context, d)),

              // 5. 7-Day Agricultural Forecast Outlook (if available)
              if (forecast.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text(
                  '7-Day Agricultural Outlook',
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: context.titleText,
                  ),
                ),
                const SizedBox(height: 10),
                _build7DayOutlook(context, forecast.take(7).toList(), isDark),
              ],

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // Hero Weather Card
  Widget _buildHeroWeatherCard(
    BuildContext context,
    WeatherData weatherData,
    String selectedDivision,
    String Function(String) tr,
  ) {
    final current = weatherData.current;
    final loc = weatherData.location;
    final isNuwaraEliya = selectedDivision.toLowerCase().contains('nuwara');

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isNuwaraEliya
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
                    '${loc.name} Division',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    current.elevation,
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
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4ADE80),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      weatherData.source == 'OPEN_METEO_LIVE' ? tr('radar_synced') : 'Cached Model',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(current.emoji, style: const TextStyle(fontSize: 48)),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    current.temp,
                    style: GoogleFonts.poppins(
                      fontSize: 38,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    current.condition,
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
              _buildWeatherStat('Rain Prob', current.rainProb, Icons.water_drop_outlined),
              _buildWeatherStat('Humidity', current.humidity, Icons.waves_outlined),
              _buildWeatherStat('Wind', current.wind, Icons.air),
              _buildWeatherStat('Ag Score', current.frostRisk ?? current.agScore, Icons.eco_outlined),
            ],
          ),
        ],
      ),
    );
  }

  // Hourly Carousel
  Widget _buildHourlyCarousel(BuildContext context, List<HourlyForecast> hourly, bool isDark) {
    if (hourly.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        alignment: Alignment.center,
        child: Text('Hourly forecast synchronizing...', style: TextStyle(color: context.subText)),
      );
    }

    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: hourly.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          final h = hourly[i];
          final isHighRain = h.rainProb > 50;
          return Container(
            width: 74,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
            decoration: BoxDecoration(
              color: context.cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: context.cardBorder),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text(h.time, style: GoogleFonts.inter(fontSize: 11, color: context.mutedText)),
                Text(h.icon, style: const TextStyle(fontSize: 18)),
                Text(
                  h.temp,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: context.titleText,
                  ),
                ),
                Text(
                  h.rain,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isHighRain
                        ? AppColors.riskCritical
                        : (isDark ? const Color(0xFF4ADE80) : AppColors.primary),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // Disease Card
  Widget _buildDiseaseCard(BuildContext context, DiseaseAdvisory d) {
    final color = d.color;
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
                    Expanded(
                      child: Text(
                        d.name,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: context.titleText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        d.risk,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  d.advice,
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
  }

  // 7-Day Outlook
  Widget _build7DayOutlook(BuildContext context, List<DailyForecast> forecast, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: context.cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.cardBorder),
      ),
      child: Column(
        children: forecast.map((f) {
          String dayLabel = f.date;
          try {
            final dt = DateTime.parse(f.date);
            dayLabel = DateFormat('EEE, d MMM').format(dt);
          } catch (_) {}

          final agScore = f.agriculturalScores?.suitabilityScore ?? 85;

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: context.cardBorder.withValues(alpha: 0.5))),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 90,
                  child: Text(
                    dayLabel,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: context.titleText,
                    ),
                  ),
                ),
                Text(f.emoji, style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    f.condition,
                    style: GoogleFonts.inter(fontSize: 11.5, color: context.subText),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  '${f.tempMin.round()}° / ${f.tempMax.round()}°C',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: context.titleText,
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: agScore >= 75
                        ? const Color(0xFF16A34A).withValues(alpha: 0.12)
                        : const Color(0xFFD97706).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '$agScore%',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: agScore >= 75
                          ? const Color(0xFF16A34A)
                          : const Color(0xFFD97706),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
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
