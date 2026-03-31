# Domain Changes — Cookr

Registro de cambios en el modelo de dominio y schemas de MongoDB. Formato: [DOM-XXX] por orden cronológico.

> **Regla de oro:** nunca editar una entrada completada. Si el modelo evoluciona, crear una nueva entrada.

---

## [DOM-001] MongoDB — Modelo Usuario
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Sprint: 2

Colección: `usuarios` | Índice único: `correo`

Campos:
- `_id` — ObjectId generado por MongoDB
- `nombre` — String, 2–50 caracteres, requerido
- `correo` — String, único, lowercase, requerido
- `contrasena` — String, bcrypt hash, opcional (null para Google OAuth)
- `foto` — String URL Cloudinary, opcional
- `rol` — enum `['usuario', 'admin']`, default `'usuario'`
- `cuentaVerificada` — Boolean, default `false`
- `proveedor` — enum `['local', 'google']`, requerido
- `googleId` — String, opcional (solo si proveedor = 'google')
- `alergias` — `[String]`, default `[]`
- `preferencias` — `[String]`, default `[]`
- `fechaRegistro` — Date, default `Date.now`

Archivo: `backend/src/models/Usuario.model.ts`

---

## [DOM-002] MongoDB — Modelo Token
Fecha:   2026-03-29 | Estado: ⏳ Pendiente | Sprint: 2

Colección: `tokens` | TTL index en campo `expira`

Campos:
- `_id` — ObjectId generado por MongoDB
- `userId` — ObjectId, ref `Usuario`, requerido
- `token` — String, único, requerido
- `tipo` — enum `['verificacion', 'recuperacion']`, requerido
- `expira` — Date, TTL index (MongoDB borra automáticamente al expirar)
- `usado` — Boolean, default `false`
- `creadoEn` — Date, default `Date.now`

Uso:
- `verificacion` → expira en 24h, generado al registrarse
- `recuperacion` → expira en 1h, generado al pedir recuperación de contraseña

Archivo: `backend/src/models/Token.model.ts`
