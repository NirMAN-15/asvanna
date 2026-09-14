import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function PriceManagement() {
  const { role, user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [prices, setPrices] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropHistory, setCropHistory] = useState(null);
  const [historyDays, setHistoryDays] = useState(30);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Keppetipola Dedicated Economic Centre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Daily Vegetable Market Prices</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time wholesale benchmark rates & price trends for Bandarawela & Uva basin
          </p>
        </div>

        <button
          onClick={fetchLatestPrices}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-variant transition"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh Rates
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container font-semibold shadow-sm animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Main Grid: Price Board + Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Wholesale Rates Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              Current Wholesale Board (Rs / kg)
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">Click a crop to see historical trend</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-on-surface-variant">Loading wholesale rates...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase text-xs">
                    <th className="py-3 px-3">Crop</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Current Rate</th>
                    <th className="py-3 px-3 text-right">Range</th>
                    <th className="py-3 px-3 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {prices.map((item) => {
                    const isSelected = selectedCrop && selectedCrop.crop_id === item.crop_id;
                    const price = parseFloat(item.current_price_per_kg) || parseFloat(item.standard_price_per_kg);
                    const min = parseFloat(item.price_range_min) || (price * 0.75);
                    const max = parseFloat(item.price_range_max) || (price * 1.35);

                    return (
                      <tr
                        key={item.crop_id}
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
          )}
        </div>

        {/* Right Column: Trend & Officer Entry */}
        <div className="space-y-6">
          {/* Selected Crop Historical Trend Card */}
          {selectedCrop && cropHistory && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {selectedCrop.name_en} ({selectedCrop.name_si})
                  </h3>
                  <p className="text-xs text-on-surface-variant">Past {historyDays} Days Volatility</p>
                </div>
                <div className="flex gap-1 text-xs">
                  {[30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setHistoryDays(d);
                        selectCropForTrend(selectedCrop, d);
                      }}
                      className={`px-2 py-1 rounded-md font-semibold ${
                        historyDays === d ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant">Average</div>
                  <div className="text-lg font-bold text-on-surface">
                    Rs {cropHistory.metrics?.averagePrice || selectedCrop.standard_price_per_kg}
                  </div>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <div className="text-xs text-on-surface-variant">Volatility</div>
                  <div className="text-lg font-bold text-secondary">
                    {cropHistory.metrics?.volatilityPercentage || 12}%
                  </div>
                </div>
              </div>

              {/* Simple Visual Bar Chart */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-on-surface-variant">Recent Daily Samples:</div>
                <div className="flex items-end gap-1.5 h-28 pt-4 border-b border-outline-variant/30 px-1">
                  {(cropHistory.history || []).slice(-12).map((h, i) => {
                    const price = parseFloat(h.price_per_kg);
                    const max = cropHistory.metrics?.highestPrice || 500;
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
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
              </div>
            </div>
          )}

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
