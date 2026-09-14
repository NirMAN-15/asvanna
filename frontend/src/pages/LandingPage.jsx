import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang, setLanguage, t } = useContext(LanguageContext);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col items-center justify-between relative overflow-x-hidden">
      {/* Subtle Atmospheric Background (Stitch Pattern) */}
      <div className="fixed inset-0 bg-pattern pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-secondary-container blur-[130px] opacity-25" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-primary-fixed blur-[130px] opacity-25" />
      </div>

      {/* Header / Nav (Anchor Component with Language Switcher) */}
      <header className="sticky top-0 w-full px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center z-50 bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ASVANNA Logo"
            className="w-10 h-10 object-contain rounded-full shadow-md filter drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-headline-sm font-extrabold text-primary tracking-tight">ASVANNA</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/40 ml-1">
              (අස්වැන්න)
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
            <span>Sign In</span>
            <span className="material-symbols-outlined text-lg">login</span>
          </Link>
        </div>
      </header>

      {/* Main Content Container (Stitch Bento Grid) */}
      <main className="relative z-10 w-full max-w-container-max px-margin-mobile md:px-margin-desktop py-12 flex flex-col items-center flex-1 justify-center">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 border border-secondary/30 text-on-secondary-container text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">eco</span>
            Sri Lanka Upcountry Agrarian Pilot • Bandarawela
          </div>
          <h1 className="font-headline text-headline-lg md:text-[46px] md:leading-[54px] text-primary mb-4 font-extrabold tracking-tight">
            Join the ASVANNA Ecosystem
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Empowering Sri Lankan agriculture through digital connectivity, predictive risk mitigation, and zero-waste local surplus trading.
          </p>
        </div>

        {/* Role Selection Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-5xl">
          {/* Card 1: Farmer */}
          <div className="role-card group bg-surface-container-lowest border-t-4 border-primary p-6 md:p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-card hover:shadow-card-hover border border-outline-variant/30 hover:-translate-y-1">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-fixed rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[34px]">agriculture</span>
              </div>
              <h3 className="font-headline text-headline-md text-primary mb-2">Upcountry Farmer</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Log crop cultivation, receive smart alternative crop recommendations, and sell surplus produce directly to local buyers.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Direct 5km Market Access</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Smart Crop Alternation Engine</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Regional Over-Planting Alerts</span>
              </li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/auth/farmer')}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors press-effect shadow-sm"
              >
                <span>Register</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/login', { state: { role: 'FARMER' } })}
                className="px-3 py-3 border border-outline-variant hover:bg-surface-container rounded-xl text-primary font-bold transition"
                title="Sign in as Farmer"
              >
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          </div>

          {/* Card 2: Local Buyer */}
          <div className="role-card group bg-surface-container-lowest border-t-4 border-secondary p-6 md:p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-card hover:shadow-card-hover border border-outline-variant/30 hover:-translate-y-1">
            <div className="mb-6">
              <div className="w-16 h-16 bg-secondary-container rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[34px]">shopping_cart</span>
              </div>
              <h3 className="font-headline text-headline-md text-secondary mb-2">Local Buyer</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Source fresh vegetables and bulk crops directly from local growers within your commercial district with fair pricing.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Geo-Fenced 5km Surplus Procurement</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Verified Quality & Organic Produce</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Real-Time Supply Chain Telemetry</span>
              </li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/auth/buyer')}
                className="flex-1 bg-secondary text-white py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors press-effect shadow-sm"
              >
                <span>Register</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/login', { state: { role: 'BUYER' } })}
                className="px-3 py-3 border border-outline-variant hover:bg-surface-container rounded-xl text-secondary font-bold transition"
                title="Sign in as Buyer"
              >
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          </div>

          {/* Card 3: Divisional Officer */}
          <div className="role-card group bg-surface-container-lowest border-t-4 border-primary-container p-6 md:p-8 rounded-2xl flex flex-col transition-all duration-300 shadow-card hover:shadow-card-hover border border-outline-variant/30 hover:-translate-y-1">
            <div className="mb-6">
              <div className="w-16 h-16 bg-surface-variant rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <span className="material-symbols-outlined text-primary text-[34px]">admin_panel_settings</span>
              </div>
              <h3 className="font-headline text-headline-md text-primary mb-2">Divisional Officer</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Monitor regional cultivation patterns, manage district planting quotas, issue broadcast advisories, and log proxy data.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Regional Crop Heatmaps & Saturation</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Proxy Data Entry for Offline Farmers</span>
              </li>
              <li className="flex items-center gap-2.5 text-label-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-fill">check_circle</span>
                <span>Emergency Broadcast Alert System</span>
              </li>
            </ul>

            <div className="flex gap-2">
              <button
                onClick={() => navigate('/auth/officer')}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 group-hover:bg-primary-container transition-colors press-effect shadow-sm"
              >
                <span>Register</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/login', { state: { role: 'OFFICER' } })}
                className="px-3 py-3 border border-outline-variant hover:bg-surface-container rounded-xl text-primary font-bold transition"
                title="Sign in as Officer"
              >
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Existing User Callout Banner */}
        <div className="mt-12 bg-surface-container-low border border-outline-variant/40 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl w-full shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <div>
              <p className="font-label-md font-bold text-on-surface">Already registered in the platform?</p>
              <p className="text-xs text-on-surface-variant">Sign in to access your customized dashboard</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container transition shadow-sm whitespace-nowrap"
          >
            Access Portal
          </Link>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-outline-variant/30 py-6 px-margin-desktop bg-surface-bright/50">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <p>© 2026 ASVANNA (අස්වැන්න) Ecosystem • ITUM NDIT Final Year Research Initiative Group 15</p>
          <div className="flex gap-4">
            <span className="text-outline">Bandarawela Pilot Division</span>
            <span>•</span>
            <a href="#privacy" className="hover:text-primary transition">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
