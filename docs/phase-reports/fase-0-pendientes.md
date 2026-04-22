# Fase 0 — Tareas Pendientes para Retomar
# TFG · Red Social Gastronómica con IA
# Creado: 2025-03-16 | Estado: ⏳ Pendiente
#
# Adjunta este fichero a Claude cuando quieras completar estas tareas.
# Contexto: "Quiero completar las tareas pendientes de la Fase 0"
# ─────────────────────────────────────────────────────────────────────

## [SETUP-001] GitHub Actions — CI/CD básico
Estado:   ✅ Completado — Sprint 3 (cubierto por SETUP-008)
Cuándo:   Sprint 3 — implementado junto al workflow completo CI + CD

Qué se hizo:
  .github/workflows/ci-cd.yml — CI para FE (next lint + tsc --noEmit) y BE (tsc --noEmit)
  en cada push a main/develop y PR a main. CD: deploy a Vercel + Render Deploy Hook
  condicionado al CI. Branch protection en main activada. Secretos GitHub añadidos.

  Ver: .github/workflows/ci-cd.yml

---

## [SETUP-002] Rama develop
Estado:   ✅ Completado — Sprint 2
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

## [SETUP-006] Deploy — Render + Vercel + GitHub Actions
Estado:   ⏳ Pendiente
Cuándo:   Fase 6 / Sprint 15

Pasos en orden:
  1. Crear cuenta en render.com y nuevo Web Service apuntando al repo GitHub
  2. Configurar el servicio: Runtime Node, Build Command "cd backend && npm ci && npm run build",
     Start Command "cd backend && node dist/index.js", tier gratuito
  3. En Render → Settings → Deploy Hook: copiar la URL secreta del hook
  4. Añadir secretos en GitHub (Settings → Secrets → Actions):
       RENDER_DEPLOY_HOOK_URL (la URL copiada del paso 3)
       RENDER_APP_URL         (https://{nombre-servicio}.onrender.com)
       VERCEL_TOKEN
       VERCEL_ORG_ID
       VERCEL_PROJECT_ID
  5. Crear .github/workflows/ci-cd.yml (ver roadmap.md sección 9)
  6. Configurar Environment Variables en Render → Environment (ver infraestructura.md sección 7)
  7. Configurar Environment Variables en Vercel (ver infraestructura.md sección 7)
  8. Añadir en Google Cloud Console:
       https://cookr.vercel.app/api/auth/callback/google
  9. Verificar CORS en backend (ver api-changes.md [API-002])

  ⚠️ Render free tier: el servicio duerme tras 15 min de inactividad.
     Cold start ~30-60 s. Ejecutar scripts/keep-alive.sh manualmente antes de demos.

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
