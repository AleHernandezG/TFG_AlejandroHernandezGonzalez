# API Changes — Cookr

## [API-002] CORS — Configurar orígenes permitidos para producción
Fecha:   2026-03-25 | Estado: ⏳ Pendiente | Afecta: solo BE | Fase: 6

Cambio:
  En producción el backend solo acepta peticiones desde cookr.vercel.app
  En desarrollo acepta localhost:3000

Implementación en backend/src/app.js:
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://cookr.vercel.app']
      : ['http://localhost:3000']

  app.use(cors({ origin: allowedOrigins, credentials: true }))

Archivos afectados:
  BE: backend/src/app.js → configurar cors con allowedOrigins
  BE: backend/.env.production → FRONTEND_URL=https://cookr.vercel.app

Motivo: Seguridad — evitar que otras apps llamen a la API de producción

---

## [API-003] NextAuth — Actualizar NEXTAUTH_URL para producción
Fecha:   2026-03-25 | Estado: ⏳ Pendiente | Afecta: FE | Fase: 6

Cambio:
  Solo tocar en Fase 6 al hacer el deploy. No tocar antes.

  Desarrollo (actual, no modificar):
    NEXTAUTH_URL=http://localhost:3000

  Producción (solo en Fase 6):
    NEXTAUTH_URL=https://cookr.vercel.app
    (añadir en Vercel → Settings → Environment Variables)

Pasos en Fase 6 (un único día):
  1. Añadir en Vercel → Environment Variables:
       NEXTAUTH_URL=https://cookr.vercel.app
  2. Añadir en Google Cloud Console → OAuth 2.0 Client ID:
       Authorized redirect URIs:
         https://cookr.vercel.app/api/auth/callback/google
       Authorized JavaScript origins:
         https://cookr.vercel.app
  3. Verificar login con Google en producción

Motivo: Google OAuth exige que NEXTAUTH_URL coincida exactamente
        con la URI registrada — cualquier diferencia rompe el login
