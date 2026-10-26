import React, { createContext, useState, useEffect, useRef } from 'react';
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const staticTranslations = { en, si, ta };

// Normalize string for dictionary lookup
const normalizeKey = (k) => {
  if (!k || typeof k !== 'string') return '';
  return k.trim().toLowerCase().replace(/[\s\-_]+/g, '_');
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('asvanna_lang') || 'en');
  const [dynamicCache, setDynamicCache] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('asvanna_dynamic_translations')) || {};
    } catch {
      return {};
    }
  });

  const pendingRequests = useRef(new Set());

  const setLanguage = (newLang) => {
    localStorage.setItem('asvanna_lang', newLang);
    setLang(newLang);
  };

  const fetchTranslation = async (textToTranslate, targetLang, originalKey) => {
    if (!textToTranslate || typeof textToTranslate !== 'string' || textToTranslate.length < 2) return;
    // Don't translate pure numbers or symbols
    if (/^[0-9\s.,/\\()\-:%#$*+•]+$/.test(textToTranslate)) return;

    const cacheKey = `${targetLang}_${textToTranslate.trim()}`;
    const keyCacheKey = originalKey ? `${targetLang}_${originalKey.trim()}` : null;

    if (pendingRequests.current.has(cacheKey)) return;
    pendingRequests.current.add(cacheKey);

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate.trim())}&langpair=en|${targetLang}`);
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      
      if (translated && !translated.startsWith('MYMEMORY WARNING') && translated.toLowerCase() !== textToTranslate.toLowerCase()) {
        setDynamicCache(prev => {
          const newCache = { ...prev, [cacheKey]: translated };
          if (keyCacheKey) newCache[keyCacheKey] = translated;
          try {
            localStorage.setItem('asvanna_dynamic_translations', JSON.stringify(newCache));
          } catch (e) {}
          return newCache;
        });
      }
    } catch (err) {
      console.warn('Dynamic translation failed:', err);
    }
  };

  /**
   * Universal translation helper:
   * Usage:
   * t('nav_market_prices', 'Market Prices')
   * t('Crop')
   * t('acres_val', { val: 2.5 })
   * t('acres_available_planting', { count: 2.5 }, '2.5 acres available')
   */
  const t = (key, defaultOrParams = {}, params = {}) => {
    if (!key && typeof key !== 'string') return '';

    let defaultText = '';
    let actualParams = {};

    if (typeof defaultOrParams === 'string') {
      defaultText = defaultOrParams;
      actualParams = params && typeof params === 'object' ? params : {};
    } else if (defaultOrParams && typeof defaultOrParams === 'object') {
      actualParams = defaultOrParams;
      if (typeof params === 'string') {
        defaultText = params;
      }
    }

    if (lang === 'en') {
      let str = staticTranslations['en']?.[key] || defaultText || key;
      if (typeof str === 'string' && actualParams) {
        Object.entries(actualParams).forEach(([k, v]) => {
          str = str.replaceAll(`{${k}}`, v);
        });
      }
      return str;
    }

    // 1. Direct key match in target language
    let str = staticTranslations[lang]?.[key];

    // 2. Normalized key match (e.g. "Land Utilization" -> "land_utilization")
    if (!str) {
      const norm = normalizeKey(key);
      str = staticTranslations[lang]?.[norm];
    }

    // 3. Match by normalized defaultText
    if (!str && defaultText) {
      const normDefault = normalizeKey(defaultText);
      str = staticTranslations[lang]?.[normDefault];
    }

    // 4. Check dynamic cache
    const textToQuery = defaultText || key;
    const cacheKey = `${lang}_${textToQuery.trim()}`;
    const rawCacheKey = `${lang}_${key.trim()}`;
    if (!str && (dynamicCache[cacheKey] || dynamicCache[rawCacheKey])) {
      str = dynamicCache[cacheKey] || dynamicCache[rawCacheKey];
    }

    // 5. Trigger live Internet Translation API if missing in target language
    if (!str && lang !== 'en') {
      fetchTranslation(textToQuery, lang, key);
    }

    // 6. Fallback
    str = str || staticTranslations['en']?.[key] || defaultText || key;

    // 7. Parameter interpolation
    if (typeof str === 'string' && actualParams && typeof actualParams === 'object') {
      Object.entries(actualParams).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, v);
      });
    }

    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};


