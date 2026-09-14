const axios = require('axios');
const NodeCache = require('node-cache');
const db = require('../config/database');
const config = require('../config/config');

// In-memory cache with 6-hour TTL
const memoryCache = new NodeCache({ stdTTL: config.weather.cacheTtlSeconds, checkperiod: 600 });

class WeatherService {
  /**
   * Fetch live 14-day weather forecast for Bandarawela from Open-Meteo
   */
  static async getForecast(lat = config.weather.bandarawelaLat, lng = config.weather.bandarawelaLng) {
    const cacheKey = `forecast_${lat}_${lng}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(config.weather.openMeteoForecastUrl, {
        params: {
          latitude: lat,
          longitude: lng,
          hourly: 'temperature_2m,relative_humidity_2m,rain,wind_speed_10m',
          daily: 'temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max',
          forecast_days: 14,
          timezone: 'Asia/Colombo'
        },
        timeout: 8000
      });

      const data = response.data;
      const forecastDays = [];

      for (let i = 0; i < data.daily.time.length; i++) {
        const dateStr = data.daily.time[i];
        const tempMax = data.daily.temperature_2m_max[i];
        const tempMin = data.daily.temperature_2m_min[i];
        const tempAvg = Math.round(((tempMax + tempMin) / 2) * 10) / 10;
        const rainMm = data.daily.rain_sum[i] || 0;
        const windMax = data.daily.wind_speed_10m_max[i] || 0;
        const precipProb = data.daily.precipitation_probability_max[i] || 0;

        // Extract approximate daily humidity from hourly readings for that day
        const dayStartIndex = i * 24;
        const dayHourlyHum = data.hourly.relative_humidity_2m.slice(dayStartIndex, dayStartIndex + 24);
        const humidityAvg = dayHourlyHum.length > 0
          ? Math.round(dayHourlyHum.reduce((a, b) => a + b, 0) / dayHourlyHum.length)
          : 75;

        // Calculate agricultural weather risk score (0-100, where 0 = perfect, 100 = critical risk)
        const agScores = this.calculateAgScores(tempAvg, tempMin, tempMax, rainMm, humidityAvg);

        const dayRecord = {
          date: dateStr,
          tempMin,
          tempMax,
          tempAvg,
          humidityAvg,
          rainfallMm: rainMm,
          windSpeedMax: windMax,
          precipitationProbability: precipProb,
          agriculturalScores: agScores
        };

        forecastDays.push(dayRecord);

        // Persist/Update to weather_cache table
        await this.persistWeatherCache(lat, lng, dayRecord);
      }

      const result = {
        location: {
          name: 'Bandarawela',
          district: 'Badulla',
          province: 'Uva',
          elevationMeters: 1216,
          latitude: lat,
          longitude: lng
        },
        forecast: forecastDays,
        current: forecastDays[0],
        fetchedAt: new Date().toISOString()
      };

      memoryCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('⚠️ Open-Meteo live fetch failed, querying weather_cache database:', err.message);
      return await this.getCachedForecastFromDb(lat, lng);
    }
  }

  /**
   * Bandarawela-calibrated agricultural scoring rules:
   * - Elevation: ~1,216m
   * - Temperatures stay between 10°C and 28°C (no frost risk)
   * - Rainfall & high humidity fungal pressures are dominant risks
   */
  static calculateAgScores(tempAvg, tempMin, tempMax, rainDailyMm, humidityAvg) {
    // 1. Temperature Suitability Score (0-100, 100 = optimum)
    let tempScore = 95;
    if (tempAvg >= 15 && tempAvg <= 24) {
      tempScore = 100;
    } else if (tempAvg >= 12 && tempAvg < 15) {
      tempScore = 85;
    } else if (tempAvg >= 10 && tempAvg < 12) {
      tempScore = 70; // Cool snap
    } else if (tempAvg > 24 && tempAvg <= 27) {
      tempScore = 80;
    } else {
      tempScore = 65;
    }

    // 2. Rainfall Suitability Score (0-100)
    let rainScore = 90;
    if (rainDailyMm <= 10) {
      rainScore = 95; // Manageable
    } else if (rainDailyMm <= 25) {
      rainScore = 85; // Good soil moisture
    } else if (rainDailyMm <= 50) {
      rainScore = 65; // Water saturation warning
    } else {
      rainScore = 30; // Severe washout risk
    }

    // 3. Fungal / Blight Disease Pressure Score (0-100, 100 = safe, 0 = extreme hazard)
    let diseaseScore = 85;
    if (humidityAvg > 85 && tempAvg >= 16 && tempAvg <= 24) {
      diseaseScore = 40; // High blight risk
    } else if (humidityAvg > 80) {
      diseaseScore = 60;
    } else {
      diseaseScore = 90;
    }

    // Overall Agricultural Suitability Score
    const suitabilityScore = Math.round(
      (tempScore * 0.40) + (rainScore * 0.35) + (diseaseScore * 0.25)
    );

    // Weather Risk Score (Inverted: 0 = safe, 100 = high danger)
    const weatherRiskScore = Math.max(0, Math.min(100, 100 - suitabilityScore));

    return {
      tempScore,
      rainScore,
      diseaseScore,
      suitabilityScore,
      weatherRiskScore
    };
  }

  /**
   * Evaluate weather suitability for a specific crop based on its biological requirements
   */
  static async evaluateCropWeatherSuitability(crop, forecastData) {
    if (!forecastData || !forecastData.forecast || forecastData.forecast.length === 0) {
      return { suitabilityScore: 80, weatherRiskScore: 20, advisory: 'Normal weather conditions expected.' };
    }

    // Analyze next 7 days for planting decision
    const next7Days = forecastData.forecast.slice(0, 7);
    let totalTempSuit = 0;
    let totalRainSuit = 0;
    let highRainDays = 0;
    let highBlightDays = 0;

    next7Days.forEach(day => {
      // Temperature check against crop thresholds
      const optMin = crop.optimal_temp_min || 12;
      const optMax = crop.optimal_temp_max || 25;
      if (day.tempAvg >= optMin && day.tempAvg <= optMax) {
        totalTempSuit += 100;
      } else {
        const diff = Math.min(Math.abs(day.tempAvg - optMin), Math.abs(day.tempAvg - optMax));
        totalTempSuit += Math.max(40, 100 - (diff * 12));
      }

      // Rain check
      if (crop.waterlog_sensitive && day.rainfallMm > 35) {
        totalRainSuit += 30;
        highRainDays++;
      } else if (day.rainfallMm > 50) {
        totalRainSuit += 40;
        highRainDays++;
      } else {
        totalRainSuit += 90;
      }

      // Disease check
      if (crop.disease_susceptibility === 'HIGH' && day.humidityAvg > 85 && day.tempAvg >= 16) {
        highBlightDays++;
      }
    });

    const avgTempScore = Math.round(totalTempSuit / 7);
    const avgRainScore = Math.round(totalRainSuit / 7);
    let compositeSuitability = Math.round((avgTempScore * 0.5) + (avgRainScore * 0.5));

    // Penalty for high blight risk on susceptible crops
    if (highBlightDays >= 2) {
      compositeSuitability = Math.max(30, compositeSuitability - 25);
    }

    const weatherRiskScore = 100 - compositeSuitability;

    // Generate localized ag advisory
    let advisory = 'Weather is favorable for planting in Bandarawela.';
    if (highRainDays >= 2 && crop.waterlog_sensitive) {
      advisory = 'Heavy rainfall alert: Ensure deep trench drainage to prevent root waterlogging.';
    } else if (highBlightDays >= 2 && crop.disease_susceptibility === 'HIGH') {
      advisory = 'High humidity alert: Fungal disease pressure elevated; monitor for early/late blight.';
    } else if (avgTempScore >= 90) {
      advisory = 'Ideal temperatures matching optimal growth window for this vegetable.';
    }

    return {
      suitabilityScore: compositeSuitability,
      weatherRiskScore,
      temperatureScore: avgTempScore,
      rainfallScore: avgRainScore,
      highRainDays,
      highBlightDays,
      advisory
    };
  }

  /**
   * Persist weather data into PostgreSQL weather_cache table
   */
  static async persistWeatherCache(lat, lng, dayRecord) {
    try {
      await db.query(
        `INSERT INTO weather_cache (
          location_key, latitude, longitude, forecast_date, temp_min, temp_max,
          temp_avg, humidity_avg, rainfall_mm, wind_speed_avg, precipitation_probability,
          weather_risk_score, raw_data, fetched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        ON CONFLICT (location_key, forecast_date) DO UPDATE SET
          temp_min = EXCLUDED.temp_min,
          temp_max = EXCLUDED.temp_max,
          temp_avg = EXCLUDED.temp_avg,
          humidity_avg = EXCLUDED.humidity_avg,
          rainfall_mm = EXCLUDED.rainfall_mm,
          weather_risk_score = EXCLUDED.weather_risk_score,
          fetched_at = CURRENT_TIMESTAMP`,
        [
          'bandarawela', lat, lng, dayRecord.date, dayRecord.tempMin, dayRecord.tempMax,
          dayRecord.tempAvg, dayRecord.humidityAvg, dayRecord.rainfallMm, dayRecord.windSpeedMax,
          dayRecord.precipitationProbability, dayRecord.agriculturalScores.weatherRiskScore,
          JSON.stringify(dayRecord)
        ]
      );
    } catch (e) {
      // Non-blocking write error
    }
  }

  /**
   * Database fallback if live API is temporarily unreachable
   */
  static async getCachedForecastFromDb(lat = config.weather.bandarawelaLat, lng = config.weather.bandarawelaLng) {
    try {
      const res = await db.query(
        `SELECT * FROM weather_cache
         WHERE location_key = 'bandarawela' AND forecast_date >= CURRENT_DATE
         ORDER BY forecast_date ASC LIMIT 14`
      );

      if (res && res.rows && res.rows.length > 0) {
        const forecastDays = res.rows.map(r => ({
          date: r.forecast_date.toISOString().split('T')[0],
          tempMin: parseFloat(r.temp_min),
          tempMax: parseFloat(r.temp_max),
          tempAvg: parseFloat(r.temp_avg),
          humidityAvg: parseFloat(r.humidity_avg),
          rainfallMm: parseFloat(r.rainfall_mm),
          windSpeedMax: parseFloat(r.wind_speed_avg || 10),
          precipitationProbability: r.precipitation_probability || 0,
          agriculturalScores: {
            weatherRiskScore: parseFloat(r.weather_risk_score || 20),
            suitabilityScore: 100 - parseFloat(r.weather_risk_score || 20)
          }
        }));

        return {
          location: { name: 'Bandarawela', district: 'Badulla', elevationMeters: 1216, latitude: lat, longitude: lng },
          forecast: forecastDays,
          current: forecastDays[0],
          source: 'DATABASE_CACHE'
        };
      }
    } catch (e) {
      // Fall through to hard fallback
    }

    // Default emergency fallback (Bandarawela historical averages)
    const today = new Date().toISOString().split('T')[0];
    return {
      location: { name: 'Bandarawela', district: 'Badulla', elevationMeters: 1216, latitude: lat, longitude: lng },
      current: {
        date: today,
        tempMin: 15.5,
        tempMax: 24.2,
        tempAvg: 19.8,
        humidityAvg: 75,
        rainfallMm: 5.0,
        agriculturalScores: { suitabilityScore: 92, weatherRiskScore: 8 }
      },
      forecast: [],
      source: 'OFFLINE_BANDARAWELA_BASELINE'
    };
  }

  /**
   * Backfill historical climate data (24 months) from Open-Meteo Archive API
   */
  static async backfillHistoricalWeather(startDate = '2024-01-01', endDate = '2025-12-31') {
    console.log(`⏳ Backfilling historical weather for Bandarawela (${startDate} to ${endDate})...`);
    try {
      const response = await axios.get(config.weather.openMeteoArchiveUrl, {
        params: {
          latitude: config.weather.bandarawelaLat,
          longitude: config.weather.bandarawelaLng,
          start_date: startDate,
          end_date: endDate,
          daily: 'temperature_2m_max,temperature_2m_min,rain_sum',
          timezone: 'Asia/Colombo'
        },
        timeout: 20000
      });

      const data = response.data;
      const count = data.daily.time.length;

      for (let i = 0; i < count; i++) {
        const dateStr = data.daily.time[i];
        const tMax = data.daily.temperature_2m_max[i];
        const tMin = data.daily.temperature_2m_min[i];
        const tAvg = Math.round(((tMax + tMin) / 2) * 10) / 10;
        const rain = data.daily.rain_sum[i] || 0;
        const ag = this.calculateAgScores(tAvg, tMin, tMax, rain, 75);

        await db.query(
          `INSERT INTO weather_cache (
            location_key, latitude, longitude, forecast_date, temp_min, temp_max,
            temp_avg, humidity_avg, rainfall_mm, weather_risk_score, fetched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
          ON CONFLICT (location_key, forecast_date) DO NOTHING`,
          ['bandarawela', config.weather.bandarawelaLat, config.weather.bandarawelaLng, dateStr, tMin, tMax, tAvg, 75, rain, ag.weatherRiskScore]
        );
      }

      console.log(`✅ Successfully backfilled ${count} days of real climate data for Bandarawela!`);
      return { success: true, recordsBackfilled: count };
    } catch (err) {
      console.error('❌ Historical weather backfill failed:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = WeatherService;
