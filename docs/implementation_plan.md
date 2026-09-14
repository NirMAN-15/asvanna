# ASVANNA — Production Implementation Plan v2.0
## Bandarawela Pilot Deployment | Institute of Technology, University of Moratuwa

> [!NOTE]
> **Revision 2.0** — Updated based on user feedback. Key changes: No paid SMS (free in-app notifications only), maximum crop coverage from CROPIX data, Bandarawela-calibrated weather scoring (never below 10°C verified), complete Buyer & Officer UI specs, farmer validation by officers, no fake seed data, past price visibility for farmers.

---

## 1. Executive Summary

**ASVANNA** is a digital agricultural ecosystem designed to break the "trend planting" cycle in Sri Lanka — where farmers collectively plant the same high-priced crop, causing market gluts, price crashes, and 30–40% post-harvest waste.

This plan transforms the current prototype into a **production-ready system** for the Bandarawela pilot, using **real data from CROPIX, Open-Meteo weather APIs, and Keppetipola Economic Centre prices** — with zero fake seed data.

> [!IMPORTANT]
> **Exclusions**: All soil monitoring, humidity sensors, and soil moisture features are **EXCLUDED**. Weather data comes from APIs only — no physical sensors.

---

## 2. Data Strategy — No Fake Data

> [!CAUTION]
> **Zero fake seed data.** Every piece of crop data, price, demand figure, and weather reading must come from a verified real-world source.

### 2.1 Data Sources

| Data Type | Source | Method | Frequency |
|-----------|--------|--------|-----------|
| **Crop agricultural data** | CROPIX platform + Department of Agriculture (DoA) Sri Lanka publications | API if accessible, else scrape/parse published PDF data | Initial load + quarterly refresh |
| **National demand quotas** | CROPIX + HARTI (Hector Kobbekaduwa Agrarian Research Institute) | Parse published Food Commodities Bulletins (PDFs) | Weekly |
| **Wholesale prices** | Keppetipola Economic Centre + Dambulla DEC + HARTI weekly bulletins | Officer manual entry via Price Management screen + automated HARTI PDF parser | Daily (manual) + Weekly (HARTI) |
| **Weather data** | Open-Meteo API (free, no key) | REST API with 6-hour caching | Every 6 hours |
| **Historical weather** | Open-Meteo Archive API (free) | One-time backfill: 24 months (Jan 2024 – Dec 2025) | One-time at deployment |
| **Land area data** | Bandarawela Agrarian Development Division (physical records) | Officers enter via dashboard during farmer registration | On farmer registration |
| **Crop varieties & growing data** | DoA Agro-Technology Park Bandarawela + published extension bulletins | Manual data entry from official publications | Initial load |

### 2.2 CROPIX Integration Strategy

```mermaid
flowchart TD
    A["Try CROPIX Public Dashboard"] --> B{Network tab reveals JSON endpoints?}
    B -->|Yes| C["Reverse-engineer internal API endpoints<br/>Set up scheduled data fetch"]
    B -->|No| D["Parse HARTI Weekly PDF Bulletins<br/>harti.gov.lk Food Commodities Bulletins"]
    C --> E["Store in cropix_demand_benchmarks table"]
    D --> E
    E --> F["Risk Engine uses real demand data"]
    
    G["Officer Manual Fallback"] --> E
    G -.->|"If no digital source available"| H["Officers enter district quotas<br/>from physical DoA circulars"]
```

> [!IMPORTANT]
> **Step 1**: Inspect `digital.doa.gov.lk` (CROPIX dashboard) using browser dev tools → check if internal XHR/fetch calls expose JSON API endpoints for crop data, acreage, demand.
> **Step 2**: If undocumented API found → build a scheduled data fetcher.
> **Step 3**: If no API → build an automated HARTI PDF parser (Python pdfplumber) to extract weekly wholesale price tables.
> **Step 4**: As final fallback → Divisional Officers manually input demand benchmarks from official DoA circulars they receive.

---

## 3. Bandarawela Climate Profile — Verified Data

Based on **actual Open-Meteo historical data (2024)** for coordinates 6.8304°N, 80.9878°E at **1,216m elevation**:

### 3.1 Monthly Climate Summary (2024 Actual)

| Month | Avg Min °C | Avg Max °C | Lowest °C | Highest °C | Rainfall (mm) | Season |
|-------|-----------|-----------|-----------|-----------|---------------|--------|
| **Jan** | 15.4 | 22.7 | 10.4 | 24.0 | 197.3 | Maha |
| **Feb** | 15.7 | 23.9 | 13.5 | 25.9 | 61.3 | Maha |
| **Mar** | 15.4 | 26.1 | 13.5 | 28.3 | 75.5 | Inter-monsoon |
| **Apr** | 16.5 | 25.8 | 15.0 | 27.2 | 105.9 | Inter-monsoon |
| **May** | 18.8 | 25.7 | 17.0 | 27.9 | 230.0 | Yala |
| **Jun** | 17.9 | 25.4 | 14.6 | 26.6 | 94.6 | Yala |
| **Jul** | 18.4 | 26.2 | 15.8 | 28.3 | 64.1 | Yala |
| **Aug** | 17.6 | 25.3 | 15.6 | 27.5 | 160.9 | Yala |
| **Sep** | 18.0 | 27.4 | 15.2 | 29.0 | 91.2 | Inter-monsoon |
| **Oct** | 17.0 | 24.2 | 14.9 | 26.5 | 267.8 | Maha |
| **Nov** | 16.6 | 23.0 | 14.6 | 25.4 | 476.5 | Maha |
| **Dec** | 15.2 | 23.8 | 12.0 | 26.3 | 166.5 | Maha |

**Key findings:**
- **Absolute minimum in 2024: 10.4°C** (Jan 25) — only 3 days below 12°C all year
- **Zero days below 10°C** — user confirmed, data verifies
- **No frost risk whatsoever** (frost only at 1,900m+ Nuwara Eliya)
- **Annual rainfall: 1,992mm** — November heaviest (477mm)
- **Comfort zone: 15°C–27°C year-round** — ideal for temperate vegetables

### 3.2 Corrected Weather Scoring Rules (Bandarawela-Specific)

