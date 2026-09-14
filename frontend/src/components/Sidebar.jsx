import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

export default function Sidebar() {
  const { user, role, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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

  const links = getRoleLinks();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 bg-surface-container-low border-r border-outline-variant z-30 select-none">
      {/* Brand Header with Project Logo */}
      <div className="px-5 py-5 border-b border-outline-variant/30">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="ASVANNA Logo"
            className="w-11 h-11 object-contain rounded-full shadow-md filter drop-shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-headline text-lg font-extrabold text-primary leading-none tracking-tight">ASVANNA</h1>
              <span className="text-[10px] font-bold text-secondary bg-secondary-container/60 px-1.5 py-0.2 rounded">SL</span>
            </div>
            <p className="text-on-surface-variant text-[11px] font-semibold tracking-wider uppercase mt-1 truncate">
              Agri Intelligence
            </p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl font-label-md text-label-md transition-all duration-150 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-fixed font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined mr-3 text-xl ${
                    isActive ? 'icon-fill text-primary' : 'text-outline'
                  }`}
                >
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Support & Sign Out */}
      <div className="p-4 border-t border-outline-variant/30 space-y-1 bg-surface-container-lowest/50">
        <a
          href="tel:1920"
          className="text-on-surface-variant flex items-center px-4 py-2.5 hover:bg-surface-variant transition rounded-xl w-full text-left font-medium text-sm"
        >
          <span className="material-symbols-outlined mr-3 text-xl text-outline">help</span>
          <span className="font-label-md">{t('help_center')}</span>
        </a>

        <button
          onClick={handleLogout}
          className="text-error hover:bg-error-container/20 flex items-center px-4 py-2.5 transition rounded-xl w-full text-left font-semibold text-sm"
        >
          <span className="material-symbols-outlined mr-3 text-xl">logout</span>
          <span className="font-label-md">{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
