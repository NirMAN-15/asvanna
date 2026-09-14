import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

export default function FarmerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    nic: '',
    phone: '',
    district: 'Badulla',
    division: 'Bandarawela',
    gnd_division: 'Wewathenna',
    land_size_acres: '2.5',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const payload = {
      full_name: formData.full_name,
      nic: formData.nic,
      phone: formData.phone,
      district: formData.district,
      division: formData.division,
      gnd_division: formData.gnd_division,
      land_size_acres: parseFloat(formData.land_size_acres) || 2.0,
      password: formData.password,
    };

    const res = await register(payload, 'FARMER');
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Farmer registration failed. Please verify your details.');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-16">
      {/* Top Navigation Anchor (Stitch Design) */}
      <header className="bg-surface-bright shadow-sm h-20 flex items-center justify-between px-margin-mobile md:px-margin-desktop sticky top-0 z-50 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition press-effect"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ASVANNA" className="w-8 h-8 rounded-full shadow-sm" />
            <h1 className="font-headline text-headline-sm md:text-headline-md font-bold text-primary">
              ASVANNA
            </h1>
            <span className="text-xs bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold ml-1">
              Farmer Onboarding
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-bold text-primary hover:underline">
            Sign In
          </Link>
          <div className="flex items-center bg-white rounded-full px-2 py-1 border border-outline-variant/40 shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('si')}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
              }`}
            >
              සිං
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
              }`}
            >
              த
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-margin-mobile py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md text-primary font-bold">
              Farmer Cultivator Registration
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              Step 1 of 1 (Direct Telemetry)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div className="w-full h-full bg-primary rounded-full transition-all duration-500" />
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-error-container/20 border border-error/30 text-error rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Information */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-card border border-outline-variant/30 border-t-4 border-primary">
            <h2 className="font-headline text-headline-sm text-primary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">person</span>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="full_name">
                  Full Name (සම්පූර්ණ නම)
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Bandara"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="nic">
                  NIC Number (ජා.හැ. අංකය)
                </label>
                <input
                  id="nic"
                  name="nic"
                  type="text"
                  required
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g. 197812345678"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="phone">
                  Mobile Phone Number (දුරකථන අංකය)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md font-bold">
                    +94
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="71 234 5678"
                    className="w-full h-12 pl-12 pr-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Farm & Cultivation Details */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-card border border-outline-variant/30 border-t-4 border-secondary">
            <h2 className="font-headline text-headline-sm text-secondary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">nature_people</span>
              Farm & Cultivation Telemetry
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="district">
                  District
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                >
                  <option value="Badulla">Badulla (Bandarawela Pilot)</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Kandy">Kandy</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="division">
                  Agrarian Services Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                >
                  <option value="Bandarawela">Bandarawela</option>
                  <option value="Welimada">Welimada</option>
                  <option value="Haputale">Haputale</option>
                  <option value="Ella">Ella</option>
                  <option value="Diyatalawa">Diyatalawa</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="gnd_division">
                  Grama Niladhari (GND) Division
                </label>
                <input
                  id="gnd_division"
                  name="gnd_division"
                  type="text"
                  value={formData.gnd_division}
                  onChange={handleChange}
                  placeholder="e.g. Wewathenna or Kinigama"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="land_size_acres">
                  Total Land Size (Acres / අක්කර)
                </label>
                <input
                  id="land_size_acres"
                  name="land_size_acres"
                  type="number"
                  step="0.1"
                  required
                  value={formData.land_size_acres}
                  onChange={handleChange}
                  placeholder="2.5"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="confirm_password">
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 px-4 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/login" className="text-sm font-bold text-primary hover:underline">
              Already registered? Sign in here
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 h-14 bg-primary text-white rounded-xl font-label-md text-base font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 press-effect shadow-md disabled:opacity-70"
            >
              {loading ? (
                <span>Registering Farmer...</span>
              ) : (
                <>
                  <span>Complete Farmer Registration</span>
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
