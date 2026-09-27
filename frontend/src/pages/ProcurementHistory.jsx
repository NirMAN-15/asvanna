import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';

export default function ProcurementHistory() {
  const { user } = useContext(AuthContext);
  const { lang, t } = useContext(LanguageContext);

  // Active top-level history view tab: 'FARM_DATA' vs 'BUYER_SALES'
  const [activeHistoryTab, setActiveHistoryTab] = useState('FARM_DATA');

  // 1. Sales & Orders State
  const [orders, setOrders] = useState([
    { 
      id: 101, 
      order_code: 'ASV-ORD-8821', 
      crop_name: 'Carrot (Upcountry Tender)', 
      crop_code: 'CARROT', 
      farmer_name: 'Kapila Bandara', 
      farmer_phone: '0712345678', 
      farmer_location: 'Bindunuwewa, Bandarawela',
      buyer_name: 'Bandarawela Grand Hotel',
      buyer_phone: '0572222222',
      buyer_type: 'Hotel / Restaurant',
      quantity_kg: 500, 
      agreed_price_per_kg: 280, 
      total_price: 140000, 
      status: 'DELIVERED', 
      created_at: '2026-09-26T14:20:00.000Z', 
      delivery_address: 'Grand Bandarawela Hotel, Welimada Road, Bandarawela',
      payment_method: 'Direct Farmgate Settlement'
    },
    { 
      id: 102, 
      order_code: 'ASV-ORD-8822', 
      crop_name: 'Leeks (Bandarawela Crisp)', 
      crop_code: 'LEEKS', 
      farmer_name: 'Chaminda Silva', 
      farmer_phone: '0719876543', 
      farmer_location: 'Haputale North, Bandarawela',
      buyer_name: 'Dewanga Catering Service',
      buyer_phone: '0741699017',
      buyer_type: 'Catering / Bulk Buyer',
      quantity_kg: 350, 
      agreed_price_per_kg: 240, 
      total_price: 84000, 
      status: 'IN_TRANSIT', 
      created_at: '2026-09-25T09:10:00.000Z', 
      delivery_address: 'Dewanga Catering Service, Ambatenna Lane, Bandarawela',
      payment_method: 'Bank Transfer'
    },
    { 
      id: 103, 
      order_code: 'ASV-ORD-8823', 
      crop_name: 'Beetroot (Deep Crimson)', 
      crop_code: 'BEETROOT', 
      farmer_name: 'sameera ayeshmantha', 
      farmer_phone: '0711596479', 
      farmer_location: 'Bandarawela Central',
      buyer_name: 'Keppetipola Agro Logistics',
      buyer_phone: '0572244444',
      buyer_type: 'Wholesaler / Distributor',
      quantity_kg: 400, 
      agreed_price_per_kg: 260, 
      total_price: 104000, 
      status: 'COMPLETED', 
      created_at: '2026-09-24T16:45:00.000Z', 
      delivery_address: 'Bandarawela Wholesale Centre, Main Street',
      payment_method: 'Cash on Delivery'
    },
    { 
      id: 104, 
      order_code: 'ASV-ORD-8824', 
      crop_name: 'Cabbage (Golden Acre)', 
      crop_code: 'CABBAGE', 
      farmer_name: 'Kapila Bandara', 
      farmer_phone: '0712345678', 
      farmer_location: 'Bindunuwewa, Bandarawela',
      buyer_name: 'Cargills Food City Bandarawela',
      buyer_phone: '0572233333',
      buyer_type: 'Supermarket Chain',
      quantity_kg: 600, 
      agreed_price_per_kg: 190, 
      total_price: 114000, 
      status: 'COMPLETED', 
      created_at: '2026-09-22T11:30:00.000Z', 
      delivery_address: 'Cargills Collection Centre, Badulla Road',
      payment_method: 'Direct Farmgate Settlement'
    }
  ]);

  // 2. All Farmers Farm & Planting Data State
  const [farmRecords, setFarmRecords] = useState([
    {
      id: 201,
      plot_code: 'BW-PLT-101',
      farmer_name: 'Kapila Bandara',
      farmer_phone: '0712345678',
      farmer_nic: '197823456789',
      gnd_division: 'Bindunuwewa',
      division: 'Bandarawela',
      crop_name: 'Carrot',
      crop_name_si: 'කැරට්',
      crop_name_ta: 'கேரட்',
      crop_code: 'CARROT',
      land_size_acres: 1.5,
      planting_date: '2026-08-10',
      expected_harvest_date: '2026-11-04',
      expected_yield_kg: 11250,
      actual_yield_kg: 11400,
      harvested_date: '2026-09-27T10:00:00.000Z',
      status: 'HARVESTED',
      entered_by_type: 'FARMER',
      latitude: 6.8322,
      longitude: 80.9984
    },
    {
      id: 202,
      plot_code: 'BW-PLT-102',
      farmer_name: 'Chaminda Silva',
      farmer_phone: '0719876543',
      farmer_nic: '198234567890',
      gnd_division: 'Haputale North',
      division: 'Bandarawela',
      crop_name: 'Cabbage',
      crop_name_si: 'ගෝවා',
      crop_name_ta: 'முட்டைக்கோஸ்',
      crop_code: 'CABBAGE',
      land_size_acres: 1.75,
      planting_date: '2026-08-20',
      expected_harvest_date: '2026-11-03',
      expected_yield_kg: 21000,
      actual_yield_kg: null,
      harvested_date: null,
      status: 'PLANTED',
      entered_by_type: 'FARMER',
      latitude: 6.8285,
      longitude: 80.9850
    },
    {
      id: 203,
      plot_code: 'BW-PLT-103',
      farmer_name: 'sameera ayeshmantha',
      farmer_phone: '0711596479',
      farmer_nic: '199512345678',
      gnd_division: 'Bandarawela Central',
      division: 'Bandarawela',
      crop_name: 'Leeks',
      crop_name_si: 'ලීක්ස්',
      crop_name_ta: 'லீக்ஸ்',
      crop_code: 'LEEKS',
      land_size_acres: 1.0,
      planting_date: '2026-08-01',
      expected_harvest_date: '2026-10-30',
      expected_yield_kg: 8500,
      actual_yield_kg: null,
      harvested_date: null,
      status: 'PLANTED',
      entered_by_type: 'OFFICER',
      latitude: 6.8340,
      longitude: 80.9920
    },
    {
      id: 204,
      plot_code: 'BW-PLT-104',
      farmer_name: 'Kapila Bandara',
      farmer_phone: '0712345678',
      farmer_nic: '197823456789',
      gnd_division: 'Bindunuwewa',
      division: 'Bandarawela',
      crop_name: 'Green Beans',
      crop_name_si: 'බෝංචි',
      crop_name_ta: 'போஞ்சி',
      crop_code: 'BEANS',
      land_size_acres: 1.0,
      planting_date: '2026-07-25',
      expected_harvest_date: '2026-09-23',
      expected_yield_kg: 5000,
      actual_yield_kg: 5200,
      harvested_date: '2026-09-24T15:30:00.000Z',
      status: 'HARVESTED',
      entered_by_type: 'FARMER',
      latitude: 6.8315,
      longitude: 80.9990
    },
    {
      id: 205,
      plot_code: 'BW-PLT-105',
      farmer_name: 'R. M. Herath',
      farmer_phone: '0778899001',
      farmer_nic: '198422334455',
      gnd_division: 'Kinigama North',
      division: 'Bandarawela',
      crop_name: 'Upcountry Potato',
      crop_name_si: 'අර්තාපල්',
      crop_name_ta: 'உருளைக்கிழங்கு',
      crop_code: 'POTATO',
      land_size_acres: 2.25,
      planting_date: '2026-08-15',
      expected_harvest_date: '2026-11-23',
      expected_yield_kg: 18000,
      actual_yield_kg: null,
      harvested_date: null,
      status: 'PLANTED',
      entered_by_type: 'OFFICER',
      latitude: 6.8390,
      longitude: 80.9780
    },
    {
      id: 206,
      plot_code: 'BW-PLT-106',
      farmer_name: 'Chaminda Silva',
      farmer_phone: '0719876543',
      farmer_nic: '198234567890',
      gnd_division: 'Haputale North',
      division: 'Bandarawela',
      crop_name: 'Beetroot',
      crop_name_si: 'බීට්රූට්',
      crop_name_ta: 'பீட்ரூட்',
      crop_code: 'BEETROOT',
      land_size_acres: 1.5,
      planting_date: '2026-07-20',
      expected_harvest_date: '2026-09-28',
      expected_yield_kg: 12000,
      actual_yield_kg: 12150,
      harvested_date: '2026-09-27T08:45:00.000Z',
      status: 'HARVESTED',
      entered_by_type: 'FARMER',
      latitude: 6.8290,
      longitude: 80.9840
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('All');
  
  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPlotModal, setSelectedPlotModal] = useState(null);

  useEffect(() => {
    fetchOrdersAndFarmData();
  }, []);

  const fetchOrdersAndFarmData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders / Sales
      try {
        const orderRes = await API.get('/marketplace/orders');
        if (orderRes.data?.data && orderRes.data.data.length > 0) {
          setOrders(orderRes.data.data);
        }
      } catch (err) {
        console.warn('Orders fetch fallback:', err.message);
      }

      // 2. Fetch Farm Planting & Harvest History
      try {
        const farmRes = await API.get('/plantings/history/all');
        if (farmRes.data?.data && farmRes.data.data.length > 0) {
          setFarmRecords(farmRes.data.data);
        } else {
          const mapRes = await API.get('/plantings/regional-map');
          if (mapRes.data?.data && mapRes.data.data.length > 0) {
            setFarmRecords(mapRes.data.data);
          }
        }
      } catch (err) {
        console.warn('Farm records fetch fallback:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Filter Logic: Farm Data Tab
  // ----------------------------------------------------
  const filteredFarmRecords = farmRecords.filter((record) => {
    const q = searchQuery.toLowerCase().trim();
    const cropName = (record.name_en || record.crop_name || '').toLowerCase();
    const cropNameSi = (record.name_si || record.crop_name_si || '').toLowerCase();
    const farmerName = (record.farmer_name || '').toLowerCase();
    const farmerPhone = (record.farmer_phone || '').toLowerCase();
    const gnd = (record.gnd_division || '').toLowerCase();
    const plotCode = (record.plot_code || `BW-PLT-${record.id}`).toLowerCase();

    const matchesSearch =
      !q ||
      farmerName.includes(q) ||
      cropName.includes(q) ||
      cropNameSi.includes(q) ||
      farmerPhone.includes(q) ||
      gnd.includes(q) ||
      plotCode.includes(q);

    const matchesCrop =
      selectedCropFilter === 'All' ||
      cropName.includes(selectedCropFilter.toLowerCase()) ||
      (record.crop_code && record.crop_code.toLowerCase() === selectedCropFilter.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'ACTIVE' && record.status !== 'HARVESTED' && record.status !== 'CANCELLED') ||
      (selectedStatusFilter === 'HARVESTED' && record.status === 'HARVESTED');

    const matchesDivision =
      selectedDivisionFilter === 'All' ||
      record.gnd_division === selectedDivisionFilter ||
      record.division === selectedDivisionFilter;

    return matchesSearch && matchesCrop && matchesStatus && matchesDivision;
  });

  // ----------------------------------------------------
  // Filter Logic: Sales / Orders Tab
  // ----------------------------------------------------
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const farmerName = (order.farmer_name || '').toLowerCase();
    const buyerName = (order.buyer_name || '').toLowerCase();
    const cropName = (order.crop_name || '').toLowerCase();
    const orderCode = (order.order_code || `ORD-${order.id}`).toLowerCase();
    const location = (order.farmer_location || order.delivery_address || '').toLowerCase();

    const matchesSearch =
      !q ||
      farmerName.includes(q) ||
      buyerName.includes(q) ||
      cropName.includes(q) ||
      orderCode.includes(q) ||
      location.includes(q);

    const matchesCrop =
      selectedCropFilter === 'All' ||
      cropName.includes(selectedCropFilter.toLowerCase()) ||
      (order.crop_code && order.crop_code.toLowerCase() === selectedCropFilter.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (order.status && order.status.toUpperCase() === selectedStatusFilter.toUpperCase());

    return matchesSearch && matchesCrop && matchesStatus;
  });

  // ----------------------------------------------------
  // KPI Calculations
  // ----------------------------------------------------
  // Farm Data KPIs
  const totalFarmLand = farmRecords.reduce((sum, r) => sum + (parseFloat(r.land_size_acres) || 0), 0);
  const activeCultivatedLand = farmRecords
    .filter(r => r.status !== 'HARVESTED' && r.status !== 'CANCELLED')
    .reduce((sum, r) => sum + (parseFloat(r.land_size_acres) || 0), 0);
  const clearedHarvestedLand = farmRecords
    .filter(r => r.status === 'HARVESTED')
    .reduce((sum, r) => sum + (parseFloat(r.land_size_acres) || 0), 0);
  const totalExpectedYield = farmRecords.reduce((sum, r) => sum + (parseFloat(r.actual_yield_kg || r.expected_yield_kg) || 0), 0);
  const uniqueGrowers = new Set(farmRecords.map(r => r.farmer_name)).size;

  // Sales KPIs
  const totalKilosSold = orders.reduce((sum, item) => sum + (Number(item.quantity_kg || item.requested_quantity_kg) || 0), 0);
  const totalRevenueLkr = orders.reduce(
    (sum, item) => sum + (Number(item.total_price) || (Number(item.quantity_kg || item.requested_quantity_kg) * Number(item.price_per_kg || item.agreed_price_per_kg || item.offered_price_per_kg)) || 0),
    0
  );
  const completedOrdersCount = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
  const uniqueBuyersCount = new Set(orders.map(o => o.buyer_name)).size;

  const popularCrops = ['All', 'Carrot', 'Leeks', 'Cabbage', 'Beetroot', 'Potato', 'Green Beans'];
  const divisionList = ['All', 'Bandarawela Central', 'Bindunuwewa', 'Kinigama North', 'Haputale North', 'Ella'];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getOrderStatusBadge = (status) => {
    const s = (status || 'DELIVERED').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
          <span className="material-symbols-outlined text-xs icon-fill">check_circle</span>
          <span>{s}</span>
        </span>
      );
    }
    if (s === 'IN_TRANSIT' || s === 'IN TRANSIT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          <span className="material-symbols-outlined text-xs">local_shipping</span>
          <span>IN TRANSIT</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-surface-container-high text-on-surface-variant border border-outline-variant">
        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
        <span>{s || 'PENDING'}</span>
      </span>
    );
  };

  const getCultivationStatusBadge = (status) => {
    const s = (status || 'PLANTED').toUpperCase();
    if (s === 'HARVESTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-900 border border-teal-300 shadow-2xs">
          <span className="material-symbols-outlined text-xs text-teal-700 icon-fill">verified</span>
          <span>{t('status_harvested_cleared', 'HARVESTED • Land Cleared')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
        <span className="material-symbols-outlined text-xs text-emerald-700 animate-pulse">spa</span>
        <span>{t('status_planted_in_field', 'PLANTED • In Field')}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-body-md text-on-surface animate-fadeIn">
      {/* ========================================================================= */}
      {/* 🏛️ MODERN HERO HEADER & DUAL TAB NAVIGATION                              */}
      {/* ========================================================================= */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-7 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">history_edu</span>
              <span>{t('registry_ledger_badge', 'Bandarawela Agrarian Registry Ledger')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{t('procurement_history_title', 'Comprehensive Agricultural History Ledger')}</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              {t('history_ledger_desc', 'Official records of all farmer cultivation plots, planting cycles, harvest completions with land clearance, and direct produce sales transacted with registered buyers.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant hover:text-primary transition shadow-xs cursor-pointer"
              title="Print or export current history ledger"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>{t('print_receipt', 'Export Ledger')}</span>
            </button>
            <button
              onClick={fetchOrdersAndFarmData}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-xs font-bold text-primary hover:bg-primary/20 transition shadow-xs cursor-pointer"
              title="Refresh ledger data"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              <span>{t('sync_telemetry', 'Sync Telemetry')}</span>
            </button>
          </div>
        </div>

        {/* Structured Mode Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-outline-variant/20">
          <button
            onClick={() => {
              setActiveHistoryTab('FARM_DATA');
              setSelectedStatusFilter('All');
            }}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeHistoryTab === 'FARM_DATA'
                ? 'bg-primary text-white ring-2 ring-primary/30 shadow-md'
                : 'bg-surface-container-low text-slate-700 hover:bg-surface-container border border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-lg">agriculture</span>
            <span>{t('tab_farm_data', 'All Farmers Farm & Cultivation History')}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-mono">
              {farmRecords.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveHistoryTab('BUYER_SALES');
              setSelectedStatusFilter('All');
            }}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 cursor-pointer shadow-xs ${
              activeHistoryTab === 'BUYER_SALES'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-600/30 shadow-md'
                : 'bg-surface-container-low text-slate-700 hover:bg-surface-container border border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            <span>{t('tab_buyer_sales', 'Marketplace Sales & Buyer Transactions')}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-mono">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 DYNAMIC KPI TELEMETRY METRICS STRIP                                    */}
      {/* ========================================================================= */}
      {activeHistoryTab === 'FARM_DATA' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-primary shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('total_registered_extent', 'Total Registered Extent')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-primary mt-1">
                {totalFarmLand.toFixed(2)} Acres
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span>
                <span>Across {uniqueGrowers} registered growers</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">landscape</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-emerald-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('active_infield_plots', 'Active In-Field Plots')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                {activeCultivatedLand.toFixed(2)} Acres
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">spa</span>
                <span>Currently growing in Bandarawela</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">potted_plant</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-teal-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('harvested_land_cleared', 'Harvested & Land Cleared')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-teal-700 mt-1">
                {clearedHarvestedLand.toFixed(2)} Acres
              </p>
              <p className="text-[11px] text-teal-700 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                <span>Land freed for next cultivation cycle</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">crop_free</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-amber-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('total_harvest_output', 'Total Harvest Output')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">
                {totalExpectedYield.toLocaleString()} kg
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">scale</span>
                <span>Upcountry vegetable yield</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-emerald-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('total_volume_procured', 'Total Volume Procured')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
                {totalKilosSold.toLocaleString()} kg
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">local_shipping</span>
                <span>Farmgate pickups completed</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-secondary shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('total_value_transacted', 'Total Farmgate Settlement')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-secondary mt-1">
                LKR {totalRevenueLkr.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-secondary">payments</span>
                <span>Direct farmer payouts</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-primary-container shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('fulfilled_orders', 'Settled Trades')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-primary-container mt-1">
                {completedOrdersCount} Orders
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary-container icon-fill">verified</span>
                <span>Verified delivery receipts</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border-t-4 border-blue-600 shadow-card border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                {t('active_buyers', 'Active Buyers & Channels')}
              </span>
              <p className="font-headline text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">
                {uniqueBuyersCount} Entities
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-blue-600">store</span>
                <span>Hotels, Supermarkets, Exporters</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">domain</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 FILTER & SEARCH TOOLBAR                                                */}
      {/* ========================================================================= */}
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
              placeholder={
                activeHistoryTab === 'FARM_DATA'
                  ? 'Search farmer name, phone, crop, GN division, or plot code...'
                  : 'Search order code, farmer seller, buyer company, or crop...'
              }
              className="w-full pl-11 pr-10 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-medium text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status & Division Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {activeHistoryTab === 'FARM_DATA' ? (
              <>
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
                    <option value="All">All Plot States</option>
                    <option value="ACTIVE">Active (In Field)</option>
                    <option value="HARVESTED">Harvested (Land Cleared)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">map</span>
                    <span>GN Area:</span>
                  </span>
                  <select
                    value={selectedDivisionFilter}
                    onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                    className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer"
                  >
                    {divisionList.map((div) => (
                      <option key={div} value={div}>
                        {div === 'All' ? 'All GN Areas' : div}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">filter_list</span>
                  <span>Order Status:</span>
                </span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer"
                >
                  <option value="All">All Orders</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="PENDING">Pending Acceptance</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Popular Crop Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
          <span className="text-xs font-bold text-on-surface-variant mr-1">Crop Filter:</span>
          {popularCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCropFilter(crop)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCropFilter === crop
                  ? 'bg-secondary-container text-on-secondary-fixed border border-secondary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/60 hover:bg-secondary-container/50'
              }`}
            >
              {crop === 'All' ? 'All Master Crops' : crop}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📋 TABLE 1: ALL FARMERS FARM & CULTIVATION DATA                          */}
      {/* ========================================================================= */}
      {activeHistoryTab === 'FARM_DATA' && (
        <section className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">dataset</span>
              <h2 className="font-headline font-bold text-base text-primary">
                Bandarawela Division Registered Farm Plots & Harvest Ledgers
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredFarmRecords.length} of {farmRecords.length} registered plots
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
              <p className="mt-2 text-sm font-medium">Synchronizing agrarian planting records...</p>
            </div>
          ) : filteredFarmRecords.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline">landscape</span>
              <p className="font-semibold text-base">No farmer farm records found for this query.</p>
              <p className="text-xs text-outline max-w-sm mx-auto">
                Try resetting your crop filter, search query, or GN division selection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">{t('plot_ref_planting_date', 'Plot Ref & Date')}</th>
                    <th className="py-3.5 px-4">{t('farmer_grower', 'Registered Farmer (Grower)')}</th>
                    <th className="py-3.5 px-4">{t('cultivated_crop', 'Cultivated Crop')}</th>
                    <th className="py-3.5 px-4">{t('land_extent', 'Land Extent')}</th>
                    <th className="py-3.5 px-4">{t('expected_harvest', 'Expected Harvest')}</th>
                    <th className="py-3.5 px-4">{t('yield_est_actual', 'Yield (Est. / Actual)')}</th>
                    <th className="py-3.5 px-4">{t('status_land_area', 'Status & Land Area')}</th>
                    <th className="py-3.5 px-4 text-right">{t('plot_action', 'Plot Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {filteredFarmRecords.map((record) => {
                    const plotCode = record.plot_code || `BW-PLT-${record.id}`;
                    const cropName = lang === 'si' ? (record.name_si || record.crop_name_si || record.name_en || record.crop_name) : (record.name_en || record.crop_name);

                    return (
                      <tr key={record.id} className="hover:bg-surface-container-low/60 transition-colors group">
                        {/* 1. Plot Ref & Planting Date */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                              <span className="material-symbols-outlined text-base">event_note</span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface text-xs sm:text-sm font-mono text-primary">
                                {plotCode}
                              </p>
                              <span className="text-[11px] text-slate-500">
                                Planted: {formatDate(record.planting_date)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Farmer (Grower) */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-secondary text-base">account_circle</span>
                              <span className="font-bold text-on-surface">
                                {record.farmer_name || 'Smallholder Farmer'}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-outline">call</span>
                              <span className="font-mono">{record.farmer_phone || '0712345678'}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-emerald-600">location_on</span>
                              <span>{record.gnd_division || 'Bandarawela Division'}</span>
                            </p>
                          </div>
                        </td>

                        {/* 3. Cultivated Crop */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-secondary-container/40 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-base flex-shrink-0">
                              🌱
                            </div>
                            <div>
                              <p className="font-bold text-primary font-headline">
                                {cropName}
                              </p>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                                {record.crop_code || 'VEG'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Land Extent */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container font-extrabold text-primary text-sm border border-outline-variant/40">
                            <span className="material-symbols-outlined text-base text-secondary">square_foot</span>
                            <span>{parseFloat(record.land_size_acres || 1).toFixed(2)} Acres</span>
                          </div>
                        </td>

                        {/* 5. Expected / Actual Harvest Date */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {formatDate(record.expected_harvest_date)}
                            </p>
                            {record.harvested_date && (
                              <p className="text-[10px] text-teal-700 font-bold flex items-center gap-0.5 mt-0.5">
                                <span className="material-symbols-outlined text-xs">done_all</span>
                                <span>Harvested: {formatDate(record.harvested_date)}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* 6. Yields (Expected vs Actual) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div>
                            <p className="font-extrabold text-primary font-headline text-sm">
                              {Number(record.actual_yield_kg || record.expected_yield_kg || 0).toLocaleString()} kg
                            </p>
                            <p className="text-[11px] text-on-surface-variant font-medium">
                              {record.actual_yield_kg ? 'Actual Output' : 'Est. Yield'}
                            </p>
                          </div>
                        </td>

                        {/* 7. Status & Land Area */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getCultivationStatusBadge(record.status)}
                        </td>

                        {/* 8. Action */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedPlotModal(record)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition shadow-2xs cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">map</span>
                            <span>Plot Details</span>
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
      )}

      {/* ========================================================================= */}
      {/* 📋 TABLE 2: MARKETPLACE SALES & BUYER PROCUREMENT LEDGER                  */}
      {/* ========================================================================= */}
      {activeHistoryTab === 'BUYER_SALES' && (
        <section className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-xl">payments</span>
              <h2 className="font-headline font-bold text-base text-emerald-950">
                Marketplace Produce Sales & Commercial Procurement Ledger
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredOrders.length} of {orders.length} transactions
            </span>
          </div>

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
                    <th className="py-3.5 px-4">{t('th_date_received') || 'Transacted Date'}</th>
                    <th className="py-3.5 px-4">{t('th_crop_produce') || 'Crop Produce'}</th>
                    <th className="py-3.5 px-4">{t('th_farmer_seller') || 'Farmer (Seller)'}</th>
                    <th className="py-3.5 px-4">{t('buyer_purchaser', 'Buyer / Purchaser')}</th>
                    <th className="py-3.5 px-4">{t('th_quantity_kg') || 'How Much (kg)'}</th>
                    <th className="py-3.5 px-4">{t('th_price_breakdown') || 'Settlement'}</th>
                    <th className="py-3.5 px-4">{t('th_status') || 'Trade Status'}</th>
                    <th className="py-3.5 px-4 text-right">{t('th_actions') || 'Receipt'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {filteredOrders.map((order) => {
                    const qty = Number(order.quantity_kg || order.requested_quantity_kg) || 0;
                    const unitPrice = Number(order.price_per_kg || order.agreed_price_per_kg || order.offered_price_per_kg) || 0;
                    const total = Number(order.total_price) || qty * unitPrice;

                    return (
                      <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors group">
                        {/* 1. Date & Code */}
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

                        {/* 2. Crop Produce */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-secondary-container/40 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-base flex-shrink-0">
                              🌾
                            </div>
                            <div>
                              <p className="font-bold text-primary font-headline">
                                {order.crop_name || 'Upcountry Crop'}
                              </p>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                                {order.crop_code || 'HARVEST'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Farmer (Seller) */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-secondary text-base">account_circle</span>
                              <span className="font-bold text-on-surface">
                                {order.farmer_name || 'Kapila Bandara'}
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

                        {/* 4. Buyer / Purchaser */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-blue-700 text-base">store</span>
                              <span className="font-bold text-slate-900">
                                {order.buyer_name || 'Commercial Buyer'}
                              </span>
                            </div>
                            <span className="inline-block text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {order.buyer_type || 'Verified Buyer'}
                            </span>
                            {order.buyer_phone && (
                              <p className="text-xs text-slate-500 font-mono">{order.buyer_phone}</p>
                            )}
                          </div>
                        </td>

                        {/* 5. Quantity (kg) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container font-extrabold text-primary text-sm border border-outline-variant/40">
                            <span className="material-symbols-outlined text-base text-secondary">scale</span>
                            <span>{qty.toLocaleString()} kg</span>
                          </div>
                        </td>

                        {/* 6. Price Settlement */}
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

                        {/* 7. Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getOrderStatusBadge(order.status)}
                        </td>

                        {/* 8. Action */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedReceipt(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition shadow-2xs cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* 🗺️ PLOT DETAILS MODAL (FOR FARM DATA)                                    */}
      {/* ========================================================================= */}
      {selectedPlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full border border-outline-variant shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 relative">
              <button
                onClick={() => setSelectedPlotModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary-container">landscape</span>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-container">
                  Bandarawela Agrarian Registry Plot
                </span>
              </div>
              <h2 className="font-headline text-2xl font-bold">
                {selectedPlotModal.plot_code || `BW-PLT-${selectedPlotModal.id}`}
              </h2>
              <p className="text-xs text-white/80 font-mono mt-0.5">
                {selectedPlotModal.farmer_name} • {selectedPlotModal.gnd_division || 'Bandarawela Central'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-sm font-body-md">
              <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-2xl border border-outline-variant/40">
                <span className="text-xs font-bold text-on-surface-variant">Plot Cultivation State:</span>
                {getCultivationStatusBadge(selectedPlotModal.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-outline-variant/30 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Registered Farmer</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedPlotModal.farmer_name}</p>
                  <p className="text-slate-600 font-mono">{selectedPlotModal.farmer_phone}</p>
                  <p className="text-[11px] text-slate-500">NIC: {selectedPlotModal.farmer_nic || 'Verified'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Agrarian Area</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedPlotModal.gnd_division || 'Bindunuwewa'}</p>
                  <p className="text-slate-600">{selectedPlotModal.division || 'Bandarawela Division'}</p>
                  <p className="text-[11px] text-emerald-700 font-bold">DoA Pilot Basin 01</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">Crop & Variety:</span>
                  <span className="font-bold text-primary">{selectedPlotModal.crop_name || 'Carrot'} ({selectedPlotModal.crop_code})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">Total Land Extent:</span>
                  <span className="font-bold text-slate-900">{parseFloat(selectedPlotModal.land_size_acres || 1).toFixed(2)} Acres</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">Planting Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedPlotModal.planting_date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">Expected Harvest Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedPlotModal.expected_harvest_date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">Estimated Seasonal Yield:</span>
                  <span className="font-bold text-slate-900">{Number(selectedPlotModal.expected_yield_kg || 0).toLocaleString()} kg</span>
                </div>
                {selectedPlotModal.actual_yield_kg && (
                  <div className="flex justify-between py-1 border-b border-outline-variant/20">
                    <span className="text-teal-700 font-bold">Actual Harvested Yield:</span>
                    <span className="font-black text-teal-800 text-sm">{Number(selectedPlotModal.actual_yield_kg).toLocaleString()} kg</span>
                  </div>
                )}
                {selectedPlotModal.harvested_date && (
                  <div className="flex justify-between py-1 border-b border-outline-variant/20">
                    <span className="text-teal-700 font-bold">Harvest Completed & Land Cleared:</span>
                    <span className="font-bold text-teal-800">{formatDate(selectedPlotModal.harvested_date)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-outline-variant/20">
                  <span className="text-slate-500 font-medium">GPS Geofence:</span>
                  <span className="font-mono text-slate-700">{selectedPlotModal.latitude || 6.8322}° N, {selectedPlotModal.longitude || 80.9984}° E</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Entry Validation:</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedPlotModal.entered_by_type === 'OFFICER' ? 'DoA Officer Verified Entry' : 'Verified Farmer Self-Log'}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-medium">
                {selectedPlotModal.status === 'HARVESTED' ? (
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-lg flex-shrink-0">check_circle</span>
                    <span>
                      <strong>Land Area Cleared:</strong> Harvesting has been marked completed for this plot. The {selectedPlotModal.land_size_acres} acres has been released from active field quota and is available for new crop registration.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-lg flex-shrink-0">spa</span>
                    <span>
                      <strong>Active Cultivation:</strong> This plot is actively growing in the Bandarawela basin. Once harvested, the farmer can mark harvest completion to clear this land area.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlotModal(null)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition cursor-pointer"
                >
                  Close Plot Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧾 DETAILED RECEIPT MODAL (FOR BUYER SALES)                               */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full border border-outline-variant shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-primary text-white p-6 relative">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1 cursor-pointer"
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
              <div className="flex items-center justify-between p-3 bg-secondary-container/40 rounded-xl border border-secondary/20">
                <span className="text-xs font-bold text-on-secondary-fixed">Procurement Status:</span>
                {getOrderStatusBadge(selectedReceipt.status)}
              </div>

              {/* Farmer & Buyer Details */}
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-outline-variant/30 text-xs">
                <div>
                  <span className="text-outline uppercase font-bold text-[10px] block">
                    {t('th_farmer_seller') || 'Farmer (Seller)'}
                  </span>
                  <p className="font-bold text-on-surface text-sm mt-0.5">
                    {selectedReceipt.farmer_name || 'Kapila Bandara'}
                  </p>
                  <p className="text-on-surface-variant font-mono">{selectedReceipt.farmer_phone}</p>
                  <p className="text-[11px] text-outline">{selectedReceipt.farmer_location || 'Bandarawela'}</p>
                </div>
                <div>
                  <span className="text-outline uppercase font-bold text-[10px] block">
                    Procured By (Buyer)
                  </span>
                  <p className="font-bold text-on-surface text-sm mt-0.5">
                    {selectedReceipt.buyer_name || user?.full_name || 'Bandarawela Grand Hotel'}
                  </p>
                  <p className="text-on-surface-variant font-mono">{selectedReceipt.buyer_phone || '0572222222'}</p>
                  <p className="text-[11px] text-outline">{selectedReceipt.buyer_type || 'Commercial Buyer'}</p>
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
                    {t('price_per_kg_label') || 'Agreed Rate'}:
                  </span>
                  <span className="font-semibold text-on-surface">
                    LKR {Number(selectedReceipt.price_per_kg || selectedReceipt.agreed_price_per_kg || selectedReceipt.offered_price_per_kg) || 0} / kg
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">
                    {t('payment_mode') || 'Payment Method'}:
                  </span>
                  <span className="font-semibold text-on-surface text-xs">
                    {selectedReceipt.payment_method || 'Direct Farmgate Settlement'}
                  </span>
                </div>

                {selectedReceipt.delivery_address && (
                  <div className="flex justify-between items-start text-xs pt-1">
                    <span className="text-on-surface-variant font-medium">
                      {t('pickup_location') || 'Delivery Depot'}:
                    </span>
                    <span className="font-medium text-right text-on-surface max-w-[200px]">
                      {selectedReceipt.delivery_address}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Price Callout */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                    {t('total_amount_paid') || 'Total Amount Settled'}
                  </span>
                  <span className="text-[11px] text-secondary font-semibold">Zero Middleman Surcharge</span>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl font-extrabold text-primary">
                    LKR{' '}
                    {(
                      Number(selectedReceipt.total_price) ||
                      (Number(selectedReceipt.quantity_kg || selectedReceipt.requested_quantity_kg) || 0) *
                        (Number(selectedReceipt.price_per_kg || selectedReceipt.agreed_price_per_kg || selectedReceipt.offered_price_per_kg) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant font-label-md text-xs font-bold text-on-surface-variant hover:bg-surface-container transition cursor-pointer"
                >
                  {t('close') || 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-label-md text-xs font-bold hover:bg-primary-container transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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
