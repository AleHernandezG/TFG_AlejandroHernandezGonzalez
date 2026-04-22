# Plan: EMAIL-001 — Integración Nodemailer + Gmail SMTP + eliminación rutas dev

---

## Contexto para Claude al retomar este plan

**Leer obligatoriamente antes de implementar:**

- `docs/context.md` — estado actual del proyecto, rutas, historial de sesiones
- `docs/infraestructura.md` — stack, servicios externos, variables de entorno
- `docs/rules.md` — arquitectura de capas, nomenclatura, colores, reglas de diseño
- `docs/folderStructure.md` — árbol de carpetas FE y BE actualizado
- `docs/desarrollo/estadoTareas.html` — estado de todas las tareas por sprint
- `docs/roadmap.md` — planificación, sprints, épicas

**Archivos clave ya leídos en la sesión anterior:**

- `backend/src/services/authService.ts` — los dos `TODO [Fase 6]` a sustituir (líneas 45 y 152)
- `backend/src/routes/dev.routes.ts` — ruta temporal a eliminar
- `backend/src/app.ts` — condicional dev a eliminar
- `backend/.env.example` — añadir `GMAIL_USER` y `GMAIL_APP_PASSWORD`
- `backend/src/routes/auth.routes.ts` — sin cambios necesarios

---

## Objetivo

Conectar los dos `TODO [Fase 6]` del backend con Nodemailer + Gmail SMTP para enviar:

- Email de verificación de cuenta al registrarse (usuarios locales)
- Email de recuperación de contraseña al solicitarla

Eliminar todo el código temporal de desarrollo (`dev.routes.ts`, condicional en `app.ts`).

---

## Estado previo relevante

- `authService.registrarse()` — crea el token en MongoDB (`tipo: "verificacion"`) pero no lo envía. **Token es una cadena hex aleatoria** (no JWT), 24h de validez.
- `authService.solicitarRecuperacion()` — crea el token en MongoDB (`tipo: "recuperacion"`) pero no lo envía. 1h de validez.
- `backend/src/routes/dev.routes.ts` — ruta `POST /api/dev/verificar-usuario` solo para desarrollo. Monta en `app.ts` condicionalmente si `NODE_ENV === "development"`.
- `GMAIL_USER` y `GMAIL_APP_PASSWORD` se añadirán en `.env.example`
- `FRONTEND_URL` ya existe en el entorno (`http://localhost:3000` en dev, URL Vercel en prod)
- El flujo funcionará sin dominio propio gracias a Gmail SMTP.

---

## Archivos a modificar / crear / eliminar

| Acción           | Archivo                                                  |
| ---------------- | -------------------------------------------------------- |
| Instalar         | `npm install nodemailer @types/nodemailer` en `/backend` |
| Crear            | `backend/src/lib/email.ts`                               |
| Modificar        | `backend/src/services/authService.ts`                    |
| Modificar        | `backend/src/app.ts`                                     |
| Eliminar         | `backend/src/routes/dev.routes.ts`                       |
| Modificar        | `backend/.env.example`                                   |
| Crear (al final) | `docs/desarrollo/fe/gmail-email-integracion.html`        |

---

## Paso 1 — Instalar Nodemailer

```bash
cd backend
npm install nodemailer @types/nodemailer
```

Verificar que aparece en `backend/package.json` bajo `dependencies` y `devDependencies`.

---

## Paso 2 — Crear `backend/src/lib/email.ts`

Ubicación: `backend/src/lib/` (junto a `db.ts`, `jwt.ts`, `validadores.ts`). Sigue el patrón de la carpeta `lib/` del backend.

```ts
import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM = GMAIL_USER ?? "tucuenta@gmail.com";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function enviarEmailVerificacion(
  correo: string,
  nombre: string,
  token: string,
): Promise<void> {
  const enlace = `${FRONTEND_URL}/verificar-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: correo,
    subject: "Verifica tu cuenta en Cookr",
    html: plantillaVerificacion(nombre, enlace),
  });
}

