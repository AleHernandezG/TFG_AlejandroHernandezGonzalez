#!/usr/bin/env bash
# Arranca FE (Next.js :3000) y BE (Express :4000) en paralelo.
# Uso: bash scripts/dev.sh
# Ctrl+C detiene ambos procesos y libera los puertos.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

free_port() {
  local port=$1
  local attempts=0
  while true; do
    local pids
    # Obtiene TODOS los PIDs que escuchan en ese puerto (puede haber varios)
    pids=$(powershell.exe -NoProfile -Command "
      Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Where-Object { \$_.State -eq 'Listen' -or \$_.State -eq 'Established' } |
        Select-Object -ExpandProperty OwningProcess -Unique
    " 2>/dev/null | tr -d '\r' | tr '\n' ' ' | xargs)

    [[ -z "$pids" ]] && break

    for pid in $pids; do
      [[ "$pid" =~ ^[0-9]+$ ]] && taskkill //F //PID "$pid" &>/dev/null && echo "  Puerto $port — PID $pid terminado"
    done

    sleep 0.4
    (( attempts++ ))
    if (( attempts >= 8 )); then
      echo "  ⚠ Puerto $port sigue ocupado tras $attempts intentos"
      break
    fi
  done
  echo "  ✓ Puerto $port libre"
}

trap 'echo ""; echo "Parando FE + BE..."; kill 0' SIGINT SIGTERM

echo "╔══════════════════════════════════════╗"
echo "║   Cookr dev  ·  FE :3000  BE :4000  ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "Cerrando procesos Node anteriores..."
taskkill //F //IM node.exe &>/dev/null && echo "  ✓ Procesos Node terminados" || echo "  (no había procesos Node activos)"
sleep 1
echo ""

(cd "$ROOT/backend"  && npm run dev 2>&1 | sed $'s/^/\033[36m[BE]\033[0m /') &
(cd "$ROOT/frontend" && npm run dev 2>&1 | sed $'s/^/\033[35m[FE]\033[0m /') &

wait
