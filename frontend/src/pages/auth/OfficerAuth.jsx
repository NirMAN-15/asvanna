import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

export default function OfficerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      employee_id: formData.employee_id || `AGR-${formData.nic.slice(-4)}`,
      nic: formData.nic,
      email: formData.email,
      district: formData.district,
      division: formData.division,
      phone: formData.phone,
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
    <div className="text-on-surface min-h-screen flex flex-col bg-surface-container-low font-body-md">
      {/* Top Navigation Anchor (Stitch Design) */}
      <header className="bg-surface-bright shadow-sm h-20 w-full z-50 sticky top-0 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="ASVANNA" className="w-9 h-9 rounded-full shadow-sm" />
              <span className="font-headline text-headline-md font-extrabold text-primary group-hover:opacity-90 transition">
                ASVANNA
              </span>
            </Link>
            <div className="h-6 w-px bg-outline-variant hidden md:block" />
            <span className="text-label-md font-label-md text-on-surface-variant hidden md:block tracking-widest uppercase font-semibold">
              Officer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-label-md font-label-md text-primary hover:underline font-bold px-3 py-1.5"
            >
              Sign In
            </Link>
            <div className="flex items-center bg-white rounded-full px-2 py-1 border border-outline-variant/50 shadow-sm">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('si')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
                }`}
              >
                සිං
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                  lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant'
                }`}
              >
                த
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center py-12 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        {/* Atmospheric Background Glows */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[80px] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10">
          {/* Header Section */}
          <div className="mb-8 text-center md:text-left">
            <Link to="/" className="inline-flex items-center text-primary text-sm font-semibold hover:underline mb-2 gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Role Selection
            </Link>
            <h1 className="font-headline text-headline-lg text-primary mb-2 font-bold">
              Divisional Officer Registration
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Complete the administrative onboarding to access the ASVANNA Agricultural Management suite.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-2xl overflow-hidden border-t-4 border-secondary/60 shadow-card border border-outline-variant/30 p-6 md:p-10"
          >
            {error && (
              <div className="p-3 mb-6 bg-error-container/20 border border-error/30 text-error rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="full_name">
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
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* Official Designation */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="designation">
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
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="employee_id">
                  Official Employee ID
                </label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. DO-BAD-2024"
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* NIC Number */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="nic">
                  NIC Number
                </label>
                <input
                  id="nic"
                  name="nic"
                  type="text"
                  required
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g. 198512345678"
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="district">
                  District
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                >
                  <option value="Badulla">Badulla (Upcountry Pilot)</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Matale">Matale</option>
                  <option value="Monaragala">Monaragala</option>
                </select>
              </div>

              {/* Agrarian Services Division */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="division">
                  Agrarian Services Division
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                >
                  <option value="Bandarawela">Bandarawela</option>
                  <option value="Welimada">Welimada</option>
                  <option value="Haputale">Haputale</option>
                  <option value="Ella">Ella</option>
                  <option value="Diyatalawa">Diyatalawa</option>
                  <option value="Haliela">Haliela</option>
                </select>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="phone">
                  Mobile Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="email">
                  Official Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. officer@agrarian.gov.lk"
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="password">
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
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant block font-semibold" htmlFor="confirm_password">
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
                  className="w-full h-12 px-4 bg-surface-bright border border-outline-variant/70 rounded-lg text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              </div>
            </div>

            {/* Official Confirmation Checkbox */}
            <div className="mt-8 pt-6 border-t border-outline-variant/30 flex items-start gap-3">
              <input
                id="officer_confirmation"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="officer_confirmation" className="text-body-sm text-on-surface-variant cursor-pointer select-none">
                I hereby declare that I am an authorized officer under the Department of Agrarian Development, Sri Lanka, authorized to log regional cultivation records.
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/login" className="text-primary font-bold text-sm hover:underline">
                Already registered? Sign in here
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 h-12 bg-primary text-white rounded-lg font-label-md font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 press-effect shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
