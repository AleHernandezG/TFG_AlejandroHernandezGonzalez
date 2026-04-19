# Contexto de Sesión — TFG

**Fecha:** 2026-04-17
**Sprint Actual:** Sprint 3 — activo
**Modelo:** FE nuevas vistas mock + BE sprint anterior real + BD necesaria
**Fase:** Fase 2 de 7 — Recetas (FE mock) + Autenticación (BE real)

> Reglas de desarrollo, arquitectura, colores, nomenclatura y diseño → `docs/rules.md`

---

## Estado Actual

- ✅ Fase 0 completada: repo, estructura, Next.js 14, shadcn/ui, dependencias, Prettier, Linear
- ✅ Stack instalado: TanStack Query, Zustand, Axios, Framer Motion, Lucide, next-pwa, NextAuth, Zod, React Hook Form
- ✅ shadcn/ui componentes: button, card, avatar, badge, tabs, sheet, dialog, drawer, skeleton, form, input, label, separator
- ✅ Landing Page (TFG-14) implementada, refinada y documentada con enfoque mobile-first y datos mock
- ✅ Footer global (`PiePagina`) creado con tech stack, links útiles, disclaimer de IA y cita
- ✅ Refactoring a español: todos los componentes de features renombrados a camelCase español
- ✅ Página de Registro (TFG-15) implementada: /registro con formulario Zod + Google OAuth
- ✅ NextAuth configurado: opcionesAuth + route handler /api/auth/[...nextauth]
- ✅ Documentación técnica de registro creada: docs/registro.html (10 secciones)
- ✅ Lint y build limpios: fixes en tarjetaTestimonio.tsx y formularioRegistro.tsx (Framer Motion v12)
- ✅ [UI-001] Layout split-screen en /registro con imagen gastronómica, texto editorial y gradiente de fusión lateral
- ✅ Rebrand completo a **Cookr**: nombre oficial de la app actualizado en todo el frontend
- ✅ Registro con correo/contraseña funcional: validación Zod con mensajes personalizados
- ✅ Registro con Google OAuth funcional: NextAuth + GoogleProvider operativo en local
- ✅ [UI-002] Paleta de colores Cookr completa: oklch + CSS vars + Tailwind tokens, 0 colores hardcodeados
- ✅ [UI-003] Páginas legales: /privacidad (10 secciones, RGPD) y /terminos (11 secciones) creadas
- ✅ [UI-004] Tipografía creativa en SeccionHero: badge pre-titular + italic brand + wavy underline SVG + gradient text
- ✅ [UI-005] Flujo de verificación de email: /verificar-email/pendiente + /verificar-email (mock, Fase 6 para Resend real)
- ✅ [UI-006] Login (/login) — TFG-16: layout split-screen espejado (form izquierda, imagen derecha), FormularioLogin con RHF + Zod, enlace "¿Olvidaste tu contraseña?", reutiliza BotonGoogle y DivisorOAuth
- ✅ [UI-007] Flujo recuperación de contraseña (3 vistas mock):
  - /recuperar-contrasena: layout igual que /login, solo campo email
  - /recuperar-contrasena/pendiente: pantalla "revisa tu correo" con cooldown reenvío 60s
  - /nueva-contrasena: layout como /registro (imagen izq, form der), 2 campos contraseña + confirmar + pantalla éxito in-page
- ✅ Aprobado autor — [TFG-17] NavBar inferior: 5 iconos, icono central ChefHat con bg-brand, pill indicator con layoutId Framer Motion, safe area insets, oculta en / y lg+
- ✅ Aprobado autor — [TFG-21 / UI-014 / UI-015] Home (mobile + PC) y Detalle de Receta. Cambios adicionales aprobados: click en tarjeta navega a /recetas/[id], multi-select en chips de filtros, icono ajustes eliminado del header PC. Fixes: hydration error en tiempos relativos (UI-016). Pendiente: chips completos de alérgenos/dietas/dificultad (HOME-001).
- ✅ [AUTH-FE-BE] Capa de servicios FE creada: `apiClient.ts` + `authService.ts` en `frontend/src/services/`
- ✅ [AUTH-FE-BE] `lib/auth.ts` actualizado: CredentialsProvider real conectado a `POST /api/auth/login`
- ✅ [AUTH-FE-BE] `formularioRegistro.tsx` conectado a `POST /api/auth/registro` (maneja 409)
- ✅ [AUTH-FE-BE] `formularioLogin.tsx` conectado a NextAuth CredentialsProvider (maneja 401/403)
- ✅ [AUTH-FE-BE] `formularioRecuperarContrasena.tsx` conectado a `POST /api/auth/recuperar-contrasena`
- ✅ [AUTH-FE-BE] `formularioNuevaContrasena.tsx` conectado a `POST /api/auth/nueva-contrasena`
- ✅ [AUTH-FE-BE] `NEXT_PUBLIC_API_URL` añadido a `.env.local`
- ✅ [ARCH-001] BE: interfaces de dominio separadas de schemas Mongoose — nueva carpeta `backend/src/types/` con `IUsuario` e `IToken` como interfaces puras
- ✅ [ARCH-002] BE: modelos renombrados con nomenclatura BD-explícita — `usuarioMongo.ts`, `tokenMongo.ts`