export async function enviarEmailRecuperacion(
  correo: string,
  nombre: string,
  token: string,
): Promise<void> {
  const enlace = `${FRONTEND_URL}/nueva-contrasena?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: correo,
    subject: "Restablece tu contraseña en Cookr",
    html: plantillaRecuperacion(nombre, enlace),
  });
}
```

### Plantillas HTML

Plantilla con inline CSS (requisito de clientes de email — Gmail, Outlook, Apple Mail no soportan `<style>` externo):

- Fondo contenedor `#f4f4f4`, card blanca centrada `max-width: 560px`
- Header con fondo oscuro `#1a1208` (similar al `--auth-dark` de la app) y logo "🍳 Cookr" en blanco
- Botón CTA con color brand aproximado `#c47c1a` (oklch de la app no funciona en email)
- Texto alternativo del enlace en monospace por si el botón falla
- Footer con aviso "Si no creaste esta cuenta, ignora este email"

### Política de errores de envío

Si Gmail SMTP falla, **se loguea el error pero no se hace throw** — el usuario ya está creado en DB y el token existe en MongoDB. Puede usar "Reenviar verificación" desde la UI.

```ts
// En authService.ts:
try {
  await enviarEmailVerificacion(...)
} catch (err) {
  console.error('[email] Error al enviar verificación:', err)
  // No relanza — el usuario puede reenviar desde /verificar-email/pendiente
}
```

---

## Paso 3 — Actualizar `backend/src/services/authService.ts`

### En `registrarse()` — reemplazar el TODO (línea ~45)

```ts
// ANTES:
// TODO [Fase 6]: enviar email con Gmail SMTP usando tokenValor
return {
  mensaje: "Registro completado. Revisa tu correo para verificar la cuenta.",
};

// DESPUÉS:
try {
  await enviarEmailVerificacion(datos.correo, datos.nombre, tokenValor);
} catch (err) {
  console.error("[email] Error al enviar verificación:", err);
}
return {
  mensaje: "Registro completado. Revisa tu correo para verificar la cuenta.",
};
```

### En `solicitarRecuperacion()` — reemplazar el TODO (línea ~152)

```ts
// ANTES:
// TODO [Fase 6]: enviar email con Gmail SMTP usando tokenValor
return respuesta;

// DESPUÉS:
try {
  await enviarEmailRecuperacion(correo, usuario.nombre, tokenValor);
} catch (err) {
  console.error("[email] Error al enviar recuperación:", err);
}
return respuesta;
```

**Añadir el import** al inicio del archivo:

```ts
import { enviarEmailVerificacion, enviarEmailRecuperacion } from "../lib/email";
```

---

## Paso 4 — Actualizar `backend/src/app.ts`

Eliminar estas líneas (están juntas, son fáciles de localizar por los comentarios ⚠️):

```ts
// ⚠️ TEMPORAL [dev] — eliminar en Fase 6 cuando el email esté integrado
import devRoutes from "./routes/dev.routes";
```

```ts
// ⚠️ TEMPORAL [dev] — solo disponible en desarrollo, nunca en producción
// TODO [Fase 6]: eliminar estas dos líneas y el archivo dev.routes.ts
if (process.env.NODE_ENV === "development") {
  app.use("/api/dev", devRoutes);
}
```

---

## Paso 5 — Eliminar `dev.routes.ts`

Borrar el archivo `backend/src/routes/dev.routes.ts`.

---

## Paso 6 — Actualizar `backend/.env.example`

Sustituir la sección de servicios externos por:

```env
# ─── Email (Gmail SMTP) ──────────────────────────────────────
# 1. Activar verificación en 2 pasos en tu cuenta Gmail
# 2. Seguridad → Contraseñas de aplicación → crear una para "Correo"
# 3. Copiar la contraseña de aplicación de 16 caracteres
# Dev y prod: funciona sin dominio propio
GMAIL_USER=tucuenta@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## Paso 7 — Documentación HTML

Al terminar todos los pasos anteriores y verificar que funciona, crear:
**`docs/desarrollo/fe/gmail-email-integracion.html`**

Con las siguientes secciones:

1. Qué se ha hecho (resumen de cambios)
2. Flujo completo email de verificación (registro → token → email → clic enlace → verificado)
3. Flujo completo email de recuperación (solicitud → token → email → clic enlace → nueva contraseña)
4. Archivos modificados / creados / eliminados (tabla)
5. Variables de entorno necesarias (tabla dev vs prod)
6. Cómo configurar Gmail SMTP (paso a paso)
7. Límites de Gmail y consideraciones para producción
8. Limitaciones conocidas (solo envío con cuenta Gmail, endpoint reenviar pendiente)

---

## Variables de entorno necesarias (resumen)

| Variable             | Dev                                       | Prod                            |
| -------------------- | ----------------------------------------- | ------------------------------- |
| `GMAIL_USER`         | Tu cuenta Gmail                           | La misma cuenta o una dedicada  |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de 16 caracteres | La misma contraseña o una nueva |
| `FRONTEND_URL`       | `http://localhost:3000`                   | URL de Vercel del TFG           |

---

## Configuración de Gmail SMTP — paso a paso

### Dev y producción — funciona sin dominio

1. Abrir tu cuenta de Gmail.
2. Ir a **Seguridad** y activar **Verificación en 2 pasos** si no está activa.
3. Entrar en **Contraseñas de aplicación** y crear una para "Correo".
4. Copiar la contraseña de 16 caracteres.
5. Pegar en `backend/.env` como `GMAIL_USER=tucuenta@gmail.com` y `GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx`.
6. Reiniciar el backend.

### Límite y alcance

Gmail permite un límite aproximado de 500 emails/día por cuenta. Para un TFG es suficiente en la práctica.

Para mejorar la entregabilidad en producción real, conviene usar una cuenta dedicada de Gmail solo para el proyecto.

---

## Verificación del plan completo

1. `npm run dev` en `/backend` → sin errores de TypeScript
2. Registrar usuario nuevo con tu correo Gmail → llega email de verificación con enlace
3. Click en el enlace → `/verificar-email?token=xxx` → pantalla de éxito
4. Login con ese usuario → funciona (está verificado)
5. Solicitar recuperación de contraseña → llega email de recuperación
6. Click en el enlace → `/nueva-contrasena?token=xxx` → cambiar contraseña → pantalla éxito
7. Verificar que `POST /api/dev/verificar-usuario` ya no existe → responde 404
8. `npm run build` en `/backend` → sin errores TypeScript

---

## Notas técnicas

- Nodemailer usa `transporter.sendMail()`.
- Gmail requiere contraseña de aplicación; no sirve la contraseña normal de la cuenta.
- Los tokens expiran por TTL index en MongoDB — no hay limpieza manual necesaria
- La ruta `POST /api/auth/verificar-email/reenviar` **no existe todavía** — las páginas `/verificar-email/pendiente` y `/recuperar-contrasena/pendiente` muestran un botón de reenvío pero no hay endpoint de backend. Si se quiere implementar: buscar usuario por correo, invalidar token viejo, crear token nuevo, enviar email. Queda pendiente como tarea futura.
- Seguir el patrón de capas de `rules.md`: el envío de email es lógica de negocio → va en `authService.ts` llamando a `lib/email.ts`. Nunca llamar a Gmail SMTP desde un controller directamente.
