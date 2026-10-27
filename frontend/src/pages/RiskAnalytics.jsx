import React, { useState, useEffect, useContext, useRef } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import FarmerPlantingModal from '../components/FarmerPlantingModal';
import { MASTER_CROPS, getCropImage } from '../constants/crops';

export const getRiskTheme = (riskLevel) => {
  const level = (riskLevel || '').toUpperCase();
  if (level === 'SAFE') {
    return {
      level: 'SAFE',
      colorName: 'emerald',
      labelEn: 'SAFE TO CULTIVATE • LOW REGIONAL RISK',
      labelSi: 'වගාවට ඉතා හිතකරයි • අඩු කලාපීය අවදානම',
      labelTa: 'பயிரிட பாதுகாப்பானது • குறைந்த பிராந்திய ஆபத்து',
      subTextEn: 'Healthy quota margin with strong price stability in Bandarawela markets.',
      subTextSi: 'නියමිත කෝටාව ඉක්මවා නොමැති අතර බණ්ඩාරවෙල වෙළෙඳපොළේ ස්ථාවර මිලක් අපේක්ෂා කළ හැක.',
      subTextTa: 'ஆரோக்கியமான ஒதுக்கீட்டு வரம்பு மற்றும் நிலையான சந்தை விலை.',
      containerBorder: 'border-2 border-emerald-500 bg-emerald-50/20 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/20',
      cardBorder: 'border-2 border-emerald-400 hover:border-emerald-500 shadow-md shadow-emerald-500/15',
      badge: 'bg-emerald-600 text-white border-emerald-400/40 shadow-xs',
      lightBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-300/70',
      icon: 'check_circle',
      iconColor: 'text-emerald-600',
      bannerBg: 'bg-emerald-500/15 border-emerald-300 text-emerald-950',
      rationaleBox: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
      statusText: 'text-emerald-700'
    };
  } else if (level === 'WARNING') {
    return {
      level: 'WARNING',
      colorName: 'amber',
      labelEn: 'MODERATE RISK • PROCEED WITH CAUTION',
      labelSi: 'මධ්‍යස්ථ අවදානම • සැලකිලිමත් වන්න (අධීක්ෂණය යටතේ වගා කරන්න)',
      labelTa: 'மிதமான ஆபத்து • கவனமாக தொடரவும்',
      subTextEn: 'Approaching regional production quota. Stagger sowing cycles to avoid harvest glut.',
      subTextSi: 'කලාපීය ඉලක්කගත කෝටාව ඉක්මවීමට ආසන්නයි. එකවර අස්වනු නොඑන පරිදි වගා කරන්න.',
      subTextTa: 'பிராந்திய ஒதுக்கீட்டை நெருங்குகிறது. அறுவடை நெரிசலைத் தவிர்க்க தள்ளி நடவும்.',
      containerBorder: 'border-2 border-amber-500 bg-amber-50/20 shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/20',
      cardBorder: 'border-2 border-amber-400 hover:border-amber-500 shadow-md shadow-amber-500/15',
      badge: 'bg-amber-600 text-white border-amber-400/40 shadow-xs',
      lightBadge: 'bg-amber-100 text-amber-800 border-amber-300',
      pillBg: 'bg-amber-50 text-amber-700 border-amber-300/70',
      icon: 'warning',
      iconColor: 'text-amber-600',
      bannerBg: 'bg-amber-500/15 border-amber-300 text-amber-950',
      rationaleBox: 'bg-amber-50/90 border-amber-200 text-amber-950',
      statusText: 'text-amber-700'
    };
  } else {
    // OVER_PLANTED / CRITICAL / HIGH_RISK / DANGER / or else
    return {
      level: 'OVER_PLANTED',
      colorName: 'rose',
      labelEn: 'HIGH RISK • OVER-PLANTED GLUT WARNING',
      labelSi: 'අධි-වගා අවදානම • වෙළෙඳපොළ අතිරික්තයක් හා මිල පහත වැටීමේ අවදානමක් පවතී',
      labelTa: 'அதிக ஆபத்து • மிகை நடவு சந்தை வீழ்ச்சி எச்சரிக்கை',
      subTextEn: 'Regional quota saturated! We strongly advise diversifying into recommended alternative crops.',
      subTextSi: 'කලාපීය කෝටාව සම්පූර්ණයෙන්ම පිරී ඇත! පහත නිර්දේශිත විකල්ප බෝග වගා කිරීමට උපදෙස් දෙනු ලැබේ.',
      subTextTa: 'பிராந்திய ஒதுக்கீடு நிரம்பியுள்ளது! பரிந்துரைக்கப்பட்ட மாற்றுப் பயிர்களை பயிரிடவும்.',
      containerBorder: 'border-2 border-rose-500 bg-rose-50/20 shadow-xl shadow-rose-500/10 ring-4 ring-rose-500/20',
      cardBorder: 'border-2 border-rose-400 hover:border-rose-500 shadow-md shadow-rose-500/15',
      badge: 'bg-rose-600 text-white border-rose-400/40 shadow-xs',
      lightBadge: 'bg-rose-100 text-rose-800 border-rose-300',
      pillBg: 'bg-rose-50 text-rose-700 border-rose-300/70',
      icon: 'dangerous',
      iconColor: 'text-rose-600',
      bannerBg: 'bg-rose-500/15 border-rose-300 text-rose-950',
      rationaleBox: 'bg-rose-50/90 border-rose-200 text-rose-950',
      statusText: 'text-rose-700'
    };
  }
};

