# 🌾 ASVANNA Mobile Application
> **The Zero-Waste Marketplace: Upcountry Agricultural Sowing Intelligence & Proximity Marketplace**  
> **Institute of Technology, University of Moratuwa (ITUM) — Final Project (March 2026)**  
> **Assigned Mobile Developer:** Imal Lakshitha (23IT0503)  
> **Framework:** Flutter with Dart (Material 3 + Provider + Offline Persistence + i18n)

---

## 🌟 Executive Summary

**ASVANNA** is a digital agricultural intelligence and zero-waste marketplace platform engineered for Sri Lanka's upcountry vegetable cultivation belt (**Bandarawela & Nuwara Eliya**).

The mobile application addresses two core national crises identified in the university project proposal:
1. **Pre-Planting Market Gluts & Price Crashes**: Sowing saturation warnings that inform smallholder farmers before they plant over-saturated crops (e.g., Bandarawela Leek Crisis at 163% saturation).
2. **Post-Harvest Food Wastage**: A 5km proximity zero-waste marketplace connecting farmers with local event caterers, hotels, and bulk buyers to liquidate perishable harvests with digital pickup vouchers.

---

## 🏗️ Technical Architecture & Directory Structure

The application is structured according to **Clean Architecture** principles:

```
lib/
├── main.dart                                # Application Entry Point & Provider Scaffolding
├── core/
│   ├── localization/
│   │   └── app_translations.dart            # Multi-language Dictionary (English, Sinhala සිංහල, Tamil தமிழ்)
│   ├── models/
│   │   ├── crop_model.dart                  # Crop & PlantedCropEntry models
│   │   ├── risk_analysis_model.dart         # Risk levels, Saturation %, & Alternatives
│   │   ├── farmer_model.dart                # Farmer Profile & Land Acreage Math
│   │   ├── buyer_model.dart                 # Bulk Buyer & Catering Profile
│   │   ├── surplus_listing_model.dart       # 5km Surplus Produce Listings
│   │   └── notice_model.dart                # Agrarian Circulars & Subsidies
│   ├── providers/
│   │   └── app_state_provider.dart          # Reactive Global State Provider
│   ├── services/
│   │   ├── api_service.dart                 # REST API Integration Layer (POST /planting, GET /risk-analysis)
│   │   ├── offline_storage_service.dart     # SharedPreferences Persistence & Offline Queue
│   │   └── mock_data_service.dart           # Realistic Bandarawela Upcountry Dataset
│   └── theme/
│       ├── app_colors.dart                  # Material 3 Agri-Palette & Risk Indicators
│       └── app_theme.dart                   # Typography (Google Fonts) & Component Themes
└── features/
    ├── auth/
    │   ├── role_selection_screen.dart       # Landing Page with 1-Tap Language Switcher
    │   ├── farmer_registration_screen.dart  # Farmer Land & GND Onboarding
    │   └── buyer_registration_screen.dart   # Buyer Capacity Onboarding
    ├── farmer/
    │   ├── farmer_main_nav.dart             # 5-Tab Navigation Bar
    │   ├── screens/
    │   │   ├── farmer_dashboard_screen.dart # Acreage Meter, Active Crops & Cloud Sync Status
    │   │   ├── farm_land_map_screen.dart    # Interactive Terraces & Plots Map (Plot A, B, C)
    │   │   ├── crop_detail_screen.dart      # 4-Stage Growth Lifecycle & Zero-Waste Guide
    │   │   ├── pre_planting_risk_screen.dart# Saturation Gauge & Sowing Simulator
    │   │   ├── planting_entry_screen.dart   # Sowing Entry Form (POST /api/v1/planting)
    │   │   ├── price_trends_screen.dart     # 6-Month FL Chart Historical & Forecast Trends
    │   │   ├── weather_screen.dart          # Multi-Division Radar & Fungal Disease Index
    │   │   ├── notice_board_screen.dart     # Agrarian Circulars & Fertilizer Subsidies
    │   │   └── officer_contact_screen.dart  # Direct Chat & Hotline to Bandarawela DO
    │   └── widgets/
    │       ├── crop_comparison_modal.dart   # Side-by-Side Crop Comparison Matrix
    │       ├── post_surplus_modal.dart      # Publish Surplus Lot to 5km Market
    │       └── presentation_demo_panel.dart # ✨ University Presentation Showcase Drawer
    └── buyer/
        ├── buyer_main_nav.dart              # Buyer Navigation Bar
        └── screens/
            ├── proximity_marketplace_screen.dart # 1-10km Proximity Slider & Radar Map
            ├── surplus_detail_screen.dart        # Volume Slider & Digital Pickup Voucher
            ├── direct_chat_screen.dart          # Buyer-Farmer Direct Negotiation Chat
            └── order_history_screen.dart        # Food Waste Prevented & Savings Tracker
```

---

## 🎯 Key Capabilities & Screen Matrix

| Feature Module | Key Deliverables |
| :--- | :--- |
| **🌐 Localization (i18n)** | Instant 1-tap switching between **English (🇬🇧)**, **Sinhala (🇱🇰 සිංහල)**, and **Tamil (🇱🇰 தமிழ்)**. |
| **🧮 Pre-Planting Risk Engine** | Live saturation meters (`Safe`, `Moderate`, `Critical`), live **Sowing Simulator Slider**, and glut price drop loss forecast. |
| **⚖️ Crop Comparison Matrix** | Side-by-side comparison of any 2 vegetables with automated **Asvanna Agronomic Verdicts**. |
| **🗺️ Farm Terraces & Plots Map** | Spatial plot visualizer separating active crops from ready-to-sow fallow plots. |
| **📝 Planting Entry Flow** | Enforces land capacity validation and conforms to `POST /api/v1/planting`. |
| **⛅ Weather & Blight Radar** | Multi-division forecast (Bandarawela, Nuwara Eliya, Welimada), hourly rain radar, and Late Blight disease alerts. |
| **🏢 5km Zero-Waste Market** | Interactive proximity radius slider (1–10 km), visual radar map, and urgent perishable clearance cards. |
| **🎟️ Digital Pickup Voucher** | Generates verifiable order vouchers (`#ASV-5KM-XXXX`) with QR codes, pickup pins, and savings calculations. |
| **💾 Offline-First Storage** | Local caching with `SharedPreferences` and automatic offline sync queue when internet is restored. |
| **✨ Presentation Showcase** | Dedicated panel for university examiners to instantly trigger test scenarios (Leek Crisis, Beetroot Deficit, Buyer Clearance). |

---

## 🧪 Testing & Verification

Automated unit tests are located in `test/risk_engine_test.dart`:

```bash
# Run tests
flutter test
```

### Running the App:
```bash
# Preview in Chrome (recommended for VS Code development)
flutter run -d chrome

# Run on physical Android device
flutter run
```

---

## 👥 Project Team Credits (ITUM 2026)
* **Supervisor:** Mrs. Uthpala Athukorala
* **Imal Lakshitha (23IT0503)** — Mobile Application Developer *(This Repository)*
* **Nirman K.** — Project Manager
* **Tharaka M.** — Backend Architect
* **Ravindi S.** — Web Admin Portal Developer
* **Miyuni P.** — Quality Assurance & Testing Lead
