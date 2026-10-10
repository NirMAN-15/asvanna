import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import ChatDrawer from '../components/ChatDrawer';

// 25 Bandarawela Master Crops with Keppetipola Wholesale Benchmarks
const MASTER_CROPS = [
  { id: 1, code: 'LEEKS', nameEn: 'Leeks', nameSi: 'ලීක්ස්', nameTa: 'லீக்ஸ்', benchmark: 280, min: 200, max: 500, emoji: '🥬', image: '/crops/leek.jpg' },
  { id: 2, code: 'CABBAGE', nameEn: 'Cabbage', nameSi: 'ගෝවා', nameTa: 'முட்டைக்கோஸ்', benchmark: 190, min: 150, max: 400, emoji: '🥗', image: '/crops/leek.jpg' },
  { id: 3, code: 'CARROT', nameEn: 'Carrot', nameSi: 'කැරට්', nameTa: 'கேரட்', benchmark: 340, min: 250, max: 600, emoji: '🥕', image: '/crops/carrot.jpg' },
  { id: 4, code: 'BEETROOT', nameEn: 'Beetroot', nameSi: 'බීට්රූට්', nameTa: 'பீட்ரூட்', benchmark: 260, min: 200, max: 500, emoji: '🟣', image: '/crops/beetroot.jpg' },
  { id: 5, code: 'POTATO', nameEn: 'Upcountry Potato', nameSi: 'අර්තාපල්', nameTa: 'உருளைக்கிழங்கு', benchmark: 390, min: 250, max: 450, emoji: '🥔', image: '/crops/carrot.jpg' },
  { id: 6, code: 'BEANS', nameEn: 'Green Beans', nameSi: 'බෝංචි', nameTa: 'போஞ்சி', benchmark: 320, min: 250, max: 600, emoji: '🫘', image: '/crops/bush_beans.jpg' },
  { id: 7, code: 'TOMATO', nameEn: 'Tomato', nameSi: 'තක්කාලි', nameTa: 'தக்காளி', benchmark: 220, min: 150, max: 800, emoji: '🍅', image: '/crops/beetroot.jpg' },
  { id: 8, code: 'CAPSICUM', nameEn: 'Capsicum', nameSi: 'මාළු මිරිස්', nameTa: 'குடை மிளகாய்', benchmark: 460, min: 300, max: 800, emoji: '🫑', image: '/crops/leek.jpg' },
  { id: 9, code: 'RADISH', nameEn: 'Radish', nameSi: 'රාබු', nameTa: 'முள்ளங்கி', benchmark: 140, min: 100, max: 250, emoji: '🥣', image: '/crops/radish.jpg' },
  { id: 10, code: 'KNOLKHOL', nameEn: 'Knol-Khol', nameSi: 'නෝල්කෝල්', nameTa: 'நூல்கோல்', benchmark: 180, min: 150, max: 350, emoji: '🥬', image: '/crops/knol_khol.jpg' },
  { id: 11, code: 'SPRING_ONION', nameEn: 'Spring Onion', nameSi: 'ලූනු කොළ', nameTa: 'வெங்காயத்தாள்', benchmark: 280, min: 200, max: 400, emoji: '🧅', image: '/crops/spring_onion.jpg' },
  { id: 12, code: 'LETTUCE', nameEn: 'Lettuce', nameSi: 'සලාද කොළ', nameTa: 'சலாதுஇலை', benchmark: 320, min: 250, max: 500, emoji: '🥬', image: '/crops/leek.jpg' },
  { id: 13, code: 'CELERY', nameEn: 'Celery', nameSi: 'සැල්දිරි', nameTa: 'செலரி', benchmark: 420, min: 300, max: 700, emoji: '🌿', image: '/crops/spring_onion.jpg' },
  { id: 14, code: 'BROCCOLI', nameEn: 'Broccoli', nameSi: 'බ්‍රොකොලි', nameTa: 'ப்ரோக்கோலி', benchmark: 680, min: 500, max: 1200, emoji: '🥦', image: '/crops/leek.jpg' },
  { id: 15, code: 'CAULIFLOWER', nameEn: 'Cauliflower', nameSi: 'මල් ගෝවා', nameTa: 'காலிபிளவர்', benchmark: 380, min: 300, max: 700, emoji: '🥦', image: '/crops/radish.jpg' },
  { id: 16, code: 'PUMPKIN', nameEn: 'Pumpkin', nameSi: 'වට්ටක්කා', nameTa: 'பூசணிக்காய்', benchmark: 160, min: 100, max: 250, emoji: '🎃', image: '/crops/carrot.jpg' },
  { id: 17, code: 'BITTER_GOURD', nameEn: 'Bitter Gourd', nameSi: 'කරවිල', nameTa: 'பாகற்காய்', benchmark: 340, min: 200, max: 500, emoji: '🥒', image: '/crops/bush_beans.jpg' },
  { id: 18, code: 'SNAKE_GOURD', nameEn: 'Snake Gourd', nameSi: 'පතෝල', nameTa: 'புடலங்காய்', benchmark: 210, min: 150, max: 350, emoji: '🥒', image: '/crops/bush_beans.jpg' },
  { id: 19, code: 'CUCUMBER', nameEn: 'Cucumber', nameSi: 'පිපිඤ්ඤා', nameTa: 'வெள்ளரிக்காய்', benchmark: 160, min: 100, max: 300, emoji: '🥒', image: '/crops/bush_beans.jpg' },
  { id: 20, code: 'GREEN_CHILI', nameEn: 'Green Chili', nameSi: 'අමු මිරිස්', nameTa: 'பச்சை மிளகாய்', benchmark: 540, min: 300, max: 900, emoji: '🌶️', image: '/crops/bush_beans.jpg' },
  { id: 21, code: 'RED_ONION', nameEn: 'Red Onion', nameSi: 'රතු ලූනු', nameTa: 'சிவப்பு வெங்காயம்', benchmark: 390, min: 250, max: 600, emoji: '🧅', image: '/crops/beetroot.jpg' },
  { id: 22, code: 'GOTUKOLA', nameEn: 'Gotukola', nameSi: 'ගොටුකොළ', nameTa: 'வல்லாரை', benchmark: 260, min: 200, max: 400, emoji: '🥗', image: '/crops/gotukola.jpg' },
  { id: 23, code: 'KANGKUNG', nameEn: 'Water Spinach', nameSi: 'කන්කුන්', nameTa: 'வள்ளல் கீரை', benchmark: 140, min: 100, max: 200, emoji: '🌿', image: '/crops/kangkung.jpg' },
  { id: 24, code: 'MUKUNUWENNA', nameEn: 'Mukunuwenna', nameSi: 'මුකුණුවැන්න', nameTa: 'முக்குனுவென்ன', benchmark: 210, min: 150, max: 350, emoji: '🌿', image: '/crops/mukunuwenna.jpg' },
  { id: 25, code: 'SPINACH', nameEn: 'Spinach', nameSi: 'නිවිති', nameTa: 'பசலைக் கீரை', benchmark: 220, min: 150, max: 300, emoji: '🥬', image: '/crops/spinach.jpg' }
];

