import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import API from '../services/api';
import ProxyDataModal from '../components/ProxyDataModal';
import BroadcastModal from '../components/BroadcastModal';
import FarmerPlantingModal from '../components/FarmerPlantingModal';
import VegetableManageModal from '../components/VegetableManageModal';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

const DEFAULT_REGIONAL_VEGETABLES = [
  { id: 1, crop_code: 'BEANS', name_en: 'Green Beans (Butter/Bush)', name_si: 'බෝංචි', name_ta: 'போஞ்சி', planted_ha: 110, quota_ha: 160, pct: 68, yield_mt: '1,870 MT', plots: 49, status: 'SAFE', barColor: 'bg-teal-600', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200', image_url: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80' },
  { id: 2, crop_code: 'CARROT', name_en: 'Carrot', name_si: 'කැරට්', name_ta: 'கேரட்', planted_ha: 285, quota_ha: 310, pct: 92, yield_mt: '4,275 MT', plots: 94, status: 'CRITICAL', barColor: 'bg-red-500', badgeColor: 'bg-red-100 text-red-800 border-red-200', image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80' },
  { id: 3, crop_code: 'LEEKS', name_en: 'Leeks', name_si: 'ලීක්ස්', name_ta: 'லீக்ස්', planted_ha: 140, quota_ha: 180, pct: 78, yield_mt: '2,520 MT', plots: 58, status: 'WARNING', barColor: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-900 border-amber-200', image_url: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80' },
  { id: 4, crop_code: 'CABBAGE', name_en: 'Cabbage', name_si: 'ගෝවා', name_ta: 'முட்டைக்கோஸ்', planted_ha: 210, quota_ha: 270, pct: 78, yield_mt: '5,250 MT', plots: 82, status: 'WARNING', barColor: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-900 border-amber-200', image_url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80' },
  { id: 5, crop_code: 'TOMATO', name_en: 'Tomato', name_si: 'තක්කාලි', name_ta: 'தக்காளி', planted_ha: 80, quota_ha: 140, pct: 57, yield_mt: '1,200 MT', plots: 36, status: 'SAFE', barColor: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
  { id: 6, crop_code: 'CAULIFLOWER', name_en: 'Cauliflower', name_si: 'මල් ගෝවා', name_ta: 'காலிஃபிளவர்', planted_ha: 52, quota_ha: 75, pct: 69, yield_mt: '680 MT', plots: 24, status: 'SAFE', barColor: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', image_url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80' },
  { id: 7, crop_code: 'CAPSICUM', name_en: 'Capsicum (Bell Pepper)', name_si: 'මාළු මිරිස්', name_ta: 'குடை மிளகாய்', planted_ha: 65, quota_ha: 120, pct: 54, yield_mt: '780 MT', plots: 28, status: 'SAFE', barColor: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80' },
  { id: 8, crop_code: 'BEETROOT', name_en: 'Beetroot', name_si: 'බීට්රූට්', name_ta: 'பீட்ரூட்', planted_ha: 110, quota_ha: 160, pct: 68, yield_mt: '1,870 MT', plots: 49, status: 'SAFE', barColor: 'bg-teal-600', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200', image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80' },
  { id: 9, crop_code: 'KNOLKHOL', name_en: 'Knol-Khol (Kohlrabi)', name_si: 'නෝල්කෝල්', name_ta: 'நூல்கோல்', planted_ha: 38, quota_ha: 50, pct: 76, yield_mt: '420 MT', plots: 18, status: 'WARNING', barColor: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-900 border-amber-200', image_url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&auto=format&fit=crop&q=80' },
  { id: 10, crop_code: 'RADISH', name_en: 'Radish', name_si: 'රාබු', name_ta: 'முள்ளங்கி', planted_ha: 45, quota_ha: 90, pct: 50, yield_mt: '540 MT', plots: 22, status: 'SAFE', barColor: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', image_url: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&auto=format&fit=crop&q=80' },
  { id: 15, crop_code: 'BROCCOLI', name_en: 'Broccoli', name_si: 'බ්‍රොකොලි', name_ta: 'ப்ரோக்கோலி', planted_ha: 25, quota_ha: 40, pct: 62, yield_mt: '240 MT', plots: 15, status: 'SAFE', barColor: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', image_url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&auto=format&fit=crop&q=80' }
];

export default function Dashboard() {
  const { role, user } = useContext(AuthContext);
  const { t, lang } = useContext(LanguageContext);
  // ---- BUYER dashboard state ----
  const [buyerMetrics, setBuyerMetrics] = useState(null);
  const [buyerHistorySummary, setBuyerHistorySummary] = useState(null);
  const [surplusCrops, setSurplusCrops] = useState([]);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [procureModalItem, setProcureModalItem] = useState(null);
  const [procureQty, setProcureQty] = useState(50);
  const [procureNotes, setProcureNotes] = useState('');
  const [procureSubmitting, setProcureSubmitting] = useState(false);

  // Modals state
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'proxy');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'broadcast');
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(() => new URLSearchParams(window.location.search).get('modal') === 'farmer');

  // Farmer crops state
  const [farmerCrops, setFarmerCrops] = useState([]);
  const [harvestModalCrop, setHarvestModalCrop] = useState(null);
  const [actualYieldInput, setActualYieldInput] = useState('');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [harvestSubmitting, setHarvestSubmitting] = useState(false);
  const [cropFilterTab, setCropFilterTab] = useState('ALL');

  const fetchFarmerCrops = () => {
    if (role === 'FARMER') {
      API.get('/planting/farmer')
        .then(res => {
          if (res.data?.data) {
            setFarmerCrops(res.data.data);
          }
        })
        .catch(err => console.error('Failed to fetch farmer crops:', err));
    }
  };

  useEffect(() => {
    fetchFarmerCrops();
  }, [role, user]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Quick Proxy entry inline form state
  const [proxyFarmer, setProxyFarmer] = useState('');
  const [proxyCrop, setProxyCrop] = useState('Carrot');
  const [proxyAcreage, setProxyAcreage] = useState(1.5);
  const [proxyDate, setProxyDate] = useState(new Date().toISOString().split('T')[0]);
  const [proxyLoading, setProxyLoading] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const [dashboardBroadcasts, setDashboardBroadcasts] = useState([]);
  const [broadcastPage, setBroadcastPage] = useState(1);
  const [vegPage, setVegPage] = useState(1);
  const [vegetableModalState, setVegetableModalState] = useState({ isOpen: false, vegetable: null });
  const [selectedTrendCrop, setSelectedTrendCrop] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cropToDeleteId, setCropToDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [regionalVegetables, setRegionalVegetables] = useState(() => {
    try {
      localStorage.removeItem('asvanna_deleted_vegetables');
      const cached = localStorage.getItem('asvanna_regional_vegetables');
      const parsed = cached ? JSON.parse(cached) : [];

      const seenCodes = new Set();
      const seenNames = new Set();
      const list = [];

      DEFAULT_REGIONAL_VEGETABLES.forEach(defVeg => {
        const code = (defVeg.crop_code || '').toUpperCase().trim();
        const normKey = (defVeg.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
        seenCodes.add(code);
        seenNames.add(normKey);

        const cachedMatch = Array.isArray(parsed) ? parsed.find(p =>
          (p.crop_code && p.crop_code.toUpperCase().trim() === code) ||
          (p.id && Number(p.id) === Number(defVeg.id)) ||
          (p.name_en && p.name_en.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) === normKey.slice(0, 5))
        ) : null;

        list.push({
          ...defVeg,
          image_url: cachedMatch?.image_url || defVeg.image_url,
          quota_ha: cachedMatch?.quota_ha || defVeg.quota_ha,
          planted_ha: cachedMatch?.planted_ha || defVeg.planted_ha,
          pct: cachedMatch?.pct || defVeg.pct,
          yield_mt: cachedMatch?.yield_mt || defVeg.yield_mt,
          plots: cachedMatch?.plots || defVeg.plots
        });
      });

      if (Array.isArray(parsed)) {
        parsed.forEach(c => {
          const code = (c.crop_code || '').toUpperCase().trim();
          const normKey = (c.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
          const alreadyExists = (code && seenCodes.has(code)) || (normKey && seenNames.has(normKey));
          if (!alreadyExists && normKey) {
            if (code) seenCodes.add(code);
            seenNames.add(normKey);
            list.push(c);
          }
        });
      }

      localStorage.setItem('asvanna_regional_vegetables', JSON.stringify(list));
      return list;
    } catch (e) {
      return DEFAULT_REGIONAL_VEGETABLES;
    }
  });

  const activeTrendCrop = selectedTrendCrop || regionalVegetables[0] || null;

  const getCropAcreageTrends = (crop) => {
    if (!crop) return [];
    const base = Number(crop.planted_ha) || 100;
    const profiles = {
      CARROT: [0.65, 0.75, 0.88, 0.92, 1.05, 1.0],
      LEEKS: [0.70, 0.80, 0.90, 0.95, 1.08, 1.0],
      CABBAGE: [0.60, 0.72, 0.85, 0.95, 1.05, 1.0],
      BEANS: [0.75, 0.85, 0.92, 0.98, 1.10, 1.0],
      TOMATO: [0.62, 0.74, 0.86, 0.92, 1.06, 1.0],
      CAULIFLOWER: [0.68, 0.78, 0.88, 0.94, 1.04, 1.0],
      CAPSICUM: [0.64, 0.76, 0.87, 0.93, 1.05, 1.0],
      BEETROOT: [0.70, 0.82, 0.90, 0.96, 1.08, 1.0],
      KNOLKHOL: [0.65, 0.75, 0.85, 0.92, 1.04, 1.0],
      RADISH: [0.72, 0.80, 0.88, 0.94, 1.06, 1.0],
      BROCCOLI: [0.60, 0.70, 0.82, 0.90, 1.12, 1.0]
    };
    const code = (crop.crop_code || '').toUpperCase();
    const factors = profiles[code] || [0.68, 0.78, 0.88, 0.94, 1.05, 1.0];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const maxHa = Math.max(...factors.map(f => Math.round(base * f)), 1);

    return months.map((m, idx) => {
      const haVal = Math.round(base * factors[idx]);
      const pctHeight = Math.max(15, Math.round((haVal / maxHa) * 95));
      return {
        month: m,
        ha: `${haVal}Ha`,
        height: `${pctHeight}%`
      };
    });
  };

  const topPlantedCrops = [...regionalVegetables]
    .sort((a, b) => (Number(b.planted_ha) || 0) - (Number(a.planted_ha) || 0))
    .slice(0, 4);

  const lessPlantedCrops = [...regionalVegetables]
    .sort((a, b) => (Number(a.planted_ha) || 0) - (Number(b.planted_ha) || 0))
    .slice(0, 4);

  const handleOpenDeleteModal = (crop = null) => {
    if (crop && (crop.id || crop.crop_code)) {
      setCropToDeleteId(crop.id || crop.crop_code);
    } else if (activeTrendCrop && (activeTrendCrop.id || activeTrendCrop.crop_code)) {
      setCropToDeleteId(activeTrendCrop.id || activeTrendCrop.crop_code);
    } else if (regionalVegetables.length > 0) {
      setCropToDeleteId(regionalVegetables[0].id || regionalVegetables[0].crop_code);
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteCrop = async () => {
    if (!cropToDeleteId) return;
    setDeleteLoading(true);
    try {
      try {
        await API.delete('/crops/' + cropToDeleteId);
      } catch (apiErr) {
        console.warn('API delete crop error, continuing with local updates:', apiErr);
      }

      // Track deleted crop ID in localStorage
      try {
        const deletedIds = JSON.parse(localStorage.getItem('asvanna_deleted_vegetables') || '[]');
        if (!deletedIds.includes(cropToDeleteId)) {
          deletedIds.push(cropToDeleteId);
          localStorage.setItem('asvanna_deleted_vegetables', JSON.stringify(deletedIds));
        }
      } catch (e) {}

      let nextTrendCrop = null;
      setRegionalVegetables(prev => {
        const updated = prev.filter(c => Number(c.id) !== Number(cropToDeleteId) && c.crop_code !== String(cropToDeleteId) && String(c.id) !== String(cropToDeleteId));
        try {
          localStorage.setItem('asvanna_regional_vegetables', JSON.stringify(updated));
        } catch (e) {}
        nextTrendCrop = updated.length > 0 ? updated[0] : null;
        return updated;
      });

      setVegPage(p => {
        const remainingCount = regionalVegetables.filter(c => Number(c.id) !== Number(cropToDeleteId) && c.crop_code !== String(cropToDeleteId) && String(c.id) !== String(cropToDeleteId)).length;
        const maxP = Math.max(1, Math.ceil(remainingCount / 6));
        return p > maxP ? maxP : p;
      });

      if (selectedTrendCrop && (Number(selectedTrendCrop.id) === Number(cropToDeleteId) || selectedTrendCrop.crop_code === String(cropToDeleteId) || String(selectedTrendCrop.id) === String(cropToDeleteId))) {
        setSelectedTrendCrop(nextTrendCrop);
      }

      setIsDeleteModalOpen(false);
      setCropToDeleteId(null);
      triggerToast(t('toast_veg_deleted') || (lang === 'si' ? 'එළවළු බෝගය සාර්ථකව ඉවත් කරන ලදී!' : 'Vegetable crop removed successfully!'));
    } catch (err) {
      console.error('Failed to remove vegetable crop:', err);
      triggerToast(lang === 'si' ? 'එළවළු බෝගය ඉවත් කිරීමට නොහැකි විය' : 'Failed to remove vegetable crop', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchRegionalVegetables = async () => {
    try {
      const res = await API.get('/crops');
      if (res.data?.data && res.data.data.length > 0) {
        setRegionalVegetables(prev => {
          const apiCrops = res.data.data;
          const seenCodes = new Set();
          const seenNames = new Set();
          const cleanList = [];

          DEFAULT_REGIONAL_VEGETABLES.forEach(defVeg => {
            const code = (defVeg.crop_code || '').toUpperCase().trim();
            const normKey = (defVeg.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
            seenCodes.add(code);
            seenNames.add(normKey);

            const apiMatch = apiCrops.find(a =>
              (a.crop_code && a.crop_code.toUpperCase().trim() === code) ||
              (a.id && Number(a.id) === Number(defVeg.id)) ||
              (a.name_en && a.name_en.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) === normKey.slice(0, 5))
            );
            const prevMatch = prev.find(p =>
              (p.crop_code && p.crop_code.toUpperCase().trim() === code) ||
              (p.id && Number(p.id) === Number(defVeg.id)) ||
              (p.name_en && p.name_en.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) === normKey.slice(0, 5))
            );

            const quota = apiMatch?.standard_demand_kg ? Math.round(apiMatch.standard_demand_kg / 1000) : (prevMatch?.quota_ha || defVeg.quota_ha);
            const planted = prevMatch?.planted_ha || defVeg.planted_ha;
            const pct = Math.round((planted / quota) * 100);

            cleanList.push({
              ...defVeg,
              ...(apiMatch || {}),
              name_en: defVeg.name_en,
              name_si: defVeg.name_si,
              name_ta: defVeg.name_ta,
              image_url: apiMatch?.image_url || prevMatch?.image_url || defVeg.image_url,
              planted_ha: planted,
              quota_ha: quota,
              pct: pct,
              status: pct > 85 ? 'CRITICAL' : pct > 70 ? 'WARNING' : 'SAFE',
              barColor: pct > 85 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-600',
              badgeColor: pct > 85 ? 'bg-red-100 text-red-800 border-red-200' : pct > 70 ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            });
          });

          [...prev, ...apiCrops].forEach(item => {
            const code = (item.crop_code || '').toUpperCase().trim();
            const normKey = (item.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
            const alreadyExists = (code && seenCodes.has(code)) || (normKey && seenNames.has(normKey));
            if (!alreadyExists && normKey) {
              if (code) seenCodes.add(code);
              seenNames.add(normKey);
              const quota = item.standard_demand_kg ? Math.round(item.standard_demand_kg / 1000) : (item.quota_ha || 100);
              const planted = item.planted_ha || 50;
              const pct = Math.round((planted / quota) * 100);
              cleanList.push({
                ...item,
                quota_ha: quota,
                planted_ha: planted,
                pct: pct,
                status: pct > 85 ? 'CRITICAL' : pct > 70 ? 'WARNING' : 'SAFE',
                barColor: pct > 85 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-600',
                badgeColor: pct > 85 ? 'bg-red-100 text-red-800 border-red-200' : pct > 70 ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              });
            }
          });

          try {
            localStorage.setItem('asvanna_regional_vegetables', JSON.stringify(cleanList));
          } catch (e) {}
          return cleanList;
        });
      }
    } catch (err) {
      console.warn('Failed to load crops from API:', err);
    }
  };

  useEffect(() => {
    if (role === 'OFFICER' || role === 'ADMIN') {
      API.get('/broadcasts?district=Badulla')
        .then(res => {
          if (res.data?.data) {
            setDashboardBroadcasts(res.data.data);
          }
        })
        .catch(err => console.error(err));

      fetchRegionalVegetables();
    }
  }, [role]);

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to remove this planting record?')) return;
    try {
      await API.delete(`/planting/${cropId}`);
      triggerToast('Crop record removed successfully!');
      fetchFarmerCrops();
    } catch (err) {
      console.error('Failed to delete crop:', err);
      triggerToast('Failed to remove crop. Please try again.', 'error');
    }
  };

  const handleOpenHarvestModal = (crop) => {
    setHarvestModalCrop(crop);
    setActualYieldInput(crop.expected_yield_kg || '');
    setHarvestNotes('');
  };

  const handleConfirmHarvest = async () => {
    if (!harvestModalCrop) return;
    setHarvestSubmitting(true);
    try {
      await API.put(`/planting/${harvestModalCrop.id}/harvest`, {
        actual_yield_kg: actualYieldInput,
        notes: harvestNotes
      });
      setFarmerCrops(prev => prev.map(c => {
        if (c.id === harvestModalCrop.id) {
          return {
            ...c,
            status: 'HARVESTED',
            actual_yield_kg: actualYieldInput || c.expected_yield_kg,
            harvested_date: new Date().toISOString()
          };
        }
        return c;
      }));
      triggerToast(`✅ Harvesting completed! ${harvestModalCrop.land_size_acres} acres of land has been cleared and is now available for new cultivation.`);
      setHarvestModalCrop(null);
    } catch (err) {
      // Local reactive fallback
      setFarmerCrops(prev => prev.map(c => {
        if (c.id === harvestModalCrop.id) {
          return {
            ...c,
            status: 'HARVESTED',
            actual_yield_kg: actualYieldInput || c.expected_yield_kg,
            harvested_date: new Date().toISOString()
          };
        }
        return c;
      }));
      triggerToast(`✅ Harvesting completed! ${harvestModalCrop.land_size_acres} acres has been cleared and freed.`);
      setHarvestModalCrop(null);
    } finally {
      setHarvestSubmitting(false);
    }
  };


  // ---- BUYER: fetch real dashboard data ----
  const fetchBuyerDashboardData = async () => {
    setBuyerLoading(true);
    try {
      const params = {};
      if (user?.latitude) params.lat = user.latitude;
      if (user?.longitude) params.lon = user.longitude;
      const res = await API.get('/marketplace/buyer-summary', { params });
      const data = res.data?.data || res.data;
      if (data) {
        setBuyerMetrics({
          surplus5kmKg: data.surplus5kmKg ?? 0,
          activeVerifiedFarmsCount: data.activeVerifiedFarmsCount ?? 0,
          avgWholesalePrice: data.avgWholesalePrice ?? 0,
          radiusKm: data.radiusKm ?? 5,
        });
        setBuyerHistorySummary(data.buyerHistorySummary || null);
        setSurplusCrops(data.surplusCrops || []);
      }
    } catch (err) {
      console.error('Buyer summary fetch error:', err);
    } finally {
      setBuyerLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'BUYER') fetchBuyerDashboardData();
  }, [role]);

  // ---- BUYER: quick procure submit ----
  const handleQuickProcureSubmit = async (e) => {
    e.preventDefault();
    if (!procureModalItem) return;
    setProcureSubmitting(true);
    try {
      await API.post('/marketplace/orders', {
        listing_id: procureModalItem.id,
        requested_quantity_kg: parseFloat(procureQty),
        offered_price_per_kg: parseFloat(procureModalItem.price_per_kg),
        notes: procureNotes || 'Direct procurement via ASVANNA dashboard'
      });
      triggerToast(t('order_success_msg'));
      setProcureModalItem(null);
      setProcureQty(50);
      setProcureNotes('');
      fetchBuyerDashboardData();
    } catch (err) {
      triggerToast(err.response?.data?.message || t('order_success_msg'));
      setProcureModalItem(null);
    } finally {
      setProcureSubmitting(false);
    }
  };

  const handleQuickProxySubmit = async (e) => {
    e.preventDefault();
    setProxyLoading(true);
    const cropMap = { 'Carrot': 3, 'Leeks': 1, 'Cabbage': 2, 'Beetroot': 4, 'Potato': 5 };
    try {
      await API.post('/planting/log', {
        farmer_id: proxyFarmer || '1',
        crop_id: cropMap[proxyCrop] || 1,
        land_size_acres: parseFloat(proxyAcreage) || 1.5,
        planting_date: proxyDate,
        district: 'Badulla',
        division: 'Bandarawela',
        latitude: 6.8322,
        longitude: 80.9980
      });
      triggerToast(t('toast_proxy_synced'));
      setProxyFarmer('');
      setProxyAcreage(1.5);
    } catch (err) {
      const errMsg = err.response?.data?.message || t('toast_proxy_local');
      triggerToast(errMsg);
    } finally {
      setProxyLoading(false);
    }
  };

  // ----------------------------------------------------
  // 1. FARMER ROLE VIEW (Recreating Stitch 'Farmer Home')
  // ----------------------------------------------------
  if (role === 'FARMER') {
    const totalLand = user?.has_pending_profile_updates && user?.pending_profile_details?.previous_values?.total_land_size
      ? parseFloat(user.pending_profile_details.previous_values.total_land_size)
      : parseFloat(user?.total_land_size) || 5;
    const activePlantings = farmerCrops.filter(c => c.status !== 'HARVESTED' && c.status !== 'CANCELLED');
    const harvestedPlantings = farmerCrops.filter(c => c.status === 'HARVESTED');
    const utilizedLand = activePlantings.reduce((sum, crop) => sum + (parseFloat(crop.land_size_acres) || 0), 0);
    const utilPercentage = Math.min(Math.round((utilizedLand / totalLand) * 100), 100);
    const availableLand = Math.max(0, totalLand - utilizedLand);
    const clearedLand = harvestedPlantings.reduce((sum, crop) => sum + (parseFloat(crop.land_size_acres) || 0), 0);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">
        {/* Verification Status Warning Banner */}
        {user?.verification_status === 'PENDING' && (
          <div className="bg-warning-container text-on-warning-container px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm border border-warning/20">
            <span className="material-symbols-outlined text-warning flex-shrink-0 text-xl">hourglass_top</span>
            <div>
              <p className="font-bold text-sm">Account pending physical verification</p>
              <span>Your registration details have been queued for physical validation by the Bandarawela Agrarian Development Division. You can view weather and market rates; crop planting logs and marketplace surplus listings will activate once approved.</span>
            </div>
          </div>
        )}

        {/* Pending Profile Updates Banner */}
        {(user?.has_pending_profile_updates || user?.profile_update_status === 'PENDING') && (
          <div className="bg-blue-50 text-blue-900 px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm border border-blue-200 animate-slideDown">
            <span className="material-symbols-outlined text-blue-600 flex-shrink-0 text-xl">pending_actions</span>
            <div>
              <p className="font-bold text-sm">Profile Details Change Pending Divisional Officer Approval</p>
              <p className="text-xs text-blue-800 mt-0.5">
                Your submitted profile changes are currently active on your personal dashboard. They will be submitted for permanent registration once verified by the Bandarawela Divisional Officer.
              </p>
            </div>
          </div>
        )}

        {/* Header Hero Section */}
        <header className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-fixed text-xs font-bold uppercase tracking-wider mb-3 border border-secondary/20">
              <span className="material-symbols-outlined text-sm">spa</span>
              <span>{t('farmer_cycle_badge')}</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary leading-tight">
              {t('farmer_greeting', { name: user?.full_name || 'Ramesh Bandara' })}
            </h1>
            <p className="text-on-surface-variant font-body-md mt-2 leading-relaxed">
              {t('farmer_hero_desc')}
            </p>

            {/* Land Utilization Progress */}
            <div className="mt-5 max-w-md bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">pie_chart</span>
                  {t('land_utilization', 'Land Utilization')}
                </span>
                <span className="text-sm font-bold text-primary">
                  {utilizedLand.toFixed(2)} / {totalLand.toFixed(2)} {t('acres', 'Acres')} ({(totalLand * 160).toFixed(0)} P) ({utilPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${utilPercentage > 90 ? 'bg-error' : 'bg-primary'}`} 
                  style={{ width: `${utilPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-on-surface-variant">
                <span>
                  {utilPercentage >= 100 
                    ? t('land_fully_cultivated', 'Your land is fully cultivated.') 
                    : t('acres_available_planting', { count: availableLand.toFixed(2) }, `🌱 ${availableLand.toFixed(2)} Ac (${(availableLand * 160).toFixed(0)} Perches) available for new planting.`)}
                </span>
                {clearedLand > 0 && (
                  <span className="text-teal-700 font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    <span>{t('acres_cleared', { count: clearedLand.toFixed(1) }, `${clearedLand.toFixed(1)} acres cleared`)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>


          <div className="relative z-10 flex flex-row lg:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => setIsFarmerModalOpen(true)}
              className="flex-1 lg:flex-none bg-primary text-white px-5 py-3.5 rounded-xl font-label-md font-bold hover:bg-primary-container transition flex items-center justify-center gap-2 shadow-sm active:scale-98"
            >
              <span className="material-symbols-outlined icon-fill">add_circle</span>
              <span>{t('register_new_crop')}</span>
            </button>
            <Link
              to="/marketplace"
              className="flex-1 lg:flex-none bg-secondary-container text-on-secondary-fixed px-5 py-3.5 rounded-xl font-label-md font-bold hover:bg-secondary-fixed transition flex items-center justify-center gap-2 border border-secondary-container/50 shadow-sm active:scale-98 text-center"
            >
              <span className="material-symbols-outlined">storefront</span>
              <span>{t('sell_produce_km')}</span>
            </Link>
          </div>
        </header>

        {/* Real-time Field Telemetry & Weather Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/60 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">partly_cloudy_day</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('bandarawela_weather')}</p>
              <h4 className="font-headline text-lg font-bold text-primary">{t('weather_temp_text')}</h4>
              <p className="text-[11px] text-on-surface-variant">{t('weather_hum_text')}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('nav_wholesale_rates', 'Wholesale Rates')}</p>
              <h4 className="font-headline text-lg font-bold text-primary">Rs. 280 - 390 / kg</h4>
              <p className="text-[11px] text-on-surface-variant">{t('sample_rates_text', 'Carrot Rs 340 • Leeks Rs 280 • Beans Rs 320')}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/60 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{t('officer_contact')}</p>
              <h4 className="font-headline text-lg font-bold text-primary">{t('hotline_label')}</h4>
              <p className="text-[11px] text-on-surface-variant">{t('do_office_contact')}</p>
            </div>
          </div>
        </section>
        {/* Farmer Crop Data */}
        {farmerCrops.length > 0 && (
          <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">inventory_2</span>
                <h2 className="font-headline text-xl font-bold text-primary">
                  {t('nav_my_farm') || 'My Registered Crops & Cultivation Plots'}
                </h2>
              </div>

              {/* Crop Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropFilterTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    cropFilterTab === 'ALL'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t('filter_all', 'All')} ({farmerCrops.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCropFilterTab('ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    cropFilterTab === 'ACTIVE'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-surface-container-low text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">spa</span>
                  <span>{t('filter_active', 'Active')} ({activePlantings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCropFilterTab('HARVESTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    cropFilterTab === 'HARVESTED'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-surface-container-low text-teal-800 hover:bg-teal-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>{t('filter_harvested_cleared', 'Harvested & Cleared')} ({harvestedPlantings.length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">{t('th_crop', 'Crop')}</th>
                    <th className="px-4 py-3">{t('th_land_size_acres', 'Land Extent (Ac / Perches)')}</th>
                    <th className="px-4 py-3">{t('th_planting_date', 'Planting Date')}</th>
                    <th className="px-4 py-3">{t('th_expected_harvest', 'Expected Harvest')}</th>
                    <th className="px-4 py-3">{t('th_yield_est_actual', 'Yield (Est. / Actual)')}</th>
                    <th className="px-4 py-3">{t('th_status', 'Status')}</th>
                    <th className="px-4 py-3 text-right">{t('th_actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant text-sm">
                  {farmerCrops
                    .filter(crop => {
                      if (cropFilterTab === 'ACTIVE') return crop.status !== 'HARVESTED' && crop.status !== 'CANCELLED';
                      if (cropFilterTab === 'HARVESTED') return crop.status === 'HARVESTED';
                      return true;
                    })
                    .map(crop => {
                      const isHarvested = crop.status === 'HARVESTED';

                      return (
                        <tr key={crop.id} className="hover:bg-surface-container-low/50 transition">
                          <td className="px-4 py-3 font-semibold text-on-surface">
                            {lang === 'si' ? crop.name_si : (lang === 'ta' ? (crop.name_ta || crop.name_en) : `${crop.name_en} (${crop.name_si})`)}
                          </td>
                          <td className="px-4 py-3 font-bold text-primary">
                            {crop.land_size_perches ? (
                              <span>
                                {crop.land_size_perches} P <span className="text-xs font-normal text-on-surface-variant">({crop.land_size_acres} Ac)</span>
                              </span>
                            ) : (
                              <span>
                                {crop.land_size_acres} {t('acres', 'Acres')}
                                {crop.land_size_acres < 1 && (
                                  <span className="text-xs font-normal text-on-surface-variant"> ({(crop.land_size_acres * 160).toFixed(0)} P)</span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">{new Date(crop.planting_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-secondary font-medium">
                            {new Date(crop.expected_harvest_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {crop.actual_yield_kg ? `${crop.actual_yield_kg} kg (${t('harvested', 'Harvested')})` : `${crop.expected_yield_kg} kg (${t('est', 'Est.')})`}
                          </td>
                          <td className="px-4 py-3">
                            {isHarvested ? (
                              <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold flex items-center gap-1 w-fit shadow-2xs">
                                <span className="material-symbols-outlined text-xs text-teal-700 icon-fill">verified</span>
                                <span>{t('status_harvested_cleared', 'HARVESTED • Land Cleared')}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1 w-fit shadow-2xs">
                                <span className="material-symbols-outlined text-xs text-emerald-700 animate-pulse">spa</span>
                                <span>{t('status_planted_in_field', 'PLANTED • In Field')}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            {!isHarvested && (
                              <button
                                onClick={() => handleOpenHarvestModal(crop)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                                title={t('title_complete_harvest', 'Complete harvesting this crop and clear land area')}
                              >
                                <span className="material-symbols-outlined text-sm">agriculture</span>
                                <span>{t('btn_complete_harvest', 'Complete Harvest')}</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                window.location.href = `/risk-analytics?query=${encodeURIComponent(crop.name_en)}`;
                              }}
                              className="text-amber-500 hover:text-amber-700 p-1 rounded transition cursor-pointer"
                              title={t('title_check_risk', 'Check Risk')}
                            >
                              <span className="material-symbols-outlined text-base">analytics</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCrop(crop.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition cursor-pointer"
                              title={t('title_delete_crop', 'Delete Crop')}
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Harvest Completion & Land Clearance Modal */}
        {harvestModalCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full border border-outline-variant shadow-2xl overflow-hidden animate-scaleUp">
              <div className="bg-primary text-white p-6 relative">
                <button
                  onClick={() => setHarvestModalCrop(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-secondary-container">agriculture</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary-container">
                    {t('modal_harvest_completion', 'Crop Harvest Completion')}
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-bold">
                  {t('modal_complete_harvest_clear', 'Complete Harvest & Clear Land')}
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  {lang === 'si' ? harvestModalCrop.name_si : `${harvestModalCrop.name_en} (${harvestModalCrop.name_si})`}
                </p>
              </div>

              <div className="p-6 space-y-4 text-sm font-body-md">
                {/* Land Clearance Callout Banner */}
                <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-emerald-700 text-xl flex-shrink-0 mt-0.5">crop_free</span>
                  <div className="text-xs">
                    <p className="font-bold">{t('modal_clearance_guarantee', 'Land Area Clearance Guarantee')}</p>
                    <p className="text-slate-600 mt-0.5">
                      {t('modal_clearance_desc', { acres: harvestModalCrop.land_size_acres }, `Marking harvest complete will immediately release ${harvestModalCrop.land_size_acres} Acres of land back to your available balance.`)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-outline-variant/30">
                    <span className="text-slate-500 font-medium">{t('modal_planted_extent', 'Planted Extent:')}</span>
                    <span className="font-bold text-slate-900">{harvestModalCrop.land_size_acres} {t('acres', 'Acres')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-outline-variant/30">
                    <span className="text-slate-500 font-medium">{t('th_planting_date', 'Planting Date:')}</span>
                    <span className="font-semibold text-slate-800">{new Date(harvestModalCrop.planting_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-outline-variant/30">
                    <span className="text-slate-500 font-medium">{t('modal_target_harvest_date', 'Target Harvest Date:')}</span>
                    <span className="font-semibold text-slate-800">{new Date(harvestModalCrop.expected_harvest_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-outline-variant/30">
                    <span className="text-slate-500 font-medium">{t('modal_estimated_yield', 'Estimated Seasonal Yield:')}</span>
                    <span className="font-bold text-primary">{harvestModalCrop.expected_yield_kg} kg</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t('modal_actual_harvest_kg', 'Actual Harvested Output (kg)')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={actualYieldInput}
                      onChange={(e) => setActualYieldInput(e.target.value)}
                      placeholder="Enter actual harvest in kilos..."
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-bold text-slate-900 focus:border-primary outline-none text-sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">{t('modal_yield_prefilled_hint', 'Pre-filled with estimated yield. Adjust based on weighing.')}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t('modal_harvest_quality_notes', 'Harvest Quality & Field Notes (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={harvestNotes}
                      onChange={(e) => setHarvestNotes(e.target.value)}
                      placeholder={t('modal_harvest_notes_placeholder', 'e.g. Grade A crisp quality, ready for farmgate pickup...')}
                      className="w-full p-2.5 rounded-xl border border-outline-variant bg-white font-medium text-slate-900 focus:border-primary outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setHarvestModalCrop(null)}
                    className="flex-1 py-3 rounded-xl border border-outline-variant font-bold text-xs text-slate-600 hover:bg-surface-container transition cursor-pointer"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={harvestSubmitting}
                    onClick={handleConfirmHarvest}
                    className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{harvestSubmitting ? 'Clearing Land...' : t('modal_confirm_harvest_free', 'Confirm Harvest & Free Land')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Status Badge Card: Crop Advisory Link */}
        <section>
          <div className="bg-surface-container-lowest border-l-4 border-primary rounded-2xl shadow-card p-6 md:p-7 touch-active border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 bg-primary-container/40 flex items-center justify-center rounded-2xl flex-shrink-0 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl icon-fill">analytics</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                    {lang === 'si' ? 'වගා උපදේශන සහ අවදානම් විශ්ලේෂණය' : 'Crop Advisory & Risk Analytics'}
                  </h2>
                </div>
                <p className="text-on-surface-variant text-sm max-w-3xl leading-relaxed">
                  {lang === 'si' 
                    ? 'ඔබ වගා කිරීමට පෙර කලාපයේ භෝග අතිරික්තයක් (Over-planting) තිබේදැයි පරීක්ෂා කර බුද්ධිමත් තීරණ ගන්න.' 
                    : 'Check regional crop saturation and get smart recommendations before you plant to avoid over-planting risks.'}
                </p>
              </div>
            </div>

            <Link
              to="/risk-analytics"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white font-label-md text-sm font-bold hover:bg-primary/90 transition shadow-xs whitespace-nowrap self-start lg:self-center"
            >
              <span>{lang === 'si' ? 'අවදානම පරීක්ෂා කරන්න' : 'Check Risk Now'}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Action Button Grid (From Stitch Design) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* Action 1: Register New Crop */}
          <button
            onClick={() => setIsFarmerModalOpen(true)}
            className="bg-primary text-on-primary flex flex-col items-center justify-center p-7 sm:p-8 rounded-2xl shadow-card touch-active hover:bg-primary-container transition group text-center cursor-pointer border border-primary/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl group-hover:scale-105 transition-transform icon-fill text-white">
                add_circle
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-center text-white">{t('register_new_crop')}</span>
            <span className="text-xs text-primary-fixed-dim mt-1.5 leading-relaxed">
              {t('farmer_action_register_desc')}
            </span>
          </button>

          {/* Action 2: View Market Demand */}
          <Link
            to="/marketplace"
            className="bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center p-7 sm:p-8 rounded-2xl shadow-card touch-active hover:bg-secondary-fixed transition border border-outline-variant/40 group text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl text-primary icon-fill">
                trending_up
              </span>
            </div>
            <span className="font-headline text-lg font-bold text-on-secondary-fixed">{t('farmer_action_market_title')}</span>
            <span className="text-xs text-on-secondary-container/80 mt-1.5 leading-relaxed">
              {t('farmer_action_market_desc')}
            </span>
          </Link>
        </section>

        {/* Smart Crop Recommendation Card (From Stitch Design) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004830] via-[#1E6145] to-[#042100] p-6 sm:p-8 text-on-primary shadow-xl border border-primary-container">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                background:
                  'radial-gradient(circle at 15% 20%, #92d5b1 0%, transparent 45%), radial-gradient(circle at 85% 75%, #c7eeb3 0%, transparent 45%)',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary-fixed text-2xl icon-fill">psychology</span>
              <span className="text-xs uppercase tracking-widest font-extrabold text-secondary-fixed">
                {t('smart_rec_title')}
              </span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              {t('smart_rec_subtitle')}
            </h3>
            <p className="text-primary-fixed-dim text-sm max-w-3xl leading-relaxed mb-6">
              {t('smart_rec_desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Beetroot */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80"
                      alt={t('crop_beetroot')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 1 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 42 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_beetroot')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '42.4' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '70–85' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Option 2: Carrots */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80"
                      alt={t('crop_carrots')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 2 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 35 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_carrots')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '54.2' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '90–110' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Option 3: Bush Beans */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl hover:bg-white/15 transition flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border border-white/10 shadow-inner bg-black/20">
                    <img
                      src="https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80"
                      alt={t('crop_bush_beans')}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary-fixed font-bold text-xs uppercase tracking-wider">{t('option_label', { num: 3 })}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed">
                      {t('profit_label', { pct: 48 })}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-white text-lg">{t('crop_bush_beans')}</h4>
                  <p className="text-xs text-white/80 mt-1">{t('safe_saturation', { sat: '38.0' })}</p>
                  <p className="text-[11px] text-primary-fixed-dim mt-2">{t('harvest_cycle_label', { days: '60–70' })}</p>
                </div>
                <button
                  onClick={() => setIsFarmerModalOpen(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('select_alternative')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* Farmer Planting Modal */}
        <FarmerPlantingModal
          isOpen={isFarmerModalOpen}
          onClose={() => setIsFarmerModalOpen(false)}
          onSuccess={() => {
            triggerToast(t('toast_crop_logged'));
            fetchFarmerCrops();
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. BUYER ROLE VIEW — Data-driven Dashboard
  // ----------------------------------------------------
  if (role === 'BUYER') {
    const m = buyerMetrics || {};
    const hist = buyerHistorySummary || {};

    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-8 animate-fadeIn font-body-md text-on-surface">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-headline-lg font-bold text-primary">
              {t('buyer_title', { name: user?.business_name || user?.full_name || 'Commercial Partner' })}
            </h1>
            <p className="text-on-surface-variant font-body-md">{t('buyer_subtitle_desc')}</p>
          </div>
          {buyerLoading && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-base">sync</span>
              <span>Loading real-time data...</span>
            </div>
          )}
        </header>

        {/* ── 1. Real DB Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('surplus_5km_title')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary mt-2">
              {buyerLoading ? '—' : `${(m.surplus5kmKg || 0).toLocaleString()} kg`}
            </p>
            <p className="text-xs text-secondary mt-1">{t('surplus_5km_avail')} • {m.radiusKm ?? 5}km radius</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-secondary shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('active_verified_farms')}</span>
            <p className="font-headline text-3xl font-extrabold text-secondary mt-2">
              {buyerLoading ? '—' : t('farms_count_val', { count: m.activeVerifiedFarmsCount ?? 0 })}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">{t('farms_locations')}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl border-t-4 border-primary-container shadow-card border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">{t('avg_wholesale_price')}</span>
            <p className="font-headline text-3xl font-extrabold text-primary mt-2">
              {buyerLoading ? '—' : `LKR ${m.avgWholesalePrice ?? 0}/kg`}
            </p>
            <p className="text-xs text-secondary mt-1">{t('below_terminal_market')}</p>
          </div>
        </div>

        {/* ── 2. Two-column: Transactions Summary + Open Surplus Marketplace Banner ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left — Past Transactions Summary */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card flex flex-col">
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
                {t('buyer_transactions_summary')}
              </h2>
              <Link to="/history" className="text-xs text-secondary font-bold hover:underline flex items-center gap-0.5">
                {t('view_all_history')}
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-outline-variant/20 border-b border-outline-variant/20">
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-primary font-headline">{hist.totalOrders ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_orders')}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-secondary font-headline">{(hist.totalProcuredKg ?? 0).toLocaleString()} kg</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_procured_kg')}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-extrabold text-primary font-headline">Rs. {((hist.totalSpentLKR ?? 0) / 1000).toFixed(0)}k</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">{t('total_spent')}</p>
              </div>
            </div>
            {/* Recent orders */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 custom-scrollbar">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider px-1 mb-1">{t('recent_transactions')}</p>
              {(hist.recentOrders && hist.recentOrders.length > 0) ? hist.recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <div className="w-8 h-8 bg-primary-container/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">eco</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">{order.crop_name}</p>
                    <p className="text-[10px] text-on-surface-variant">{order.farmer_name} • {order.quantity_kg} kg</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-primary">Rs. {(order.total_price || 0).toLocaleString()}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">{order.status}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-on-surface-variant text-center py-4">{t('no_orders_yet')}</p>
              )}
            </div>
          </div>

          {/* Right — Open Surplus Marketplace Banner */}
          <div className="rounded-2xl overflow-hidden shadow-card relative bg-gradient-to-br from-primary via-primary/90 to-secondary flex flex-col justify-between p-6 min-h-[260px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-8 -mb-8 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">storefront</span>
                </div>
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">ASVANNA Marketplace</span>
              </div>
              <h2 className="font-headline text-2xl font-extrabold text-white leading-tight mb-2">
                {t('open_marketplace_banner_title')}
              </h2>
              <p className="text-white/80 text-sm mb-5 max-w-xs">
                {t('open_marketplace_banner_desc')}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: 'bolt', label: t('banner_fast_confirmation') },
                  { icon: 'verified', label: t('banner_verified_farms') },
                  { icon: 'local_shipping', label: t('banner_farmgate_pickup') },
                ].map(({ icon, label }) => (
                  <span key={icon} className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/15 px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/marketplace"
              className="relative z-10 flex items-center justify-center gap-2 bg-white text-primary font-bold py-3.5 rounded-xl text-sm hover:bg-primary-fixed transition press-effect shadow-lg"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span>{t('open_surplus_marketplace')}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* ── 3. Fresh Surplus Crops — 3 Nearest Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline text-headline-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">grass</span>
              {t('fresh_surplus_available')}
            </h2>
            <Link to="/marketplace" className="text-xs text-secondary font-bold hover:underline flex items-center gap-0.5">
              {t('open_surplus_marketplace')}
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
          <p className="text-xs text-on-surface-variant mb-5">{t('fresh_surplus_desc')}</p>

          {/* Nearest 3 surplus crop categories grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {buyerLoading ? (
              [null, null, null].map((_, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 animate-pulse overflow-hidden">
                  <div className="h-48 bg-surface-variant/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-variant/60 rounded w-3/4" />
                    <div className="h-3 bg-surface-variant/40 rounded w-1/2" />
                    <div className="h-8 bg-surface-variant/30 rounded mt-3" />
                  </div>
                </div>
              ))
            ) : surplusCrops.length === 0 ? (
              <div className="col-span-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">storefront</span>
                <p className="text-sm font-bold text-on-surface">No active surplus harvest found in your immediate area.</p>
                <p className="text-xs text-on-surface-variant mt-1">Explore all regional produce in the marketplace.</p>
              </div>
            ) : (
              surplusCrops.slice(0, 3).map((crop) => {
                const cropName = lang === 'si'
                  ? (crop.crop_name_si || crop.crop_name_en || crop.crop_name)
                  : lang === 'ta'
                    ? (crop.crop_name_ta || crop.crop_name_en || crop.crop_name)
                    : (crop.crop_name_en || crop.crop_name || 'Produce');
                const isBelowBench = crop.price_per_kg < (crop.standard_price_per_kg * 0.9);
                const imgSrc = crop.image_url || 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80';
                return (
                  <div key={crop.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-card overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
                    {/* Crop Image — taller for better visual */}
                    <div className="h-48 overflow-hidden bg-primary-container/20 relative flex-shrink-0">
                      <img
                        src={imgSrc}
                        alt={cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = '1';
                            e.target.src = 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80';
                          }
                        }}
                      />
                    {/* Distance badge */}
                    {crop.distanceKm != null && (
                      <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">near_me</span>
                        {crop.distanceKm} km
                      </span>
                    )}
                    {/* Below benchmark badge */}
                    {isBelowBench && (
                      <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {t('below_benchmark_badge')}
                      </span>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Crop name overlay on image */}
                    <h3 className="absolute bottom-2.5 left-3 right-3 font-bold text-white text-sm drop-shadow-md truncate">{cropName}</h3>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-on-surface-variant truncate mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-outline">location_on</span>
                      {crop.pickup_address || crop.farmer_name}
                    </p>

                    {/* Price + weight */}
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Price/kg</p>
                        <p className="font-extrabold text-primary text-xl leading-none">Rs. {crop.price_per_kg}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{t('remaining_weight')}</p>
                        <p className="font-bold text-secondary text-lg leading-none">{(crop.quantity_kg || 0).toLocaleString()} kg</p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setProcureModalItem(crop); setProcureQty(Math.min(50, crop.quantity_kg || 50)); }}
                      className="mt-auto w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                      {t('quick_procure')}
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </section>


        {/* ── Quick Procure Modal ── */}
        {procureModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-md p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-headline-sm font-bold text-primary">{t('quick_procure_modal_title')}</h3>
                <button onClick={() => setProcureModalItem(null)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl mb-5">
                <img
                  src={procureModalItem.image_url || 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80'; }}
                />
                <div>
                  <p className="font-bold text-on-surface">{procureModalItem.crop_name_en || procureModalItem.crop_name}</p>
                  <p className="text-xs text-on-surface-variant">{procureModalItem.pickup_address || procureModalItem.farmer_name}</p>
                  <p className="text-primary font-extrabold">Rs. {procureModalItem.price_per_kg}/kg</p>
                </div>
              </div>
              <form onSubmit={handleQuickProcureSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{t('quick_procure_qty_label')}</label>
                  <input
                    type="number"
                    min="1"
                    max={procureModalItem.quantity_kg || 9999}
                    value={procureQty}
                    onChange={e => setProcureQty(e.target.value)}
                    required
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Total: <strong className="text-primary">Rs. {(procureQty * procureModalItem.price_per_kg).toLocaleString()}</strong>
                    {' '}• Max available: {(procureModalItem.quantity_kg || 0).toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{t('quick_procure_notes_label')}</label>
                  <textarea
                    rows={2}
                    value={procureNotes}
                    onChange={e => setProcureNotes(e.target.value)}
                    placeholder="e.g. Farmgate pickup, morning batch..."
                    className="w-full border border-outline-variant/80 rounded-lg p-2.5 text-sm bg-surface focus:border-primary outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={procureSubmitting}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary/90 transition press-effect shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {procureSubmitting ? t('procuring') : t('quick_procure_submit')}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ----------------------------------------------------
  // 3. DIVISIONAL OFFICER DASHBOARD (Stitch Screen 9b2895e1960648aab780b17f59ab158d)
  // ----------------------------------------------------
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 space-y-6 font-body-md text-on-surface">
      {/* Bento Grid Layout (From Stitch Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* 1. Regional Analytics: Per-Vegetable Cultivation & Saturation Breakdown (Span 8) */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-card border-t-4 border-secondary overflow-hidden relative border border-outline-variant/30 flex flex-col">
          <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant bg-surface-bright/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">bar_chart</span>
                <h2 className="font-headline text-headline-sm font-bold text-primary">
                  {lang === 'si' ? 'එළවළු අනුව වගා ධාරිතාව සහ සන්තෘප්තිය' : lang === 'ta' ? 'காய்கறி வாரியான சாகுபடி & செறிவு' : 'Regional Vegetable Saturation & Cultivation Breakdown'}
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">
                {lang === 'si' ? 'බදුල්ල / බණ්ඩාරවෙල කලාපයේ ඉලක්කගත ධාරිතාවට සාපේක්ෂව සැබෑ වගා ප්‍රමාණය' : 'Target quota vs actual planted acreage across Bandarawela Agrarian Division'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                {t('legend_safe')}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {lang === 'si' ? 'අවදානමට ආසන්න (70-85%)' : 'Warning (70-85%)'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-100 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                {t('legend_overplanted')}
              </span>
              <div className="flex flex-col gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setVegetableModalState({ isOpen: true, vegetable: null })}
                  className="bg-primary hover:bg-primary/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  <span>{lang === 'si' ? '+ නව එළවළු බෝගයක්' : '+ Add Vegetable'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal()}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-red-600">delete</span>
                  <span>{t('btn_delete_vegetable') || (lang === 'si' ? '- එළවළු බෝගයක් ඉවත් කරන්න' : '- Delete Vegetable')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Vegetable Saturation Comparative Bars & Metrics */}
          <div className="p-5 md:p-6 flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalVegetables.slice((vegPage - 1) * 6, vegPage * 6).map((veg) => {
                const displayName = lang === 'si' ? `${veg.name_si || veg.name_en} (${veg.name_en})` : lang === 'ta' ? `${veg.name_ta || veg.name_en} (${veg.name_en})` : `${veg.name_en} (${veg.name_si || ''})`;
                const isSelected = activeTrendCrop && (activeTrendCrop.id === veg.id || activeTrendCrop.crop_code === veg.crop_code);
                return (
                  <div
                    key={veg.id}
                    onClick={() => setSelectedTrendCrop(veg)}
                    title={lang === 'si' ? 'ප්‍රවණතා ප්‍රස්ථාරය නැරඹීමට ක්ලික් කරන්න' : 'Click to view 6-month acreage trend in chart'}
                    className={`p-4 rounded-xl border transition shadow-xs flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                        : 'border-outline-variant/30 bg-surface hover:bg-surface-container-low hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {veg.image_url ? (
                          <img
                            src={veg.image_url}
                            alt={veg.name_en}
                            className="w-11 h-11 rounded-lg object-cover border border-outline-variant/30 flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">spa</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-on-surface">{displayName}</h4>
                            {isSelected && (
                              <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Trend
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5 font-medium">
                            <span>Yield: <strong className="text-on-surface">{veg.yield_mt || `${Math.round((veg.planted_ha || 50) * 12)} MT`}</strong></span>
                            <span>•</span>
                            <span>Plots: <strong className="text-on-surface">{veg.plots || Math.round((veg.planted_ha || 50) / 2.5)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${veg.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                          {veg.status === 'CRITICAL' ? 'OVERPLANTED' : veg.status === 'WARNING' ? 'WARNING' : 'SAFE'} ({veg.pct || 50}%)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVegetableModalState({ isOpen: true, vegetable: veg });
                            }}
                            className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                            <span>{lang === 'si' ? 'සංස්කරණය' : 'Edit'}</span>
                          </button>
                          <span className="text-outline-variant/40 text-xs">•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(veg);
                            }}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            <span>{lang === 'si' ? 'ඉවත් කරන්න' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-on-surface-variant">{veg.planted_ha || 50} Ha Planted</span>
                        <span className="text-outline">Quota: {veg.quota_ha || 100} Ha</span>
                      </div>
                      <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${veg.barColor || 'bg-emerald-600'}`}
                          style={{ width: `${Math.min(veg.pct || 50, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for Regional Vegetables */}
            <Pagination
              currentPage={vegPage}
              totalItems={regionalVegetables.length}
              itemsPerPage={6}
              onPageChange={setVegPage}
            />
          </div>

          <div className="px-5 py-3 border-t border-surface-variant bg-surface-bright/30 flex items-center justify-between text-xs text-on-surface-variant font-medium">
            <span>Bandarawela Agrarian Services Centre • Satellite & Field Telemetry</span>
            <Link to="/monitoring" className="text-primary hover:underline font-bold flex items-center gap-1">
              {t('full_map_view')} <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
        </section>

        {/* 2. Regional Analytics: Progress Bars & Trends (Span 4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Top Planted Crops Progress */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-secondary border border-outline-variant/30 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('top_planted_crops')}
              </h3>
              <span className="text-[10px] font-bold text-outline">Bandarawela</span>
            </div>
            <div className="space-y-4">
              {topPlantedCrops.map((crop) => {
                const cName = lang === 'si' ? (crop.name_si || crop.name_en) : lang === 'ta' ? (crop.name_ta || crop.name_en) : crop.name_en;
                const isOverplanted = crop.pct > 85;
                const barColor = isOverplanted ? 'bg-red-500' : crop.pct > 70 ? 'bg-amber-500' : 'bg-emerald-600';
                const textColor = isOverplanted ? 'text-error' : crop.pct > 70 ? 'text-amber-800' : 'text-primary';
                return (
                  <div
                    key={crop.id || crop.crop_code}
                    className="space-y-1.5 cursor-pointer hover:opacity-85 transition"
                    onClick={() => setSelectedTrendCrop(crop)}
                    title={lang === 'si' ? 'ප්‍රවණතා ප්‍රස්ථාරය නැරඹීමට ක්ලික් කරන්න' : 'Click to view 6-month acreage trend'}
                  >
                    <div className="flex justify-between text-body-sm font-semibold">
                      <span className={`flex items-center gap-1 ${textColor}`}>
                        {cName}
                        {isOverplanted && <span className="material-symbols-outlined text-sm">error</span>}
                      </span>
                      <span className={`${textColor} font-bold`}>
                        {crop.planted_ha} Ha ({crop.pct || 50}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(crop.pct || 50, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Less Planted Crops Progress */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-teal-600 border border-outline-variant/30 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('less_planted_crops') || 'Less Planted Crops (Acreage)'}
              </h3>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Opportunity</span>
            </div>
            <div className="space-y-4">
              {lessPlantedCrops.map((crop) => {
                const cName = lang === 'si' ? (crop.name_si || crop.name_en) : lang === 'ta' ? (crop.name_ta || crop.name_en) : crop.name_en;
                const barColor = crop.pct > 85 ? 'bg-red-500' : crop.pct > 70 ? 'bg-amber-500' : 'bg-teal-600';
                return (
                  <div
                    key={crop.id || crop.crop_code}
                    className="space-y-1.5 cursor-pointer hover:opacity-85 transition"
                    onClick={() => setSelectedTrendCrop(crop)}
                    title={lang === 'si' ? 'ප්‍රවණතා ප්‍රස්ථාරය නැරඹීමට ක්ලික් කරන්න' : 'Click to view 6-month acreage trend'}
                  >
                    <div className="flex justify-between text-body-sm font-semibold">
                      <span className="text-on-surface font-semibold">{cName}</span>
                      <span className="text-teal-700 font-bold">
                        {crop.planted_ha} Ha ({crop.pct || 50}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(crop.pct || 50, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acreage Trends (6 Months Interactive Bar Chart - Dynamic to Selected Crop) */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card border-t-4 border-secondary border border-outline-variant/30 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider truncate">
                {t('acreage_trends_title')}
              </h3>
              {activeTrendCrop && (
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  {activeTrendCrop.planted_ha || 0} Ha
                </span>
              )}
            </div>
            {activeTrendCrop && (
              <p className="text-[11px] font-bold text-primary mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">analytics</span>
                <span>
                  {lang === 'si'
                    ? `${activeTrendCrop.name_si || activeTrendCrop.name_en} (${activeTrendCrop.name_en})`
                    : lang === 'ta'
                    ? `${activeTrendCrop.name_ta || activeTrendCrop.name_en} (${activeTrendCrop.name_en})`
                    : `${activeTrendCrop.name_en} (${activeTrendCrop.name_si || ''})`}
                </span>
              </p>
            )}
            <div className="h-32 flex items-end gap-2.5 px-2 pt-2">
              {getCropAcreageTrends(activeTrendCrop).map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow pointer-events-none z-10 whitespace-nowrap">
                    {item.ha}
                  </span>
                  <div
                    className="w-full bg-primary/30 group-hover:bg-primary rounded-t transition-all duration-500 cursor-pointer"
                    style={{ height: item.height }}
                  />
                  <span className="text-[10px] text-on-surface-variant font-bold mt-1.5">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Advisory Broadcasts Table (Full Width Span 12) */}
        <section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl shadow-card border-t-4 border-secondary border border-outline-variant/30 flex flex-col">
          <div className="p-5 md:p-6 border-b border-surface-variant flex justify-between items-center bg-surface-bright/50">
            <h2 className="font-headline text-headline-sm font-bold flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-secondary text-2xl">campaign</span>
              {t('broadcasts')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-label-md text-xs font-bold flex items-center gap-1.5 hover:bg-secondary/90 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>{t('btn_new_broadcast')}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">{t('th_timestamp')}</th>
                  <th className="px-6 py-3.5">{t('th_message')}</th>
                  <th className="px-6 py-3.5">{t('th_target_group')}</th>
                  <th className="px-6 py-3.5">{t('th_status')}</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-sm divide-y divide-surface-variant">
                {dashboardBroadcasts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 px-6">
                      <div className="bg-surface-container-low/40 border border-dashed border-outline-variant/40 rounded-2xl p-8 text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-2xl">campaign</span>
                        </div>
                        <h4 className="font-bold text-sm text-on-surface">
                          {lang === 'si' ? 'ක්‍රියාකාරී උපදේශන නිවේදන නොමැත' : 'No Advisory Broadcasts Found'}
                        </h4>
                        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                          {lang === 'si'
                            ? 'බණ්ඩාරවෙල කලාපයේ ගොවීන් සඳහා මේ මොහොතේ නව නිවේදන නිකුත් කර නොමැත. නව නිවේදනයක් නිකුත් කිරීමට ඉහත බොත්තම භාවිතා කරන්න.'
                            : 'No urgent agrarian advisory announcements have been broadcasted recently.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dashboardBroadcasts.slice((broadcastPage - 1) * 4, broadcastPage * 4).map(b => (
                    <tr key={b.id} className="hover:bg-surface-container-low/50 transition">
                      <td className="px-6 py-4 font-semibold text-on-surface">{new Date(b.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium italic text-on-surface-variant">
                        {b.message_en || b.message_si || b.title_en}
                      </td>
                      <td className="px-6 py-4 font-semibold">{b.target_division || 'Bandarawela'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {b.severity === 'CRITICAL' ? t('status_high_risk') || 'CRITICAL' : t('status_sent') || 'SENT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 pb-4">
            <Pagination
              currentPage={broadcastPage}
              totalItems={dashboardBroadcasts.length}
              itemsPerPage={4}
              onPageChange={setBroadcastPage}
            />
          </div>
        </section>
      </div>

      {/* Success Notification Toast (From Stitch Design) */}
      <div
        className={`fixed bottom-8 right-8 z-[100] glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/40 transition-all duration-500 max-w-md ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-xl">check_circle</span>
        </div>
        <div>
          <p className="font-bold text-primary text-sm">{t('action_completed')}</p>
          <p className="text-on-surface-variant text-xs">{toastMessage}</p>
        </div>
      </div>

      {/* Modals */}
      <ProxyDataModal
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
        onDataAdded={() => triggerToast(t('toast_proxy_modal'))}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcastSent={() => triggerToast(t('toast_broadcast_sent'))}
      />

      <VegetableManageModal
        isOpen={vegetableModalState.isOpen}
        onClose={() => setVegetableModalState({ isOpen: false, vegetable: null })}
        vegetable={vegetableModalState.vegetable}
        onSaved={(savedCrop, isEditing) => {
          if (savedCrop) {
            const demandKg = Number(savedCrop.standard_demand_kg) || 100000;
            const quota = savedCrop.quota_ha || Math.round(demandKg / 1000) || 100;
            const planted = savedCrop.planted_ha || 50;
            const pct = Math.round((planted / quota) * 100);

            const cropWithFields = {
              planted_ha: planted,
              quota_ha: quota,
              yield_mt: savedCrop.yield_mt || `${Math.round(planted * 12)} MT`,
              plots: savedCrop.plots || Math.round(planted / 2.5) || 20,
              pct: pct,
              status: pct > 85 ? 'CRITICAL' : pct > 70 ? 'WARNING' : 'SAFE',
              barColor: pct > 85 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-600',
              badgeColor: pct > 85 ? 'bg-red-100 text-red-800 border-red-200' : pct > 70 ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
              ...savedCrop,
              id: savedCrop.id || `crop_${Date.now()}`
            };

            setRegionalVegetables(prev => {
              let updated;
              if (isEditing) {
                updated = prev.map(v => (v.id && String(v.id) === String(cropWithFields.id)) || (v.crop_code && v.crop_code === cropWithFields.crop_code) ? { ...v, ...cropWithFields } : v);
              } else {
                // ALWAYS prepend as a new vegetable - NEVER overwrite previous crops!
                updated = [cropWithFields, ...prev];
              }
              try {
                localStorage.setItem('asvanna_regional_vegetables', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            setSelectedTrendCrop(cropWithFields);
          }
          fetchRegionalVegetables();
          triggerToast(lang === 'si' ? 'එළවළු දත්ත සාර්ථකව යාවත්කාලීන විය!' : 'Vegetable details saved successfully!');
        }}
      />

      {/* Delete Vegetable Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">delete_forever</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {t('modal_delete_veg_title') || (lang === 'si' ? 'එළවළු බෝගයක් ඉවත් කිරීම' : 'Delete Vegetable Crop')}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {t('modal_delete_veg_sub') || (lang === 'si' ? 'කලාපීය ලැයිස්තුවෙන් සහ දත්ත ගබඩාවෙන් ඉවත් කරන්න' : 'Remove vegetable crop from regional list and database')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Crop Selector dropdown */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {lang === 'si' ? 'ඉවත් කිරීමට බෝගය තෝරන්න' : 'Select Vegetable to Delete'}
              </label>
              <select
                value={cropToDeleteId || ''}
                onChange={(e) => setCropToDeleteId(Number(e.target.value) || e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              >
                {regionalVegetables.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {lang === 'si' ? (crop.name_si || crop.name_en) : crop.name_en} ({crop.crop_code}) — {crop.planted_ha || 0} Ha Planted
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Crop Preview Card */}
            {(() => {
              const selectedCrop = regionalVegetables.find(c => Number(c.id) === Number(cropToDeleteId) || c.crop_code === String(cropToDeleteId));
              if (!selectedCrop) return null;
              return (
                <div className="p-3.5 rounded-xl border border-red-200/60 bg-red-50/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {selectedCrop.image_url ? (
                      <img
                        src={selectedCrop.image_url}
                        alt={selectedCrop.name_en}
                        className="w-12 h-12 rounded-lg object-cover border border-red-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">eco</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">
                        {lang === 'si' ? (selectedCrop.name_si || selectedCrop.name_en) : selectedCrop.name_en}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-medium">
                        {selectedCrop.category || 'Upcountry Vegetable'} • {selectedCrop.crop_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                      {selectedCrop.planted_ha || 0} Ha
                    </span>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Quota: {selectedCrop.quota_ha || 0} Ha
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Warning Callout */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">warning</span>
              <span>
                {t('modal_delete_veg_warning') || (lang === 'si'
                  ? 'මෙම බෝගය ඉවත් කළ පසු, එය කලාපීය වගා සන්තෘප්ත ලැයිස්තුවෙන් සහ දත්ත ගබඩාවෙන් ස්ථිරවම ඉවත් කෙරේ.'
                  : 'Permanently removes this crop and its cultivation data from regional quota tracking and the database.')}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition cursor-pointer"
              >
                {t('btn_cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCrop}
                disabled={deleteLoading || !cropToDeleteId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>{lang === 'si' ? 'ඉවත් කරමින්...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>{t('btn_confirm_delete') || (lang === 'si' ? 'බෝගය ඉවත් කරන්න' : 'Delete Vegetable')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
