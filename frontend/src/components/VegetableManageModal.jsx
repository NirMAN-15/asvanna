import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle, Sprout, Image, DollarSign, Clock, Layers } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function VegetableManageModal({ isOpen, onClose, vegetable, onSaved }) {
  const { lang } = useContext(LanguageContext);
  const isEditing = Boolean(vegetable && vegetable.id);

  const [formData, setFormData] = useState({
    name_en: '',
    name_si: '',
    name_ta: '',
    crop_code: '',
    category: 'Upcountry Vegetable',
    growth_duration_days: '90',
    standard_price_per_kg: '200',
    avg_yield_per_acre_kg: '4500',
    standard_demand_kg: '150000',
    image_url: '',
    description_en: '',
    description_si: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (vegetable) {
        setFormData({
          name_en: vegetable.name_en || vegetable.nameEn || '',
          name_si: vegetable.name_si || vegetable.nameSi || '',
          name_ta: vegetable.name_ta || vegetable.nameTa || '',
          crop_code: vegetable.crop_code || vegetable.code || `CROP_${Date.now()}`,
          category: vegetable.category || 'Upcountry Vegetable',
          growth_duration_days: String(vegetable.growth_duration_days || 90),
          standard_price_per_kg: String(vegetable.standard_price_per_kg || 200),
          avg_yield_per_acre_kg: String(vegetable.avg_yield_per_acre_kg || 4500),
          standard_demand_kg: String(vegetable.standard_demand_kg || 150000),
          image_url: vegetable.image_url || vegetable.imageUrl || '',
          description_en: vegetable.description_en || '',
          description_si: vegetable.description_si || ''
        });
      } else {
        setFormData({
          name_en: '',
          name_si: '',
          name_ta: '',
          crop_code: `CROP_${Date.now()}`,
          category: 'Upcountry Vegetable',
          growth_duration_days: '90',
          standard_price_per_kg: '200',
          avg_yield_per_acre_kg: '4500',
          standard_demand_kg: '150000',
          image_url: '',
          description_en: '',
          description_si: ''
        });
      }
      setError('');
      setSuccess('');
    }
  }, [vegetable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        name_en: formData.name_en.trim(),
        name_si: formData.name_si.trim() || formData.name_en.trim(),
        name_ta: formData.name_ta.trim() || formData.name_en.trim(),
        crop_code: formData.crop_code.trim() || `CROP_${Date.now()}`,
        category: formData.category,
        growth_duration_days: parseInt(formData.growth_duration_days, 10) || 90,
        standard_price_per_kg: parseFloat(formData.standard_price_per_kg) || 200,
        avg_yield_per_acre_kg: parseFloat(formData.avg_yield_per_acre_kg) || 4500,
        standard_demand_kg: parseFloat(formData.standard_demand_kg) || 150000,
        image_url: formData.image_url.trim() || null,
        description_en: formData.description_en.trim() || null,
        description_si: formData.description_si.trim() || null
      };

      let res;
      if (isEditing) {
        res = await API.put(`/crops/${vegetable.id}`, payload);
        setSuccess(lang === 'si' ? 'එළවළු තොරතුරු සාර්ථකව යාවත්කාලීන විය!' : 'Vegetable updated successfully!');
      } else {
        res = await API.post('/crops', payload);
        setSuccess(lang === 'si' ? 'නව එළවළු බෝගය සාර්ථකව ඇතුළත් කරන ලදී!' : 'New vegetable created successfully!');
      }

      setTimeout(() => {
        if (onSaved) onSaved(res.data?.data || payload);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vegetable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
            <Sprout className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary">
              {isEditing
                ? (lang === 'si' ? 'එළවළු බෝග තොරතුරු සංස්කරණය' : 'Edit Vegetable Details')
                : (lang === 'si' ? 'නව එළවළු බෝගයක් ඇතුළත් කිරීම' : 'Add New Vegetable')}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {lang === 'si'
                ? 'ප්‍රාදේශීය නිලධාරී බෝග නාමාවලිය සහ ඉලක්කගත ධාරිතාව'
                : 'Divisional Officer Crop Catalog & Production Quotas'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
          {/* Names in 3 languages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'ඉංග්‍රීසි නම (English)' : 'Name (English)'} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Carrot"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'සිංහල නම' : 'Name (Sinhala)'} *
              </label>
              <input
                type="text"
                required
                placeholder="උදා. කැරට්"
                value={formData.name_si}
                onChange={(e) => setFormData({ ...formData, name_si: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'දෙමළ නම' : 'Name (Tamil)'}
              </label>
              <input
                type="text"
                placeholder="e.g. கேரட்"
                value={formData.name_ta}
                onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              />
            </div>
          </div>

          {/* Category & Crop Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'බෝග කාණ්ඩය (Category)' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              >
                <option value="Upcountry Vegetable">Upcountry Vegetable (උඩරට එළවළු)</option>
                <option value="Lowcountry Vegetable">Lowcountry Vegetable (පහතරට එළවළු)</option>
                <option value="Tuber & Root">Tuber & Root (අල බෝග)</option>
                <option value="Grain">Grain & Paddy (ධාන්‍ය / වී)</option>
                <option value="Other">Other Cultivation</option>
              </select>
            </div>
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'බෝග කේතය (Crop Code)' : 'Crop Code'}
              </label>
              <input
                type="text"
                value={formData.crop_code}
                onChange={(e) => setFormData({ ...formData, crop_code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary uppercase font-mono"
              />
            </div>
          </div>

          {/* Pricing, Yield & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'සම්මත මිල (රු./kg)' : 'Price (Rs/kg)'} *
              </label>
              <input
                type="number"
                step="5"
                required
                value={formData.standard_price_per_kg}
                onChange={(e) => setFormData({ ...formData, standard_price_per_kg: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-bold text-primary"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'අස්වනු කාලය (දින)' : 'Growth (Days)'} *
              </label>
              <input
                type="number"
                required
                value={formData.growth_duration_days}
                onChange={(e) => setFormData({ ...formData, growth_duration_days: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              />
            </div>
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                {lang === 'si' ? 'ඉලක්කගත ධාරිතාව (kg)' : 'Target Quota (kg)'}
              </label>
              <input
                type="number"
                step="1000"
                value={formData.standard_demand_kg}
                onChange={(e) => setFormData({ ...formData, standard_demand_kg: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="block text-on-surface-variant font-semibold mb-1 flex items-center justify-between">
              <span>{lang === 'si' ? 'එළවළු ඡායාරූප සබැඳිය (Image URL)' : 'Vegetable Image URL'}</span>
              <span className="text-[10px] text-outline">HTTP / HTTPS link</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary text-xs"
              />
              {formData.image_url && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant flex-shrink-0 bg-surface-container-low">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition cursor-pointer"
            >
              {lang === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {loading
                  ? (lang === 'si' ? 'සුරකිමින්...' : 'Saving...')
                  : isEditing
                    ? (lang === 'si' ? 'වෙනස්කම් සුරකින්න' : 'Save Vegetable Changes')
                    : (lang === 'si' ? 'එළවළු බෝගය ඇතුළත් කරන්න' : 'Add Vegetable')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
