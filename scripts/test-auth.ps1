$BASE = "http://127.0.0.1:4000/api"

function ok($msg)   { Write-Host "✅ $msg" -ForegroundColor Green }
function fail($msg) { Write-Host "❌ $msg" -ForegroundColor Red }
function info($msg) { Write-Host "→  $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "═══════════════════════════════════════"
Write-Host "  Cookr — Auth API smoke test"
Write-Host "═══════════════════════════════════════"
Write-Host ""

# 1. Health
info "1/6  Health check"
try {
    $r = Invoke-WebRequest "$BASE/health" -UseBasicParsing -TimeoutSec 5
    ok "GET /api/health → $($r.StatusCode)"
} catch { fail "GET /api/health → sin respuesta (¿backend encendido en :4000?)" ; exit 1 }

# 2. Registro nuevo
$correo = "test_$(Get-Date -UFormat %s)@cookr.dev"
info "2/6  Registro ($correo)"
try {
    $body = @{ nombre="Test User"; correo=$correo; contrasena="Test1234." } | ConvertTo-Json
    $r = Invoke-WebRequest "$BASE/auth/registro" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    ok "POST /auth/registro → $($r.StatusCode)"
} catch { fail "POST /auth/registro → $($_.Exception.Response.StatusCode.value__)" }

# 3. Registro duplicado → 409
info "3/6  Registro duplicado (debe dar 409)"
try {
    $body = @{ nombre="Test User"; correo=$correo; contrasena="Test1234." } | ConvertTo-Json
    Invoke-WebRequest "$BASE/auth/registro" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Out-Null
    fail "Esperaba 409 pero respondió 2xx"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 409) { ok "POST /auth/registro duplicado → 409" }
    else { fail "Esperaba 409, got $code" }
}

# 4. Login sin verificar → 403
info "4/6  Login sin verificar (debe dar 403)"
try {
    $body = @{ correo=$correo; contrasena="Test1234." } | ConvertTo-Json
    Invoke-WebRequest "$BASE/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing | Out-Null
    fail "Esperaba 403 pero respondió 2xx"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 403) { ok "POST /auth/login sin verificar → 403" }
    else { fail "Esperaba 403, got $code" }
}

# 5. Login con seed user
info "5/6  Login con usuario seed (maria@cookr.dev)"
$TOKEN = $null
try {
    $body = @{ correo="maria@cookr.dev"; contrasena="Seed1234." } | ConvertTo-Json
    $r = Invoke-WebRequest "$BASE/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $json = $r.Content | ConvertFrom-Json
    $TOKEN = $json.token
    if ($TOKEN) { ok "POST /auth/login → 200, token recibido" }
    else { fail "POST /auth/login → sin token en respuesta" }
} catch { fail "POST /auth/login → $($_.Exception.Response.StatusCode.value__) (¿seed cargado?)" }

# 6. GET /usuarios/me
info "6/6  GET /usuarios/me con token"
if ($TOKEN) {
    try {
        $r = Invoke-WebRequest "$BASE/usuarios/me" -Headers @{ Authorization="Bearer $TOKEN" } -UseBasicParsing
        ok "GET /usuarios/me → $($r.StatusCode)"
    } catch { fail "GET /usuarios/me → $($_.Exception.Response.StatusCode.value__)" }
} else { fail "Sin token, se omite" }

Write-Host ""
Write-Host "═══════════════════════════════════════"
Write-Host ""
