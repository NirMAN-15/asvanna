import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import BroadcastModal from '../components/BroadcastModal';
import Pagination from '../components/Pagination';
import {
  Radio, PlusCircle, CheckCircle2, ShieldAlert, AlertTriangle, Info,
  TrendingUp, Calendar, MapPin, UserCheck, FileText, Check, Share2,
  Printer, X, Eye, Sparkles, Filter
} from 'lucide-react';

const SEED_BROADCASTS = [
  {
    id: 1,
    ref_code: 'BW-AGR-2026/09-01',
    category: 'CULTIVATION_GLUT',
    severity: 'CRITICAL',
    crop_code: 'LEEKS',
    affected_crops: 'Leeks (88% Saturated) & Carrot (85% Saturated)',
    saturation_pct: 88,
    title_en: 'Bandarawela Carrot & Leeks Cultivation Warning: Quota Exceeded',
    title_si: 'බණ්ඩාරවෙල කැරට් සහ ලීක්ස් අධික වගා අනතුරු ඇඟවීම: කෝටාව ඉක්මවා ඇත',
    title_ta: 'பண்டாரவளை கேரட் மற்றும் லீக்ஸ் அதிக நடவு எச்சரிக்கை: ஒதுக்கீடு மீறல்',
    message_en: 'Current regional leeks and carrot cultivation has exceeded 85% of market demand quota in the Bandarawela basin. A massive market glut is projected for the November harvest cycle. Farmers must immediately halt new seedings and prioritize smart alternatives to prevent catastrophic farmgate price drops.',
    message_si: 'වත්මන් කලාපීය ලීක්ස් සහ කැරට් වගාව බණ්ඩාරවෙල නිම්නයේ වෙළෙඳපොළ ඉල්ලුමෙන් 85% ඉක්මවා ඇත. නොවැම්බර් අස්වනු සමයේදී දැඩි අතිරික්තයක් අපේක්ෂා කෙරේ. මිල කඩා වැටීම වැළැක්වීම සඳහා කරුණාකර නව පාත්ති සකස් කිරීම වහාම නවත්වා නිර්දේශිත විකල්ප බෝග වගාවට යොමු වන්න.',
    message_ta: 'பண்டாரவளையில் லீக்ஸ் மற்றும் கேரட் பயிர்ச்செய்கை சந்தை தேவையை விட 85% அதிகமாகியுள்ளது. நவம்பர் அறுவடை காலத்தில் பெரும் சந்தை வீழ்ச்சி எதிர்பார்க்கப்படுகிறது. புதிய நடவுகளை உடனடியாக நிறுத்துங்கள்.',
    prescribed_actions: [
      'Halt new seed nursery preparation for Leeks and Carrots across Bandarawela Central and Kinigama.',
      'Shift scheduled parcels to high-demand smart alternatives: Beetroot, Radish, or Bush Beans.',
      'Register existing plantings in ASVANNA portal for priority surplus procurement matching.'
    ],
    target_division: 'Bandarawela Division (Kinigama, Bindunuwewa, Dowa)',
    officer_name: 'Sunil Weerasinghe',
    officer_designation: 'Divisional Agricultural Instructor (Bandarawela ASC)',
    sent_count: 142,
    created_at: '2026-09-24T18:30:00.000Z'
  },
  {
    id: 2,
    ref_code: 'BW-AGR-2026/09-02',
    category: 'AGRO_WEATHER',
    severity: 'WARNING',
    crop_code: 'POTATO',
    affected_crops: 'Potato, Tomato & Upcountry Leafy Greens',
    saturation_pct: null,
    title_en: 'Agro-Climate Advisory: Monsoonal Showers & Furrow Drainage Directive',
    title_si: 'කාලගුණ උපදේශය: මධ්‍යම ප්‍රමාණයේ මෝසම් වැසි සහ ජලවහන සූදානම',
    title_ta: 'வானிலை ஆலோசனை: மிதமான பருவமழை மற்றும் வடிகால் தயாரிப்பு',
    message_en: 'Bandarawela basin and Haputale slopes are forecasted to receive afternoon showers with rainfall up to 15mm-25mm. High humidity may induce early blight on young potato and tomato foliage. Ensure deep furrow drainage to avoid root rot and damp disease outbreaks.',
    message_si: 'බණ්ඩාරවෙල නිම්නයට සහ හපුතලේ ඉහළ බෑවුම්වලට මි.මී. 15-25 දක්වා වැසි ඇතිවිය හැක. අර්තාපල් සහ තක්කාලි පාත්තිවල ජලවහන කානු කඩිනමින් සුද්ද කර මුල් කුණුවීම සහ දිලීර රෝග පාලනයට වහාම පියවර ගන්න.',
    message_ta: 'பண்டாரவளை பகுதியில் 15-25 மி.மீ வரை மழை பெய்யக்கூடும். கிழங்கு மற்றும் தக்காளி பாத்திகளில் வடிகால் வசதிகளை உடனே சரிசெய்யவும்.',
    prescribed_actions: [
      'Dig 30cm deep inter-row drainage channels across potato and vegetable plots.',
      'Delay nitrogen foliar spraying until wet spell ceases to prevent soft rot.',
      'Inspect underside of tomato leaves for late blight water-soaked spots daily.'
    ],
    target_division: 'Bandarawela Basin & Haputale North',
    officer_name: 'Sunil Weerasinghe',
    officer_designation: 'Divisional Agricultural Instructor (Bandarawela ASC)',
    sent_count: 189,
    created_at: '2026-09-23T10:15:00.000Z'
  },
  {
    id: 3,
    ref_code: 'BW-AGR-2026/09-03',
    category: 'MARKET_PRICE',
    severity: 'ADVISORY',
    crop_code: 'BEETROOT',
    affected_crops: 'Beetroot & Radish (35% Supply Deficit)',
    saturation_pct: 42,
    title_en: 'Market Opportunity: High Keppetipola Demand for Beetroot & Radish',
    title_si: 'වෙළෙඳපොළ අවස්ථාව: බීට්රූට් සහ රාබු සඳහා ඉහළ මිලක් සහ ඉල්ලුමක්',
    title_ta: 'சந்தை வாய்ப்பு: பீட்ரூட் மற்றும் முள்ளங்கிக்கு அதிக தேவை மற்றும் விலை',
    message_en: 'Keppetipola Wholesale Economic Centre telemetry shows a 35% supply deficit for Grade-A Beetroot and Radish over the coming 60 days. Farmers planting Beetroot or Radish now are guaranteed high farmgate profit margins (Rs. 260-320/kg benchmark).',
    message_si: 'කැප්පෙටිපොළ ආර්ථික මධ්‍යස්ථානයේ ඉදිරි දින 60 සඳහා බීට්රූට් සහ රාබු සැපයුම 35% කින් පහත වැටී ඇත. දැන් බීට්රූට් හෝ රාබු වගා කරන ගොවීන්ට ඉහළ ලාභාංශ (කිලෝවට රු. 260-320) සහතික කෙරේ.',
    message_ta: 'கெப்பெட்டிபொல பொருளாதார மையத்தில் பீட்ரூட் மற்றும் முள்ளங்கிக்கான தேவை கணிசமாக அதிகரித்துள்ளது. அதிக லாபம் ஈட்டக்கூடிய வாய்ப்பு.',
    prescribed_actions: [
      'Log planned Beetroot parcels in the Crop Advisory system to reserve regional quota allocation.',
      'Coordinate with the ASVANNA Surplus Produce Hub for pre-harvest forward contracts with local hoteliers.'
    ],
    target_division: 'All Bandarawela Agrarian Centres',
    officer_name: 'Sunil Weerasinghe',
    officer_designation: 'Divisional Agricultural Instructor (Bandarawela ASC)',
    sent_count: 215,
    created_at: '2026-09-21T08:30:00.000Z'
  }
];