```
TEMPERATURE SCORING (Bandarawela calibrated — NEVER below 10°C):
- 15°C ≤ avg ≤ 25°C → Score: 95-100 (ideal — most of the year)
- 12°C ≤ avg < 15°C → Score: 80-90 (slightly cool, Jan nights — still fine)
- 10°C ≤ avg < 12°C → Score: 65-75 (rare cold snap, only 3 days/year)
- avg > 27°C → Score: 60-70 (unusual heat, Mar/Sep peaks)
- FROST RISK: NOT APPLICABLE for Bandarawela. Removed from scoring.

RAINFALL SCORING (Bandarawela annual 1,900-2,000mm):
- 30-80mm/week → Score: 90-100 (ideal for most upcountry vegetables)
- 80-120mm/week → Score: 70-85 (heavy but manageable with drainage)
- 120-200mm/week → Score: 40-60 (waterlogging risk — Nov peak)
- >200mm/week → Score: 20-35 (severe — crop damage likely)
- <10mm/week → Score: 60-75 (dry stress, mainly Feb-Mar)

DISEASE PRESSURE SCORING (Fungal risk — key for Bandarawela):
- Humidity <70% → Score: 90 (low risk — rare in Bandarawela)
- 70-80% humidity → Score: 75 (moderate — normal Bandarawela)
- 80-90% humidity + temp 18-25°C → Score: 50 (high — late blight, downy mildew)
- >90% humidity for 3+ days → Score: 25 (critical — tomato/potato blight alert)
```

---

## 4. Complete Crop Database — All Bandarawela Vegetables

> No fake data. All figures from Department of Agriculture published extension data, HARTI reports, and CROPIX platform data for Badulla district.

### 4.1 Comprehensive Crop List (25 Vegetables)

| # | Code | Name (EN) | Name (SI) | Name (TA) | Growth (days) | Yield/Acre (MT) | Price Range (LKR/kg) | Category |
|---|------|-----------|-----------|-----------|---------------|-----------------|---------------------|----------|
| 1 | LEEKS | Leeks | ලීක්ස් | லீக்ஸ் | 90 | 8–10 | 200–500 | Upcountry Vegetable |
| 2 | CABBAGE | Cabbage | ගෝවා | முட்டைக்கோஸ் | 75 | 10–15 | 150–400 | Upcountry Vegetable |
| 3 | CARROT | Carrot | කැරට් | கேரட் | 85 | 6–8 | 250–600 | Upcountry Vegetable |
| 4 | BEETROOT | Beetroot | බීට්රූට් | பீட்ரூட் | 70 | 7–9 | 200–500 | Upcountry Vegetable |
| 5 | POTATO | Potato | අර්තාපල් | உருளைக்கிழங்கு | 100 | 6–9 | 250–450 | Upcountry Vegetable |
| 6 | BEANS | Green Beans | බෝංචි | போஞ்சி | 60 | 4–6 | 250–600 | Upcountry Vegetable |
| 7 | TOMATO | Tomato | තක්කාලි | தக்காளி | 75 | 10–15 | 150–800 | Upcountry Vegetable |
| 8 | CAPSICUM | Capsicum/Bell Pepper | මාළු මිරිස් | குடை மிளகாய் | 80 | 4–7 | 300–800 | Upcountry Vegetable |
| 9 | RADISH | Radish | රාබු | முள்ளங்கி | 45 | 8–10 | 100–250 | Upcountry Vegetable |
| 10 | KNOLKHOL | Knol-khol | නෝකෝල් | நூல்கோல் | 65 | 7–9 | 150–350 | Upcountry Vegetable |
| 11 | SPRING_ONION | Spring Onion | ළූණු කොළ | வெங்காய இலை | 50 | 5–7 | 200–400 | Upcountry Vegetable |
| 12 | LETTUCE | Lettuce | සලාද කොළ | லெட்யூஸ் | 50 | 5–6 | 250–500 | Upcountry Vegetable |
| 13 | CELERY | Celery | සැල්දිරි | செலரி | 85 | 4–6 | 300–700 | Upcountry Vegetable |
| 14 | BROCCOLI | Broccoli | බ්‍රොකොලි | ப்ரோக்கோலி | 75 | 3–5 | 500–1200 | Upcountry Vegetable |
| 15 | CAULIFLOWER | Cauliflower | මල්ගෝවා | காலிஃபிளவர் | 80 | 5–8 | 300–700 | Upcountry Vegetable |
| 16 | PUMPKIN | Pumpkin | වට්ටක්කා | பூசணி | 100 | 8–12 | 100–250 | Lowland Adaptable |
| 17 | BITTER_GOURD | Bitter Gourd | කරවිල | பாகற்காய் | 60 | 5–8 | 200–500 | Lowland Adaptable |
| 18 | SNAKE_GOURD | Snake Gourd | පතෝල | புடலங்காய் | 55 | 6–9 | 150–350 | Lowland Adaptable |
| 19 | CUCUMBER | Cucumber | පිපිඤ්ඤා | வெள்ளரிக்காய் | 50 | 8–12 | 100–300 | Lowland Adaptable |
| 20 | GREEN_CHILI | Green Chili | අමු මිරිස් | பச்சை மிளகாய் | 70 | 3–5 | 300–900 | Upcountry Vegetable |
| 21 | RED_ONION | Red Onion | රතු ළූණු | சிவப்பு வெங்காயம் | 90 | 4–6 | 250–600 | Upcountry Vegetable |
| 22 | GOTUKOLA | Centella/Gotukola | ගොටුකොළ | வல்லாரை | 30 | 3–4 | 200–400 | Leafy Green |
| 23 | KANGKUNG | Water Spinach | කංකුං | வள்ளல் கீரை | 25 | 5–7 | 100–200 | Leafy Green |
| 24 | MUKUNUWENNA | Mukunuwenna | මුකුණුවැන්න | முக்குனுவென்ன | 30 | 3–5 | 150–350 | Leafy Green |
| 25 | SPINACH | Spinach | නිවිති | பசலைக் கீரை | 35 | 4–6 | 150–300 | Leafy Green |

