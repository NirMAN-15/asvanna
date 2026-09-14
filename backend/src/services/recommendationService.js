const db = require('../config/database');
const RiskEngineService = require('./riskEngineService');
const WeatherService = require('./weatherService');
const PriceService = require('./priceService');

class RecommendationService {
  /**
   * Calculate smart crop recommendations for a farmer in an at-risk area
   * Factors:
   * 1. Market Gap Score (30%)
   * 2. Weather Suitability Score (25%) - Real Open-Meteo 14-day data
   * 3. Seasonal Fit Score (20%) - Bandarawela Maha / Yala seasonal matrix
   * 4. Price Attractiveness Score (15%) - Keppetipola wholesale rates
   * 5. Growth Duration Score (10%) - Turnaround efficiency
   */
  static async getSmartRecommendations(district = 'Badulla', currentCropId = null) {
    const cropsRes = await db.query('SELECT * FROM crops ORDER BY id ASC');
    const allCrops = cropsRes.rows;
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = (currentMonth >= 10 || currentMonth <= 3) ? 'MAHA' : ((currentMonth >= 5 && currentMonth <= 8) ? 'YALA' : 'INTER_MONSOON');

    // Fetch live weather data for Bandarawela once for all candidates
    const weatherForecast = await WeatherService.getForecast();

    // Fetch latest wholesale prices
    const latestPrices = await PriceService.getLatestPrices();
    const priceMap = {};
    latestPrices.forEach(p => { priceMap[p.crop_id] = parseFloat(p.current_price_per_kg); });

    // Fetch all seasonal matrices
    const seasonsRes = await db.query('SELECT * FROM crop_seasons');
    const seasonMap = {};
    seasonsRes.rows.forEach(s => {
      if (!seasonMap[s.crop_id]) seasonMap[s.crop_id] = {};
      seasonMap[s.crop_id][s.season_name] = s;
    });

    const recommendations = [];

    for (const crop of allCrops) {
      if (currentCropId && crop.id === parseInt(currentCropId, 10)) {
        continue; // Skip the crop the farmer was originally considering
      }

      // Check current risk level of this candidate crop
      const risk = await RiskEngineService.evaluateCropRisk(crop.id, district);

      // Never recommend an already saturated or over-planted crop
      if (risk.riskLevel === 'OVER_PLANTED') continue;

      // 1. Market Gap Score (30%) - Higher quota remaining = higher score
      const overplantScore = risk.factors.overPlanting.score;
      const marketGapScore = Math.max(0, Math.min(100, 100 - overplantScore));

      // 2. Weather Suitability Score (25%) - Real Open-Meteo evaluation
      const weatherEval = await WeatherService.evaluateCropWeatherSuitability(crop, weatherForecast);
      const weatherScore = weatherEval.suitabilityScore;

      // 3. Seasonal Fit Score (20%) - From crop_seasons
      let seasonScore = 75;
      if (seasonMap[crop.id] && seasonMap[crop.id][currentSeason]) {
        seasonScore = parseFloat(seasonMap[crop.id][currentSeason].suitability_score);
      }

      // 4. Price Attractiveness Score (15%) - Compare current price to standard price
      const currentPrice = priceMap[crop.id] || parseFloat(crop.standard_price_per_kg);
      const standardPrice = parseFloat(crop.standard_price_per_kg) || 200;
      const priceRatio = (currentPrice / standardPrice) * 100;
      const priceScore = Math.min(100, Math.max(20, Math.round(priceRatio)));

      // 5. Growth Duration Score (10%) - Faster maturity (45-60 days) scores higher
      let durationScore = 70;
      if (crop.growth_duration_days <= 45) durationScore = 100;
      else if (crop.growth_duration_days <= 65) durationScore = 90;
      else if (crop.growth_duration_days <= 80) durationScore = 75;
      else durationScore = 60;

      // Composite Recommendation Score
      const compositeScore = Math.round(
        (marketGapScore * 0.30) +
        (weatherScore * 0.25) +
        (seasonScore * 0.20) +
        (priceScore * 0.15) +
        (durationScore * 0.10)
      );

      // Generate localized rationale
      let rationaleEn = `High market demand in Badulla with ${marketGapScore}% unmet regional quota. Favorable weather in Bandarawela.`;
      let rationaleSi = `බණ්ඩාරවෙල කලාපයේ ${marketGapScore}%ක ඉහළ වෙළෙඳපොළ ඉල්ලුමක් සහ හිතකර කාලගුණික තත්ත්වයක් පවතී.`;
      let rationaleTa = `பண்டாரவளை பிராந்தியத்தில் ${marketGapScore}% அதிக சந்தை தேவையும் சாதகமான காலநிலையும் நிலவுகிறது.`;

      if (weatherScore >= 90 && seasonScore >= 90) {
        rationaleEn += ` Optimal growth window for ${currentSeason} season.`;
        rationaleSi += ` ${currentSeason} කන්නය සඳහා වඩාත් සුදුසු බෝගයකි.`;
        rationaleTa += ` ${currentSeason} பருவத்திற்கு மிகவும் பொருத்தமான பயிர்.`;
      }

      recommendations.push({
        crop: {
          id: crop.id,
          code: crop.crop_code,
          nameEn: crop.name_en,
          nameSi: crop.name_si,
          nameTa: crop.name_ta,
          category: crop.category,
          growthDurationDays: crop.growth_duration_days,
          standardPricePerKg: crop.standard_price_per_kg,
          currentPricePerKg: currentPrice,
          priceRangeMin: crop.price_range_min,
          priceRangeMax: crop.price_range_max,
          descriptionEn: crop.description_en,
          descriptionSi: crop.description_si,
          descriptionTa: crop.description_ta
        },
        scores: {
          compositeScore,
          marketGapScore,
          weatherScore,
          seasonScore,
          priceScore,
          durationScore
        },
        riskLevel: risk.riskLevel,
        weatherOutlook: {
          advisory: weatherEval.advisory,
          suitabilityScore: weatherScore
        },
        season: {
          currentSeason,
          suitabilityScore: seasonScore
        },
        rationale: {
          en: rationaleEn,
          si: rationaleSi,
          ta: rationaleTa
        }
      });
    }

    // Sort descending by composite recommendation score
    recommendations.sort((a, b) => b.scores.compositeScore - a.scores.compositeScore);

    return recommendations.slice(0, 5); // Return top 5 best recommendations
  }
}

module.exports = RecommendationService;
