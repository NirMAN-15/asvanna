const axios = require('axios');
const NodeCache = require('node-cache');
const db = require('../config/database');
const config = require('../config/config');

// In-memory cache with 6-hour TTL
const memoryCache = new NodeCache({ stdTTL: config.weather.cacheTtlSeconds, checkperiod: 600 });

// Known Upcountry Vegetable Cultivation Zones & Agrarian Divisions
const KNOWN_LOCATIONS = {
  bandarawela: {
    name: 'Bandarawela',
    district: 'Badulla',
    province: 'Uva',
    elevationMeters: 1230,
    elevationText: '1,230m • Badulla District',
    latitude: 6.8304,
    longitude: 80.9878
  },
  'nuwara eliya': {
    name: 'Nuwara Eliya',
    district: 'Nuwara Eliya',
    province: 'Central',
    elevationMeters: 1868,
    elevationText: '1,868m • Central Province',
    latitude: 6.9497,
    longitude: 80.7891
  },
  welimada: {
    name: 'Welimada',
    district: 'Badulla',
    province: 'Uva',
    elevationMeters: 1060,
    elevationText: '1,060m • Uva Province',
    latitude: 6.9033,
    longitude: 80.9022
  },
  badulla: {
    name: 'Badulla',
    district: 'Badulla',
    province: 'Uva',
    elevationMeters: 680,
    elevationText: '680m • Badulla District',
    latitude: 6.9895,
    longitude: 81.0557
  },
  keppetipola: {
    name: 'Keppetipola',
    district: 'Badulla',
    province: 'Uva',
    elevationMeters: 1220,
    elevationText: '1,220m • Badulla District',
    latitude: 6.8911,
    longitude: 80.8656
  }
};

class WeatherService {
  /**
   * Helper to resolve coordinates & location metadata from division name or lat/lng
   */
  static resolveLocation(lat, lng, divisionName) {
    if (divisionName) {
      const key = divisionName.trim().toLowerCase();
      if (KNOWN_LOCATIONS[key]) {
        return { ...KNOWN_LOCATIONS[key] };
      }
      for (const [k, loc] of Object.entries(KNOWN_LOCATIONS)) {
        if (key.includes(k) || k.includes(key)) {
          return { ...loc, name: divisionName };
        }
      }
    }

    if (lat && lng) {
      // Find closest known location or default
      let closest = KNOWN_LOCATIONS.bandarawela;
      let minDistance = Infinity;

      for (const loc of Object.values(KNOWN_LOCATIONS)) {
        const d = Math.hypot(loc.latitude - lat, loc.longitude - lng);
        if (d < minDistance) {
          minDistance = d;
          closest = loc;
        }
      }

      if (minDistance < 0.2) {
        return { ...closest, latitude: lat, longitude: lng };
      }

      return {
        name: divisionName || closest.name,
        district: closest.district,
        province: closest.province,
        elevationMeters: closest.elevationMeters,
        elevationText: `${closest.elevationMeters}m • ${closest.district} District`,
        latitude: lat,
        longitude: lng
      };
    }

    return { ...KNOWN_LOCATIONS.bandarawela };
  }

  /**
   * Map WMO Weather Interpretation Codes to readable descriptions and emojis
   */
  static parseWmoWeather(code, isNight = false) {
    switch (code) {
      case 0:
        return { condition: 'Clear Sky', emoji: isNight ? '🌙' : '☀️' };
      case 1:
        return { condition: 'Mainly Clear', emoji: isNight ? '🌤️' : '🌤️' };
      case 2:
        return { condition: 'Partly Cloudy', emoji: '⛅' };
      case 3:
        return { condition: 'Overcast', emoji: '☁️' };
      case 45:
      case 48:
        return { condition: 'Mist & Fog', emoji: '🌫️' };
      case 51:
      case 53:
      case 55:
        return { condition: 'Light Drizzle', emoji: '🌦️' };
      case 61:
      case 63:
        return { condition: 'Scattered Afternoon Showers', emoji: '🌧️' };
      case 65:
        return { condition: 'Heavy Rain', emoji: '🌧️' };
      case 71:
      case 73:
      case 75:
        return { condition: 'Ground Frost Hazard', emoji: '❄️' };
      case 80:
      case 81:
      case 82:
        return { condition: 'Rain Showers', emoji: '🌧️' };
      case 95:
      case 96:
      case 99:
        return { condition: 'Thunderstorm', emoji: '⛈️' };
      default:
        return { condition: 'Partly Cloudy', emoji: '⛅' };
    }
  }

