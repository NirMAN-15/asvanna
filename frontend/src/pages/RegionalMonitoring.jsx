import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Filter, Layers, Navigation, Phone, Edit, Calendar } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import { MASTER_CROPS } from '../constants/crops';
import Pagination from '../components/Pagination';
import EditFarmerModal from '../components/EditFarmerModal';

export default function RegionalMonitoring() {
  const { t, lang } = useContext(LanguageContext);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantings, setPlantings] = useState([]);
  const [clustersPage, setClustersPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const [editingFarmer, setEditingFarmer] = useState(null);

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

  const getCropDisplay = (item) => {
    if (!item) return '';
    if (lang === 'si') {
      return item.name_si || item.name_en || '';
    }
    if (lang === 'ta') {
      return item.name_ta || item.name_en || '';
    }
    return item.name_en ? `${item.name_en} (${item.name_si || ''})` : (item.name_si || '');
  };

  const handleOpenEdit = (item) => {
    setEditingFarmer({
      id: item.farmer_user_id || item.farmer_id || item.id,
      full_name: item.farmer_name || 'Farmer',
      phone: item.farmer_phone || '',
      nic: item.farmer_nic || '',
      district: item.district || 'Badulla',
      division: item.division || item.farmer_division || 'Bandarawela',
      gnd_division: item.gnd_division || 'Bandarawela Central',
      address_line1: item.farmer_address || '',
      total_land_size: item.total_land_size || item.land_size_acres || '1.5',
      verification_status: item.verification_status || 'APPROVED',
      is_active: true
    });
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
            {t('regional_monitoring_subtitle', 'GPS-Tagged Active Planting Plots Across Bandarawela & Upcountry Agrarian Divisions')}
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
                  const cropDisplay = getCropDisplay(plot);
                  const isApproved = plot.verification_status === 'APPROVED' || !plot.status || plot.status === 'SAFE' || plot.status === 'PLANTED' || plot.status === 'GROWING';

                  return (
                    <div
                      key={`cluster_${plot.id}`}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-base text-on-surface truncate">
                              {plot.farmer_name || 'Farmer'}
                            </h3>
                            <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                              <span className="truncate">{plot.farmer_phone || '0771000000'}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                            plot.status === 'OVER_PLANTED'
                              ? 'bg-red-100 text-red-800'
                              : plot.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {plot.verification_status || (plot.status === 'OVER_PLANTED' ? 'OVERPLANTED' : plot.status === 'WARNING' ? 'WARNING' : 'APPROVED')}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-on-surface">NIC:</span>
                            <span className="font-mono">{plot.farmer_nic || '78490339V'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                            <span className="truncate">{plot.gnd_division || plot.farmer_division || plot.division || 'Mirahawatte'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-on-surface">{t('registered_land', 'Registered Land')}:</span>
                            <span>{plot.total_land_size || plot.land_size_acres || '1.50'} Acres</span>
                          </div>
                          {cropDisplay && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold">
                              <span>🌱 {cropDisplay}</span>
                              <span>• {plot.land_size_acres} Ac Plot</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(plot)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t('btn_edit_details', 'Edit Farmer Details')}</span>
                        </button>
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
                  const cropDisplay = getCropDisplay(record);
                  const formattedDate = formatDate(record.planting_date);

                  return (
                    <div
                      key={`record_${record.id}`}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-base text-on-surface truncate">
                              {record.farmer_name || 'Farmer'}
                            </h3>
                            <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Phone className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                              <span className="truncate">{record.farmer_phone || '0771000000'}</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0 truncate max-w-[140px]">
                            {cropDisplay}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-on-surface">NIC:</span>
                            <span className="font-mono">{record.farmer_nic || '78490339V'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-outline flex-shrink-0" />
                            <span className="truncate">{record.gnd_division || record.farmer_division || record.division || 'Bandarawela'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-on-surface">{t('cultivated_plot', 'Cultivated')}:</span>
                              <span>{record.land_size_acres} Acres</span>
                            </div>
                            {formattedDate && (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-outline">
                                <Calendar className="w-3 h-3" />
                                <span>{formattedDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(record)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t('btn_edit_details', 'Edit Farmer Details')}</span>
                        </button>
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

      {/* Edit Farmer Details Modal */}
      <EditFarmerModal
        isOpen={!!editingFarmer}
        onClose={() => setEditingFarmer(null)}
        farmer={editingFarmer}
        onFarmerUpdated={() => {
          fetchPlantings();
          setEditingFarmer(null);
        }}
      />
    </div>
  );
}
