# 🌾 ASVANNA (අස්වැන්න) — Quality Assurance (QA) Master Testing Guide
### සම්පූර්ණ මෘදුකාංග තත්ත්ව සහතිකකරණ මාර්ගෝපදේශය (Web UI, Postman API, & Automated Testing)

---

## 📖 Document Overview / ලේඛන විස්තරය
- **Project Name:** ASVANNA (අස්වැන්න) — The Zero-Waste Agricultural Marketplace & Real-Time Intelligence Platform
- **Academic Program:** National Diploma in Information Technology (NDIT), Institute of Technology, University of Moratuwa (ITUM)
- **Target Pilot Region:** Bandarawela Agrarian Services Division, Badulla District, Sri Lanka
- **Audience:** QA Engineers, Software Testers, Academic Evaluators, and Developers
- **Language Mode:** Bilingual (English & සිංහල)

---

## 📑 Table of Contents / පටුන
1. [Introduction to Software QA / තත්ත්ව සහතිකකරණය (QA) හැඳින්වීම](#1-introduction-to-software-qa)
2. [Project Architecture & Test Environment / පද්ධති ව්‍යුහය සහ සැකසුම](#2-project-architecture--test-environment)
3. [Part A: Manual Web UI Testing / වෙබ් අතුරුමුහුණත හරහා පරීක්ෂා කිරීම](#3-part-a-manual-web-ui-testing)
   - [Use Case 1: Multi-Role Authentication & Access Control](#use-case-1-multi-role-authentication--access-control)
   - [Use Case 2: Farmer Cultivation & Planting Data Entry](#use-case-2-farmer-cultivation--planting-data-entry)
   - [Use Case 3: AI Predictive Risk Engine & Over-Planting Quotas](#use-case-3-ai-predictive-risk-engine--over-planting-quotas)
   - [Use Case 4: Agrarian Officer Governance & Proxy Data Entry](#use-case-4-agrarian-officer-governance--proxy-data-entry)
   - [Use Case 5: Zero-Waste Geofenced Proximity Marketplace](#use-case-5-zero-waste-geofenced-proximity-marketplace)
   - [Use Case 6: Live Weather & Agrarian Emergency Broadcasts](#use-case-6-live-weather--agrarian-emergency-broadcasts)
   - [Use Case 7: Procurement Ledger Reports & Trilingual Ergonomics](#use-case-7-procurement-ledger-reports--trilingual-ergonomics)
4. [Part B: Postman API Testing Guide / Postman හරහා API පරීක්ෂා කිරීම](#4-part-b-postman-api-testing-guide)
   - [Postman Setup & Environment Variables](#postman-setup--environment-variables)
   - [Authentication & JWT Token Management](#authentication--jwt-token-management)
   - [Core REST Endpoints Test Execution Suite](#core-rest-endpoints-test-execution-suite)
   - [Writing Automated Assertions in Postman Tests Tab](#writing-automated-assertions-in-postman-tests-tab)
5. [Part C: Automated Testing / ස්වයංක්‍රීය පරීක්ෂණ ක්‍රියාවලිය](#5-part-c-automated-testing)
   - [Backend Core Algorithm Suite](#backend-core-algorithm-suite)
   - [NIC Format & Authentication Suite](#nic-format--authentication-suite)
   - [Full Platform Accuracy Validation Suite](#full-platform-accuracy-validation-suite)
   - [Mobile Flutter Test Suites](#mobile-flutter-test-suites)
6. [Part D: QA Documentation & Defect Lifecycle / වාර්තාකරණය සහ දෝෂ කළමනාකරණය](#6-part-d-qa-documentation--defect-lifecycle)
   - [Standard Test Case Template](#standard-test-case-template)
   - [Defect / Bug Report Template](#defect--bug-report-template)
   - [Real Defect Remediation Register (DEF-01 to DEF-08)](#real-defect-remediation-register-def-01-to-def-08)
7. [Quick QA Execution Checklist / කඩිනම් පිරික්සුම් ලැයිස්තුව](#7-quick-qa-execution-checklist)

---

## 1. Introduction to Software QA
### තත්ත්ව සහතිකකරණය (QA) හැඳින්වීම

### 🇬🇧 English
**Software Quality Assurance (QA)** is the disciplined engineering process used to verify and validate that a software application operates without errors, fulfills all specified functional requirements, satisfies security and performance standards, and delivers a smooth user experience.

In the ASVANNA ecosystem, QA is of paramount importance. An undetected algorithmic error or database inconsistency can result in false crop saturation advice, causing smallholder farmers in Bandarawela to over-plant leeks or cabbage and suffer severe financial losses.

#### Fundamental Concepts in QA:
- **Positive Testing:** Testing the software with valid inputs to ensure that expected user journeys succeed (e.g., logging in with correct credentials).
- **Negative Testing:** Intentionally providing invalid, boundary, or malicious inputs to ensure the application handles failures gracefully with informative error messages without crashing (e.g., entering letters into land size, or submitting expired dates).
- **Boundary Value Analysis (BVA):** Testing inputs at the extreme limits of acceptable values (e.g., testing risk thresholds exactly at 69.9%, 70.0%, 85.0%, and 85.1%).
- **Regression Testing:** Re-running test suites after bug fixes or new features to guarantee that existing functionality remains intact.

---

### 🇱🇰 සිංහල
**Software Quality Assurance (QA)** කියන්නේ මෘදුකාංගයක් නිර්මාණය කිරීමේදී හෝ අවසන් වූ පසු, එය සේවාදායකයාගේ සියලු අවශ්‍යතා වලට අනුකූලව **කිසිදු දෝෂයකින් තොරව නිවැරදිව ක්‍රියාත්මක වන බවට තහවුරු කර ගැනීමේ ක්‍රමවේදයයි**.

අස්වැන්න (ASVANNA) වැනි කෘෂිකාර්මික පද්ධතියක QA පරීක්ෂාව අතිශයින්ම තීරණාත්මක වේ. මන්දයත්, බෝග අතිරික්ත ගණනය කිරීම් (Risk Engine calculations) හෝ මිල තොරතුරු වල සුළු හෝ ගණිතමය වරදක් සිදුවුවහොත්, ගොවීන් වැරදි බෝග වගා කර ආර්ථිකමය වශයෙන් දැඩි පාඩු විඳීමට ඉඩ ඇති බැවිනි.

#### QA හි මූලික සංකල්ප:
1. **Positive Testing (සාමාන්‍ය පරීක්ෂාව):** නිවැරදි දත්ත ලබා දී පද්ධතිය අපේක්ෂිත පරිදි ක්‍රියා කරන්නේදැයි පරීක්ෂා කිරීම (උදා: නිවැරදි Phone සහ Password ලබා දී සාර්ථකව Login වීම).
2. **Negative Testing (දෝෂ හැසිරවීමේ පරීක්ෂාව):** හිතාමතාම වැරදි හෝ අනවශ්‍ය දත්ත ලබා දී පද්ධතිය බිඳ නොවැටී (crash නොවී), පරිශීලකයාට පැහැදිලි දෝෂ පණිවිඩයක් පෙන්වන්නේදැයි පරීක්ෂා කිරීම (උදා: අක්කර ගණනට සෘණ අගයන් ඇතුළත් කිරීම).
3. **Boundary Value Testing (සීමා පරීක්ෂාව):** පද්ධතියේ තීරණාත්මක සීමාවන් (thresholds) ආශ්‍රිතව පරීක්ෂා කිරීම (උදා: අවදානම් ප්‍රතිශතය 70.0% සහ 85.0% වන අවස්ථා).
4. **Manual Testing:** Tester විසින් mouse සහ keyboard ආධාරයෙන් browser එකේ එකින් එක click කරමින් සිදුකරන පරීක්ෂාව.
5. **Automated Testing:** පරිගණක කේත (code scripts) මඟින් තත්පර කිහිපයක් තුළ එකවර සියලු පරීක්ෂණ ක්‍රියාත්මක කර pass/fail බලා ගැනීම.

---

## 2. Project Architecture & Test Environment
### පද්ධති ව්‍යුහය සහ සැකසුම

### 🏛️ Technology Stack & Communication
- **Frontend Web Portal:** React.js 18.3, Vite 5.4, Tailwind CSS, Lucide Icons (Runs on `http://localhost:5173` or `http://localhost:3000`).
- **Backend REST API:** Node.js v20+, Express.js 4.19, PostgreSQL 15, JWT Authentication (Runs on `http://localhost:5000`).
- **External Integrations:** Open-Meteo Weather API, CROPIX Benchmark Database, Keppetipola Dedicated Economic Centre Wholesale Price Feeds.
- **Mobile Application:** Flutter 3.24+ / Dart 3.5+ Android APK.

---

### 🚀 Starting the Local Engineering Environment
පරීක්ෂා කිරීම් ආරම්භ කිරීමට පෙර Terminal දෙකක backend සහ frontend run කරගන්න:

```bash
# Terminal 1: Backend Server එක Start කිරීම
cd /home/nirman/Desktop/final-project/backend
npm install
npm run dev
# Server will listen on http://localhost:5000

# Terminal 2: Frontend Web Portal එක Start කිරීම
cd /home/nirman/Desktop/final-project/frontend
npm install
npm run dev
# Web app will open on http://localhost:5173 (or http://localhost:3000)
```

> **API Health Check Assertion:**  
> Browser එකේ හෝ terminal එකේ `curl http://localhost:5000/health` run කළ විට `{"status":"OK"}` ලැබිය යුතුය.

---

### 🔑 Test Stakeholder Credentials Matrix (පරීක්ෂණ දත්ත)

| Stakeholder Persona | Phone Number | National ID (NIC) | Seed Password | Access Privilege |
|---|---|---|---|---|
| **🌾 Smallholder Farmer** (Kapila Bandara) | `0712345678` | `197823456789` | `asvanna123` | Farmer Field Dashboard, Planting Submissions, Surplus Marketplace |
| **🏛️ Agrarian Division Officer** (Sunil Weerasinghe) | `0771234567` | `198512345678` | `asvanna123` | Bandarawela Agrarian Console, Proxy Entry, Cadre Verifications, Emergency Broadcasts |
| **🛒 Commercial Buyer** (Grand Hotel) | `0572222222` | `200134567890` | `asvanna123` | Proximity Produce Procurement, Orders, Ledger Exports |
| **⚙️ System Super Administrator** | `0770000000` | - | `asvanna123` | Platform Configuration, Master Logs, Database Diagnostics |

---

## 3. Part A: Manual Web UI Testing
### වෙබ් අතුරුමුහුණත හරහා පරීක්ෂා කිරීම

Manual Testing කිරීමේදී පහත සඳහන් සෑම පියවරක්ම පිළිවෙළින් සිදුකර, පද්ධතිය අපේක්ෂිත ප්‍රතිඵලය ලබා දෙන්නේදැයි සටහන් කරගන්න.

---

### Use Case 1: Multi-Role Authentication & Access Control

#### 🧪 TC-AUTH-01: Smallholder Farmer Login (Positive Test)
1. Browser එක විවෘත කර `http://localhost:5173/login` (හෝ `http://localhost:3000/login`) වෙත යන්න.
2. Login කාඩ්පතෙහි ඇති **"Farmer"** ටැබ් එක Click කරන්න.
3. **Phone Number** කොටුවට `0712345678` ඇතුළත් කරන්න.
4. **Password** කොටුවට `asvanna123` ඇතුළත් කරන්න.
5. **"Sign In" / "Login"** බටන් එක ක්ලික් කරන්න.
- **Expected Result:** පද්ධතිය සාර්ථකව Login වී Farmer Dashboard එකට Redirect විය යුතුය. Navigation Bar හි ඉහළ දකුණු කෙළවරේ "Kapila Bandara" ලෙස නම දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-02: Farmer Login using National Identity Card (NIC)
1. Login පිටුවේ **Farmer** ටැබ් එක තෝරන්න.
2. Phone වෙනුවට **NIC Number** ලෙස `197823456789` ඇතුළත් කරන්න.
3. Password එක ලෙස `asvanna123` ඇතුළත් කර Login ක්ලික් කරන්න.
- **Expected Result:** ශ්‍රී ලාංකීය 12-digit NIC අංකය සාර්ථකව පිළිගෙන Farmer Dashboard එක විවෘත විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-03: Agrarian Division Officer Administrative Login
1. User Profile icon එකෙන් Logout වන්න.
2. Login පිටුවේ **"Agrarian Officer"** ටැබ් එක Click කරන්න.
3. Phone: `0771234567`, Password: `asvanna123` ඇතුළත් කර Login ක්ලික් කරන්න.
- **Expected Result:** Officer Administrative Console එක විවෘත වේ. Sidebar එකෙහි `Regional Monitoring`, `Farmer Directory`, `Broadcasts` යන නිලධාරීන්ට පමණක් සීමා වූ Tabs දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-04: Commercial Buyer Procurement Login
1. Login පිටුවේ **"Commercial Buyer"** ටැබ් එක Click කරන්න.
2. Phone: `0572222222`, Password: `asvanna123` ඇතුළත් කරන්න.
- **Expected Result:** Commercial Buyer Procurement Portal එක විවෘත වන අතර, අවට එළවළු තොග සෙවීමේ Marketplace interface එක දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-05: Invalid Credentials Handling (Negative Test)
1. Phone අංකය ලෙස `0712345678` දී Password එක ලෙස වැරදි මුරපදයක් (`WrongPass999`) ඇතුළත් කරන්න.
2. Login ක්ලික් කරන්න.
- **Expected Result:** පද්ධතිය Login නොවිය යුතුය. රතු පැහැති Toast පණිවිඩයක් මඟින් **"Invalid credentials"** (හෝ "වලංගු නොවන තොරතුරු") දෝෂය පෙන්විය යුතුය. Password input එක clear විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-06: Non-Existent User Rejection (Negative Test)
1. පද්ධතියේ ලියාපදිංචි නැති Phone අංකයක් (`0799999999`) සහ Password `asvanna123` ඇතුළත් කරන්න.
- **Expected Result:** HTTP 401/404 ප්‍රතිචාරයක් සමඟින් "User not found" හෝ "Invalid credentials" දෝෂය ලැබිය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-AUTH-07: URL Client-Side Role Tampering Prevention (Security Test)
1. Farmer කෙනෙකු ලෙස login වී සිටින අතරතුර URL එකේ අගට `?mock_role=ADMIN` හෝ direct route එකක් ලෙස `http://localhost:5173/monitoring` ටයිප් කර Enter ඔබන්න.
- **Expected Result:** Protected Route middleware එක මඟින් අවසර නොමැති බව හඳුනාගෙන Dashboard එකට redirect කිරීම හෝ "Access Denied" පෙන්විය යුතුය.
- **Status:** PASS ✅

---

### Use Case 2: Farmer Cultivation & Planting Data Entry

#### 🧪 TC-PLANT-01: Successful Crop Planting Log Submission
1. Farmer (`0712345678`) ලෙස Login වන්න.
2. Dashboard එකෙහි ඇති **"+ Log Planting Data"** (හෝ Add Planting) බටන් එක ක්ලික් කරන්න.
3. Dialog Modal එකෙහි පහත දත්ත ඇතුළත් කරන්න:
   - **Crop Selection:** Leeks (ලීක්ස්)
   - **Cultivation Land Size:** `1.5` Acres
   - **Planting Date:** Today's Date
   - **GPS Coordinates:** `Latitude: 6.8258`, `Longitude: 80.9982` (Bandarawela Agro-zone)
4. **"Submit Planting"** ක්ලික් කරන්න.
- **Expected Result:** Modal එක වැසී සාර්ථක පණිවිඩයක් ලැබිය යුතුය. "Active Plantings" කාඩ්පතෙහි අලුත් වාර්තාව දිස්විය යුතු අතර, Leeks බෝගයේ කලාපීය Quota saturation ප්‍රතිශතය ක්ෂණිකව යාවත්කාලීන විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-PLANT-02: Acreage Exceeding Registered Land Boundary (Negative Test)
1. Log Planting Modal එක නැවත විවෘත කරන්න.
2. ගොවියාට ලියාපදිංචි මුළු ඉඩම අක්කර 2.0ක් නම්, Land size ලෙස `8.0` Acres ඇතුළත් කරන්න.
3. Submit ක්ලික් කරන්න.
- **Expected Result:** Form submission එක වැළැක්විය යුතුය. Form එක යටින් **"Allocated acreage exceeds total available registered land (Available: 2.0 Acres)"** යනුවෙන් validation error එකක් දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-PLANT-03: Invalid Acreage Inputs (Negative Test)
1. Land size ලෙස `0.0` හෝ සෘණ අගයක් (`-2.5`) හෝ අකුරු (`abc`) ඇතුළත් කිරීමට උත්සාහ කරන්න.
- **Expected Result:** Submit බටන් එක disabled විය යුතුය හෝ "Land size must be greater than 0.1 Acres" පණිවිඩය ලැබිය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-PLANT-04: Out-of-Bounds GPS Location Validation (Spatial Security)
1. Latitude: `40.7128`, Longitude: `-74.0060` (New York නගරයේ ඛණ්ඩාංක) ඇතුළත් කරන්න.
- **Expected Result:** පද්ධතිය විසින් "Coordinates must fall within Sri Lankan agricultural zones (Bandarawela sector)" ලෙස දෝෂයක් දක්වා record එක ප්‍රතික්ෂේප කළ යුතුය.
- **Status:** PASS ✅

---

### Use Case 3: AI Predictive Risk Engine & Over-Planting Quotas

#### 🧪 TC-RISK-01: Quota Saturation Tier Classification
1. Sidebar එකෙන් **"Risk Analytics"** (අවදානම් විශ්ලේෂණය) පිටුවට පිවිසෙන්න.
2. බණ්ඩාරවෙල කලාපයේ ප්‍රධාන බෝග 4 හි Saturation මට්ටම් නිරීක්ෂණය කරන්න:
   - **Tier 1 (< 70% Saturation):** කොළ පැහැති **SAFE** badge එක. (වගා කිරීමට සම්පූර්ණයෙන්ම සුදුසුයි).
   - **Tier 2 (70% - 85% Saturation):** තැඹිලි පැහැති **WARNING** badge එක. (අවදානම් කලාපය ආසන්නයි).
   - **Tier 3 (> 85% Saturation):** රතු පැහැති **OVER_PLANTED** badge එක. (අතිරික්ත වගාවක් — වෙළඳපල මිල කඩාවැටීමේ අවදානමක් ඇත).
- **Expected Result:** බෝග වල වගා කළ ප්‍රමාණය සහ නිර්දේශිත සීමාව අනුව නිවැරදි Badge එක සහ Saturation Bar එක දිස්වේ.
- **Status:** PASS ✅

#### 🧪 TC-RISK-02: Smart Crop Recommendation Calculation
1. Leeks බෝගය **OVER_PLANTED** (85% ට වැඩි) වූ විට, පද්ධතිය යටින් පෙන්වන **Smart Crop Alternatives** බලන්න.
- **Expected Result:** Composite Score එක අනුව වැඩිම ලකුණු ලැබූ විකල්ප බෝග (Beetroot: Score 84, Green Beans: Score 79) ගොවියාට නිර්දේශ කළ යුතුය.
- **Status:** PASS ✅

---

### Use Case 4: Agrarian Officer Governance & Proxy Data Entry

#### 🧪 TC-OFF-01: Officer Proxy Planting Log for Non-Smartphone Farmers
1. Officer (`0771234567`) ලෙස login වන්න.
2. **Farmer Directory** පිටුවට යන්න.
3. ස්මාර්ට් ජංගම දුරකථන නොමැති සාම්ප්‍රදායික ගොවියෙකු වෙනුවෙන් **"Proxy Planting Entry"** බටන් එක ක්ලික් කරන්න.
4. Dropdown එකෙන් ගොවියා තෝරා (උදා: Gunapala Herath), බෝගය සහ බිම් ප්‍රමාණය ඇතුළත් කර Save කරන්න.
- **Expected Result:** අදාළ ගොවියාගේ ගිණුමට වගාව බැර වන අතර, දත්ත ඇතුළත් කළ නිලධාරියා ලෙස Sunil Weerasinghe ගේ නම සහ Officer Cadre අංකය audit trail එකේ සටහන් විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-OFF-02: Farmer Verification and Cadre Approval
1. Officer Dashboard එකෙහි **Pending Verifications** ටැබ් එක විවෘත කරන්න.
2. අලුතින් ලියාපදිංචි වූ `PENDING` තත්ත්වයේ සිටින ගොවියාගේ ඉඩම් ඔප්පු/ලේඛන විස්තර පරීක්ෂා කර **"Approve Farmer"** ක්ලික් කරන්න.
- **Expected Result:** ගොවියාගේ තත්ත්වය `APPROVED` බවට පත්වන අතර, ඔහුට Marketplace එකෙහි අස්වැන්න ලැයිස්තුගත කිරීමේ අවසරය හිමිවිය යුතුය.
- **Status:** PASS ✅

---

### Use Case 5: Zero-Waste Geofenced Proximity Marketplace

#### 🧪 TC-MKT-01: Block Unverified Farmer from Selling Produce
1. තවමත් නිලධාරී අනුමැතිය නොලැබුණු (`PENDING`) ගොවි ගිණුමකින් ලොග් වී Marketplace එකෙහි **"Create Surplus Listing"** ක්ලික් කරන්න.
- **Expected Result:** Listing එකක් දැමීම අවහිර විය යුතුය. **"Your account is pending agrarian officer verification before selling"** යනුවෙන් අනතුරු ඇඟවීමක් පෙන්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-MKT-02: Create Surplus Produce Listing (Verified Farmer)
1. අනුමත ගොවියෙකු ලෙස Login වන්න.
2. Marketplace එකෙහි **"Create Listing"** ක්ලික් කරන්න:
   - **Produce:** Cabbage (ගෝවා)
   - **Quantity:** 500 kg
   - **Expected Price:** Rs. 140.00 / kg
   - **Harvest Readiness:** Ready for Dispatch
3. Save ක්ලික් කරන්න.
- **Expected Result:** Listing එක සාර්ථකව සෑදී Marketplace එකෙහි දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-MKT-03: Proximity Radius Geofilter (5km / 10km)
1. Commercial Buyer (`0572222222` — Bandarawela Grand Hotel) ලෙස Login වන්න.
2. Marketplace පිටුවට ගොස් Distance Slider එක **"Within 10 km"** ලෙස සකසන්න.
- **Expected Result:** Haversine සූත්‍රය මඟින් හෝටලයේ සිට කිලෝමීටර් 10ක් ඇතුළත පිහිටි ගොවිපළවල් වල අතිරික්ත එළවළු පමණක් දුර අනුව පිළිවෙළට (Ascending distance) පෙළගැසිය යුතුය. කිලෝමීටර් 10න් පිටත ඇති ලැයිස්තු සැඟවිය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-MKT-04: Buyer Order Placement & Stock Decrement
1. Buyer විසින් අදාළ Cabbage ලැයිස්තුවෙන් **"Order Produce"** ක්ලික් කර කිලෝ 200ක් ඇණවුම් කර Confirm කරන්න.
- **Expected Result:** Order එක සෑදිය යුතුය. ගොවියාගේ මුල් ලැයිස්තුවේ ඉතිරි ප්‍රමාණය 500 kg සිට 300 kg දක්වා ක්ෂණිකව අඩු විය යුතුය.
- **Status:** PASS ✅

---

### Use Case 6: Live Weather & Agrarian Emergency Broadcasts

#### 🧪 TC-WEATH-01: Live Open-Meteo Weather Telemetry Ingestion
1. Navigation bar එකෙන් **"Weather"** (කාලගුණය) පිටුවට පිවිසෙන්න.
- **Expected Result:** බණ්ඩාරවෙල කලාපයේ (Elevation 1216m) සැබෑ දින 14 ක කාලගුණ අනාවැකිය (උෂ්ණත්වය, වර්ෂාපතනය, සුළඟේ වේගය) Open-Meteo API හරහා ලබාගෙන නිවැරදිව render විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-NOTIF-01: Dispatch Emergency Agricultural Advisory
1. Officer Console එකෙහි **Broadcasts** පිටුවට ගොස් **"+ New Emergency Broadcast"** ක්ලික් කරන්න.
2. **Title:** "Severe Ground Frost Warning" (මල් තුහින අනතුරු ඇඟවීම).
3. **Priority:** "URGENT" (රතු badge).
4. **Division:** "Bandarawela".
5. **Dispatch** ක්ලික් කරන්න.
- **Expected Result:** පණිවිඩය පද්ධතිය තුළ සටහන් වී ගොවීන්ගේ සහ ගැනුම්කරුවන්ගේ dashboard වල Notification banner එකක් ලෙස ක්ෂණිකව දිස්විය යුතුය.
- **Status:** PASS ✅

---

### Use Case 7: Procurement Ledger Reports & Trilingual Ergonomics

#### 🧪 TC-REP-01: Export Procurement Ledger to CSV & PDF
1. **Procurement History** පිටුවට යන්න.
2. ඉහළ ඇති **"Export Ledger"** බටන් එක ක්ලික් කරන්න.
- **Expected Result:** සියලුම ගනුදෙනු විස්තර (Order ID, දිනය, බෝගය, කිලෝ ගණන, ගැනුම්කරු, මිල) අඩංගු CSV හෝ Printable PDF ලේඛනයක් download විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-LANG-01: Trilingual Font & Language Toggle Verification
1. Header එකේ ඇති භාෂා තේරීමේ බොත්තම (Language Switcher) මඟින් **English**, **සිංහල**, සහ **தமிழ்** මාරුවෙන් මාරුවට තෝරන්න.
- **Expected Result:** පිටුව reload වීමකින් තොරව (SPA transition) සියලුම headers, table තීරු, button නම්, සහ alerts අදාළ භාෂාවෙන් නිවැරදි යුනිකෝඩ් අකුරු සහිතව දිස්විය යුතුය.
- **Status:** PASS ✅

#### 🧪 TC-RESP-01: Mobile Responsive Viewport Audit
1. Browser එකේ `F12` ඔබා Device Mode එක On කර Viewport එක **390 x 844** (iPhone 14 / Pixel 7) ලෙස සකසන්න.
- **Expected Result:** Sidebar එක slide-out drawer එකක් බවට පත්විය යුතුය. කිසිදු card එකක් හෝ table එකක් තිරයෙන් පිටතට පැන නොයා (horizontal overflow නැතිව) අලංකාරව දිස්විය යුතුය.
- **Status:** PASS ✅

---

## 4. Part B: Postman API Testing Guide
### Postman හරහා API පරීක්ෂා කිරීම

API Testing මඟින් Web UI එක භාවිතා නොකර, Backend endpoints වලට කෙලින්ම Data requests යවා Database එකේ සහ Server එකේ ක්‍රියාකාරිත්වය පරීක්ෂා කරනු ලැබේ.

---

### Postman Setup & Environment Variables
1. Postman විවෘත කර **ASVANNA Test Environment** එකක් සාදන්න.
2. Environment Variables පහත පරිදි සකසන්න:
   - `base_url`: `http://localhost:5000` (හෝ Live URL: `https://aswenna.vibesolution.tech`)
   - `farmer_token`: *(Login API එකෙන් ලැබෙන Token එක මෙහි save වේ)*
   - `officer_token`: *(Officer Login Token එක)*
   - `buyer_token`: *(Buyer Login Token එක)*

---

### Authentication & Bearer JWT Token Flow
ආරක්ෂිත API වලට request යැවීමේදී Request Header එකට Authorization Token එකක් අවශ්‍ය වේ:
```
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Core REST Endpoints Test Execution Suite

#### 1. API Health Check
- **Method:** `GET`
- **URL:** `{{base_url}}/health`
- **Headers:** None
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "status": "OK",
  "service": "ASVANNA Backend REST API"
}
```

---

#### 2. Farmer Authentication (Login) & Auto-Token Saving
- **Method:** `POST`
- **URL:** `{{base_url}}/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "phone": "0712345678",
  "password": "asvanna123"
}
```
- **Expected Status:** `200 OK`
- **Postman Tests Tab Script (ස්වයංක්‍රීයව Token එක Save කරගැනීම):**
```javascript
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Token returned and saved to environment", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.environment.set("farmer_token", jsonData.token);
});
```

---

#### 3. Negative Login Test: Incorrect Password
- **Method:** `POST`
- **URL:** `{{base_url}}/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "phone": "0712345678",
  "password": "WrongPassword123"
}
```
- **Expected Status:** `401 Unauthorized`
- **Assertion:** Response එකේ error පණිවිඩයක් තිබිය යුතුය.

---

#### 4. Officer Login (Admin/Gov Cadre)
- **Method:** `POST`
- **URL:** `{{base_url}}/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "phone": "0771234567",
  "password": "asvanna123"
}
```
- **Expected Status:** `200 OK`
- **Tests Script:** `pm.environment.set("officer_token", pm.response.json().token);`

---

#### 5. Authenticated Profile Verification
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/auth/me`
- **Headers:**
  - `Authorization`: `Bearer {{farmer_token}}`
- **Expected Status:** `200 OK`
- **Expected Response:** Farmer ගේ profile විස්තර (ID, Name, Phone, Role) JSON ලෙස ලැබිය යුතුය.

---

#### 6. Log New Planting Data (Cultivation Entry)
- **Method:** `POST`
- **URL:** `{{base_url}}/api/v1/planting/log`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{farmer_token}}`
- **Body (raw JSON):**
```json
{
  "crop_id": 1,
  "land_size_acres": 1.5,
  "planting_date": "2026-10-10",
  "latitude": 6.8258,
  "longitude": 80.9982
}
```
- **Expected Status:** `201 Created`
- **Postman Tests Script:**
```javascript
pm.test("Planting created successfully", function () {
    pm.response.to.have.status(201);
    var data = pm.response.json();
    pm.expect(data).to.have.property('id');
});
```

---

#### 7. Regional Risk Summary (Predictive Risk Engine)
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/risk/regional`
- **Headers:** None
- **Expected Status:** `200 OK`
- **Response Validation:** බණ්ඩාරවෙල කලාපයේ බෝග වල risk level (`SAFE`, `WARNING`, හෝ `OVER_PLANTED`) අඩංගු array එකක් ලැබිය යුතුය.

---

#### 8. Detailed Crop Risk Evaluation (4-Factor Engine)
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/risk/1/detailed`
- **Expected Status:** `200 OK`
- **Response Validation:** 4-factor composite weighting (Market Gap, Soil, Weather, Price) අඩංගු විය යුතුය.

---

#### 9. Geofenced Proximity Marketplace Search
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/marketplace/search?lat=6.8258&lng=80.9982&radius_km=10`
- **Headers:** None
- **Expected Status:** `200 OK`
- **Postman Tests Script:**
```javascript
pm.test("All listings are within 10 km", function () {
    var items = pm.response.json();
    items.forEach(function(item) {
        pm.expect(item.distance_km).to.be.at.most(10.0);
    });
});
```

---

#### 10. Live Weather Telemetry Ingestion
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/weather/forecast`
- **Expected Status:** `200 OK`
- **Response Validation:** Bandarawela (Elevation: 1216m) සැබෑ දින 14 ක forecast දත්ත JSON එකක් ලෙස ලැබිය යුතුය.

---

#### 11. Create Emergency Agrarian Broadcast
- **Method:** `POST`
- **URL:** `{{base_url}}/api/v1/broadcasts`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{officer_token}}`
- **Body (raw JSON):**
```json
{
  "title": "Keppetipola Market Price Drop Advisory",
  "message": "Heavy leeks influx noted at Keppetipola centre. Farmers advised to hold harvest.",
  "priority": "HIGH",
  "division": "Bandarawela"
}
```
- **Expected Status:** `201 Created`

---

#### 12. Wholesale Market Prices Benchmark
- **Method:** `GET`
- **URL:** `{{base_url}}/api/v1/prices/latest`
- **Expected Status:** `200 OK`
- **Response Validation:** කැප්පෙටිපොළ ආර්ථික මධ්‍යස්ථානයේ එළවළු තොග මිල ගණන් ලැබිය යුතුය.

---

## 5. Part C: Automated Testing
### ස්වයංක්‍රීය පරීක්ෂණ ක්‍රියාවලිය

Automated Testing මඟින් අපට මිනිස් මැදිහත්වීමකින් තොරව command එකක් run කිරීමෙන් තත්පර ගණනක් ඇතුළත පද්ධතියේ ප්‍රධාන සූත්‍ර, logic, සහ database constraints 50+ ක් ක්ෂණිකව පරික්ෂා කළ හැක.

---

### Test Suite 1: Backend Core Algorithm Suite
පද්ධතියේ ප්‍රධාන ගණිතමය සූත්‍ර 3ක් (Haversine formula, 3-tier risk logic, 4-factor recommendation composite scoring) පරීක්ෂා කරයි:

```bash
cd /home/nirman/Desktop/final-project/backend
node test/test_all_endpoints.js
```

**Output නිරීක්ෂණය:**
```text
🧪 Starting ASVANNA Test Suite...

  ✅ PASS: Haversine: Calculates exact distance between Bandarawela and Ella (approx 8.5 km)
  ✅ PASS: Haversine: Returns 0 for identical coordinates
  ✅ PASS: Risk Engine Logic: Below 70% is SAFE, 70-85% is WARNING, >85% is OVER_PLANTED
  ✅ PASS: Smart Recommendation: Composite weighting formula sums correctly

📊 Test Summary: 4/4 Tests Passed.
🎉 All core algorithms and calculation formulas verified successfully!
```

---

### Test Suite 2: NIC Format & Authentication Suite
ශ්‍රී ලංකා ජාතික හැඳුනුම්පත් (12-digit සහ 9-digit V/X) ආකෘති, Case-insensitivity, සහ මුරපද hashing නීති පරීක්ෂා කරයි:

```bash
cd /home/nirman/Desktop/final-project/backend
node test/test_nic_login.js
```

---

### Test Suite 3: Full Platform Accuracy Validation Suite
කාලගුණ දත්ත (Open-Meteo), මාස 36 ක චක්‍රීය මිල සූත්‍ර, සහ බණ්ඩාරවෙල දින 60 ක අත්හදා බැලීම් දත්ත පරීක්ෂා කරයි:

```bash
cd /home/nirman/Desktop/final-project/backend
npm test
# (Runs test/test_accuracy_validation.js)
```

---

### Test Suite 4: Mobile Flutter Unit & Widget Test Suite
Flutter Mobile App එකෙහි Risk Engine, Localization, සහ Offline sync logic පරීක්ෂා කරයි:

```bash
cd /home/nirman/Desktop/final-project/mobile
flutter test test/risk_engine_test.dart
flutter test test/notice_test.dart
```

---

## 6. Part D: QA Documentation & Defect Lifecycle
### වාර්තාකරණය සහ දෝෂ කළමනාකරණය

QA Engineer කෙනෙකු ලෙස සිදුකළ පරීක්ෂණ නිසි ලෙස ලේඛනගත කළ යුතුය.

---

### Standard Test Case Template (පරීක්ෂණ වාර්තා ආකෘතිය)

| Attribute | Description / Explanation | උදාහරණය (Example) |
|---|---|---|
| **Test Case ID** | අනන්‍ය හඳුනාගැනීමේ අංකය | `TC-AUTH-01` |
| **Module / Subsystem** | පරීක්ෂා කරන මොඩියුලය | User Authentication & RBAC |
| **Test Title** | පරීක්ෂණයේ නම | Farmer Login with Phone and Password |
| **Pre-Conditions** | පරීක්ෂාවට පෙර සපුරා තිබිය යුතු කරුණු | Farmer record exists in PostgreSQL database |
| **Test Steps** | පියවරෙන් පියවර උපදෙස් | 1. Go to `/login`<br>2. Click Farmer tab<br>3. Input phone `0712345678`<br>4. Input password `asvanna123`<br>5. Click Login |
| **Test Data** | භාවිත කළ දත්ත | Phone: `0712345678`, Pass: `asvanna123` |
| **Expected Result** | බලාපොරොත්තු වූ ප්‍රතිඵලය | HTTP 200, JWT returned, Redirected to Farmer Dashboard |
| **Actual Result** | සැබවින්ම සිදුවූ දේ | Redirected to dashboard, Kapila Bandara profile loaded |
| **Status** | ප්‍රතිඵලය | **PASS** ✅ |

---

### Defect / Bug Report Template (දෝෂ වාර්තා ආකෘතිය)

```markdown
**Defect ID:** DEF-003
**Defect Title:** GET /api/v1/prices root route returns HTTP 404 Endpoint Not Found
**Severity:** HIGH (ප්‍රධාන API endpoint එකක් ක්‍රියා විරහිතයි)
**Priority:** P1 (ඉක්මනින් විසඳිය යුතුයි)
**Component:** Backend Router (`priceRoutes.js`)
**Reporter:** Quality Assurance Engineer
**Environment:** Staging / Local Linux Node.js v20

**Description / විස්තරය:**
When frontend or mobile client requests the latest wholesale market prices via `GET /api/v1/prices`, 
the server returns 404 because the root handler was missing from `priceRoutes.js`.

**Steps to Reproduce (දෝෂය නැවත ඇතිකර පෙන්වන පියවර):**
1. Open Postman or terminal.
2. Send request: `curl http://localhost:5000/api/v1/prices`.
3. Observe HTTP status code.

**Expected Result:**
HTTP 200 OK with Keppetipola wholesale price array.

**Actual Result:**
HTTP 404 Not Found `{"error": "Cannot GET /api/v1/prices"}`.

**Remediation Applied (විසඳුම):**
Added `router.get('/', PriceController.getLatestPrices);` to `priceRoutes.js`.
```

---

### Real Defect Remediation Register (DEF-01 to DEF-08)
ASVANNA පද්ධතියේ හඳුනාගෙන සම්පූර්ණයෙන් නිරාකරණය කරන ලද දෝෂ 8 ක සාරාංශය:

| Defect ID | Severity | Component | Finding & Root Cause | Technical Remediation Applied | Retest Status |
|---|---|---|---|---|---|
| **DEF-01** | **CRITICAL** | Auth / Seed | Seed password mismatch (`asvanna123` vs doc `farmer123`). | Synchronized seed scripts and documentation. | **VERIFIED RESOLVED** ✅ |
| **DEF-02** | **CRITICAL** | Auth / Seed | Missing seeded Commercial Buyer account in database. | Seeded dedicated buyer record (`0572222222`). | **VERIFIED RESOLVED** ✅ |
| **DEF-03** | **HIGH** | API Routing | `GET /api/v1/prices` returned HTTP 404. | Added root handler to `priceRoutes.js`. | **VERIFIED RESOLVED** ✅ |
| **DEF-04** | **HIGH** | Web Security | Client-side role tampering via `?mock_role=ADMIN`. | Strictly enforced server-signed JWT claims in `AuthContext`. | **VERIFIED RESOLVED** ✅ |
| **DEF-05** | **MEDIUM** | Localization | Modal alert in `MarketplaceSurplus` displayed only in English. | Wrapped string with translation helper `t('key')`. | **VERIFIED RESOLVED** ✅ |
| **DEF-06** | **MEDIUM** | Validation | Planting form accepted GPS coordinates outside Sri Lanka. | Enforced GPS bounding box validation (Lat 6.70°-6.95°N). | **VERIFIED RESOLVED** ✅ |
| **DEF-07** | **HIGH** | Backend DB | Container restart auto-seeded DB, wiping test records. | Removed automatic seed from `docker-compose.yml`. | **VERIFIED RESOLVED** ✅ |
| **DEF-08** | **MEDIUM** | DB Schema | Notification status update failed on `'READ'`. | Updated database check constraint to include `'READ'`. | **VERIFIED RESOLVED** ✅ |

---

## 7. Quick QA Execution Checklist
### කඩිනම් පිරික්සුම් ලැයිස්තුව

- [ ] **1. Environment Verification:**
  - [ ] Backend is running on port 5000 (`http://localhost:5000/health` returns `200 OK`).
  - [ ] Frontend is running on port 5173/3000.
- [ ] **2. Manual Web UI Workflows:**
  - [ ] Farmer Login (`0712345678` / `asvanna123`) & Log Planting (1.5 Acres Leeks).
  - [ ] Negative Acreage Validation (exceeding available land is blocked).
  - [ ] Risk Analytics Check (SAFE, WARNING, OVER_PLANTED badges).
  - [ ] Officer Login (`0771234567` / `asvanna123`) & Proxy Planting Entry.
  - [ ] Emergency Broadcast Dispatch & Weather Telemetry Inspection.
  - [ ] Buyer Login (`0572222222` / `asvanna123`) & Proximity Order Placement.
  - [ ] Procurement Ledger Export (CSV/PDF).
  - [ ] Trilingual Toggle (English, සිංහල, தமிழ்) & Mobile Responsive Viewport (390x844).
- [ ] **3. Postman API Suite Execution:**
  - [ ] Login request executed and `token` saved to environment.
  - [ ] Protected endpoints (`/planting/log`, `/marketplace/search`) return expected status codes.
- [ ] **4. Automated Suite Execution:**
  - [ ] `node test/test_all_endpoints.js` exits with code 0 (`4/4 Tests Passed`).
  - [ ] `node test/test_nic_login.js` passes all NIC format tests.

---
*Developed for the National Diploma in Information Technology (NDIT), Division of Information Technology, Institute of Technology, University of Moratuwa (ITUM).*