## Avance de la sesión actual (tipografía hero — SeccionHero)

### [UI-004] Tipografía creativa en `SeccionHero`

Fichero modificado: `frontend/src/features/landing/components/seccionHero.tsx`

Patrones aplicados, inspirados en Linear, Framer, Notion, Spotify:

**Badge pre-titular** (patrón Linear / Vercel):
- Píldora animada con `🍳 La comunidad gastronómica`
- Estilos: `border-brand/30 bg-[var(--brand-subtle)] text-brand` → 100% paleta Cookr
- Entra con el mismo `variants={elemento}` del stagger, antes del h1

**H1 — tres tratamientos tipográficos:**
- `cocinando` → `font-black italic text-brand` (énfasis en la acción principal, estilo Spotify/Bon Appétit)
- `recetas` → subrayado wavy SVG en `var(--brand)` con `preserveAspectRatio="none"` para adaptarse a cualquier tamaño de fuente (patrón Notion / Framer / Arc)
- `Cookr` → gradiente `from-brand to-brand-muted` con `bg-clip-text text-transparent` (patrón Linear / Stripe)

**Subtítulo:**
- `comparte tus recetas` → `font-semibold text-foreground/80` (rompe la monotonía del texto muted)

Todos los estilos usan exclusivamente la paleta Cookr (0 colores hardcodeados).

## Avance de la sesión anterior (paleta Cookr + páginas legales)

### [UI-002] Refactorización completa de paleta de colores

**Paso 1 — Primera pasada (colores Tailwind genéricos → vars existentes):**
- `datosLanding.ts` — slide 1: `from-amber-300/50...` → `from-[var(--hero-gradient-start)] via-[var(--hero-gradient-mid)] to-[var(--hero-gradient-end)]`
- `bentoCaracteristicas.tsx` — icono chef: `from-amber-400/20 to-orange-300/10 text-amber-600` → `from-brand/20 to-brand-muted/10 text-brand`
- Resto de colores sin equivalente: comentados con `// sin equivalente en paleta Cookr`

**Paso 2 — Segunda pasada (nuevas variables CSS + sustitución completa):**

Nuevas variables añadidas a `globals.css` (`:root` y `.dark`):
```
--category-social  → azul para elementos de comunidad/social
--category-ai      → violeta para elementos de IA
--theme-fresh      → verde para carrusel ensaladas
--theme-sweet      → rosa para carrusel postres
--theme-pasta      → violeta para carrusel pastas
--auth-dark        → negro cálido para panel de autenticación
```

Ficheros refactorizados:
- `tarjetaTestimonio.tsx` — `fill-rose-500 text-rose-500` → `fill-destructive text-destructive`
- `formularioRegistro.tsx` — `text-emerald-500` → `text-[var(--chart-3)]`
- `bentoCaracteristicas.tsx` — iconos social/ia → `bg-[oklch(0.92_0.04_240)] text-[var(--category-social)]` / `bg-[oklch(0.92_0.04_290)] text-[var(--category-ai)]`
- `datosLanding.ts` — slides 2/3/4 → `from-[var(--theme-fresh)]/45...` / `--theme-sweet` / `--theme-pasta`
- `registro/page.tsx` — `to-stone-950` → `to-[var(--auth-dark)]`; `from-stone-950 to-zinc-950` → `bg-[var(--auth-dark)]`

Excepciones permitidas (documentadas):
- `bg-black/30` en `registro/page.tsx` — overlay funcional semitransparente sobre foto
- Google SVG fills en `botonGoogle.tsx` — colores corporativos obligatorios de Google

