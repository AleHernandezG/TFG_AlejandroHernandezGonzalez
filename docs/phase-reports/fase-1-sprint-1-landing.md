# Fase 1 — Sprint 1 — Reporte TFG-14 (Landing Page)

**Fecha:** 2026-03-20  
**Estado:** ✅ Implementado (pendiente validacion local final)

## Objetivo

Implementar la Landing Page inicial de la app cumpliendo criterios de aceptacion de Sprint 1 con enfoque mobile-first y datos mock.

## Criterios de aceptacion

- ✅ Hero section con CTA hacia registro
- ✅ Seccion de 3 features de la app
- ✅ Responsive: mobile primero, desktop adaptado
- ✅ Animada con Framer Motion
- ✅ Botones con shadcn/ui Button
- ✅ Implementada en App Router (Next.js)

## Cambios realizados

- Reemplazo de la pagina inicial por Landing productiva.
- Estructura mobile-first con:
  - Header ligero
  - Hero con copy principal
  - CTA primario (registro) y secundario (login)
  - Bloque de stats
  - Seccion de 3 features
- Animaciones de entrada y stagger con Framer Motion.
- Datos mock separados para facilitar iteracion de contenido sin backend.
- Metadatos base actualizados para la app.

## Archivos modificados

- frontend/src/app/page.tsx
- frontend/src/lib/mocks/landing.ts
- frontend/src/app/layout.tsx
- docs/context.md

## Riesgos y bloqueos

- Entorno local sin npm/node operativo en PATH durante esta sesion.
- No se pudo ejecutar validacion final de lint/build en local.

## Validacion pendiente

- Ejecutar en frontend:
  - npm install
  - npm run lint
  - npm run build
- Revisar visual final en viewport mobile (<=768px) y desktop.

## Commit sugerido

feat(landing): implementar landing page mobile-first con hero, cta y 3 features animadas

## Siguiente paso de Sprint 1

- Iniciar TFG de Login y Registro.
- Integrar Google OAuth una vez cerrados formularios base.
