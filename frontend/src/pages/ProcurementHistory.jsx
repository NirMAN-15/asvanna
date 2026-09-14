import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function ProcurementHistory() {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/marketplace/orders');
      if (res.data?.data && res.data.data.length > 0) {
        setOrders(res.data.data);
      } else {
        // Check local storage for recent orders placed in session
        const localSaved = localStorage.getItem('asvanna_recent_orders');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setOrders([...parsed]);
          } catch (e) {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      }
    } catch (err) {
      // Fallback
      const localSaved = localStorage.getItem('asvanna_recent_orders');
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          setOrders([...parsed]);
        } catch (e) {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.farmer_name?.toLowerCase().includes(q) ||
      order.crop_name?.toLowerCase().includes(q) ||
      order.order_code?.toLowerCase().includes(q) ||
      order.farmer_location?.toLowerCase().includes(q);

    const matchesCrop =
      selectedCropFilter === 'All' ||
      order.crop_key?.toLowerCase() === selectedCropFilter.toLowerCase() ||
      order.crop_name?.toLowerCase().includes(selectedCropFilter.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      order.status?.toUpperCase() === selectedStatusFilter.toUpperCase();

    return matchesSearch && matchesCrop && matchesStatus;
  });

  // Calculate Metrics
  const totalKilos = orders.reduce((sum, item) => sum + (Number(item.quantity_kg || item.requested_quantity_kg) || 0), 0);
  const totalSpend = orders.reduce((sum, item) => sum + (Number(item.total_price) || (Number(item.quantity_kg || item.requested_quantity_kg) * Number(item.price_per_kg || item.offered_price_per_kg)) || 0), 0);
  const uniqueFarmersCount = new Set(orders.map((o) => o.farmer_name)).size;
  const completedCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;

  const popularCrops = ['All', 'Carrot', 'Leeks', 'Onion', 'Chili', 'Paddy', 'Potato'];

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'DELIVERED').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-fixed border border-secondary/20">
          <span className="material-symbols-outlined text-xs icon-fill">check_circle</span>
          <span>{t('status_delivered') || 'DELIVERED'}</span>
        </span>
      );
    }
    if (s === 'IN_TRANSIT' || s === 'IN TRANSIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="material-symbols-outlined text-xs">local_shipping</span>
          <span>{t('status_in_transit') || 'IN TRANSIT'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant">
        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
        <span>{t('status_pending') || 'PENDING'}</span>
      </span>
    );
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-6 font-body-md text-on-surface animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">history</span>
            <h1 className="font-headline text-headline-lg font-bold text-primary">
              {t('history_page_title') || 'Procurement & Purchase History'}
            </h1>
          </div>
          <p className="text-on-surface-variant font-body-md mt-1">
            {t('history_page_subtitle') ||
              'Direct farm purchases, delivery receipts, prices, and smallholder farmer records across Bandarawela'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant hover:text-primary transition shadow-sm"
            title="Print or export current procurement log"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>{t('print_receipt') || 'Print / Export'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Kilos Procured */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-primary shadow-card border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
              {t('stat_total_procured_kg') || 'Total Crops Procured'}
            </span>
            <p className="font-headline text-2xl sm:text-3xl font-extrabold text-primary mt-1">
              {totalKilos.toLocaleString()} kg
            </p>
            <p className="text-[11px] text-secondary font-semibold mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">scale</span>
              <span>Across all received batches</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">eco</span>
          </div>
        </div>

        {/* Total Spend */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-secondary shadow-card border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
              {t('stat_total_spend') || 'Total Spend'}
            </span>
            <p className="font-headline text-2xl sm:text-3xl font-extrabold text-secondary mt-1">
              LKR {totalSpend.toLocaleString()}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary">payments</span>
              <span>Direct farmer farm-gate payouts</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        {/* Completed Transactions */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-primary-container shadow-card border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
              {t('stat_completed_orders') || 'Completed Orders'}
            </span>
            <p className="font-headline text-2xl sm:text-3xl font-extrabold text-primary-container mt-1">
              {completedCount} Orders
            </p>
            <p className="text-[11px] text-secondary font-semibold mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs icon-fill">verified</span>
              <span>100% Quality inspected</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
        </div>

        {/* Farmers Supported */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-emerald-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
              {t('stat_farmers_supported') || 'Farmers Supported'}
            </span>
            <p className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {uniqueFarmersCount} Farmers
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-600">group</span>
              <span>Bandarawela & Upcountry zone</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">person_pin</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-card p-5 border border-outline-variant/30 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_history_placeholder') || 'Search farmer, crop, or order code...'}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-base">filter_list</span>
              <span>Status:</span>
            </span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Popular Crop Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
          <span className="text-xs font-bold text-on-surface-variant mr-1">Filter Crop:</span>
          {popularCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCropFilter(crop)}
              className={`px-3 py-1 rounded-full font-label-md text-xs font-semibold transition-all press-effect ${
                selectedCropFilter === crop
                  ? 'bg-secondary-container text-on-secondary-fixed border border-secondary font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/60 hover:bg-secondary-container/50'
              }`}
            >
              {crop === 'All' ? t('filter_all_crops') || 'All Crops' : crop}
            </button>
          ))}
        </div>
      </section>

      {/* Main History Table */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
            <p className="mt-2 text-sm font-medium">Loading procurement records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-5xl text-outline">history_toggle_off</span>
            <p className="font-semibold text-base">
              {t('no_history_records') || 'No procurement history records found.'}
            </p>
            <p className="text-xs text-outline max-w-sm mx-auto">
              Try adjusting your search query or crop filter to see past purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t('th_date_received') || 'When Received'}</th>
                  <th className="py-3.5 px-4">{t('th_crop_produce') || 'Crop Produce'}</th>
                  <th className="py-3.5 px-4">{t('th_farmer_seller') || 'Farmer (Seller)'}</th>
                  <th className="py-3.5 px-4">{t('th_quantity_kg') || 'How Much (Kilos)'}</th>
                  <th className="py-3.5 px-4">{t('th_price_breakdown') || 'Price'}</th>
                  <th className="py-3.5 px-4">{t('th_status') || 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{t('th_actions') || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {filteredOrders.map((order) => {
                  const qty = Number(order.quantity_kg || order.requested_quantity_kg) || 0;
                  const unitPrice = Number(order.price_per_kg || order.offered_price_per_kg) || 0;
                  const total = Number(order.total_price) || qty * unitPrice;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-low/60 transition-colors group"
                    >
                      {/* 1. When they got the crops (Date & Time) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface text-xs sm:text-sm">
                              {formatDate(order.date_received || order.created_at)}
                            </p>
                            <span className="text-[10px] text-outline font-mono">
                              {order.order_code || `ORD-${order.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Crop Produce */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-secondary-container/40 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-base flex-shrink-0">
                            🌾
                          </div>
                          <div>
                            <p className="font-bold text-primary font-headline">
                              {order.crop_name || 'Upcountry Crop'}
                            </p>
                            {order.badge && (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                                {order.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Who was the farmer that sells the crop */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-secondary text-base">
                              account_circle
                            </span>
                            <span className="font-bold text-on-surface">
                              {order.farmer_name || 'Local Smallholder Farmer'}
                            </span>
                          </div>
                          {order.farmer_phone && (
                            <p className="text-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-outline">call</span>
                              <span className="font-mono">{order.farmer_phone}</span>
                            </p>
                          )}
                          {order.farmer_location && (
                            <p className="text-[11px] text-outline flex items-center gap-1 truncate max-w-xs">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              <span>{order.farmer_location}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. How much kilos (Quantity in kg) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container font-extrabold text-primary text-sm sm:text-base border border-outline-variant/40">
                          <span className="material-symbols-outlined text-base text-secondary">
                            scale
                          </span>
                          <span>{qty.toLocaleString()} kg</span>
                        </div>
                      </td>

                      {/* 4. How much was the price (Price per kg & Total price) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-extrabold text-secondary font-headline text-base">
                            LKR {total.toLocaleString()}
                          </p>
                          <p className="text-xs text-on-surface-variant font-medium">
                            LKR {unitPrice} / kg
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedReceipt(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition shadow-xs press-effect"
                        >
                          <span className="material-symbols-outlined text-sm">receipt</span>
                          <span>{t('view_receipt') || 'Receipt'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detailed Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full border border-outline-variant shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 relative">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary-container">receipt_long</span>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-container">
                  ASVANNA SL • Agri Procurement
                </span>
              </div>
              <h2 className="font-headline text-2xl font-bold">
                {t('receipt_title') || 'Crop Procurement Receipt'}
              </h2>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                {selectedReceipt.order_code || `ORD-${selectedReceipt.id}`}
              </p>
            </div>

            {/* Receipt Content */}
            <div className="p-6 space-y-4 font-body-md text-sm">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 bg-secondary-container/40 rounded-xl border border-secondary/20">
                <span className="text-xs font-bold text-on-secondary-fixed">Procurement Status:</span>
                {getStatusBadge(selectedReceipt.status)}
              </div>

              {/* Farmer & Buyer Details */}
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-outline-variant/30 text-xs">
                <div>
                  <span className="text-outline uppercase font-bold text-[10px] block">
                    {t('th_farmer_seller') || 'Farmer (Seller)'}
                  </span>
                  <p className="font-bold text-on-surface text-sm mt-0.5">
                    {selectedReceipt.farmer_name || 'Sunil Shantha'}
                  </p>
                  <p className="text-on-surface-variant font-mono">{selectedReceipt.farmer_phone}</p>
                  <p className="text-[11px] text-outline">{selectedReceipt.farmer_location}</p>
                </div>
                <div>
                  <span className="text-outline uppercase font-bold text-[10px] block">
                    Procured By (Buyer)
                  </span>
                  <p className="font-bold text-on-surface text-sm mt-0.5">
                    {selectedReceipt.buyer_name || user?.full_name || 'Miyuni Dewanga'}
                  </p>
                  <p className="text-on-surface-variant font-mono">{user?.phone || '0741699017'}</p>
                  <p className="text-[11px] text-outline">Bandarawela Division</p>
                </div>
              </div>

              {/* Crop & Price Calculations */}
              <div className="space-y-2.5 py-1">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Crop Produce:</span>
                  <span className="font-bold text-primary font-headline text-base">
                    {selectedReceipt.crop_name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">
                    {t('date_and_time') || 'Procurement Date & Time'}:
                  </span>
                  <span className="font-semibold text-on-surface text-xs">
                    {formatDate(selectedReceipt.date_received || selectedReceipt.created_at)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">
                    {t('th_quantity_kg') || 'Quantity (Weight)'}:
                  </span>
                  <span className="font-bold text-on-surface text-base">
                    {(Number(selectedReceipt.quantity_kg || selectedReceipt.requested_quantity_kg) || 0).toLocaleString()} kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">
                    {t('price_per_kg_label') || 'Price per Kilo'}:
                  </span>
                  <span className="font-semibold text-on-surface">
                    LKR {Number(selectedReceipt.price_per_kg || selectedReceipt.offered_price_per_kg) || 0} / kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">
                    {t('payment_mode') || 'Payment Method'}:
                  </span>
                  <span className="font-semibold text-on-surface text-xs">
                    {selectedReceipt.payment_method || 'Direct Farm Gate Settlement'}
                  </span>
                </div>

                {selectedReceipt.pickup_address && (
                  <div className="flex justify-between items-start text-xs pt-1">
                    <span className="text-on-surface-variant font-medium">
                      {t('pickup_location') || 'Pickup Depot'}:
                    </span>
                    <span className="font-medium text-right text-on-surface max-w-[200px]">
                      {selectedReceipt.pickup_address}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Price Callout */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    {t('total_amount_paid') || 'Total Amount Paid'}
                  </span>
                  <span className="text-[11px] text-secondary font-semibold">Zero Middleman Surcharge</span>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl font-extrabold text-primary">
                    LKR{' '}
                    {(
                      Number(selectedReceipt.total_price) ||
                      (Number(selectedReceipt.quantity_kg || selectedReceipt.requested_quantity_kg) || 0) *
                        (Number(selectedReceipt.price_per_kg || selectedReceipt.offered_price_per_kg) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant font-label-md text-xs font-bold text-on-surface-variant hover:bg-surface-container transition"
                >
                  {t('close') || 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:bg-primary-container transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>{t('print_receipt') || 'Print Receipt'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