### Fix footer — `piePagina.tsx`
- Barra inferior centrada en desktop: `justify-between md:flex-row md:text-left` → `justify-center` (había un solo elemento, `justify-between` lo pegaba a la izquierda)

### [UI-003] Páginas legales creadas

`src/app/privacidad/page.tsx` — Política de privacidad (10 secciones):
- Responsable del tratamiento (aviso académico TFG)
- Datos recogidos: email, avatar, recetas, despensa, historial chat IA, Google OAuth
- Tabla de finalidades con base legal (RGPD)
- Servicios de terceros: Google OAuth, Gemini, Edamam, Cloudinary, Resend, MongoDB Atlas, Vercel
- Retención: 30 días tras baja, 90 días mensajes IA inactivos
- Derechos RGPD: acceso, rectificación, supresión, portabilidad, oposición, limitación
- Seguridad: bcrypt, HTTPS, JWT, rate limiting, Atlas cifrado
- Menores: mínimo 14 años

`src/app/terminos/page.tsx` — Términos de uso (11 secciones):
- Descripción completa del servicio (recetas, despensa, Gemini IA, Edamam, grupos, Modo Manos Libres, PWA)
- Cuenta: email/contraseña o Google OAuth
- Contenido del usuario: licencia no exclusiva, prohibiciones
- Tabla uso aceptable: ✅ permitido / 🚫 prohibido
- Sección IA: aviso legal obligatorio (respuestas orientativas, no consejo médico)
- Limitación de responsabilidad

Diseño de ambas páginas:
- Cabecera sticky con logo Cookr + botón "Volver al inicio"
- Índice navegable con anclas `#id`
- 100% paleta Cookr (sin colores hardcodeados)
- Mobile-first, mismo sistema de diseño que el resto del frontend

## Avance de la sesión anterior (rebrand Cookr + fixes auth)

- ✅ **Rebrand a Cookr** — nombre cambiado de "Gastronómica" a "Cookr" en:
  - `src/app/layout.tsx` — metadata `title` y `description`
  - `src/app/registro/page.tsx` — metadata title + h1 editorial
  - `src/features/landing/components/bentoTestimonios.tsx` — tagline de la sección
  - `src/components/common/piePagina.tsx` — marca y copyright (2 ocurrencias)
  - `src/features/auth/components/formularioRegistro.tsx` — aria-label y span del logo (2 ocurrencias)
- ✅ **Fix validación Zod v4** en `formularioRegistro.tsx` — `useForm` sin `defaultValues` hacía que Zod v4 recibiera `undefined` en todos los campos, produciendo el mensaje genérico "Invalid input: expected string, received undefined" en lugar de los mensajes personalizados. Fix: añadido `defaultValues: { nombre: "", correo: "", contrasena: "", confirmarContrasena: "" }`
- ✅ **Fix `Input` shadcn** en `src/components/ui/input.tsx` — refactorizado de función simple a `React.forwardRef`. En React 18, sin `forwardRef` la `ref` del `register()` de RHF no se adjunta al elemento DOM; RHF no puede leer valores directamente del input
- ✅ **Google OAuth operativo** — credenciales `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` añadidas a `.env.local`; Next.js requiere reinicio del servidor para leer nuevas variables de entorno (`.env.local` solo se carga al arrancar, no en caliente)
- ✅ Build y lint limpios: 0 errores, 0 warnings (4 rutas generadas)

## Avance de la sesión anterior (TFG-15 cont. — Lint, Build y Diseño de /registro)

- ✅ Lint/build: eliminado import `CardContent` no usado en `tarjetaTestimonio.tsx`
- ✅ Tipos Framer Motion v12: anotadas variantes con `Variants` en `formularioRegistro.tsx` y `tarjetaTestimonio.tsx` (framer-motion v12 es estricto con `ease: string`)
- ✅ Imagen de fondo: `frontend/public/images/fondo-auth.jpg` (2843×4264 px) — next/image la optimiza automáticamente, no hace falta redimensionar
- ✅ Layout split-screen implementado en `/registro` (referentes: Linear, Spotify, Netflix):
  - Panel izquierdo (lg+): imagen gastronómica + overlay `bg-black/30` + gradiente lateral `from-transparent to-[var(--auth-dark)]` que funde la imagen con el panel derecho sin corte brusco
  - Texto editorial centrado sobre la imagen: `h1 font-black italic` + etiqueta decorativa con líneas horizontales + subtítulo `uppercase tracking-[0.35em]` (estilo Bon Appétit / Spotify)
  - Panel derecho: `bg-[var(--auth-dark)]` — oscuro cálido, diferenciado visualmente de la barra del navegador; Card blanca flota con contraste elegante
  - Móvil: imagen oculta, formulario a pantalla completa con fondo oscuro

