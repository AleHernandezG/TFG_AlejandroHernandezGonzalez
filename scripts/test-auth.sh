#!/usr/bin/env bash
# test-auth.sh — prueba los flujos de auth con el backend en :4000
# Uso: bash scripts/test-auth.sh

BASE="http://127.0.0.1:4000/api"
HEALTH="http://127.0.0.1:4000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${YELLOW}→  $1${NC}"; }

echo ""
echo "═══════════════════════════════════════"
echo "  Cookr — Auth API smoke test"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Health ───────────────────────────────
info "1/6  Health check"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH/api/health")
[ "$STATUS" = "200" ] && ok "GET /health → $STATUS" || fail "GET /health → $STATUS (¿backend encendido?)"

# ── 2. Registro ─────────────────────────────
CORREO_TEST="test_$(date +%s)@cookr.dev"
info "2/6  Registro ($CORREO_TEST)"
RES=$(curl -s -X POST "$BASE/auth/registro" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Test User\",\"correo\":\"$CORREO_TEST\",\"contrasena\":\"Test1234.\"}")
echo "$RES" | grep -q "mensaje" && ok "POST /auth/registro → 201" || fail "POST /auth/registro → $RES"

# ── 3. Registro duplicado → 409 ─────────────
info "3/6  Registro duplicado (debe dar 409)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/registro" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Test User\",\"correo\":\"$CORREO_TEST\",\"contrasena\":\"Test1234.\"}")
[ "$STATUS" = "409" ] && ok "POST /auth/registro duplicado → $STATUS" || fail "Esperaba 409, got $STATUS"

# ── 4. Login sin verificar → 403 ────────────
info "4/6  Login sin verificar (debe dar 403)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"$CORREO_TEST\",\"contrasena\":\"Test1234.\"}")
[ "$STATUS" = "403" ] && ok "POST /auth/login sin verificar → $STATUS" || fail "Esperaba 403, got $STATUS"

# ── 5. Login con seed user ───────────────────
info "5/6  Login con usuario seed (maria@cookr.dev)"
RES=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo":"maria@cookr.dev","contrasena":"Seed1234."}')
TOKEN=$(echo "$RES" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  ok "POST /auth/login → 200, token recibido"
else
  fail "POST /auth/login → no hay token. Respuesta: $RES"
fi

# ── 6. GET /me con token ─────────────────────
info "6/6  GET /usuarios/me con token"
if [ -n "$TOKEN" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/usuarios/me" \
    -H "Authorization: Bearer $TOKEN")
  [ "$STATUS" = "200" ] && ok "GET /usuarios/me → $STATUS" || fail "GET /usuarios/me → $STATUS"
else
  fail "Sin token, se omite esta prueba"
fi

echo ""
echo "═══════════════════════════════════════"
echo ""
