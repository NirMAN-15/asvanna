import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import landingBg from '../assets/landing-bg.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang, setLanguage, t } = useContext(LanguageContext);

  return (
    <div 
      className="relative min-h-screen text-on-surface font-body-md flex flex-col items-center justify-between overflow-x-hidden bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${landingBg})` }}
    >
      {/* Header / Nav (Anchor Component with Language Switcher) */}
      <header className="sticky top-0 w-full px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ASVANNA Logo"
            className="w-10 h-10 object-contain rounded-full shadow-md filter drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-headline-sm font-extrabold text-primary tracking-tight">ASVANNA</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/40 ml-1">
              {t('sinhala_abbr')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 shadow-sm border border-outline-variant/40">
            <button
              onClick={() => setLanguage('en')}
              className={`font-label-md text-label-md px-2.5 py-0.5 rounded-full transition-colors ${
                lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed font-bold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              EN
            </button>
            <div className="w-px h-3.5 bg-outline-variant mx-1" />
            <button
              onClick={() => setLanguage('si')}
              className={`font-label-md text-label-md px-2.5 py-0.5 rounded-full transition-colors ${
                lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed font-bold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              සිං
            </button>
            <div className="w-px h-3.5 bg-outline-variant mx-1" />
            <button
              onClick={() => setLanguage('ta')}
              className={`font-label-md text-label-md px-2.5 py-0.5 rounded-full transition-colors ${
                lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed font-bold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              த
            </button>
          </div>

          <Link
            to="/login"
            className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition shadow-sm flex items-center gap-1.5"
          >
            <span>{t('portal_sign_in')}</span>
            <span className="material-symbols-outlined text-lg">login</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container (Stitch Bento Grid) */}
      <main className="relative z-10 w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-12 flex flex-col items-center flex-1 justify-center">
        {/* Hero Section */}
        <div className="text-center mb-10 animate-fadeIn max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-secondary/30 text-on-secondary-container text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="material-symbols-outlined text-sm">eco</span>
            {t('landing_badge')}
          </div>
          <h1 className="font-headline text-headline-lg md:text-[46px] md:leading-[54px] text-primary mb-4 font-extrabold tracking-tight">
            {t('landing_hero_title')}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            {t('landing_hero_desc')}
          </p>
        </div>

        {/* Role Selection Bento Grid (Farmer & Buyer) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl">
          {/* Card 1: Farmer */}
          <div className="role-card group bg-white border-t-4 border-primary p-6 md:p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl border border-outline-variant/30 hover:-translate-y-1">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[34px]">agriculture</span>
              </div>
              <h3 className="font-headline text-headline-md text-primary mb-2">{t('portal_farmer_title')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {t('portal_farmer_desc')}
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_farmer_point1')}</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_farmer_point2')}</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_farmer_point3')}</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/login', { state: { role: 'FARMER' } })}
                className="flex-1 bg-primary text-on-primary py-3.5 px-5 rounded-xl font-label-md text-base font-bold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors press-effect shadow-md"
              >
                <span>{t('portal_sign_in')}</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </button>
              <button
                onClick={() => navigate('/auth/farmer')}
                className="px-5 py-3.5 border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-label-md text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('portal_register')}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Card 2: Local Buyer */}
          <div className="role-card group bg-white border-t-4 border-secondary p-6 md:p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl border border-outline-variant/30 hover:-translate-y-1">
            <div className="mb-6">
              <div className="w-16 h-16 bg-secondary-container rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[34px]">shopping_cart</span>
              </div>
              <h3 className="font-headline text-headline-md text-secondary mb-2">{t('portal_buyer_title')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {t('portal_buyer_desc')}
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_buyer_point1')}</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_buyer_point2')}</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>{t('portal_buyer_point3')}</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/login', { state: { role: 'BUYER' } })}
                className="flex-1 bg-secondary text-white py-3.5 px-5 rounded-xl font-label-md text-base font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors press-effect shadow-md"
              >
                <span>{t('portal_sign_in')}</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </button>
              <button
                onClick={() => navigate('/auth/buyer')}
                className="px-5 py-3.5 border-2 border-secondary/30 hover:border-secondary text-secondary hover:bg-secondary/5 rounded-xl font-label-md text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('portal_register')}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Divisional Officer Info Notice (with info 'i' icon) */}
        <div className="w-full max-w-4xl mt-8 bg-white/95 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary border border-primary/20">
              <span className="material-symbols-outlined text-2xl">info</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {t('portal_officer_info_badge')}
                </span>
                <h4 className="font-headline font-bold text-primary text-base sm:text-lg">
                  {t('portal_officer_info_title')}
                </h4>
              </div>
              <p className="font-body-sm text-sm text-on-surface-variant max-w-xl leading-relaxed">
                {t('portal_officer_info_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login', { state: { role: 'OFFICER' } })}
            className="w-full sm:w-auto px-5 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>{t('portal_officer_sign_in')}</span>
            <span className="material-symbols-outlined text-lg">login</span>
          </button>
        </div>

        {/* Existing User Callout Banner */}
        <div className="mt-8 bg-white/95 backdrop-blur-md border border-outline-variant/40 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl w-full shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <div>
              <p className="font-label-md font-bold text-on-surface">{t('landing_existing_title')}</p>
              <p className="text-xs text-on-surface-variant">{t('landing_existing_subtitle')}</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container transition shadow-sm whitespace-nowrap"
          >
            {t('landing_access_portal')}
          </Link>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-outline-variant/30 py-6 px-margin-desktop bg-white/80 backdrop-blur-xs">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <p>{t('landing_footer_text')}</p>
          <div className="flex gap-4">
            <span className="text-outline">{t('landing_pilot_division')}</span>
            <span>•</span>
            <a href="#privacy" className="hover:text-primary transition">{t('landing_privacy_policy')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
