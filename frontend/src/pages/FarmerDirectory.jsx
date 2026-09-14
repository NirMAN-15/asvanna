import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import ProxyFarmerRegisterModal from '../components/ProxyFarmerRegisterModal';
import { Search, Phone, MapPin, Users, PlusCircle, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function FarmerDirectory() {
  const { t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('VERIFIED'); // 'VERIFIED' or 'PENDING'
  const [farmers, setFarmers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [search, setSearch] = useState('');
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [reviewModalFarmer, setReviewModalFarmer] = useState(null);
  const [nicCheck, setNicCheck] = useState(true);
  const [gpsCheck, setGpsCheck] = useState(true);
  const [sizeCheck, setSizeCheck] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDirectory();
    fetchPendingVerifications();
  }, [search]);

  const fetchDirectory = async () => {
    try {
      const res = await API.get(`/officer/farmers`);
      if (res.data && res.data.data) {
        setFarmers(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading farmers:', err.message);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const res = await API.get('/officer/verifications/pending');
      if (res.data && res.data.data) {
        setPendingVerifications(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading pending verifications:', err.message);
    }
  };

  const handleReviewAction = async (approved) => {
    if (!reviewModalFarmer) return;
    setProcessing(true);
    try {
      await API.post(`/officer/verifications/${reviewModalFarmer.farmer_id}`, {
        approved,
        nicVerified: nicCheck,
        landGpsVerified: gpsCheck,
        landSizeVerified: sizeCheck,
        rejectionReason: approved ? null : (rejectionReason || 'Verification rejected by officer')
      });
      setToast(approved ? '✅ Farmer account verified & approved!' : '❌ Farmer verification rejected.');
      setTimeout(() => setToast(''), 4000);
      setReviewModalFarmer(null);
      fetchDirectory();
      fetchPendingVerifications();
    } catch (err) {
      setToast('Error reviewing farmer: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const filteredVerified = farmers.filter(f => {
    const query = search.toLowerCase();
    return (
      (f.full_name && f.full_name.toLowerCase().includes(query)) ||
      (f.phone && f.phone.includes(query)) ||
      (f.nic && f.nic.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn font-body-md">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <Users className="w-5 h-5 text-emerald-800" />
            </div>
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
              {t('farmer_directory_title')}
            </h1>
          </div>
          <p className="text-sm font-semibold text-emerald-900 mt-2 max-w-2xl leading-relaxed">
            Manage registered agriculturalists, review pending identity validations, and prevent fraudulent submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-800 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('search_farmers_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:outline-primary bg-surface-container-lowest text-on-surface"
            />
          </div>

          <button
            onClick={() => setIsProxyModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-sm font-bold shadow hover:bg-emerald-900 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Proxy Register</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container font-semibold shadow-sm animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-6">
        <button
          onClick={() => setActiveTab('VERIFIED')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'VERIFIED'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active Farmer Directory ({farmers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'PENDING'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Pending Verifications ({pendingVerifications.length})</span>
          {pendingVerifications.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-900 rounded-full font-extrabold">
              {pendingVerifications.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Active Verified Farmers */}
      {activeTab === 'VERIFIED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVerified.map((farmer) => (
            <div
              key={farmer.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-on-surface">{farmer.full_name}</h3>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-outline" />
                    <span>{farmer.phone}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  farmer.verification_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {farmer.verification_status || 'VERIFIED'}
                </span>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 space-y-1.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-on-surface">NIC:</span>
                  <span>{farmer.nic || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-outline" />
                  <span>{farmer.gnd_division || farmer.division || 'Bandarawela'}</span>
                </div>
                {farmer.total_land_size && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-on-surface">Registered Land:</span>
                    <span>{farmer.total_land_size} Acres</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Pending Verifications Queue */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-base text-on-surface">No Pending Farmer Verifications</h3>
              <p className="text-xs text-on-surface-variant mt-1">All registered farmers in Bandarawela have been reviewed.</p>
            </div>
          ) : (
            pendingVerifications.map((item) => (
              <div
                key={item.farmer_id}
                className="bg-surface-container-lowest border border-amber-200/80 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-extrabold bg-amber-100 text-amber-900 rounded-md">
                      NEEDS VALIDATION
                    </span>
                    <h3 className="font-extrabold text-lg text-on-surface">{item.full_name}</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-on-surface-variant">
                    <div>
                      <span className="block font-semibold text-on-surface">Phone:</span>
                      <span>{item.phone}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-on-surface">NIC Number:</span>
                      <span>{item.nic}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-on-surface">GN Division:</span>
                      <span>{item.gnd_division || 'Bandarawela'}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-on-surface">Claimed Acreage:</span>
                      <span className="font-bold text-primary">{item.total_land_size || 'N/A'} Acres</span>
                    </div>
                  </div>

                  {/* Anomalies alert if any */}
                  {item.hasAnomalies && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Automated Anomaly Warnings:</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-red-700 pl-1">
                        {item.anomalies.map((a, idx) => (
                          <li key={idx}>{a.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => {
                      setReviewModalFarmer(item);
                      setNicCheck(true);
                      setGpsCheck(true);
                      setSizeCheck(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Review Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Validation Modal */}
      {reviewModalFarmer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-black text-lg text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <span>Verify Farmer: {reviewModalFarmer.full_name}</span>
              </h3>
              <button
                onClick={() => setReviewModalFarmer(null)}
                className="text-on-surface-variant hover:text-on-surface text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Cross-reference applicant details against Bandarawela Agrarian Development Division physical records.
            </p>

            <div className="space-y-3 bg-surface-container-low p-4 rounded-2xl text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={nicCheck}
                  onChange={(e) => setNicCheck(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                <span>NIC Authenticity Verified ({reviewModalFarmer.nic})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={gpsCheck}
                  onChange={(e) => setGpsCheck(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                <span>Farmland GPS within Bandarawela boundary (Lat: {reviewModalFarmer.latitude}, Lng: {reviewModalFarmer.longitude})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={sizeCheck}
                  onChange={(e) => setSizeCheck(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                <span>Land Acreage matches division register ({reviewModalFarmer.total_land_size} Acres)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Rejection Note (if rejecting):
              </label>
              <input
                type="text"
                placeholder="Reason for declining application"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs bg-surface-container-lowest text-on-surface"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                disabled={processing}
                onClick={() => handleReviewAction(false)}
                className="flex-1 py-2.5 px-4 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs rounded-xl transition"
              >
                Reject Application
              </button>

              <button
                disabled={processing || !nicCheck || !gpsCheck || !sizeCheck}
                onClick={() => handleReviewAction(true)}
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition shadow disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve & Activate Farmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proxy Farmer Register Modal */}
      {isProxyModalOpen && (
        <ProxyFarmerRegisterModal
          isOpen={isProxyModalOpen}
          onClose={() => setIsProxyModalOpen(false)}
          onFarmerRegistered={() => {
            fetchDirectory();
            fetchPendingVerifications();
          }}
        />
      )}
    </div>
  );
}
