import React, { useState, useEffect, useContext, useRef } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import FarmerPlantingModal from '../components/FarmerPlantingModal';

// Master catalog of crops for autocomplete search & evaluation
const ALL_CROPS = [
  { id: 1, code: 'LEEKS', nameEn: 'Leeks', nameSi: 'ලීක්ස්', nameTa: 'லீக்ஸ்', days: 90, image: '/crops/leek.jpg', price: 280, category: 'Upcountry Vegetable' },
  { id: 2, code: 'CABBAGE', nameEn: 'Cabbage', nameSi: 'ගෝවා', nameTa: 'முட்டைக்கோஸ்', days: 75, image: '/crops/leek.jpg', price: 190, category: 'Upcountry Vegetable' },
  { id: 3, code: 'CARROT', nameEn: 'Carrot', nameSi: 'කැරට්', nameTa: 'கேரட்', days: 85, image: '/crops/carrot.jpg', price: 340, category: 'Upcountry Vegetable' },
  { id: 4, code: 'BEETROOT', nameEn: 'Beetroot', nameSi: 'බීට්රූට්', nameTa: 'பீட்ரூட்', days: 70, image: '/crops/beetroot.jpg', price: 260, category: 'Upcountry Vegetable' },
  { id: 5, code: 'POTATO', nameEn: 'Upcountry Potato', nameSi: 'අර්තාපල්', nameTa: 'உருளைக்கிழங்கு', days: 100, image: '/crops/radish.jpg', price: 390, category: 'Upcountry Vegetable' },
  { id: 6, code: 'BEANS', nameEn: 'Green Beans', nameSi: 'බෝංචි', nameTa: 'போஞ்சி', days: 60, image: '/crops/bush_beans.jpg', price: 320, category: 'Upcountry Vegetable' },
  { id: 7, code: 'TOMATO', nameEn: 'Tomato', nameSi: 'තක්කාලි', nameTa: 'தக்காளி', days: 75, image: '/crops/radish.jpg', price: 220, category: 'Upcountry Vegetable' },
  { id: 8, code: 'CAPSICUM', nameEn: 'Capsicum', nameSi: 'මාළු මිරිස්', nameTa: 'குடை மிளகாய்', days: 80, image: '/crops/leek.jpg', price: 460, category: 'Upcountry Vegetable' },
  { id: 9, code: 'RADISH', nameEn: 'Radish', nameSi: 'රාබු', nameTa: 'முள்ளங்கி', days: 45, image: '/crops/radish.jpg', price: 140, category: 'Upcountry Vegetable' },
  { id: 10, code: 'KNOLKHOL', nameEn: 'Knol-Khol', nameSi: 'නෝකෝල්', nameTa: 'நூல்கோல்', days: 55, image: '/crops/knol_khol.jpg', price: 180, category: 'Upcountry Vegetable' },
  { id: 11, code: 'SPRING_ONION', nameEn: 'Spring Onion', nameSi: 'ළූණු කොළ', nameTa: 'வெங்காய இலை', days: 50, image: '/crops/spring_onion.jpg', price: 280, category: 'Upcountry Vegetable' },
  { id: 12, code: 'LETTUCE', nameEn: 'Lettuce', nameSi: 'සලාද කොළ', nameTa: 'லெட்யூஸ்', days: 45, image: '/crops/spinach.jpg', price: 320, category: 'Upcountry Vegetable' },
  { id: 13, code: 'CELERY', nameEn: 'Celery', nameSi: 'සැල්දිරි', nameTa: 'செலரி', days: 70, image: '/crops/spinach.jpg', price: 420, category: 'Upcountry Vegetable' },
  { id: 14, code: 'BROCCOLI', nameEn: 'Broccoli', nameSi: 'බ්‍රොකොලි', nameTa: 'ப்ரோக்கோலி', days: 65, image: '/crops/knol_khol.jpg', price: 680, category: 'Upcountry Vegetable' },
  { id: 15, code: 'CAULIFLOWER', nameEn: 'Cauliflower', nameSi: 'මල්ගෝවා', nameTa: 'காலிஃபிளவர்', days: 70, image: '/crops/knol_khol.jpg', price: 380, category: 'Upcountry Vegetable' },
  { id: 16, code: 'PUMPKIN', nameEn: 'Pumpkin', nameSi: 'වට්ටක්කා', nameTa: 'பூசணி', days: 100, image: '/crops/carrot.jpg', price: 160, category: 'Adaptable Vegetable' },
  { id: 17, code: 'BITTER_GOURD', nameEn: 'Bitter Gourd', nameSi: 'කරවිල', nameTa: 'பாகற்காய்', days: 70, image: '/crops/bush_beans.jpg', price: 340, category: 'Adaptable Vegetable' },
  { id: 18, code: 'SNAKE_GOURD', nameEn: 'Snake Gourd', nameSi: 'පතෝල', nameTa: 'புடலங்காய்', days: 65, image: '/crops/bush_beans.jpg', price: 240, category: 'Adaptable Vegetable' },
  { id: 19, code: 'CUCUMBER', nameEn: 'Cucumber', nameSi: 'පිපිඤ්ඤා', nameTa: 'வெள்ளரிக்காய்', days: 50, image: '/crops/radish.jpg', price: 160, category: 'Adaptable Vegetable' },
  { id: 20, code: 'GREEN_CHILI', nameEn: 'Green Chili', nameSi: 'අමු මිරිස්', nameTa: 'பச்சை மிளகாய்', days: 90, image: '/crops/bush_beans.jpg', price: 650, category: 'Adaptable Vegetable' },
  { id: 21, code: 'RED_ONION', nameEn: 'Red Onion', nameSi: 'රතු ළූණු', nameTa: 'சிவப்பு வெங்காயம்', days: 75, image: '/crops/beetroot.jpg', price: 380, category: 'Adaptable Vegetable' },
  { id: 22, code: 'GOTUKOLA', nameEn: 'Centella (Gotukola)', nameSi: 'ගොටුකොළ', nameTa: 'வல்லாரை', days: 40, image: '/crops/gotukola.jpg', price: 120, category: 'Leafy Green' },
  { id: 23, code: 'KANGKUNG', nameEn: 'Water Spinach (Kangkung)', nameSi: 'කංකුං', nameTa: 'வள்ளல் கீரை', days: 30, image: '/crops/kangkung.jpg', price: 110, category: 'Leafy Green' },
  { id: 24, code: 'MUKUNUWENNA', nameEn: 'Mukunuwenna', nameSi: 'මුකුණුවැන්න', nameTa: 'முக்குனுவென்ன', days: 30, image: '/crops/mukunuwenna.jpg', price: 100, category: 'Leafy Green' },
  { id: 25, code: 'SPINACH', nameEn: 'Spinach', nameSi: 'නිවිති', nameTa: 'பசலைக் கீரை', days: 40, image: '/crops/spinach.jpg', price: 150, category: 'Leafy Green' }
];