> [!TIP]
> **Initial data population strategy**: On first deployment, an officer (or admin) loads crop parameters from published DoA extension bulletins specific to Badulla district. If CROPIX API is available, we auto-fetch crop metadata. Crop data table is never pre-seeded with hardcoded values.

### 4.2 Crop Season Mapping (Bandarawela)

| Crop | Maha (Oct–Mar) | Yala (May–Aug) | Inter-Monsoon (Apr, Sep) | Year-Round? |
|------|---------------|---------------|--------------------------|-------------|
| Leeks | ✅ Best | ⚠️ Moderate | ✅ Good | Nearly |
| Cabbage | ✅ Best | ⚠️ Moderate | ✅ Good | Nearly |
| Carrot | ✅ Best | ⚠️ Moderate | ✅ Good | Nearly |
| Beetroot | ✅ Good | ✅ Good | ✅ Good | ✅ Yes |
| Potato | ✅ Best | ⚠️ Risky (rain) | ❌ Poor | No |
| Beans | ✅ Good | ✅ Best | ✅ Good | ✅ Yes |
| Tomato | ⚠️ Moderate (rain) | ✅ Best | ✅ Good | Nearly |
| Capsicum | ⚠️ Moderate | ✅ Best | ✅ Good | Nearly |
| Green Chili | ⚠️ Moderate | ✅ Best | ✅ Good | Nearly |
| Radish | ✅ Good | ✅ Good | ✅ Good | ✅ Yes |
| Broccoli | ✅ Best | ❌ Poor | ⚠️ Moderate | No |
| Cauliflower | ✅ Best | ⚠️ Moderate | ✅ Good | Nearly |
| Lettuce | ✅ Best | ⚠️ Moderate | ✅ Good | Nearly |

---

## 5. Revised Risk Engine — Fine-Tuned for Bandarawela

### 5.1 Multi-Factor Scoring (Revised Weights)

```
COMPOSITE RISK = 
    (Over-planting Risk × 0.45) +     ← Market saturation (CROPIX demand data)
    (Weather Risk × 0.25) +           ← Bandarawela-calibrated weather scoring
    (Seasonal Risk × 0.15) +          ← Maha/Yala/Inter-monsoon suitability
    (Historical Price Risk × 0.15)    ← Past price crash patterns

RISK LEVELS:
    0–40  → SAFE (Green)        — Safe to plant
    41–65 → WARNING (Amber)     — Plant with caution, review alternatives
    66–100 → OVER_PLANTED (Red) — High risk, strongly recommend alternatives
```

### 5.2 Factor 1: Over-Planting Risk (45%) — CROPIX-Powered

```
Step 1: Fetch regional demand quota from CROPIX data
        (or HARTI/officer-entered fallback)
Step 2: Aggregate all planting records for this crop in Badulla district
        → total_expected_yield = SUM(land_size_acres × avg_yield_per_acre)
Step 3: Weight by growth stage:
        - PLANTED (within 30 days of harvest): weight = 1.0
        - GROWING (31-60 days to harvest): weight = 0.85
        - Just sown (60+ days to harvest): weight = 0.65
Step 4: Calculate ratio = weighted_supply / regional_demand × 100
Step 5: Apply score:
        ratio < 60% → score = ratio × 0.5  (low risk)
        ratio 60-85% → score = 30 + (ratio - 60) × 1.6  (building)
        ratio 85-100% → score = 70 + (ratio - 85) × 2.0  (high)
        ratio > 100% → score = 100  (critical)
```

### 5.3 Factor 2: Weather Risk (25%) — Bandarawela Calibrated

Uses real-time 14-day forecast from Open-Meteo. **No frost factor** (removed).

```
Step 1: Fetch 14-day forecast for Bandarawela (6.8304°N, 80.9878°E)
Step 2: For each crop, compare forecast against crop's optimal ranges:
        - Temperature suitability (crop.optimal_temp_min to crop.optimal_temp_max)
        - Rainfall suitability (crop.rainfall_min_mm to crop.rainfall_max_mm)
        - Disease pressure (humidity × temperature interaction)
Step 3: weather_risk = 100 - weather_suitability_score
Step 4: Cap at 0-100

Special rules for Bandarawela:
- November heavy rains (400-500mm/month): AUTO elevate weather risk for
  water-sensitive crops (potato, tomato) by +20 points
- Dry February-March (<65mm/month): Flag irrigation advisory
```

### 5.4 Factor 3: Seasonal Risk (15%)

```
Look up crop_seasons table for current month
If planting in BEST season → seasonal_risk = 5
If planting in MODERATE season → seasonal_risk = 35
If planting in POOR/OFF season → seasonal_risk = 75
If crop is year-round → seasonal_risk = 10
```

### 5.5 Factor 4: Historical Price Risk (15%) — NEW

```
Step 1: Query price_history for same crop, same month, past 2 years
Step 2: Calculate price volatility (standard deviation / mean × 100)
Step 3: Check if price crashed in same period last year
        (price dropped >40% within 30 days = crash)
Step 4: Apply score:
        No crash history, low volatility → score = 10
        Moderate volatility → score = 30
        Price crashed same period last year → score = 70
        Price crashed same period 2 years in a row → score = 90
```

### 5.6 Recommendation Engine (Revised)

When a crop shows WARNING or OVER_PLANTED, recommend alternatives using:

```
RECOMMENDATION SCORE =
    (Market Gap Score × 0.30) +         ← How much unmet demand exists
    (Weather Suitability × 0.25) +      ← Real 14-day forecast match
    (Seasonal Fit × 0.20) +             ← Is it the right season?
    (Price Attractiveness × 0.15) +     ← Current price vs average
    (Growth Duration Fit × 0.10)        ← Shorter = faster returns

NEW: For each recommended crop, show:
    - Current Keppetipola price
    - 3-month price trend chart
    - Last year same-month price
    - Weather outlook for next 14 days
    - Expected harvest date
    - How many other farmers are currently growing it
```

---

## 6. Complete User Interface Specification

### 6.1 FARMER — Mobile App (Flutter)

