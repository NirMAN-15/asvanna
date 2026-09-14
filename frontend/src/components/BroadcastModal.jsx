import React, { useState, useContext } from 'react';
import API from '../services/api';
import { X, Send, Radio, AlertCircle, Globe, ShieldAlert, CheckCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

export default function BroadcastModal({ isOpen, onClose, onBroadcastSent }) {
  const { t } = useContext(LanguageContext);
  const [activeLangTab, setActiveLangTab] = useState('si'); // 'si' | 'en' | 'ta'

  const [formData, setFormData] = useState({
    title_en: 'Over-Planting Alert: Leeks',
    title_si: 'අධික වගා අනතුරු ඇඟවීම: ලීක්ස්',
    title_ta: 'அதிக நடவு எச்சரிக்கை: லீக்ஸ்',
    message_en: 'Current regional leeks cultivation has exceeded 85% of market demand. Please consider alternative crops like Beetroot or Knol Khol.',
    message_si: 'බණ්ඩාරවෙල කලාපයේ ලීක්ස් වගාව වෙළඳපල ඉල්ලුමෙන් 85% ඉක්මවා ඇත. කරුණාකර බීට්රූට් හෝ නෝකෝල් වගා කිරීමට සලකා බලන්න.',
    message_ta: 'பண்டாரவளையில் லீக்ஸ் பயிர்ச்செய்கை 85% ஐ தாண்டியுள்ளது. தயவுசெய்து பீட்ரூட் அல்லது நோக்கோல் போன்ற மாற்று பயிர்களை பயிரிடவும்.',
    target_district: 'Badulla',
    target_division: 'Bandarawela',
    severity: 'HIGH'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/broadcasts', formData);
      setSuccess(true);
      setTimeout(() => {
        if (onBroadcastSent) onBroadcastSent();
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch advisory broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary flex items-center gap-2">
              Dispatch Advisory Broadcast
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Multilingual push notification & notice board advisory for Bandarawela growers
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 my-3 border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Broadcast will be published trilingually (Sinhala, Tamil & English) across all registered farmer devices.</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/40 border border-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-primary-container/40 border border-primary-container text-on-primary-container text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Advisory successfully published and broadcasted to Bandarawela farmers!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Trilingual Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-on-surface">
                Advisory Content Localization *
              </label>
              <div className="flex gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('si')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    activeLangTab === 'si'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  සිංහල (SI)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('ta')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    activeLangTab === 'ta'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  தமிழ் (TA)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    activeLangTab === 'en'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* Active Tab Inputs */}
            {activeLangTab === 'si' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-primary font-bold">
                  <span>සිංහල භාෂාව (Sinhala Content)</span>
                  <span className="text-[10px] bg-primary-container text-on-primary px-1.5 py-0.5 rounded">Primary</span>
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">මාතෘකාව (Title SI) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_si}
                    onChange={(e) => setFormData({ ...formData, title_si: e.target.value })}
                    placeholder="අධික වගා අනතුරු ඇඟවීම..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">පණිවිඩය (Message SI) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_si}
                    onChange={(e) => setFormData({ ...formData, message_si: e.target.value })}
                    placeholder="බණ්ඩාරවෙල ගොවීන් වෙත උපදෙස්..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
              </div>
            )}

            {activeLangTab === 'ta' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-primary font-bold">
                  <span>தமிழ் மொழி (Tamil Content)</span>
                  <span className="text-[10px] bg-secondary-container text-on-secondary-fixed px-1.5 py-0.5 rounded">Official</span>
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">தலைப்பு (Title TA) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_ta}
                    onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                    placeholder="அதிக நடவு எச்சரிக்கை..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">செய்தி (Message TA) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_ta}
                    onChange={(e) => setFormData({ ...formData, message_ta: e.target.value })}
                    placeholder="பண்டாரவளை விவசாயிகளுக்கான ஆலோசனை..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
              </div>
            )}

            {activeLangTab === 'en' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-primary font-bold">
                  <span>English Translation</span>
                  <span className="text-[10px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded">Global</span>
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Title (EN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Cultivation advisory title..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Message (EN) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_en}
                    onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                    placeholder="Advisory details and recommended alternatives..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Severity & Target Division */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Advisory Severity Level *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              >
                <option value="LOW">Low (Informational Advisory)</option>
                <option value="MEDIUM">Medium (Precautionary Caution)</option>
                <option value="HIGH">High (Over-Planting Risk)</option>
                <option value="CRITICAL">Critical (Severe Glut Warning)</option>
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant font-semibold mb-1">
                Target Agrarian Division
              </label>
              <input
                type="text"
                value={formData.target_division}
                onChange={(e) => setFormData({ ...formData, target_division: e.target.value })}
                className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:outline-primary bg-surface-container-lowest text-on-surface"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-variant transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Publish Advisory Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
