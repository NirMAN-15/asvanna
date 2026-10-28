/**
 * ASVANNA Bandarawela Grama Niladhari (GND) Geolocation Utility
 * Backend service for coordinate lookup and proximity validation
 */

const BANDARAWELA_GND_OPTIONS = [
  { id: 'bandarawela_central', nameEn: 'Bandarawela Central', nameSi: 'බණ්ඩාරවෙල මධ්‍යම', lat: 6.8270, lng: 80.9980 },
  { id: 'bindunuwewa', nameEn: 'Bindunuwewa', nameSi: 'බිඳුනුවැව', lat: 6.8390, lng: 80.9910 },
  { id: 'kinigama', nameEn: 'Kinigama', nameSi: 'කිනිගම', lat: 6.8150, lng: 81.0120 },
  { id: 'heeloya', nameEn: 'Heeloya', nameSi: 'හීල්ඔය', lat: 6.8450, lng: 81.0250 },
  { id: 'halpe', nameEn: 'Halpe', nameSi: 'හල්පේ', lat: 6.7820, lng: 80.9850 },
  { id: 'welimada_road', nameEn: 'Welimada Road', nameSi: 'වැලිමඩ පාර', lat: 6.8520, lng: 80.9820 },
  { id: 'diyatalawa_road', nameEn: 'Diyatalawa Road', nameSi: 'දියතලාව පාර', lat: 6.8180, lng: 80.9700 },
  { id: 'haputale_road', nameEn: 'Haputale Road', nameSi: 'හපුතලේ පාර', lat: 6.7950, lng: 80.9650 },
  { id: 'kahatathawela', nameEn: 'Kahatathawela', nameSi: 'කහටතැවෙල', lat: 6.8320, lng: 81.0150 },
  { id: 'mirahawatte', nameEn: 'Mirahawatte', nameSi: 'මිරහවත්ත', lat: 6.8650, lng: 80.9750 },
  { id: 'wewatenna', nameEn: 'Wewatenna', nameSi: 'වැවතැන්න', lat: 6.8350, lng: 81.0020 },
  { id: 'obada_ella', nameEn: 'Obada Ella', nameSi: 'ඔබඩ ඇල්ල', lat: 6.8120, lng: 80.9930 },
  { id: 'ambatenna', nameEn: 'Ambatenna', nameSi: 'අඹතැන්න', lat: 6.8400, lng: 81.0080 },
  { id: 'rathkarawwa', nameEn: 'Rathkarawwa', nameSi: 'රත්කරව්ව', lat: 6.8480, lng: 80.9950 },
  { id: 'diganatenna', nameEn: 'Diganatenna', nameSi: 'දිගනතැන්න', lat: 6.8210, lng: 80.9780 },
  { id: 'mahaulpatha', nameEn: 'Mahaulpatha', nameSi: 'මහාඋල්පත', lat: 6.8160, lng: 81.0200 },
  { id: 'kabillawela', nameEn: 'Kabillawela', nameSi: 'කැබිල්ලවෙල', lat: 6.8340, lng: 80.9890 },
  { id: 'kirioruwa', nameEn: 'Kirioruwa', nameSi: 'කිරිඔරුව', lat: 6.8240, lng: 81.0040 },
  { id: 'konthahela', nameEn: 'Konthahela', nameSi: 'කොන්තහෙල', lat: 6.8420, lng: 81.0180 },
  { id: 'ettampitiya', nameEn: 'Ettampitiya', nameSi: 'ඇත්තම්පිටිය', lat: 6.8680, lng: 81.0310 }
];

function normalizeGndKey(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getGndCoordinates(gndName) {
  if (!gndName) {
    return { lat: 6.8270, lng: 80.9980 }; // Bandarawela Central fallback
  }

  const key = normalizeGndKey(gndName);
  const match = BANDARAWELA_GND_OPTIONS.find(g => {
    const optKey = normalizeGndKey(g.nameEn);
    return optKey === key || key.includes(optKey) || optKey.includes(key);
  });

  if (match) {
    return { lat: match.lat, lng: match.lng };
  }

  if (key.includes('heel') || key.includes('oya')) return { lat: 6.8450, lng: 81.0250 };
  if (key.includes('wewa') || key.includes('tenna')) return { lat: 6.8350, lng: 81.0020 };

  return { lat: 6.8270, lng: 80.9980 };
}

module.exports = {
  BANDARAWELA_GND_OPTIONS,
  getGndCoordinates
};
