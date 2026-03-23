# Contexto de Sesión — TFG

**Fecha:** 2026-03-23
**Sprint Actual:** Sprint 1 — Setup + Autenticación (Mar 16 → Mar 29)
**Fase:** Fase 1 de 7 — Autenticación (Frontend)

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
- 🔜 Pendiente este sprint: Login (/login) — TFG-16

## Avance de la sesión actual (paleta Cookr + páginas legales)

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

## Auth — TODOs marcados en código

- 🔴 [AUTH-001] `botonGoogle.tsx` — cambiar `callbackUrl` de `"/"` a `"/feed"` → Fase 2
- 🔴 [AUTH-002] `formularioRegistro.tsx` — sustituir mock por `POST /api/usuarios/registro` → Fase 4
- 🔴 [AUTH-003] `lib/auth.ts` — añadir `CredentialsProvider` para email/contraseña real → Fase 4
- 🔴 [AUTH-004] `lib/auth.ts` — enriquecer callback `session` con avatar, rol e ID del backend → Fase 4

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
| `/login` | Inicio de sesión | 🔜 TFG-16 |
| `/api/auth/[...nextauth]` | Route handler NextAuth | ✅ |

## Estructura del Proyecto

- /frontend → Next.js 14 App Router + TypeScript + Tailwind
- /backend → vacío hasta Fase 4
- /docs → documentación y contexto
  - /docs/desarrollo → documentación técnica de cada módulo
  - /docs/phase-reports → sprints y tareas pendientes
  - /docs/changes → registro de cambios por capa (ui, api, domain)

## Tareas Pendientes de Fase 0

- Ver: docs/phase-reports/fase-0-pendientes.md
- [SETUP-001] CI/CD GitHub Actions → aplazado a Fase 6
- [SETUP-002] Rama develop → pendiente
- [SETUP-003] Variables Vercel → aplazado a Fase 6
- ✅ [SETUP-004] Google Cloud Console OAuth → completado, credenciales en .env.local
- [SETUP-005] Paquetes deprecated (eslint@8, next-pwa@5) → aplazado a Fase 6, ver docs/tech-debt.md

## Carrusel — Pendientes

- Ver: docs/phase-reports/fase-1-sprint-1-carrousel-pendientes.md
- [CAROUSEL-001] Imágenes reales (sustituir gradientes + emoji)
- [CAROUSEL-002] Transición Ken Burns (opcional, sprint 3)
- [CAROUSEL-003] Controles accesibles prev/next + aria-live

## Próxima Tarea

Continuar Sprint 1: Login (/login) — TFG-16

## Paleta de colores — Cookr

Definida en: `frontend/src/app/globals.css`
Formato: oklch con variables CSS + Tailwind

Colores de marca:
  --brand          → color principal Cookr (ocre/naranja cálido)
  --brand-muted    → versión suave del brand
  --brand-subtle   → versión muy sutil, para fondos de badges
  --warm-bg        → fondo cálido para secciones hero
  --warm-bg-accent → variante más intensa del fondo cálido

Hero gradient:
  --hero-gradient-start / --hero-gradient-mid / --hero-gradient-end

Categorías semánticas:
  --category-social → azul para elementos de comunidad/social
  --category-ai     → violeta para elementos de IA

Temas del carrusel:
  --theme-fresh     → verde para carrusel ensaladas
  --theme-sweet     → rosa para carrusel postres
  --theme-pasta     → violeta para carrusel pastas

Auth panel:
  --auth-dark       → negro cálido para panel de autenticación

Regla para futuros desarrollos:
  NUNCA usar colores hardcodeados (hex, rgb, colores Tailwind genéricos)
  SIEMPRE usar las variables CSS de globals.css a través de Tailwind
  Ejemplo correcto:   bg-brand text-primary-foreground border-border
  Ejemplo incorrecto: bg-orange-500 text-white border-gray-200

Excepciones permitidas:
  bg-black/30              → overlay semitransparente funcional sobre foto
  Google SVG fills         → colores corporativos obligatorios de Google