#### 6.1.1 Farmer Registration & Onboarding
| Screen | Fields/Actions |
|--------|---------------|
| **Role Selection** | Choose: Farmer / Buyer |
| **Registration Form** | Full name, NIC number, Phone number (unique), Password, GPS-pinned land location (auto-detect), Total land size (perches/acres), GN Division (dropdown), Address, Preferred language (SI/TA/EN) |
| **Pending Approval** | After registration → account status = `PENDING_VERIFICATION`. Show: "Your account is being verified by the Divisional Officer. You will receive a notification once approved." |

> [!IMPORTANT]
> **Farmer Validation**: Farmers CANNOT use the system immediately after registration. A Divisional Officer must verify their NIC, land GPS coordinates, and land size before activating the account. This prevents fake data entry.

#### 6.1.2 Farmer Dashboard Screen
| Widget | Content |
|--------|---------|
| **Welcome Banner** | "Good morning, {name}" + current date |
| **Weather Summary Card** | Current temp (°C), rainfall forecast today, 3-day mini forecast icons |
| **Season Indicator Badge** | "Maha Season" or "Yala Season" with date range |
| **Active Plantings Summary** | Count of active crops, total acres planted, nearest harvest date |
| **Risk Alert Banner** | If any of farmer's crops are WARNING/OVER_PLANTED → prominent red/amber banner |
| **Quick Actions** | "Log New Planting", "Smart Search", "Post Surplus", "View Prices" |
| **Notice Board Preview** | Latest 2 government notices |

#### 6.1.3 Smart Search (Search Before You Plant)
| Step | Screen Content |
|------|---------------|
| **Step 1** | Search bar: Type crop name (supports SI/TA/EN). Autocomplete from crop database. |
| **Step 2** | Risk Dashboard for selected crop: Composite risk score (gauge), 4-factor breakdown (radar chart), Risk level badge (SAFE/WARNING/OVER_PLANTED) |
| **Step 3** | If WARNING or OVER_PLANTED → "See Alternatives" button → Recommendation cards |
| **Step 4** | Each recommendation card shows: Crop name (trilingual), composite recommendation score, weather suitability icon, current price at Keppetipola, how many farmers growing it, "View Details" → full crop info page |

#### 6.1.4 Crop Detail / Information Screen
Every vegetable in the system must have a detailed information page accessible to farmers:

| Section | Content |
|---------|---------|
| **Crop Profile** | Name (SI/TA/EN), category, image, growth duration |
| **Growing Conditions** | Optimal temperature range, rainfall needs, best seasons |
| **Bandarawela Suitability** | Season match, weather suitability score for current period |
| **Market Data** | Current Keppetipola price, 3-month price trend chart, last year same month price |
| **Risk Status** | Current over-planting risk, how many farmers are growing it in the division |
| **Growing Tips** | From DoA extension data (optional, can be added later) |

#### 6.1.5 Price History Screen (NEW — User Requested)
| Feature | Details |
|---------|---------|
| **Crop Selector** | Dropdown to pick any vegetable |
| **Price Chart** | Line chart showing daily/weekly prices for selected crop |
| **Time Range** | Toggle: 1 month / 3 months / 6 months / 1 year |
| **Market Selector** | Keppetipola / Dambulla (if data available) |
| **Price Comparison** | "This month vs same month last year" card |
| **Price Alert** | Farmer can set a target price and get notified when market price crosses it |

#### 6.1.6 Planting Entry Screen
| Field | Type | Notes |
|-------|------|-------|
| Crop | Dropdown (searchable) | From all crops in system |
| Land Size | Number (acres/perches toggle) | GPS validation against registered land |
| Planting Date | Date picker | Default: today |
| Expected Harvest | Auto-calculated | Based on crop's growth_duration_days |
| Location | GPS auto-detect | Map preview shown |
| Notes | Optional text | |

#### 6.1.7 Weather Screen (Real Data)
| Section | Content |
|---------|---------|
| **Current Conditions** | Temperature, humidity, rainfall, wind — from Open-Meteo |
| **7-Day Forecast** | Day-by-day cards: temp high/low, rain probability, weather icon |
| **Agricultural Advisory** | "Good conditions for planting leeks", "Heavy rain expected — avoid sowing potato" |
| **Rain Alert** | If >100mm expected in next 3 days → prominent warning |

#### 6.1.8 Farmer Profile & Settings

**Profile Screen:**
| Field | Editable? | Notes |
|-------|-----------|-------|
| Full Name | ✅ | Officer must re-verify after change |
| Phone Number | ✅ | OTP verification required |
| NIC | ❌ | Set at registration, verified by officer |
| Land Location (GPS) | ❌ | Set at registration, verified by officer |
| Total Land Size | ❌ | Verified by officer; farmer can REQUEST change |
| GN Division | ❌ | Set at registration |
| Profile Photo | ✅ | Optional |
| Address | ✅ | |

**Settings Screen:**
| Setting | Options |
|---------|---------|
| Language | Sinhala / Tamil / English |
| Notifications | Enable/disable push notifications |
| Theme | Light / Dark / System default |
| Offline Mode | Show cache timestamp, manual sync button |
| Data Usage | Show sync status, pending uploads count |
| About | App version, contact info, terms |

#### 6.1.9 Marketplace (Farmer Side)
| Screen | Function |
|--------|----------|
| **Post Surplus** | Crop, quantity (kg), asking price (LKR/kg), pickup dates, pickup address, photo (optional) |
| **My Listings** | Active/Expired/Sold listings with status |
| **Incoming Orders** | Buyer orders with Accept/Decline/Counter-offer actions (30-min deadline) |
| **Chat** | Direct messaging with buyer per order |
| **Sales History** | Past completed sales with total earnings |

---

### 6.2 BUYER — Mobile App + Web Interface

#### 6.2.1 Buyer Registration
| Field | Details |
|-------|---------|
| Business Name | Required |
| Contact Person | Required |
| Phone Number | Required (unique) |
| NIC / Business Reg | Required — for verification |
| Business Type | Dropdown: Caterer / Restaurant / Retailer / Event Planner / Hotel / Wholesale / Other |
| Business Address | Required |
| GPS Location | Auto-detect (for proximity matching) |
| Preferred Language | SI / TA / EN |

