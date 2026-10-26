import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { MASTER_CROPS } from '../constants/crops';

export default function ProxyDataModal({ isOpen, onClose, onDataAdded }) {
  const { t, lang } = useContext(LanguageContext);
  const [cropList, setCropList] = useState(MASTER_CROPS);
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

  const [landUnit, setLandUnit] = useState('PERCHES'); // 'PERCHES' | 'ACRES'
  const [landValue, setLandValue] = useState('40');

  useEffect(() => {
    API.get('/crops')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const mapped = res.data.data.map(c => ({
            id: c.id,
            nameEn: c.name_en,
            nameSi: c.name_si,
            nameTa: c.name_ta || c.name_en
          }));
          setCropList(mapped);
        }
      })
      .catch(() => setCropList(MASTER_CROPS));
  }, []);

  if (!isOpen) return null;

  const numVal = parseFloat(landValue);
  const calculatedAcres = landUnit === 'PERCHES'
    ? (numVal ? parseFloat((numVal / 160).toFixed(4)) : 0)
    : (numVal || 0);
  const calculatedPerches = landUnit === 'PERCHES'
    ? (numVal || 0)
    : (numVal ? parseFloat((numVal * 160).toFixed(1)) : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!numVal || numVal <= 0) {
      setError(`Please enter a valid land size in ${landUnit.toLowerCase()}.`);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        crop_id: Number(formData.crop_id),
        land_unit: landUnit,
        land_size_perches: calculatedPerches,
        land_size_acres: calculatedAcres
      };
      await API.post('/planting/log', payload);
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
              placeholder="e.g. 0771000001 or ID 101"
              value={formData.farmer_id}
              onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('label_select_crop')}</label>
            <select
              value={formData.crop_id}
              onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
            >
              {cropList.map(c => {
                const label = lang === 'si'
                  ? `${c.nameSi || c.nameEn}`
                  : lang === 'ta'
                  ? `${c.nameTa || c.nameEn}`
                  : `${c.nameEn} (${c.nameSi})`;
                return (
                  <option key={c.id} value={c.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Land Extent with Unit Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">
                {t('label_cultivated_land')}
              </label>
              <div className="inline-flex rounded-md border border-gray-300 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    if (landUnit !== 'PERCHES') {
                      setLandUnit('PERCHES');
                      setLandValue(String(Math.round(calculatedPerches) || 40));
                    }
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
                    landUnit === 'PERCHES'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Perches (පර්චස්)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (landUnit !== 'ACRES') {
                      setLandUnit('ACRES');
                      setLandValue(String(calculatedAcres || 0.25));
                    }
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
                    landUnit === 'ACRES'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Acres (අක්කර)
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step={landUnit === 'PERCHES' ? '1' : '0.01'}
                min={landUnit === 'PERCHES' ? '1' : '0.01'}
                required
                placeholder={landUnit === 'PERCHES' ? 'e.g. 40' : 'e.g. 0.25'}
                value={landValue}
                onChange={(e) => setLandValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-xs pr-16"
              />
              <span className="absolute right-3 top-2 text-[11px] font-bold text-gray-400 uppercase pointer-events-none">
                {landUnit === 'PERCHES' ? 'Perch' : 'Acres'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 flex justify-between">
              <span>
                {landUnit === 'PERCHES'
                  ? `≈ ${calculatedAcres} Acres (160 Perches = 1 Acre)`
                  : `≈ ${calculatedPerches} Perches`}
              </span>
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
