import React, { createContext, useState } from 'react';
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const translations = { en, si, ta };

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('asvanna_lang') || 'en');

  const setLanguage = (newLang) => {
    localStorage.setItem('asvanna_lang', newLang);
    setLang(newLang);
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['en']?.[key] || key;
    if (typeof str === 'string' && params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
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
