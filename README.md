# 🌾 ASVANNA (අස්වැන්න)
### The Zero-Waste Marketplace: Guided by Real-Time Data from Seed to Harvest Distribution

[![CI Pipeline](https://github.com/asvanna/asvanna/actions/workflows/ci.yml/badge.svg)](https://github.com/asvanna/asvanna/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org)
[![Flutter Version](https://img.shields.io/badge/Flutter-3.x-cyan.svg)](https://flutter.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org)

---

## 🎓 Academic Project Information

- **Institution**: Division of Information Technology, Institute of Technology, University of Moratuwa (ITUM)
- **Program**: National Diploma in Information Technology (NDIT)
- **Academic Year**: 2025 / 2026
- **Project Supervisor**: Mrs. Uthpala Athukorala

### 👥 Project Team (Group 15)
1. **W. N. A. Wedikkara** — `23IT0544`
2. **K. A. H. I. Lakshitha** — `23IT0503`
3. **G. W. T. Jayampathi** — `23IT0487`
4. **R. R. L. Geeganage** — `23IT0476`
5. **K. H. M. Dewanga** — `23IT0467`

---

## 📖 Executive Summary

**ASVANNA** is a collaborative digital ecosystem designed to stabilize Sri Lanka's agricultural economy by eliminating the destructive cycle of "trend planting" and minimizing post-harvest waste for upcountry smallholder farming communities (Bandarawela pilot).

Upcountry farmers cultivating highly perishable vegetables (leeks, cabbage, carrots, beetroot) suffer annual post-harvest losses estimated at 30% to 40% (Rs. 180 billion) due to market gluts caused by lack of transparency. ASVANNA resolves this via:

1. **Phase 1: Real-Time Regional Cultivation Monitoring & Predictive Risk Engine**
   - GPS-tagged planting logs comparing regional supply against national demand benchmarks (CROPIX API).
   - Three-tier saturation alerts (`SAFE` <70%, `WARNING` 70-85%, `OVER_PLANTED` >85%).
   - Multi-factor smart crop alternative recommendations.
2. **Phase 2: Geo-Fenced Zero-Waste Surplus Marketplace**
   - 5 km radius direct trade between farmers and local commercial buyers.
3. **Digital Inclusivity & Proxy Data Entry**
   - Web portal for Divisional Agrarian Officers to log data for offline farmers without smartphones.
4. **Trilingual Support**
   - Full accessibility in English, Sinhala (සිංහල), and Tamil (தமிழ்).

---

## 🏛️ Ecosystem Architecture

```
Asvenna/
├── backend/            # Express.js REST API, PostgreSQL schema, Risk Engine & Services
├── frontend/           # React.js (Vite) Web Portal for Divisional Officers & Admin
├── mobile/             # Flutter cross-platform mobile application for Farmers & Buyers
├── docs/               # System architecture, OpenAPI REST specs, DB Schema, and Guides
├── .github/workflows/  # Continuous Integration (CI) pipeline
├── docker-compose.yml  # Multi-container orchestration (DB, API, Web)
└── setup-individual-repos.sh # Helper script for multi-repo git distribution
```

---

## ⚡ Quick Start with Docker

You can launch the complete backend, PostgreSQL database, and Multi-Role Web Portal with a single command:

```bash
docker compose up -d --build
```

- **Multi-Role Web Portal**: [http://localhost:3000](http://localhost:3000) (Features landing page gateway with separate Officer, Farmer, and Buyer portals)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **Detailed Deployment Guide**: Refer to [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for VPS, Cloud PaaS, Nginx, SSL, and mobile configuration.
- **Team Collaboration & Testing Workflow**: Refer to [docs/GIT_WORKFLOW_GUIDE.md](docs/GIT_WORKFLOW_GUIDE.md) for branch guidelines, member PR workflows, and testing procedures.

---

## 🛠️ Individual Sub-Project Setup

### 1. Backend API (`backend/`)
```bash
cd backend
npm install
cp .env.example .env
npm run migrate    # Create PostgreSQL schema
npm run seed       # Seed Bandarawela pilot dataset & demo accounts
npm run dev        # Run server on port 5000
```

### 2. Multi-Role Web Portal (`frontend/`)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # Run React application on port 3000
```

### 3. Mobile Application (`mobile/`)
```bash
cd mobile
flutter pub get
flutter run        # Run on Android emulator / physical device
```

---

## 🔑 Demo Credentials (Seeded)

| Role | Phone Number | Password | Purpose |
|---|---|---|---|
| **Divisional Officer** | `0771234567` | `asvanna123` | Bandarawela Agrarian Portal & Proxy Entry |
| **Farmer** | `0712345678` | `asvanna123` | Farmer Mobile App Cultivation Logger |
| **Buyer** | `0572222222` | `asvanna123` | Surplus Produce Procurement |
| **Super Admin** | `0770000000` | `asvanna123` | System Administrator |

---

## 📄 License & Attribution

This project is developed under the **MIT License** for the Division of Information Technology, Institute of Technology, University of Moratuwa.
