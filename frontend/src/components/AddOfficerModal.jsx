import React, { useState } from 'react';
import API from '../services/api';
import { X, UserPlus, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles, Key } from 'lucide-react';

export default function AddOfficerModal({ isOpen, onClose, onUserAdded }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nic: '',
    phone: '',
    email: '',
    district: 'Badulla',
    division: 'Bandarawela',
    gnd_division: '',
    password: '',
    master_key: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    if (!formData.master_key.trim()) {
      setError('Master Credential Key is required to authorize staff or administrator creation.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim() || undefined,
        nic: formData.nic.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        district: formData.district.trim() || 'Badulla',
        division: formData.division.trim() || 'Bandarawela',
        gnd_division: formData.gnd_division.trim() || undefined,
        password: formData.password || undefined,
        role: isAdmin ? 'ADMIN' : 'OFFICER',
        master_key: formData.master_key.trim(),
        admin_key: formData.master_key.trim()
      };

      const res = await API.post('/officer/register-officer-admin', payload);
      setSuccessMsg(res.data?.message || 'User registered successfully!');
      
      setTimeout(() => {
        if (onUserAdded) onUserAdded();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to register officer/admin:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      nic: '',
      phone: '',
      email: '',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: '',
      password: '',
      master_key: ''
    });
    setIsAdmin(false);
    setShowMasterKey(false);
    setShowPassword(false);
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-high/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                {isAdmin ? 'Add System Administrator' : 'Add Divisional Officer'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Provision new administrative personnel for ASVANNA
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Specification Special Toggle */}
          <div className={`p-4 rounded-xl border transition-all ${
            isAdmin
              ? 'border-amber-500/50 bg-amber-500/10 shadow-xs'
              : 'border-outline-variant/60 bg-surface-container-lowest/60'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span>👑 Grant Full System Administrator Access</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                    isAdmin ? 'bg-amber-500 text-white' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {isAdmin ? 'Role: ADMIN' : 'Role: OFFICER'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {isAdmin
                    ? 'User will be registered as a SYSTEM ADMINISTRATOR with multi-user view switcher, crop quotas management, and staff controls.'
                    : 'User will be registered as a DIVISIONAL OFFICER for field verifications, advisory broadcasts, and farmer monitoring.'}
                </p>
              </div>
            </label>
          </div>

          {/* Master Credential Key (Required for Officer/Admin Provisioning) */}
          <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Master Credential Key (අධීක්ෂක රහස් යතුර) <span className="text-error">*</span></span>
              </label>
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                REQUIRED
              </span>
            </div>
            <div className="relative">
              <input
                type={showMasterKey ? 'text' : 'password'}
                name="master_key"
                value={formData.master_key}
                onChange={handleChange}
                required
                placeholder="Enter Master Credential Key (e.g. asvanna#2026)"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-amber-300 bg-white text-on-surface text-sm font-mono focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowMasterKey(!showMasterKey)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                title={showMasterKey ? 'Hide key' : 'Show key'}
              >
                {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-amber-800/80 leading-relaxed font-medium">
              Required master credential key used in administrator provisioning to authenticate staff account registration.
            </p>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                First Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. Kasun"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Last Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Bandara"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
          </div>

          {/* Phone & NIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0771234567"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                National ID (NIC) / Admin ID
              </label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                placeholder="e.g. 198812345678 or OFF001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. officer@agri.gov.lk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
            />
          </div>

          {/* Region / Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Agrarian Division
              </label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
            </div>
          </div>

          {/* Custom Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Initial Password
              </label>
              <span className="text-[11px] text-on-surface-variant/80">Default: Standard System Password</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to use default system password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-hidden focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-3 bg-surface-container-high/40">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition cursor-pointer ${
              isAdmin
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-primary hover:bg-primary/90 shadow-primary/20'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{isAdmin ? 'Create Administrator' : 'Create Officer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
