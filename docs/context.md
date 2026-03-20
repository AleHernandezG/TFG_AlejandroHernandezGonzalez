# Contexto de Sesión — TFG

**Fecha:** 2026-03-20
**Sprint Actual:** Sprint 1 — Setup + Autenticación (Mar 16 → Mar 29)
**Fase:** Fase 1 de 7 — Autenticación (Frontend)

## Estado Actual

- ✅ Fase 0 completada: repo, estructura, Next.js 14, shadcn/ui, dependencias, Prettier, Linear
- ✅ Stack instalado: TanStack Query, Zustand, Axios, Framer Motion, Lucide, next-pwa, NextAuth, Zod, React Hook Form
- ✅ shadcn/ui componentes: button, card, avatar, badge, tabs, sheet, dialog, drawer, skeleton, form, input, label, separator
- ✅ Landing Page (TFG-14) implementada en App Router con enfoque mobile-first y datos mock
- 🔜 Pendiente este sprint: Login, Registro, Google OAuth

## Avance de la sesión (TFG-14 — Landing Page)

- ✅ Hero section con CTA principal hacia registro
- ✅ Sección de 3 features de la app
- ✅ Responsive mobile-first (<=768px) con adaptación desktop
- ✅ Animaciones con Framer Motion
- ✅ Botones con shadcn/ui Button
- ✅ Datos mock desacoplados en `frontend/src/lib/mocks/landing.ts`
- ⚠️ Pendiente validación local final de lint/build: no hay `npm` disponible en el entorno actual

## Reporte asociado

- Ver: docs/phase-reports/fase-1-sprint-1-landing.md

## Estructura del Proyecto

- /frontend → Next.js 14 App Router + TypeScript + Tailwind
- /backend → vacío hasta Fase 4
- /docs → documentación y contexto

## Tareas Pendientes de Fase 0

- Ver: docs/phase-reports/fase-0-pendientes.md
- [SETUP-001] CI/CD GitHub Actions → aplazado a Fase 6
- [SETUP-002] Rama develop → pendiente
- [SETUP-003] Variables Vercel → aplazado a Fase 6
- ✅ [SETUP-004] Google Cloud Console OAuth → completado, credenciales en .env.local

## Próxima Tarea

Continuar Sprint 1: Login, Registro y Google OAuth (tras cierre de TFG-14)
