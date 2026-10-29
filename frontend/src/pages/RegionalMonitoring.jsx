import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Filter, Layers, Navigation, Phone, Calendar } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import { MASTER_CROPS } from '../constants/crops';
import Pagination from '../components/Pagination';

// Status styling & color configuration based on regional cultivation risk
const CROP_STATUS_CONFIG = {
  BEANS: {
    status: 'SAFE',
    labelEn: 'Safe Demand',
    labelSi: 'සුරක්ෂිතයි',
    labelTa: 'பாதுகாப்பானது',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  },
  CAPSICUM: {
    status: 'SAFE',
    labelEn: 'Safe Demand',
    labelSi: 'සුරක්ෂිතයි',
    labelTa: 'பாதுகாப்பானது',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  },
  RADISH: {
    status: 'SAFE',
    labelEn: 'Safe Demand',
    labelSi: 'සුරක්ෂිතයි',
    labelTa: 'பாதுகாப்பானது',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  },
  CAULIFLOWER: {
    status: 'SAFE',
    labelEn: 'Safe Demand',
    labelSi: 'සුරක්ෂිතයි',
    labelTa: 'பாதுகாப்பானது',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
  },
  TOMATO: {
    status: 'WARNING',
    labelEn: 'Moderate Risk',
    labelSi: 'අවධානයෙන්',
    labelTa: 'எச்சரிக்கை',
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300'
  },
  KNOLKHOL: {
    status: 'WARNING',
    labelEn: 'Moderate Risk',
    labelSi: 'අවධානයෙන්',
    labelTa: 'எச்சரிக்கை',
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300'
  },
  BEETROOT: {
    status: 'WARNING',
    labelEn: 'Moderate Risk',
    labelSi: 'අවධානයෙන්',
    labelTa: 'எச்சரிக்கை',
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300'
  },
  CARROT: {
    status: 'OVER_PLANTED',
    labelEn: 'Over-Planted',
    labelSi: 'අධි-වගා',
    labelTa: 'அதிக உற்பத்தி',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/40 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 border border-red-300'
  },
  LEEKS: {
    status: 'OVER_PLANTED',
    labelEn: 'Over-Planted',
    labelSi: 'අධි-වගා',
    labelTa: 'அதிக உற்பத்தி',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/40 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 border border-red-300'
  },
  CABBAGE: {
    status: 'OVER_PLANTED',
    labelEn: 'Over-Planted',
    labelSi: 'අධි-වගා',
    labelTa: 'அதிக உற்பத்தி',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/40 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 border border-red-300'
  },
  BROCCOLI: {
    status: 'OVER_PLANTED',
    labelEn: 'Over-Planted',
    labelSi: 'අධි-වගා',
    labelTa: 'அதிக உற்பத்தி',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/40 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 border border-red-300'
  },
  POTATO: {
    status: 'OVER_PLANTED',
    labelEn: 'Over-Planted',
    labelSi: 'අධි-වගා',
    labelTa: 'அதிக உற்பத்தி',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/40 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 border border-red-300'
  }
};

const DEFAULT_CONFIG = {
  status: 'SAFE',
  labelEn: 'Active Plot',
  labelSi: 'ක්‍රියාකාරී බිම',
  labelTa: 'செயலில் உள்ள நிலம்',
  border: 'border-emerald-300 dark:border-emerald-700',
  bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
  badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300'
};

