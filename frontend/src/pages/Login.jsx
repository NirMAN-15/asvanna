import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('OFFICER'); // 'FARMER', 'BUYER', 'OFFICER'
  const [identifier, setIdentifier] = useState('0771234567');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'OFFICER') {
      setIdentifier('0771234567');
    } else if (newRole === 'FARMER') {
      setIdentifier('0712345678');
    } else if (newRole === 'BUYER') {
      setIdentifier('0572222222');
    }
  };

  useEffect(() => {
    if (location.state?.role) {
      handleRoleSelect(location.state.role);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(identifier, password, role);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter a valid 4-digit verification code.');
      return;
    }
    setLoading(true);
    const res = await login(identifier, password, role, otpCode);
    setLoading(false);
    if (res.success) {
      setShowOtpModal(false);
      navigate('/dashboard');
    } else {
      setError(res.message || 'OTP verification failed.');
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
      <section className="hidden lg:flex lg:w-1/2 relative flex-col p-xl overflow-hidden justify-between">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAK11Qn_efj9lI0oTZcTNxN6WHr9zH5YFDW9ggrls56gJDpdvqaKsbkQZPTmoFBOrqOdt9XCB909CwoLMqvGjLtOp8zDhMmLurFgNYgmfrw1ilavtAe3lY46Xv47oQJgKZXC9c51Mj9izLQT-ELKpeSt9DZkrz-wrN5R3lVGlr3H_RWB_YyEGD9QNN8EDnTmMjr1qgNhrZIXWuq5R4nOXijxBYmygq9pl3PBYei4trc7E7pFJHbkJIPgMqhx9BmmEBq-ws')`,
          }}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary via-primary/60 to-transparent" />

        {/* Top-Left Content Container */}
        <div className="relative z-20 flex flex-col items-start gap-6 max-w-lg mt-4">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img
              alt="ASVANNA Logo"
              className="w-28 h-28 object-contain rounded-full shadow-2xl filter drop-shadow-xl hover:scale-105 transition-transform"
              src="/logo.png"
            />
          </Link>
          <h1 className="text-white text-headline-lg font-extrabold leading-tight drop-shadow-lg font-headline">
            The Zero-Waste Marketplace: Guided by Real-Time Data from Seed to Harvest Distribution
          </h1>
          <p className="text-primary-fixed-dim font-body-lg opacity-90 leading-relaxed">
            Eliminating destructive market gluts and stabilizing Sri Lanka's upcountry agriculture through real-time regional transparency.
          </p>
        </div>

        {/* Bottom Metrics Pill Row */}
        <div className="relative z-20 flex gap-4 w-full mt-auto pt-8">
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
      <section className="w-full lg:w-1/2 flex flex-col bg-surface-bright relative min-h-screen">
        {/* Top Utility Bar: Language Selector & Back link */}
        <header className="w-full h-20 px-margin-mobile md:px-margin-desktop flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline group">
            <span className="material-symbols-outlined mr-1 text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Home
          </Link>

          <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1 border border-outline-variant shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 font-label-md text-label-md rounded-full transition-all ${
                lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              EN
            </button>
            <div className="w-px h-4 bg-outline-variant" />
            <button
              onClick={() => setLanguage('si')}
              className={`px-3 py-1 font-label-md text-label-md rounded-full transition-all ${
                lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              සිං
            </button>
            <div className="w-px h-4 bg-outline-variant" />
            <button
              onClick={() => setLanguage('ta')}
              className={`px-3 py-1 font-label-md text-label-md rounded-full transition-all ${
                lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              தம
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-margin-mobile md:px-xl py-6">
          <div className="w-full max-w-[460px] flex flex-col gap-6 bg-white p-6 md:p-8 rounded-2xl shadow-card border border-outline-variant/30">
            {/* Mobile / Header Branding */}
            <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
              <div className="lg:hidden mb-2">
                <img src="/logo.png" alt="ASVANNA Logo" className="w-16 h-16 object-contain rounded-full shadow-md" />
              </div>
              <h2 className="font-headline text-headline-lg text-primary font-extrabold tracking-tight">ASVANNA</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Unified Access Portal for Agricultural Stakeholders
              </p>
            </div>

            {/* Role Selector (Segmented Control from Stitch) */}
            <div className="w-full bg-surface-container rounded-xl p-1.5 flex gap-1 border border-outline-variant/20">
              <button
                type="button"
                onClick={() => handleRoleSelect('FARMER')}
                className={`flex-1 py-3 px-2 rounded-lg font-label-md text-label-md transition-all duration-200 flex flex-col items-center gap-1 ${
                  role === 'FARMER'
                    ? 'active-tab font-bold text-on-secondary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-xl">person</span>
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('BUYER')}
                className={`flex-1 py-3 px-2 rounded-lg font-label-md text-label-md transition-all duration-200 flex flex-col items-center gap-1 ${
                  role === 'BUYER'
                    ? 'active-tab font-bold text-on-secondary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                <span>Local Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('OFFICER')}
                className={`flex-1 py-3 px-2 rounded-lg font-label-md text-label-md transition-all duration-200 flex flex-col items-center gap-1 ${
                  role === 'OFFICER'
                    ? 'active-tab font-bold text-on-secondary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                <span>Divisional Officer</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 bg-error-container/20 border border-error/30 text-error rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Identification Field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-primary font-semibold ml-1" htmlFor="identifier">
                  Phone Number or NIC
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    smartphone
                  </span>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 0712345678 or 199012345678"
                    className="w-full h-[54px] pl-12 pr-4 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-body-md text-body-md text-on-surface"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="password">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('Please contact Bandarawela Agrarian Services to reset credentials.'); }} className="font-label-sm text-label-sm text-secondary hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-[54px] pl-12 pr-12 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-body-md text-body-md text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
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
                <label htmlFor="remember" className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none">
                  Remember session (8 Hours)
                </label>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col gap-3 mt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-primary text-on-primary rounded-lg font-label-md text-base font-bold scale-98 transition-all hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="material-symbols-outlined">login</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px bg-outline-variant flex-1" />
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                    Secure Access
                  </span>
                  <div className="h-px bg-outline-variant flex-1" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  className="w-full h-[54px] bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md font-bold scale-98 transition-all hover:bg-secondary-fixed flex items-center justify-center gap-2 border border-secondary-container/50 cursor-pointer"
                >
                  <span className="material-symbols-outlined icon-fill">security</span>
                  <span>Login with OTP</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Pre-fill helper */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex flex-col gap-1.5">
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">vpn_key</span> Seeded Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('OFFICER')}
                  className="px-2 py-1 bg-white border border-outline-variant/50 rounded font-medium hover:border-primary transition"
                >
                  Officer: 0771234567
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('FARMER')}
                  className="px-2 py-1 bg-white border border-outline-variant/50 rounded font-medium hover:border-primary transition"
                >
                  Farmer: 0712345678
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('BUYER')}
                  className="px-2 py-1 bg-white border border-outline-variant/50 rounded font-medium hover:border-primary transition"
                >
                  Buyer: 0572222222
                </button>
              </div>
            </div>

            {/* Footer Registration Link */}
            <div className="text-center pt-1 border-t border-outline-variant/20 flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
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

        {/* Mobile Footer */}
        <footer className="lg:hidden py-4 px-margin-mobile text-center border-t border-outline-variant/30">
          <span className="font-label-sm text-label-sm text-outline">© 2026 ASVANNA SL. All rights reserved.</span>
        </footer>
      </section>

      {/* OTP Login Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant/30 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">sms</span>
                OTP Verification
              </h3>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-4">
              A 4-digit verification code has been sent via SMS to <span className="font-bold text-on-surface">{identifier}</span>.
            </p>
            <form onSubmit={handleOtpLogin} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={4}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full text-center text-3xl font-bold tracking-widest py-3 border border-outline-variant rounded-xl focus:border-primary outline-none"
              />
              <p className="text-xs text-secondary font-medium text-center">Demo OTP: Enter any 4 digits (e.g. 1234)</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant font-label-md text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-label-md font-bold hover:bg-primary-container"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