export default function Broadcasts() {
  const { lang, t } = useContext(LanguageContext);
  const { role } = useContext(AuthContext);

  const [broadcasts, setBroadcasts] = useState(SEED_BROADCASTS);
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'CULTIVATION_GLUT' | 'AGRO_WEATHER' | 'MARKET_PRICE'
  const [page, setPage] = useState(1);
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'new_broadcast');

  const fetchBroadcasts = async () => {
    try {
      const res = await API.get('/broadcasts?district=Badulla');
      if (res.data && res.data.data && res.data.data.length > 0) {
        // Merge with seed metadata for rich presentation
        const merged = res.data.data.map((item, idx) => {
          const fallback = SEED_BROADCASTS[idx % SEED_BROADCASTS.length];
          return {
            ...fallback,
            ...item,
            id: item.id || fallback.id,
            ref_code: item.ref_code || fallback.ref_code || `BW-DIR-${100 + (item.id || idx)}`,
            category: item.category || fallback.category || 'CULTIVATION_GLUT',
            severity: item.severity || fallback.severity || 'WARNING',
            prescribed_actions: item.prescribed_actions || fallback.prescribed_actions,
            affected_crops: item.affected_crops || fallback.affected_crops,
            officer_name: item.officer_name || fallback.officer_name,
            officer_designation: item.officer_designation || fallback.officer_designation
          };
        });
        setBroadcasts(merged);
      } else {
        setBroadcasts(SEED_BROADCASTS);
      }
    } catch (err) {
      console.warn('Utilizing Bandarawela seed broadcasts fallback:', err.message);
      setBroadcasts(SEED_BROADCASTS);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const getBroadcastTitle = (b) => {
    if (lang === 'si') return b.title_si || b.title_en;
    if (lang === 'ta') return b.title_ta || b.title_en;
    return b.title_en;
  };

  const getBroadcastMessage = (b) => {
    if (lang === 'si') return b.message_si || b.message_en;
    if (lang === 'ta') return b.message_ta || b.message_en;
    return b.message_en || b.message_si;
  };

  const filteredBroadcasts = activeCategory === 'ALL'
    ? broadcasts
    : broadcasts.filter(b => b.category === activeCategory);

  const toggleAcknowledge = (id) => {
    setAcknowledgedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 🏛️ MODERN HEADER WITH ASVANNA BRAND DESIGN                               */}
      {/* ========================================================================= */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>{t('bandarawela_agrarian_division', 'Bandarawela Agrarian Services Division')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{role === 'FARMER' ? t('officer_directives_title', 'Officer Directives & Alerts') : t('divisional_broadcasts_title', 'Divisional Advisory Broadcasts')}</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {t('broadcast_page_desc', 'Official regulatory notifications, regional crop quota warnings, and agro-weather advisories published directly by the Department of Agrarian Development for upcountry growers.')}
            </p>
          </div>

          {(role === 'OFFICER' || role === 'ADMIN') && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-container text-white rounded-2xl text-xs font-black shadow-md shadow-primary/20 transition tracking-wide cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('issue_official_directive', '+ Issue Official Directive')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-outline-variant/20">
          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('active_bulletins', 'Active Bulletins')}</p>
              <p className="text-base font-black text-slate-900">{broadcasts.length} {t('directives', 'Directives')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('critical_gluts', 'Critical Gluts')}</p>
              <p className="text-base font-black text-red-700">1 {t('over_planted', 'Over-Planted')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('connected_farmers', 'Connected Farmers')}</p>
              <p className="text-base font-black text-slate-900">215 {t('verified', 'Verified')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('pilot_basin', 'Pilot Basin')}</p>
              <p className="text-base font-black text-slate-900">Bandarawela ASC</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏷️ FILTER TABS                                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'ALL'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('all_bulletins', 'All Bulletins')} ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('CULTIVATION_GLUT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'CULTIVATION_GLUT'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>{t('cultivation_warnings', 'Cultivation Warnings')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('AGRO_WEATHER')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'AGRO_WEATHER'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('agro_weather_tab', 'Agro-Weather')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('MARKET_PRICE')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'MARKET_PRICE'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('market_deficits_tab', 'Market Deficits & Prices')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 🎨 SEVERITY OUTLINE COLOR SYSTEM GUIDE / LEGEND                           */}
      {/* ========================================================================= */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span>{t('outline_classification', 'Officer Alert Outline Classification:')}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border-2 border-red-500 text-red-800 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>{t('red_outline_desc', 'Red Outline: Warning & Emergency (Critical Glut / Quota Halt)')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border-2 border-amber-500 text-amber-800 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{t('yellow_outline_desc', 'Yellow Outline: Normal Warning (Weather / Precautionary)')}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border-2 border-emerald-500 text-emerald-800 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{t('green_outline_desc', 'Green Outline: Advisory & Opportunity (Deficit & Prices)')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📋 DIRECTIVE CARDS (Structured with Dynamic Severity Outlines)             */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        {filteredBroadcasts.length === 0 ? (
          <div className="py-16 px-6 text-center bg-surface-container-low/40 border border-dashed border-outline-variant/40 rounded-3xl space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto">
              <Radio className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="font-bold text-base text-on-surface">
              {lang === 'si' ? 'මෙම කාණ්ඩය යටතේ නිවේදන නොමැත' : 'No Directives in this Category'}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              {lang === 'si'
                ? 'තෝරාගත් කාණ්ඩය යටතේ නිකුත් කරන ලද සක්‍රීය කෘෂිකාර්මික උපදේශන හෝ අනතුරු ඇඟවීම් නොමැත.'
                : 'There are no active agrarian directives or alerts matching the selected category filter.'}
            </p>
          </div>
        ) : (
          <>
            {filteredBroadcasts.slice((page - 1) * 4, page * 4).map((b) => {
          const isAcked = acknowledgedAlerts[b.id];
          const sev = (b.severity || 'WARNING').toUpperCase();
          const isEmergency = sev === 'CRITICAL' || sev === 'EMERGENCY' || sev === 'HIGH';
          const isNormalWarning = sev === 'WARNING' || sev === 'MEDIUM' || sev === 'MODERATE';
          
          // Outline & Style Determination
          let outlineClass = 'border-2 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400/20';
          let topStripClass = 'bg-emerald-600';
          let badgeClass = 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400';
          let severityLabel = t('routine_advisory', 'ROUTINE ADVISORY');
          let subTag = t('routine_advisory_sub', 'Market Opportunity • Regular Agrarian Notice');
          let messageBoxBorder = 'border-l-4 border-emerald-500 bg-emerald-50/30';

          if (isEmergency) {
            outlineClass = 'border-2 border-red-500 shadow-md shadow-red-500/15 ring-1 ring-red-400/30';
            topStripClass = 'bg-red-600';
            badgeClass = 'bg-red-100 text-red-900 border-2 border-red-500 font-black';
            severityLabel = t('emergency_critical_warning', 'EMERGENCY & CRITICAL WARNING');
            subTag = t('emergency_critical_sub', 'Immediate Regulatory Action • Quota Halt Enforced');
            messageBoxBorder = 'border-l-4 border-red-500 bg-red-50/40 text-red-950';
          } else if (isNormalWarning) {
            outlineClass = 'border-2 border-amber-500 shadow-md shadow-amber-500/15 ring-1 ring-amber-400/30';
            topStripClass = 'bg-amber-500';
            badgeClass = 'bg-amber-100 text-amber-900 border-2 border-amber-500 font-black';
            severityLabel = t('normal_warning', 'NORMAL WARNING');
            subTag = t('normal_warning_sub', 'Precautionary Directive • Agro-Weather or Disease Alert');
            messageBoxBorder = 'border-l-4 border-amber-500 bg-amber-50/40 text-amber-950';
          }

          return (
            <div
              key={b.id}
              className={`bg-surface-container-lowest rounded-3xl p-6 transition-all hover:shadow-xl relative overflow-hidden ${outlineClass}`}
            >
              {/* Category Top Strip Accent */}
              <div className={`h-2 absolute top-0 left-0 right-0 ${topStripClass}`} />

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-surface-container text-slate-700 border border-outline-variant/40">
                      REF: {b.ref_code || `BW-DIR-${b.id}`}
                    </span>

                    <span className={`px-3 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1.5 ${badgeClass}`}>
                      {isEmergency && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                      {isNormalWarning && <Radio className="w-3.5 h-3.5 text-amber-600" />}
                      {!isEmergency && !isNormalWarning && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{severityLabel}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 bg-surface-container-low px-2 py-0.5 rounded-md border border-outline-variant/20">
                      {subTag}
                    </span>

                    {b.affected_crops && (
                      <span className="text-[11px] font-bold text-slate-800 bg-surface-container-low px-2.5 py-0.5 rounded-lg border border-outline-variant/30 flex items-center gap-1">
                        <span>🌱</span>
                        <span>{b.affected_crops}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline font-black text-slate-900 text-lg sm:text-xl tracking-tight pt-0.5">
                    {getBroadcastTitle(b)}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <span>{b.officer_name || 'Sunil Weerasinghe'} ({b.officer_designation || 'Agricultural Instructor'})</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(b.created_at).toLocaleDateString()} at {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start flex-shrink-0">
                  <button
                    onClick={() => setSelectedNoticeForModal(b)}
                    className="px-3.5 py-2 rounded-xl bg-surface-container text-slate-800 hover:bg-surface-container-high border border-outline-variant/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{t('view_official_form', 'View Official Form')}</span>
                  </button>
                </div>
              </div>

              {/* Directive Body Notice Box */}
              <div className={`mt-4 p-4 rounded-2xl space-y-3 ${messageBoxBorder}`}>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {getBroadcastMessage(b)}
                </p>

                {/* Prescribed Action Checklist */}
                {b.prescribed_actions && b.prescribed_actions.length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/20 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('prescribed_actions_farmers', 'Prescribed Action Directives for Farmers:')}</span>
                    </p>
                    <div className="space-y-1">
                      {b.prescribed_actions.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('target_area', 'Target Area:')} <strong className="text-slate-800">{b.target_division || 'Bandarawela Division'}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-900 font-bold bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('dispatched_to_growers', 'Dispatched to {count} Registered Growers', { count: b.sent_count || 142 }).replace('{count}', b.sent_count || 142)}</span>
                  </span>

                  {role === 'FARMER' && (
                    <button
                      onClick={() => toggleAcknowledge(b.id)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                        isAcked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-surface-container text-slate-700 hover:bg-surface-container-high border border-outline-variant/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAcked ? t('acknowledged', 'Acknowledged') : t('acknowledge_notice', 'Acknowledge Notice')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Pagination
          currentPage={page}
          totalItems={filteredBroadcasts.length}
          itemsPerPage={4}
          onPageChange={setPage}
        />
      </>
    )}
  </div>

      {/* ========================================================================= */}
      {/* 📄 WELL-DETAILED OFFICIAL DIRECTIVE FORM MODAL                           */}
      {/* ========================================================================= */}
      {selectedNoticeForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 border border-outline-variant/30 my-8 animate-scaleUp space-y-6">
            {/* Modal Header & Close */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-slate-900">
                    Official Agrarian Directive Notice
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Department of Agrarian Development • Bandarawela Agrarian Services Centre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Letterhead / Detailed Form Layout */}
            <div className="border border-slate-300 rounded-2xl p-5 bg-white space-y-4 text-xs font-medium text-slate-800 shadow-xs">
              {/* Form Top Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 text-[11px] text-slate-600 font-mono">
                <div>
                  <span className="font-bold text-slate-800">FORM REF:</span> {selectedNoticeForModal.ref_code}
                </div>
                <div>
                  <span className="font-bold text-slate-800">CIRCULAR TYPE:</span> AGR-DIR/BW-{selectedNoticeForModal.category}
                </div>
                <div>
                  <span className="font-bold text-slate-800">DATE:</span> {new Date(selectedNoticeForModal.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Title & Severity */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-black rounded uppercase bg-red-100 text-red-900 border border-red-200">
                    {selectedNoticeForModal.severity}
                  </span>
                  <span className="text-[11px] font-bold text-primary">
                    Agrarian Division: {selectedNoticeForModal.target_division}
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-900 font-headline leading-snug">
                  {selectedNoticeForModal.title_en}
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  {selectedNoticeForModal.title_si}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Affected Commodity:</span>
                  <strong className="text-slate-900">{selectedNoticeForModal.affected_crops}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Saturation Level:</span>
                  <strong className="text-red-700">{selectedNoticeForModal.saturation_pct ? `${selectedNoticeForModal.saturation_pct}% of Max Quota` : 'Elevated Risk'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Issuing Officer:</span>
                  <strong className="text-slate-900">{selectedNoticeForModal.officer_name}</strong>
                </div>
              </div>

              {/* Full Notice Content (Trilingual Form Presentation) */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  1. Official Statement & Market Evaluation
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedNoticeForModal.message_en}
                </p>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                  <span className="font-bold block text-emerald-950 mb-0.5">සිංහල උපදේශය (Sinhala Translation):</span>
                  {selectedNoticeForModal.message_si}
                </div>
              </div>

              {/* Prescribed Action Points */}
              {selectedNoticeForModal.prescribed_actions && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    2. Mandatory Regulatory Actions & Farmer Directives
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedNoticeForModal.prescribed_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Seal and Sign-off */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">Authorized by:</p>
                  <p>{selectedNoticeForModal.officer_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedNoticeForModal.officer_designation}</p>
                </div>
                <div className="flex items-center gap-2 border border-slate-300 p-2 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/50 flex items-center justify-center font-bold text-primary text-[10px]">
                    ASC
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase">Verified Government Directive</p>
                    <p className="text-[9px] text-slate-500">Bandarawela Upcountry Agrarian Basin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Distributed via ASVANNA push notifications & SMS.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-slate-700 hover:bg-surface-container transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeForModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal for Officers */}
      <BroadcastModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBroadcastSent={fetchBroadcasts}
      />
    </div>
  );
}
