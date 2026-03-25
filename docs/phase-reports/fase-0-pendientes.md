# Fase 0 — Tareas Pendientes para Retomar
# TFG · Red Social Gastronómica con IA
# Creado: 2025-03-16 | Estado: ⏳ Pendiente
#
# Adjunta este fichero a Claude cuando quieras completar estas tareas.
# Contexto: "Quiero completar las tareas pendientes de la Fase 0"
# ─────────────────────────────────────────────────────────────────────

## [SETUP-001] GitHub Actions — CI/CD básico
Estado:   ⏳ Pendiente (aplazado, se trabaja en local)
Cuándo:   Antes del primer deploy a Vercel (Fase 6 / Sprint 15)

Qué hay que hacer:
  1. Crear carpeta .github/workflows/ en la raíz del repo
  2. Crear fichero ci.yml con este workflow:
     - Trigger: push a main y develop, PR a main
     - Job lint: npm ci → eslint → tsc --noEmit
     - working-directory: frontend
     - Node version: 20
     - cache: npm con cache-dependency-path: frontend/package-lock.json

  3. Añadir secretos en GitHub repo → Settings → Secrets:
     - NEXTAUTH_SECRET
     - NEXT_PUBLIC_API_URL (cuando el backend esté en Render/Railway)

  4. Cuando el backend exista, añadir segundo job:
     - working-directory: backend
     - npm ci → npm run lint → npm test

Commit esperado:
  chore: añadir GitHub Actions CI — lint y type check

---

## [SETUP-002] Rama develop
Estado:   ⏳ Pendiente
Cuándo:   Antes de empezar el Sprint 2 (recomendado)

Qué hay que hacer:
  git checkout -b develop
  git push -u origin develop

  A partir de ahí trabajar en ramas de feature:
  git checkout -b feat/landing-page
  git checkout -b feat/auth-login
  etc.

  Mergear a develop al terminar cada feature.
  Mergear develop a main al terminar cada sprint.

---

## [SETUP-003] Variables de entorno en Vercel
Estado:   ⏳ Pendiente
Cuándo:   Fase 6 — Deploy frontend

Qué hay que hacer:
  En vercel.com → proyecto → Settings → Environment Variables añadir:
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL (la URL de producción de Vercel)
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - NEXT_PUBLIC_API_URL (URL del backend en Render/Railway)
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - GEMINI_API_KEY
  - EDAMAM_APP_ID / EDAMAM_APP_KEY
  - RESEND_API_KEY

---

## [SETUP-005] Actualizar paquetes deprecated (eslint@8, next-pwa@5)
Estado:   ⏳ Aplazado — registrado 2026-03-21
Cuándo:   Fase 6 — antes del primer deploy a Vercel

Resumen:
  Los warnings de `npm install` son en su mayoría transitivos (no controlables).
  Los dos únicos paquetes directamente actualizables están bloqueados por dependencias
  de framework hasta la migración a Next.js 15 (Fase 6).

  Ver análisis completo y pasos exactos de migración en:
  → docs/tech-debt.md [DEBT-001]

  No bloquea ninguna fase de desarrollo (1-5). Ignorar warnings hasta Fase 6.

---

## [SETUP-006] Deploy — Azure App Service + Vercel + GitHub Actions
Estado:   ⏳ Pendiente
Cuándo:   Fase 6 / Sprint 15

Pasos en orden:
  1. Activar Azure for Students en azure.microsoft.com/free/students
  2. Crear App Service: api-cookr, Node 20, West Europe, Free F1, Linux
  3. Descargar Publish Profile desde Azure Portal → Overview
  4. Añadir secretos en GitHub:
       AZURE_WEBAPP_PUBLISH_PROFILE (el XML descargado)
       VERCEL_TOKEN
       VERCEL_ORG_ID
       VERCEL_PROJECT_ID
  5. Crear .github/workflows/ci-cd.yml (ver roadmap.md sección 9)
  6. Configurar App Settings en Azure Portal (ver infraestructura.md sección 7)
  7. Configurar Environment Variables en Vercel (ver infraestructura.md sección 7)
  8. Añadir en Google Cloud Console:
       https://cookr.vercel.app/api/auth/callback/google
  9. Verificar CORS en backend (ver api-changes.md [API-002])

---

## [SETUP-007] OAuth — Configuración para producción
Estado:   ⏳ Pendiente
Cuándo:   Fase 6 / Sprint 15 — hacer el mismo día del deploy

Dominio definitivo: cookr.vercel.app (no se usa dominio personalizado)

Pasos (hacer todo el mismo día que el deploy):
  1. Añadir en Vercel → Settings → Environment Variables:
       NEXTAUTH_URL=https://cookr.vercel.app
  2. Ir a console.cloud.google.com → APIs & Services
     → Credentials → OAuth 2.0 Client ID → editar
  3. Añadir en Authorized redirect URIs:
       https://cookr.vercel.app/api/auth/callback/google
  4. Añadir en Authorized JavaScript origins:
       https://cookr.vercel.app
  5. Guardar y verificar login con Google en producción

Hasta entonces: desarrollo siempre en localhost:3000, no tocar nada.

---

## [SETUP-004] Google Cloud Console — OAuth credentials
Estado:   ✅ Completado — 17/03/2025
Cuándo:   Sprint 1 — al implementar login con Google

Qué hay que hacer:
  1. Ir a console.cloud.google.com → New Project → "TFG Gastronómica"
  2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
  3. Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google  (desarrollo)
     - https://tu-app.vercel.app/api/auth/callback/google  (producción)
  4. Copiar Client ID y Client Secret a .env.local:
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
