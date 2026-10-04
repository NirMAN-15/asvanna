import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function PriceManagement() {
  const { role, user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [prices, setPrices] = useState([
    { crop_id: 1, name_en: 'Leeks', name_si: 'ලීක්ස්', category: 'Upcountry Vegetable', current_price_per_kg: 280, standard_price_per_kg: 280, price_range_min: 200, price_range_max: 500, trend: 'UP' },
    { crop_id: 3, name_en: 'Carrot', name_si: 'කැරට්', category: 'Upcountry Vegetable', current_price_per_kg: 340, standard_price_per_kg: 340, price_range_min: 250, price_range_max: 600, trend: 'STABLE' },
    { crop_id: 2, name_en: 'Cabbage', name_si: 'ගෝවා', category: 'Upcountry Vegetable', current_price_per_kg: 190, standard_price_per_kg: 190, price_range_min: 150, price_range_max: 400, trend: 'DOWN' },
    { crop_id: 4, name_en: 'Beetroot', name_si: 'බීට්රූට්', category: 'Upcountry Vegetable', current_price_per_kg: 260, standard_price_per_kg: 260, price_range_min: 200, price_range_max: 500, trend: 'UP' },
    { crop_id: 5, name_en: 'Upcountry Potato', name_si: 'අර්තාපල්', category: 'Upcountry Vegetable', current_price_per_kg: 390, standard_price_per_kg: 390, price_range_min: 250, price_range_max: 450, trend: 'STABLE' },
    { crop_id: 8, name_en: 'Capsicum', name_si: 'මාළු මිරිස්', category: 'Upcountry Vegetable', current_price_per_kg: 460, standard_price_per_kg: 460, price_range_min: 300, price_range_max: 800, trend: 'UP' }
  ]);
  const [selectedCrop, setSelectedCrop] = useState({
    crop_id: 3, name_en: 'Carrot', name_si: 'කැරට්', current_price_per_kg: 340, standard_price_per_kg: 340, price_range_min: 250, price_range_max: 600
  });
  const [cropHistory, setCropHistory] = useState([
    { date: '2026-09-18', price: 310 },
    { date: '2026-09-19', price: 320 },
    { date: '2026-09-20', price: 325 },
    { date: '2026-09-21', price: 330 },
    { date: '2026-09-22', price: 335 },
    { date: '2026-09-23', price: 340 },
    { date: '2026-09-24', price: 340 }
  ]);
  const [historyDays, setHistoryDays] = useState(30);
  const [loading, setLoading] = useState(false);

  // Form state for officer price entry
  const [entryCropId, setEntryCropId] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const isOfficer = role === 'OFFICER' || role === 'ADMIN';

  useEffect(() => {
    fetchLatestPrices();
  }, []);

  const fetchLatestPrices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/prices/latest');
      if (res.data && res.data.data) {
        setPrices(res.data.data);
        if (res.data.data.length > 0 && !selectedCrop) {
          selectCropForTrend(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectCropForTrend = async (crop, days = historyDays) => {
    setSelectedCrop(crop);
    try {
      const res = await API.get(`/prices/${crop.crop_id || crop.id}/history?days=${days}`);
      if (res.data && res.data.data) {
        setCropHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch crop price history:', err);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    if (!entryCropId || !entryPrice) return;

    setSubmitting(true);
    try {
      await API.post('/prices/record', {
        cropId: entryCropId,
        pricePerKg: parseFloat(entryPrice),
        priceDate: entryDate,
        market: 'Keppetipola Economic Centre'
      });
      setToast('✅ Wholesale price logged and updated successfully!');
      setTimeout(() => setToast(''), 4000);
      setEntryPrice('');
      fetchLatestPrices();
    } catch (err) {
      setToast('❌ Error logging price: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const renderTrendCard = (crop, history, isMobile = false) => {
    if (!crop || !history) return null;
    return (
      <div className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-6 shadow-card space-y-4 ${
        isMobile ? 'border-primary/40 ring-1 ring-primary/25 bg-surface-container-low/40' : ''
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-on-surface truncate">
              {crop.name_en} ({crop.name_si})
            </h3>
            <p className="text-xs text-on-surface-variant">Past {historyDays} Days Volatility</p>
          </div>
          <div className="flex gap-1 text-xs flex-shrink-0">
            {[30, 90].map((d) => (
              <button
                key={d}
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryDays(d);
                  selectCropForTrend(crop, d);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  historyDays === d ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-surface-container-low rounded-xl">
            <div className="text-xs text-on-surface-variant font-medium">Average</div>
            <div className="text-lg font-bold text-on-surface">
              Rs {history.metrics?.averagePrice || crop.standard_price_per_kg}
            </div>
          </div>
          <div className="p-3 bg-surface-container-low rounded-xl">
            <div className="text-xs text-on-surface-variant font-medium">Volatility</div>
            <div className="text-lg font-bold text-secondary">
              {history.metrics?.volatilityPercentage || 12}%
            </div>
          </div>
        </div>

        {/* Simple Visual Bar Chart */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-on-surface-variant">Recent Daily Samples:</div>
          <div className="flex items-end gap-1.5 h-28 pt-4 border-b border-outline-variant/30 px-1">
            {(history.history || []).slice(-12).map((h, i) => {
              const price = parseFloat(h.price_per_kg);
              const max = history.metrics?.highestPrice || 500;
              const heightPct = Math.min(100, Math.max(15, Math.round((price / max) * 100)));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-primary/70 hover:bg-primary rounded-t transition-all"
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] bg-inverse-surface text-inverse-on-surface px-1 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                    Rs {price}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>{t('keppetipola_dec', 'Keppetipola Dedicated Economic Centre')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">{t('daily_vegetable_market_prices', 'Daily Vegetable Market Prices')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('market_prices_subtitle', 'Real-time wholesale benchmark rates & price trends for Bandarawela & Uva basin')}
          </p>
        </div>

        <button
          onClick={fetchLatestPrices}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-variant transition"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          {t('refresh_rates', 'Refresh Rates')}
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container font-semibold shadow-sm animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Main Grid: Price Board + Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Live Wholesale Rates Table / Mobile Cards */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              {t('current_wholesale_board', 'Current Wholesale Board (Rs / kg)')}
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">{t('click_crop_historical_trend', 'Click a crop to see historical trend')}</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">{t('loading_wholesale_rates', 'Loading wholesale rates...')}</div>
          ) : (
            <>
              {/* Mobile Responsive Cards View (Visible on screens < md) */}
              <div className="md:hidden space-y-3">
                {prices.map((item) => {
                  const isSelected = selectedCrop && (selectedCrop.crop_id === item.crop_id || selectedCrop.id === item.crop_id);
                  const price = parseFloat(item.current_price_per_kg) || parseFloat(item.standard_price_per_kg) || 0;
                  const min = parseFloat(item.price_range_min) || (price * 0.75);
                  const max = parseFloat(item.price_range_max) || (price * 1.35);
                  const isUp = item.trend === 'UP' || price > 300;
                  const isDown = item.trend === 'DOWN';

                  return (
                    <div key={item.crop_id || item.id} className="transition-all">
                      <div
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCrop(null);
                          } else {
                            selectCropForTrend(item);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-secondary-container/20 border-primary ring-2 ring-primary/40 shadow-sm'
                            : 'bg-white border-outline-variant/40 hover:border-primary/40 hover:bg-slate-50/60 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-base text-slate-900 font-headline">
                                {item.name_en}
                              </h4>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.category || 'Upcountry'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {item.name_si} {item.name_ta ? `• ${item.name_ta}` : ''}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-black text-primary font-headline leading-tight">
                              Rs {Math.round(price)}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">per kg</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="text-slate-600">
                            <span className="text-[11px] text-slate-400 font-medium">Range: </span>
                            <span className="font-bold text-slate-800">Rs {Math.round(min)} - {Math.round(max)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 font-bold ${
                              isUp ? 'text-emerald-700' : isDown ? 'text-red-600' : 'text-slate-600'
                            }`}>
                              <span className="text-[11px]">
                                {isUp ? 'Rising' : isDown ? 'Falling' : 'Stable'}
                              </span>
                              <span className="material-symbols-outlined text-sm">
                                {isUp ? 'north_east' : isDown ? 'south_east' : 'trending_flat'}
                              </span>
                            </div>
                            <span className={`material-symbols-outlined text-slate-400 text-base transition-transform duration-200 ${
                              isSelected ? 'rotate-180 text-primary font-bold' : ''
                            }`}>
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Inline Trend Card (shows directly under this clicked card) */}
                      {isSelected && cropHistory && (
                        <div className="mt-2.5 animate-fadeIn">
                          {renderTrendCard(selectedCrop, cropHistory, true)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (Visible on screens >= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase text-xs">
                      <th className="py-3 px-3">{t('th_crop', 'Crop')}</th>
                      <th className="py-3 px-3">{t('category', 'Category')}</th>
                      <th className="py-3 px-3 text-right">{t('current_rate', 'Current Rate')}</th>
                      <th className="py-3 px-3 text-right">{t('range', 'Range')}</th>
                      <th className="py-3 px-3 text-center">{t('trend', 'Trend')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {prices.map((item) => {
                      const isSelected = selectedCrop && (selectedCrop.crop_id === item.crop_id || selectedCrop.id === item.crop_id);
                      const price = parseFloat(item.current_price_per_kg) || parseFloat(item.standard_price_per_kg) || 0;
                      const min = parseFloat(item.price_range_min) || (price * 0.75);
                      const max = parseFloat(item.price_range_max) || (price * 1.35);

                      return (
                        <tr
                          key={item.crop_id || item.id}
                          onClick={() => selectCropForTrend(item)}
                          className={`cursor-pointer transition hover:bg-surface-variant/40 ${
                            isSelected ? 'bg-secondary-container/30 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-semibold text-on-surface">
                            <div>{item.name_en}</div>
                            <div className="text-xs text-on-surface-variant font-normal">
                              {item.name_si} • {item.name_ta}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-on-surface-variant">{item.category || 'Upcountry'}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-primary text-base">
                            Rs {Math.round(price)}
                          </td>
                          <td className="py-3 px-3 text-right text-xs text-on-surface-variant">
                            Rs {Math.round(min)} - {Math.round(max)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="material-symbols-outlined text-sm text-secondary">
                              {price > 300 ? 'north_east' : 'trending_flat'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sticky Trend & Officer Entry */}
        <div className="space-y-6 lg:sticky lg:top-4 self-start">
          {/* Selected Crop Historical Trend Card (Desktop Only) */}
          <div className="hidden lg:block">
            {selectedCrop && cropHistory && renderTrendCard(selectedCrop, cropHistory, false)}
          </div>

          {/* Officer Daily Entry Form */}
          {isOfficer && (
            <div className="bg-surface-container-low rounded-2xl border border-secondary/30 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined">edit_note</span>
                <h3>Officer Daily Price Entry</h3>
              </div>
              <p className="text-xs text-on-surface-variant">
                Enter today's auction rate from Keppetipola Economic Centre bulletin.
              </p>

              <form onSubmit={handlePriceSubmit} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Select Crop</label>
                  <select
                    value={entryCropId}
                    onChange={(e) => setEntryCropId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-sm focus:outline-primary"
                  >
                    <option value="">-- Choose Vegetable --</option>
                    {prices.map((c) => (
                      <option key={c.crop_id} value={c.crop_id}>
                        {c.name_en} ({c.name_si})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Price per kg (LKR)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    placeholder="e.g. 280.00"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-sm focus:outline-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Auction Date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-sm focus:outline-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Recording Price...' : 'Submit Wholesale Price'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
