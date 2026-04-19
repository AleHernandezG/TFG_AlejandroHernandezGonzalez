#!/usr/bin/env bash
# Arranca FE (Next.js :3000) y BE (Express :4000) en paralelo.
# Uso: bash scripts/dev.sh
# Ctrl+C detiene ambos procesos.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

trap 'echo ""; echo "Parando FE + BE..."; kill 0' SIGINT SIGTERM

echo "╔══════════════════════════════════════╗"
echo "║   Cookr dev  ·  FE :3000  BE :4000  ║"
echo "╚══════════════════════════════════════╝"
echo ""

(cd "$ROOT/backend"  && npm run dev 2>&1 | sed $'s/^/\033[36m[BE]\033[0m /') &
(cd "$ROOT/frontend" && npm run dev 2>&1 | sed $'s/^/\033[35m[FE]\033[0m /') &

wait
