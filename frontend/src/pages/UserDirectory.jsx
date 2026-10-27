import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import AddOfficerModal from '../components/AddOfficerModal';
import {
  Users,
  UserPlus,
  Shield,
  ShoppingBag,
  ShieldAlert,
  Search,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';

export default function UserDirectory() {
  const { user: currentUser } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ officers: 0, buyers: 0, admins: 0, total: 0 });
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'OFFICER' | 'BUYER' | 'ADMIN'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await API.get('/officer/other-users', { params });
      if (res.data?.data) {
        setUsers(res.data.data.users || []);
        if (res.data.data.counts) {
          setCounts(res.data.data.counts);
        }
      }
    } catch (err) {
      console.error('Error fetching other users:', err);
      showToast('Error loading user directory: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleteLoading(true);
    try {
      const res = await API.delete(`/officer/users/${deleteConfirmUser.id}`);
      showToast(res.data?.message || 'User account successfully removed.');
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error removing user:', err);
      showToast('Failed to remove user: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term)) ||
      (u.nic && u.nic.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.division && u.division.toLowerCase().includes(term)) ||
      (u.business_name && u.business_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-high border border-outline-variant shadow-xl rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-on-surface">{toast}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-primary">
              Stakeholder & Staff Directory
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            System administration for Agricultural Officers, Commercial Buyers, and System Administrators
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition hover:shadow-lg cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Officer / Admin</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Officers Card */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'OFFICER' ? 'ALL' : 'OFFICER')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'OFFICER'
              ? 'bg-blue-500/10 border-blue-500/60 shadow-md ring-2 ring-blue-500/30'
              : 'bg-surface-container-lowest border-outline-variant/50 hover:border-blue-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Divisional Officers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-headline">{counts.officers}</span>
            <span className="text-xs text-blue-600 font-bold">Extension Staff</span>
          </div>
        </div>

        {/* Buyers Card */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'BUYER' ? 'ALL' : 'BUYER')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'BUYER'
              ? 'bg-emerald-500/10 border-emerald-500/60 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-surface-container-lowest border-outline-variant/50 hover:border-emerald-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Commercial Buyers</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-headline">{counts.buyers}</span>
            <span className="text-xs text-emerald-600 font-bold">Market Partners</span>
          </div>
        </div>

        {/* Admins Card */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? 'ALL' : 'ADMIN')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ADMIN'
              ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-2 ring-amber-500/30'
              : 'bg-surface-container-lowest border-outline-variant/50 hover:border-amber-500/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">System Admins</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-headline">{counts.admins}</span>
            <span className="text-xs text-amber-600 font-bold">Full Access</span>
          </div>
        </div>

        {/* Total Stakeholders Card */}
        <div
          onClick={() => setRoleFilter('ALL')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === 'ALL'
              ? 'bg-primary/10 border-primary/60 shadow-md ring-2 ring-primary/30'
              : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Users</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-on-surface font-headline">{counts.total}</span>
            <span className="text-xs text-on-surface-variant font-bold">All Accounts</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/40">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: 'ALL', label: 'All Users', count: counts.total },
            { id: 'OFFICER', label: 'Divisional Officers', count: counts.officers },
            { id: 'BUYER', label: 'Buyers', count: counts.buyers },
            { id: 'ADMIN', label: 'Administrators', count: counts.admins }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                roleFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                roleFilter === tab.id ? 'bg-white/20 text-white' : 'bg-surface-variant text-on-surface-variant'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 md:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, NIC..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-hidden focus:border-primary transition"
          />
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); fetchUsers(); }}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* User Directory List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-on-surface-variant">Loading user directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 text-center space-y-3">
          <Users className="w-12 h-12 text-on-surface-variant/40" />
          <h3 className="font-headline font-bold text-lg text-on-surface">No users found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            {searchTerm
              ? `No user records matching "${searchTerm}". Try a different search query.`
              : `No users registered under the ${roleFilter} category.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((item) => {
            const isOfficer = item.role === 'OFFICER';
            const isAdmin = item.role === 'ADMIN';
            const isBuyer = item.role === 'BUYER';
            const isSelf = currentUser && currentUser.id === item.id;

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Avatar, Name, Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-xs ${
                        isAdmin
                          ? 'bg-amber-500 text-white'
                          : isOfficer
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {item.full_name ? item.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-sm text-on-surface leading-tight">
                          {item.full_name || 'Stakeholder'}
                        </h3>
                        {item.business_name && (
                          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.business_name}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          ID: #{item.id}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                      isAdmin
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        : isOfficer
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    }`}>
                      {isAdmin ? '👑 ADMIN' : isOfficer ? '🛡️ OFFICER' : '🛒 BUYER'}
                    </span>
                  </div>

                  {/* Details Card */}
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 space-y-2 text-xs">
                    {/* Phone */}
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a href={`tel:${item.phone}`} className="hover:text-primary transition font-medium">
                        {item.phone || 'N/A'}
                      </a>
                    </div>

                    {/* NIC */}
                    {item.nic && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <CreditCard className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <span className="font-mono">{item.nic}</span>
                      </div>
                    )}

                    {/* Email */}
                    {item.email && (
                      <div className="flex items-center gap-2 text-on-surface-variant truncate">
                        <Mail className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                        <span className="truncate">{item.email}</span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <MapPin className="w-3.5 h-3.5 text-error shrink-0" />
                      <span>{item.division || 'Bandarawela'}, {item.district || 'Badulla'}</span>
                    </div>

                    {/* Joined date */}
                    <div className="flex items-center gap-2 text-on-surface-variant/70 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Joined {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active Account</span>
                  </span>

                  {/* Remove Button */}
                  {isSelf ? (
                    <span className="text-[10px] text-on-surface-variant font-bold px-2 py-1 bg-surface-variant rounded-md">
                      Current User
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmUser(item)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-error hover:bg-error/10 border border-error/20 hover:border-error/40 transition flex items-center gap-1 cursor-pointer"
                      title={`Remove ${item.role}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <div className="p-3 bg-error/10 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">Confirm User Removal</h3>
                <p className="text-xs text-on-surface-variant">Permanent administrative action</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-on-surface">{deleteConfirmUser.full_name}</strong> ({deleteConfirmUser.role}) from the system?
              This will revoke all administrative access and credentials immediately.
            </p>

            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1 text-xs">
              <div><strong className="text-on-surface-variant">Phone:</strong> {deleteConfirmUser.phone}</div>
              {deleteConfirmUser.nic && <div><strong className="text-on-surface-variant">NIC:</strong> {deleteConfirmUser.nic}</div>}
              <div><strong className="text-on-surface-variant">Role:</strong> {deleteConfirmUser.role}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-error text-white hover:bg-error/90 shadow-md shadow-error/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <span className="animate-spin text-xs">⏳</span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Remove Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Officer / Admin Modal */}
      <AddOfficerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={() => {
          showToast('✅ New administrative user successfully provisioned!');
          fetchUsers();
        }}
      />
    </div>
  );
}
