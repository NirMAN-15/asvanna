import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function WeatherDashboard() {
  const { role } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [weather, setWeather] = useState({
    location: { name: 'Bandarawela', district: 'Badulla', elevationText: '1,230m • Badulla District' },
    current: { temp: '23°C', tempMin: 19.4, tempMax: 26.0, humidityAvg: 82, rainfallMm: 0.8, rainProb: '45%', condition: 'Scattered Showers', emoji: '🌦️' },
    forecast: [
      { date: '2026-09-25', dayOfWeek: 'Today', tempMin: 19.4, tempMax: 26.0, rainProb: '45%', rainfallMm: 0.8, condition: 'Scattered Showers', emoji: '🌦️' },
      { date: '2026-09-26', dayOfWeek: 'Sat', tempMin: 18.5, tempMax: 25.2, rainProb: '30%', rainfallMm: 0.2, condition: 'Partly Cloudy', emoji: '⛅' },
      { date: '2026-09-27', dayOfWeek: 'Sun', tempMin: 17.8, tempMax: 24.8, rainProb: '20%', rainfallMm: 0.0, condition: 'Sunny & Clear', emoji: '☀️' },
      { date: '2026-09-28', dayOfWeek: 'Mon', tempMin: 18.0, tempMax: 25.0, rainProb: '55%', rainfallMm: 2.4, condition: 'Afternoon Rain', emoji: '🌧️' },
      { date: '2026-09-29', dayOfWeek: 'Tue', tempMin: 19.0, tempMax: 26.1, rainProb: '60%', rainfallMm: 4.1, condition: 'Heavy Showers', emoji: '⛈️' },
      { date: '2026-09-30', dayOfWeek: 'Wed', tempMin: 18.2, tempMax: 24.5, rainProb: '35%', rainfallMm: 0.5, condition: 'Partly Cloudy', emoji: '⛅' },
      { date: '2026-10-01', dayOfWeek: 'Thu', tempMin: 17.5, tempMax: 23.9, rainProb: '15%', rainfallMm: 0.0, condition: 'Sunny & Dry', emoji: '☀️' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState({ date: '2026-09-25', dayOfWeek: 'Today', tempMin: 19.4, tempMax: 26.0, rainProb: '45%', rainfallMm: 0.8, condition: 'Scattered Showers', emoji: '🌦️' });

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/weather/forecast?days=14');
      if (res.data && res.data.data) {
        setWeather(res.data.data);
        if (res.data.data.forecast && res.data.data.forecast.length > 0) {
          setSelectedDay(res.data.data.forecast[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">cloud</span>
            <span>{t('met_station_label', 'Bandarawela Agro-Meteorological Station (1,216m)')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">{t('climate_forecast_title', '14-Day Agricultural Climate Forecast')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('climate_forecast_subtitle', 'Live Open-Meteo data calibrated for upcountry vegetable cultivation')}
          </p>
        </div>

        <button
          onClick={fetchWeatherData}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-variant transition"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          {t('refresh_forecast', 'Refresh Forecast')}
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">
          <div className="text-3xl mb-2">🌦️</div>
          <p>{t('loading_weather_telemetry', 'Connecting to Bandarawela weather telemetry...')}</p>
        </div>
      ) : weather ? (
        <div className="space-y-8">
          {/* Current Conditions Card */}
          {selectedDay && (
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-3xl border border-outline-variant/30 p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Temp & Date */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {selectedDay.date === weather.forecast[0]?.date ? t('today', 'Today') : selectedDay.date} • Bandarawela
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-black text-primary">{Math.round(selectedDay.tempAvg)}°C</span>
                    <span className="text-sm text-on-surface-variant">
                      Min {Math.round(selectedDay.tempMin)}° / Max {Math.round(selectedDay.tempMax)}°
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {t('upcountry_zone_label', 'Intermediate Upcountry Zone • Elev. 1,216m')}
                  </div>
                </div>

                {/* Weather Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                      <span className="material-symbols-outlined text-sm text-blue-500">water_drop</span>
                      <span>{t('rainfall', 'Rainfall')}</span>
                    </div>
                    <div className="text-lg font-bold text-on-surface">{selectedDay.rainfallMm} mm</div>
                    <div className="text-[10px] text-on-surface-variant">{t('rain_prob', 'Prob')}: {selectedDay.precipitationProbability}%</div>
                  </div>

                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                      <span className="material-symbols-outlined text-sm text-teal-500">humidity_percentage</span>
                      <span>{t('humidity', 'Humidity')}</span>
                    </div>
                    <div className="text-lg font-bold text-on-surface">{selectedDay.humidityAvg}%</div>
                    <div className="text-[10px] text-on-surface-variant">{t('fungal_risk', 'Fungal risk')}: {selectedDay.humidityAvg > 85 ? t('high', 'High') : t('normal', 'Normal')}</div>
                  </div>

                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                      <span className="material-symbols-outlined text-sm text-amber-500">air</span>
                      <span>{t('wind_speed', 'Wind Speed')}</span>
                    </div>
                    <div className="text-lg font-bold text-on-surface">{selectedDay.windSpeedMax} km/h</div>
                    <div className="text-[10px] text-on-surface-variant">{t('valley_breeze', 'Valley breeze')}</div>
                  </div>

                  <div className="p-3 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                      <span className="material-symbols-outlined text-sm text-primary">eco</span>
                      <span>{t('ag_suitability', 'Ag Suitability')}</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {selectedDay.agriculturalScores?.suitabilityScore || 85}%
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      {t('risk_label', 'Risk')}: {selectedDay.agriculturalScores?.weatherRiskScore || 15}/100
                    </div>
                  </div>
                </div>

                {/* Agricultural Advisory */}
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>Agronomic Guidance</span>
                  </div>
                  <p className="text-xs text-on-surface leading-relaxed">
                    {selectedDay.rainfallMm > 25
                      ? '⚠️ High rainfall expected: clear ridge drains in carrot/potato beds to prevent water accumulation.'
                      : selectedDay.humidityAvg > 85
                      ? '⚠️ Elevated humidity (>85%): monitor tomato and potato crops closely for signs of late blight fungal infection.'
                      : '✅ Favorable temperature window (15-24°C) for seedling transplanting and fertilizer top-dressing in Bandarawela.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 14-Day Horizontal Scroll Cards */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface">14-Day Timeline</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {(weather.forecast || []).map((day, idx) => {
                const isSelected = selectedDay && selectedDay.date === day.date;
                const isRainy = day.rainfallMm > 10;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary shadow-md scale-105 z-10'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <div className="text-[11px] font-semibold opacity-80 mb-1">
                      {idx === 0 ? 'Today' : day.date.slice(5)}
                    </div>
                    <div className="text-xl font-black mb-2">{Math.round(day.tempAvg)}°C</div>
                    <div className="space-y-1 text-[11px] opacity-90">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">water_drop</span>
                        <span>{day.rainfallMm} mm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">shield</span>
                        <span>Ag: {day.agriculturalScores?.suitabilityScore || 85}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
