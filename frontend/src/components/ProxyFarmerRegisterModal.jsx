import React, { useState, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle, UserPlus, MapPin, Phone, ShieldCheck, Key, Copy, Check } from 'lucide-react';
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

export default function ProxyFarmerRegisterModal({ isOpen, onClose, onFarmerRegistered }) {
  const { t, lang } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    nic: '',
    district: 'Badulla',
    division: 'Bandarawela',
    gnd_division: 'Bandarawela Central',
    address_line1: '',
    address_line2: '',
    city: 'Bandarawela',
    postal_code: '90100',
    total_land_size: '2.5',
    password: 'asvanna123',
    primary_crops: ['Carrot', 'Leeks'],
    latitude: '6.8304',
    longitude: '80.9878'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredAccount, setRegisteredAccount] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      return lang === 'si' ? 'කරුණාකර ගොවියාගේ මුල් නම සහ වාසගම ඇතුළත් කරන්න.' : 'Please enter farmer first name and last name.';
    }

    const phoneClean = formData.phone.trim().replace(/[\s-]/g, '');
    if (!/^(0|\+94)?7[0-9]{8}$/.test(phoneClean)) {
      return lang === 'si' ? 'වලංගු ශ්‍රී ලාංකික ජංගම දුරකථන අංකයක් ඇතුළත් කරන්න (උදා. 0771234567).' : 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567).';
    }

    const nicClean = formData.nic.trim().toUpperCase();
    if (!/^([0-9]{9}[VX]|[0-9]{12})$/.test(nicClean)) {
      return lang === 'si' ? 'වලංගු ජාතික හැඳුනුම්පත් අංකයක් (NIC) ඇතුළත් කරන්න (උදා. 851234567V හෝ 198512345678).' : 'Please enter a valid NIC (e.g., 851234567V or 198512345678).';
    }

    const acreage = parseFloat(formData.total_land_size);
    if (isNaN(acreage) || acreage <= 0 || acreage > 20) {
      return lang === 'si' ? 'වගා කළ හැකි ඉඩම් ප්‍රමාණය අක්කර 0.1 සහ 20 අතර විය යුතුය.' : 'Cultivable land acreage must be between 0.1 and 20 acres.';
    }

    return null;
  };

  const handleCropToggle = (crop) => {
    setFormData((prev) => {
      const exists = prev.primary_crops.includes(crop);
      const updated = exists ? prev.primary_crops.filter((c) => c !== crop) : [...prev.primary_crops, crop];
      return { ...prev, primary_crops: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErr = validateForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    try {
      const phoneClean = formData.phone.trim().replace(/[\s-]/g, '');
      const nicClean = formData.nic.trim().toUpperCase();
      const payload = {
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        last_name: formData.last_name.trim(),
        full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        phone: phoneClean,
        nic: nicClean,
        district: formData.district,
        division: formData.division,
        gnd_division: formData.gnd_division,
        address_line1: formData.address_line1.trim() || `No. 12, ${formData.gnd_division}`,
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim() || 'Bandarawela',
        postal_code: formData.postal_code.trim() || '90100',
        total_land_size: parseFloat(formData.total_land_size) || 1.0,
        latitude: parseFloat(formData.latitude) || 6.8304,
        longitude: parseFloat(formData.longitude) || 80.9878,
        password: formData.password || 'asvanna123'
      };

      const res = await API.post('/officer/register-farmer-proxy', payload);
      const farmerData = res.data?.data;
      setRegisteredAccount({
        id: farmerData?.id,
        full_name: payload.full_name,
        nic: nicClean,
        phone: phoneClean,
        password: payload.password,
        division: payload.division,
        gnd_division: payload.gnd_division,
        land_size: payload.total_land_size
      });

      if (onFarmerRegistered) {
        onFarmerRegistered(farmerData || payload);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register farmer via proxy.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!registeredAccount) return;
    const text = `ASVANNA Farmer Account Credentials:\nName: ${registeredAccount.full_name}\nNIC: ${registeredAccount.nic}\nPhone: ${registeredAccount.phone}\nPassword: ${registeredAccount.password}\nDivision: ${registeredAccount.division} (${registeredAccount.gnd_division})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-outline-variant/30 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary">
              {lang === 'si' ? 'ගොවි ලියාපදිංචි කිරීමේ පෝරමය (Proxy Registration)' : 'Farmer Cultivator Proxy Onboarding'}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {lang === 'si' ? 'ස්මාර්ට්ෆෝන් නොමැති ගොවීන් වෙනුවෙන් නිලධාරී ලියාපදිංචි කිරීම' : 'Official Department of Agrarian Development onboarding for smallholder cultivators'}
            </p>
          </div>
        </div>

        {/* Success Credentials View */}
        {registeredAccount ? (
          <div className="my-6 space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-emerald-950">
                  {lang === 'si' ? 'ගොවි ගිණුම සාර්ථකව සාදන ලදී!' : 'Farmer Account Successfully Created & Approved!'}
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  {lang === 'si'
                    ? 'මෙම ගිණුම ප්‍රාදේශීය නිලධාරියාට මෙන්ම ගොවියාටද පහත විස්තර මඟින් ක්ෂණිකව ප්‍රවේශ විය හැක.'
                    : 'This account has been verified and can be immediately accessed by Divisional Officers or the farmer using these credentials:'}
                </p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <span className="font-extrabold text-sm text-primary flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-secondary" />
                  {lang === 'si' ? 'ප්‍රවේශ තොරතුරු (Login Credentials)' : 'Access Credentials'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'si' ? 'පිටපත් විය!' : 'Copied!') : (lang === 'si' ? 'පිටපත් කරන්න' : 'Copy')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-on-surface-variant block font-semibold">{lang === 'si' ? 'ගොවියාගේ නම:' : 'Farmer Name:'}</span>
                  <strong className="text-sm text-on-surface">{registeredAccount.full_name}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-semibold">{lang === 'si' ? 'ජාතික හැඳුනුම්පත (NIC / Login ID):' : 'NIC (Username):'}</span>
                  <strong className="text-sm text-primary font-mono">{registeredAccount.nic}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-semibold">{lang === 'si' ? 'දුරකථන අංකය:' : 'Mobile Phone:'}</span>
                  <span className="text-on-surface font-semibold">{registeredAccount.phone}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-semibold">{lang === 'si' ? 'මුරපදය (Password):' : 'Password:'}</span>
                  <strong className="text-sm text-secondary font-mono bg-surface px-2 py-0.5 rounded border border-outline-variant/40">
                    {registeredAccount.password}
                  </strong>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-on-surface-variant italic">
                {lang === 'si'
                  ? 'ප්‍රාදේශීය නිලධාරී නාමාවලියෙන් මෙම ගොවියාගේ තොරතුරු ඕනෑම මොහොතක සංස්කරණය කළ හැක.'
                  : 'Divisional officers can manage, edit, and access plantings for this account from the Farmer Directory.'}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow transition cursor-pointer"
              >
                {lang === 'si' ? 'අවසන් කරන්න' : 'Done & Close'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-secondary-container/50 border border-secondary-container rounded-xl p-3 my-3 flex items-center gap-2.5 text-xs text-on-secondary-container">
              <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>
                {lang === 'si'
                  ? 'නිලධාරීන් විසින් ලියාපදිංචි කරනු ලබන ගොවි ගිණුම් ක්ෂණිකව APPROVED සහ Active තත්ත්වයට පත් වේ.'
                  : 'Officer-onboarded farmers are granted immediate APPROVED verification and full system access.'}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-error-container/40 border border-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {/* Names: First, Middle, Last */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'මුල් නම (First Name)' : 'First Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'මැද නම (Middle Name)' : 'Middle Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kumara"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'වාසගම (Last Name)' : 'Last Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bandara"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>
              </div>

              {/* NIC & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය (NIC Number)' : 'National Identity Card (NIC)'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="851234567V or 198512345678"
                    value={formData.nic}
                    onChange={(e) => setFormData({ ...formData, nic: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'ජංගම දුරකථන අංකය (Mobile Phone)' : 'Mobile Phone Number'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-on-surface-variant font-bold text-xs">+94</span>
                    <input
                      type="tel"
                      required
                      placeholder="77 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                    />
                  </div>
                </div>
              </div>

              {/* District & Agrarian Division */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'දිස්ත්‍රික්කය (District)' : 'District'} *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  >
                    <option value="Badulla">Badulla (බදුල්ල)</option>
                    <option value="Nuwara Eliya">Nuwara Eliya (නුවරඑළිය)</option>
                    <option value="Kandy">Kandy (මහනුවර)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'ගොවිජන සේවා බලප්‍රදේශය' : 'Agrarian Division'} *
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  >
                    <option value="Bandarawela">Bandarawela (බණ්ඩාරවෙල)</option>
                    <option value="Welimada">Welimada (වැලිමඩ)</option>
                    <option value="Haputale">Haputale (හපුතලේ)</option>
                    <option value="Ella">Ella (ඇල්ල)</option>
                    <option value="Diyatalawa">Diyatalawa (දියතලාව)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'ග්‍රාම නිලධාරී වසම (GND)' : 'GN Division'} *
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

              {/* Residential Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'ලිපිනය - 1 වන පේළිය (Address Line 1)' : 'Address Line 1'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No. 42, Temple Road"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'නගරය සහ තැපැල් කේතය (City & Postal)' : 'City & Postal Code'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Bandarawela"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary"
                    />
                    <input
                      type="text"
                      placeholder="90100"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cultivable Land & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">
                    {lang === 'si' ? 'වගා කළ හැකි මුළු ඉඩම (අක්කර)' : 'Cultivable Land Size (Acres)'} *
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
                  <label className="block text-on-surface-variant font-semibold mb-1 flex items-center justify-between">
                    <span>{lang === 'si' ? 'ගිණුම් මුරපදය (Initial Password)' : 'Account Password'}</span>
                    <span className="text-[10px] text-outline">Default: asvanna123</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-primary font-mono text-secondary font-bold"
                  />
                </div>
              </div>

              {/* Primary Crops Cultivated */}
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1.5">
                  {lang === 'si' ? 'වගා කරන ප්‍රධාන බෝග (Primary Crops Cultivated)' : 'Primary Crops Cultivated'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Carrot', 'Leeks', 'Cabbage', 'Potato', 'Beetroot', 'Paddy', 'Tomato', 'Bell Pepper'].map((crop) => {
                    const isSelected = formData.primary_crops.includes(crop);
                    return (
                      <button
                        type="button"
                        key={crop}
                        onClick={() => handleCropToggle(crop)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition cursor-pointer"
                >
                  {lang === 'si' ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {loading
                      ? (lang === 'si' ? 'ලියාපදිංචි කරමින්...' : 'Registering...')
                      : (lang === 'si' ? 'ගොවියා ලියාපදිංචි කර තහවුරු කරන්න' : 'Register & Approve Farmer')}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
