import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import { validatePhone, validateBuyerNicOrBr } from '../../utils/validation';

export default function BuyerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'Wholesaler',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    nic: '',
    district: 'Badulla',
    address_line1: '',
    address_line2: '',
    city: 'Bandarawela',
    postal_code: '90100',
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
    if (field === 'phone' && formData.phone) {
      const res = validatePhone(formData.phone, true);
      setFieldErrors((prev) => ({ ...prev, phone: res.isValid ? '' : res.message }));
    } else if (field === 'nic' && formData.nic) {
      const res = validateBuyerNicOrBr(formData.nic);
      setFieldErrors((prev) => ({ ...prev, nic: res.isValid ? '' : res.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone Validation
    const phoneRes = validatePhone(formData.phone, true);
    if (!phoneRes.isValid) {
      setFieldErrors((prev) => ({ ...prev, phone: phoneRes.message }));
      setError(phoneRes.message);
      return;
    }

    // BR or NIC Validation
    const nicRes = validateBuyerNicOrBr(formData.nic);
    if (!nicRes.isValid) {
      setFieldErrors((prev) => ({ ...prev, nic: nicRes.message }));
      setError(nicRes.message);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const payload = {
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name.trim() || null,
      last_name: formData.last_name.trim(),
      business_name: formData.business_name,
      business_type: formData.business_type,
      phone: phoneRes.clean,
      nic: nicRes.clean,
      district: formData.district,
      address_line1: formData.address_line1.trim(),
      address_line2: formData.address_line2.trim() || null,
      city: formData.city.trim() || 'Bandarawela',
      postal_code: formData.postal_code.trim() || '90100',
      password: formData.password,
    };

    const res = await register(payload, 'BUYER');
    setLoading(false);

    if (res.success) {
      navigate('/marketplace');
    } else {
      setError(res.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface font-body-md text-on-surface">
      {/* Left Side: Hero Image (Stitch Design) */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 h-screen sticky top-0 bg-primary overflow-hidden">
        <div className="relative w-full h-full">
          {/* High-res background image */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50 transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNk1wX2H-y8LO9hhNsxoJOL6gustwoKeAt6tmhDtLh7nJ395qPdmChA6Q4aNRugaWxSodwTMXLOHOu7ZN2hkwF3yFF5j650sMgTzullF9wgMpRNldAb3VS_TA2QcwRyej74ZRFjpnfgr-RLZ8yk9tFBI4Lm1qNRer3uuLYaah4KqgurH6DXATzKY57Pt_fmFZX5JW75MMaZxJEe8vgCseG2KPOgaQ7zpMVpSp1leZ9oJhHCZ0XgBUoSw')`,
            }}
          />
          {/* Branding Content Overlay */}
          <div className="absolute inset-0 p-xl flex flex-col justify-between z-10">
            <Link to="/" className="inline-flex items-center mb-md transition hover:opacity-90">
              <img
                alt="ASVANNA Logo"
                className="w-20 h-20 object-contain rounded-full shadow-lg filter drop-shadow-lg"
                src="/logo.png"
              />
            </Link>

            <div className="max-w-lg mb-8">
              <h2 className="font-headline text-headline-lg text-white mb-4 font-bold leading-tight drop-shadow-md">
                Empowering Local Markets with Fresh Field Data.
              </h2>
              <p className="font-body-lg text-body-lg text-primary-fixed-dim leading-relaxed">
                Join a network of professional buyers connecting directly with sustainable growers. Register today to access real-time supply chain analytics and premium produce within a 5 km direct-trade radius.
              </p>
            </div>

            <div className="flex items-center gap-6 text-on-primary">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Network Status</span>
                <span className="font-headline text-headline-md font-bold text-white">500+ Local Businesses</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">Pilot Zone</span>
                <span className="font-headline text-headline-md font-bold text-white">Bandarawela & Badulla</span>
              </div>
            </div>
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <main className="w-full md:w-1/2 lg:w-2/5 min-h-screen flex flex-col justify-center items-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md mx-auto">
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
            <h2 className="font-headline text-headline-lg text-primary font-bold mb-1">Become a Local Buyer</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Fill in your business details to start direct farm sourcing.
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
            {/* Business Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="business_name">
                Business Name
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g. Green Leaf Hotel & Catering"
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Buyer Category */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="business_type">
                Buyer Category
              </label>
              <select
                id="business_type"
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              >
                <option value="Wholesaler">Wholesaler / Distributor</option>
                <option value="Retailer">Retail Grocery Store</option>
                <option value="Caterer">Restaurant & Catering</option>
                <option value="Processor">Agro-Food Processor</option>
                <option value="Hotel">Hotel / Resort Kitchen</option>
              </select>
            </div>

            {/* First Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="first_name">
                {lang === 'si' ? 'First Name (මුල් නම)' : lang === 'ta' ? 'First Name (முதல் பெயர்)' : 'First Name'} <span className="text-error">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder={lang === 'si' ? 'උදා. සමන්ත' : 'e.g. Samantha'}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Middle Name (Optional) */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="middle_name">
                {lang === 'si' ? 'Middle Name (මැද නම - අත්‍යවශ්‍ය නොවේ)' : lang === 'ta' ? 'Middle Name (இடைப் பெயர் - விருப்பமானது)' : 'Middle Name (Optional)'}
              </label>
              <input
                id="middle_name"
                name="middle_name"
                type="text"
                value={formData.middle_name}
                onChange={handleChange}
                placeholder={lang === 'si' ? 'උදා. කුමාර' : 'e.g. Kumara'}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="last_name">
                {lang === 'si' ? 'Last Name (වාසගම / අවසාන නම)' : lang === 'ta' ? 'Last Name (கடைසිப் பெயர்)' : 'Last Name'} <span className="text-error">*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder={lang === 'si' ? 'උදා. ගුණරත්න' : 'e.g. Gunaratne'}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Mobile Phone Number */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="phone">
                  Mobile Phone Number
                </label>
                <span className="text-xs text-on-surface-variant">07XXXXXXXX or 05XXXXXXXX</span>
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="e.g. 0572222222 or 0771234567"
                className={`w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none ${
                  fieldErrors.phone ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                }`}
              />
              {fieldErrors.phone && (
                <span className="text-xs text-error font-medium">{fieldErrors.phone}</span>
              )}
            </div>

            {/* BR Number or NIC */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="nic">
                  Business Reg. (BR) or Owner NIC
                </label>
                <span className="text-xs text-on-surface-variant">12 digits, 9+V, or BR (PV-XXXX)</span>
              </div>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                value={formData.nic}
                onChange={handleChange}
                onBlur={() => handleBlur('nic')}
                placeholder="e.g. PV-88341 or 198012345678"
                className={`w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none ${
                  fieldErrors.nic ? 'border-error ring-1 ring-error' : 'border-outline-variant'
                }`}
              />
              {fieldErrors.nic && (
                <span className="text-xs text-error font-medium">{fieldErrors.nic}</span>
              )}
            </div>

            {/* Operating District */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="district">
                Primary Purchasing District
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              >
                <option value="Badulla">Badulla (Bandarawela Pilot)</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Kandy">Kandy</option>
                <option value="Colombo">Colombo (Western Distribution)</option>
              </select>
            </div>

            {/* Address Line 1 */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="address_line1">
                {lang === 'si' ? 'ලිපිනය - 1 වන පේළිය (Address Line 1)' : lang === 'ta' ? 'முகவரி வரி 1 (Address Line 1)' : 'Address Line 1'} <span className="text-error">*</span>
              </label>
              <input
                id="address_line1"
                name="address_line1"
                type="text"
                required
                value={formData.address_line1}
                onChange={handleChange}
                placeholder={lang === 'si' ? 'උදා. අංක 8, වැලිමඩ පාර' : 'e.g. No. 8, Welimada Road'}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Address Line 2 */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="address_line2">
                {lang === 'si' ? 'ලිපිනය - 2 වන පේළිය (Address Line 2 - අත්‍යවශ්‍ය නොවේ)' : lang === 'ta' ? 'முகவரி வரி 2 (விருப்பமானது)' : 'Address Line 2 (Optional)'}
              </label>
              <input
                id="address_line2"
                name="address_line2"
                type="text"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder={lang === 'si' ? 'උදා. නගර මධ්‍යය' : 'e.g. Town Centre'}
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Two-col: City & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="city">
                  {lang === 'si' ? 'නගරය (City)' : lang === 'ta' ? 'நகரம் (City)' : 'City'} <span className="text-error">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={lang === 'si' ? 'උදා. බණ්ඩාරවෙල' : 'e.g. Bandarawela'}
                  className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="postal_code">
                  {lang === 'si' ? 'තැපැල් අංකය (Postal Code)' : lang === 'ta' ? 'அஞ்சல் குறியீடு (Postal Code)' : 'Postal Code'} <span className="text-error">*</span>
                </label>
                <input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  required
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="90100"
                  className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
                />
              </div>
            </div>

            {/* Password */}
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
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Confirm Password */}
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
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-secondary text-white rounded-lg font-label-md font-bold hover:bg-secondary/90 transition flex items-center justify-center gap-2 press-effect shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <span>Registering Buyer...</span>
              ) : (
                <>
                  <span>Register as Buyer</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
