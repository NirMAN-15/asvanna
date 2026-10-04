import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle, Edit, MapPin, Phone, ShieldCheck, Key, Sprout, PlusCircle, Calendar, Layers } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

const BANDARAWELA_GNDS = [
  'Bandarawela Central',
  'Bindunuwewa',
  'Obada Ella',
  'Heel Oya',
  'Ambatenna',
  'Rathkarawwa',
  'Mirahawatte',
  'Kinigama',
  'Wewatenna',
  'Diganatenna',
  'Mahaulpatha',
  'Kabillawela'
];

const DEFAULT_CROPS = [
  { id: 1, name: 'Leeks (ලීක්ස්)' },
  { id: 2, name: 'Cabbage (ගෝවා)' },
  { id: 3, name: 'Carrot (කැරට්)' },
  { id: 4, name: 'Beetroot (බීට්රූට්)' },
  { id: 5, name: 'Potato (අර්තාපල්)' },
  { id: 6, name: 'Knol Khol (නෝකෝල්)' },
  { id: 7, name: 'Bell Pepper (මාළු මිරිස්)' },
  { id: 8, name: 'Tomato (තක්කාලි)' },
  { id: 9, name: 'Paddy (වී)' }
];

export default function EditFarmerModal({ isOpen, onClose, farmer, onFarmerUpdated }) {
  const { t, lang } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('ACCOUNT_INFO');

  // Account details form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    full_name: '',
    phone: '',
    nic: '',
    district: 'Badulla',
    division: 'Bandarawela',
    gnd_division: 'Bandarawela Central',
    address_line1: '',
    address_line2: '',
    city: 'Bandarawela',
    postal_code: '90100',
    total_land_size: '1.0',
    verification_status: 'APPROVED',
    is_active: true,
    new_password: ''
  });

  // Cultivation form state
  const [plantingForm, setPlantingForm] = useState({
    crop_id: '3',
    land_size_acres: '1.0',
    planting_date: new Date().toISOString().split('T')[0],
    expected_yield_kg: '2500',
    status: 'PLANTED'
  });
  const [farmerPlantings, setFarmerPlantings] = useState([]);
  const [loadingPlantings, setLoadingPlantings] = useState(false);
  const [plantingSubmitting, setPlantingSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (farmer && isOpen) {
      setFormData({
        first_name: farmer.first_name || '',
        middle_name: farmer.middle_name || '',
        last_name: farmer.last_name || '',
        full_name: farmer.full_name || '',
        phone: farmer.phone || '',
        nic: farmer.nic || '',
        district: farmer.district || 'Badulla',
        division: farmer.division || 'Bandarawela',
        gnd_division: farmer.gnd_division || 'Bandarawela Central',
        address_line1: farmer.address_line1 || '',
        address_line2: farmer.address_line2 || '',
        city: farmer.city || farmer.division || 'Bandarawela',
        postal_code: farmer.postal_code || '90100',
        total_land_size: farmer.total_land_size ? String(farmer.total_land_size) : '1.0',
        verification_status: farmer.verification_status || 'APPROVED',
        is_active: farmer.is_active !== undefined ? farmer.is_active : true,
        new_password: ''
      });
      fetchFarmerPlantings(farmer.id);
      setError('');
      setSuccess('');
    }
  }, [farmer, isOpen]);

  const fetchFarmerPlantings = async (farmerId) => {
    setLoadingPlantings(true);
    try {
      const res = await API.get(`/planting/farmer/${farmerId}`);
      if (res.data?.data) {
        setFarmerPlantings(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch plantings for farmer:', err.message);
    } finally {
      setLoadingPlantings(false);
    }
  };

  if (!isOpen || !farmer) return null;

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        full_name: formData.full_name.trim() || `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone.trim(),
        nic: formData.nic.trim().toUpperCase(),
        district: formData.district,
        division: formData.division,
        gnd_division: formData.gnd_division,
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim() || 'Bandarawela',
        postal_code: formData.postal_code.trim() || '90100',
        total_land_size: parseFloat(formData.total_land_size) || 1.0,
        verification_status: formData.verification_status,
        is_active: Boolean(formData.is_active)
      };

      if (formData.new_password && formData.new_password.trim().length > 0) {
        payload.password = formData.new_password.trim();
      }

      const res = await API.put(`/officer/farmers/${farmer.id}`, payload);
      setSuccess(
        lang === 'si'
          ? 'ගොවි ගිණුම් තොරතුරු සාර්ථකව යාවත්කාලීන විය!'
          : 'Farmer account details updated successfully!'
      );

      setTimeout(() => {
        if (onFarmerUpdated) {
          onFarmerUpdated(res.data?.data || payload);
        }
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update farmer details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlanting = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPlantingSubmitting(true);

    try {
      const payload = {
        farmer_id: farmer.id,
        crop_id: parseInt(plantingForm.crop_id, 10),
        land_size_acres: parseFloat(plantingForm.land_size_acres) || 1.0,
        planting_date: plantingForm.planting_date,
        expected_yield_kg: parseFloat(plantingForm.expected_yield_kg) || 2000,
        district: farmer.district || 'Badulla',
        division: farmer.division || 'Bandarawela',
        latitude: farmer.latitude ? parseFloat(farmer.latitude) : 6.8304,
        longitude: farmer.longitude ? parseFloat(farmer.longitude) : 80.9878,
        status: plantingForm.status || 'PLANTED'
      };

      await API.post('/planting/log', payload);
      setSuccess(
        lang === 'si'
          ? 'වගා බෝග වාර්තාව සාර්ථකව ඇතුළත් කරන ලදී!'
          : 'Farmer cultivation record logged successfully!'
      );
      fetchFarmerPlantings(farmer.id);
      if (onFarmerUpdated) {
        onFarmerUpdated(farmer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log farmer cultivation record.');
    } finally {
      setPlantingSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
            <Edit className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary">
              {lang === 'si' ? 'ගොවි තොරතුරු සහ වගා කළමනාකරණය' : 'Farmer Details & Cultivation Management'}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {farmer.full_name} • NIC: {farmer.nic || 'N/A'} • #{farmer.id}
            </p>
          </div>
        </div>

        {/* Tabs: Account Info vs Cultivation Data */}
        <div className="flex border-b border-outline-variant/30 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('ACCOUNT_INFO')}
            className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'ACCOUNT_INFO'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'si' ? 'ගිණුම් තොරතුරු (Account Info)' : 'Account & Profile Info'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CULTIVATION_DATA')}
            className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'CULTIVATION_DATA'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>{lang === 'si' ? 'වගා බිම් දත්ත එකතු කිරීම (Add Cultivation)' : 'Farmer Cultivation Data'}</span>
          </button>
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

        {/* TAB 1: Account Information */}
        {activeTab === 'ACCOUNT_INFO' && (
          <form onSubmit={handleAccountSubmit} className="space-y-3.5 text-xs font-medium">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'මුල් නම' : 'First Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'මැද නම' : 'Middle Name'}
                </label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'වාසගම' : 'Last Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
            </div>

            {/* Contact & NIC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය (NIC)' : 'NIC Number'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'දුරකථන අංකය' : 'Phone Number'} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
            </div>

            {/* Division & GND */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'ගොවිජන සේවා බලප්‍රදේශය' : 'Agrarian Division'}
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                >
                  <option value="Bandarawela">Bandarawela</option>
                  <option value="Welimada">Welimada</option>
                  <option value="Haputale">Haputale</option>
                  <option value="Ella">Ella</option>
                  <option value="Diyatalawa">Diyatalawa</option>
                </select>
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'ග්‍රාම නිලධාරී වසම (GND)' : 'GN Division'}
                </label>
                <select
                  value={formData.gnd_division}
                  onChange={(e) => setFormData({ ...formData, gnd_division: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                >
                  {BANDARAWELA_GNDS.map((gnd) => (
                    <option key={gnd} value={gnd}>{gnd}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'ලිපිනය - 1 වන පේළිය' : 'Address Line 1'}
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'නගරය' : 'City'}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                />
              </div>
            </div>

            {/* Land Size & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'වගා ඉඩම් ප්‍රමාණය (අක්කර)' : 'Total Land Size (Acres)'} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  required
                  value={formData.total_land_size}
                  onChange={(e) => setFormData({ ...formData, total_land_size: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-bold text-primary"
                />
              </div>
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">
                  {lang === 'si' ? 'තහවුරු කිරීමේ තත්ත්වය' : 'Verification Status'}
                </label>
                <select
                  value={formData.verification_status}
                  onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-bold"
                >
                  <option value="APPROVED">APPROVED (තහවුරු කරන ලදී)</option>
                  <option value="PENDING">PENDING (පොරොත්තුවේ)</option>
                  <option value="REJECTED">REJECTED (ප්‍රතික්ෂේපිත)</option>
                </select>
              </div>
            </div>

            {/* Reset Password */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                <Key className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'මුරපදය වෙනස් කිරීම (අවශ්‍ය නම් පමණි)' : 'Reset Account Password (Optional)'}</span>
              </div>
              <input
                type="password"
                placeholder={lang === 'si' ? 'නව මුරපදයක් ලබාදීමට මෙහි සටහන් කරන්න' : 'Enter new password to reset'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface text-xs focus:outline-primary"
              />
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition cursor-pointer"
              >
                {lang === 'si' ? 'වසන්න' : 'Close'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? (lang === 'si' ? 'සුරකිමින්...' : 'Saving...') : (lang === 'si' ? 'ගිණුම් විස්තර සුරකින්න' : 'Save Account Details')}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Add Cultivation & Crop Data */}
        {activeTab === 'CULTIVATION_DATA' && (
          <div className="space-y-4 text-xs font-medium">
            {/* New Planting Form */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'si' ? 'නව වගා බෝග වාර්තාවක් ඇතුළත් කරන්න' : 'Log New Cultivation Record for Farmer'}</span>
              </div>

              <form onSubmit={handleAddPlanting} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'වගා බෝගය (Crop)' : 'Crop'} *
                  </label>
                  <select
                    value={plantingForm.crop_id}
                    onChange={(e) => setPlantingForm({ ...plantingForm, crop_id: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-bold"
                  >
                    {DEFAULT_CROPS.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'වගා කළ ඉඩම් ප්‍රමාණය (අක්කර)' : 'Acreage (Acres)'} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={plantingForm.land_size_acres}
                    onChange={(e) => setPlantingForm({ ...plantingForm, land_size_acres: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'වගා කළ දිනය' : 'Planting Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={plantingForm.planting_date}
                    onChange={(e) => setPlantingForm({ ...plantingForm, planting_date: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'අපේක්ෂිත අස්වැන්න (කි.ග්‍රෑ.)' : 'Expected Yield (kg)'}
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={plantingForm.expected_yield_kg}
                    onChange={(e) => setPlantingForm({ ...plantingForm, expected_yield_kg: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={plantingSubmitting}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{plantingSubmitting ? (lang === 'si' ? 'ඇතුළත් කරමින්...' : 'Adding...') : (lang === 'si' ? 'වගා වාර්තාව ඇතුළත් කරන්න' : 'Save Cultivation Record')}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of existing plantings for this farmer */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'දැනට සක්‍රිය වගා බිම්' : 'Active Cultivation Plots'} ({farmerPlantings.length})</span>
              </h4>

              {loadingPlantings ? (
                <p className="text-xs text-outline py-2">Loading active plots...</p>
              ) : farmerPlantings.length === 0 ? (
                <div className="p-4 bg-surface-container-low rounded-xl text-center text-on-surface-variant text-xs">
                  {lang === 'si' ? 'මෙම ගොවියා සඳහා මෙතෙක් වගා වාර්තා ඇතුළත් කර නොමැත.' : 'No planting records found for this farmer yet.'}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {farmerPlantings.map((p) => (
                    <div key={p.id} className="p-3 bg-surface border border-outline-variant/30 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-sm text-primary">{p.crop_name_en || p.crop_name_si || `Crop #${p.crop_id}`}</span>
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                          <span>{p.land_size_acres} Acres</span>
                          <span>•</span>
                          <span>{new Date(p.planting_date).toLocaleDateString()}</span>
                          {p.expected_yield_kg && (
                            <>
                              <span>•</span>
                              <span>Est: {p.expected_yield_kg} kg</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {p.status || 'PLANTED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition cursor-pointer"
              >
                {lang === 'si' ? 'අවසන් කරන්න' : 'Done & Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