## Avance de la sesión anterior (TFG-15 — Registro + NextAuth + Documentación)

- ✅ `src/lib/auth.ts` creado con `opcionesAuth` (NextAuth, GoogleProvider, JWT strategy)
- ✅ `src/app/api/auth/[...nextauth]/route.ts` — route handler GET/POST
- ✅ `src/features/auth/types/autenticacion.ts` — esquemaRegistro Zod + tipos DatosRegistro, EstadoFormulario
- ✅ `src/features/auth/components/botonGoogle.tsx` — botón OAuth con SVG Google oficial, reutilizable en login
- ✅ `src/features/auth/components/divisorOAuth.tsx` — divisor "o continúa con correo", reutilizable en login
- ✅ `src/features/auth/components/formularioRegistro.tsx` — form con RHF + Zod, toggles contraseña, estados idle/cargando/exito/error, animaciones Framer Motion
- ✅ `src/features/auth/components/index.ts` — barrel export del feature auth
- ✅ `src/app/registro/page.tsx` — ruta /registro con metadata, fondo decorativo y FormularioRegistro
- ✅ `docs/registro.html` — documentación técnica completa (10 secciones): conceptos, arquitectura, Zod, RHF, NextAuth/OAuth, animaciones, TODOs
- 🔴 Email/contraseña: formulario validado localmente, envío es mock (TODO Fase 4: conectar backend)
- ✅ Google OAuth: funcional, redirige a "/" (TODO Fase 2: cambiar a /feed)

---

## Auth — TODOs marcados en código

- 🔴 [AUTH-001] `botonGoogle.tsx` — cambiar `callbackUrl` de `"/"` a `"/feed"` → Fase 2
- ✅ [AUTH-002] `formularioRegistro.tsx` — `POST /api/auth/registro` conectado
- ✅ [AUTH-003] `lib/auth.ts` — `CredentialsProvider` añadido
- 🔴 [AUTH-004] `lib/auth.ts` — enriquecer callback `session` con avatar, rol e ID del backend → Fase 4
- 🔴 [AUTH-005] Backend — endpoint `POST /api/auth/enviar-verificacion`: generar token firmado (JWT 24h), persistirlo en MongoDB, enviarlo vía Resend → Fase 4 + Fase 6
- 🔴 [AUTH-006] Backend — endpoint `POST /api/auth/verificar-email`: validar token, marcar usuario como verificado en MongoDB, invalidar token → Fase 4
- ✅ [AUTH-007] `formularioLogin.tsx` — `signIn("credentials", ...)` conectado
- ✅ [AUTH-008] `formularioRecuperarContrasena.tsx` — `POST /api/auth/recuperar-contrasena` conectado
- ✅ [AUTH-009] `formularioNuevaContrasena.tsx` — `POST /api/auth/nueva-contrasena` conectado

## Limitación conocida — login con credenciales

El endpoint POST /api/auth/login verifica `cuentaVerificada` antes de devolver el token.
Hasta que Resend esté activo (Fase 6), los usuarios se crean en DB pero no pueden hacer
login con email/contraseña sin verificar manualmente la cuenta en MongoDB Atlas.
El login con Google OAuth sigue funcionando sin restricciones.

## Reportes asociados

- Ver: docs/phase-reports/fase-1-sprint-1-registro.md (registro — historial completo)
- Ver: docs/registro.html (documentación técnica de la vista /registro)
- Ver: docs/phase-reports/fase-1-sprint-1-landing.md (landing — historial completo)
- Ver: docs/phase-reports/fase-1-sprint-1-carrousel-pendientes.md (carrusel con imágenes reales)
- Ver: docs/desarrollo/landingPage.md (documentación técnica de todos los componentes)

## Rutas del proyecto (build actual)

