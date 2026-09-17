import React, { useContext, useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

export default function Navbar() {
  const { user, role, logout } = useContext(AuthContext);
  const { lang, setLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleTitle = () => {
    const r = role?.toUpperCase();
    if (r === 'OFFICER') return `${user?.full_name || 'Officer N. Perera'}`;
    if (r === 'FARMER') return `${user?.full_name || 'Farmer Ramesh Bandara'}`;
    if (r === 'BUYER') return `${user?.business_name || user?.full_name || 'Local Buyer Partner'}`;
    if (r === 'ADMIN') return `${user?.full_name || 'System Administrator'}`;
    return user?.full_name || 'ASVANNA Stakeholder';
  };

  const getOfficeSubtitle = () => {
    const r = role?.toUpperCase();
    if (r === 'OFFICER') return t('officer_subtitle');
    if (r === 'FARMER') return t('farmer_subtitle');
    if (r === 'BUYER') return t('buyer_subtitle');
    if (r === 'ADMIN') return 'Badulla Regional Administration';
    return t('app_subtitle');
  };

  const getRoleBadge = () => {
    const r = role?.toUpperCase();
    if (r === 'OFFICER') return t('role_officer');
    if (r === 'FARMER') return t('role_farmer');
    if (r === 'BUYER') return t('role_buyer');
    if (r === 'ADMIN') return 'ADMIN';
    return t('verified');
  };

  const getRoleLinks = () => {
    const r = role?.toUpperCase();
    if (r === 'OFFICER' || r === 'ADMIN') {
      return [
        { path: '/dashboard', label: t('nav_field_overview'), icon: 'agriculture' },
        { path: '/monitoring', label: t('nav_regional_map'), icon: 'map' },
        { path: '/risk-analytics', label: t('risk_analytics'), icon: 'bar_chart' },
        { path: '/prices', label: 'Wholesale Rates', icon: 'trending_up' },
        { path: '/weather', label: 'Agro Weather', icon: 'cloud' },
        { path: '/farmers', label: t('nav_farmer_directory'), icon: 'group' },
        { path: '/marketplace', label: t('nav_surplus_marketplace'), icon: 'storefront' },
        { path: '/broadcasts', label: t('nav_advisory_broadcasts'), icon: 'campaign' },
        { path: '/settings', label: t('settings'), icon: 'settings' },
      ];
    } else if (r === 'FARMER') {
      return [
        { path: '/dashboard', label: t('nav_my_farm'), icon: 'agriculture' },
        { path: '/risk-analytics', label: t('nav_crop_advisory'), icon: 'psychology' },
        { path: '/prices', label: 'Market Prices', icon: 'trending_up' },
        { path: '/weather', label: 'Agro Weather', icon: 'cloud' },
        { path: '/marketplace', label: t('nav_sell_produce'), icon: 'storefront' },
        { path: '/history', label: t('nav_history'), icon: 'history' },
        { path: '/broadcasts', label: t('nav_officer_alerts'), icon: 'notifications_active' },
        { path: '/settings', label: t('settings'), icon: 'settings' },
      ];
    } else if (r === 'BUYER') {
      return [
        { path: '/dashboard', label: t('nav_procurement_dashboard'), icon: 'dashboard' },
        { path: '/marketplace', label: t('nav_surplus_marketplace'), icon: 'shopping_cart' },
        { path: '/prices', label: 'Wholesale Rates', icon: 'trending_up' },
        { path: '/weather', label: 'Agro Weather', icon: 'cloud' },
        { path: '/history', label: t('nav_history'), icon: 'history' },
        { path: '/settings', label: t('settings'), icon: 'settings' },
      ];
    }
    return [
      { path: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
      { path: '/marketplace', label: t('marketplace'), icon: 'shopping_cart' },
      { path: '/history', label: t('nav_history'), icon: 'history' },
    ];
  };

  const navLinks = getRoleLinks();

  return (
    <>
      <header className="sticky top-0 right-0 left-0 h-20 bg-surface-bright/95 backdrop-blur-md shadow-sm flex justify-between items-center px-4 md:px-8 z-20 border-b border-outline-variant/30 flex-shrink-0">
        {/* Title & Division Info with Mobile Menu Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl hover:bg-surface-variant transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <Link to="/dashboard" className="md:hidden flex-shrink-0">
            <img
              src="/logo.png"
              alt="ASVANNA"
              className="w-10 h-10 object-contain rounded-full shadow-sm filter drop-shadow-xs"
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-lg md:text-xl font-bold text-primary truncate">
                {getRoleTitle()}
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-secondary-container text-on-secondary-fixed flex-shrink-0">
                {getRoleBadge()}
              </span>
            </div>
            <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider truncate">
              {getOfficeSubtitle()}
            </p>
          </div>
        </div>

        {/* Right Controls: Language Switcher, Notifications, Avatar */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Language Switcher */}
          <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 border border-outline-variant text-xs shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                lang === 'en' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              EN
            </button>
            <div className="w-px h-3 bg-outline-variant mx-0.5" />
            <button
              onClick={() => setLanguage('si')}
              className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                lang === 'si' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              සිං
            </button>
            <div className="w-px h-3 bg-outline-variant mx-0.5" />
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                lang === 'ta' ? 'bg-secondary-container text-on-secondary-fixed' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              த
            </button>
          </div>

          {/* Notifications Icon with Badge */}
          <div 
            className="relative cursor-pointer hover:scale-105 transition-transform p-1"
            onClick={() => navigate('/broadcasts')}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[26px]">
              notifications
            </span>
          </div>

          {/* Avatar with Ring */}
          <div className="flex items-center gap-2">
            <div 
              className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold overflow-hidden ring-2 ring-primary ring-offset-2 shadow-sm cursor-pointer hover:ring-secondary transition-all"
              onClick={() => navigate('/settings')}
            >
              {user?.photo ? (
                <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center text-xs text-on-surface-variant hover:text-error transition ml-1 cursor-pointer"
              title={t('logout')}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-surface-container-low border-r border-outline-variant shadow-2xl z-10 animate-slideRight">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="ASVANNA"
                  className="w-10 h-10 object-contain rounded-full shadow-md"
                />
                <div>
                  <h1 className="font-headline text-base font-extrabold text-primary leading-none">ASVANNA</h1>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mt-1">
                    Bandarawela Division
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* User Profile Card */}
            <div className="px-5 py-4 bg-surface-container-lowest/60 border-b border-outline-variant/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate">{user?.full_name || 'Stakeholder'}</p>
                <span className="inline-block px-1.5 py-0.5 bg-secondary-container text-on-secondary-fixed rounded text-[9px] font-extrabold uppercase">
                  {getRoleBadge()}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined mr-3 text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant/40 space-y-2 bg-surface-container-lowest/40">
              <a
                href="tel:1920"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-2.5 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-variant transition w-full text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg text-outline">help</span>
                <span>{t('help_center')}</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-error hover:bg-error-container/20 transition w-full text-left"
              >
                <span className="material-symbols-outlined mr-3 text-lg">logout</span>
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
