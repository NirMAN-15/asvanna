import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import BroadcastModal from '../components/BroadcastModal';
import Pagination from '../components/Pagination';
import {
  Radio, PlusCircle, CheckCircle2, ShieldAlert, AlertTriangle,
  TrendingUp, Calendar, MapPin, UserCheck, FileText, Check,
  Printer, X, Sparkles, Filter, Edit, Trash2
} from 'lucide-react';

export default function Broadcasts() {
  const { lang, t } = useContext(LanguageContext);
  const { role } = useContext(AuthContext);

  const isOfficerOrAdmin = role === 'OFFICER' || role === 'ADMIN';

  const [broadcasts, setBroadcasts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'new_broadcast');

  // Edit Directive State
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title_en: '',
    title_si: '',
    title_ta: '',
    message_en: '',
    message_si: '',
    message_ta: '',
    severity: 'MEDIUM'
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete Directive State
  const [deletingId, setDeletingId] = useState(null);

  const fetchBroadcasts = async () => {
    try {
      const res = await API.get('/broadcasts?district=Badulla');
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item, idx) => {
          const sev = (item.severity || 'MEDIUM').toUpperCase();
          const defaultCategory = (sev === 'CRITICAL' || sev === 'HIGH')
            ? 'CULTIVATION_GLUT'
            : sev === 'LOW'
            ? 'MARKET_PRICE'
            : 'AGRO_WEATHER';

          return {
            id: item.id || (idx + 1),
            ref_code: item.ref_code || `BW-DIR-${100 + (item.id || idx)}`,
            title_en: item.title_en || 'Official Agricultural Directive',
            title_si: item.title_si || item.title_en || 'නිල කෘෂිකාර්මික නියෝගය',
            title_ta: item.title_ta || item.title_en || 'அதிகாரபூர்வ விவசாய உத்தரவு',
            message_en: item.message_en || '',
            message_si: item.message_si || item.message_en || '',
            message_ta: item.message_ta || item.message_en || '',
            category: item.category || defaultCategory,
            severity: sev,
            prescribed_actions: item.prescribed_actions || [
              'Review current planting allocations at Bandarawela Agrarian Centre.',
              'Adhere to the advised diversification quota.'
            ],
            affected_crops: item.affected_crops || (item.target_crop_id === 3 ? 'Leeks' : item.target_crop_id === 4 ? 'Cabbage' : item.target_crop_id === 1 ? 'Green Beans' : 'Bandarawela Produce'),
            officer_name: item.officer_name || 'W. M. Bandara (DO Officer)',
            officer_designation: item.officer_designation || 'Agricultural Instructor (AI) • Bandarawela',
            sent_count: item.sent_count || 50,
            created_at: item.created_at || new Date().toISOString(),
            target_division: item.target_division || 'Bandarawela',
            target_district: item.target_district || 'Badulla'
          };
        });
        setBroadcasts(mapped);
      } else {
        setBroadcasts([]);
      }
    } catch (err) {
      console.warn('Failed to load broadcasts from API:', err.message);
      setBroadcasts([]);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const getBroadcastTitle = (b) => {
    if (lang === 'si') return b.title_si || b.title_en;
    if (lang === 'ta') return b.title_ta || b.title_en;
    return b.title_en;
  };

  const getBroadcastMessage = (b) => {
    if (lang === 'si') return b.message_si || b.message_en;
    if (lang === 'ta') return b.message_ta || b.message_en;
    return b.message_en || b.message_si;
  };

  const filteredBroadcasts = activeCategory === 'ALL'
    ? broadcasts
    : broadcasts.filter(b => b.category === activeCategory);

  const toggleAcknowledge = (id) => {
    setAcknowledgedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenEdit = (b) => {
    setEditingBroadcast(b);
    setEditFormData({
      title_en: b.title_en || '',
      title_si: b.title_si || '',
      title_ta: b.title_ta || '',
      message_en: b.message_en || '',
      message_si: b.message_si || '',
      message_ta: b.message_ta || '',
      severity: b.severity || 'MEDIUM'
    });
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingBroadcast) return;
    setEditSaving(true);
    try {
      await API.put(`/broadcasts/${editingBroadcast.id}`, editFormData);
      setEditingBroadcast(null);
      fetchBroadcasts();
    } catch (err) {
      console.error('Failed to update directive:', err);
      alert('Failed to update directive: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteDirective = async (id) => {
    try {
      await API.delete(`/broadcasts/${id}`);
      setDeletingId(null);
      fetchBroadcasts();
    } catch (err) {
      console.error('Failed to delete directive:', err);
      alert('Failed to delete directive: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>{t('bandarawela_agrarian_division', 'Bandarawela Agrarian Services Division')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{role === 'FARMER' ? t('officer_directives_title', 'Officer Directives & Alerts') : t('divisional_broadcasts_title', 'Divisional Advisory Broadcasts')}</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {role === 'FARMER'
                ? t('farmer_directives_desc', 'Official advisories, crop quota directives, and weather warnings issued by Agrarian Development Officers for your regional cluster.')
                : t('broadcast_page_desc', 'Official regulatory notifications, regional crop quota warnings, and agro-weather advisories published directly by the Department of Agrarian Development for upcountry growers.')
              }
            </p>
          </div>

          {isOfficerOrAdmin && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-container text-white rounded-2xl text-xs font-black shadow-md shadow-primary/20 transition tracking-wide cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('issue_official_directive', '+ Issue Official Directive')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-outline-variant/20">
          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('active_bulletins', 'Active Bulletins')}</p>
              <p className="text-base font-black text-slate-900">{broadcasts.length} {t('directives', 'Directives')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('critical_gluts', 'Critical Directives')}</p>
              <p className="text-base font-black text-red-700">{broadcasts.filter(b => b.severity === 'CRITICAL' || b.severity === 'HIGH').length} {t('high_priority', 'High Priority')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('connected_farmers', 'Connected Farmers')}</p>
              <p className="text-base font-black text-slate-900">50 {t('verified', 'Verified')}</p>
            </div>
          </div>

          <div className="bg-surface-container-low/70 rounded-2xl p-3 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('pilot_basin', 'Pilot Basin')}</p>
              <p className="text-base font-black text-slate-900">Bandarawela ASC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'ALL'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t('all_bulletins', 'All Bulletins')} ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('CULTIVATION_GLUT')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'CULTIVATION_GLUT'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>{t('cultivation_warnings', 'Cultivation Warnings')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('AGRO_WEATHER')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'AGRO_WEATHER'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('agro_weather_tab', 'Agro-Weather')}</span>
        </button>

        <button
          onClick={() => setActiveCategory('MARKET_PRICE')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'MARKET_PRICE'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-surface-container-lowest text-slate-600 hover:bg-surface-container border border-outline-variant/30'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('market_deficits_tab', 'Market Deficits & Prices')}</span>
        </button>
      </div>

      {/* Broadcast Feed List */}
      <div className="space-y-4">
        {filteredBroadcasts.length === 0 ? (
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-3xl p-12 text-center space-y-3">
            <Radio className="w-10 h-10 text-outline mx-auto" />
            <h3 className="font-headline font-bold text-slate-800 text-base">
              {lang === 'si' ? 'සක්‍රීය නිවේදන නොමැත' : 'No active bulletins found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {lang === 'si'
                ? 'තෝරාගත් කාණ්ඩය යටතේ නිවේදන කිසිවක් හමු නොවීය.'
                : 'There are currently no official directives posted for this filter category.'}
            </p>
          </div>
        ) : (
          <>
            {filteredBroadcasts.slice((page - 1) * 4, page * 4).map((b) => {
              const isAcked = !!acknowledgedAlerts[b.id];
              const cardBorder = b.severity === 'CRITICAL' || b.severity === 'HIGH'
                ? 'border-red-400 bg-red-50/20'
                : b.severity === 'MEDIUM'
                ? 'border-amber-400 bg-amber-50/20'
                : 'border-emerald-400 bg-emerald-50/20';

              const badgeColor = b.severity === 'CRITICAL' || b.severity === 'HIGH'
                ? 'bg-red-100 text-red-900 border-red-300'
                : b.severity === 'MEDIUM'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300';

              const messageBoxBg = b.severity === 'CRITICAL' || b.severity === 'HIGH'
                ? 'bg-red-50/60 border border-red-200 text-red-950'
                : b.severity === 'MEDIUM'
                ? 'bg-amber-50/60 border border-amber-200 text-amber-950'
                : 'bg-emerald-50/60 border border-emerald-200 text-emerald-950';

              return (
                <div
                  key={`bcast_${b.id}`}
                  className={`bg-surface-container-lowest border-2 ${cardBorder} rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-md transition space-y-4`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-black uppercase rounded-full border ${badgeColor}`}>
                          {b.severity}
                        </span>

                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-surface-container-high px-2 py-0.5 rounded">
                          {b.ref_code}
                        </span>

                        {b.affected_crops && (
                          <span className="text-[11px] font-bold text-slate-800 bg-surface-container-low px-2.5 py-0.5 rounded-lg border border-outline-variant/30 flex items-center gap-1">
                            <span>🌱</span>
                            <span>{b.affected_crops}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline font-black text-slate-900 text-lg sm:text-xl tracking-tight pt-0.5">
                        {getBroadcastTitle(b)}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          <span>{b.officer_name || 'Divisional Officer'} ({b.officer_designation || 'Agricultural Instructor'})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(b.created_at).toLocaleDateString()} at {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions: View Form, Edit, Delete */}
                    <div className="flex flex-wrap items-center gap-2 self-start flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedNoticeForModal(b)}
                        className="px-3.5 py-2 rounded-xl bg-surface-container text-slate-800 hover:bg-surface-container-high border border-outline-variant/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>{t('view_official_form', 'View Official Form')}</span>
                      </button>

                      {isOfficerOrAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Edit Directive"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-700" />
                            <span>{t('edit', 'Edit')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(b.id)}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Delete Directive"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-700" />
                            <span>{t('delete', 'Delete')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Directive Message Box */}
                  <div className={`p-4 rounded-2xl space-y-3 ${messageBoxBg}`}>
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {getBroadcastMessage(b)}
                    </p>

                    {b.prescribed_actions && b.prescribed_actions.length > 0 && (
                      <div className="pt-2 border-t border-black/10 space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t('prescribed_actions_farmers', 'Prescribed Action Directives for Farmers:')}</span>
                        </p>
                        <div className="space-y-1">
                          {b.prescribed_actions.map((act, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('target_area', 'Target Area:')} <strong className="text-slate-800">{b.target_division || 'Bandarawela Division'}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-emerald-900 font-bold bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t('dispatched_to_growers', 'Dispatched to {count} Registered Growers', { count: b.sent_count || 50 }).replace('{count}', b.sent_count || 50)}</span>
                      </span>

                      {role === 'FARMER' && (
                        <button
                          type="button"
                          onClick={() => toggleAcknowledge(b.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                            isAcked
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-surface-container text-slate-700 hover:bg-surface-container-high border border-outline-variant/30'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAcked ? t('acknowledged', 'Acknowledged') : t('acknowledge_notice', 'Acknowledge Notice')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <Pagination
              currentPage={page}
              totalItems={filteredBroadcasts.length}
              itemsPerPage={4}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Official Directive Form Modal */}
      {selectedNoticeForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 border border-outline-variant/30 my-8 animate-scaleUp space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-slate-900">
                    Official Agrarian Directive Notice
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Department of Agrarian Development • Bandarawela Agrarian Services Centre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNoticeForModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-300 rounded-2xl p-5 bg-white space-y-4 text-xs font-medium text-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 text-[11px] text-slate-600 font-mono">
                <div>
                  <span className="font-bold text-slate-800">FORM REF:</span> {selectedNoticeForModal.ref_code}
                </div>
                <div>
                  <span className="font-bold text-slate-800">DATE:</span> {new Date(selectedNoticeForModal.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-black rounded uppercase bg-red-100 text-red-900 border border-red-200">
                    {selectedNoticeForModal.severity}
                  </span>
                  <span className="text-[11px] font-bold text-primary">
                    Agrarian Division: {selectedNoticeForModal.target_division}
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-900 font-headline leading-snug">
                  {selectedNoticeForModal.title_en}
                </h2>
                <p className="text-xs font-bold text-slate-600">
                  {selectedNoticeForModal.title_si}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  1. Official Directive Statement
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedNoticeForModal.message_en}
                </p>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                  <span className="font-bold block text-emerald-950 mb-0.5">සිංහල උපදේශය (Sinhala):</span>
                  {selectedNoticeForModal.message_si}
                </div>
              </div>

              {selectedNoticeForModal.prescribed_actions && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    2. Mandatory Guidelines
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedNoticeForModal.prescribed_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-600">
                <div>
                  <p className="font-bold text-slate-800">Authorized by:</p>
                  <p>{selectedNoticeForModal.officer_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedNoticeForModal.officer_designation}</p>
                </div>
                <div className="flex items-center gap-2 border border-slate-300 p-2 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/50 flex items-center justify-center font-bold text-primary text-[10px]">
                    ASC
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase">Verified Directive</p>
                    <p className="text-[9px] text-slate-500">Bandarawela Division</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Official regulatory bulletin issued for farmers.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant font-bold text-xs text-slate-700 hover:bg-surface-container transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoticeForModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Directive Modal for Officers/Admins */}
      {editingBroadcast && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-7 border border-outline-variant/30 my-8 animate-scaleUp space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <h3 className="font-headline font-black text-lg text-slate-900">
                  Edit Advisory Directive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBroadcast(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title_en}
                  onChange={(e) => setEditFormData({ ...editFormData, title_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Title (සිංහල)
                </label>
                <input
                  type="text"
                  value={editFormData.title_si}
                  onChange={(e) => setEditFormData({ ...editFormData, title_si: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Directive Statement (English) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.message_en}
                  onChange={(e) => setEditFormData({ ...editFormData, message_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Directive Statement (සිංහල)
                </label>
                <textarea
                  rows={3}
                  value={editFormData.message_si}
                  onChange={(e) => setEditFormData({ ...editFormData, message_si: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alert Severity
                </label>
                <select
                  value={editFormData.severity}
                  onChange={(e) => setEditFormData({ ...editFormData, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 font-bold bg-white cursor-pointer"
                >
                  <option value="LOW">LOW — Market Notice</option>
                  <option value="MEDIUM">MEDIUM — Agro Weather Alert</option>
                  <option value="HIGH">HIGH — Overplanting Precaution</option>
                  <option value="CRITICAL">CRITICAL — Immediate Cultivation Halt</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBroadcast(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {editSaving ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-outline-variant/30 animate-scaleUp space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto font-bold">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-headline font-black text-lg text-slate-900">
                Delete Advisory Directive?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to permanently remove this directive bulletin? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDirective(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal for Officers to issue new directives */}
      <BroadcastModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBroadcastSent={fetchBroadcasts}
      />
    </div>
  );
}
