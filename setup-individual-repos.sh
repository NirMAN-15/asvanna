#!/usr/bin/env bash
# ==============================================================================
# ASVANNA - Script to initialize individual repositories (Optional)
# Use this script if you prefer 3 separate GitHub repositories over a monorepo.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌾 Setting up individual Git repositories for ASVANNA..."

# 1. Backend Repository
if [ -d "$PROJECT_ROOT/backend" ]; then
    echo "📦 Initializing backend git repo..."
    cd "$PROJECT_ROOT/backend"
    git init -b main
    git add .
    git commit -m "feat(backend): initial commit for ASVANNA Node.js REST API & Risk Engine" || true
fi

# 2. Frontend Web Admin Repository
if [ -d "$PROJECT_ROOT/frontend" ]; then
    echo "📦 Initializing frontend git repo..."
    cd "$PROJECT_ROOT/frontend"
    git init -b main
    git add .
    git commit -m "feat(frontend): initial commit for ASVANNA React Web Admin & Officer Dashboard" || true
fi

# 3. Mobile App Repository
if [ -d "$PROJECT_ROOT/mobile" ]; then
    echo "📦 Initializing mobile app git repo..."
    cd "$PROJECT_ROOT/mobile"
    git init -b main
    git add .
    git commit -m "feat(mobile): initial commit for ASVANNA Flutter Farmer & Buyer Mobile App" || true
fi

cd "$PROJECT_ROOT"
echo "✅ All individual repositories initialized successfully!"
