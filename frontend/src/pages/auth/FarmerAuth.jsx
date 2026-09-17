import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { validateNIC, validatePhone } from '../../utils/validation';
import farmerHeroBg from '../../assets/register-farmer-bg.jpg';

export default function FarmerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleBlur = (field) => {
    if (field === 'nic' && formData.nic) {
      const res = validateNIC(formData.nic);
      setFieldErrors((prev) => ({ ...prev, nic: res.isValid ? '' : res.message }));
    } else if (field === 'phone' && formData.phone) {
      const res = validatePhone(formData.phone, true);
      setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? '' : res.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // NIC Validation
    const nicRes = validateNIC(formData.nic);
    if (!nicRes.isValid) {
      setFieldErrors((prev) => ({ ...prev, nic: nicRes.message }));
      setError(nicRes.message);
      return;
    }

    // Phone Validation (accepts 9 digits or standard 10 digits)
    const phoneRes = validatePhone(formData.phone, true);
    if (!phoneRes.isValid) {
      setFieldErrors((prev) => ({ ...prev, phone: phoneRes.message }));
      setError(phoneRes.message);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const payload = {
      full_name: formData.full_name,
      nic: nicRes.clean,
      phone: phoneRes.clean,
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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface font-body-md text-on-surface">
      {/* Left Side: Hero Image (Stitch Design) */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 h-screen sticky top-0 bg-primary overflow-hidden">
        <div className="relative w-full h-full">
          {/* High-res background image */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-55 transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: `url(${farmerHeroBg})`,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/70 to-primary/30" />

          {/* Branding Content Overlay */}
          <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between z-10">
            <Link to="/" className="inline-flex items-center transition hover:opacity-90">
              <img
                alt="ASVANNA Logo"
                className="w-16 h-16 lg:w-20 lg:h-20 object-contain rounded-full shadow-lg filter drop-shadow-lg"
                src="/logo.png"
              />
            </Link>

            <div className="max-w-lg mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm mb-4">
                <span className="material-symbols-outlined text-sm">agriculture</span>
                <span>Farmer Cultivator Verification Portal</span>
              </div>
              <h1 className="font-headline text-headline-md lg:text-headline-lg text-white mb-3 font-bold leading-tight drop-shadow-md">
                Direct Farm-to-Market Telemetry for Sri Lankan Cultivators.
              </h1>
              <p className="font-body-md lg:font-body-lg text-primary-fixed-dim leading-relaxed">
                Register your land parcels, avoid destructive crop over-planting, and unlock direct fair-price access to buyers within a 5 km radius.
              </p>
            </div>

            <div className="flex items-center gap-6 text-on-primary">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Direct Access</span>
                <span className="font-headline text-headline-sm lg:text-headline-md font-bold text-white">5 km Radius Direct Trade</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Pilot Corridor</span>
                <span className="font-headline text-headline-sm lg:text-headline-md font-bold text-white">Bandarawela & Badulla Basin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <main className="w-full md:w-1/2 lg:w-2/5 min-h-screen flex flex-col justify-center items-center p-6 md:p-8 lg:p-10 bg-surface overflow-y-auto">
        <div className="w-full max-w-lg mx-auto py-6">
          {/* Header & Language Switcher */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline transition group">
              <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Role Selection
            </Link>

            <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 border border-outline-variant/40 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'en' ? 'bg-secondary text-white' : 'text-on-surface-variant'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'si' ? 'bg-secondary text-white' : 'text-on-surface-variant'
                }`}
              >
                සිං
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'ta' ? 'bg-secondary text-white' : 'text-on-surface-variant'
                }`}
              >
                த
              </button>
            </div>
          </div>

          <header className="mb-6">
            <div className="flex md:hidden items-center gap-2 mb-3">
              <img alt="ASVANNA Logo" className="w-8 h-8 rounded-full shadow-sm" src="/logo.png" />
              <span className="font-headline font-bold text-primary">ASVANNA</span>
            </div>
            <h2 className="font-headline text-headline-md lg:text-headline-lg text-primary font-bold mb-1">
              Farmer Cultivator Registration
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Step 1 of 1 (Direct Telemetry) - Fill in your personal and cultivation details.
            </p>
          </header>

          {error && (
            <div className="p-3 mb-6 bg-error-container/20 border border-error/30 text-error rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="full_name">
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
                className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* NIC Number with Validation */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="nic">
                NIC Number (ජා.හැ. අංකය)
              </label>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                value={formData.nic}
                onChange={handleChange}
                onBlur={() => handleBlur('nic')}
                placeholder="e.g. 197812345678 or 781234567V"
                className={`w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 transition outline-none ${
                  fieldErrors.nic
                    ? 'border-error focus:ring-error focus:border-error'
                    : 'border-outline-variant focus:ring-primary focus:border-primary'
                }`}
              />
              {fieldErrors.nic && (
                <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm">info</span>
                  {fieldErrors.nic}
                </span>
              )}
            </div>

            {/* Mobile Phone with +94 prefix and Validation */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="phone">
                Mobile Phone Number (දුරකථන අංකය)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md font-bold text-sm">
                  +94
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="71 234 5678"
                  className={`w-full h-11 pl-12 pr-4 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 transition outline-none ${
                    fieldErrors.phone
                      ? 'border-error focus:ring-error focus:border-error'
                      : 'border-outline-variant focus:ring-primary focus:border-primary'
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-sm">info</span>
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            {/* Two-col: District & Agrarian Services Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="district">
                  District (දිස්ත්‍රික්කය)
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                >
                  <option value="Badulla">Badulla (Bandarawela Pilot)</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Kandy">Kandy</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="division">
                  Agrarian Services Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                >
                  <option value="Bandarawela">Bandarawela</option>
                  <option value="Welimada">Welimada</option>
                  <option value="Haputale">Haputale</option>
                  <option value="Ella">Ella</option>
                  <option value="Diyatalawa">Diyatalawa</option>
                </select>
              </div>
            </div>

            {/* Two-col: GND Division & Total Land Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="gnd_division">
                  GND Division (ග්‍රාම නිලධාරී)
                </label>
                <input
                  id="gnd_division"
                  name="gnd_division"
                  type="text"
                  value={formData.gnd_division}
                  onChange={handleChange}
                  placeholder="e.g. Wewathenna"
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="land_size_acres">
                  Land Size (Acres / අක්කර)
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
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>
            </div>

            {/* Two-col: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="password">
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
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="confirm_password">
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
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-primary text-white rounded-lg font-label-md font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 press-effect shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <span>Registering Farmer...</span>
              ) : (
                <>
                  <span>Complete Farmer Registration</span>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
