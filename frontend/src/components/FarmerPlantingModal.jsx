import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { MASTER_CROPS } from '../constants/crops';

export default function FarmerPlantingModal({ isOpen, onClose, onPlantingAdded, onSuccess, initialCropId }) {
  const { user } = useContext(AuthContext);
  const { lang, t } = useContext(LanguageContext);
  const [cropList, setCropList] = useState(MASTER_CROPS);
  const [cropId, setCropId] = useState(initialCropId ? String(initialCropId) : '1');
  const [landUnit, setLandUnit] = useState('PERCHES'); // 'PERCHES' | 'ACRES'
  const [landValue, setLandValue] = useState('40'); // default 40 perches (0.25 acres)
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [division, setDivision] = useState(user?.division || 'Bandarawela Central');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [availableLand, setAvailableLand] = useState(null);

  useEffect(() => {
    API.get('/crops')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const mapped = res.data.data.map(c => ({
            id: c.id,
            code: c.crop_code,
            nameEn: c.name_en,
            nameSi: c.name_si,
            nameTa: c.name_ta || c.name_en,
            days: c.growth_duration_days || 75
          }));
          setCropList(mapped);
        }
      })
      .catch(() => setCropList(MASTER_CROPS));
  }, []);

  useEffect(() => {
    if (initialCropId) setCropId(String(initialCropId));
  }, [initialCropId]);

  useEffect(() => {
    if (isOpen && user?.id) {
      API.get(`/planting/farmer/${user.id}`)
        .then(res => {
          const totalLand = user?.has_pending_profile_updates && user?.pending_profile_details?.previous_values?.total_land_size
            ? parseFloat(user.pending_profile_details.previous_values.total_land_size)
            : parseFloat(user?.total_land_size) || 5;
          const utilizedLand = res.data.data.reduce((sum, crop) => sum + (parseFloat(crop.land_size_acres) || 0), 0);
          setAvailableLand(Math.max(0, totalLand - utilizedLand));
        })
        .catch(err => console.error("Failed to fetch farmer crops for validation", err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const numericValue = parseFloat(landValue);
  const calculatedAcres = landUnit === 'PERCHES'
    ? (numericValue ? parseFloat((numericValue / 160).toFixed(4)) : 0)
    : (numericValue || 0);
  const calculatedPerches = landUnit === 'PERCHES'
    ? (numericValue || 0)
    : (numericValue ? parseFloat((numericValue * 160).toFixed(1)) : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (!numericValue || numericValue <= 0) {
      setFeedback({ type: 'error', message: `Please enter a valid land size in ${landUnit.toLowerCase()}.` });
      setSubmitting(false);
      return;
    }

    if (availableLand !== null && calculatedAcres > availableLand) {
      setFeedback({
        type: 'error',
        message: `Cannot allocate ${calculatedAcres} acres (${calculatedPerches} perches). You only have ${availableLand.toFixed(2)} acres (${(availableLand * 160).toFixed(0)} perches) of free land available.`
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        crop_id: Number(cropId),
        land_unit: landUnit,
        land_size_perches: calculatedPerches,
        land_size_acres: calculatedAcres,
        planting_date: plantingDate,
        division,
        district: 'Badulla',
        latitude: user?.latitude || 6.8322,
        longitude: user?.longitude || 80.9980
      };

      const res = await API.post('/planting/log', payload);
      setFeedback({ type: 'success', message: 'Planting record logged successfully! Regional risk engine updated.' });
      if (onPlantingAdded) onPlantingAdded();
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error logging plot.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCrop = cropList.find(c => c.id === Number(cropId)) || cropList[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg overflow-hidden border border-outline-variant/40 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="bg-primary text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-lg text-white">
                {t('farmer_cultivation_logger_title') || 'Log New Cultivation Plot'}
              </h3>
              <p className="text-secondary-fixed text-xs">
                {t('farmer_cultivation_logger_desc') || 'Bandarawela Division • Real-Time Quota Tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {feedback && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span className="material-symbols-outlined text-lg">
                {feedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              {t('label_select_crop') || 'Select Crop Variety'}
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
            >
              {cropList.map(c => {
                const cName = lang === 'si' ? c.nameSi : lang === 'ta' ? c.nameTa : c.nameEn;
                return (
                  <option key={c.id} value={c.id}>
                    {cName} — {t('days_to_harvest_val', '{days} Days to Harvest', { days: c.days }).replace('{days}', c.days)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Land Size & Sowing Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-on-surface">
                {lang === 'si' ? 'වගා බිම් ප්‍රමාණය' : 'Cultivated Extent'}
              </label>
              {/* Unit Toggle */}
              <div className="inline-flex rounded-lg border border-outline-variant/60 p-0.5 bg-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    if (landUnit !== 'PERCHES') {
                      setLandUnit('PERCHES');
                      setLandValue(String(Math.round(calculatedPerches) || 40));
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                    landUnit === 'PERCHES'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lang === 'si' ? 'පර්චස් (Perches)' : 'Perches'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (landUnit !== 'ACRES') {
                      setLandUnit('ACRES');
                      setLandValue(String(calculatedAcres || 0.25));
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                    landUnit === 'ACRES'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lang === 'si' ? 'අක්කර (Acres)' : 'Acres'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <input
                    type="number"
                    step={landUnit === 'PERCHES' ? '1' : '0.01'}
                    min={landUnit === 'PERCHES' ? '1' : '0.01'}
                    value={landValue}
                    onChange={(e) => setLandValue(e.target.value)}
                    required
                    placeholder={landUnit === 'PERCHES' ? 'e.g. 20' : 'e.g. 0.25'}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-bold pr-16"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-outline uppercase pointer-events-none">
                    {landUnit === 'PERCHES' ? 'Perch' : 'Acres'}
                  </span>
                </div>
                {/* Real-time conversion badge */}
                <div className="mt-1 flex items-center justify-between text-[10px] text-on-surface-variant">
                  <span>
                    {landUnit === 'PERCHES'
                      ? `≈ ${calculatedAcres} Ac (1 Ac = 160 P)`
                      : `≈ ${calculatedPerches} Perches`}
                  </span>
                  {availableLand !== null && (
                    <span className="font-semibold text-emerald-700">
                      Avail: {availableLand.toFixed(2)} Ac ({(availableLand * 160).toFixed(0)} P)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  required
                  className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                />
                <span className="block mt-1 text-[10px] text-outline">
                  {t('label_sowing_date') || 'Planting / Sowing Date'}
                </span>
              </div>
            </div>
          </div>

          {/* Agrarian Division */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              {t('label_agrarian_division') || 'Agrarian Division / Zone'}
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
            >
              <option value="Bandarawela Central">Bandarawela Central</option>
              <option value="Welimada North">Welimada North</option>
              <option value="Haputale High">Haputale High</option>
              <option value="Ella Slopes">Ella Slopes</option>
              <option value="Diyatalawa Basin">Diyatalawa Basin</option>
            </select>
          </div>

          {/* Harvest Projection Summary */}
          <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-outline block">{t('growth_duration', 'Growth Duration')}</span>
              <span className="font-extrabold text-sm text-primary">{t('days_count', '{days} Days', { days: selectedCrop.days }).replace('{days}', selectedCrop.days)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-outline block">{t('est_harvest_window', 'Estimated Harvest Window')}</span>
              <span className="font-bold text-xs text-secondary">
                {new Date(new Date(plantingDate).getTime() + selectedCrop.days * 86400000).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container transition"
            >
              {t('btn_cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 transition"
            >
              {submitting ? t('logging', 'Logging...') : (t('btn_confirm_planting', 'Confirm & Log Plot'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
