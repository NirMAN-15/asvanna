import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { validateNIC, validatePhone } from '../../utils/validation';
import officerHeroBg from '../../assets/register-officer-bg.jpg';

export default function OfficerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    designation: 'Divisional Agrarian Officer',
    employee_id: '',
    nic: '',
    email: '',
    district: 'Badulla',
    division: 'Bandarawela',
    phone: '',
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
      const res = validatePhone(formData.phone);
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

    // Phone Validation
    const phoneRes = validatePhone(formData.phone);
    if (!phoneRes.isValid) {
      setFieldErrors((prev) => ({ ...prev, phone: phoneRes.message }));
      setError(phoneRes.message);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('Please acknowledge authorization under the Department of Agrarian Development.');
      return;
    }

    setLoading(true);
    const payload = {
      full_name: formData.full_name,
      employee_id: formData.employee_id || `AGR-${nicRes.clean.slice(-4)}`,
      nic: nicRes.clean,
      email: formData.email,
      district: formData.district,
      division: formData.division,
      phone: phoneRes.clean,
      password: formData.password,
    };

    const res = await register(payload, 'OFFICER');
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
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
              backgroundImage: `url(${officerHeroBg})`,
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
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span>Official Cadre Verification Portal</span>
              </div>
              <h1 className="font-headline text-headline-md lg:text-headline-lg text-white mb-3 font-bold leading-tight drop-shadow-md">
                Empowering Agrarian Governance with Real-Time Field Intelligence.
              </h1>
              <p className="font-body-md lg:font-body-lg text-primary-fixed-dim leading-relaxed">
                Coordinate regional cultivation quotas, monitor crop saturation heatmaps, and assist upcountry farming communities across Badulla and Bandarawela.
              </p>
            </div>

            <div className="flex items-center gap-6 text-on-primary">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Admin Division</span>
                <span className="font-headline text-headline-sm lg:text-headline-md font-bold text-white">Bandarawela & Badulla Pilot</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Data Coverage</span>
                <span className="font-headline text-headline-sm lg:text-headline-md font-bold text-white">100% Agrarian Divisions</span>
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
              Divisional Officer Registration
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Complete the administrative onboarding to access the ASVANNA Agricultural Management suite.
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
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Nimal Jayawardena"
                className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Two-col: Official Designation & Employee ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="designation">
                  Official Designation
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Divisional Agrarian Officer"
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="employee_id">
                  Official Employee ID
                </label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. DO-BAD-2024"
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>
            </div>

            {/* NIC Number with Validation */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="nic">
                NIC Number (National Identity Card)
              </label>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                value={formData.nic}
                onChange={handleChange}
                onBlur={() => handleBlur('nic')}
                placeholder="e.g. 198512345678 or 851234567V"
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

            {/* Two-col: District & Agrarian Services Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="district">
                  District
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                >
                  <option value="Badulla">Badulla (Upcountry Pilot)</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Matale">Matale</option>
                  <option value="Monaragala">Monaragala</option>
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
                  <option value="Haliela">Haliela</option>
                </select>
              </div>
            </div>

            {/* Two-col: Mobile Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="phone">
                  Mobile Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="e.g. 0771234567"
                  className={`w-full h-11 px-4 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 transition outline-none ${
                    fieldErrors.phone
                      ? 'border-error focus:ring-error focus:border-error'
                      : 'border-outline-variant focus:ring-primary focus:border-primary'
                  }`}
                />
                {fieldErrors.phone && (
                  <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="email">
                  Official Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. officer@agrarian.gov.lk"
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

            {/* Declaration Checkbox */}
            <div className="pt-2 flex items-start gap-3">
              <input
                id="officer_confirmation"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-1 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="officer_confirmation" className="text-body-sm text-on-surface-variant cursor-pointer select-none leading-relaxed">
                I hereby declare that I am an authorized officer under the Department of Agrarian Development, Sri Lanka, authorized to log regional cultivation records.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-primary text-white rounded-lg font-label-md font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 press-effect shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <span>Registering Officer...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
