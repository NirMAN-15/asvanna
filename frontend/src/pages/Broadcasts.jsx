import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import BroadcastModal from '../components/BroadcastModal';
import { Radio, PlusCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Broadcasts() {
  const { lang, t } = useContext(LanguageContext);
  const { role } = useContext(AuthContext);
  const [broadcasts, setBroadcasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBroadcasts = async () => {
    try {
      const res = await API.get('/broadcasts?district=Badulla');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setBroadcasts(res.data.data);
      } else {
        setBroadcasts([]);
      }
    } catch (err) {
      console.warn('Utilizing Bandarawela seed broadcasts:', err.message);
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Dark Letters */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('broadcast_history_title')}
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-700 mt-2 max-w-2xl leading-relaxed">
            {t('broadcast_history_desc')}
          </p>
        </div>

        { (role === 'OFFICER' || role === 'ADMIN') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-900/20 transition tracking-wide cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> {t('btn_issue_directive')}
          </button>
        )}
      </div>

      {/* Broadcast Cards with Dark Letters */}
      <div className="space-y-4">
        {broadcasts.map((b) => (
          <div
            key={b.id}
            className="bg-surface-container-lowest border border-outline-variant/30 border-l-4 border-l-red-600 rounded-2xl p-6 shadow-card transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2 tracking-tight">
                  <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{getBroadcastTitle(b)}</span>
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-1.5 flex items-center gap-1.5">
                  <span>{t('by_officer', { name: b.officer_name || 'DO Officer' })}</span>
                  <span>•</span>
                  <span>{new Date(b.created_at).toLocaleString()}</span>
                </p>
              </div>
              <span className="self-start px-3 py-1 bg-red-100 text-red-900 border border-red-200 text-xs font-black rounded-xl uppercase tracking-wider">
                {b.severity === 'CRITICAL' ? t('severity_critical') : t('severity_high')}
              </span>
            </div>

            {/* Alert Message with Dark High-Contrast Letters */}
            <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl">
              <p className="text-sm font-bold text-slate-900 leading-relaxed tracking-wide">
                {getBroadcastMessage(b)}
              </p>
            </div>

            {/* Footer with Dark High-Contrast Letters */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-slate-800">
                {t('label_target')}: <span className="font-bold text-slate-700">{b.target_division || 'Bandarawela Division'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-900 font-black bg-emerald-100/90 px-3 py-1.5 rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {t('delivered_farmers', { count: b.sent_count || 142 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <BroadcastModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onBroadcastSent={fetchBroadcasts} />
    </div>
  );
}