export default function RegionalMonitoring() {
  const { t, lang } = useContext(LanguageContext);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantings, setPlantings] = useState([]);
  const [clustersPage, setClustersPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);

  const fetchPlantings = () => {
    API.get('/planting/regional-map?district=Badulla')
      .then(res => {
        if (res.data?.data) {
          setPlantings(res.data.data);
        }
      })
      .catch(err => console.warn('Failed to fetch plantings', err));
  };

  useEffect(() => {
    fetchPlantings();
  }, []);

  useEffect(() => {
    setClustersPage(1);
    setRecordsPage(1);
  }, [selectedCrop]);

  const filteredPlantings = selectedCrop
    ? plantings.filter(p => (
        (p.name_en && p.name_en.toLowerCase() === selectedCrop.toLowerCase()) ||
        (p.crop_code && p.crop_code.toLowerCase() === selectedCrop.toLowerCase())
      ))
    : plantings;

  const recentRecords = [...filteredPlantings].sort((a, b) => {
    const dateA = new Date(a.planting_date || a.created_at || 0).getTime();
    const dateB = new Date(b.planting_date || b.created_at || 0).getTime();
    return dateB - dateA || (Number(b.id) - Number(a.id));
  });

  const paginatedClusters = filteredPlantings.slice((clustersPage - 1) * 6, clustersPage * 6);
  const paginatedRecords = recentRecords.slice((recordsPage - 1) * 6, recordsPage * 6);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return String(dateStr).slice(0, 10);
  };

  const getCropMeta = (cropCode, nameEn) => {
    const code = (cropCode || '').toUpperCase().trim();
    const matchedMaster = MASTER_CROPS.find(
      c => c.code === code || c.crop_code === code || (nameEn && c.nameEn.toLowerCase() === nameEn.toLowerCase())
    );
    const cfg = CROP_STATUS_CONFIG[code] || DEFAULT_CONFIG;
    return {
      emoji: matchedMaster?.emoji || '🌱',
      nameEn: matchedMaster?.nameEn || nameEn || code,
      nameSi: matchedMaster?.nameSi || '',
      nameTa: matchedMaster?.nameTa || '',
      cfg
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <MapPin className="w-5 h-5 text-emerald-800" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('regional_monitoring_title', '🗺️ Regional Cultivation Heatmap')}
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-2 max-w-2xl leading-relaxed">
            {t('regional_monitoring_subtitle', 'GPS-Tagged Active Planting Plots Across Bandarawela & Upcountry Agrarian Divisions — Crop, Extent & Farmer Details')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3.5 py-2.5 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Filter className="w-4 h-4 text-slate-600" />
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs bg-transparent text-slate-900 focus:outline-none font-black cursor-pointer"
          >
            <option value="" className="text-slate-900 font-bold">{t('all_crops_filter', 'All Crops')}</option>
            {MASTER_CROPS.map(c => {
              const label = lang === 'si' ? c.nameSi : lang === 'ta' ? c.nameTa : c.nameEn;
              return (
                <option key={c.id} value={c.nameEn} className="text-slate-900 font-bold">
                  {c.emoji} {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Two-Column Side-by-Side Grid Layout: Left = Clusters, Right = Recent Records */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Active Regional Clusters */}
        <div className="w-full min-w-0 overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800">
                <Navigation className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{t('bandarawela_gps_grid', 'Bandarawela GPS Grid (Latitude 6.8322° N, Longitude 80.9980° E)')}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
                {t('active_regional_clusters', 'Active Regional Clusters')} ({filteredPlantings.length})
              </span>
            </div>

            {paginatedClusters.length === 0 ? (
              <div className="bg-surface-container-low/40 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center space-y-2">
                <p className="text-xs text-on-surface-variant font-medium">
                  {lang === 'si' ? 'ගැලපෙන කලාපීය බෝග බිම් හමු නොවීය.' : 'No active cluster plots found for the selected filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedClusters.map((plot) => {
                  const meta = getCropMeta(plot.crop_code, plot.name_en);
                  const cfg = meta.cfg;
                  const perches = Math.round((parseFloat(plot.land_size_acres) || 0) * 160);

                  return (
                    <div
                      key={`cluster_${plot.id}`}
                      className={`rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition space-y-3.5 flex flex-col justify-between border-2 ${cfg.border} ${cfg.bg}`}
                    >
                      <div className="space-y-3">
                        {/* Crop Title & Colored Risk Tag */}
                        <div className="flex items-start justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl" role="img" aria-label={meta.nameEn}>{meta.emoji}</span>
                              <h3 className="font-black text-base text-slate-900 truncate">
                                {lang === 'si' ? (plot.name_si || meta.nameSi || plot.name_en) : (plot.name_en || meta.nameEn)}
                              </h3>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                              {lang === 'si' ? (plot.name_en || meta.nameEn) : (plot.name_si || meta.nameSi)}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-black rounded-full flex-shrink-0 ${cfg.badge}`}>
                            {lang === 'si' ? cfg.labelSi : lang === 'ta' ? cfg.labelTa : cfg.labelEn}
                          </span>
                        </div>

                        {/* Planted Area Extent & Expected Yield */}
                        <div className="bg-white/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600">{t('cultivated_extent', 'Cultivated Extent')}:</span>
                            <span className="font-black text-slate-900 text-sm">
                              {plot.land_size_acres} Ac <span className="text-xs font-semibold text-slate-500">({perches} Perches)</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/60 pt-1.5">
                            <span className="font-semibold text-slate-500">{t('expected_yield', 'Expected Yield')}:</span>
                            <span className="font-bold text-slate-800">{Number(plot.expected_yield_kg || 0).toLocaleString()} kg</span>
                          </div>
                        </div>

                        {/* Farmer & Location Details (Read-Only) */}
                        <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 truncate">{plot.farmer_name || 'Farmer'}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md flex-shrink-0">
                              {plot.status || 'GROWING'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-mono">{plot.farmer_phone || '0771000000'}</span>
                            {plot.farmer_nic && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-slate-500">{plot.farmer_nic}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{plot.gnd_division || plot.farmer_division || plot.division || 'Bandarawela'}</span>
                          </div>
                          {plot.planting_date && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{t('planted_on', 'Planted')}: {formatDate(plot.planting_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Pagination
            currentPage={clustersPage}
            totalItems={filteredPlantings.length}
            itemsPerPage={6}
            onPageChange={setClustersPage}
          />
        </div>

        {/* RIGHT COLUMN: Recently Registered Cultivation Records */}
        <div className="w-full min-w-0 overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800">
                <Layers className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{t('recently_registered_records', 'Recently Registered Cultivation Records')}</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                {recentRecords.length} {t('records_logged', 'Logged')}
              </span>
            </div>

            {paginatedRecords.length === 0 ? (
              <div className="bg-surface-container-low/40 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center space-y-2">
                <p className="text-xs text-on-surface-variant font-medium">
                  {lang === 'si' ? 'මෑතකදී ලියාපදිංචි කළ බෝග වගා වාර්තා නොමැත.' : 'No recent cultivation records found.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedRecords.map((record) => {
                  const meta = getCropMeta(record.crop_code, record.name_en);
                  const cfg = meta.cfg;
                  const formattedDate = formatDate(record.planting_date);
                  const perches = Math.round((parseFloat(record.land_size_acres) || 0) * 160);

                  return (
                    <div
                      key={`record_${record.id}`}
                      className={`rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition space-y-3.5 flex flex-col justify-between border-2 ${cfg.border} ${cfg.bg}`}
                    >
                      <div className="space-y-3">
                        {/* Crop Title & Colored Risk Tag */}
                        <div className="flex items-start justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl" role="img" aria-label={meta.nameEn}>{meta.emoji}</span>
                              <h3 className="font-black text-base text-slate-900 truncate">
                                {lang === 'si' ? (record.name_si || meta.nameSi || record.name_en) : (record.name_en || meta.nameEn)}
                              </h3>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                              {lang === 'si' ? (record.name_en || meta.nameEn) : (record.name_si || meta.nameSi)}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-black rounded-full flex-shrink-0 ${cfg.badge}`}>
                            {lang === 'si' ? cfg.labelSi : lang === 'ta' ? cfg.labelTa : cfg.labelEn}
                          </span>
                        </div>

                        {/* Planted Area Extent & Expected Yield */}
                        <div className="bg-white/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-600">{t('cultivated_extent', 'Cultivated Extent')}:</span>
                            <span className="font-black text-slate-900 text-sm">
                              {record.land_size_acres} Ac <span className="text-xs font-semibold text-slate-500">({perches} Perches)</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/60 pt-1.5">
                            <span className="font-semibold text-slate-500">{t('expected_yield', 'Expected Yield')}:</span>
                            <span className="font-bold text-slate-800">{Number(record.expected_yield_kg || 0).toLocaleString()} kg</span>
                          </div>
                        </div>

                        {/* Farmer & Location Details (Read-Only) */}
                        <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 truncate">{record.farmer_name || 'Farmer'}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md flex-shrink-0">
                              {record.status || 'GROWING'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-mono">{record.farmer_phone || '0771000000'}</span>
                            {record.farmer_nic && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-slate-500">{record.farmer_nic}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{record.gnd_division || record.farmer_division || record.division || 'Bandarawela'}</span>
                          </div>
                          {formattedDate && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{t('planted_on', 'Planted')}: {formattedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Pagination
            currentPage={recordsPage}
            totalItems={recentRecords.length}
            itemsPerPage={6}
            onPageChange={setRecordsPage}
          />
        </div>
      </div>
    </div>
  );
}
