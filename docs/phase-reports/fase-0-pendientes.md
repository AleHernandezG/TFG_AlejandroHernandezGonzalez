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

## [SETUP-004] Google Cloud Console — OAuth credentials
Estado:   ⏳ Pendiente
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
