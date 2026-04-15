/**
 * test-auth.mjs — Prueba manual de los endpoints de auth del backend
 *
 * Uso: node test-auth.mjs
 * Requisito: el backend debe estar corriendo en http://localhost:4000
 */

const BASE = "http://localhost:4000/api/auth";

// Email único por ejecución para no colisionar con registros anteriores
const EMAIL_TEST = `test_${Date.now()}@cookr-test.com`;
const PASSWORD = "Test1234";

let passed = 0;
let failed = 0;

// ─── Utilidades ───────────────────────────────────────────────────────────────

function ok(label) {
  console.log(`  ✅  ${label}`);
  passed++;
}

function fail(label, detail) {
  console.log(`  ❌  ${label}`);
  if (detail) console.log(`       → ${detail}`);
  failed++;
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testRegistro() {
  console.log("\n📋  POST /registro");

  // 1. Registro exitoso
  const { status, data } = await post("/registro", {
    nombre: "Usuario Test",
    correo: EMAIL_TEST,
    contrasena: PASSWORD,
  });
  if (status === 201 && data.mensaje) {
    ok(`Registro nuevo usuario → 201 (${data.mensaje})`);
  } else {
    fail(`Registro nuevo usuario → esperaba 201, recibí ${status}`, JSON.stringify(data));
  }

  // 2. Correo duplicado
  const dup = await post("/registro", {
    nombre: "Duplicado",
    correo: EMAIL_TEST,
    contrasena: PASSWORD,
  });
  if (dup.status === 409) {
    ok(`Correo duplicado → 409`);
  } else {
    fail(`Correo duplicado → esperaba 409, recibí ${dup.status}`, JSON.stringify(dup.data));
  }

  // 3. Datos inválidos (sin contraseña)
  const inv = await post("/registro", { nombre: "X", correo: "malformado" });
  if (inv.status === 400) {
    ok(`Datos inválidos → 400`);
  } else {
    fail(`Datos inválidos → esperaba 400, recibí ${inv.status}`, JSON.stringify(inv.data));
  }
}

async function testLogin() {
  console.log("\n📋  POST /login");

  // 4. Login sin verificar correo → 403
  const unverified = await post("/login", { correo: EMAIL_TEST, contrasena: PASSWORD });
  if (unverified.status === 403) {
    ok(`Login sin verificar → 403 (${unverified.data.error ?? ""})`);
  } else {
    fail(`Login sin verificar → esperaba 403, recibí ${unverified.status}`, JSON.stringify(unverified.data));
  }

  // 5. Credenciales incorrectas → 401
  const wrong = await post("/login", { correo: EMAIL_TEST, contrasena: "wrongpass" });
  if (wrong.status === 401 || wrong.status === 403) {
    ok(`Credenciales incorrectas → ${wrong.status}`);
  } else {
    fail(`Credenciales incorrectas → esperaba 401/403, recibí ${wrong.status}`, JSON.stringify(wrong.data));
  }

  // 6. Usuario inexistente → 401
  const ghost = await post("/login", { correo: "noexiste@cookr.com", contrasena: PASSWORD });
  if (ghost.status === 401) {
    ok(`Usuario inexistente → 401`);
  } else {
    fail(`Usuario inexistente → esperaba 401, recibí ${ghost.status}`, JSON.stringify(ghost.data));
  }
}

async function testRecuperarContrasena() {
  console.log("\n📋  POST /recuperar-contrasena");

  // 7. Email existente → 200 (nunca revela si existe o no)
  const r1 = await post("/recuperar-contrasena", { correo: EMAIL_TEST });
  if (r1.status === 200) {
    ok(`Email existente → 200`);
  } else {
    fail(`Email existente → esperaba 200, recibí ${r1.status}`, JSON.stringify(r1.data));
  }

  // 8. Email inexistente → también 200 (seguridad: no revelar)
  const r2 = await post("/recuperar-contrasena", { correo: "fantasma@cookr.com" });
  if (r2.status === 200) {
    ok(`Email inexistente → 200 (sin revelar existencia)`);
  } else {
    fail(`Email inexistente → esperaba 200, recibí ${r2.status}`, JSON.stringify(r2.data));
  }
}

async function testNuevaContrasena() {
  console.log("\n📋  POST /nueva-contrasena");

  // 9. Token inválido → 400
  const r = await post("/nueva-contrasena", {
    token: "token-invalido-xxx",
    contrasena: "Nueva1234",
  });
  if (r.status === 400) {
    ok(`Token inválido → 400`);
  } else {
    fail(`Token inválido → esperaba 400, recibí ${r.status}`, JSON.stringify(r.data));
  }
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Cookr — Test Auth Endpoints");
  console.log(`  Backend: ${BASE}`);
  console.log(`  Email de prueba: ${EMAIL_TEST}`);
  console.log("═══════════════════════════════════════════════");

  // Comprobar que el backend está arriba
  try {
    await fetch("http://localhost:4000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  } catch {
    console.error("\n❌  No se puede conectar con el backend en http://localhost:4000");
    console.error("   Asegúrate de que está corriendo con: npm run dev\n");
    process.exit(1);
  }

  await testRegistro();
  await testLogin();
  await testRecuperarContrasena();
  await testNuevaContrasena();

  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Resultado: ${passed} pasados, ${failed} fallidos`);
  console.log("═══════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
