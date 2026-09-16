import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import FarmerPlantingModal from '../components/FarmerPlantingModal';

export default function RiskAnalytics() {
  const { t, lang } = useContext(LanguageContext);
  const [searchCrop, setSearchCrop] = useState('Leeks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModalCropId, setSelectedModalCropId] = useState(4);
  const [toastMessage, setToastMessage] = useState(null);

  const [recommendations, setRecommendations] = useState([
    {
      crop: { id: 4, nameEn: 'Beetroot', nameSi: 'බීට්රූට්', nameTa: 'பீட்ரூட்' },
      scores: { compositeScore: 92, marketGapScore: 95, seasonScore: 90, weatherScore: 92, priceScore: 88 },
      rationale: {
        en: 'High market demand gap identified in Badulla. Bandarawela intermediate climate is optimal (16–24°C). Keppetipola price steady at Rs 260/kg.',
        si: 'බණ්ඩාරවෙල කලාපයේ 95%ක ඉහළ වෙළෙඳපොළ ඉල්ලුමක් සහ හිතකර කාලගුණික තත්ත්වයක් පවතී. කැප්පෙටිපොළ මිල රු. 260/kg.',
        ta: 'பண்டாரவளை பிராந்தியத்தில் 95% அதிக சந்தை தேவையும் சாதகமான காலநிலையும் நிலவுகிறது. விலை ரூ 260/கிலோ.'
      },
      priceTrend: '+12.4%',
      image: '/crops/beetroot.jpg'
    },
    {
      crop: { id: 9, nameEn: 'Radish', nameSi: 'රාබු', nameTa: 'முள்ளங்கி' },
      scores: { compositeScore: 87, marketGapScore: 88, seasonScore: 92, weatherScore: 85, priceScore: 83 },
      rationale: {
        en: 'Fast 45-day maturity minimizes weather risk. Excellent market gap before festive season demand spike.',
        si: 'දින 45ක කෙටි අස්වනු කාලය නිසා කාලගුණික අවදානම අවම වේ. උත්සව සමය ඉලක්ක කරගත් ඉහළ ඉල්ලුම.',
        ta: '45 நாள் குறுகிய அறுவடை காலம் வானிலை அபாயத்தைக் குறைக்கிறது. திருவிழா காலத்திற்கு ஏற்றது.'
      },
      priceTrend: '+8.1%',
      image: '/crops/radish.jpg'
    },
    {
      crop: { id: 11, nameEn: 'Spring Onion', nameSi: 'ළූණු කොළ', nameTa: 'வெங்காய இலை' },
      scores: { compositeScore: 84, marketGapScore: 82, seasonScore: 85, weatherScore: 88, priceScore: 82 },
      rationale: {
        en: 'High turnover crop with consistent hotel and catering demand in Ella and Bandarawela tourist corridors.',
        si: 'ඇල්ල සහ බණ්ඩාරවෙල සංචාරක හෝටල් ජාලයෙන් අඛණ්ඩ ඉහළ ඉල්ලුමක් පවතී. කෙටි කාලීන ආදායම.',
        ta: 'எல்ல மற்றும் பண்டாரவளை சுற்றுலா உணவகங்களில் தொடர்ச்சியான அதிக தேவை உள்ளது.'
      },
      priceTrend: '+15.0%',
      image: '/crops/spring_onion.jpg'
    },
    {
      crop: { id: 6, nameEn: 'Green Beans', nameSi: 'බෝංචි', nameTa: 'போஞ்சி' },
      scores: { compositeScore: 81, marketGapScore: 78, seasonScore: 88, weatherScore: 82, priceScore: 80 },
      rationale: {
        en: 'Strong wholesale recovery at Keppetipola Economic Centre. Good soil nitrogen-fixing companion crop.',
        si: 'කැප්පෙටිපොළ ආර්ථික මධ්‍යස්ථානයේ ස්ථාවර මිල ප්‍රවණතාවයක් පවතී. පස සරු කරන බෝගයකි.',
        ta: 'கெப்பட்டிப்பொல பொருளாதார மையத்தில் நிலையான விலை போக்கு நிலவுகிறது.'
      },
      priceTrend: '+9.5%',
      image: '/crops/bush_beans.jpg'
    },
    {
      crop: { id: 3, nameEn: 'Carrot', nameSi: 'කැරට්', nameTa: 'கேரட்' },
      scores: { compositeScore: 79, marketGapScore: 75, seasonScore: 85, weatherScore: 80, priceScore: 82 },
      rationale: {
        en: 'Moderate regional saturation. Suitable for staggered planting cycles across well-drained slopes.',
        si: 'කලාපීය වගා ප්‍රමාණය මධ්‍යස්ථ මට්ටමක පවතී. බෑවුම් සහිත ඉඩම් සඳහා ඉතා සුදුසුයි.',
        ta: 'பிராந்திய சாகுபடி மிதமான மட்டத்தில் உள்ளது. நல்ல வடிகால் கொண்ட நிலத்திற்கு ஏற்றது.'
      },
      priceTrend: '+6.2%',
      image: '/crops/carrot.jpg'
    }
  ]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await API.get('/recommendations?district=Badulla');
      if (res.data?.data && res.data.data.length > 0) {
        const mapped = res.data.data.map(item => ({
          crop: item.crop,
          scores: {
            compositeScore: item.compositeScore,
            marketGapScore: item.breakdown?.marketGapScore || 85,
            seasonScore: item.breakdown?.seasonScore || 80,
            weatherScore: item.breakdown?.weatherScore || 85,
            priceScore: item.breakdown?.priceScore || 80
          },
          rationale: item.rationale,
          priceTrend: '+10.5%',
          image: item.crop.id === 4 ? '/crops/beetroot.jpg' :
                 item.crop.id === 9 ? '/crops/radish.jpg' :
                 item.crop.id === 11 ? '/crops/spring_onion.jpg' :
                 item.crop.id === 6 ? '/crops/bush_beans.jpg' :
                 item.crop.id === 3 ? '/crops/carrot.jpg' : 
                 item.crop.id === 10 ? '/crops/knol_khol.jpg' : 
                 item.crop.id === 22 ? '/crops/gotukola.jpg' : 
                 item.crop.id === 23 ? '/crops/kangkung.jpg' : 
                 item.crop.id === 24 ? '/crops/mukunuwenna.jpg' : 
                 item.crop.id === 25 ? '/crops/spinach.jpg' : '/crops/leek.jpg'
        }));
        setRecommendations(mapped);
      }
    } catch (err) {
      // Keep structured fallbacks
    }
  };

  const handlePlantNow = (cropId) => {
    setSelectedModalCropId(cropId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-secondary text-xs font-bold animate-slideDown">
          <span className="material-symbols-outlined text-secondary-fixed text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-headline">
              {t('risk_analytics_title')}
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-2 max-w-2xl leading-relaxed">
            {t('risk_analytics_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/50 px-4 py-2.5 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-primary/20">
          <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
          <input
            type="text"
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            placeholder={t('search_crop_placeholder')}
            className="text-xs bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* Saturation Warning Banner */}
      <div className="bg-red-50/90 border border-red-200 border-l-4 border-l-red-600 rounded-2xl p-5 shadow-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-200">
          <span className="material-symbols-outlined text-2xl animate-pulse">warning</span>
        </div>
        <div>
          <h4 className="text-base font-black text-red-950 tracking-tight font-headline">
            {t('risk_directive_title')}
          </h4>
          <p className="text-sm text-slate-800 font-medium mt-1 leading-relaxed">
            {t('risk_directive_body', { crop: searchCrop })}
          </p>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
            <span>{t('recommended_smart_alternatives')}</span>
          </h3>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Top 5 CROPIX Calibrated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => {
            const cropTitle = lang === 'si' ? rec.crop.nameSi : lang === 'ta' ? rec.crop.nameTa : rec.crop.nameEn;
            const cropSub = lang === 'si' 
              ? `${rec.crop.nameEn} • ${rec.crop.nameTa}` 
              : lang === 'ta' 
              ? `${rec.crop.nameEn} • ${rec.crop.nameSi}` 
              : `${rec.crop.nameSi} • ${rec.crop.nameTa}`;

            const rationaleText = typeof rec.rationale === 'object'
              ? (rec.rationale[lang] || rec.rationale.en)
              : t(rec.rationaleKey || 'rationale_beetroot');

            return (
              <div
                key={i}
                className="bg-white border border-outline-variant/40 hover:border-emerald-500/60 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={rec.image}
                      alt={rec.crop.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                    {/* Match Score Badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-black rounded-lg shadow-sm border border-emerald-400/30">
                      {rec.scores.compositeScore}% Match
                    </span>

                    {/* Crop Name on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                        {t('alternative_num', { num: i + 1 })}
                      </span>
                      <h4 className="text-xl font-black text-white leading-tight drop-shadow-sm font-headline">
                        {cropTitle}
                      </h4>
                      <p className="text-xs text-white/90 font-medium">
                        {cropSub}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/50 font-medium">
                      {rationaleText}
                    </p>

                    {/* Multi-Factor Score Indicators */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>{t('score_market_gap')}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {rec.scores.marketGapScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Seasonal Fit Score</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {rec.scores.seasonScore}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>{t('score_weather_alignment')}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {rec.scores.weatherScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
                    <span className="material-symbols-outlined text-sm text-emerald-600">trending_up</span>
                    <span>{t('over_months_trend', { trend: rec.priceTrend })}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePlantNow(rec.crop.id)}
                    className="text-white bg-primary hover:bg-primary-container px-3.5 py-2 rounded-xl flex items-center gap-1 font-bold shadow-sm transition hover:scale-105"
                  >
                    <span>{t('btn_plant_now')}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farmer Planting Modal Pre-Populated with Selected Crop */}
      <FarmerPlantingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCropId={selectedModalCropId}
        onSuccess={() => {
          setToastMessage('Planting logged successfully! Quota risk recalculated.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
}