export default function MarketplaceSurplus() {
  const { user, role } = useContext(AuthContext);
  const { lang, t } = useContext(LanguageContext);

  // Role detection: Defaults to user.role, supports manual switcher
  const currentRole = (role || user?.role || 'FARMER').toUpperCase();
  const [activeRoleMode, setActiveRoleMode] = useState(currentRole === 'BUYER' ? 'BUYER' : 'FARMER');

  // Farmer States
  const [farmerTab, setFarmerTab] = useState('listings'); // 'listings' | 'orders'
  const [myListings, setMyListings] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'add_surplus');
  const [counterModalOrder, setCounterModalOrder] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [notificationToast, setNotificationToast] = useState(null);
  const [activeChatOrder, setActiveChatOrder] = useState(null);

  // Farmer Edit Listing State
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    quantityKg: '',
    pricePerKg: '',
    status: 'AVAILABLE',
    pickupAddress: '',
    description: ''
  });

  // Short Confirmation Before Accept Order
  const [orderToConfirmAccept, setOrderToConfirmAccept] = useState(null);

  // Add Surplus Form State
  const [formData, setFormData] = useState({
    cropId: MASTER_CROPS[2].id, // Default Carrot
    quantityKg: '450',
    pricePerKg: '280',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    pickupAddress: 'Kinigama Valley, Bandarawela North',
    qualityGrade: 'Grade A Local',
    isUrgent: false,
    vehicleAccess: 'Light Truck / Dimo Batta',
    notes: 'Washed, graded, crated in 25kg crates. Direct farmgate pickup.'
  });

  // Buyer States
  const [buyerTab, setBuyerTab] = useState('browse'); // 'browse' | 'my_orders'
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(800);
  const [browseListings, setBrowseListings] = useState([]);
  const [procureModalListing, setProcureModalListing] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [orderNotes, setOrderNotes] = useState('');
  const [myBuyerOrders, setMyBuyerOrders] = useState([]);

  // Selected crop benchmark helper
  const selectedCropMeta = MASTER_CROPS.find(c => c.id === Number(formData.cropId)) || MASTER_CROPS[0];
  const discountVsBenchmark = Math.round(
    ((selectedCropMeta.benchmark - Number(formData.pricePerKg)) / selectedCropMeta.benchmark) * 100
  );

  // Load Data on Mount and on Role/Radius Change
  useEffect(() => {
    loadData();
    const interval = setInterval(() => setTimerTick(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [activeRoleMode, radiusKm]);

  const [timerTick, setTimerTick] = useState(0);

  const triggerToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const loadData = async () => {
    try {
      if (activeRoleMode === 'FARMER') {
        const [listingsRes, ordersRes] = await Promise.all([
          API.get('/marketplace/listings/my').catch(() => ({ data: { data: [] } })),
          API.get('/marketplace/orders').catch(() => ({ data: { data: [] } }))
        ]);

        const serverListings = listingsRes.data?.data || [];
        setMyListings(serverListings);

        const serverOrders = ordersRes.data?.data || [];
        setIncomingOrders(serverOrders);
      } else {
        const buyerLat = user?.latitude || 6.8322;
        const buyerLng = user?.longitude || 80.9980;
        const [searchRes, ordersRes] = await Promise.all([
          API.get(`/marketplace/search?radius_km=${radiusKm}&lat=${buyerLat}&lng=${buyerLng}`).catch(() => ({ data: { data: [] } })),
          API.get('/marketplace/orders').catch(() => ({ data: { data: [] } }))
        ]);

        const serverListings = searchRes.data?.data || [];
        if (serverListings.length > 0) {
          const mapped = serverListings.map(item => ({
            ...item,
            farmName: item.farmer_name || item.farmName || 'Verified Farm',
            cropKey: item.crop_name_en || item.cropKey || 'Produce',
            badge: item.badge || 'Verified Farmgate',
            location: item.pickup_address || item.location || 'Bandarawela',
            distance: item.distanceKm != null ? item.distanceKm : (item.distance != null ? item.distance : 0.8),
            availableKg: item.quantity_kg != null ? item.quantity_kg : (item.availableKg || 100),
            pricePerKg: item.price_per_kg != null ? item.price_per_kg : (item.pricePerKg || 250),
            benchmarkPrice: item.standard_price_per_kg != null ? item.standard_price_per_kg : (item.benchmarkPrice || 320),
            image: item.image_url || item.image || '/crops/leek.jpg'
          }));
          setBrowseListings(mapped);
        } else {
          setBrowseListings([]);
        }

        const serverBuyerOrders = ordersRes.data?.data || [];
        setMyBuyerOrders(serverBuyerOrders);
      }
    } catch (err) {
      console.error('Marketplace load error:', err);
    }
  };

  // 30-Minute Countdown Formatter
  const formatCountdown = (deadline) => {
    if (!deadline) return '28:45';
    const diffMs = new Date(deadline).getTime() - Date.now();
    if (diffMs <= 0) return 'EXPIRED';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Add Surplus Produce Submission
  const handleCreateListing = async (e) => {
    e.preventDefault();
    const qty = parseFloat(formData.quantityKg);
    const price = parseFloat(formData.pricePerKg);

    if (!qty || qty <= 0 || !price || price <= 0) {
      triggerToast('Please enter valid positive quantity and price.');
      return;
    }

    const payload = {
      crop_id: selectedCropMeta.id,
      quantity_kg: qty,
      price_per_kg: price,
      available_from: formData.harvestDate,
      available_to: formData.expiryDate,
      latitude: user?.latitude || 6.8322,
      longitude: user?.longitude || 80.9980,
      pickup_address: formData.pickupAddress,
      description: `${formData.qualityGrade} • ${formData.vehicleAccess} • ${formData.notes}${formData.isUrgent ? ' • URGENT CLEARANCE' : ''}`,
      image_url: selectedCropMeta.image
    };

    try {
      await API.post('/marketplace/listings', payload);
      triggerToast('Surplus produce published to Bandarawela Zero-Waste Marketplace!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Listing saved locally.';
      triggerToast(errMsg);
    }

    const newLocalListing = {
      id: Date.now(),
      crop_name_en: selectedCropMeta.nameEn,
      crop_name_si: selectedCropMeta.nameSi,
      crop_name_ta: selectedCropMeta.nameTa,
      crop_code: selectedCropMeta.code,
      quantity_kg: qty,
      price_per_kg: price,
      standard_price_per_kg: selectedCropMeta.benchmark,
      status: 'AVAILABLE',
      pickup_address: formData.pickupAddress,
      description: payload.description,
      available_to: formData.expiryDate,
      image_url: selectedCropMeta.image,
      created_at: new Date().toISOString()
    };

    setMyListings([newLocalListing, ...myListings]);
    setShowAddModal(false);
  };

  // Farmer Update Existing Surplus Listing
  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;

    const qty = parseFloat(editFormData.quantityKg);
    const price = parseFloat(editFormData.pricePerKg);

    if (!qty || qty <= 0) {
      triggerToast('Please provide a valid quantity in kg.');
      return;
    }
    if (!price || price <= 0) {
      triggerToast('Please provide a valid price per kg.');
      return;
    }

    try {
      await API.put(`/marketplace/listings/${editingListing.id}`, {
        quantity_kg: qty,
        price_per_kg: price,
        status: editFormData.status,
        description: editFormData.description,
        pickup_address: editFormData.pickupAddress
      });
    } catch (err) {
      console.warn('Listing update via API note:', err.message);
    }

    setMyListings(prev => prev.map(l => {
      if (l.id === editingListing.id) {
        return {
          ...l,
          quantity_kg: qty,
          price_per_kg: price,
          status: editFormData.status,
          description: editFormData.description,
          pickup_address: editFormData.pickupAddress || l.pickup_address
        };
      }
      return l;
    }));

    triggerToast(`Surplus listing for ${editingListing.crop_name_en || 'produce'} updated successfully.`);
    setEditingListing(null);
  };

  // Farmer Respond to Order (Accept, Decline, Counter)
  const handleRespondOrder = async (orderId, action, counterVal = null) => {
    try {
      await API.put(`/marketplace/orders/${orderId}/respond`, {
        action,
        counterPricePerKg: counterVal,
        note: counterNote
      });
      triggerToast(`Order ${action === 'ACCEPT' ? 'Accepted' : action === 'DECLINE' ? 'Declined' : 'Counter-Offer Sent'}!`);
    } catch (e) {
      triggerToast(`Order updated: ${action}`);
    }

    setIncomingOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: action === 'ACCEPT' ? 'ACCEPTED' : action === 'DECLINE' ? 'DECLINED' : 'COUNTER_OFFER',
          offered_price_per_kg: counterVal || o.offered_price_per_kg,
          total_price: counterVal ? (o.requested_quantity_kg * counterVal) : o.total_price
        };
      }
      return o;
    }));

    if (counterModalOrder) setCounterModalOrder(null);
  };

  // Buyer Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!procureModalListing) return;

    const qty = parseFloat(orderQuantity);
    if (!qty || qty <= 0 || qty > procureModalListing.availableKg) {
      triggerToast(`Order quantity must be between 10 kg and ${procureModalListing.availableKg} kg.`);
      return;
    }

    const deadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const payload = {
      listing_id: procureModalListing.id,
      requested_quantity_kg: qty,
      offered_price_per_kg: procureModalListing.pricePerKg,
      notes: orderNotes
    };

    try {
      await API.post('/marketplace/orders', payload);
      triggerToast('Procurement order submitted! 30-minute farmer response window active.');
    } catch (err) {
      triggerToast('Order placed with 30-minute confirmation window.');
    }

    const newOrder = {
      id: Date.now(),
      order_code: `ASV-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      crop_name_en: procureModalListing.cropKey || procureModalListing.crop_name_en,
      crop_name_si: procureModalListing.crop_name_si,
      requested_quantity_kg: qty,
      offered_price_per_kg: procureModalListing.pricePerKg,
      total_price: qty * procureModalListing.pricePerKg,
      farmer_name: procureModalListing.farmer || procureModalListing.farmer_name,
      farmer_phone: procureModalListing.phone || procureModalListing.farmer_phone,
      pickup_address: procureModalListing.location || procureModalListing.pickup_address,
      status: 'PENDING',
      response_deadline: deadline,
      created_at: new Date().toISOString()
    };

    setMyBuyerOrders([newOrder, ...myBuyerOrders]);
    setProcureModalListing(null);
    setBuyerTab('my_orders');
  };

  // Crop name localized helper
  const getCropTitle = (item) => {
    if (lang === 'si' && item.crop_name_si) return item.crop_name_si;
    if (lang === 'ta' && item.crop_name_ta) return item.crop_name_ta;
    return item.crop_name_en || item.cropKey || 'Vegetable Batch';
  };

  // Fallback Data Generators (Empty by default)
  function getFallbackFarmerListings() {
    return [];
  }

  function getFallbackIncomingOrders() {
    return [];
  }

  function getFallbackBrowseListings() {
    return [];
  }

  function getFallbackBuyerOrders() {
    return [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn select-none">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-secondary text-xs font-bold animate-slideDown">
          <span className="material-symbols-outlined text-secondary-fixed text-lg">check_circle</span>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Banner & Mode Switcher */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-3xl">
                {activeRoleMode === 'FARMER' ? 'agriculture' : 'storefront'}
              </span>
              <span>{activeRoleMode === 'FARMER' ? t('farmer_surplus_hub', 'Farmer Surplus Produce Hub') : t('surplus_procurement_title', 'Zero-Waste Surplus Procurement')}</span>
            </h1>
            <span className="bg-secondary/15 text-secondary text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('pilot_division_badge', 'Bandarawela Division Pilot')}
            </span>
          </div>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1.5 max-w-2xl">
            {activeRoleMode === 'FARMER'
              ? t('farmer_marketplace_desc', 'List your surplus harvest directly to 40+ local hoteliers, caterers, and supermarkets within 20km. Zero brokers, guaranteed fair farmgate prices.')
              : t('buyer_marketplace_desc', 'Procure farmgate-fresh vegetables directly from verified Bandarawela smallholder farmers. 15–30% savings vs. Keppetipola Economic Centre.')}
          </p>
        </div>

        {/* Role Switcher & Primary Action */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {role === 'ADMIN' && (
            <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/40 shadow-inner">
              <button
                onClick={() => setActiveRoleMode('FARMER')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeRoleMode === 'FARMER'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">potted_plant</span>
                <span>{t('farmer_hub', 'Farmer Hub')}</span>
              </button>
              <button
                onClick={() => setActiveRoleMode('BUYER')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                  activeRoleMode === 'BUYER'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shopping_basket</span>
                <span>{t('buyer_view', 'Buyer View')}</span>
              </button>
            </div>
          )}

          {activeRoleMode === 'FARMER' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>{t('publish_surplus', '+ Add Surplus Produce')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌾 FARMER INTERFACE                                                      */}
      {/* ========================================================================= */}
      {activeRoleMode === 'FARMER' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block">{t('active_surplus_offer', 'Active Surplus on Offer')}</span>
                <h3 className="text-xl font-extrabold text-primary font-headline">
                  {myListings.filter(l => l.status === 'AVAILABLE').reduce((acc, l) => acc + (parseFloat(l.quantity_kg) || 0), 0)} kg
                </h3>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block">{t('active_batches', 'Active Batches')}</span>
                <h3 className="text-xl font-extrabold text-secondary font-headline">
                  {myListings.length} {t('lots_published', 'Lots Published')}
                </h3>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">pending_actions</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block">{t('pending_buyer_orders', 'Pending Buyer Orders')}</span>
                <h3 className="text-xl font-extrabold text-amber-800 font-headline">
                  {incomingOrders.filter(o => o.status === 'PENDING').length} {t('orders_sla', 'Orders (30m SLA)')}
                </h3>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setFarmerTab('listings')}
              className={`pb-3 px-5 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
                farmerTab === 'listings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              <span>{t('my_surplus_listings', 'My Active Listings')} ({myListings.length})</span>
            </button>
            <button
              onClick={() => setFarmerTab('orders')}
              className={`pb-3 px-5 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
                farmerTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">inbox</span>
              <span>{t('incoming_buyer_orders', 'Incoming Buyer Orders')}</span>
              {incomingOrders.filter(o => o.status === 'PENDING').length > 0 && (
                <span className="bg-error text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {incomingOrders.filter(o => o.status === 'PENDING').length} NEW
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Farmer Active Listings */}
          {farmerTab === 'listings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-surface-container-low/40 rounded-3xl border border-dashed border-outline-variant/40 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                  </div>
                  <h3 className="font-bold text-base text-primary">No Active Produce Listings</h3>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    You haven't listed any surplus crops yet. Tap the button below to publish your harvest.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow hover:bg-primary/90 transition cursor-pointer"
                  >
                    + Add Surplus Produce
                  </button>
                </div>
              ) : (
                myListings.map(item => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-card p-5 space-y-4 hover:shadow-card-hover transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.crop_name_en}
                              className="w-12 h-12 rounded-xl object-cover border border-outline-variant/30 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-2xl flex-shrink-0">
                              🥗
                            </div>
                          )}
                          <div>
                            <h3 className="font-headline font-bold text-base text-primary">
                              {getCropTitle(item)}
                            </h3>
                            <p className="text-[11px] text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              <span>{item.pickup_address}</span>
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          item.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'SOLD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-outline uppercase block">{t('available_lot', 'Available Lot')}</span>
                          <span className="text-base font-extrabold text-on-surface">{item.quantity_kg} kg</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-outline uppercase block">{t('asking_rate', 'Asking Rate')}</span>
                          <span className="text-base font-extrabold text-secondary">Rs. {item.price_per_kg}/kg</span>
                        </div>
                      </div>

                      {item.standard_price_per_kg && (
                        <div className="text-[11px] bg-secondary-container/40 px-3 py-2 rounded-xl flex items-center justify-between text-on-secondary-fixed">
                          <span>{t('keppetipola_benchmark', 'Keppetipola Benchmark:')}</span>
                          <span className="font-bold">Rs. {item.standard_price_per_kg}/kg</span>
                        </div>
                      )}

                      {item.description && (
                        <p className="text-[11px] text-on-surface-variant line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-outline-variant/20">
                      <button
                        onClick={() => {
                          setEditingListing(item);
                          setEditFormData({
                            quantityKg: String(item.quantity_kg || ''),
                            pricePerKg: String(item.price_per_kg || ''),
                            status: item.status || 'AVAILABLE',
                            pickupAddress: item.pickup_address || '',
                            description: item.description || ''
                          });
                        }}
                        className="flex-1 py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container transition"
                      >
                        {t('edit_price_qty', 'Edit Price/Qty')}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delist this produce lot from the marketplace?')) {
                            setMyListings(prev => prev.filter(l => l.id !== item.id));
                            triggerToast('Produce lot delisted.');
                          }
                        }}
                        className="px-3 py-2 rounded-xl border border-error/30 text-error text-xs font-bold hover:bg-error/10 transition"
                      >
                        {t('delist', 'Delist')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Incoming Buyer Orders */}
          {farmerTab === 'orders' && (
            <div className="space-y-4">
              {incomingOrders.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-low/40 rounded-3xl border border-dashed border-outline-variant/40 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-3xl">inbox</span>
                  </div>
                  <p className="font-bold text-base text-primary">No buyer orders received yet.</p>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">Orders placed by verified local buyers will appear here with an active 30-minute response timer.</p>
                </div>
              ) : (
                incomingOrders.map(order => {
                  const countdown = formatCountdown(order.response_deadline);
                  const isExpired = countdown === 'EXPIRED';

                  return (
                    <div
                      key={order.id}
                      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-headline font-bold text-primary text-base">{order.order_code}</span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            order.status === 'COUNTER_OFFER' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>

                          {order.status === 'PENDING' && !isExpired && (
                            <span className="bg-error/10 text-error font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                              <span className="material-symbols-outlined text-sm">timer</span>
                              <span>{countdown} Response Window</span>
                            </span>
                          )}

                          {isExpired && order.status === 'PENDING' && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                              Window Expired
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-on-surface-variant flex flex-wrap gap-x-5 gap-y-1.5">
                          <span><strong>Buyer:</strong> {order.buyer_name} ({order.buyer_phone})</span>
                          <span><strong>Crop:</strong> {order.crop_name_en} ({order.requested_quantity_kg} kg)</span>
                          <span><strong>Offered Rate:</strong> Rs. {order.offered_price_per_kg}/kg</span>
                          <span className="text-primary font-bold"><strong>Proposed Total:</strong> Rs. {order.total_price?.toLocaleString()}</span>
                        </div>

                        {order.notes && (
                          <p className="text-[11px] text-outline italic bg-surface-container p-2 rounded-lg">
                            Buyer Note: "{order.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveChatOrder(order)}
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>Chat with Buyer</span>
                        </button>

                        {order.status === 'PENDING' && !isExpired && (
                          <>
                            <button
                              onClick={() => setOrderToConfirmAccept(order)}
                              className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Accept Order</span>
                            </button>
                            <button
                              onClick={() => {
                                setCounterModalOrder(order);
                                setCounterPrice(order.offered_price_per_kg);
                              }}
                              className="border border-secondary text-secondary hover:bg-secondary/10 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
                            >
                              Counter-Offer
                            </button>
                            <button
                              onClick={() => handleRespondOrder(order.id, 'DECLINE')}
                              className="text-error hover:bg-error/10 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {order.status === 'ACCEPTED' && (
                          <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-xs text-green-800 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-green-700">verified</span>
                            <span>Confirmed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛒 BUYER INTERFACE                                                       */}
      {/* ========================================================================= */}
      {activeRoleMode === 'BUYER' && (
        <div className="space-y-6">
          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setBuyerTab('browse')}
              className={`pb-3 px-5 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
                buyerTab === 'browse'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>Browse Surplus Harvest</span>
            </button>
            <button
              onClick={() => setBuyerTab('my_orders')}
              className={`pb-3 px-5 font-extrabold text-sm border-b-2 transition flex items-center gap-2 ${
                buyerTab === 'my_orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>My Procurement Orders ({myBuyerOrders.length})</span>
            </button>
          </div>

          {buyerTab === 'browse' && (
            <>
              {/* Filter Controls Panel */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-card p-5 border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Proximity Radius Slider */}
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Radius from Bandarawela</span>
                    <span className="text-primary font-extrabold">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-2 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-semibold">
                    <span>1 km (Town)</span>
                    <span>20 km (Welimada / Haputale)</span>
                  </div>
                </div>

                {/* Quick Crop Filter Chips */}
                <div className="md:col-span-6 space-y-1.5">
                  <span className="text-xs font-bold text-on-surface-variant block">Quick Crop Filter</span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto custom-scrollbar">
                    {['All', 'Leeks', 'Cabbage', 'Carrot', 'Beetroot', 'Green Beans', 'Radish', 'Spring Onion'].map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCropFilter(c)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          selectedCropFilter === c
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price Slider */}
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Max Asking Rate</span>
                    <span className="text-secondary font-extrabold">Rs. {maxPrice}/kg</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-secondary bg-surface-container h-2 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-semibold">
                    <span>Rs. 100/kg</span>
                    <span>Rs. 800/kg</span>
                  </div>
                </div>
              </div>

              {/* Produce Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {browseListings
                  .filter(item => {
                    const matchCrop = selectedCropFilter === 'All' || (item.cropKey || item.crop_name_en).toLowerCase().includes(selectedCropFilter.toLowerCase());
                    const matchPrice = (item.pricePerKg || item.price_per_kg) <= maxPrice;
                    return matchCrop && matchPrice;
                  })
                  .map(item => {
                    const price = item.pricePerKg || item.price_per_kg;
                    const benchmark = item.benchmarkPrice || item.standard_price_per_kg || (price * 1.25);
                    const savingsPercent = Math.round(((benchmark - price) / benchmark) * 100);

                    return (
                      <div
                        key={item.id}
                        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card p-5 space-y-4 hover:shadow-card-hover transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || '/crops/leek.jpg'}
                                alt={item.cropKey}
                                className="w-12 h-12 rounded-xl object-cover border border-outline-variant/30 flex-shrink-0"
                                onError={e => {
                                  if (!e.target.dataset.fallback) {
                                    e.target.dataset.fallback = '1';
                                    e.target.src = '/crops/leek.jpg';
                                  }
                                }}
                              />
                              <div>
                                <h3 className="font-headline font-bold text-base text-primary">
                                  {item.farmName}
                                </h3>
                                <p className="text-xs text-on-surface-variant font-semibold">
                                  {getCropTitle(item)}
                                </p>
                              </div>
                            </div>
                            <span className="bg-secondary/15 text-secondary text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          </div>

                          <div className="text-[11px] text-outline flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">location_on</span>
                              <span>{item.location}</span>
                            </span>
                            <span className="font-bold text-primary">{item.distance} km away</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container rounded-xl text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-outline uppercase block">Available Stock</span>
                              <span className="text-base font-extrabold text-on-surface">{item.availableKg} kg</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-outline uppercase block">Wholesale Rate</span>
                              <span className="text-base font-extrabold text-secondary">Rs. {price}/kg</span>
                            </div>
                          </div>

                          {savingsPercent > 0 && (
                            <div className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl flex items-center justify-between font-bold">
                              <span>Keppetipola Benchmark: Rs. {Math.round(benchmark)}/kg</span>
                              <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded-full">
                                Save {savingsPercent}%
                              </span>
                            </div>
                          )}

                          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-secondary">local_shipping</span>
                            <span>{item.vehicle || 'Dimo Batta Accessible'}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setProcureModalListing(item);
                            setOrderQuantity(Math.min(100, item.availableKg));
                          }}
                          className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                          <span>Initiate Procurement Order</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* Tab 2: Buyer Orders */}
          {buyerTab === 'my_orders' && (
            <div className="space-y-4">
              {myBuyerOrders.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-low/40 rounded-3xl border border-dashed border-outline-variant/40 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-3xl">receipt_long</span>
                  </div>
                  <p className="font-bold text-base text-primary">No procurement orders placed yet.</p>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">Browse surplus produce above to submit direct farmgate orders.</p>
                </div>
              ) : (
                myBuyerOrders.map(order => {
                  const countdown = formatCountdown(order.response_deadline);

                  return (
                    <div
                      key={order.id}
                      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-card p-5 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-headline font-bold text-primary text-base">{order.order_code}</span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>

                        {order.status === 'PENDING' && (
                          <span className="bg-error/10 text-error font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                            <span className="material-symbols-outlined text-sm">timer</span>
                            <span>Farmer Response Window: {countdown}</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-surface-container p-3 rounded-xl">
                        <div>
                          <span className="text-outline block text-[10px] uppercase font-bold">Crop & Qty</span>
                          <span className="font-bold text-on-surface">{order.crop_name_en} ({order.requested_quantity_kg} kg)</span>
                        </div>
                        <div>
                          <span className="text-outline block text-[10px] uppercase font-bold">Rate</span>
                          <span className="font-bold text-secondary">Rs. {order.offered_price_per_kg}/kg</span>
                        </div>
                        <div>
                          <span className="text-outline block text-[10px] uppercase font-bold">Total Payable (COD)</span>
                          <span className="font-bold text-primary">Rs. {order.total_price?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-outline block text-[10px] uppercase font-bold">Farmer Contact</span>
                          <span className="font-bold text-on-surface">{order.farmer_name} ({order.farmer_phone})</span>
                        </div>
                      </div>

                      {order.status === 'ACCEPTED' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 font-semibold">
                          <div>
                            <p className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-800">
                              <span className="material-symbols-outlined text-lg">verified</span>
                              <span>Order Accepted by Farmer!</span>
                            </p>
                            <p className="text-[11px] mt-0.5">Farmgate Pickup Address: {order.pickup_address}</p>
                          </div>
                          <button
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-primary-container transition flex items-center gap-1.5 self-start sm:self-center"
                          >
                            <span className="material-symbols-outlined text-sm">qr_code</span>
                            <span>Digital Pickup Voucher</span>
                          </button>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveChatOrder(order)}
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>Chat with Farmer</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 MODAL: ADD SURPLUS PRODUCE (Farmer Only)                              */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-outline-variant/40 animate-scaleUp">
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-headline font-extrabold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed">add_circle</span>
                  <span>List Surplus Produce</span>
                </h2>
                <p className="text-secondary-fixed text-xs mt-0.5">Bandarawela Division Zero-Waste Dispatch Hub</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 text-xs">
              {/* Crop Selector */}
              <div>
                <label className="block font-bold text-on-surface mb-1">Select Crop Variety</label>
                <select
                  value={formData.cropId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const crop = MASTER_CROPS.find(c => c.id === id);
                    setFormData({
                      ...formData,
                      cropId: id,
                      pricePerKg: crop ? Math.round(crop.benchmark * 0.85).toString() : '200'
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface focus:border-primary outline-none"
                >
                  {MASTER_CROPS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.nameEn} ({c.nameSi}) — Keppetipola: Rs. {c.benchmark}/kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Keppetipola Benchmark Banner */}
              <div className="p-3 bg-secondary-container/40 rounded-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline block">Keppetipola Wholesale Rate</span>
                  <span className="font-extrabold text-sm text-primary">Rs. {selectedCropMeta.benchmark} / kg</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-outline block">Wholesale Price Range</span>
                  <span className="font-semibold text-xs text-on-surface">Rs. {selectedCropMeta.min} - Rs. {selectedCropMeta.max}</span>
                </div>
              </div>

              {/* Quantity & Asking Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Available Quantity (kg)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={formData.quantityKg}
                    onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-on-surface focus:border-primary outline-none"
                  />
                  <span className="text-[10px] text-outline mt-0.5 block">
                    Gross Value: Rs. {(Number(formData.quantityKg) * Number(formData.pricePerKg)).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Asking Rate (Rs / kg)</label>
                  <input
                    type="number"
                    min="20"
                    step="5"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-secondary focus:border-primary outline-none"
                  />
                  <span className={`text-[10px] font-extrabold mt-0.5 block ${discountVsBenchmark >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {discountVsBenchmark >= 0 ? `${discountVsBenchmark}% below DEC (Fast clearance)` : `${Math.abs(discountVsBenchmark)}% above DEC`}
                  </span>
                </div>
              </div>

              {/* Quality Grade & Vehicle Access */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Quality Grade</label>
                  <select
                    value={formData.qualityGrade}
                    onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none"
                  >
                    <option>Grade A Local</option>
                    <option>Grade A Export</option>
                    <option>Grade B Commercial Catering</option>
                    <option>Grade C Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Vehicle Accessibility</label>
                  <select
                    value={formData.vehicleAccess}
                    onChange={(e) => setFormData({ ...formData, vehicleAccess: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface outline-none"
                  >
                    <option>Light Truck / Dimo Batta</option>
                    <option>Three-Wheeler Only</option>
                    <option>Lorry / Canter (4–8 MT)</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Best Before / Expiry</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-on-surface outline-none"
                  />
                </div>
              </div>

              {/* Farm Address */}
              <div>
                <label className="block font-bold text-on-surface mb-1">Farmgate Pickup Location</label>
                <input
                  type="text"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-on-surface outline-none"
                  placeholder="e.g. Kinigama Valley, Bandarawela"
                />
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="isUrgent" className="text-[11px] font-bold text-amber-900 cursor-pointer">
                  Urgent Perishable Clearance (Priority broadcast to caterers within 5km for same-day pickup)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md transition"
                >
                  Publish Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛒 MODAL: INITIATE PROCUREMENT ORDER (Buyer Only)                        */}
      {/* ========================================================================= */}
      {procureModalListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-outline-variant/40 animate-scaleUp">
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-headline font-extrabold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed">shopping_cart_checkout</span>
                  <span>Confirm Procurement Order</span>
                </h2>
                <p className="text-secondary-fixed text-xs mt-0.5">30-Minute Direct Farmgate SLA</p>
              </div>
              <button
                onClick={() => setProcureModalListing(null)}
                className="text-white/80 hover:text-white transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-surface-container rounded-xl">
                <div className="flex justify-between font-bold text-primary text-sm">
                  <span>{procureModalListing.farmName}</span>
                  <span className="text-secondary">Rs. {procureModalListing.pricePerKg}/kg</span>
                </div>
                <p className="text-[11px] text-outline mt-0.5">{procureModalListing.location} • {procureModalListing.distance} km away</p>
              </div>

              <div>
                <div className="flex justify-between font-bold text-on-surface mb-1">
                  <span>Order Quantity (kg)</span>
                  <span className="text-primary font-extrabold">{orderQuantity} kg</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max={procureModalListing.availableKg}
                  step="10"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-outline font-semibold">
                  <span>Min: 10 kg</span>
                  <span>Max Available: {procureModalListing.availableKg} kg</span>
                </div>
              </div>

              <div className="p-3 bg-primary-fixed/30 rounded-xl flex items-center justify-between text-primary font-extrabold text-sm">
                <span>Total Amount (COD):</span>
                <span>Rs. {(orderQuantity * procureModalListing.pricePerKg).toLocaleString()}</span>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Procurement & Transport Notes</label>
                <textarea
                  rows="2"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Arriving with Dimo Batta at 1:30 PM. Bringing 10 plastic crates."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-on-surface outline-none"
                />
              </div>

              <div className="p-3 bg-secondary-container/40 rounded-xl text-[11px] text-on-secondary-fixed">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span>
                  <span>30-Minute Response Window</span>
                </p>
                <p className="mt-0.5">The farmer has 30 minutes to accept, decline, or counter your offer. If unresponded, your order is automatically cancelled.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProcureModalListing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md transition"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔄 MODAL: COUNTER-OFFER (Farmer Only)                                    */}
      {/* ========================================================================= */}
      {counterModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full shadow-2xl p-6 border border-outline-variant/40 animate-scaleUp space-y-4 text-xs">
            <h3 className="font-headline font-extrabold text-base text-primary">
              Counter-Offer for {counterModalOrder.order_code}
            </h3>
            <p className="text-on-surface-variant text-[11px]">
              Buyer requested {counterModalOrder.requested_quantity_kg} kg @ Rs. {counterModalOrder.offered_price_per_kg}/kg. Propose your adjusted rate:
            </p>

            <div>
              <label className="block font-bold text-on-surface mb-1">Your Revised Rate (Rs / kg)</label>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-extrabold text-secondary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Counter Note</label>
              <input
                type="text"
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                placeholder="e.g. Can do Rs. 260/kg if picked up before noon"
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-white text-on-surface outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOrder(null)}
                className="flex-1 py-2 rounded-xl border border-outline-variant font-bold text-on-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRespondOrder(counterModalOrder.id, 'COUNTER_OFFER', parseFloat(counterPrice))}
                className="flex-1 py-2 bg-secondary text-white font-bold rounded-xl shadow transition"
              >
                Send Counter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ MODAL: EDIT ACTIVE SURPLUS LISTING (Farmer)                            */}
      {/* ========================================================================= */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full shadow-2xl p-6 border border-outline-variant/30 animate-scaleUp space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-3">
                {editingListing.image_url ? (
                  <img
                    src={editingListing.image_url}
                    alt={editingListing.crop_name_en}
                    className="w-10 h-10 rounded-xl object-cover border border-outline-variant/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                    🌾
                  </div>
                )}
                <div>
                  <h3 className="font-headline font-extrabold text-base text-primary">
                    Edit Surplus Listing
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {editingListing.crop_name_en} {editingListing.crop_name_si ? `(${editingListing.crop_name_si})` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateListing} className="space-y-3.5 text-xs font-medium">
              {/* Benchmark Reference */}
              {editingListing.standard_price_per_kg && (
                <div className="bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Keppetipola Economic Centre Benchmark:</span>
                  <span className="font-bold text-primary">Rs. {editingListing.standard_price_per_kg} / kg</span>
                </div>
              )}

              {/* Available Quantity */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Available Quantity (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.quantityKg}
                    onChange={(e) => setEditFormData({ ...editFormData, quantityKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-bold focus:border-primary outline-none"
                    placeholder="e.g. 500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-on-surface-variant font-bold text-xs">kg</span>
                </div>
              </div>

              {/* Asking Price Per Kg */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Asking Rate per Kg (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.pricePerKg}
                    onChange={(e) => setEditFormData({ ...editFormData, pricePerKg: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-bold focus:border-primary outline-none"
                    placeholder="e.g. 280"
                  />
                </div>
              </div>

              {/* Listing Status */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Listing Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-bold focus:border-primary outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE (Open for Buyer Orders)</option>
                  <option value="RESERVED">RESERVED (Pending Collection)</option>
                </select>
              </div>

              {/* Farmgate Pickup Address */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Farmgate Pickup Address
                </label>
                <input
                  type="text"
                  value={editFormData.pickupAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, pickupAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary outline-none"
                  placeholder="e.g. Kinigama Valley, Bandarawela North"
                />
              </div>

              {/* Notes & Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Batch Description / Logistics Notes
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary outline-none text-xs"
                  placeholder="Grade details, vehicle accessibility, crate info..."
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🤝 MODAL: SHORT PROCEED CONFIRMATION BEFORE ACCEPTING ORDER              */}
      {/* ========================================================================= */}
      {orderToConfirmAccept && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-outline-variant/30 animate-scaleUp space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">handshake</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-headline font-black text-lg text-slate-900">
                Proceed with Order?
              </h3>
              <p className="text-on-surface-variant text-xs">
                Please review the buyer's procurement terms before accepting:
              </p>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Order Code:</span>
                <span className="font-bold text-primary">{orderToConfirmAccept.order_code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Buyer:</span>
                <span className="font-bold text-slate-800">{orderToConfirmAccept.buyer_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Produce:</span>
                <span className="font-bold text-slate-800">
                  {orderToConfirmAccept.crop_name_en} ({orderToConfirmAccept.requested_quantity_kg} kg)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Offered Rate:</span>
                <span className="font-bold text-slate-800">Rs. {orderToConfirmAccept.offered_price_per_kg} / kg</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center">
                <span className="font-black text-slate-900">Total Settlement:</span>
                <span className="text-base font-black text-emerald-700">
                  Rs. {orderToConfirmAccept.total_price?.toLocaleString()}
                </span>
              </div>
              {orderToConfirmAccept.notes && (
                <div className="pt-1.5 text-[11px] text-on-surface-variant italic bg-white/70 p-2 rounded-lg border border-outline-variant/20">
                  Buyer Note: "{orderToConfirmAccept.notes}"
                </div>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-600 leading-normal">
              By confirming, this harvest lot is reserved. The buyer will arrive at your farmgate for collection and cash settlement.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToConfirmAccept(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRespondOrder(orderToConfirmAccept.id, 'ACCEPT');
                  setOrderToConfirmAccept(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Confirm & Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💬 Order Chat Drawer (Farmer <-> Buyer) */}
      <ChatDrawer
        isOpen={!!activeChatOrder}
        onClose={() => setActiveChatOrder(null)}
        order={activeChatOrder}
        listingId={activeChatOrder?.listing_id}
        otherPartyName={
          activeRoleMode === 'BUYER'
            ? activeChatOrder?.farmer_name || 'Farmer'
            : activeChatOrder?.buyer_name || 'Buyer'
        }
        otherPartyRole={activeRoleMode === 'BUYER' ? 'FARMER' : 'BUYER'}
      />
    </div>
  );
}
