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
  const { t } = useContext(LanguageContext);

  // Modals state
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);

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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">
        {/* Verification Status Warning Banner */}
        {user?.verification_status === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center gap-3.5 text-amber-900 text-xs shadow-sm">
            <span className="material-symbols-outlined text-amber-600 text-2xl flex-shrink-0">pending_actions</span>
            <div>
              <strong className="block text-sm font-bold text-amber-950">Profile Awaiting Divisional Officer Verification</strong>
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

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-2">
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-lg">landscape</span>
                <span className="text-xs text-on-surface-variant font-medium">{t('active_plot')}: <strong className="text-primary font-bold">{t('acres_val', { val: '2.5' })}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
                <span className="text-xs text-on-surface-variant font-medium">{t('harvest_window')}: <strong className="text-secondary font-bold">{t('days_val', { val: '24' })}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-lg">payments</span>
                <span className="text-xs text-on-surface-variant font-medium">{t('est_yield_value')}: <strong className="text-primary font-bold">LKR 420,000</strong></span>
              </div>
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

        {/* Status Badge Card: Risk Indicator (From Stitch Design) */}
        <section>
          <div className="bg-surface-container-lowest border-l-4 border-error rounded-2xl shadow-card p-6 md:p-7 touch-active border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 bg-error-container/40 flex items-center justify-center rounded-2xl flex-shrink-0 border border-error/20">
                <span className="material-symbols-outlined text-error text-3xl icon-fill">warning</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                    {t('farmer_risk_title')}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-extrabold uppercase tracking-wide">
                    {t('farmer_risk_badge')}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
                  {t('farmer_risk_desc')}
                </p>

                {/* Visual Saturation Progress Bar */}
                <div className="w-full max-w-md pt-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-1">
                    <span>{t('regional_quota_saturation')}</span>
                    <span className="text-error font-bold">{t('quota_benchmark_note')}</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-error rounded-full transition-all duration-500" style={{ width: '92.5%' }} />
                    <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-on-surface/60" title="90% Quota Threshold" />
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/risk-analytics"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary-container/70 text-on-secondary-fixed font-label-md text-sm font-bold hover:bg-secondary-fixed transition border border-secondary/30 self-start lg:self-center whitespace-nowrap shadow-xs"
            >
              <span>{t('view_alternatives')}</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* Action Button Grid (From Stitch Design) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
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

          {/* Action 3: Government Advisories */}
          <Link
            to="/broadcasts"
            className="bg-surface-container-high text-on-surface flex flex-col items-center justify-center p-7 sm:p-8 rounded-2xl shadow-card touch-active hover:bg-surface-variant transition border border-outline-variant/40 group text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-secondary icon-fill">
                campaign
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-primary">{t('farmer_action_advisories_title')}</span>
            <span className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              {t('farmer_action_advisories_desc')}
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

        {/* Farmer Planting Modal */}
        <FarmerPlantingModal
          isOpen={isFarmerModalOpen}
          onClose={() => setIsFarmerModalOpen(false)}
          onSuccess={() => triggerToast(t('toast_crop_logged'))}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. BUYER ROLE VIEW
  // ----------------------------------------------------
  if (role === 'BUYER') {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-headline-lg font-bold text-primary">
              {t('buyer_title', { name: user?.business_name || user?.full_name || 'Commercial Partner' })}
            </h1>
            <p className="text-on-surface-variant font-body-md">
              {t('buyer_subtitle_desc')}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="bg-primary text-white px-6 py-3 rounded-xl font-label-md font-bold hover:bg-primary-container transition flex items-center gap-2 press-effect shadow-sm"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>{t('open_surplus_marketplace')}</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('surplus_5km_title')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary mt-2">5,200 kg</p>
            <p className="text-xs text-secondary mt-1">{t('surplus_5km_avail')}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-secondary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('active_verified_farms')}</span>
            <p className="font-headline text-3xl font-extrabold text-secondary mt-2">{t('farms_count_val', { count: 48 })}</p>
            <p className="text-xs text-on-surface-variant mt-1">{t('farms_locations')}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary-container shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('avg_wholesale_price')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary-container mt-2">LKR 185/kg</p>
            <p className="text-xs text-secondary mt-1">{t('below_terminal_market')}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-card text-center">
          <span className="material-symbols-outlined text-5xl text-primary mb-3">explore</span>
          <h2 className="font-headline text-headline-md text-primary font-bold mb-2">
            {t('zero_waste_ready_title')}
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto mb-6">
            {t('zero_waste_ready_desc')}
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-label-md font-bold hover:bg-primary-container transition shadow-sm"
          >
            <span>{t('explore_produce_map')}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
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
