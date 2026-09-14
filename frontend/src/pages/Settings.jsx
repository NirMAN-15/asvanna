import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

export default function Settings() {
  const { user, role } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);
  const [savedToast, setSavedToast] = useState(false);

  // Common Profile State
  const [fullName, setFullName] = useState(user?.full_name || 'User Name');
  const [phone] = useState(user?.phone || '0771112233');
  const [nic] = useState(user?.nic || '851234567V');

  // FARMER State
  const [gnd, setGnd] = useState(user?.gnd_division || 'Kinigama North');
  const [landSize, setLandSize] = useState(user?.total_land_size || '2.5');
  const [notifyRisk, setNotifyRisk] = useState(true);
  const [notifyPrice, setNotifyPrice] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [pickupRadius, setPickupRadius] = useState(5);
  const [autoAcceptQty, setAutoAcceptQty] = useState(50);

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

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const userRole = (role || user?.role || 'FARMER').toUpperCase();

  const LanguageSelector = () => (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
      <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">translate</span>
        <span>Language Preference</span>
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
            <span className="text-[10px] text-outline font-normal">Default System Language</span>
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
            <span className="text-[10px] text-outline font-normal">දේශීය භාෂාව</span>
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
            <span className="text-[10px] text-outline font-normal">பிராந்திய மொழி</span>
          </div>
          {lang === 'ta' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
        </button>
      </div>
    </div>
  );

  const renderFarmerSettings = () => (
    <>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">badge</span>
          <span>Personal Profile</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">National Identity Card (NIC)</label>
            <input type="text" value={nic} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Mobile Phone</label>
            <input type="text" value={phone} disabled className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container text-outline font-semibold cursor-not-allowed" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">agriculture</span>
          <span>Farm Details</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">GN Division</label>
            <select value={gnd} onChange={(e) => setGnd(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none">
              <option value="Kinigama North">Kinigama North</option>
              <option value="Bandarawela Central">Bandarawela Central</option>
              <option value="Ella">Ella</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Total Cultivated Extent (Acres)</label>
            <input type="number" step="0.1" value={landSize} onChange={(e) => setLandSize(e.target.value)} className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-on-surface focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Farm GPS Coordinates</label>
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
          <span>Notification Preferences</span>
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Over-planting quota warnings</span></div>
            <input type="checkbox" checked={notifyRisk} onChange={(e) => setNotifyRisk(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Keppetipola daily price bulletin</span></div>
            <input type="checkbox" checked={notifyPrice} onChange={(e) => setNotifyPrice(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
            <div><span className="font-bold text-on-surface block">Marketplace order inquiries (30-min SLA)</span></div>
            <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-card space-y-4">
        <h2 className="font-headline font-bold text-base text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">storefront</span>
          <span>Marketplace Preferences</span>
        </h2>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1 flex justify-between">
              <span>Default Pickup Radius (km)</span>
              <span>{pickupRadius} km</span>
            </label>
            <input type="range" min="1" max="20" value={pickupRadius} onChange={(e) => setPickupRadius(e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="block font-bold text-on-surface mb-1">Auto-accept orders under qty (kg)</label>
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
              <span>DoA Verified Account</span>
            </div>
          )}
          {userRole === 'OFFICER' && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
              <span>DoA Authorized Officer</span>
            </div>
          )}
          {userRole === 'ADMIN' && (
            <div className="bg-purple-50 border border-purple-300 text-purple-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className="material-symbols-outlined text-purple-600 text-lg">admin_panel_settings</span>
              <span>SYSTEM ADMIN</span>
            </div>
          )}
        </div>
      </div>

      {savedToast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-slideDown">
          <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
          <span>{t('settings_saved_toast') || 'Profile preferences updated successfully!'}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {userRole === 'FARMER' && renderFarmerSettings()}
        {userRole === 'BUYER' && renderBuyerSettings()}
        {userRole === 'OFFICER' && renderOfficerSettings()}
        {userRole === 'ADMIN' && renderAdminSettings()}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs shadow-md hover:scale-105 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{t('btn_save_settings') || 'Save Profile Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
