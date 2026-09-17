import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

const MASTER_CROPS = [
  { id: 1, nameEn: 'Leeks', nameSi: 'ලීක්ස්', nameTa: 'லீக்ஸ்', days: 90 },
  { id: 2, nameEn: 'Cabbage', nameSi: 'ගෝවා', nameTa: 'முட்டைக்கோஸ்', days: 75 },
  { id: 3, nameEn: 'Carrot', nameSi: 'කැරට්', nameTa: 'கேரட்', days: 85 },
  { id: 4, nameEn: 'Beetroot', nameSi: 'බීට්රූට්', nameTa: 'பீட்ரூட்', days: 70 },
  { id: 5, nameEn: 'Upcountry Potato', nameSi: 'අර්තාපල්', nameTa: 'உருளைக்கிழங்கு', days: 100 },
  { id: 6, nameEn: 'Green Beans', nameSi: 'බෝංචි', nameTa: 'போஞ்சி', days: 60 },
  { id: 7, nameEn: 'Tomato', nameSi: 'තක්කාලි', nameTa: 'தக்காளி', days: 75 },
  { id: 8, nameEn: 'Capsicum', nameSi: 'මාළු මිරිස්', nameTa: 'குடை மிளகாய்', days: 80 },
  { id: 9, nameEn: 'Radish', nameSi: 'රාබු', nameTa: 'முள்ளங்கி', days: 45 },
  { id: 10, nameEn: 'Knol-Khol', nameSi: 'නෝකෝල්', nameTa: 'நூல்கோல்', days: 55 },
  { id: 11, nameEn: 'Spring Onion', nameSi: 'ළූණු කොළ', nameTa: 'வெங்காய இலை', days: 50 },
  { id: 12, nameEn: 'Lettuce', nameSi: 'සලාද කොළ', nameTa: 'லெட்யூස්', days: 45 },
  { id: 13, nameEn: 'Celery', nameSi: 'සැල්දිරි', nameTa: 'செலரி', days: 70 },
  { id: 14, nameEn: 'Broccoli', nameSi: 'බ්‍රොකොලි', nameTa: 'ப்ரோக்கோலி', days: 65 },
  { id: 15, nameEn: 'Cauliflower', nameSi: 'මල්ගෝවා', nameTa: 'காலிஃபிளவர்', days: 70 },
  { id: 16, nameEn: 'Pumpkin', nameSi: 'වට්ටක්කා', nameTa: 'பூசணி', days: 100 },
  { id: 17, nameEn: 'Bitter Gourd', nameSi: 'කරවිල', nameTa: 'பாகற்காய்', days: 70 },
  { id: 18, nameEn: 'Snake Gourd', nameSi: 'පතෝල', nameTa: 'புடලங்காய்', days: 65 },
  { id: 19, nameEn: 'Cucumber', nameSi: 'පිපිඤ්ඤා', nameTa: 'வெள்ளரிக்காய்', days: 50 },
  { id: 20, nameEn: 'Green Chili', nameSi: 'අමු මිරිස්', nameTa: 'பச்சை மிளகாய்', days: 90 },
  { id: 21, nameEn: 'Red Onion', nameSi: 'රතු ළූණු', nameTa: 'சிவப்பு வெங்காயம்', days: 75 },
  { id: 22, nameEn: 'Gotukola', nameSi: 'ගොටුකොළ', nameTa: 'வல்லாரை', days: 40 },
  { id: 23, nameEn: 'Water Spinach', nameSi: 'කංකුං', nameTa: 'வள்ளல் கீரை', days: 30 },
  { id: 24, nameEn: 'Mukunuwenna', nameSi: 'මුකුණුවැන්න', nameTa: 'முக்குனுவென்ன', days: 30 },
  { id: 25, nameEn: 'Spinach', nameSi: 'නිවිති', nameTa: 'பசலைக் கீரை', days: 40 }
];

export default function FarmerPlantingModal({ isOpen, onClose, onPlantingAdded, onSuccess, initialCropId }) {
  const { user } = useContext(AuthContext);
  const { lang, t } = useContext(LanguageContext);
  const [cropId, setCropId] = useState(initialCropId ? String(initialCropId) : '1');
  const [landSizeAcres, setLandSizeAcres] = useState('1.5');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [division, setDivision] = useState(user?.division || 'Bandarawela Central');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [availableLand, setAvailableLand] = useState(null);

  useEffect(() => {
    if (initialCropId) setCropId(String(initialCropId));
  }, [initialCropId]);

  useEffect(() => {
    if (isOpen && user?.id) {
      API.get(`/planting/farmer/${user.id}`)
        .then(res => {
          const totalLand = user?.total_land_size || 5;
          const utilizedLand = res.data.data.reduce((sum, crop) => sum + (parseFloat(crop.land_size_acres) || 0), 0);
          setAvailableLand(Math.max(0, totalLand - utilizedLand));
        })
        .catch(err => console.error("Failed to fetch farmer crops for validation", err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const acres = parseFloat(landSizeAcres);
    if (!acres || acres <= 0) {
      setFeedback({ type: 'error', message: 'Land size must be greater than 0 acres.' });
      setSubmitting(false);
      return;
    }

    if (availableLand !== null && acres > availableLand) {
      setFeedback({ type: 'error', message: `Cannot allocate ${acres} acres. You only have ${availableLand.toFixed(2)} acres of free land available.` });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        crop_id: Number(cropId),
        land_size_acres: acres,
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

  const selectedCrop = MASTER_CROPS.find(c => c.id === Number(cropId)) || MASTER_CROPS[0];

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
              {MASTER_CROPS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameEn} ({c.nameSi}) — {c.days} Days to Harvest
                </option>
              ))}
            </select>
          </div>

          {/* Land Size & Sowing Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                {t('label_cultivated_land') || 'Cultivated Extent (Acres)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                required
                className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                {t('label_sowing_date') || 'Planting / Sowing Date'}
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                required
                className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
              />
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
              <span className="text-[10px] uppercase font-bold text-outline block">Growth Duration</span>
              <span className="font-extrabold text-sm text-primary">{selectedCrop.days} Days</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-outline block">Estimated Harvest Window</span>
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
              {submitting ? 'Logging...' : (t('btn_confirm_planting') || 'Confirm & Log Plot')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
