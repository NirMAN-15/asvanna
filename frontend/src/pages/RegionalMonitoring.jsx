import React, { useState, useContext } from 'react';
import { MapPin, Filter, Layers, Navigation, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function RegionalMonitoring() {
  const { t, lang } = useContext(LanguageContext);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantings, setPlantings] = useState([]);

  React.useEffect(() => {
    // Attempt to fetch real planting data
    import('../services/api').then(({ default: API }) => {
      API.get('/planting/logs?district=Badulla')
        .then(res => {
          if (res.data?.data) {
            setPlantings(res.data.data);
          }
        })
        .catch(err => console.warn('Failed to fetch plantings', err));
    });
  }, []);

  const filteredPlantings = selectedCrop
    ? plantings.filter(p => p.name_en?.toLowerCase() === selectedCrop.toLowerCase())
    : plantings;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header with Dark & Bold Letters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <MapPin className="w-5 h-5 text-emerald-800" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('regional_monitoring_title')}
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-2 max-w-2xl leading-relaxed">
            {t('regional_monitoring_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3.5 py-2.5 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Filter className="w-4 h-4 text-slate-600" />
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs bg-transparent text-slate-900 focus:outline-none font-black cursor-pointer"
          >
            <option value="" className="text-slate-900 font-bold">{t('all_crops_filter')}</option>
            <option value="Leeks" className="text-slate-900 font-bold">{t('crop_leeks')}</option>
            <option value="Cabbage" className="text-slate-900 font-bold">{t('crop_cabbage')}</option>
            <option value="Carrot" className="text-slate-900 font-bold">{t('crop_carrot')}</option>
            <option value="Beetroot" className="text-slate-900 font-bold">{t('crop_beetroot')}</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Visual Grid with Dark & Bold Letters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-800">
            <Navigation className="w-4 h-4 text-emerald-700" />
            <span>{t('bandarawela_gps_grid')}</span>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
            {t('active_regional_clusters')}
          </span>
        </div>

        {/* Map Plot Pin Grid Cards with Dark & Bold Letters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPlantings.map((plot) => {
            const cropDisplay = lang === 'si' ? plot.name_si : `${plot.name_en} (${plot.name_si})`;
            const statusLabel = plot.status === 'OVER_PLANTED' 
              ? t('status_over_planted') 
              : plot.status === 'WARNING' 
              ? t('status_warning') 
              : t('status_safe');

            return (
              <div
                key={plot.id}
                className={`p-4 rounded-xl border transition-all ${
                  plot.status === 'OVER_PLANTED'
                    ? 'bg-red-50/90 border-red-200 shadow-xs'
                    : plot.status === 'WARNING'
                    ? 'bg-amber-50/90 border-amber-200 shadow-xs'
                    : 'bg-emerald-50/80 border-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black flex items-center gap-1 tracking-tight ${
                    plot.status === 'OVER_PLANTED'
                      ? 'text-red-950'
                      : plot.status === 'WARNING'
                      ? 'text-amber-950'
                      : 'text-emerald-950'
                  }`}>
                    <MapPin className={`w-3.5 h-3.5 ${
                      plot.status === 'OVER_PLANTED'
                        ? 'text-red-700'
                        : plot.status === 'WARNING'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`} />
                    {cropDisplay}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      plot.status === 'OVER_PLANTED'
                        ? 'bg-red-100 text-red-900 border border-red-200'
                        : plot.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-900 font-black">{plot.farmer_name}</p>
                <p className="text-xs text-slate-700 font-bold mt-0.5">{plot.division}</p>
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{t('plot_acres', { acres: plot.land_size_acres })}</span>
                  <span className={`font-mono font-black ${
                    plot.status === 'OVER_PLANTED'
                      ? 'text-red-950'
                      : plot.status === 'WARNING'
                      ? 'text-amber-950'
                      : 'text-emerald-950'
                  }`}>{plot.lat}, {plot.lng}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Plot Log List with Dark & Bold Letters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card">
        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-700" />
          <span>{t('recently_registered_records')}</span>
        </h3>
        <div className="space-y-3">
          {filteredPlantings.map((p) => {
            const cropDisplay = lang === 'si' ? p.name_si : `${p.name_en} (${p.name_si})`;
            return (
              <div
                key={p.id}
                className="p-4 bg-slate-50/90 hover:bg-emerald-50/40 rounded-xl border border-slate-200 hover:border-emerald-300 flex flex-col md:flex-row md:items-center justify-between gap-3 transition shadow-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-slate-900 text-base tracking-wide">{p.farmer_name}</h4>
                    <span className="text-xs font-bold text-slate-600">({p.farmer_phone})</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-1 leading-relaxed">
                    {t('label_location')}: <strong className="text-slate-900 font-black">{p.division}</strong> • {t('label_cultivated')}: <strong className="text-slate-900 font-black">{p.land_size_acres} Acres</strong> • {t('label_date')}: <strong className="text-slate-900 font-mono font-bold">{p.planting_date}</strong>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 font-black rounded-xl text-xs tracking-wider">
                    {cropDisplay}
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-700 hidden md:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
