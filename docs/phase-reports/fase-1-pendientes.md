# Fase 1 — Tareas Pendientes para Retomar

# TFG · Red Social Gastronómica con IA

# Creado: 2026-03-20 | Actualizado: 2026-03-22 (sesión 3) | Estado: ⏳ En progreso

#

# Adjunta este fichero a Claude cuando quieras completar estas tareas.

# Contexto: "Quiero completar las tareas pendientes de la Fase 1"

# ─────────────────────────────────────────────────────────────────────

## [TFG-16] Login (/login)

Estado: ⏳ Pendiente — siguiente tarea del Sprint 1
Cuándo: Sprint 1 (Mar 16 → Mar 29)

Qué hay que hacer:

1. Crear `src/app/login/page.tsx` — Server Component con metadata (igual que registro/page.tsx)
   - Título: "Iniciar sesión — Cookr"
   - Fondo decorativo: mismo layout split-screen que /registro — misma imagen `fondo-auth.jpg`, mismo gradiente `from-stone-950 to-zinc-950` en el panel del formulario
2. Crear `src/features/auth/components/formularioLogin.tsx` — Client Component
   - Importar BotonGoogle (textoAccion="Iniciar sesión con Google", urlRetorno="/")
   - Importar DivisorOAuth — reutilización directa sin duplicar código
   - Solo 2 campos: correo + contraseña (sin nombre, sin confirmar contraseña)
   - esquemaLogin Zod: correo (email) + contrasena (min 1, sin regex fuertes — ya registrada)
   - Toggle mostrar/ocultar contraseña (igual que en registro)
   - Link "¿Olvidaste tu contraseña?" → pendiente implementar en Fase 4
   - Link "¿No tienes cuenta?" → /registro
   - Mock en submit (mismo patrón que formularioRegistro — TODO Fase 4: signIn credentials)
3. Añadir `FormularioLogin` al barrel export en `src/features/auth/components/index.ts`
4. Actualizar `docs/context.md` y `docs/folderStructure.md` al terminar
5. Crear phase report `docs/phase-reports/fase-1-sprint-1-login.md`
6. Crear documentación técnica `docs/login.html` (mismo estilo que registro.html)

Reutilización del feature auth:

- BotonGoogle: pasar textoAccion="Iniciar sesión con Google"
- DivisorOAuth: import directo sin cambios
- Tipos EstadoFormulario: reutilizar de autenticacion.ts
- NO duplicar BotonGoogle ni DivisorOAuth

Commit esperado:
feat(auth): implementar página de login /login con formulario Zod + Google OAuth

---

## [AUTH-001] Cambiar callbackUrl en BotonGoogle de "/" a "/feed"

Estado: ⏳ Pendiente — aplazado a Fase 2
Cuándo: Fase 2 — cuando exista la ruta /feed

Qué hay que hacer:
En `src/features/auth/components/botonGoogle.tsx`:

- Cambiar el valor por defecto del prop urlRetorno de "/" a "/feed"
- También cambiar la llamada en formularioRegistro.tsx y formularioLogin.tsx si pasan urlRetorno
  explícitamente (si usan el valor por defecto, basta con cambiar el componente)

Nota: la ruta /feed no existe hasta Fase 2. Si se cambia antes creará un 404 al autenticarse.

---

## [AUTH-002] Conectar formularioRegistro con backend

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/features/auth/components/formularioRegistro.tsx` (función alEnviar):

- Sustituir el mock (setTimeout + setEstadoEnvio("exito")) por:
  await axios.post("/api/usuarios/registro", datos)
- Manejar errores de red (409 correo ya existe, 422 validación backend, 500 error servidor)
- Mostrar mensaje de error específico en el banner rojo según el código de respuesta

---

## [AUTH-003] Añadir CredentialsProvider a NextAuth

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/lib/auth.ts`:

- Importar CredentialsProvider de "next-auth/providers/credentials"
- Añadir al array providers junto a GoogleProvider
- authorize() debe llamar al backend: POST /api/auth/login con email y password
- Devolver null si las credenciales son inválidas (NextAuth mostrará error de login)
- Devolver el objeto usuario si las credenciales son válidas

---

## [AUTH-004] Enriquecer callback session con datos del backend

Estado: ⏳ Pendiente — aplazado a Fase 4
Cuándo: Fase 4 — cuando el backend esté implementado

Qué hay que hacer:
En `src/lib/auth.ts` (callback session):

- Además del id (token.sub), añadir: avatar, nombre, rol
- Ampliar el tipo de session.user para incluir estos campos
- Estos datos vendrán del backend al autenticarse (tanto Google como Credentials)

---

## [UI-001] Imagen de fondo para páginas de autenticación (/registro y /login)

Estado: ✅ Parcialmente completado — /registro ✅ | /login ⏳ (pendiente TFG-16)
Cuándo: Sprint 1

Qué se hizo:
- Imagen colocada en `frontend/public/images/fondo-auth.jpg` (2843×4264 px, 3 MB)
- `src/app/registro/page.tsx` — layout split-screen definitivo:
  - Panel izquierdo (lg+): imagen con overlay `bg-black/30` + gradiente lateral `from-transparent to-stone-950`
  - Texto editorial centrado: h1 `font-black italic` (clamp 2.8–4.5rem) + líneas decorativas + subtítulo uppercase
  - Panel derecho: `bg-gradient-to-b from-stone-950 to-zinc-950`
  - next/image optimiza automáticamente (sirve WebP al tamaño exacto de cada pantalla)

Pendiente:
- Aplicar el mismo tratamiento a `src/app/login/page.tsx` al implementar TFG-16

Nota sobre el tamaño de la imagen:
  La imagen fuente de 3 MB no se sirve tal cual — next/image genera versiones optimizadas
  en WebP al tamaño exacto de cada dispositivo. No es necesario redimensionar.
  Si se quisiese aligerar el repo: tamaño ideal 1280×1920 px a ≤ 300 KB.

Commit esperado:
feat(auth): añadir imagen de fondo gastronómica a páginas registro y login

---

## [LANDING-001] Configuración Real del Carrusel de Imágenes

Estado: ⏳ Pendiente (funciona con fondo y emojis temporalmente)
Cuándo: Sprint 2 o cuando se integren assets reales (Fase 2 / Frontend UI)

Qué hay que hacer:

1. Sustituir los placeholders de colores/emojis (`gradient`, `emoji`) en `heroSlides` de `src/features/landing/data/landing-data.ts` por URLs de imágenes reales o conectarlo a una API / CDN.
2. Implementar un componente `Image` de `next/image` en `src/features/landing/components/hero-section.tsx` dentro del bucle del carrusel, con propiedades `fill`, `objectFit="cover"`, `priority` (para la primera imagen) para optimización SEO y LCP.
3. Asegurarse de que las transiciones de opacidad (fade) de Framer Motion o CSS sigan funcionando correctamente con las imágenes.
4. Revisar la accesibilidad (alt text) de las imágenes.

Commit esperado:
feat(landing): implementar imágenes reales en carrusel de hero section
