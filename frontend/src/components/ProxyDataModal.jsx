import React, { useState, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function ProxyDataModal({ isOpen, onClose, onDataAdded }) {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    farmer_id: '',
    crop_id: '1',
    land_size_acres: '',
    planting_date: new Date().toISOString().split('T')[0],
    latitude: '6.8258',
    longitude: '80.9982',
    district: 'Badulla',
    division: 'Bandarawela'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/planting/log', formData);
      setSuccess('Proxy planting record logged successfully!');
      setTimeout(() => {
        onDataAdded();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proxy planting record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">{t('proxy_modal_title')}</h2>
        <p className="text-xs text-gray-500 mb-4">{t('proxy_modal_desc')}</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('label_farmer_phone_id')}</label>
            <input
              type="text"
              required
              placeholder="e.g. 3 (Kapila Bandara)"
              value={formData.farmer_id}
              onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('label_select_crop')}</label>
              <select
                value={formData.crop_id}
                onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1">Leeks (ලීක්ස්)</option>
                <option value="2">Cabbage (ගෝවා)</option>
                <option value="3">Carrot (කැරට්)</option>
                <option value="4">Beetroot (බීට්රූට්)</option>
                <option value="5">Potato (අර්තාපල්)</option>
                <option value="6">Knol Khol (නෝකෝල්)</option>
                <option value="7">Bell Pepper (මාළු මිරිස්)</option>
                <option value="8">Tomato (තක්කාලි)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('label_cultivated_land')}</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                placeholder="e.g. 1.5"
                value={formData.land_size_acres}
                onChange={(e) => setFormData({ ...formData, land_size_acres: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('label_sowing_date')}</label>
            <input
              type="date"
              required
              value={formData.planting_date}
              onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              {loading ? 'Submitting...' : t('btn_submit_proxy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