| Ruta | Tipo | Estado |
|---|---|---|
| `/` | Landing Page | ✅ |
| `/registro` | Página de registro | ✅ |
| `/privacidad` | Política de privacidad | ✅ |
| `/terminos` | Términos de uso | ✅ |
| `/login` | Inicio de sesión | ✅ |
| `/recuperar-contrasena` | Solicitar recuperación (email) | ✅ |
| `/recuperar-contrasena/pendiente` | Confirmar envío de correo | ✅ |
| `/nueva-contrasena` | Establecer nueva contraseña | ✅ |
| `/verificar-email/pendiente` | Pantalla post-registro "revisa tu correo" | ✅ mock |
| `/verificar-email` | Verificación de token por enlace | ✅ mock |
| `/api/auth/[...nextauth]` | Route handler NextAuth | ✅ |
| `/home` | Home / Feed de recetas — mobile + PC responsive | ✅ Aprobado autor |
| NavBar inferior (`(main)/layout.tsx`) | Componente global | ✅ Aprobado autor |
| `/recetas/[id]` | Detalle de receta — mock (datos reales en DET-008) | ✅ Aprobado autor |
| `/completar-perfil` | Onboarding post-registro — selección de alergias y dietas | 👁️ Pendiente revisión |
| `frontend/src/services/apiClient.ts` | Axios instance centralizada | ✅ |
| `frontend/src/services/authService.ts` | Servicio HTTP de auth (5 métodos) | ✅ |
| `BE /api/auth/registro` | Endpoint real | ✅ Sprint 2 BE |
| `BE /api/auth/login` | Endpoint real | ✅ Sprint 2 BE |
| `BE /api/auth/verificar-email` | Endpoint real | ✅ Sprint 2 BE |
| `BE /api/auth/recuperar-contrasena` | Endpoint real | ✅ Sprint 2 BE |
| `BE /api/auth/nueva-contrasena` | Endpoint real | ✅ Sprint 2 BE |
| `BE /api/health` | Health check público (sin auth) — usado por scripts/keep-alive.sh | ✅ Sprint 3 |

## Estructura del Proyecto

- /frontend → Next.js 14 App Router + TypeScript + Tailwind
- /backend → Node.js + Express + TypeScript — activo desde Sprint 2
- /docs → documentación y contexto
  - /docs/desarrollo → documentación técnica de cada módulo
  - /docs/phase-reports → sprints y tareas pendientes
  - /docs/changes → registro de cambios por capa (ui, api, domain)

## Tareas Pendientes de Fase 0

- Ver: docs/phase-reports/fase-0-pendientes.md
- [SETUP-001] CI/CD GitHub Actions → aplazado a Fase 6
- ✅ [SETUP-002] Rama develop → completado
- [SETUP-003] Variables Vercel → aplazado a Fase 6
- ✅ [SETUP-004] Google Cloud Console OAuth → completado, credenciales en .env.local
- [SETUP-005] Paquetes deprecated (eslint@8, next-pwa@5) → aplazado a Fase 6, ver docs/tech-debt.md

## Carrusel — Pendientes

- Ver: docs/phase-reports/fase-1-sprint-1-carrousel-pendientes.md
- [CAROUSEL-001] Imágenes reales (sustituir gradientes + emoji)
- [CAROUSEL-002] Transición Ken Burns (opcional, sprint 3)
- [CAROUSEL-003] Controles accesibles prev/next + aria-live

## Estrategia de despliegue — decidida en Fase 1

Estado: ⏳ Pendiente de implementar (Fase 6 / Sprint 15)

Frontend → Vercel → cookr.vercel.app
Backend  → Render (tier gratuito) → https://{nombre-servicio}.onrender.com
CI/CD    → GitHub Actions → .github/workflows/ci-cd.yml
Método   → Deploy Hook de Render (curl a URL secreta desde GitHub Actions)
Dominio  → cookr.vercel.app (gratuito, sin configuración extra)
Nota     → Render free duerme el servicio tras 15 min inactividad (cold start 30-60 s)
OAuth localhost: funciona hasta Fase 6, no tocar .env.local

Pendiente documentado en: docs/phase-reports/fase-0-pendientes.md [SETUP-006] [SETUP-007]

## Próxima Tarea

Sprint 2 completado y aprobado al 100%.

Sprint 3 activo — tareas prioritarias:
- **FE:** DET-001 — Guardar receta (persistente)
- **FE:** DET-002 — Like persistente en recetas
- **FE:** DET-009 — Carrusel de recetas similares funcional
- **FE:** CAROUSEL-001 — Imágenes reales en el carrusel de la landing
- **DOCS:** DOCS-001 — Limpiar duplicados docs/ (en progreso)
- **DOCS:** DOCS-002 — Renombrar archivos phase-reports/changes de pendientes a completados