  /**
   * Fetch live 14-day weather forecast with hourly projections from Open-Meteo
   */
  static async getForecast(lat = null, lng = null, divisionName = null) {
    const loc = this.resolveLocation(lat, lng, divisionName);
    const resolvedLat = loc.latitude;
    const resolvedLng = loc.longitude;
    const cacheKey = `forecast_${resolvedLat}_${resolvedLng}`;

    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(config.weather.openMeteoForecastUrl, {
        params: {
          latitude: resolvedLat,
          longitude: resolvedLng,
          hourly: 'temperature_2m,relative_humidity_2m,rain,precipitation_probability,wind_speed_10m,weather_code',
          daily: 'temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max,weather_code',
          forecast_days: 14,
          timezone: 'Asia/Colombo'
        },
        timeout: 8000
      });

      const data = response.data;
      const forecastDays = [];

      for (let i = 0; i < data.daily.time.length; i++) {
        const dateStr = data.daily.time[i];
        const tempMax = Math.round(data.daily.temperature_2m_max[i] * 10) / 10;
        const tempMin = Math.round(data.daily.temperature_2m_min[i] * 10) / 10;
        const tempAvg = Math.round(((tempMax + tempMin) / 2) * 10) / 10;
        const rainMm = Math.round((data.daily.rain_sum[i] || 0) * 10) / 10;
        const windMax = Math.round((data.daily.wind_speed_10m_max[i] || 0) * 10) / 10;
        const precipProb = Math.round(data.daily.precipitation_probability_max[i] || 0);
        const dailyCode = data.daily.weather_code ? data.daily.weather_code[i] : 2;
        const { condition, emoji } = this.parseWmoWeather(dailyCode);

        // Calculate approximate daily humidity from hourly readings for that day
        const dayStartIndex = i * 24;
        const dayHourlyHum = data.hourly.relative_humidity_2m.slice(dayStartIndex, dayStartIndex + 24);
        const humidityAvg = dayHourlyHum.length > 0
          ? Math.round(dayHourlyHum.reduce((a, b) => a + b, 0) / dayHourlyHum.length)
          : 75;

        // Calculate agricultural weather risk score (0-100, where 0 = perfect, 100 = critical risk)
        const agScores = this.calculateAgScores(tempAvg, tempMin, tempMax, rainMm, humidityAvg);

        const dayRecord = {
          date: dateStr,
          temp: `${Math.round(tempAvg)}°C`,
          tempMin,
          tempMax,
          tempAvg,
          humidityAvg,
          rainfallMm: rainMm,
          windSpeedMax: windMax,
          precipitationProbability: precipProb,
          rainProb: `${precipProb}%`,
          condition,
          emoji,
          agriculturalScores: agScores
        };

        forecastDays.push(dayRecord);

        // Persist/Update to weather_cache table
        await this.persistWeatherCache(loc.name.toLowerCase(), resolvedLat, resolvedLng, dayRecord);
      }

      // Generate current day hourly timeline (Next 24h intervals: 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
      const hourlyForecast = [];
      const hourlyTimes = data.hourly.time;
      const hourlyTemps = data.hourly.temperature_2m;
      const hourlyRains = data.hourly.rain;
      const hourlyProb = data.hourly.precipitation_probability || [];
      const hourlyCodes = data.hourly.weather_code || [];
      const hourlyHums = data.hourly.relative_humidity_2m || [];

      // Take first 24 hours
      for (let h = 0; h < Math.min(24, hourlyTimes.length); h++) {
        const timeIso = hourlyTimes[h];
        const timePart = timeIso.includes('T') ? timeIso.split('T')[1].substring(0, 5) : `${h.toString().padStart(2, '0')}:00`;
        const hTemp = Math.round(hourlyTemps[h]);
        const hProb = hourlyProb[h] !== undefined ? hourlyProb[h] : (hourlyRains[h] > 0 ? 70 : 10);
        const hCode = hourlyCodes[h] !== undefined ? hourlyCodes[h] : 2;
        const isNight = h < 6 || h >= 19;
        const { emoji } = this.parseWmoWeather(hCode, isNight);

        hourlyForecast.push({
          time: timePart,
          temp: `${hTemp}°C`,
          tempValue: hourlyTemps[h],
          icon: emoji,
          rain: `${hProb}%`,
          rainProb: hProb,
          humidity: hourlyHums[h] || 75
        });
      }

      // Filter hourly slots to common agricultural checkpoints (06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
      const checkpointHours = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
      const filteredHourly = hourlyForecast.filter(item => checkpointHours.includes(item.time));
      const finalHourly = filteredHourly.length >= 4 ? filteredHourly : hourlyForecast.slice(0, 8);

      // Current Day Info
      const currentDay = forecastDays[0] || {};
      const isFrostRisk = currentDay.tempMin <= 8.5;
      const frostRiskText = isFrostRisk ? `HIGH RISK (Night: ${currentDay.tempMin}°C)` : 'None';

      const current = {
        ...currentDay,
        elevation: loc.elevationText,
        humidity: `${currentDay.humidityAvg}%`,
        wind: `${Math.round(currentDay.windSpeedMax)} km/h`,
        agScore: `${currentDay.agriculturalScores.suitabilityScore}/100 (${currentDay.agriculturalScores.suitabilityScore >= 75 ? 'Safe' : 'Caution'})`,
        frostRisk: isFrostRisk ? frostRiskText : undefined
      };

      // Generate Dynamic Disease & Agricultural Advisories
      const diseases = this.generateDiseaseAdvisories(loc, currentDay, forecastDays);

      const result = {
        location: loc,
        current,
        hourly: finalHourly,
        forecast: forecastDays,
        diseases,
        fetchedAt: new Date().toISOString(),
        source: 'OPEN_METEO_LIVE'
      };

      memoryCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn(`⚠️ Open-Meteo live fetch failed for ${loc.name}, querying database cache:`, err.message);
      return await this.getCachedForecastFromDb(loc);
    }
  }

  /**
   * Generate dynamic agricultural disease advisories calibrated to live weather
   */
  static generateDiseaseAdvisories(loc, currentDay, forecast) {
    const diseases = [];
    const humidity = currentDay.humidityAvg || 80;
    const tempMin = currentDay.tempMin || 14;
    const tempAvg = currentDay.tempAvg || 20;
    const rainMm = currentDay.rainfallMm || 0;

    // 1. Ground Frost Damage (For high altitude Nuwara Eliya / Welimada)
    if (tempMin <= 8.5 || loc.elevationMeters >= 1600) {
      diseases.push({
        name: 'Ground Frost Damage (මල් තුෂාර හානිය)',
        risk: tempMin <= 8.0 ? 'Severe Frost Alert' : 'Moderate Frost Warning',
        color: '#DC2626', // AppColors.riskCritical
        advice: `Night temperatures dropping to ${tempMin}°C. Cover sensitive potato & leek beds with polythene mulch or frost sheets.`
      });
    }

    // 2. Late Blight (Phytophthora infestans) - High risk when humidity > 80% and temp 14-22°C
    if (humidity >= 80 && tempAvg >= 14 && tempAvg <= 24) {
      diseases.push({
        name: 'Late Blight (තක්කාලි/අල පාළු රෝගය)',
        risk: humidity >= 88 ? 'Critical Risk' : 'High Risk',
        color: '#DC2626',
        advice: `High humidity (${humidity}%) + ${tempMin}°C night temp. Persistent leaf wetness detected. Avoid sprinkler irrigation after 2 PM.`
      });
    }

    // 3. Downy Mildew / Cabbage Mold
    if (humidity >= 75) {
      diseases.push({
        name: 'Downy Mildew (ගෝවා පුස් රෝගය)',
        risk: 'Moderate',
        color: '#D97706', // AppColors.riskModerate
        advice: `Ensure adequate row ventilation and raised bed drainage in cabbage and broccoli nurseries.`
      });
    }

    // 4. Powdery Mildew
    if (rainMm < 5 && humidity <= 75) {
      diseases.push({
        name: 'Powdery Mildew (අළු පුස්)',
        risk: 'Low Risk',
        color: '#16A34A', // AppColors.riskSafe
        advice: `Favorable growing conditions across ${loc.name} valley for beans and capsicum.`
      });
    }

    // 5. Root Rot & Soil Drainage
    if (rainMm > 30) {
      diseases.push({
        name: 'Root Rot (මුල් කුණුවීම)',
        risk: 'Moderate Warning',
        color: '#D97706',
        advice: `Heavy precipitation (${rainMm}mm) expected. Deepen drainage furrows to avoid root waterlogging.`
      });
    } else {
      diseases.push({
        name: 'Root Rot (මුල් කුණුවීම)',
        risk: 'Safe',
        color: '#16A34A',
        advice: `Soil moisture in ${loc.name} cultivation zones remains within healthy thresholds.`
      });
    }

    return diseases;
  }

  /**
   * Agricultural scoring calibrated for Upcountry Sri Lanka
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
  static async persistWeatherCache(locationKey, lat, lng, dayRecord) {
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
          locationKey, lat, lng, dayRecord.date, dayRecord.tempMin, dayRecord.tempMax,
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
  static async getCachedForecastFromDb(loc = KNOWN_LOCATIONS.bandarawela) {
    const locKey = loc.name.toLowerCase();
    try {
      const res = await db.query(
        `SELECT * FROM weather_cache
         WHERE location_key = $1 AND forecast_date >= CURRENT_DATE
         ORDER BY forecast_date ASC LIMIT 14`,
        [locKey]
      );

      if (res && res.rows && res.rows.length > 0) {
        const forecastDays = res.rows.map(r => ({
          date: r.forecast_date.toISOString().split('T')[0],
          temp: `${Math.round(parseFloat(r.temp_avg))}°C`,
          tempMin: parseFloat(r.temp_min),
          tempMax: parseFloat(r.temp_max),
          tempAvg: parseFloat(r.temp_avg),
          humidityAvg: parseFloat(r.humidity_avg),
          rainfallMm: parseFloat(r.rainfall_mm),
          windSpeedMax: parseFloat(r.wind_speed_avg || 12),
          precipitationProbability: r.precipitation_probability || 40,
          rainProb: `${r.precipitation_probability || 40}%`,
          condition: 'Scattered Afternoon Showers',
          emoji: '⛅',
          agriculturalScores: {
            weatherRiskScore: parseFloat(r.weather_risk_score || 20),
            suitabilityScore: 100 - parseFloat(r.weather_risk_score || 20)
          }
        }));

        const currentDay = forecastDays[0];
        const current = {
          ...currentDay,
          elevation: loc.elevationText,
          humidity: `${currentDay.humidityAvg}%`,
          wind: `${Math.round(currentDay.windSpeedMax)} km/h`,
          agScore: `${currentDay.agriculturalScores.suitabilityScore}/100 (Safe)`
        };

        return {
          location: loc,
          forecast: forecastDays,
          current,
          hourly: [
            { time: '06:00', temp: '15°C', tempValue: 15, icon: '⛅', rain: '10%', rainProb: 10, humidity: 85 },
            { time: '09:00', temp: '19°C', tempValue: 19, icon: '☀️', rain: '15%', rainProb: 15, humidity: 80 },
            { time: '12:00', temp: '23°C', tempValue: 23, icon: '⛅', rain: '35%', rainProb: 35, humidity: 72 },
            { time: '15:00', temp: '21°C', tempValue: 21, icon: '🌧️', rain: '80%', rainProb: 80, humidity: 85 },
            { time: '18:00', temp: '18°C', tempValue: 18, icon: '🌧️', rain: '70%', rainProb: 70, humidity: 90 },
            { time: '21:00', temp: '16°C', tempValue: 16, icon: '☁️', rain: '30%', rainProb: 30, humidity: 88 }
          ],
          diseases: this.generateDiseaseAdvisories(loc, currentDay, forecastDays),
          source: 'DATABASE_CACHE'
        };
      }
    } catch (e) {
      // Fall through to hard fallback
    }

    // Default emergency fallback
    const today = new Date().toISOString().split('T')[0];
    const current = {
      date: today,
      temp: '21°C',
      tempMin: 15.5,
      tempMax: 24.2,
      tempAvg: 19.8,
      humidityAvg: 75,
      humidity: '75%',
      rainfallMm: 5.0,
      wind: '14 km/h',
      windSpeedMax: 14,
      rainProb: '40%',
      precipitationProbability: 40,
      condition: 'Scattered Afternoon Showers',
      emoji: '⛅',
      elevation: loc.elevationText,
      agScore: '88/100 (Safe)',
      agriculturalScores: { suitabilityScore: 88, weatherRiskScore: 12 }
    };

    return {
      location: loc,
      current,
      hourly: [
        { time: '06:00', temp: '15°C', tempValue: 15, icon: '⛅', rain: '10%', rainProb: 10, humidity: 85 },
        { time: '09:00', temp: '19°C', tempValue: 19, icon: '☀️', rain: '15%', rainProb: 15, humidity: 80 },
        { time: '12:00', temp: '23°C', tempValue: 23, icon: '⛅', rain: '35%', rainProb: 35, humidity: 72 },
        { time: '15:00', temp: '21°C', tempValue: 21, icon: '🌧️', rain: '80%', rainProb: 80, humidity: 85 },
        { time: '18:00', temp: '18°C', tempValue: 18, icon: '🌧️', rain: '70%', rainProb: 70, humidity: 90 },
        { time: '21:00', temp: '16°C', tempValue: 16, icon: '☁️', rain: '30%', rainProb: 30, humidity: 88 }
      ],
      forecast: [current],
      diseases: this.generateDiseaseAdvisories(loc, current, [current]),
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
