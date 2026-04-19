#!/usr/bin/env bash
# keep-alive.sh — Mantiene el backend de Render activo antes de demos.
#
# Uso normal:
#   bash scripts/keep-alive.sh
#
# Con URL personalizada (cuando ya esté creado el servicio en Render):
#   RENDER_APP_URL=https://cookr-api.onrender.com bash scripts/keep-alive.sh
#
# ⚠️  ACTIVACIÓN 100% MANUAL.
#     Nunca llamar desde CI/CD ni desde ningún workflow de GitHub Actions.

# ─── Configuración ────────────────────────────────────────────────────────────

# Edita esta línea cuando crees el servicio en Render:
DEFAULT_URL="https://{nombre-servicio}.onrender.com"

RENDER_APP_URL="${RENDER_APP_URL:-$DEFAULT_URL}"
HEALTH_URL="${RENDER_APP_URL}/api/health"
INTERVAL=240      # segundos entre pings (4 minutos)
MAX_DURATION=7200 # duración máxima en segundos (2 horas)

# ─── Calcular hora de expiración ──────────────────────────────────────────────

START=$(date +%s)
EXPIRA=$(date -d "+${MAX_DURATION} seconds" "+%H:%M:%S" 2>/dev/null \
      || date -v +${MAX_DURATION}S          "+%H:%M:%S" 2>/dev/null \
      || echo "en 2 horas")

# ─── Banner de inicio ─────────────────────────────────────────────────────────

echo "╔══════════════════════════════════════════════════╗"
echo "║   Cookr keep-alive — Render free tier            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  URL      : $HEALTH_URL"
echo "  Intervalo : cada $((INTERVAL / 60)) minutos"
echo "  Expira    : $EXPIRA  (máximo 2 h por ejecución)"
echo "  Ctrl+C    : detiene el script antes de tiempo"
echo ""

# ─── Trap para detención manual ───────────────────────────────────────────────

trap 'echo ""; echo "$(date "+%H:%M:%S")  Keep-alive detenido manualmente."; exit 0' SIGINT SIGTERM

# ─── Bucle principal ──────────────────────────────────────────────────────────

while true; do

  # Comprobar si se han alcanzado las 2 horas
  ELAPSED=$(( $(date +%s) - START ))
  if [ "$ELAPSED" -ge "$MAX_DURATION" ]; then
    echo "$(date "+%H:%M:%S")  ⏰ 2 horas alcanzadas — keep-alive detenido automáticamente."
    echo "   Vuelve a ejecutar el script si necesitas más tiempo."
    exit 0
  fi

  # Hacer ping al health check
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$HEALTH_URL" 2>/dev/null)

  if [ "$STATUS" = "200" ]; then
    echo "$(date "+%H:%M:%S")  ✔  $STATUS — backend activo"
  elif [ -z "$STATUS" ]; then
    echo "$(date "+%H:%M:%S")  ⚠  Sin respuesta (timeout o sin conexión) — el bucle continúa"
  else
    echo "$(date "+%H:%M:%S")  ⚠  $STATUS — respuesta inesperada — el bucle continúa"
  fi

  sleep "$INTERVAL"
done
