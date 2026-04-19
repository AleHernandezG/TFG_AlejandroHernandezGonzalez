#!/usr/bin/env bash
# Compila BE (tsc) y FE (next build) secuencialmente.
# Uso: bash scripts/build.sh
# Sale con código 1 si cualquiera de los dos falla.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "╔══════════════════════════════════╗"
echo "║   Cookr build  ·  BE → FE       ║"
echo "╚══════════════════════════════════╝"
echo ""

echo -e "\033[36m[BE]\033[0m tsc..."
(cd "$ROOT/backend"  && npm run build)

echo ""
echo -e "\033[35m[FE]\033[0m next build..."
(cd "$ROOT/frontend" && npm run build)

echo ""
echo -e "\033[32m✔ Build OK\033[0m"
