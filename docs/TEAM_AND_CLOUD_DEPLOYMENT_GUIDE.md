# 🌾 ASVANNA Platform — Team Member Setup & Cloud Deployment Guide
**Pilot Deployment**: Bandarawela Agrarian Division, Badulla District, Sri Lanka  
**Repository**: [https://github.com/NirMAN-15/asvanna.git](https://github.com/NirMAN-15/asvanna.git)  
**Active Working Branch**: `develop` / `member/weddikkara`  
> [!IMPORTANT]
> The canonical working branches are **`develop`** and **`member/weddikkara`** (both synchronized 1:1). Teammate branches `member/geeganage` and `member/jayampathi` have been fully integrated into `develop`. Teammate branches `member/lakshitha` and `member/dewanga` are excluded/isolated.

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Scenario A: New Team Member (First Time Setup on Another PC)](#2-scenario-a-new-team-member-first-time-setup-on-another-pc)
3. [Scenario B: Existing Member (Updating Previously Used Codebase)](#3-scenario-b-existing-member-updating-previously-used-codebase)
4. [Database Verification & Default Credentials](#4-database-verification--default-credentials)
5. [Cloud Deployment Guide (Oracle Cloud / AWS / DigitalOcean / VPS)](#5-cloud-deployment-guide-oracle-cloud--aws--digitalocean--vps)
6. [Cloud Production Enhancements (Domain & Free SSL)](#6-cloud-production-enhancements-domain--free-ssl)
7. [Troubleshooting & Helpful Commands](#7-troubleshooting--helpful-commands)

---

## 1. Prerequisites

Before starting, ensure the machine (Local PC or Cloud VM) has the following installed:

| Tool | Minimum Version | Purpose | Download / Install |
| :--- | :---: | :--- | :--- |
| **Git** | 2.30+ | Source code control & branch management | [git-scm.com](https://git-scm.com/) |
| **Docker Desktop / Engine** | 24.0+ | Runs PostgreSQL, Backend API, and Web Admin in containers | [docker.com](https://www.docker.com/) |
| **Docker Compose** | v2.20+ | Multi-container orchestration (`docker compose`) | Bundled with Docker |
| **Node.js** *(Optional)* | 18+ LTS | Only needed if running without Docker | [nodejs.org](https://nodejs.org/) |

> [!NOTE]
> When using Docker, you **do not** need to install PostgreSQL or configure local database ports manually. Everything runs isolated inside Docker containers.

---

## 2. Scenario A: New Team Member (First Time Setup on Another PC)

Follow these steps if you are setting up the project on a new computer for the first time.

### Step 1: Clone the Repository
Open Terminal (macOS/Linux) or PowerShell/Git Bash (Windows) and clone the repository:

```bash
git clone https://github.com/NirMAN-15/asvanna.git
cd asvanna
```

### Step 2: Switch to the Active Working Branch
Switch to the branch containing the latest updates (11 pilot crops, 52 test users, 3-color risk outline, 5s translation debounce):

```bash
git checkout member/weddikkara
git pull origin member/weddikkara
```

### Step 3: Configure Environment Files
Copy the pre-configured Docker environment files:

```bash
# 1. Root Docker Compose environment file
cp .env.docker .env 2>/dev/null || cp backend/.env .env

# 2. Backend environment file
cp backend/.env.example backend/.env 2>/dev/null || true

# 3. Frontend environment file
cp frontend/.env.docker frontend/.env 2>/dev/null || true
```

If `.env.docker` is already present, verify the root `.env` contains:
```env
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=asvanna_db
DB_PORT=5432
PORT=5000
ADMIN_CREATION_KEY="asvanna#2026"
INITIAL_ADMIN_PASSWORD=Admin@2026!
MASTER_USER_PASSWORD=Admin@2026!
```

### Step 4: Build and Start Docker Containers
Execute Docker Compose to build the images and launch the containers in the background:

```bash
docker compose build
docker compose up -d
```

Verify that all 3 containers are healthy and running:
```bash
docker ps
```
You should see:
* `asvanna-postgres` (PostgreSQL 15 on port `5432`)
* `asvanna-backend` (Node.js API on port `5000`)
* `asvanna-web-admin` (React Web on port `3000`)

### Step 5: Initialize Schema & Seed Data (11 Crops & 52 Users)
> [!TIP]
> **Automatic Seeding**: The backend container automatically runs `migrate.js` on startup, which automatically checks the database and seeds the 11 pilot crops, 2 admin accounts, and 50 test farmers if they are not already present.

If you wish to manually verify or force initialize all baseline data at any time, run:

```bash
# Run one-command database initialization (Schema + 11 Crops + Admins + 50 Farmers + 105 Cultivations)
docker exec asvanna-backend npm run db:init
```
*(Or run individual seed scripts if needed)*:
```bash
docker exec asvanna-backend node src/database/migrate.js
docker exec asvanna-backend node src/database/seed.js
docker exec asvanna-backend node src/database/seed_admin.js
docker exec asvanna-backend node src/database/seed_bandarawela_cultivation.js
```

### Step 6: Run Automated Accuracy Verification Suite
Verify that all components, algorithms, and models pass 100%:

```bash
docker exec asvanna-backend npm test
```
**Expected Output**: `VERIFICATION COMPLETE: 29 / 29 CHECKS PASSED (100%)`.

---

## 3. Scenario B: Existing Member (Updating Previously Used Codebase)

If you already have a local clone of the project from an earlier session, follow these steps to update your files and database without conflicts.

### Step 1: Check Local Status & Stash Unsaved Work
Avoid git conflicts by checking your status:

```bash
git status
```

If you have uncommitted changes you want to keep:
```bash
git stash
```

### Step 2: Fetch and Pull Latest Changes
Pull all latest commits from `member/weddikkara`:

```bash
git fetch origin
git checkout member/weddikkara
git pull origin member/weddikkara
```

### Step 3: Rebuild and Restart Docker Containers
Since packages, backend logic, or frontend components have changed, rebuild the Docker containers:

```bash
docker compose build
docker compose up -d
```

### Step 4: Synchronize Database (Clean to 11 Crops & 52 Users)
If your existing database still has old 21 crops or needs synchronization with the 50 Bandarawela test farmers and 105 cultivation records, simply run:

```bash
docker exec asvanna-backend npm run db:init
```
*(Or run individual seeders if needed)*:
```bash
docker exec asvanna-backend node src/database/seed.js
docker exec asvanna-backend node src/database/seed_admin.js
docker exec asvanna-backend node src/database/seed_bandarawela_cultivation.js
```

### Step 5: Verify
Run the test suite to ensure everything runs smoothly:
```bash
docker exec asvanna-backend npm test
```

---

## 4. Database Verification & Default Credentials

### System Credentials Summary

| Role | Login Identifier | Phone | Default Password | Special Authorization Key |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `ADMIN` | `0770000000` | `Admin@2026!` | `asvanna#2026` |
| **Master User (Multi-role)** | `200322610371` | `0772261037` | `Admin@2026!` | Role Switch Enabled |
| **50 Test Farmers** | NIC or Phone | `0771000001` - `0771000050` | `Farmer@2026!` | Pre-seeded with Badulla land |

> [!IMPORTANT]
> **Master Credential Key for Officer / Admin Creation**:
> When an Administrator creates a new Officer or Admin via the User Directory modal, the secret key `asvanna#2026` must be entered in the Master Credential Key field.

### Web & API Endpoints
* **Web Admin Portal**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
* **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### Retained 11 Pilot Crops
The database strictly contains the 11 verified Bandarawela crops:
`Beans`, `Carrot`, `Leeks`, `Cabbage`, `Tomato`, `Cauliflower`, `Capsicum`, `Beetroot`, `Knol-Khol`, `Radish`, `Broccoli`.

---

## 5. Cloud Deployment Guide (Oracle Cloud / AWS / DigitalOcean / VPS)

Follow this universal cloud deployment procedure to host ASVANNA on any Ubuntu/Debian Cloud Virtual Machine (e.g., Oracle Cloud Always Free, AWS EC2, DigitalOcean Droplet, GCP Compute Engine).

### Step 5.1: Configure Cloud Firewall / Ingress Rules
Before connecting, go to your Cloud Provider's Web Console (e.g., OCI Security Lists, AWS Security Groups, or DigitalOcean Firewalls) and allow incoming TCP traffic on the following ports:

| Port | Protocol | Purpose | Source CIDR |
| :---: | :---: | :--- | :---: |
| **22** | TCP | SSH Remote Terminal Access | Your IP or `0.0.0.0/0` |
| **80** | TCP | Standard HTTP Web Traffic | `0.0.0.0/0` |
| **443** | TCP | Secure HTTPS Web Traffic | `0.0.0.0/0` |
| **3000** | TCP | React Web Admin Dashboard | `0.0.0.0/0` |
| **5000** | TCP | Backend Express API Gateway | `0.0.0.0/0` |

### Step 5.2: Connect to the Cloud Server via SSH
Open your terminal on your computer and connect to your cloud VM:

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_CLOUD_PUBLIC_IP
```

### Step 5.3: Update System Packages & Install Docker
Run the following commands on the remote cloud server:

```bash
# Update Ubuntu package lists
sudo apt update && sudo apt upgrade -y

# Install Git and Curl
sudo apt install -y git curl ufw

# Install Docker using the official automated script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable Docker without requiring sudo every time
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker and Docker Compose
docker --version
docker compose version
```

### Step 5.4: Open Firewall Ports on the Ubuntu Server (UFW)
Ensure Ubuntu's built-in firewall allows traffic on required ports:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
sudo ufw enable
sudo ufw status
```

### Step 5.5: Clone Project on the Cloud Server
```bash
git clone https://github.com/NirMAN-15/asvanna.git
cd asvanna
git checkout member/weddikkara
```

### Step 5.6: Configure Cloud Environment Settings
Set up `.env` files with your Cloud Server's Public IP or Domain:

1. **Root `.env`**:
```bash
cat << 'EOF' > .env
NODE_ENV=production
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=asvanna_db
DB_PORT=5432
PORT=5000
JWT_SECRET=asvanna_super_secure_jwt_moratuwa_2026_key
ADMIN_CREATION_KEY="asvanna#2026"
INITIAL_ADMIN_PASSWORD=Admin@2026!
MASTER_USER_PASSWORD=Admin@2026!
EOF
```

2. **Frontend `.env` (Points to Cloud Public IP)**:
```bash
cat << 'EOF' > frontend/.env
VITE_API_BASE_URL=http://YOUR_CLOUD_PUBLIC_IP:5000/api/v1
EOF
```
*(Replace `YOUR_CLOUD_PUBLIC_IP` with your actual server IP, e.g., `129.150.60.135`)*

### Step 5.7: Launch Containers on Cloud
```bash
docker compose up -d --build
```

### Step 5.8: Run Migrations and Seed Database on Cloud
The backend container automatically validates and seeds baseline data on startup. If you ever need to manually verify or initialize the complete baseline dataset (11 crops, 2 admins, 50 farmers, 105 cultivation records):

```bash
docker exec asvanna-backend npm run db:init
```

*(Or run manually if needed)*:
```bash
docker exec asvanna-backend node src/database/migrate.js
docker exec asvanna-backend node src/database/seed.js
docker exec asvanna-backend node src/database/seed_admin.js
docker exec asvanna-backend node src/database/seed_bandarawela_cultivation.js
```

### Step 5.9: Verify Cloud Deployment
Run tests inside cloud container:
```bash
docker exec asvanna-backend npm test
```

Now open your browser:
* **Web Admin Portal**: `http://YOUR_CLOUD_PUBLIC_IP:3000`
* **API Health Check**: `http://YOUR_CLOUD_PUBLIC_IP:5000/api/v1/health`

---

## 6. Cloud Production Enhancements (Domain & Free SSL)

To expose your platform on standard port `80` and `443` (HTTPS) with a domain name (e.g. `asvanna.gov.lk` or `asvanna.me`):

### Option A: Let Nginx map Port 80 directly
In `docker-compose.yml`, change the `web-admin` port binding from `"3000:80"` to `"80:80"`. Then users access the site directly via `http://YOUR_DOMAIN_OR_IP`.

### Option B: Free SSL with Certbot (Let's Encrypt)
If you point a domain to your server IP:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 7. Troubleshooting & Helpful Commands

### View Live Logs
```bash
# View all container logs
docker compose logs -f

# View only backend API logs
docker compose logs -f backend

# View only database logs
docker compose logs -f postgres
```

### Restart Services
```bash
# Restart everything
docker compose restart

# Rebuild and restart specific service (e.g., frontend)
docker compose build web-admin && docker compose up -d web-admin
```

### Reset Database Completely
If you ever need to clear everything and start fresh:
```bash
# Stop containers and remove database volume
docker compose down -v

# Start clean
docker compose up -d --build

# Run one-command migrations and seeders
docker exec asvanna-backend npm run db:init
```

### Export or Backup Database
To back up the current database into a `.sql` file:
```bash
docker exec asvanna-postgres pg_dump -U postgres asvanna_db > asvanna_backup.sql
```

To restore the backup file:
```bash
cat asvanna_backup.sql | docker exec -i asvanna-postgres psql -U postgres -d asvanna_db
```

### GitGuardian & Secret Security Guidelines
To prevent CI security pipeline failures or GitGuardian incident triggers:
1. **Never commit `.env` files**: All `.env`, `.env.local`, and credential files are explicitly ignored via `.gitignore`.
2. **Never commit API tokens or secrets**: Never write GitHub Personal Access Tokens (`ghp_...`), Firebase private keys, database passwords, or secret authorization keys directly into source code, comments, or commit messages.
3. **Use sanitized `.env.example` files**: Only commit example configurations with generic placeholders (e.g., `your_api_key_here`).
4. **Clean Git State**: Always verify `git status` and `git diff` before running `git commit` to ensure no sensitive files or logs are staged.
