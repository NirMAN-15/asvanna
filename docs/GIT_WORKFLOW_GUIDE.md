# ASVANNA — Git Collaboration & Testing Workflow Guide
## Team Collaboration Workflow | Institute of Technology University of Moratuwa

This document provides the standard procedure for all group members to commit their code, how the project maintainer integrates features into the `develop` branch, how testing is conducted, and how verified releases are merged into `main`.

---

## 1. Branch Architecture

```
[Member Branches]        ──(Pull Request)──▶       [develop]           ──(Release Merge)──▶       [main]
- member/weddikkara                                (Integration & Testing)                        (Production Baseline)
- member/lakshitha
- member/jayampathi
- member/geeganage
- member/dewanga
- member/member-6
```

| Branch | Purpose | Who Works Here | Protection Level |
| :--- | :--- | :--- | :--- |
| **`main`** | Production release baseline | Maintainer / Leader | Protected — Do NOT commit directly |
| **`develop`** | Integration, configuration & test hub | All team code merges here | Protected — Merge only via PR or testing |
| **`member/*`** | Individual workspace for each member | Assigned group member | Free to commit and push |

---

## 2. Team Member Workflow (How to Edit & Submit Code)

Every group member must work strictly inside their assigned branch.

### Step 2.1: Clone and Switch to Your Branch
When first setting up or starting a new task:
```bash
# 1. Clone repository (first time only)
git clone https://github.com/NirMAN-15/asvanna.git
cd asvanna

# 2. Make sure develop is up-to-date
git checkout develop
git pull origin develop

# 3. Switch to your assigned branch
git checkout member/lakshitha
# (Or your respective branch: member/weddikkara, member/jayampathi, etc.)

# 4. Bring in latest develop changes before coding
git merge develop
```

### Step 2.2: Make Edits & Test Locally
Work on your assigned component (e.g. Frontend UI, Backend API, or Mobile Flutter screen). Always test locally before pushing:
```bash
# Check your modified files
git status
```

### Step 2.3: Commit and Push to Your Branch
**Never push directly to `main` or `develop`!**
```bash
# 1. Stage modified files
git add .

# 2. Commit with a descriptive message
git commit -m "feat(marketplace): add farmer order countdown timer UI"

# 3. Push to your branch on GitHub
git push origin member/lakshitha
```

### Step 2.4: Open a Pull Request (PR)
1. Go to [https://github.com/NirMAN-15/asvanna](https://github.com/NirMAN-15/asvanna).
2. Click **Pull requests** > **New pull request**.
3. Select:
   - **Base**: `develop` *(Target integration branch)*
   - **Compare**: `member/lakshitha` *(Your branch)*
4. Title the PR clearly (e.g. `feat: Marketplace Farmer SLA countdown timer`).
5. Click **Create pull request** and notify the maintainer.

---

## 3. Maintainer Workflow (Testing Changes in `develop`)

Before any code is accepted into `develop`, the maintainer must pull the code and execute the test checklist.

### Step 3.1: Fetch the Member's Changes
```bash
# 1. Switch to develop branch
git checkout develop

# 2. Pull the latest develop updates
git pull origin develop

# 3. Merge the member's branch into local develop
git merge origin/member/lakshitha
```

### Step 3.2: Execute the 4-Point Verification Checklist

#### Checklist 1: Frontend Production Build Test
Ensures zero JSX syntax errors, no missing imports, and no broken styling:
```bash
npm --prefix frontend run build
```
> **Pass criteria**: Build exits with code 0 (`✓ built in ...s`, 0 errors).

#### Checklist 2: System Verification Suite
Verifies that the multi-factor risk engine, Open-Meteo weather service, crop recommendations, and Keppetipola pricing services function correctly:
```bash
node backend/test/test_asvanna_v2.js
```
> **Pass criteria**: Output displays `7/7 Tests Passed (100%)`.

#### Checklist 3: Core Algorithm Suite
Verifies the Haversine geographic calculation formulas and risk thresholds:
```bash
node backend/test/test_all_endpoints.js
```
> **Pass criteria**: Output displays `4/4 Tests Passed (100%)`.

#### Checklist 4: Manual Local Run
Spin up both services and verify the new screen or feature in your browser:
```bash
# Terminal 1: Backend Server (Port 5000)
npm --prefix backend start

# Terminal 2: Frontend Dev Server (Port 3000)
npm --prefix frontend run dev
```
- Open `http://localhost:3000` in Google Chrome or Edge.
- Open DevTools Console (**F12**).
- Test the new feature manually.
- Confirm there are **no red console errors**.

### Step 3.3: Push Verified Changes to `develop`
Once all 4 checklist items pass:
```bash
# Push the verified develop branch to GitHub
git push origin develop
```

---

## 4. Release Workflow (Merging `develop` into `main`)

Once all group members' features are integrated, tested, and confirmed stable in `develop`:

```bash
# 1. Switch to main
git checkout main

# 2. Ensure main is up to date
git pull origin main

# 3. Merge verified develop branch into main
git merge develop

# 4. Push the stable release to GitHub
git push origin main
```

---

## 5. Summary Reference Card for Team Members

```bash
# Daily Routine for Team Members:
git checkout develop
git pull origin develop
git checkout <your-branch>
git merge develop                  # Stay updated with team code
# ... do work ...
git add .
git commit -m "feat: description"
git push origin <your-branch>      # Push only to your branch
# ... open PR on GitHub targeting 'develop' ...
```
