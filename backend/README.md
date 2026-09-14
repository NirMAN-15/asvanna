# 🌾 ASVANNA Backend API

The RESTful API server and Predictive Risk Engine powering the **ASVANNA** Agricultural Market Intelligence Platform.

## 🚀 Key Features

- **JWT Authentication & RBAC**: Strict role boundaries for `FARMER`, `OFFICER`, `BUYER`, and `ADMIN`.
- **Planting Data Collection**: GPS-tagged cultivation tracking with support for Officer proxy entries.
- **Predictive Risk Engine**: Compares regional planting density against CROPIX benchmarks to calculate 3-tier risk (`SAFE` <70%, `WARNING` 70-85%, `OVER_PLANTED` >85%).
- **Smart Crop Recommendation Engine**: Multi-factor ranking (Market Gap 35%, Soil 25%, Weather 20%, Historical Price 20%).
- **Geo-Fenced Zero-Waste Marketplace**: Haversine 5 km proximity surplus produce search and direct buyer-farmer negotiation.
- **Divisional Officer Broadcast Warnings**: Multi-channel emergency push notification (FCM) and SMS fallback.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+
- **Real-time & Messaging**: Firebase Admin SDK (FCM & Realtime DB)
- **Security**: Helmet, bcryptjs, JSON Web Tokens (JWT)

## 🏃 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and adjust credentials
cp .env.example .env

# 3. Run database migrations
npm run migrate

# 4. Seed initial Bandarawela pilot data
npm run seed

# 5. Start development server
npm run dev
```
