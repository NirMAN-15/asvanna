import React, { useState, useContext } from 'react';
import API from '../services/api';
import { X, CheckCircle, AlertCircle, UserPlus, MapPin, Phone, ShieldCheck } from 'lucide-react';
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
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    nic: '',
    district: 'Badulla',
    division: 'Bandarawela',
    gnd_division: 'Bandarawela Central',
    address: '',
    total_land_size: '1.0',
    latitude: '6.8304',
    longitude: '80.9878'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const validateForm = () => {
    // Validate Phone (10 digits Sri Lanka format)
    const phoneClean = formData.phone.trim().replace(/[\s-]/g, '');
    if (!/^(0|\+94)?7[0-9]{8}$/.test(phoneClean)) {
      return 'Please enter a valid Sri Lankan mobile number (e.g. 0771234567).';
    }

    // Validate NIC (old 9 digits + V/X or new 12 digits)
    const nicClean = formData.nic.trim().toUpperCase();
    if (!/^([0-9]{9}[VX]|[0-9]{12})$/.test(nicClean)) {
      return 'Please enter a valid NIC (e.g., 851234567V or 198512345678).';
    }

    // Validate Land Size
    const acreage = parseFloat(formData.total_land_size);
    if (isNaN(acreage) || acreage <= 0 || acreage > 20) {
      return 'Cultivable land acreage must be between 0.1 and 20 acres for smallholder plots.';
    }

    // Validate GPS within Bandarawela bounding box
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < 6.75 || lat > 6.90 || lng < 80.90 || lng > 81.05) {
      return 'GPS coordinates must be within Bandarawela Agrarian Division (Lat: 6.75–6.90, Lng: 80.90–81.05).';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationErr = validateForm();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone: formData.phone.trim(),
        nic: formData.nic.trim().toUpperCase(),
        total_land_size: parseFloat(formData.total_land_size),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      const res = await API.post('/officer/register-farmer-proxy', payload);
      setSuccess(`Farmer ${formData.full_name} successfully registered and verified via proxy!`);
      setTimeout(() => {
        if (onFarmerRegistered) onFarmerRegistered(res.data?.data);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register farmer via proxy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary">
              Proxy Farmer Registration
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Official DoA Division onboarding for offline smallholder farmers
            </p>
          </div>
        </div>

        <div className="bg-secondary-container/50 border border-secondary-container rounded-xl p-3 my-4 flex items-center gap-2.5 text-xs text-on-secondary-container">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>
            Registered farmers are immediately assigned <strong>APPROVED</strong> verification status and given standard access.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-error-container/40 border border-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-primary-container/40 border border-primary-container text-on-primary-container text-xs rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Farmer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sunil Karunaratne"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Mobile Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-outline absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="0771234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* NIC & GN Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                National Identity Card (NIC) *
              </label>
              <input
                type="text"
                required
                placeholder="851234567V or 198512345678"
                value={formData.nic}
                onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface uppercase"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Grama Niladhari Division (GND) *
              </label>
              <select
                value={formData.gnd_division}
                onChange={(e) => setFormData({ ...formData, gnd_division: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              >
                {BANDARAWELA_GNDS.map((gnd) => (
                  <option key={gnd} value={gnd}>{gnd}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label className="block text-on-surface-variant font-semibold mb-1">
              Farm / Residential Address
            </label>
            <input
              type="text"
              placeholder="e.g. No. 42, Heel Oya Road, Bandarawela"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
            />
          </div>

          {/* Acreage & Coordinates */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Acreage (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                required
                value={formData.total_land_size}
                onChange={(e) => setFormData({ ...formData, total_land_size: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              />
            </div>
          </div>

          <p className="text-[11px] text-outline italic">
            Default coordinates set to Bandarawela Agrarian Services Centre (6.8304° N, 80.9878° E).
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register & Approve Farmer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
