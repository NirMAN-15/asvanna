# ASVANNA — Oracle Cloud Infrastructure (OCI) Deployment Guide
## Complete Step-by-Step Server Setup, Docker Deployment & External API Guide
**Target Server**: Oracle Cloud Infrastructure (Ubuntu 20.04 Minimal, Public IP: `129.150.60.135`)  
**Project**: ASVANNA Agricultural Intelligence Platform (ITUM - University of Moratuwa)

---

## 1. External APIs & Services Readiness (What Works Before Setup)

You do **NOT** need to configure Firebase or buy external API keys before deploying. The system is designed to run immediately out-of-the-box:

| Service / API | Current Setup State | Behavior During Initial Deployment | Action Required Before Deploy? |
| :--- | :--- | :--- | :--- |
| **Firebase Cloud Messaging (FCM)** | Not configured yet | **Automatic Mock Fallback**: Notifications and advisories are archived directly to the **In-App Notice Board** (`notification_logs` database table). The app will NOT crash; it prints a warning and delivers all alerts in-app. | ❌ **None** (Can deploy now) |
| **Open-Meteo Weather API** | Ready & Active | **100% Free Public API**: Requires **NO API key** and no registration. Fetches real-time 14-day agro-weather telemetry for Bandarawela (`6.8304°N, 80.9878°E`). Has built-in offline fallback if internet drops. | ❌ **None** (Works automatically) |
| **Keppetipola Wholesale Prices** | Ready & Active | **Internal Benchmark Database**: Real wholesale price ranges for 25 Sri Lankan crops are seeded into PostgreSQL. Officers can also log daily rates via the `/prices` portal. | ❌ **None** (Works automatically) |
| **CROPIX Quota Engine** | Ready & Active | **Embedded National Registry**: Department of Agriculture regional acreage benchmarks are pre-seeded in the database to calculate over-planting risk. | ❌ **None** (Works automatically) |
| **SMS Gateway** | Excluded | **Free In-App & Push Only**: Paid SMS gateways have been completely omitted in favor of free in-app notice board alerts. | ❌ **None** (Zero cost) |

---

## 2. Phase 1: What to Do BEFORE Connecting (Oracle Cloud Firewall)

> [!IMPORTANT]
> Oracle Cloud Virtual Cloud Networks (VCN) block **all incoming web traffic** by default except SSH (Port 22). If you do not add ingress rules in the OCI web console, your web portal and API will be unreachable from your browser.

### Step 2.1: Open Ingress Ports in OCI Console
1. In the Oracle Cloud Console, navigate to your instance details page (`instance-20260912-2030`).
2. Under **Instance Information** or **Primary VNIC**, click your **Subnet** link (or go to **Networking** > **Virtual Cloud Networks** > Click your VCN).
3. In the left navigation menu, click **Security Lists**.
4. Click the **Default Security List for...** link.
5. Click **Add Ingress Rules** and enter:
   - **Source Type**: `CIDR`
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Source Port Range**: *(Leave blank / All)*
   - **Destination Port Range**: `80, 443, 3000, 5000`
   - **Description**: `ASVANNA Web Portal and Backend API`
6. Click **Add Ingress Rules**.

### Step 2.2: Locate Your SSH Private Key
Find the private key file (`.key` or `.pem`) that was downloaded to your computer when you launched the instance (e.g. `C:\Users\nirma\Downloads\ssh-key-2026-09-12.key`).

---

## 3. Phase 2: Connect to Your Cloud Instance via SSH

Open **PowerShell** or **Command Prompt** on your local computer:

```powershell
ssh -i "C:\path\to\your-ssh-key.key" ubuntu@129.150.60.135
```

> [!TIP]
> If Windows gives a *"Permissions for private key are too open"* error, run:
> ```powershell
> icacls "C:\path\to\your-ssh-key.key" /inheritance:r /grant:r "%USERNAME%:R"
> ```

---

## 4. Phase 3: Prepare the Cloud Server

Once logged in as `ubuntu@instance-20260912-2030`, run these setup commands:

### Step 4.1: Open Ubuntu Internal Firewall (`iptables`)
Oracle Ubuntu images have internal firewall rules that drop non-SSH traffic:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5000 -j ACCEPT
sudo netfilter-persistent save || sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Step 4.2: Update System & Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## 5. Phase 4: Clone the Project from GitHub

Clone the repository we pushed to GitHub:

```bash
git clone https://github.com/NirMAN-15/asvanna.git
cd asvanna
git checkout develop
```

---

## 6. Phase 5: Launch with Docker Compose

Run the entire platform with one single command:

```bash
docker compose up -d --build
```

### What Docker will do automatically:
1. **`asvanna-postgres`**: Downloads PostgreSQL 15, creates the database `asvanna_db`, initializes tables from `schema.sql`, and seeds initial crops and demo users.
2. **`asvanna-backend`**: Builds the Node.js Express REST API, executes database migrations, and listens on port `5000`.
3. **`asvanna-web-admin`**: Builds the React Multi-Role Web Portal with Nginx and serves it on port `3000`.

---

## 7. Phase 6: Verify and Access the Live System

### Step 7.1: Check Container Status on the Server
```bash
# View running containers
docker compose ps

# View live backend logs
docker compose logs -f backend
```
*(Press `Ctrl + C` to exit log streaming).*

### Step 7.2: Access in Your Web Browser
Open your browser from your PC or phone:
- 🌐 **Web Portal**: `http://129.150.60.135:3000`
- 📡 **Backend API Health**: `http://129.150.60.135:5000/health`

### Step 7.3: Demo Credentials for Testing
- **Super Administrator**: `0770000000` / `admin123`
- **Agrarian Division Officer**: `0771234567` / `officer123`
- **Smallholder Farmer**: `0712345678` / `farmer123`
- **Wholesale / Commercial Buyer**: `0734567890` / `buyer123`

---

## 8. How to Setup Firebase Later (When You Are Ready)

When you are ready to enable real-time Firebase Cloud Messaging (FCM) push notifications:

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Go to **Project Settings** > **Service Accounts**.
3. Click **Generate New Private Key** to download the JSON credentials file.
4. Rename the file to `firebase-service-account.json`.
5. Upload it to your cloud instance inside `backend/config/`:
   ```bash
   scp -i "C:\path\to\your-ssh-key.key" firebase-service-account.json ubuntu@129.150.60.135:~/asvanna/backend/config/
   ```
6. Restart the backend container:
   ```bash
   docker compose restart backend
   ```
The backend will automatically detect the key and switch from mock mode to live FCM push notifications.

---

## 9. Useful Daily Management Commands

```bash
# View live logs for all services:
docker compose logs -f

# Restart the application:
docker compose restart

# Stop the application:
docker compose down

# Update the server when team members push new changes:
git pull origin develop
docker compose up -d --build
```
