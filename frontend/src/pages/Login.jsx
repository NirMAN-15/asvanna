import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { validateNIC } from '../utils/validation';
import farmerBg from '../assets/login-farmer-bg.jpg';
import buyerBg from '../assets/login-buyer-bg.jpg';
import officerBg from '../assets/login-officer-bg.jpg';

const roleInfo = {
  FARMER: {
    badge: 'Upcountry Farmer Portal',
    icon: 'agriculture',
    image: farmerBg,
    points: [
      'Direct 5km Market Access',
      'Smart Crop Alternation Engine',
      'Regional Over-Planting Alerts',
    ],
  },
  BUYER: {
    badge: 'Local Buyer Marketplace',
    icon: 'shopping_cart',
    image: buyerBg,
    points: [
      'Geo-Fenced 5km Surplus Procurement',
      'Verified Quality & Organic Produce',
      'Real-Time Supply Chain Telemetry',
    ],
  },
  OFFICER: {
    badge: 'Divisional Agrarian Portal',
    icon: 'admin_panel_settings',
    image: officerBg,
    points: [
      'Regional Crop Heatmaps & Saturation',
      'Proxy Data Entry for Offline Farmers',
      'Emergency Broadcast Alert System',
    ],
  },
};

export default function Login() {
  const { login } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('FARMER'); // 'FARMER', 'BUYER', 'OFFICER'
  const [nic, setNic] = useState('197823456789');
  const [nicError, setNicError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    setError('');
    setNicError('');
    if (newRole === 'OFFICER') {
      setNic('198512345678');
    } else if (newRole === 'FARMER') {
      setNic('197823456789');
    } else if (newRole === 'BUYER') {
      setNic('200134567890');
    }
  };

  const handleNicBlur = () => {
    if (nic) {
      const res = validateNIC(nic);
      setNicError(res.isValid ? '' : res.message);
    }
  };

  useEffect(() => {
    if (location.state?.role) {
      handleRoleSelect(location.state.role);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    const nicRes = validateNIC(nic);
    if (!nicRes.isValid) {
      setNicError(nicRes.message);
      setError(nicRes.message);
      return;
    }

    setLoading(true);
    const res = await login(nicRes.clean || nic.trim().toUpperCase(), password, role);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const getRegisterLink = () => {
    if (role === 'OFFICER') return '/auth/officer';
    if (role === 'BUYER') return '/auth/buyer';
    return '/auth/farmer';
  };

  return (
    <main className="flex min-h-screen bg-surface font-body-md text-on-surface overflow-x-hidden">
      {/* Left Side: Visual/Branding Section (Stitch Design) */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col p-xl overflow-hidden justify-between min-h-screen">
        {/* Background Image with role-based switching */}
        <div
          key={role}
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 animate-fadeIn"
          style={{
            backgroundImage: `url('${roleInfo[role]?.image || roleInfo.FARMER.image}')`,
          }}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/95 via-primary/75 to-primary/40" />

        {/* Top-Left Content Container */}
        <div className="relative z-20 flex flex-col items-start gap-4 max-w-lg mt-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img
              alt="ASVANNA Logo"
              className="w-24 h-24 object-contain rounded-full shadow-2xl filter drop-shadow-xl hover:scale-105 transition-transform"
              src="/logo.png"
            />
          </Link>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm">
              <span className="material-symbols-outlined text-sm">{roleInfo[role]?.icon}</span>
              <span>{roleInfo[role]?.badge}</span>
            </div>
            <h1 className="text-white text-headline-lg font-extrabold leading-tight drop-shadow-lg font-headline">
              The Zero-Waste Marketplace: Guided by Real-Time Data from Seed to Harvest Distribution
            </h1>
            <p className="text-primary-fixed-dim font-body-lg opacity-90 leading-relaxed text-sm md:text-base">
              Eliminating destructive market gluts and stabilizing Sri Lanka's upcountry agriculture through real-time regional transparency.
            </p>
          </div>

          {/* Dynamic 3 Feature Points for Selected Role */}
          <div key={`features-${role}`} className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl mt-1 animate-fadeIn">
            <ul className="space-y-2.5">
              {roleInfo[role]?.points.map((point, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-white font-semibold text-sm sm:text-base">
                  <span className="material-symbols-outlined text-secondary-fixed text-xl flex-shrink-0">
                    check_circle
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Metrics Pill Row */}
        <div className="relative z-20 flex gap-4 w-full mt-auto pt-6">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex flex-col gap-1 shadow-lg">
            <span className="material-symbols-outlined text-secondary-fixed text-3xl">preventative</span>
            <span className="text-secondary-fixed font-extrabold text-2xl md:text-3xl font-headline">30-40%</span>
            <span className="text-white/90 text-label-sm uppercase tracking-wider">Post-harvest loss prevented</span>
          </div>

          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex flex-col gap-1 shadow-lg">
            <span className="material-symbols-outlined text-secondary-fixed text-3xl">radar</span>
            <span className="text-secondary-fixed font-extrabold text-2xl md:text-3xl font-headline">5 km</span>
            <span className="text-white/90 text-label-sm uppercase tracking-wider">Zero-waste trade radius</span>
          </div>

          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex flex-col gap-1 shadow-lg">
            <span className="material-symbols-outlined text-secondary-fixed text-3xl">savings</span>
            <span className="text-secondary-fixed font-extrabold text-2xl md:text-3xl font-headline">Rs. 180B</span>
            <span className="text-white/90 text-label-sm uppercase tracking-wider">Annual waste eliminated</span>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form Section */}
      <section className="w-full lg:w-1/2 flex flex-col bg-gradient-to-b from-[#f8faf8] via-[#f2f6f2] to-[#ebf2eb] relative min-h-screen overflow-hidden">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-fixed/35 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        {/* Top Utility Bar: Language Selector & Back link */}
        <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between z-10 relative">
          <Link to="/" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline group font-medium">
            <span className="material-symbols-outlined mr-1 text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Home
          </Link>

          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md rounded-full px-2 py-1 border border-outline-variant/40 shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-0.5 font-label-md text-label-md rounded-full transition-all ${
                lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              EN
            </button>
            <div className="w-px h-3.5 bg-outline-variant/60" />
            <button
              onClick={() => setLanguage('si')}
              className={`px-3 py-0.5 font-label-md text-label-md rounded-full transition-all ${
                lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              සිං
            </button>
            <div className="w-px h-3.5 bg-outline-variant/60" />
            <button
              onClick={() => setLanguage('ta')}
              className={`px-3 py-0.5 font-label-md text-label-md rounded-full transition-all ${
                lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              தம
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 sm:py-10 z-10 relative overflow-y-auto">
          <div className="w-full max-w-[620px] flex flex-col gap-6 sm:gap-7 bg-white/95 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl shadow-primary/10 border border-outline-variant/30">
            {/* Header Branding */}
            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
              <div className="lg:hidden mb-2">
                <img src="/logo.png" alt="ASVANNA Logo" className="w-16 h-16 object-contain rounded-full shadow-md" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary">
                  Agricultural Intelligence Platform
                </span>
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl text-primary font-extrabold tracking-tight">ASVANNA</h2>
              <p className="font-body-md text-base sm:text-lg text-on-surface-variant">
                Unified Access Portal for Agricultural Stakeholders
              </p>
            </div>

            {/* Role Selector (Segmented Control from Stitch) */}
            <div className="w-full bg-surface-container/70 rounded-2xl p-1.5 flex gap-1.5 border border-outline-variant/25">
              <button
                type="button"
                onClick={() => handleRoleSelect('FARMER')}
                className={`flex-1 py-3 sm:py-3.5 px-2 rounded-xl font-label-md text-sm sm:text-base transition-all duration-200 flex flex-col items-center gap-1.5 ${
                  role === 'FARMER'
                    ? 'active-tab font-bold text-on-secondary-fixed shadow-sm'
                    : 'text-on-surface-variant hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">person</span>
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('BUYER')}
                className={`flex-1 py-3 sm:py-3.5 px-2 rounded-xl font-label-md text-sm sm:text-base transition-all duration-200 flex flex-col items-center gap-1.5 ${
                  role === 'BUYER'
                    ? 'active-tab font-bold text-on-secondary-fixed shadow-sm'
                    : 'text-on-surface-variant hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">shopping_cart</span>
                <span>Local Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('OFFICER')}
                className={`flex-1 py-3 sm:py-3.5 px-2 rounded-xl font-label-md text-sm sm:text-base transition-all duration-200 flex flex-col items-center gap-1.5 ${
                  role === 'OFFICER'
                    ? 'active-tab font-bold text-on-secondary-fixed shadow-sm'
                    : 'text-on-surface-variant hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">admin_panel_settings</span>
                <span>Divisional Officer</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3.5 bg-error-container/20 border border-error/30 text-error rounded-xl text-sm sm:text-base font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-lg sm:text-xl">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* National Identity Card (NIC) Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="font-label-md text-sm sm:text-base text-primary font-semibold" htmlFor="nic">
                    {lang === 'si' ? 'ජාතික හැඳුනුම්පත් අංකය (NIC)' : lang === 'ta' ? 'தேசிய அடையாள அட்டை எண் (NIC)' : 'National Identity Card (NIC)'}
                  </label>
                  <span className="text-xs text-on-surface-variant">
                    {lang === 'si' ? 'අංක 9+V හෝ අංක 12' : lang === 'ta' ? '9 இலக்கங்கள்+V அல்லது 12 இலக்கங்கள்' : '9 digits + V or 12 digits'}
                  </span>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl sm:text-2xl">
                    badge
                  </span>
                  <input
                    id="nic"
                    type="text"
                    required
                    value={nic}
                    onChange={(e) => {
                      setNic(e.target.value.toUpperCase());
                      if (nicError) setNicError('');
                    }}
                    onBlur={handleNicBlur}
                    placeholder="e.g. 198512345678 or 851234567V"
                    className={`w-full h-[54px] sm:h-[58px] pl-12 pr-4 bg-surface-bright/50 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-body-md text-base text-on-surface ${
                      nicError ? 'border-error ring-1 ring-error' : 'border-outline-variant/60'
                    }`}
                  />
                </div>
                {nicError && (
                  <span className="text-xs text-error font-medium px-1">{nicError}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-sm sm:text-base text-primary font-semibold" htmlFor="password">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('Please contact Bandarawela Agrarian Services to reset credentials.'); }} className="font-label-sm text-xs sm:text-sm text-secondary hover:underline font-medium">
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl sm:text-2xl">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-[54px] sm:h-[58px] pl-12 pr-12 bg-surface-bright/50 border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-body-md text-base text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-xl sm:text-2xl">
                       {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Session Selection */}
              <div className="flex items-center gap-3 px-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="remember" className="font-label-md text-sm sm:text-base text-on-surface-variant cursor-pointer select-none">
                  Remember session (8 Hours)
                </label>
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col gap-3 mt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] sm:h-[58px] bg-primary text-on-primary rounded-xl font-label-md text-base sm:text-lg font-bold scale-98 transition-all hover:bg-primary-container shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="material-symbols-outlined text-xl sm:text-2xl">login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Registration Link */}
            <div className="text-center pt-3 border-t border-outline-variant/20 flex flex-col gap-1.5 font-body-sm text-sm sm:text-base text-on-surface-variant">
              <p>
                Don't have an account yet?{' '}
                <Link to={getRegisterLink()} className="text-primary font-bold hover:underline">
                  Register as {role === 'OFFICER' ? 'Officer' : role === 'BUYER' ? 'Buyer' : 'Farmer'}
                </Link>
              </p>
              <p>
                Need help accessing your account?{' '}
                <a href="tel:1920" className="text-secondary font-semibold hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Grounded Utility Footer */}
        <footer className="py-3 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-outline/80 border-t border-outline-variant/20 z-10 relative">
          <span>© 2026 ASVANNA SL. Democratic Socialist Republic of Sri Lanka</span>
          <a href="tel:1920" className="hover:text-primary flex items-center gap-1 font-medium text-secondary">
            <span className="material-symbols-outlined text-sm">support_agent</span> Agrarian Hotline: 1920
          </a>
        </footer>
      </section>
    </main>
  );
}
