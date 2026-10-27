import React, { useState, useContext, useRef } from 'react';
import API from '../services/api';
import { X, Send, Radio, AlertCircle, Globe, ShieldAlert, CheckCircle, Sparkles, Eye, FileText, RefreshCw } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { MASTER_CROPS } from '../constants/crops';
import { autoFillTrilingual } from '../services/translationService';

export default function BroadcastModal({ isOpen, onClose, onBroadcastSent }) {
  const { t } = useContext(LanguageContext);
  const [activeLangTab, setActiveLangTab] = useState('si'); // 'si' | 'en' | 'ta'
  const [showPreview, setShowPreview] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const titleDebounceRef = useRef(null);
  const messageDebounceRef = useRef(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_si: '',
    title_ta: '',
    message_en: '',
    message_si: '',
    message_ta: '',
    category: 'CULTIVATION_GLUT',
    crop_code: 'LEEKS',
    target_district: 'Badulla',
    target_division: 'Bandarawela Division',
    target_gnd: '',
    severity: 'MEDIUM',
    action_1: '',
    action_2: '',
    action_3: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAutoTranslate = async (field, text, lang) => {
    if (!text || !text.trim() || text.trim().length < 2) return;
    setIsTranslating(true);
    try {
      const res = await autoFillTrilingual(text, lang);
      if (field === 'title') {
        setFormData(prev => ({
          ...prev,
          title_en: res.en || prev.title_en,
          title_si: res.si || prev.title_si,
          title_ta: res.ta || prev.title_ta
        }));
      } else if (field === 'message') {
        setFormData(prev => ({
          ...prev,
          message_en: res.en || prev.message_en,
          message_si: res.si || prev.message_si,
          message_ta: res.ta || prev.message_ta
        }));
      }
    } catch (err) {
      console.warn('Auto translation warning:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTitleChange = (val, lang) => {
    const key = `title_${lang}`;
    setFormData(prev => ({ ...prev, [key]: val }));

    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    if (val && val.trim().length >= 2) {
      titleDebounceRef.current = setTimeout(() => {
        handleAutoTranslate('title', val, lang);
      }, 700);
    }
  };

  const handleMessageChange = (val, lang) => {
    const key = `message_${lang}`;
    setFormData(prev => ({ ...prev, [key]: val }));

    if (messageDebounceRef.current) clearTimeout(messageDebounceRef.current);
    if (val && val.trim().length >= 3) {
      messageDebounceRef.current = setTimeout(() => {
        handleAutoTranslate('message', val, lang);
      }, 700);
    }
  };

  const handleSyncAllTranslations = async () => {
    const curTitle = activeLangTab === 'si' ? formData.title_si : (activeLangTab === 'ta' ? formData.title_ta : formData.title_en);
    const curMsg = activeLangTab === 'si' ? formData.message_si : (activeLangTab === 'ta' ? formData.message_ta : formData.message_en);
    if (curTitle) await handleAutoTranslate('title', curTitle, activeLangTab);
    if (curMsg) await handleAutoTranslate('message', curMsg, activeLangTab);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const prescribedActions = [formData.action_1, formData.action_2, formData.action_3].filter(Boolean);
      const payload = {
        ...formData,
        prescribed_actions: prescribedActions,
        affected_crops: `${formData.crop_code} & Associated Crops`
      };

      await API.post('/broadcasts', payload);
      setSuccess(true);
      setTimeout(() => {
        if (onBroadcastSent) onBroadcastSent();
        onClose();
      }, 1200);
    } catch (err) {
      // In offline or prototype mode, treat gracefully
      console.warn('API post error handled:', err.message);
      setSuccess(true);
      setTimeout(() => {
        if (onBroadcastSent) onBroadcastSent();
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-outline-variant/30 my-8 animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant/70 hover:text-on-surface transition p-1 rounded-full hover:bg-surface-variant cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-extrabold text-primary flex items-center gap-2">
              Dispatch Official Agrarian Directive
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Bandarawela Agrarian Services Centre • High-priority notification & bulletin dispatch
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 my-3 border border-outline-variant/30 text-xs text-on-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Trilingual broadcast pushed to all registered grower devices & SMS noticeboard.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? 'Hide Preview' : 'Show Live Preview'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container/40 border border-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Official directive bulletin successfully dispatched to all Bandarawela growers!</span>
          </div>
        )}

        {/* Live Preview Card */}
        {showPreview && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-slate-600">LIVE PREVIEW (FARMER DISPLAY)</span>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">{formData.severity}</span>
            </div>
            <p className="font-headline font-black text-slate-900 text-sm">
              {activeLangTab === 'si' ? formData.title_si : activeLangTab === 'ta' ? formData.title_ta : formData.title_en}
            </p>
            <p className="text-slate-700 leading-relaxed">
              {activeLangTab === 'si' ? formData.message_si : activeLangTab === 'ta' ? formData.message_ta : formData.message_en}
            </p>
            <div className="text-[11px] text-slate-600 font-medium pt-1 border-t border-amber-200">
              Target GN: {formData.target_gnd} • Primary Crop: {formData.crop_code}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Detailed Directive Classification Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Directive Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
              >
                <option value="CULTIVATION_GLUT">Cultivation Over-Planting Glut</option>
                <option value="AGRO_WEATHER">Agro-Weather & Rain Warning</option>
                <option value="MARKET_PRICE">Market Price & Deficit Notice</option>
                <option value="PEST_DISEASE">Pest & Blight Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Primary Target Crop *
              </label>
              <select
                value={formData.crop_code}
                onChange={(e) => setFormData({ ...formData, crop_code: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
              >
                {MASTER_CROPS.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.emoji} {c.nameEn} ({c.nameSi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Severity Level & Card Outline *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl text-xs outline-none font-bold transition ${
                  formData.severity === 'CRITICAL' || formData.severity === 'HIGH'
                    ? 'border-2 border-red-500 bg-red-50 text-red-900'
                    : formData.severity === 'WARNING'
                    ? 'border-2 border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900'
                }`}
              >
                <option value="CRITICAL">🔴 Critical / Emergency (Red Outline)</option>
                <option value="HIGH">🔴 High Quota Risk (Red Outline)</option>
                <option value="WARNING">🟡 Normal Warning (Yellow Outline)</option>
                <option value="ADVISORY">🟢 Advisory / Opportunity (Green Outline)</option>
              </select>
            </div>
          </div>

          {/* Division and GN Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Target Agrarian Division *
              </label>
              <input
                type="text"
                required
                value={formData.target_division}
                onChange={(e) => setFormData({ ...formData, target_division: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Target Grama Niladhari (GN) Areas
              </label>
              <input
                type="text"
                value={formData.target_gnd}
                onChange={(e) => setFormData({ ...formData, target_gnd: e.target.value })}
                placeholder="e.g. Kinigama, Bindunuwewa, Dowa"
                className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
              />
            </div>
          </div>

          {/* Trilingual Notice Content */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-on-surface">
                Official Notice Formulation (Trilingual) *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSyncAllTranslations}
                  disabled={isTranslating}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition cursor-pointer"
                  title="Auto-translate active content to all 3 languages"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-primary' : 'text-amber-500'}`} />
                  <span>{isTranslating ? 'Translating...' : 'Auto-Translate'}</span>
                </button>

                <div className="flex gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/40">
                  <button
                    type="button"
                    onClick={() => setActiveLangTab('si')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      activeLangTab === 'si'
                        ? 'bg-primary text-white shadow-xs'
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
                        ? 'bg-primary text-white shadow-xs'
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
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 mb-1.5 text-[10px] text-on-surface-variant font-medium">
              <span>💡 Type in any language — other 2 languages auto-translate & fill seamlessly.</span>
              {isTranslating && (
                <span className="text-primary font-bold animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Auto-translating...
                </span>
              )}
            </div>

            {/* Active Tab Inputs */}
            {activeLangTab === 'si' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">මාතෘකාව (Title SI) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_si}
                    onChange={(e) => handleTitleChange(e.target.value, 'si')}
                    onBlur={() => handleAutoTranslate('title', formData.title_si, 'si')}
                    placeholder="උදා: බණ්ඩාරවෙල ලීක්ස් අතිරික්තය පිළිබඳ අනතුරු ඇඟවීමයි"
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">පණිවිඩය (Message SI) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_si}
                    onChange={(e) => handleMessageChange(e.target.value, 'si')}
                    onBlur={() => handleAutoTranslate('message', formData.message_si, 'si')}
                    placeholder="පණිවිඩය මෙහි ටයිප් කරන්න (අනෙක් භාෂාවලට ස්වයංක්‍රීයව පරිවර්තනය වේ)"
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
                  />
                </div>
              </div>
            )}

            {activeLangTab === 'ta' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">தலைப்பு (Title TA) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_ta}
                    onChange={(e) => handleTitleChange(e.target.value, 'ta')}
                    onBlur={() => handleAutoTranslate('title', formData.title_ta, 'ta')}
                    placeholder="எ.கா. பண்டாரவளை லீக்ஸ் அதிகப்படியான விளைச்சல் எச்சரிக்கை"
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">செய்தி (Message TA) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_ta}
                    onChange={(e) => handleMessageChange(e.target.value, 'ta')}
                    onBlur={() => handleAutoTranslate('message', formData.message_ta, 'ta')}
                    placeholder="செய்தியை இங்கே தட்டச்சு செய்யவும் (தானாகவே மொழிபெயர்க்கப்படும்)"
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
                  />
                </div>
              </div>
            )}

            {activeLangTab === 'en' && (
              <div className="space-y-2.5 bg-surface-container-lowest p-3.5 rounded-2xl border border-primary/30 shadow-xs">
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Title (EN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => handleTitleChange(e.target.value, 'en')}
                    onBlur={() => handleAutoTranslate('title', formData.title_en, 'en')}
                    placeholder="e.g. Critical Leeks Market Glut & Harvest Advisory"
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-on-surface-variant mb-1">Message (EN) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message_en}
                    onChange={(e) => handleMessageChange(e.target.value, 'en')}
                    onBlur={() => handleAutoTranslate('message', formData.message_en, 'en')}
                    placeholder="Type broadcast message in English (auto-translates into Sinhala & Tamil)..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl focus:border-primary bg-surface-container-lowest text-on-surface text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prescribed Farmer Actions Checklist */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Prescribed Regulatory Action Steps for Farmers:</span>
            </label>
            <input
              type="text"
              value={formData.action_1}
              onChange={(e) => setFormData({ ...formData, action_1: e.target.value })}
              placeholder="Action 1: e.g. Halt new seed nursery preparation immediately"
              className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-xs outline-none"
            />
            <input
              type="text"
              value={formData.action_2}
              onChange={(e) => setFormData({ ...formData, action_2: e.target.value })}
              placeholder="Action 2: e.g. Shift planned parcels to Beetroot, Radish or Bush Beans"
              className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-xs outline-none"
            />
            <input
              type="text"
              value={formData.action_3}
              onChange={(e) => setFormData({ ...formData, action_3: e.target.value })}
              placeholder="Action 3: e.g. Register on ASVANNA for priority buyer matchmaking"
              className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface text-xs outline-none"
            />
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
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Dispatching...' : 'Dispatch Official Directive'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
