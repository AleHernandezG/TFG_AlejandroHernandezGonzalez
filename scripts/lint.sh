#!/usr/bin/env bash
# Ejecuta lint en BE (tsc --noEmit) y FE (next lint) secuencialmente.
# Uso: bash scripts/lint.sh
# Sale con código 1 si cualquiera de los dos falla.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "╔══════════════════════════════════╗"
echo "║   Cookr lint  ·  BE → FE        ║"
echo "╚══════════════════════════════════╝"
echo ""

echo -e "\033[36m[BE]\033[0m tsc --noEmit..."
(cd "$ROOT/backend"  && npm run lint)

echo ""
echo -e "\033[35m[FE]\033[0m next lint..."
(cd "$ROOT/frontend" && npm run lint)

echo ""
echo -e "\033[32m✔ Lint OK\033[0m"