const ALL_CROPS = MASTER_CROPS;

export default function RiskAnalytics() {
  const { t, lang } = useContext(LanguageContext);
  
  // Read query from URL if exists
  const initialQuery = new URLSearchParams(window.location.search).get('query') || '';
  const [searchCrop, setSearchCrop] = useState(initialQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModalCropId, setSelectedModalCropId] = useState(4);
  const [toastMessage, setToastMessage] = useState(null);
  const [cropRiskMap, setCropRiskMap] = useState({});

  const searchContainerRef = useRef(null);

  // Scroll to top and fetch regional crop risks on mount
  useEffect(() => {
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.scrollTo(0, 0);
    }
    fetchRegionalRisks();
  }, []);

  const fetchRegionalRisks = async () => {
    try {
      const res = await API.get('/risk/regional?district=Badulla');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const map = {};
        res.data.data.forEach(item => {
          if (item.crop?.id) map[item.crop.id] = item.riskLevel;
          if (item.crop?.code) map[item.crop.code] = item.riskLevel;
          if (item.crop?.crop_code) map[item.crop.crop_code] = item.riskLevel;
        });
        setCropRiskMap(map);
      }
    } catch (e) {
      console.warn('Could not fetch regional crop risk map:', e);
    }
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter dropdown suggestions based on input
  const filteredSuggestions = ALL_CROPS.filter(crop => {
    if (!searchCrop || !searchCrop.trim()) return true;
    const q = searchCrop.toLowerCase().trim();
    return (
      crop.nameEn.toLowerCase().includes(q) ||
      crop.nameSi.includes(q) ||
      crop.nameTa.includes(q) ||
      crop.code.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  // Evaluate risk when crop is selected from dropdown
  const handleSelectCrop = async (crop) => {
    const activeName = lang === 'si' ? crop.nameSi : lang === 'ta' ? crop.nameTa : crop.nameEn;
    setSearchCrop(activeName);
    setIsDropdownOpen(false);
    setIsSearching(true);

    try {
      const res = await API.get(`/risk/${crop.id}?district=Badulla`);
      if (res.data?.data) {
        setSearchResult(res.data.data);
      } else {
        const fallbackRes = await API.post('/risk/smart-search', { query: crop.nameEn });
        if (fallbackRes.data?.data?.matches?.length > 0) {
          setSearchResult(fallbackRes.data.data.matches[0]);
        }
      }
    } catch (err) {
      console.warn("Direct crop risk query failed, using synthesized result", err);
      // Clean fallback object with multi-factor scores
      setSearchResult({
        crop: {
          id: crop.id,
          code: crop.code,
          nameEn: crop.nameEn,
          nameSi: crop.nameSi,
          nameTa: crop.nameTa,
          category: crop.category,
          standardPricePerKg: crop.price
        },
        district: 'Badulla',
        division: 'Bandarawela',
        riskPercentage: crop.id === 1 ? 92.5 : 15,
        riskLevel: crop.id === 1 ? 'OVER_PLANTED' : 'SAFE',
        factors: {
          overPlanting: { score: crop.id === 1 ? 92 : 12, ratio: crop.id === 1 ? 92.5 : 35, demandQuotaKg: 95000, currentPlantedKg: 34000 },
          weather: { score: 8, temperatureScore: 95, rainfallScore: 92 },
          seasonal: { score: 20, status: 'IN_SEASON' },
          price: { score: 14, currentPrice: crop.price }
        }
      });
    } finally {
      setIsSearching(false);
    }
  };

  // If initialQuery present in URL, evaluate on mount
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      const match = ALL_CROPS.find(c => 
        c.nameEn.toLowerCase().includes(initialQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(initialQuery.toLowerCase())
      );
      if (match) {
        handleSelectCrop(match);
      }
    }
  }, [initialQuery]);

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
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80'
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
      image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&auto=format&fit=crop&q=80'
    },
    {
      crop: { id: 1, nameEn: 'Leeks', nameSi: 'ලීක්ස්', nameTa: 'லீக்ஸ்' },
      scores: { compositeScore: 84, marketGapScore: 82, seasonScore: 85, weatherScore: 88, priceScore: 82 },
      rationale: {
        en: 'Consistent hotel and wholesale demand across Keppetipola and Bandarawela markets.',
        si: 'කැප්පෙටිපොළ සහ බණ්ඩාරවෙල වෙළෙඳපොළවල් ඔස්සේ ස්ථාවර ඉල්ලුමක් පවතී.',
        ta: 'கெப்பட்டிப்பொல மற்றும் பண்டாரவளை சந்தைகளில் நிலையான தேவை நிலவுகிறது.'
      },
      priceTrend: '+15.0%',
      image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80'
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
      image: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80'
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
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80'
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
            compositeScore: item.scores?.compositeScore || 90,
            marketGapScore: item.scores?.marketGapScore || 85,
            seasonScore: item.scores?.seasonScore || 80,
            weatherScore: item.scores?.weatherScore || 85,
            priceScore: item.scores?.priceScore || 80
          },
          rationale: item.rationale,
          priceTrend: '+10.5%',
          image: getCropImage(item.crop.id)
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-secondary text-xs font-bold animate-slideDown">
          <span className="material-symbols-outlined text-secondary-fixed text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Autocomplete Dropdown Search */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
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

        {/* Dropdown Search Container */}
        <div ref={searchContainerRef} className="relative w-full sm:w-80 md:w-96">
          <div className="flex items-center gap-3 bg-surface-container border border-outline-variant/50 px-4 py-3 rounded-xl shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-slate-500 text-xl">search</span>
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => {
                setSearchCrop(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={t('search_crop_placeholder')}
              className="text-sm bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none font-bold w-full"
            />
            {searchCrop && (
              <button
                type="button"
                onClick={() => {
                  setSearchCrop('');
                  setSearchResult(null);
                  setIsDropdownOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
              </button>
            )}
            <span className="material-symbols-outlined text-slate-400 text-lg pointer-events-none">
              {isDropdownOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
            </span>
          </div>

          {/* Autocomplete Suggestions Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full bg-white border border-outline-variant/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn divide-y divide-slate-100 max-h-84 overflow-y-auto">
              <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>{t('suggested_vegetables', 'Suggested Vegetables')}</span>
                <span className="text-[10px] lowercase text-slate-400">{t('click_to_evaluate', 'click to evaluate')}</span>
              </div>

              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((crop) => {
                  const cropPrimary = lang === 'si' ? crop.nameSi : lang === 'ta' ? crop.nameTa : crop.nameEn;
                  const cropSecondary = lang === 'si' 
                    ? `${crop.nameEn} • ${crop.nameTa}` 
                    : lang === 'ta' 
                    ? `${crop.nameEn} • ${crop.nameSi}` 
                    : `${crop.nameSi} • ${crop.nameTa}`;

                  const cropRisk = cropRiskMap[crop.id] || cropRiskMap[crop.code] || 'SAFE';
                  const cropTheme = getRiskTheme(cropRisk);

                  return (
                    <div
                      key={crop.id}
                      onClick={() => handleSelectCrop(crop)}
                      className={`px-4 py-3 transition-colors cursor-pointer flex items-center justify-between gap-3 group ${
                        cropRisk === 'SAFE' 
                          ? 'hover:bg-emerald-50/80' 
                          : cropRisk === 'WARNING' 
                          ? 'hover:bg-amber-50/80' 
                          : 'hover:bg-rose-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={crop.image}
                            alt={crop.nameEn}
                            className={`w-11 h-11 rounded-xl object-cover border-2 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform ${
                              cropRisk === 'SAFE' 
                                ? 'border-emerald-400' 
                                : cropRisk === 'WARNING' 
                                ? 'border-amber-400' 
                                : 'border-rose-400'
                            }`}
                          />
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-xs"
                            style={{
                              backgroundColor: cropRisk === 'SAFE' ? '#10B981' : cropRisk === 'WARNING' ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors font-headline">
                            {cropPrimary}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {cropSecondary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${cropTheme.pillBg}`}>
                          <span>
                            {cropRisk === 'SAFE'
                              ? (lang === 'si' ? '🟢 ආරක්ෂිතයි' : lang === 'ta' ? '🟢 பாதுகாப்பானது' : '🟢 Safe')
                              : cropRisk === 'WARNING'
                              ? (lang === 'si' ? '🟡 අවධානම්' : lang === 'ta' ? '🟡 எச்சரிக்கை' : '🟡 Warning')
                              : (lang === 'si' ? '🔴 අධි-වගාව' : lang === 'ta' ? '🔴 மிகை நடவு' : '🔴 Over-Planted')}
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          Rs. {crop.price}/kg • {crop.days}d
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs font-semibold text-slate-500">
                  {lang === 'si' ? `'${searchCrop}' සඳහා බෝග හමු නොවීය` : `No vegetables found matching '${searchCrop}'`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Evaluating Search Loading State */}
      {isSearching && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-card flex items-center justify-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-primary text-2xl animate-spin">sync</span>
          <span className="text-slate-800 font-bold text-sm">Evaluating risk parameters & market saturation for {searchCrop}...</span>
        </div>
      )}

      {/* Searched Crop Result Card (Styled Exactly Like Image 2 with "Plant Now ->") */}
      {!isSearching && searchResult && (() => {
        const theme = getRiskTheme(searchResult.riskLevel);
        return (
          <div className={`bg-surface-container-lowest rounded-2xl p-6 shadow-card animate-fadeIn space-y-4 ${theme.containerBorder}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-2xl ${theme.iconColor}`}>eco</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-headline leading-tight">
                    {lang === 'si' ? 'විමසන ලද බෝගයේ තත්ත්ව විශ්ලේෂණය' : lang === 'ta' ? 'வினவப்பட்ட பயிர் நிலை பகுப்பாய்வு' : 'Queried Crop Intelligence Evaluation'}
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    {lang === 'si' ? 'බණ්ඩාරවෙල කලාපීය ඉල්ලුම හා කාලගුණය අනුව සකස් කරන ලදී' : 'Calibrated against Badulla & Bandarawela regional cultivation quotas'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchCrop('');
                  setSearchResult(null);
                }}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-xs font-bold transition px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200"
              >
                <span>{lang === 'si' ? 'ඉවත් කරන්න' : lang === 'ta' ? 'அழி' : 'Clear'}</span>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Prominent 3-Tier Risk Classification Top Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${theme.bannerBg}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-3xl sm:text-4xl ${theme.iconColor}`}>
                  {theme.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs ${theme.badge}`}>
                      {searchResult.riskLevel || 'EVALUATION'}
                    </span>
                    <h4 className="text-sm sm:text-base font-black leading-tight text-slate-900">
                      {lang === 'si' ? theme.labelSi : lang === 'ta' ? theme.labelTa : theme.labelEn}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    {lang === 'si' ? theme.subTextSi : lang === 'ta' ? theme.subTextTa : theme.subTextEn}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <div className={`text-2xl font-black ${theme.statusText}`}>
                  {searchResult.riskPercentage || 0}%
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'si' ? 'කෝටා අවදානම' : 'Quota Risk'}
                </div>
              </div>
            </div>

            {/* Single Focused Card Matching Image 2 Format */}
            {(() => {
            const cropObj = searchResult.crop || {};
            const cropId = cropObj.id || 1;
            const cropTitle = lang === 'si' 
              ? (cropObj.nameSi || cropObj.name_si || cropObj.nameEn || 'බෝගය') 
              : lang === 'ta' 
              ? (cropObj.nameTa || cropObj.name_ta || cropObj.nameEn || 'பயிர்') 
              : (cropObj.nameEn || cropObj.name_en || 'Crop');

            const cropSub = lang === 'si'
              ? `${cropObj.nameEn || cropObj.name_en || ''} • ${cropObj.nameTa || cropObj.name_ta || ''}`
              : lang === 'ta'
              ? `${cropObj.nameEn || cropObj.name_en || ''} • ${cropObj.nameSi || cropObj.name_si || ''}`
              : `${cropObj.nameSi || cropObj.name_si || ''} • ${cropObj.nameTa || cropObj.name_ta || ''}`;

            const isOverPlanted = searchResult.riskLevel === 'OVER_PLANTED';
            const isWarning = searchResult.riskLevel === 'WARNING';
            const matchScore = isOverPlanted ? 45 : (100 - (searchResult.riskPercentage || 15));
            const marketGap = Math.max(15, 100 - (searchResult.factors?.overPlanting?.score || searchResult.riskPercentage || 15));
            const seasonFit = Math.max(25, 100 - (searchResult.factors?.seasonal?.score || 25));
            const weatherAlign = searchResult.factors?.weather?.temperatureScore || 95;

            const rationaleText = isOverPlanted
              ? (lang === 'si' 
                  ? `බණ්ඩාරවෙල කලාපීය සැපයුම මේ වනවිට නියමිත මිණුම් දණ්ඩ ඉක්මවා ඇත (අවදානම: ${searchResult.riskPercentage}%). අස්වනු නෙළන විට වෙළඳපල මිල පහත වැටීමේ අවදානමක් පවතී.`
                  : `Bandarawela regional supply has exceeded the target benchmark threshold (Risk: ${searchResult.riskPercentage}%). Staggering or choosing alternative diversification is advised to avoid surplus glut.`)
              : (lang === 'si'
                  ? `බණ්ඩාරවෙල කලාපයේ ${cropTitle} සඳහා ඉහළ වෙළෙඳපොළ ඉල්ලුමක් හා හිතකර කාලගුණික තත්ත්වයක් පවතී (අවදානම: ${searchResult.riskPercentage}%). සාර්ථකව වගා කළ හැකිය.`
                  : `High market demand in Badulla with ${marketGap}% favorable regional quota gap. Optimal weather and temperature alignment in Bandarawela basin.`);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Visual Card (Directly like Image 2) */}
                <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group md:col-span-1 ${theme.cardBorder}`}>
                  <div>
                    {/* Photo Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getCropImage(cropId)}
                        alt={cropObj.nameEn || 'Crop'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                      {/* Match Score Badge */}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 backdrop-blur-md text-white text-xs font-black rounded-lg shadow-sm border ${
                        theme.badge
                      }`}>
                        {isOverPlanted ? `Over-Planted (${searchResult.riskPercentage}%)` : isWarning ? `Moderate Risk (${searchResult.riskPercentage}%)` : `${matchScore}% Match (Safe)`}
                      </span>

                      {/* Crop Name on Image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                          QUERIED CROP
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
                      <p className={`text-xs leading-relaxed p-3 rounded-xl border font-medium ${theme.rationaleBox}`}>
                        {rationaleText}
                      </p>

                      {/* Multi-Factor Score Indicators */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-600 font-medium">
                          <span>{t('score_market_gap')}</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {marketGap}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 font-medium">
                          <span>{t('seasonal_fit_score', 'Seasonal Fit Score')}</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {seasonFit}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 font-medium">
                          <span>{t('score_weather_alignment')}</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {weatherAlign}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with "Plant Now ->" */}
                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
                      <span className="material-symbols-outlined text-sm text-emerald-600">trending_up</span>
                      <span>+10.5% over 3 months</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlantNow(cropId)}
                      className="text-white bg-primary hover:bg-primary-container px-3.5 py-2 rounded-xl flex items-center gap-1 font-bold shadow-sm transition hover:scale-105"
                    >
                      <span>{t('btn_plant_now')}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Analysis Breakdown Alongside the Card */}
                <div className="md:col-span-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                      <span>{lang === 'si' ? 'කලාපීය කෝටා සහ වෙළෙඳපොළ තොරතුරු' : 'Regional Quota & Supply Chain Metrics'}</span>
                    </h4>
                    <span className="text-xs font-bold text-primary bg-primary-fixed/30 px-2.5 py-1 rounded-full border border-primary/20">
                      Bandarawela Division
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{t('standard_benchmark', 'Standard Benchmark')}</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">Rs. {cropObj.standardPricePerKg || '240'}/kg</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Keppetipola baseline</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{t('regional_target_demand', 'Regional Target Demand')}</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{(searchResult.targetDemandKg || 85000).toLocaleString()} kg</p>
                      <span className="text-[10px] text-slate-500 font-semibold">Badulla commercial zone</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">{t('risk_classification', 'Risk Classification')}</p>
                      <p className={`text-lg font-black mt-0.5 ${theme.statusText}`}>
                        {searchResult.riskLevel || 'SAFE'}
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold">{searchResult.riskPercentage || 15}% quota saturation</span>
                    </div>
                  </div>

                  {isOverPlanted && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 text-xl flex-shrink-0 mt-0.5">warning</span>
                      <p className="text-xs text-red-950 font-medium leading-relaxed">
                        {lang === 'si'
                          ? 'අවධානයයි: මෙම බෝගය මේ වනවිට කලාපීය ධාරිතාව ඉක්මවා ඇත. පහත දැක්වෙන නිර්දේශිත විකල්ප බෝග වගා කිරීමෙන් ඉහළ ලාභාංශයක් ලබාගත හැක.'
                          : 'Advisory: This crop has already exceeded regional safe capacity. We recommend selecting one of the recommended alternative crops below to avoid local supply surplus.'}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600 font-medium">
                      {t('ready_to_log_crop', 'Ready to log this crop for your land parcel?')}
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePlantNow(cropId)}
                      className="w-full sm:w-auto text-white bg-primary hover:bg-primary-container px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition hover:scale-102"
                    >
                      <span>{t('btn_plant_now')}</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        );
      })()}

      {/* Recommendations Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
            <span>{t('recommended_smart_alternatives')}</span>
          </h3>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {t('top_cropix_calibrated', 'Top 5 CROPIX Calibrated')}
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