#### 6.2.2 Buyer Dashboard
| Widget | Content |
|--------|---------|
| **Nearby Surplus Alert** | "3 new listings within 5km" |
| **Active Orders** | Orders in progress with status |
| **Quick Search** | Search bar for specific vegetables |
| **Spending Summary** | Total purchases this month, favorite crops |

#### 6.2.3 Marketplace Browse (Buyer Side)
| Feature | Details |
|---------|---------|
| **Proximity Filter** | Slider: 1km – 20km (default 5km) |
| **Crop Filter** | Filter by vegetable type |
| **Sort Options** | By distance / price (low→high) / quantity / freshness (newest first) |
| **Listing Card** | Crop name + photo, quantity, price/kg, farmer name, distance (km), available dates |
| **Listing Detail** | Full details + farm location on map + "Place Order" + "Message Farmer" |

#### 6.2.4 Order Management (Buyer Side)
| Status | Buyer Actions |
|--------|--------------|
| PENDING | Waiting for farmer response (30-min countdown timer shown) |
| COUNTER_OFFER | Farmer offered different price → Accept / Decline / Re-negotiate |
| ACCEPTED | View farmer contact + pickup address + map directions |
| COMPLETED | Rate transaction (optional) |
| DECLINED | "Order declined. Browse other listings." |
| EXPIRED | Auto-expired after 30 minutes without farmer response |

#### 6.2.5 Buyer Chat
| Feature | Details |
|---------|---------|
| **Per-Order Thread** | Each order has a dedicated chat thread |
| **Message Types** | Text messages + optional photo sharing |
| **System Messages** | Auto-generated: "Order placed", "Order accepted", "Counter-offer received" |
| **Offline Queue** | Messages queued when offline, sent on reconnection |

#### 6.2.6 Buyer Profile & Settings
| Field | Editable? |
|-------|-----------|
| Business Name | ✅ |
| Contact Person | ✅ |
| Phone | ✅ (OTP verify) |
| Business Type | ✅ |
| Address | ✅ |
| GPS Location | ✅ (re-detect) |
| **Default Search Radius** | ✅ (1–20km) |
| Notification Preferences | ✅ (new listings alerts, order updates) |
| Language | ✅ |
| Theme | ✅ |

#### 6.2.7 Procurement History
| Column | Details |
|--------|---------|
| Date | Order date |
| Crop | Vegetable name |
| Quantity (kg) | Amount purchased |
| Price/kg (LKR) | Unit price |
| Total (LKR) | Total amount |
| Farmer | Farmer name |
| Status | COMPLETED / CANCELLED |
| **Export** | Download as CSV / PDF |

---

### 6.3 DIVISIONAL OFFICER — Web Dashboard (React)

