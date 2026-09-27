import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function Settings() {
  const { user, role, updateUser } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);
  const [savedToast, setSavedToast] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Confirmation modal state for farmer details update
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingDiffs, setPendingDiffs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Common Profile State
  const [fullName, setFullName] = useState(user?.full_name || 'User Name');
  const [phone] = useState(user?.phone || '0771112233');
  const [nic] = useState(user?.nic || '851234567V');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });

  // FARMER State
  const [gnd, setGnd] = useState(user?.gnd_division || 'Kinigama North');
  const [landSize, setLandSize] = useState(user?.total_land_size || '2.5');
  const [notifyRisk, setNotifyRisk] = useState(true);
  const [notifyPrice, setNotifyPrice] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [pickupRadius, setPickupRadius] = useState(5);
  const [autoAcceptQty, setAutoAcceptQty] = useState(50);

  // Keep state synced with current user profile
  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.gnd_division) setGnd(user.gnd_division);
      if (user.total_land_size !== undefined && user.total_land_size !== null) {
        setLandSize(user.total_land_size);
      }
    }
  }, [user]);

  // BUYER State
  const [businessName, setBusinessName] = useState(user?.business_name || 'Fresh Mart');
  const [businessType, setBusinessType] = useState(user?.business_type || 'Retailer');
  const [searchRadius, setSearchRadius] = useState(10);
  const [autoBidBudget, setAutoBidBudget] = useState(5000);
  const [notifySurplus, setNotifySurplus] = useState(true);
  const [notifyPriceDrop, setNotifyPriceDrop] = useState(false);
  const [notifyOrderFulfill, setNotifyOrderFulfill] = useState(true);

  // OFFICER State
  const [exportFormat, setExportFormat] = useState('PDF');
  const [autoBroadcast, setAutoBroadcast] = useState('Weekly');
  const [notifyNewFarmer, setNotifyNewFarmer] = useState(true);
  const [notifyThreshold, setNotifyThreshold] = useState(true);
  const [notifyAbuse, setNotifyAbuse] = useState(false);

  // ADMIN State
  const [notifySystemHealth, setNotifySystemHealth] = useState(true);
  const [notifyNewOfficer, setNotifyNewOfficer] = useState(true);
  const [notifyCriticalRisk, setNotifyCriticalRisk] = useState(true);

  const userRole = (role || user?.role || 'FARMER').toUpperCase();

  // 14-day Cooldown calculation for FARMER
  const lastProfileUpdateAt = user?.last_profile_update_at ? new Date(user.last_profile_update_at).getTime() : null;
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
  const timeSinceLastUpdate = lastProfileUpdateAt ? Date.now() - lastProfileUpdateAt : null;
  const isCooldownActive = userRole === 'FARMER' && timeSinceLastUpdate !== null && timeSinceLastUpdate < twoWeeksMs;
  const daysUntilNextUpdate = isCooldownActive ? Math.ceil((twoWeeksMs - timeSinceLastUpdate) / (24 * 60 * 60 * 1000)) : 0;
  const nextAvailableDateStr = isCooldownActive ? new Date(lastProfileUpdateAt + twoWeeksMs).toLocaleDateString() : null;

  // Pending officer approval status flag
  const hasPendingApproval = userRole === 'FARMER' && (user?.profile_update_status === 'PENDING' || user?.has_pending_profile_updates);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccessMsg('');

    if (userRole === 'FARMER') {
      if (isCooldownActive) {
        setSaveError(`Profile details are locked under the 14-day policy. Next update will be permitted in ${daysUntilNextUpdate} day(s) on ${nextAvailableDateStr}.`);
        return;
      }

      // Check diffs between current form values and registered user values
      const diffs = [];
      const origName = (user?.full_name || '').trim();
      const origGnd = (user?.gnd_division || '').trim();
      const origLand = user?.total_land_size !== null && user?.total_land_size !== undefined ? parseFloat(user.total_land_size) : 0;
      const newLand = parseFloat(landSize) || 0;

      if (fullName.trim() !== origName) {
        diffs.push({
          field: 'full_name',
          label: 'Farmer Full Name',
          oldValue: origName || 'Not Set',
          newValue: fullName.trim()
        });
      }

      if (gnd.trim() !== origGnd) {
        diffs.push({
          field: 'gnd_division',
          label: 'GN Division',
          oldValue: origGnd || 'Not Set',
          newValue: gnd.trim()
        });
      }

      if (Math.abs(newLand - origLand) > 0.001) {
        diffs.push({
          field: 'total_land_size',
          label: 'Total Cultivated Extent (Acres)',
          oldValue: `${origLand} Acres`,
          newValue: `${newLand} Acres`
        });
      }

      if (diffs.length === 0) {
        setSaveError('No changes detected in your registered agrarian profile details.');
        return;
      }

      setPendingDiffs(diffs);
      setIsConfirmModalOpen(true);
      return;
    }

    // Direct save for other roles
    executeDirectSave();
  };

  const executeDirectSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = {
        full_name: fullName.trim(),
        business_name: businessName,
        business_type: businessType,
        gnd_division: gnd
      };
      const res = await API.put('/auth/profile', payload);
      if (updateUser && res.data?.data) {
        updateUser(res.data.data);
      }
      setSaveSuccessMsg(t('settings_saved_toast') || 'Profile preferences updated successfully!');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmFarmerUpdates = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const payload = {
        full_name: fullName.trim(),
        gnd_division: gnd.trim(),
        total_land_size: parseFloat(landSize)
      };

      const res = await API.put('/auth/profile', payload);
      const updatedUser = res.data.data;
      if (updateUser) {
        updateUser(updatedUser);
      }
      setIsConfirmModalOpen(false);
      setSaveSuccessMsg(
        'Profile changes applied to your personal self-page! These details are now pending review and official validation by your Divisional Agricultural Instructor.'
      );
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 7000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to submit profile changes. Please try again.');
      setIsConfirmModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match!', type: 'error' });
      return;
    }
    setPwdLoading(true);
    try {
      const res = await API.put('/auth/password', {
        currentPassword,
        newPassword
      });
      setPwdMsg({ text: res.data?.message || 'Password updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  const LanguageSelector = () => (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
      <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">translate</span>
        <span>{t('language_preference', 'Language Preference')}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`p-3.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
            lang === 'en' ? 'border-primary bg-primary/5 text-primary shadow-xs' : 'border-outline-variant text-on-surface hover:bg-surface-container'
          }`}
        >
          <div>
            <span className="block text-sm">English</span>
            <span className="text-[10px] text-outline font-normal">{t('default_system_lang', 'Default System Language')}</span>
          </div>
          {lang === 'en' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('si')}
          className={`p-3.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
            lang === 'si' ? 'border-primary bg-primary/5 text-primary shadow-xs' : 'border-outline-variant text-on-surface hover:bg-surface-container'
          }`}
        >
          <div>
            <span className="block text-sm font-semibold">සිංහල</span>
            <span className="text-[10px] text-outline font-normal">{t('local_language', 'දේශීය භාෂාව')}</span>
          </div>
          {lang === 'si' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`p-3.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${
            lang === 'ta' ? 'border-primary bg-primary/5 text-primary shadow-xs' : 'border-outline-variant text-on-surface hover:bg-surface-container'
          }`}
        >
          <div>
            <span className="block text-sm font-semibold">தமிழ்</span>
            <span className="text-[10px] text-outline font-normal">{t('regional_language', 'பிராந்திய மொழி')}</span>
          </div>
          {lang === 'ta' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
        </button>
      </div>
    </div>
  );

  const renderFarmerSettings = () => (
    <>
      {/* Pending Officer Approval Banner */}
      {hasPendingApproval && (
        <div className="bg-blue-50 border-2 border-blue-400/80 rounded-2xl p-4 text-blue-950 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
            <span className="material-symbols-outlined text-xl">schedule</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/70 px-2.5 py-0.5 rounded-md">
                {t('pending_approval_badge', 'Active on Self-Page • Pending Divisional Officer Approval')}
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-900 leading-relaxed">
              {t('pending_approval_desc', 'Your recent profile updates are currently active on your personal account view and dashboard. Public directories, buyer matchings, and official quota allocations will update officially once verified and approved by the Divisional Agricultural Instructor.')}
            </p>
          </div>
        </div>
      )}

      {/* 14-Day Cooldown Policy Lock Banner */}
      {isCooldownActive && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 text-amber-950 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
            <span className="material-symbols-outlined text-xl">lock_clock</span>
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md">
                {t('cooldown_active_badge', '14-Day Cooldown Policy Active')}
              </span>
              <span className="text-xs font-bold text-amber-800">
                {t('next_mod_available', { date: nextAvailableDateStr, days: daysUntilNextUpdate }, `Next Modification Available: ${nextAvailableDateStr} (${daysUntilNextUpdate} days remaining)`)}
              </span>
            </div>
            <p className="text-xs font-medium text-amber-900 leading-relaxed">
              {t('cooldown_policy_desc', 'Under Department of Agrarian Development regulations, farmers may update registered profile details only once every 14 days (2 weeks) to prevent quota distortion. Field editing is currently locked until your cooldown expires.')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">badge</span>
            <span>{t('personal_profile', 'Personal Profile')}</span>
          </h2>
          {isCooldownActive && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span>
              <span>{t('editing_locked_14_days', 'Editing Locked for 14 Days')}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('full_name', 'Full Name')}</label>
            <input
              type="text"
              disabled={isCooldownActive}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold outline-none transition ${
                isCooldownActive
                  ? 'border-outline-variant/40 bg-surface-container text-slate-500 cursor-not-allowed'
                  : 'border-outline-variant bg-white text-on-surface focus:border-primary'
              }`}
            />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('nic_number', 'National Identity Card (NIC)')}</label>
            <input type="text" value={nic} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('mobile_phone', 'Mobile Phone')}</label>
            <input type="text" value={phone} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">agriculture</span>
          <span>{t('farm_details', 'Farm Details')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('gnd_division', 'GN Division')}</label>
            <select
              disabled={isCooldownActive}
              value={gnd}
              onChange={(e) => setGnd(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-semibold outline-none transition ${
                isCooldownActive
                  ? 'border-outline-variant/40 bg-surface-container text-slate-500 cursor-not-allowed'
                  : 'border-outline-variant bg-white text-on-surface focus:border-primary'
              }`}
            >
              <option value="Kinigama North">Kinigama North</option>
              <option value="Bandarawela Central">Bandarawela Central</option>
              <option value="Bindunuwewa">Bindunuwewa</option>
              <option value="Dowa">Dowa</option>
              <option value="Ella">Ella</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('cultivable_land_extent', 'Total Cultivated Extent (Acres)')}</label>
            <input
              type="number"
              step="0.1"
              disabled={isCooldownActive}
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className={`w-full p-2.5 rounded-xl border font-bold outline-none transition ${
                isCooldownActive
                  ? 'border-outline-variant/40 bg-surface-container text-slate-500 cursor-not-allowed'
                  : 'border-outline-variant bg-white text-on-surface focus:border-primary'
              }`}
            />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('farm_gps_coordinates', 'Farm GPS Coordinates')}</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              6.8322° N, 80.9984° E
            </div>
          </div>
        </div>
      </div>
      <LanguageSelector />
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">notifications_active</span>
          <span>{t('notification_preferences', 'Notification Preferences')}</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">{t('notify_overplanting_risk', 'Over-planting quota warnings')}</span></div>
            <input type="checkbox" checked={notifyRisk} onChange={(e) => setNotifyRisk(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">{t('notify_price_updates', 'Keppetipola daily price bulletin')}</span></div>
            <input type="checkbox" checked={notifyPrice} onChange={(e) => setNotifyPrice(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">{t('notify_buyer_orders', 'Marketplace order inquiries (30-min SLA)')}</span></div>
            <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">storefront</span>
          <span>{t('marketplace_preferences', 'Marketplace Preferences')}</span>
        </h2>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1 flex justify-between">
              <span>{t('pickup_radius_km', 'Default Pickup Radius (km)')}</span>
              <span>{pickupRadius} km</span>
            </label>
            <input type="range" min="1" max="20" value={pickupRadius} onChange={(e) => setPickupRadius(e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('auto_accept_qty', 'Auto-accept orders under qty (kg)')}</label>
            <input type="number" value={autoAcceptQty} onChange={(e) => setAutoAcceptQty(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-on-surface focus:border-primary outline-none" />
          </div>
        </div>
      </div>
    </>
  );

  const renderBuyerSettings = () => (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">business</span>
          <span>Business Profile</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Business Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Contact Person Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Mobile Phone</label>
            <input type="text" value={phone} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">NIC</label>
            <input type="text" value={nic} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none">
              <option value="Retailer">Retailer</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Hotel/Restaurant">Hotel/Restaurant</option>
              <option value="Exporter">Exporter</option>
              <option value="Processor">Processor</option>
            </select>
          </div>
        </div>
      </div>
      <LanguageSelector />
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">shopping_cart</span>
          <span>Procurement Preferences</span>
        </h2>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1 flex justify-between">
              <span>Default Search Radius (km)</span>
              <span>{searchRadius} km</span>
            </label>
            <input type="range" min="1" max="20" value={searchRadius} onChange={(e) => setSearchRadius(e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Preferred Crop Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {['Carrot', 'Leeks', 'Cabbage', 'Beetroot', 'Potato'].map(crop => (
                <label key={crop} className="flex items-center gap-2 bg-surface-container p-2 rounded-lg cursor-pointer">
                  <input type="checkbox" className="accent-primary" defaultChecked />
                  <span>{crop}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Auto-bid budget per order (Rs.)</label>
            <input type="number" value={autoBidBudget} onChange={(e) => setAutoBidBudget(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-on-surface focus:border-primary outline-none" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">notifications_active</span>
          <span>Notification Preferences</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">New surplus listing alerts</span></div>
            <input type="checkbox" checked={notifySurplus} onChange={(e) => setNotifySurplus(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Price drop alerts</span></div>
            <input type="checkbox" checked={notifyPriceDrop} onChange={(e) => setNotifyPriceDrop(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Order fulfillment updates</span></div>
            <input type="checkbox" checked={notifyOrderFulfill} onChange={(e) => setNotifyOrderFulfill(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>
      </div>
    </>
  );

  const renderOfficerSettings = () => (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">local_police</span>
          <span>Official Profile</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Officer ID / Phone</label>
            <input type="text" value={phone} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">NIC</label>
            <input type="text" value={nic} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Division Assignment</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              Bandarawela Central
            </div>
          </div>
        </div>
      </div>
      <LanguageSelector />
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">map</span>
          <span>Regional Configuration</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Assigned Division</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              Bandarawela Central
            </div>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Monitored GN Divisions</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              Kinigama North, Kinigama South, Ella
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">notifications_active</span>
          <span>Notification Preferences</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">New farmer registration alerts</span></div>
            <input type="checkbox" checked={notifyNewFarmer} onChange={(e) => setNotifyNewFarmer(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Over-planting threshold breach alerts</span></div>
            <input type="checkbox" checked={notifyThreshold} onChange={(e) => setNotifyThreshold(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Marketplace abuse flagging</span></div>
            <input type="checkbox" checked={notifyAbuse} onChange={(e) => setNotifyAbuse(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">database</span>
          <span>Data Management</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Export Report Format</label>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none">
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Auto-broadcast Schedule</label>
            <select value={autoBroadcast} onChange={(e) => setAutoBroadcast(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminSettings = () => (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">shield_person</span>
          <span>Admin Profile</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Phone</label>
            <input type="text" value={phone} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
        </div>
      </div>
      <LanguageSelector />
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">settings_applications</span>
          <span>System Configuration</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Risk Engine Safe Threshold</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              &lt; 60% Quota
            </div>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Risk Engine Warning Threshold</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              &gt; 80% Quota
            </div>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Geofence Default/Max Radius</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              10 km / 50 km
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">notifications_active</span>
          <span>Notification Preferences</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">System health alerts</span></div>
            <input type="checkbox" checked={notifySystemHealth} onChange={(e) => setNotifySystemHealth(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">New officer registrations</span></div>
            <input type="checkbox" checked={notifyNewOfficer} onChange={(e) => setNotifyNewOfficer(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Critical risk threshold breaches</span></div>
            <input type="checkbox" checked={notifyCriticalRisk} onChange={(e) => setNotifyCriticalRisk(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">security</span>
          <span>Audit & Security</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Last Login Timestamp</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              {new Date().toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Active Sessions</label>
            <div className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold">
              1 (Current)
            </div>
          </div>
        </div>
        <div className="pt-2">
          <button type="button" className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">key</span>
            Change Password
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-primary font-headline">
              {t('settings_title') || 'Account Profile & Preferences'}
            </h1>
            <span className="bg-secondary/15 text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
              {userRole}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('settings_desc') || 'Manage your registered agrarian profile, validation status, and system preferences.'}
          </p>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-2">
          {userRole === 'FARMER' && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
              <span>{t('doa_verified_account', 'DoA Verified Account')}</span>
            </div>
          )}
          {userRole === 'OFFICER' && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
              <span>{t('doa_authorized_officer', 'DoA Authorized Officer')}</span>
            </div>
          )}
          {userRole === 'ADMIN' && (
            <div className="bg-purple-50 border border-purple-300 text-purple-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-purple-600 text-lg">admin_panel_settings</span>
              <span>{t('system_admin', 'SYSTEM ADMIN')}</span>
            </div>
          )}
        </div>
      </div>

      {savedToast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-slideDown">
          <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
          <span>{saveSuccessMsg || t('settings_saved_toast') || 'Profile preferences updated successfully!'}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-red-50 text-red-900 border-2 border-red-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-slideDown">
          <span className="material-symbols-outlined text-red-600 text-lg">error</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {userRole === 'FARMER' && renderFarmerSettings()}
        {userRole === 'BUYER' && renderBuyerSettings()}
        {userRole === 'OFFICER' && renderOfficerSettings()}
        {userRole === 'ADMIN' && renderAdminSettings()}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {userRole === 'FARMER' && isCooldownActive ? (
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="material-symbols-outlined text-base text-amber-600">lock</span>
              <span>{t('profile_locked_cooldown_banner', 'Profile details locked under 14-day policy until')} {nextAvailableDateStr}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex justify-end gap-3">
            {userRole === 'FARMER' && isCooldownActive ? (
              <button
                type="button"
                disabled
                className="px-6 py-3 bg-slate-200 text-slate-500 font-bold rounded-xl text-xs flex items-center gap-2 cursor-not-allowed border border-slate-300"
              >
                <span className="material-symbols-outlined text-base">lock</span>
                <span>{t('locked_days_remaining', 'Locked ({days}d remaining)', { days: daysUntilNextUpdate }).replace('{days}', daysUntilNextUpdate)}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{isSaving ? t('processing', 'Processing...') : (t('btn_save_settings') || t('save_profile_changes') || 'Save Profile Settings')}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* ⚠️ FARMER PROFILE MODIFICATION CONFIRMATION MODAL WITH DIFF TABLE         */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8 animate-scaleUp space-y-5">
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl text-amber-700">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-black text-slate-900">
                  {t('confirm_profile_changes_title', 'Confirm Profile Changes & 14-Day Lockout')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('agrarian_services_centre_sub', 'Department of Agrarian Development • Bandarawela Agrarian Services Centre')}
                </p>
              </div>
            </div>

            {/* Rules Notice Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-amber-950 font-medium leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <span className="material-symbols-outlined text-sm text-amber-700">policy</span>
                <span>{t('agrarian_regulations_title', 'Important Agrarian Registration Regulations:')}</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>{t('reg_rule_cooldown', '2-Week Cooldown: Farmers can only modify registered details once every 14 days. Once saved, you cannot edit again for 2 weeks.')}</li>
                <li>{t('reg_rule_self_page', 'Self-Page Application: These updates will immediately apply to your personal account & self-page.')}</li>
                <li>{t('reg_rule_officer_approval', 'Officer Approval: Official public registry records will update only after the Divisional Officer approves the change request.')}</li>
              </ul>
            </div>

            {/* Structured Diff Comparison Table */}
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">rule</span>
                <span>{t('summary_proposed_changes', 'Summary of Proposed Changes:')}</span>
              </p>

              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-slate-700 font-bold border-b border-outline-variant/30">
                      <th className="p-3">{t('field_col', 'Field')}</th>
                      <th className="p-3 text-slate-500">{t('current_registered_value', 'Current Registered Value')}</th>
                      <th className="p-3 text-emerald-800">{t('proposed_new_value', 'Proposed New Value')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {pendingDiffs.map((diff, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/40 transition">
                        <td className="p-3 font-bold text-slate-900">{diff.label}</td>
                        <td className="p-3 text-slate-600 line-through decoration-red-400">
                          {diff.oldValue}
                        </td>
                        <td className="p-3 font-black text-emerald-700 bg-emerald-50/50">
                          {diff.newValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirmation Question */}
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="material-symbols-outlined text-primary text-base">help</span>
              <span>{t('are_you_sure_submit_changes', 'Are you sure you want to submit these profile changes?')}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-outline-variant text-slate-700 font-bold text-xs hover:bg-surface-container transition cursor-pointer"
              >
                {t('cancel_edit', 'Cancel & Edit')}
              </button>
              <button
                type="button"
                onClick={handleConfirmFarmerUpdates}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span>{t('submitting', 'Submitting...')}</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>{t('confirm_submit_officer_approval', 'Confirm & Submit for Officer Approval')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Form */}
      <form onSubmit={handleChangePassword} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4 mb-8">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-error">lock</span>
          <span>{t('security_password', 'Security & Password')}</span>
        </h2>
        
        {pwdMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${pwdMsg.type === 'error' ? 'bg-error-container text-on-error-container border border-error/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'}`}>
            <span className="material-symbols-outlined text-base">
              {pwdMsg.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('current_password', 'Current Password')}</label>
            <input 
              type="password" 
              required
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" 
            />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('new_password', 'New Password')}</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" 
            />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">{t('confirm_new_password', 'Confirm New Password')}</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={pwdLoading}
            className="px-6 py-3 bg-error hover:bg-error-container text-white disabled:opacity-50 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">key</span>
            <span>{pwdLoading ? t('processing', 'Updating...') : t('change_password_btn', 'Change Password')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
