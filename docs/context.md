# Contexto de Sesión — TFG

**Fecha:** 2026-03-22
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
- 🔜 Pendiente este sprint: Login (/login) — TFG-16

## Avance de la sesión (TFG-15 — Registro + NextAuth + Documentación)

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

## Avance de la sesión anterior (TFG-14 — Landing Page Refinada)

- ✅ HeroSection convertida a fullscreen real (min-h-screen, sin bordes, sin card styling)
- ✅ Carrusel de fondo a pantalla completa con gradientes y emoji decorativo difuminado
- ✅ Texto, badge y CTAs centrados sobre el carrusel con overlays de legibilidad
- ✅ Header con ChefHat + "Iniciar sesión" eliminado de la vista
- ✅ Sección de estadísticas eliminada (limpieza de UI)
- ✅ Nuevo componente TestimonialCard con avatar, nombre bold, rol, comentario y valoración en corazones
- ✅ TestimonialsBento rediseñado: grid 1→2→3 cols, 6 usuarios mock con datos ricos
- ✅ FeaturesBento rediseñado: iconos con gradiente de color por categoría, card hero (col-span-2), subtítulo con tracking
- ✅ page.tsx restructurado: HeroSection fuera del contenedor, secciones dentro de max-w-5xl
- ✅ landing-data.ts actualizado: rol de usuario, 6 testimonios, 4 slides del carrusel
- ✅ tailwind.config.ts corregido: añadido src/features/**/* al content array
- ✅ Phase report de carrusel pendiente creado: docs/phase-reports/fase-1-sprint-1-carrousel-pendientes.md
- ✅ LandingFooter creado en components/common/ con tech stack, links, disclaimer IA y cita
- ✅ Documentación técnica de landing creada: docs/desarrollo/landingPage.md

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