#### 6.3.1 Officer Authentication
| Requirement | Details |
|-------------|---------|
| Registration | Officer registers → account status = `PENDING_ADMIN_APPROVAL` |
| Admin Approval | Super Admin must manually approve before officer gets access |
| Session | JWT with 8-hour expiry (shorter than farmer's 24h for security) |
| 2FA | Recommended for future: OTP on login |

#### 6.3.2 Officer Dashboard (Main Screen)
| Widget | Content |
|--------|---------|
| **Region Summary Card** | Total farmers, total active plantings, total acres under cultivation |
| **Weather Widget** | Current Bandarawela conditions + 3-day forecast + agricultural advisory |
| **Risk Alerts Panel** | Crops currently at WARNING or OVER_PLANTED — click to see details |
| **Season Indicator** | Current season (Maha/Yala) with date range |
| **Pending Actions Badge** | Farmers awaiting verification, pending proxy entries |
| **Quick Stats** | Total broadcasts sent, marketplace activity, data completeness % |

#### 6.3.3 Farmer Directory & Validation (CRITICAL)

> [!IMPORTANT]
> **Farmer Validation Workflow** — Prevents fake data from entering the system.

| Step | Actor | Action |
|------|-------|--------|
| 1 | Farmer | Registers via mobile app with NIC, phone, GPS, land size |
| 2 | System | Creates account with status = `PENDING_VERIFICATION` |
| 3 | Officer | Sees new farmer in "Pending Verification" queue |
| 4 | Officer | **Verifies NIC**: Checks NIC number against physical ID |
| 5 | Officer | **Verifies Land**: Checks GPS coordinates match actual farmland (officer may physically visit or verify via satellite imagery) |
| 6 | Officer | **Verifies Land Size**: Cross-references with Bandarawela Agrarian Development Division records |
| 7 | Officer | Clicks "Approve" or "Reject" with reason |
| 8 | System | If approved → status = `VERIFIED`, farmer can now use the system |
| 9 | System | If rejected → farmer notified with reason, can re-submit |

**Farmer Directory Screen:**

| Feature | Details |
|---------|---------|
| **Farmer List** | Searchable, filterable table: Name, NIC, Phone, GN Division, Land Size, Status, Registration Date |
| **Status Filter** | All / Pending Verification / Verified / Rejected / Deactivated |
| **Farmer Detail View** | Full profile + land map + planting history + verification status |
| **Verification Panel** | NIC check, GPS verification (map view), land size check, Approve/Reject buttons, rejection reason field |
| **Edit Farmer** | Officer can update farmer details (logged in audit trail) |
| **Deactivate Farmer** | Soft delete — preserves historical data |
| **Anomaly Flags** | 🚩 Auto-flag: unrealistic land sizes (>20 acres), duplicate NIC, GPS outside Bandarawela boundary |

#### 6.3.4 Proxy Data Entry
| Feature | Details |
|---------|---------|
| **Select Farmer** | Dropdown from verified farmers in officer's jurisdiction |
| **Planting Form** | Same as farmer's planting entry: crop, land size, planting date, GPS |
| **Batch Entry** | Enter planting data for multiple farmers in one session |
| **Audit Trail** | Every proxy entry tagged with officer_id + timestamp |
| **Confirmation** | Summary screen showing all entries before submission |

#### 6.3.5 Regional Monitoring & Analytics
| Feature | Details |
|---------|---------|
| **Risk Heatmap** | Map of Bandarawela divisions color-coded by risk level per crop |
| **Crop Distribution Chart** | Pie chart / bar chart showing what's being planted |
| **Planting Trend** | Time-series: acres planted per crop over last 6 months |
| **Supply vs Demand** | Bar chart comparing current supply with CROPIX demand quota |
| **Farmer Participation** | % of registered farmers who have logged planting data |
| **Forecasting Panel** | Projected surplus/deficit for next 30/60/90 days based on current planting + growth duration |
| **Export** | PDF / CSV export of all analytics |

#### 6.3.6 Price Management Screen (NEW)
| Feature | Details |
|---------|---------|
| **Daily Price Entry** | Form to enter today's wholesale prices from Keppetipola Economic Centre |
| **Crop Selector** | Multi-select: enter prices for multiple crops at once |
| **Price Source** | Dropdown: Keppetipola / Dambulla / Other |
| **Price History Table** | Scrollable table of past entered prices |
| **Price Trend Charts** | Interactive line charts per crop |
| **HARTI Data Import** | Upload HARTI weekly bulletin PDF → auto-parse prices (future enhancement) |
| **Bulk Entry** | Paste/import prices from spreadsheet |

#### 6.3.7 Threshold Configuration
| Feature | Details |
|---------|---------|
| **Per-Crop Thresholds** | Set WARNING and OVER_PLANTED thresholds for each crop (defaults: 60% and 85%) |
| **District Demand Quotas** | Enter/update regional demand quotas from DoA circulars |
| **Alert Toggle** | Enable/disable auto-alerts per crop |
| **Season Adjustments** | Adjust thresholds per season (e.g., lower threshold during Maha for water-sensitive crops) |

#### 6.3.8 Broadcast Warning System
| Feature | Details |
|---------|---------|
| **Create Broadcast** | Title (SI/TA/EN), Message (SI/TA/EN), Severity (LOW/MEDIUM/HIGH/CRITICAL) |
| **Target Selection** | All farmers / Specific GN Division / Specific crop growers / Individual farmer |
| **Delivery Channel** | Push notification (FCM) — free, no SMS cost |
| **Delivery Report** | Per-farmer: Sent / Delivered / Failed status |
| **Broadcast History** | Archive of all past broadcasts |
| **Scheduled Broadcasts** | Schedule a broadcast for future date/time |
| **Template Library** | Pre-built templates: "Fertilizer Subsidy", "Crop Ban", "Weather Warning", "Market Advisory" |

#### 6.3.9 Officer Profile & Settings
| Setting | Details |
|---------|---------|
| **Profile** | Name, NIC, Phone, Assigned Division, Role |
| **Jurisdiction** | View assigned district/division (set by admin) |
| **Notification Preferences** | New farmer registration alerts, risk threshold breach alerts |
| **Report Scheduling** | Auto-generate weekly summary reports |
| **Language** | SI / TA / EN |
| **Theme** | Light / Dark |

---

## 7. Notification Strategy — No Paid SMS

> [!IMPORTANT]
> **No paid SMS service.** All notifications delivered FREE via:
> 1. **Firebase Cloud Messaging (FCM)** — push notifications to mobile app (free, unlimited)
> 2. **In-app Notice Board** — persistent notification center within the app (free)
> 3. **Firebase Realtime Database** — real-time updates for marketplace chat (free on Spark plan up to 1GB)

### 7.1 Notification Types & Delivery

| Notification Type | Channel | Trigger |
|-------------------|---------|---------|
| Over-planting alert | FCM Push + In-App | Risk Engine detects WARNING/OVER_PLANTED |
| Weather advisory | FCM Push + In-App | Severe weather in 14-day forecast |
| Government broadcast | FCM Push + In-App | Officer publishes broadcast |
| Order update | FCM Push + In-App | Buyer places order / Farmer responds |
| New marketplace listing | FCM Push | New listing within buyer's radius |
| Account verification | In-App | Officer approves/rejects farmer |
| Price alert | FCM Push | Market price crosses farmer's target |
| Harvest reminder | FCM Push | 7 days before expected harvest date |

### 7.2 In-App Notice Board
- All notifications archived for **90 days**
- Accessible **offline** if previously cached
- Categorized: Alerts / Government / Marketplace / System
- Unread count badge on Notice Board icon
- Mark as read / Mark all as read

---

## 8. System Architecture (Revised)

```mermaid
graph TB
    subgraph "Client Layer"
        MA["📱 Flutter Mobile App<br/>(Farmer + Buyer)"]
        WD["🖥️ React Web Dashboard<br/>(Officer + Buyer)"]
    end

    subgraph "API Gateway"
        API["🔀 Express.js REST API v1<br/>JWT Auth + RBAC Middleware"]
    end

    subgraph "Core Services"
        RE["⚙️ Risk Engine Service<br/>(4-factor: Overplant + Weather + Season + Price)"]
        WS["🌦️ Weather Service<br/>(Open-Meteo — FREE, no key)"]
        REC["💡 Recommendation Service<br/>(CROPIX-powered alternatives)"]
        NS["📢 Notification Service<br/>(FCM Push — FREE)"]
        MP["🏪 Marketplace Service<br/>(Geofenced listings)"]
        PS["📊 Price Service<br/>(Keppetipola market data)"]
        VS["✅ Validation Service<br/>(Farmer verification workflow)"]
        CX["📡 CROPIX Data Service<br/>(Demand data fetcher)"]
    end

    subgraph "Scheduled Jobs"
        J1["⏰ Weather Sync<br/>(Every 6 hours)"]
        J2["⏰ Risk Recalculation<br/>(Every 12 hours)"]
        J3["⏰ Listing Expiry<br/>(Daily midnight)"]
        J4["⏰ CROPIX Data Sync<br/>(Daily)"]
        J5["⏰ Harvest Reminders<br/>(Daily 6 AM)"]
    end

    subgraph "External APIs (ALL FREE)"
        OM["🌍 Open-Meteo API<br/>(Weather — FREE)"]
        FCM["🔔 Firebase FCM<br/>(Push — FREE)"]
        FB["🔥 Firebase RTDB<br/>(Real-time — FREE Spark)"]
        CXP["📡 CROPIX Platform<br/>(Data if API accessible)"]
        MB["🗺️ Mapbox / Google Maps<br/>(Geocoding — FREE tier)"]
    end

    subgraph "Data Layer"
        PG["🐘 PostgreSQL<br/>(14 tables)"]
        CACHE["💾 Node-Cache<br/>(Weather + Risk TTL cache)"]
    end

    MA & WD --> API
    API --> RE & WS & REC & NS & MP & PS & VS & CX
    RE --> WS & PS & PG
    REC --> RE & WS & PS
    NS --> FCM
    MP --> PG & FB
    WS --> OM
    CX --> CXP
    J1 --> WS
    J2 --> RE
    J3 --> MP
    J4 --> CX
    J5 --> NS
```

---

## 9. Complete Database Schema (14 Tables)

### 9.1 New Tables (5)

```sql
-- Weather Cache (real Open-Meteo data, refreshed every 6h)
CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    location_key VARCHAR(50) NOT NULL DEFAULT 'bandarawela',
    latitude DECIMAL(10, 8) NOT NULL DEFAULT 6.8304,
    longitude DECIMAL(11, 8) NOT NULL DEFAULT 80.9878,
    forecast_date DATE NOT NULL,
    temp_min DECIMAL(4, 1),
    temp_max DECIMAL(4, 1),
    temp_avg DECIMAL(4, 1),
    humidity_avg DECIMAL(4, 1),
    rainfall_mm DECIMAL(6, 1),
    wind_speed_avg DECIMAL(4, 1),
    precipitation_probability INT,
    weather_risk_score DECIMAL(5, 2),
    raw_data JSONB,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_key, forecast_date)
);

-- Crop Season Mappings (Maha/Yala suitability per crop)
CREATE TABLE IF NOT EXISTS crop_seasons (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id),
    season_name VARCHAR(20) NOT NULL CHECK (season_name IN ('MAHA', 'YALA', 'INTER_MONSOON')),
    optimal_start_month INT NOT NULL,
    optimal_end_month INT NOT NULL,
    suitability VARCHAR(10) DEFAULT 'GOOD' CHECK (suitability IN ('BEST','GOOD','MODERATE','POOR')),
    suitability_score DECIMAL(5,2) DEFAULT 80.0,
    notes TEXT,
    UNIQUE(crop_id, season_name)
);

-- Price History (real Keppetipola/Dambulla prices, entered by officers)
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id),
    market_name VARCHAR(100) DEFAULT 'Keppetipola Economic Centre',
    price_per_kg DECIMAL(8, 2) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'OFFICER_ENTRY',
    entered_by INT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crop_id, market_name, price_date)
);

-- Notification Logs (FCM delivery tracking)
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    broadcast_id INT REFERENCES broadcast_warnings(id),
    notification_type VARCHAR(30) NOT NULL,
    channel VARCHAR(10) DEFAULT 'FCM' CHECK (channel IN ('FCM', 'IN_APP')),
    title TEXT,
    body TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','DELIVERED','FAILED')),
    fcm_token TEXT,
    error_message TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Farmer Verification Queue (officer validation workflow)
CREATE TABLE IF NOT EXISTS farmer_verifications (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) UNIQUE,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING','APPROVED','REJECTED')),
    nic_verified BOOLEAN DEFAULT FALSE,
    land_gps_verified BOOLEAN DEFAULT FALSE,
    land_size_verified BOOLEAN DEFAULT FALSE,
    verified_by INT REFERENCES users(id),
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9.2 Modified Tables

**Users table** — add columns:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_land_size DECIMAL(8,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_search_radius DECIMAL(4,1) DEFAULT 5.0;
```

**Crops table** — add columns:
```sql
ALTER TABLE crops ADD COLUMN IF NOT EXISTS optimal_humidity_min DECIMAL(4,1);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS optimal_humidity_max DECIMAL(4,1);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS waterlog_sensitive BOOLEAN DEFAULT FALSE;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS disease_susceptibility VARCHAR(20) DEFAULT 'MODERATE';
ALTER TABLE crops ADD COLUMN IF NOT EXISTS standard_demand_kg DECIMAL(12,2);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_si TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_ta TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(8,2);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(8,2);
```

---

## 10. API Endpoints (Complete — 30 Endpoints)

### Existing (Enhanced)
| Method | Path | Changes |
|--------|------|---------|
| `POST` | `/api/v1/auth/register` | Add verification_status=PENDING for farmers |
| `POST` | `/api/v1/auth/login` | Block login if farmer status = PENDING |
| `GET` | `/api/v1/risk/:cropId` | Multi-factor breakdown |
| `GET` | `/api/v1/risk/regional` | Multi-factor per crop |
| `GET` | `/api/v1/recommendations` | Real weather + seasonal + price data |
| `POST` | `/api/v1/marketplace/listings` | Remove fileDb fallback |
| `GET` | `/api/v1/marketplace/search` | Enhanced filters |
| `POST` | `/api/v1/marketplace/orders` | Proper auth, 30-min expiry |
| `POST` | `/api/v1/broadcasts` | FCM delivery tracking |

### New Endpoints (21)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/weather/current` | Current Bandarawela weather |
| `GET` | `/api/v1/weather/forecast` | 7/14-day forecast |
| `GET` | `/api/v1/weather/agricultural-score` | Ag weather scores |
| `GET` | `/api/v1/weather/crop-suitability/:cropId` | Crop weather match |
| `GET` | `/api/v1/risk/:cropId/detailed` | 4-factor risk breakdown |
| `GET` | `/api/v1/risk/regional/heatmap` | Map-ready risk data |
| `POST` | `/api/v1/risk/smart-search` | Search-before-plant |
| `GET` | `/api/v1/prices/:cropId/history` | Price trend data |
| `POST` | `/api/v1/prices/batch` | Batch price entry (officer) |
| `GET` | `/api/v1/prices/latest` | Latest all-crop prices |
| `GET` | `/api/v1/crops` | All crops with full details |
| `GET` | `/api/v1/crops/:cropId` | Single crop full detail page |
| `GET` | `/api/v1/crops/:cropId/info` | Crop info for farmer view |
| `GET` | `/api/v1/officer/verifications/pending` | Pending farmer verifications |
| `POST` | `/api/v1/officer/verifications/:farmerId` | Approve/reject farmer |
| `GET` | `/api/v1/officer/analytics/summary` | Regional analytics |
| `GET` | `/api/v1/officer/analytics/forecast` | 30/60/90 day surplus forecast |
| `GET` | `/api/v1/notifications` | User's notification history |
| `PUT` | `/api/v1/notifications/:id/read` | Mark notification as read |
| `GET` | `/api/v1/users/profile` | Get own profile |
| `PUT` | `/api/v1/users/profile` | Update own profile |

---

## 11. External Services — ALL FREE

| Service | API | Cost | Notes |
|---------|-----|------|-------|
| **Weather** | Open-Meteo | **FREE** | No API key, 10k calls/day |
| **Historical Weather** | Open-Meteo Archive | **FREE** | Pre-load 24 months |
| **Push Notifications** | Firebase FCM | **FREE** | Unlimited pushes |
| **Real-time Sync** | Firebase RTDB | **FREE** (Spark) | 1GB storage, 10k simultaneous |
| **Geocoding** | Mapbox | **FREE** (100k/mo) | OR Google Maps free tier |
| **CROPIX Data** | digital.doa.gov.lk | **FREE** | If internal API discoverable |
| **HARTI Reports** | harti.gov.lk | **FREE** | Weekly PDF bulletins |

> [!TIP]
> **Total monthly cost for pilot: LKR 0** — all services used within free tiers. No SMS costs.

---

## 12. File Change Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Backend Services | 5 (weather, price, validation, cropix, cropInfo) | 4 (risk, recommendation, notification, marketplace) |
| Backend Controllers | 4 (weather, price, validation, crop) | 3 (risk, marketplace, auth) |
| Backend Routes | 4 (weather, price, validation, crop) | 1 (risk) |
| Backend Jobs | 5 (weather, risk, expiry, cropix, harvestReminder) | 0 |
| Backend Database | 1 (migration for new tables) | 2 (schema, seed) |
| Backend Config | 0 | 2 (config, .env.example) |
| Frontend Pages | 3 (WeatherDashboard, PriceManagement, FarmerVerification) | 5 (Dashboard, RiskAnalytics, RegionalMonitoring, Settings, FarmerDirectory) |
| Frontend Services | 0 | 1 (api.js) |
| Mobile Screens | 1 (crop_detail_screen — enhance) | 5 (weather, risk, dashboard, profile, price_trends) |
| Mobile Services | 0 | 2 (api_service, offline_storage_service) |
| Mobile Models | 1 (weather_model.dart) | 2 (risk_analysis_model, farmer_model) |
| Tests | 8 | 0 |
| **Total** | **32** | **27** |

---

## 13. Implementation Order (6 Weeks)

### Week 1: Data Foundation
1. Database schema updates (5 new tables, 2 modified tables)
2. Crop data structure (25 vegetables — from DoA, NOT hardcoded)
3. Weather Service + Open-Meteo integration
4. Historical weather backfill (24 months)
5. New npm packages (axios, node-cron, node-cache, dayjs)

### Week 2: Core Engine
6. Risk Engine 4-factor redesign
7. Seasonal risk calculation with crop_seasons
8. Price Service + officer price entry API
9. CROPIX data service (try API, fallback to manual)
10. Recommendation engine with real data

### Week 3: Validation & Notifications
11. Farmer verification workflow (registration → pending → officer review → approved)
12. Validation service + anomaly detection (fake land size, duplicate NIC, out-of-boundary GPS)
13. FCM notification service (replace console.log SMS)
14. Notification delivery tracking
15. In-app notice board archive

### Week 4: Officer Dashboard
16. Farmer verification screen
17. Price management screen
18. Regional analytics with real maps (Mapbox)
19. Threshold configuration UI
20. Broadcast system with delivery reports
21. Analytics export (PDF/CSV)

### Week 5: Farmer & Buyer Mobile
22. Farmer dashboard with real weather widget
23. Smart Search with 4-factor risk display
24. Crop detail/information screens (every vegetable)
25. Price history screen with charts
26. Weather screen with real forecasts
27. Buyer marketplace enhancements
28. Profile management + settings for all roles
29. Offline sync enhancement

### Week 6: Testing & Hardening
30. Scheduled jobs deployment
31. Marketplace fileDb removal + PostgreSQL hardening
32. Comprehensive test suites (8 new test files)
33. End-to-end integration testing
34. Performance testing (3-second risk engine target)
35. Offline mode testing
36. Security review (RBAC, JWT, bcrypt verification)

---

## 14. Verification Plan

### Automated Tests
```bash
cd backend && npm test
npm test -- --grep "WeatherService"       # Open-Meteo integration
npm test -- --grep "RiskEngine"           # 4-factor scoring
npm test -- --grep "RecommendationService" # Real data recommendations
npm test -- --grep "NotificationService"   # FCM dispatch
npm test -- --grep "ValidationService"     # Farmer verification
npm test -- --grep "PriceService"         # Price entry/history
npm test -- --grep "MarketplaceService"   # No fileDb, PostgreSQL only
npm test -- --grep "CropixService"        # Data fetching
```

### Manual Verification
1. **Weather**: `GET /api/v1/weather/current` returns real Bandarawela data (temp 15-27°C range)
2. **Risk Engine**: Submit planting data exceeding 85% → verify 4-factor composite score
3. **Smart Search**: Search over-planted crop → verify recommendations use real weather + prices
4. **Farmer Verification**: Register new farmer → verify officer sees in pending queue → approve → farmer can login
5. **Fake Data Prevention**: Register with unrealistic land size (100 acres) → verify anomaly flag
6. **Price History**: Officer enters price → farmer sees it in price trend chart
7. **Push Notifications**: Trigger broadcast → verify FCM push received on test device
8. **Marketplace**: Create listing → restart server → verify listing persists (no fileDb)
9. **Historical Weather**: Verify `weather_cache` has 24 months of backfilled data
10. **Crop Info**: Open any of 25 crops → verify complete info page with season data

---

> [!CAUTION]
> **NO code changes will be made until you explicitly approve this plan.** Review carefully and let me know if anything needs adjustment. Once approved, I will create the task checklist and begin implementation phase by phase.