const getCropImage = (cropId) => {
  const match = ALL_CROPS.find(c => c.id === Number(cropId));
  return match?.image || '/crops/leek.jpg';
};

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

  const searchContainerRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    const appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.scrollTo(0, 0);
    }
  }, []);

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

                  return (
                    <div
                      key={crop.id}
                      onClick={() => handleSelectCrop(crop)}
                      className="px-4 py-3 hover:bg-emerald-50/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={crop.image}
                          alt={crop.nameEn}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors font-headline">
                            {cropPrimary}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {cropSecondary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 block mb-0.5">
                          {crop.days} Days
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          Rs. {crop.price}/kg
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
      {!isSearching && searchResult && (
        <div className="bg-surface-container-lowest border-2 border-emerald-500/40 rounded-2xl p-6 shadow-card animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">eco</span>
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
                <div className="bg-white border border-outline-variant/40 hover:border-emerald-500/60 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group md:col-span-1">
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
                        isOverPlanted 
                          ? 'bg-red-600/90 border-red-400/30' 
                          : isWarning 
                          ? 'bg-amber-600/90 border-amber-400/30' 
                          : 'bg-emerald-600/90 border-emerald-400/30'
                      }`}>
                        {isOverPlanted ? `Over-Planted (${searchResult.riskPercentage}%)` : `${matchScore}% Match`}
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
                      <p className={`text-xs leading-relaxed p-3 rounded-xl border font-medium ${
                        isOverPlanted
                          ? 'bg-red-50/80 border-red-200 text-red-900'
                          : 'bg-emerald-50/60 border-emerald-200/60 text-slate-700'
                      }`}>
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
                      <p className={`text-lg font-black mt-0.5 ${isOverPlanted ? 'text-red-600' : 'text-emerald-700'}`}>
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
      )}

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
