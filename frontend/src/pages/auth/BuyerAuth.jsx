import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';

export default function BuyerAuth() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { lang, setLanguage } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'Wholesaler',
    full_name: '',
    phone: '',
    nic: '',
    district: 'Badulla',
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
      full_name: formData.full_name || formData.business_name,
      business_name: formData.business_name,
      business_type: formData.business_type,
      phone: formData.phone,
      nic: formData.nic,
      district: formData.district,
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
          {/* Header */}
          <header className="mb-6">
            <Link to="/" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline mb-4 transition group">
              <span className="material-symbols-outlined mr-1 text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to Role Selection
            </Link>
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

            {/* Contact Person Name */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="full_name">
                Contact Person Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Samantha Gunaratne"
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* Mobile Phone Number */}
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
                placeholder="e.g. 0572222222 or 0771234567"
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
            </div>

            {/* BR Number or NIC */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor="nic">
                Business Reg. (BR) or Owner NIC
              </label>
              <input
                id="nic"
                name="nic"
                type="text"
                required
                value={formData.nic}
                onChange={handleChange}
                placeholder="e.g. PV-88341 or 198012345678"
                className="w-full h-12 px-4 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none"
              />
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
