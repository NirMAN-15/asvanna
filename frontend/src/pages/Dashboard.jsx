import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import ProxyDataModal from '../components/ProxyDataModal';
import BroadcastModal from '../components/BroadcastModal';
import FarmerPlantingModal from '../components/FarmerPlantingModal';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { role, user } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);
  // ---- BUYER dashboard state ----
  const [buyerMetrics, setBuyerMetrics] = useState(null);
  const [buyerHistorySummary, setBuyerHistorySummary] = useState(null);
  const [surplusCrops, setSurplusCrops] = useState([]);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [procureModalItem, setProcureModalItem] = useState(null);
  const [procureQty, setProcureQty] = useState(50);
  const [procureNotes, setProcureNotes] = useState('');
  const [procureSubmitting, setProcureSubmitting] = useState(false);

  // Modals state
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);

  // Farmer crops state
  const [farmerCrops, setFarmerCrops] = useState([]);

  const fetchFarmerCrops = () => {
    if (role === 'FARMER') {
      API.get('/planting/farmer')
        .then(res => {
          if (res.data?.data) {
            setFarmerCrops(res.data.data);
          }
        })
        .catch(err => console.error('Failed to fetch farmer crops:', err));
    }
  };

  useEffect(() => {
    fetchFarmerCrops();
  }, [role, user]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Quick Proxy entry inline form state
  const [proxyFarmer, setProxyFarmer] = useState('');
  const [proxyCrop, setProxyCrop] = useState('Carrot');
  const [proxyAcreage, setProxyAcreage] = useState(1.5);
  const [proxyDate, setProxyDate] = useState(new Date().toISOString().split('T')[0]);
  const [proxyLoading, setProxyLoading] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const [dashboardBroadcasts, setDashboardBroadcasts] = useState([]);

  useEffect(() => {
    if (role === 'OFFICER' || role === 'ADMIN') {
      API.get('/broadcasts?district=Badulla')
        .then(res => {
          if (res.data?.data) {
            setDashboardBroadcasts(res.data.data.slice(0, 3));
          }
        })
        .catch(err => console.error(err));
    }
  }, [role]);

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to remove this planting record?')) return;
    try {
      await API.delete(`/planting/${cropId}`);
      triggerToast('Crop record removed successfully!');
      fetchFarmerCrops();
    } catch (err) {
      console.error('Failed to delete crop:', err);
      triggerToast('Failed to remove crop. Please try again.', 'error');
    }
  };

  // ---- BUYER: fetch real dashboard data ----
  const fetchBuyerDashboardData = async () => {
    setBuyerLoading(true);
    try {
      const params = {};
      if (user?.latitude) params.lat = user.latitude;
      if (user?.longitude) params.lon = user.longitude;
      const res = await API.get('/marketplace/buyer-summary', { params });
      const data = res.data?.data || res.data;
      if (data) {
        setBuyerMetrics({
          surplus5kmKg: data.surplus5kmKg ?? 0,
          activeVerifiedFarmsCount: data.activeVerifiedFarmsCount ?? 0,
          avgWholesalePrice: data.avgWholesalePrice ?? 0,
          radiusKm: data.radiusKm ?? 5,
        });
        setBuyerHistorySummary(data.buyerHistorySummary || null);
        setSurplusCrops(data.surplusCrops || []);
      }
    } catch (err) {
      console.error('Buyer summary fetch error:', err);
    } finally {
      setBuyerLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'BUYER') fetchBuyerDashboardData();
  }, [role]);

  // ---- BUYER: quick procure submit ----
  const handleQuickProcureSubmit = async (e) => {
    e.preventDefault();
    if (!procureModalItem) return;
    setProcureSubmitting(true);
    try {
      await API.post('/marketplace/orders', {
        listing_id: procureModalItem.id,
        requested_quantity_kg: parseFloat(procureQty),
        offered_price_per_kg: parseFloat(procureModalItem.price_per_kg),
        notes: procureNotes || 'Direct procurement via ASVANNA dashboard'
      });
      triggerToast(t('order_success_msg'));
      setProcureModalItem(null);
      setProcureQty(50);
      setProcureNotes('');
      fetchBuyerDashboardData();
    } catch (err) {
      triggerToast(err.response?.data?.message || t('order_success_msg'));
      setProcureModalItem(null);
    } finally {
      setProcureSubmitting(false);
    }
  };

  const handleQuickProxySubmit = async (e) => {
    e.preventDefault();
    setProxyLoading(true);
    const cropMap = { 'Carrot': 3, 'Leeks': 1, 'Cabbage': 2, 'Beetroot': 4, 'Potato': 5 };
    try {
      await API.post('/planting/log', {
        farmer_id: proxyFarmer || '1',
        crop_id: cropMap[proxyCrop] || 1,
        land_size_acres: parseFloat(proxyAcreage) || 1.5,
        planting_date: proxyDate,
        district: 'Badulla',
        division: 'Bandarawela',
        latitude: 6.8322,
        longitude: 80.9980
      });
      triggerToast(t('toast_proxy_synced'));
      setProxyFarmer('');
      setProxyAcreage(1.5);
    } catch (err) {
      const errMsg = err.response?.data?.message || t('toast_proxy_local');
      triggerToast(errMsg);
    } finally {
      setProxyLoading(false);
    }
  };

  // ----------------------------------------------------
  // 1. FARMER ROLE VIEW (Recreating Stitch 'Farmer Home')
  // ----------------------------------------------------
  if (role === 'FARMER') {
    const totalLand = user?.total_land_size || 5;
    const utilizedLand = farmerCrops.reduce((sum, crop) => sum + (parseFloat(crop.land_size_acres) || 0), 0);
    const utilPercentage = Math.min(Math.round((utilizedLand / totalLand) * 100), 100);
    const availableLand = Math.max(0, totalLand - utilizedLand);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">
        {/* Verification Status Warning Banner */}
        {user?.verification_status === 'PENDING' && (
          <div className="bg-warning-container text-on-warning-container px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm border border-warning/20">
            <span className="material-symbols-outlined text-warning flex-shrink-0 text-xl">hourglass_top</span>
            <div>
              <p className="font-bold text-sm">Account pending physical verification</p>
              <span>Your registration details have been queued for physical validation by the Bandarawela Agrarian Development Division. You can view weather and market rates; crop planting logs and marketplace surplus listings will activate once approved.</span>
            </div>
          </div>
        )}

        {/* Header Hero Section */}
        <header className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-xs font-bold uppercase tracking-wider mb-3 border border-secondary/20">
              <span className="material-symbols-outlined text-sm">spa</span>
              <span>{t('farmer_cycle_badge')}</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary leading-tight">
              {t('farmer_greeting', { name: user?.full_name || 'Ramesh Bandara' })}
            </h1>
            <p className="text-on-surface-variant font-body-md mt-2 leading-relaxed">
              {t('farmer_hero_desc')}
            </p>

            {/* Land Utilization Progress */}
            <div className="mt-5 max-w-md bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">pie_chart</span>
                  {t('land_utilization') || 'Land Utilization'}
                </span>
                <span className="text-sm font-bold text-primary">
                  {utilizedLand.toFixed(1)} / {totalLand.toFixed(1)} Acres ({utilPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${utilPercentage > 90 ? 'bg-error' : 'bg-primary'}`} 
                  style={{ width: `${utilPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1.5">
                {utilPercentage >= 100 
                  ? 'Your land is fully utilized based on registered plots.' 
                  : `You have ${availableLand.toFixed(1)} acres available for new cultivation.`}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-row lg:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => setIsFarmerModalOpen(true)}
              className="flex-1 lg:flex-none bg-primary text-white px-5 py-3.5 rounded-xl font-label-md font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <span className="material-symbols-outlined icon-fill">add_circle</span>
              <span>{t('register_new_crop')}</span>
            </button>
            <Link
              to="/marketplace"
              className="flex-1 lg:flex-none bg-secondary-container text-on-secondary-fixed px-5 py-3.5 rounded-xl font-label-md font-bold hover:bg-secondary-fixed transition flex items-center justify-center gap-2 border border-secondary-container/50 shadow-sm active:scale-98 text-center"
            >
              <span className="material-symbols-outlined">storefront</span>
              <span>{t('sell_produce_km')}</span>
            </Link>
          </div>
        </header>

        {/* Real-time Field Telemetry & Weather Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/60 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">partly_cloudy_day</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('bandarawela_weather')}</p>
              <h4 className="font-headline text-lg font-bold text-primary">{t('weather_temp_text')}</h4>
              <p className="text-[11px] text-on-surface-variant">{t('weather_hum_text')}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('nav_wholesale_rates') || 'Wholesale Rates'}</p>
              <h4 className="font-headline text-lg font-bold text-primary">Rs. 280 - 390 / kg</h4>
              <p className="text-[11px] text-on-surface-variant">Carrot Rs 340 • Leeks Rs 280 • Beans Rs 320</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/60 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('officer_contact')}</p>
              <h4 className="font-headline text-lg font-bold text-primary">{t('hotline_label')}</h4>
              <p className="text-[11px] text-on-surface-variant">{t('do_office_contact')}</p>
            </div>
          </div>
        </section>
        {/* Farmer Crop Data */}
        {farmerCrops.length > 0 && (
          <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card">
            <h2 className="font-headline text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">inventory_2</span>
              {t('nav_my_farm') || 'My Planted Crops'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Land Size (Acres)</th>
                      <th className="px-4 py-3">Planting Date</th>
                      <th className="px-4 py-3">Expected Harvest</th>
                      <th className="px-4 py-3">Expected Yield</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant text-sm">
                    {farmerCrops.map(crop => (
                      <tr key={crop.id} className="hover:bg-surface-container-low/50 transition">
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          {lang === 'si' ? crop.name_si : `${crop.name_en} (${crop.name_si})`}
                        </td>
                        <td className="px-4 py-3">{crop.land_size_acres}</td>
                        <td className="px-4 py-3">{new Date(crop.planting_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-secondary font-medium">{new Date(crop.expected_harvest_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{crop.expected_yield_kg} kg</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                            {crop.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              // navigate to risk analytics with crop name
                              window.location.href = `/risk-analytics?query=${encodeURIComponent(crop.name_en)}`;
                            }}
                            className="text-amber-500 hover:text-amber-700 p-1 rounded transition"
                            title="Check Risk"
                          >
                            <span className="material-symbols-outlined text-base">analytics</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCrop(crop.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition"
                            title="Delete Crop"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Status Badge Card: Crop Advisory Link */}
        <section>
          <div className="bg-surface-container-lowest border-l-4 border-primary rounded-2xl shadow-card p-6 md:p-7 touch-active border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 bg-primary-container/40 flex items-center justify-center rounded-2xl flex-shrink-0 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl icon-fill">analytics</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                    {lang === 'si' ? 'වගා උපදේශන සහ අවදානම් විශ්ලේෂණය' : 'Crop Advisory & Risk Analytics'}
                  </h2>
                </div>
                <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
                  {lang === 'si' 
                    ? 'ඔබ වගා කිරීමට පෙර කලාපයේ භෝග අතිරික්තයක් (Over-planting) තිබේදැයි පරීක්ෂා කර බුද්ධිමත් තීරණ ගන්න.' 
                    : 'Check regional crop saturation and get smart recommendations before you plant to avoid over-planting risks.'}
                </p>
              </div>
            </div>

            <Link
              to="/risk-analytics"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-sm font-bold hover:bg-primary/90 transition shadow-xs whitespace-nowrap self-start lg:self-center"
            >
              <span>{lang === 'si' ? 'අවදානම පරීක්ෂා කරන්න' : 'Check Risk Now'}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Action Button Grid (From Stitch Design) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* Action 1: Register New Crop */}
          <button
            onClick={() => setIsFarmerModalOpen(true)}
            className="bg-primary text-on-primary flex flex-col items-center justify-center p-7 sm:p-8 rounded-2xl shadow-card touch-active hover:bg-primary-container transition group text-center cursor-pointer border border-primary/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl group-hover:scale-105 transition-transform icon-fill text-white">
                add_circle
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-center text-white">{t('register_new_crop')}</span>
            <span className="text-xs text-primary-fixed-dim mt-1.5 leading-relaxed">
              {t('farmer_action_register_desc')}
            </span>
          </button>

          {/* Action 2: View Market Demand */}
          <Link
            to="/marketplace"
            className="bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center p-7 sm:p-8 rounded-2xl shadow-card touch-active hover:bg-secondary-fixed transition border border-outline-variant/40 group text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-primary icon-fill">
                trending_up
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-on-secondary-fixed">{t('farmer_action_market_title')}</span>
            <span className="text-xs text-on-secondary-container/80 mt-1.5 leading-relaxed">
              {t('farmer_action_market_desc')}
            </span>
          </Link>
        </section>

        {/* Smart Crop Recommendation Card (From Stitch Design) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004830] via-[#1E6145] to-[#042100] p-6 sm:p-8 text-on-primary shadow-xl border border-primary-container">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                background:
                  'radial-gradient(circle at 15% 20%, #92d5b1 0%, transparent 45%), radial-gradient(circle at 85% 75%, #c7eeb3 0%, transparent 45%)',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary-fixed text-2xl icon-fill">psychology</span>
              <span className="text-xs uppercase tracking-widest font-extrabold text-secondary-fixed">
                {t('smart_rec_title')}
              </span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              {t('smart_rec_subtitle')}
            </h3>
            <p className="text-primary-fixed-dim text-sm max-w-3xl leading-relaxed mb-6">
              {t('smart_rec_desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Beetroot */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="/crops/beetroot.jpg"
                      alt={t('crop_beetroot')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 1 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 42 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_beetroot')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '42.4' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '70–85' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Option 2: Carrots */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="/crops/carrot.jpg"
                      alt={t('crop_carrots')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 2 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 35 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_carrots')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '54.2' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '90–110' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Option 3: Bush Beans */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="/crops/bush_beans.jpg"
                      alt={t('crop_bush_beans')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 3 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 48 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_bush_beans')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '38.0' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '60–70' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* Farmer Planting Modal */}
        <FarmerPlantingModal
          isOpen={isFarmerModalOpen}
          onClose={() => setIsFarmerModalOpen(false)}
          onSuccess={() => {
            triggerToast(t('toast_crop_logged'));
            fetchFarmerCrops();
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. BUYER ROLE VIEW — Data-driven Dashboard
  // ----------------------------------------------------
  if (role === 'BUYER') {
    const m = buyerMetrics || {};
    const hist = buyerHistorySummary || {};

    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-headline-lg font-bold text-primary">
              {t('buyer_title', { name: user?.business_name || user?.full_name || 'Commercial Partner' })}
            </h1>
            <p className="text-on-surface-variant font-body-md">{t('buyer_subtitle_desc')}</p>
          </div>
          {buyerLoading && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-base">sync</span>
              <span>Loading real-time data...</span>
            </div>
          )}
        </header>

        {/* ── 1. Real DB Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('surplus_5km_title')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary mt-2">
              {buyerLoading ? '—' : `${(m.surplus5kmKg || 0).toLocaleString()} kg`}
            </p>
            <p className="text-xs text-secondary mt-1">{t('surplus_5km_avail')} • {m.radiusKm ?? 5}km radius</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-secondary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('active_verified_farms')}</span>
            <p className="font-headline text-3xl font-extrabold text-secondary mt-2">
              {buyerLoading ? '—' : t('farms_count_val', { count: m.activeVerifiedFarmsCount ?? 0 })}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">{t('farms_locations')}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary-container shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('avg_wholesale_price')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary mt-2">
              {buyerLoading ? '—' : `LKR ${m.avgWholesalePrice ?? 0}/kg`}
            </p>
            <p className="text-xs text-secondary mt-1">{t('below_terminal_market')}</p>
          </div>
        </div>

        {/* ── 2. Two-column: Transactions Summary + Open Surplus Marketplace Banner ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Past Transactions Summary */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex flex-col">
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                {t('buyer_transactions_summary')}
              </h2>
              <Link to="/history" className="text-xs text-secondary font-bold hover:underline flex items-center gap-0.5">
                {t('view_all_history')}
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-outline-variant/20 border-b border-outline-variant/20">
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-primary font-headline">{hist.totalOrders ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_orders')}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-secondary font-headline">{(hist.totalProcuredKg ?? 0).toLocaleString()} kg</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_procured_kg')}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-primary font-headline">Rs. {((hist.totalSpentLKR ?? 0) / 1000).toFixed(0)}k</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_spent')}</p>
              </div>
            </div>
            {/* Recent orders */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 custom-scrollbar">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider px-1 mb-1">{t('recent_transactions')}</p>
              {(hist.recentOrders && hist.recentOrders.length > 0) ? hist.recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <div className="w-8 h-8 bg-primary-container/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">eco</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{order.crop_name}</p>
                    <p className="text-[10px] text-on-surface-variant">{order.farmer_name} • {order.quantity_kg} kg</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-primary">Rs. {(order.total_price || 0).toLocaleString()}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">{order.status}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-on-surface-variant text-center py-4">{t('no_orders_yet')}</p>
              )}
            </div>
          </div>

          {/* Right — Open Surplus Marketplace Banner */}
          <div className="rounded-2xl overflow-hidden shadow-card relative bg-gradient-to-br from-primary via-primary/90 to-secondary flex flex-col justify-between p-6 min-h-[260px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-8 -mb-8 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">storefront</span>
                </div>
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">ASVANNA Marketplace</span>
              </div>
              <h2 className="font-headline text-2xl font-extrabold text-white leading-tight mb-2">
                {t('open_marketplace_banner_title')}
              </h2>
              <p className="text-white/80 text-sm mb-5 max-w-xs">
                {t('open_marketplace_banner_desc')}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: 'bolt', label: t('banner_fast_confirmation') },
                  { icon: 'verified', label: t('banner_verified_farms') },
                  { icon: 'local_shipping', label: t('banner_farmgate_pickup') },
                ].map(({ icon, label }) => (
                  <span key={icon} className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/15 px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/marketplace"
              className="relative z-10 flex items-center justify-center gap-2 bg-white text-primary font-bold py-3.5 rounded-xl text-sm hover:bg-primary-fixed transition press-effect shadow-lg"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span>{t('open_surplus_marketplace')}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* ── 3. Fresh Surplus Crops — 3 Nearest Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">grass</span>
              {t('fresh_surplus_available')}
            </h2>
            <Link to="/marketplace" className="text-xs text-secondary font-bold hover:underline flex items-center gap-0.5">
              {t('open_surplus_marketplace')}
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
          <p className="text-xs text-on-surface-variant mb-5">{t('fresh_surplus_desc')}</p>

          {/* Nearest 3 surplus crop categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {buyerLoading ? (
              [null, null, null].map((_, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 animate-pulse overflow-hidden">
                  <div className="h-48 bg-surface-variant/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-variant/60 rounded w-3/4" />
                    <div className="h-3 bg-surface-variant/40 rounded w-1/2" />
                    <div className="h-8 bg-surface-variant/30 rounded mt-3" />
                  </div>
                </div>
              ))
            ) : surplusCrops.length === 0 ? (
              <div className="col-span-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">storefront</span>
                <p className="text-sm font-bold text-on-surface">No active surplus harvest found in your immediate area.</p>
                <p className="text-xs text-on-surface-variant mt-1">Explore all regional produce in the marketplace.</p>
              </div>
            ) : (
              surplusCrops.slice(0, 3).map((crop) => {
                const cropName = lang === 'si'
                  ? (crop.crop_name_si || crop.crop_name_en || crop.crop_name)
                  : lang === 'ta'
                    ? (crop.crop_name_ta || crop.crop_name_en || crop.crop_name)
                    : (crop.crop_name_en || crop.crop_name || 'Produce');
                const isBelowBench = crop.price_per_kg < (crop.standard_price_per_kg * 0.9);
                const imgSrc = crop.image_url || '/crops/leek.jpg';
                return (
                  <div key={crop.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                    {/* Crop Image — taller for better visual */}
                    <div className="h-48 overflow-hidden bg-primary-container/20 relative flex-shrink-0">
                      <img
                        src={imgSrc}
                        alt={cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = '1';
                            e.target.src = '/crops/leek.jpg';
                          }
                        }}
                      />
                    {/* Distance badge */}
                    {crop.distanceKm != null && (
                      <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">near_me</span>
                        {crop.distanceKm} km
                      </span>
                    )}
                    {/* Below benchmark badge */}
                    {isBelowBench && (
                      <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {t('below_benchmark_badge')}
                      </span>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Crop name overlay on image */}
                    <h3 className="absolute bottom-2.5 left-3 right-3 font-bold text-white text-sm drop-shadow-md truncate">{cropName}</h3>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-on-surface-variant truncate mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-outline">location_on</span>
                      {crop.pickup_address || crop.farmer_name}
                    </p>

                    {/* Price + weight */}
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Price/kg</p>
                        <p className="font-extrabold text-primary text-xl leading-none">Rs. {crop.price_per_kg}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{t('remaining_weight')}</p>
                        <p className="font-bold text-secondary text-lg leading-none">{(crop.quantity_kg || 0).toLocaleString()} kg</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setProcureModalItem(crop); setProcureQty(Math.min(50, crop.quantity_kg || 50)); }}
                      className="mt-auto w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                      {t('quick_procure')}
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </section>


        {/* ── Quick Procure Modal ── */}
        {procureModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-md p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-headline-sm font-bold text-primary">{t('quick_procure_modal_title')}</h3>
                <button onClick={() => setProcureModalItem(null)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl mb-5">
                <img
                  src={procureModalItem.image_url || `/crops/${(procureModalItem.crop_code || 'leeks').toLowerCase()}.jpg`}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover"
                  onError={e => { e.target.src = '/crops/leeks.jpg'; }}
                />
                <div>
                  <p className="font-bold text-on-surface">{procureModalItem.crop_name_en || procureModalItem.crop_name}</p>
                  <p className="text-xs text-on-surface-variant">{procureModalItem.pickup_address || procureModalItem.farmer_name}</p>
                  <p className="text-primary font-extrabold">Rs. {procureModalItem.price_per_kg}/kg</p>
                </div>
              </div>
              <form onSubmit={handleQuickProcureSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{t('quick_procure_qty_label')}</label>
                  <input
                    type="number"
                    min="1"
                    max={procureModalItem.quantity_kg || 9999}
                    value={procureQty}
                    onChange={e => setProcureQty(e.target.value)}
                    required
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Total: <strong className="text-primary">Rs. {(procureQty * procureModalItem.price_per_kg).toLocaleString()}</strong>
                    {' '}• Max available: {(procureModalItem.quantity_kg || 0).toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{t('quick_procure_notes_label')}</label>
                  <textarea
                    rows={2}
                    value={procureNotes}
                    onChange={e => setProcureNotes(e.target.value)}
                    placeholder="e.g. Farmgate pickup, morning batch..."
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={procureSubmitting}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary/90 transition press-effect shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {procureSubmitting ? t('procuring') : t('quick_procure_submit')}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ----------------------------------------------------
  // 3. DIVISIONAL OFFICER DASHBOARD (Stitch Screen 9b2895e1960648aab780b17f59ab158d)
  // ----------------------------------------------------
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-6 font-body-md text-on-surface">
      {/* Bento Grid Layout (From Stitch Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* 1. Regional Analytics: Heatmap Map (Span 8) */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-card border-t-4 border-secondary overflow-hidden relative min-h-[460px] border border-outline-variant/30 flex flex-col">
          <div className="p-5 md:p-6 flex justify-between items-center border-b border-surface-variant bg-surface-bright/50 z-10">
            <h2 className="font-headline text-headline-sm font-bold flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-secondary text-2xl">map</span>
              {t('officer_heatmap_title')}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-xs font-semibold text-on-surface-variant">{t('legend_safe')}</span>
              <div className="w-28 md:w-36 h-2.5 rounded-full heatmap-gradient shadow-inner" />
              <span className="text-body-sm text-xs font-semibold text-error">{t('legend_overplanted')}</span>
            </div>
          </div>

          {/* Map Canvas with Satellite View & Pins */}
          <div className="relative flex-1 min-h-[360px] overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEYU9w_3cEAaiKVTv2enBb-tVnGSexTCt15F_QSshQt1H0qFRzSD26ctHQmI7h-0t0cM1n8ghyYgZqpCv9DBdWHnx61zj_nE1xzxDCLxycyp9d0F8aarOJ3DMwETND8fiT9cFyB_MO_66XG5EjYVAKlJ8NeucsN4fHIOB4Yes9m4WMKWw6__KbshH7MaJlMcaaqaLm4TwxeZK8EeKQIJoLtKjzEa8bTTiIRnxFG9vBDzp9dh38-WIo4Q"
              alt="Bandarawela Crop Heatmap"
              className="w-full h-full object-cover grayscale-[15%] sepia-[10%] brightness-105"
            />

            {/* Simulated Critical Saturation Pin from Stitch */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-error text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl ring-4 ring-white animate-pulse flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{t('map_pin_critical')}</span>
            </div>

            {/* Welimada & Haputale Secondary Pins */}
            <div className="absolute top-1/4 left-1/4 bg-primary text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ring-2 ring-white flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              <span>{t('map_pin_paddy')}</span>
            </div>

            <div className="absolute bottom-1/4 right-1/3 bg-amber-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ring-2 ring-white flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              <span>{t('map_pin_cabbage')}</span>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-xl p-2 shadow-md flex gap-2 text-xs font-semibold text-on-surface">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {t('bandarawela_center')}
              </span>
              <span className="text-outline">|</span>
              <Link to="/monitoring" className="text-primary hover:underline flex items-center gap-0.5">
                {t('full_map_view')} <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Regional Analytics: Progress Bars & Trends (Span 4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Top Planted Crops Progress */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-secondary border border-outline-variant/30 flex-1">
            <h3 className="font-label-md text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-wider">
              {t('top_planted_crops')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-semibold">
                  <span>{t('crop_paddy')}</span>
                  <span className="text-primary font-bold">420 Ha (85%)</span>
                </div>
                <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-semibold">
                  <span>{t('crop_tea')}</span>
                  <span className="text-secondary font-bold">310 Ha (65%)</span>
                </div>
                <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-semibold">
                  <span className="text-error flex items-center gap-1">
                    {t('crop_carrots')} <span className="material-symbols-outlined text-sm">error</span>
                  </span>
                  <span className="text-error font-extrabold">285 Ha (92%)</span>
                </div>
                <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-body-sm font-semibold">
                  <span>{t('crop_leeks')}</span>
                  <span className="text-primary-container font-bold">140 Ha (78%)</span>
                </div>
                <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Acreage Trends (6 Months Interactive Bar Chart from Stitch) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-secondary border border-outline-variant/30 flex-1">
            <h3 className="font-label-md text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-wider">
              {t('acreage_trends_title')}
            </h3>
            <div className="h-32 flex items-end gap-2.5 px-2 pt-4">
              {[
                { month: 'JAN', height: '40%', ha: '120Ha' },
                { month: 'FEB', height: '55%', ha: '180Ha' },
                { month: 'MAR', height: '80%', ha: '240Ha' },
                { month: 'APR', height: '75%', ha: '220Ha' },
                { month: 'MAY', height: '95%', ha: '310Ha' },
                { month: 'JUN', height: '60%', ha: '190Ha' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                    {item.ha}
                  </span>
                  <div
                    className="w-full bg-primary/25 group-hover:bg-primary rounded-t transition-colors cursor-pointer"
                    style={{ height: item.height }}
                  />
                  <span className="text-[10px] text-on-surface-variant font-bold mt-1.5">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Proxy Data Entry Section (Span 4) */}
        <section className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-primary border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                {t('proxy_data_entry')}
              </h2>
              <button
                type="button"
                onClick={() => setIsProxyModalOpen(true)}
                className="text-xs text-secondary font-bold hover:underline"
              >
                {t('advanced_modal')}
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-4">
              {t('proxy_logger_subtitle')}
            </p>

            <form onSubmit={handleQuickProxySubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-label-md text-xs font-semibold text-on-surface-variant">{t('farmer_search_label')}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={proxyFarmer}
                    onChange={(e) => setProxyFarmer(e.target.value)}
                    placeholder={t('farmer_search_placeholder')}
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none pr-8"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-outline text-lg">search</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-xs font-semibold text-on-surface-variant">{t('label_crop')}</label>
                <select
                  value={proxyCrop}
                  onChange={(e) => setProxyCrop(e.target.value)}
                  className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none"
                >
                  <option value="Carrot">{t('crop_carrots')}</option>
                  <option value="Leeks">{t('crop_leeks')}</option>
                  <option value="Paddy">{t('crop_paddy')}</option>
                  <option value="Cabbage">{t('crop_cabbage')}</option>
                  <option value="Beetroot">{t('crop_beetroot')}</option>
                  <option value="Potato">{t('crop_potato')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-label-md text-xs font-semibold text-on-surface-variant">{t('label_acreage')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={proxyAcreage}
                    onChange={(e) => setProxyAcreage(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm bg-surface outline-none ${
                      proxyAcreage > 8
                        ? 'border-error bg-error-container/10 focus:border-error text-error'
                        : 'border-outline-variant/80 focus:border-primary'
                    }`}
                  />
                  {proxyAcreage > 8 && (
                    <span className="text-[10px] text-error font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">warning</span> {t('exceeds_plot_limit')}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-xs font-semibold text-on-surface-variant">{t('label_planting_date')}</label>
                  <input
                    type="date"
                    required
                    value={proxyDate}
                    onChange={(e) => setProxyDate(e.target.value)}
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={proxyLoading}
                className="w-full mt-2 bg-primary text-white font-label-md text-xs font-bold py-3.5 rounded-lg hover:bg-primary-container transition press-effect shadow-sm disabled:opacity-70 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{proxyLoading ? t('btn_synchronizing') : t('btn_sync_planting')}</span>
              </button>
            </form>
          </div>
        </section>

        {/* 4. Advisory Broadcasts Table (Span 8) */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-card border-t-4 border-secondary border border-outline-variant/30 flex flex-col">
          <div className="p-5 md:p-6 border-b border-surface-variant flex justify-between items-center bg-surface-bright/50">
            <h2 className="font-headline text-headline-sm font-bold flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-secondary text-2xl">campaign</span>
              {t('broadcasts')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-label-md text-xs font-bold flex items-center gap-1.5 hover:bg-secondary/90 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>{t('btn_new_broadcast')}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">{t('th_timestamp')}</th>
                  <th className="px-6 py-3.5">{t('th_message')}</th>
                  <th className="px-6 py-3.5">{t('th_target_group')}</th>
                  <th className="px-6 py-3.5">{t('th_status')}</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-sm divide-y divide-surface-variant">
                {dashboardBroadcasts.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4">{t('no_broadcasts') || 'No broadcasts'}</td></tr>
                ) : (
                  dashboardBroadcasts.map(b => (
                    <tr key={b.id} className="hover:bg-surface-container-low/50 transition">
                      <td className="px-6 py-4 font-semibold text-on-surface">{new Date(b.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium italic text-on-surface-variant">
                        {b.message_en || b.message_si || b.title_en}
                      </td>
                      <td className="px-6 py-4 font-semibold">{b.target_division || 'Bandarawela'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {b.severity === 'CRITICAL' ? t('status_high_risk') || 'CRITICAL' : t('status_sent') || 'SENT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Success Notification Toast (From Stitch Design) */}
      <div
        className={`fixed bottom-8 right-8 z-[100] glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/40 transition-all duration-500 max-w-md ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-xl">check_circle</span>
        </div>
        <div>
          <p className="font-bold text-primary text-sm">{t('action_completed')}</p>
          <p className="text-on-surface-variant text-xs">{toastMessage}</p>
        </div>
      </div>

      {/* Modals */}
      <ProxyDataModal
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
        onDataAdded={() => triggerToast(t('toast_proxy_modal'))}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcastSent={() => triggerToast(t('toast_broadcast_sent'))}
      />
    </div>
  );
}
