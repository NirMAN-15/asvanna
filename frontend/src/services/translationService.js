/**
 * ASVANNA Trilingual Auto-Translation Engine (EN ⟷ SI ⟷ TA)
 * Seamlessly auto-translates warning alerts, advisory broadcasts, and crop descriptions
 * between English, Sinhala, and Tamil with offline agricultural dictionary fallbacks.
 */

// Local agricultural lexicon for high-accuracy contextual translation
const AGRI_LEXICON = {
  // Crops
  'leeks': { si: 'ලීක්ස්', ta: 'லீக்ஸ்' },
  'carrot': { si: 'කැරට්', ta: 'கேரட்' },
  'cabbage': { si: 'ගෝවා', ta: 'முட்டைக்கோஸ்' },
  'beetroot': { si: 'බීට්රූට්', ta: 'பீட்ரூட்' },
  'potato': { si: 'අර්තාපල්', ta: 'உருளைக்கிழங்கு' },
  'beans': { si: 'බෝංචි', ta: 'போஞ்சி' },
  'tomato': { si: 'තක්කාලි', ta: 'தக்காளி' },
  'capsicum': { si: 'මාළු මිරිස්', ta: 'குடை மிளகாய்' },
  'radish': { si: 'රාබු', ta: 'முள்ளங்கி' },
  'knol-khol': { si: 'නෝල්කෝල්', ta: 'நூல்கோல்' },
  'cauliflower': { si: 'මල්ගෝවා', ta: 'காலிஃபிளவர்' },
  'broccoli': { si: 'බ්‍රොකොලි', ta: 'ப்ரோக்கோலி' },
  'pumpkin': { si: 'වට්ටක්කා', ta: 'பூசணி' },
  'cucumber': { si: 'පිපිඤ්ඤා', ta: 'வெள்ளரிக்காய்' },
  'green chili': { si: 'අමු මිරිස්', ta: 'பச்சை மிளகாய்' },
  'red onion': { si: 'රතු ළූණු', ta: 'சிவப்பு வெங்காயம்' },

  // Advisory & Market Terms
  'warning': { si: 'අවවාදයයි', ta: 'எச்சரிக்கை' },
  'critical': { si: 'අවදානම්', ta: 'முக்கியமான' },
  'urgent': { si: 'හදිසි', ta: 'அவசரம்' },
  'advisory': { si: 'කෘෂිකාර්මික උපදේශනය', ta: 'விவசாய ஆலோசனை' },
  'market glut': { si: 'වෙළෙඳපොළ අතිරික්තය', ta: 'சந்தை மிகை வழங்கல்' },
  'glut': { si: 'අතිරික්තය', ta: 'அதிகப்படியான வழங்கல்' },
  'oversupply': { si: 'ඉහළ සැපයුම', ta: 'அதிக வழங்கல்' },
  'overplanting': { si: 'අධික වගාව', ta: 'அதிகப்படியான நடவு' },
  'harvest': { si: 'අස්වැන්න', ta: 'அறுவடை' },
  'cultivation': { si: 'වගාව', ta: 'பயிர்ச்செய்கை' },
  'bandarawela': { si: 'බණ්ඩාරවෙල', ta: 'பண்டாரவளை' },
  'badulla': { si: 'බදුල්ල', ta: 'பதுளை' },
  'price collapse': { si: 'මිල පහත වැටීම', ta: 'விலை வீழ்ச்சி' },
  'price': { si: 'මිල', ta: 'விலை' },
  'fertilizer': { si: 'පොහොර', ta: 'உரம்' },
  'irrigation': { si: 'ජල සම්පාදනය', ta: 'நீர்ப்பாசனம்' },
  'pest': { si: 'පළිබෝධ', ta: 'பூச்சி' },
  'disease': { si: 'රෝගය', ta: 'நோய்' },
  'fungal blight': { si: 'දිලීර රෝගය', ta: 'பூஞ்சை நோய்' },
  'recommended': { si: 'නිර්දේශිත', ta: 'பரிந்துரைக்கப்பட்டது' },
  'stop planting': { si: 'වගා කිරීම නවත්වන්න', ta: 'நடவு செய்வதை நிறுத்துங்கள்' },
  'reduce planting': { si: 'වගාව සීමා කරන්න', ta: 'நடவு செய்வதைக் குறைக்கவும்' },
  'switch to': { si: 'විකල්ප බෝග වලට මාරුවන්න', ta: 'மாற்றுப் பயிர்களுக்கு மாறவும்' }
};

/**
 * Detect language of a given text (basic script heuristic)
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  const trimmed = text.trim();
  if (/[\u0D80-\u0DFF]/.test(trimmed)) return 'si'; // Sinhala Unicode block
  if (/[\u0B80-\u0BFF]/.test(trimmed)) return 'ta'; // Tamil Unicode block
  return 'en';
}

/**
 * Translate a single text string from sourceLang to targetLang.
 * Uses Google Translate client API with offline fallback.
 */
export async function translateText(text, fromLang, toLang) {
  if (!text || !text.trim()) return '';
  if (fromLang === toLang) return text;

  const cleanText = text.trim();

  // 1. Try MyMemory Translation API (Highly reliable, fast, supports EN, SI, TA with zero rate limit blocks)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(mmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const trans = data.responseData.translatedText.trim();
        if (
          trans &&
          !trans.toLowerCase().startsWith('invalid') &&
          !trans.toLowerCase().includes('query error') &&
          !trans.toUpperCase().includes('MYMEMORY WARNING')
        ) {
          return trans;
        }
      }
    }
  } catch (err) {
    // Proceed to secondary provider
  }

  // 2. Try Google Translate client API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('');
        if (translated && translated.trim()) {
          return translated.trim();
        }
      }
    }
  } catch (err) {
    // Graceful fallback to local lexicon
  }

  // 2. Offline Lexicon Fallback
  let fallback = cleanText;
  const lower = cleanText.toLowerCase();

  // Exact lexicon lookup
  if (AGRI_LEXICON[lower] && AGRI_LEXICON[lower][toLang]) {
    return AGRI_LEXICON[lower][toLang];
  }

  // Partial phrase replacement for common keywords
  Object.keys(AGRI_LEXICON).forEach(key => {
    if (lower.includes(key) && AGRI_LEXICON[key][toLang]) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      fallback = fallback.replace(regex, AGRI_LEXICON[key][toLang]);
    }
  });

  return fallback;
}

/**
 * Auto-fill trilingual fields from a single source text.
 * Returns an object with { en, si, ta }.
 */
export async function autoFillTrilingual(sourceText, explicitSourceLang = null) {
  if (!sourceText || !sourceText.trim()) {
    return { en: '', si: '', ta: '' };
  }

  const sourceLang = explicitSourceLang || detectLanguage(sourceText);
  const result = {
    en: sourceLang === 'en' ? sourceText.trim() : '',
    si: sourceLang === 'si' ? sourceText.trim() : '',
    ta: sourceLang === 'ta' ? sourceText.trim() : ''
  };

  const targets = ['en', 'si', 'ta'].filter(l => l !== sourceLang);

  await Promise.all(
    targets.map(async (targetLang) => {
      try {
        const translated = await translateText(sourceText, sourceLang, targetLang);
        result[targetLang] = translated;
      } catch (err) {
        result[targetLang] = sourceText;
      }
    })
  );

  return result;
}
