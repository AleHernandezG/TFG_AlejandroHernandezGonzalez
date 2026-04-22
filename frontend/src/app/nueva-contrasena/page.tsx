import type { Metadata } from 'next'
import Image from 'next/image'
import { FormularioNuevaContrasena } from '@/features/auth/components'

export const metadata: Metadata = {
  title: 'Nueva contraseña — Cookr',
  description: 'Establece una nueva contraseña para tu cuenta de Cookr.',
}

interface Props {
  searchParams: { token?: string }
}

/**
 * Página de nueva contraseña — /nueva-contrasena?token=xxx
 *
 * Layout split-screen como /registro (imagen izquierda, formulario derecha)
 * para crear una sensación de "vuelta al inicio" tras el flujo de recuperación.
 *
 * El token llega como query param desde el enlace del correo de recuperación.
 * Se pasa como prop al formulario para incluirlo en la petición al backend.
 *
 * Estado actual: mock — la validación real del token se implementa en Fase 4-6.
 * TODO [AUTH-009] Fase 4+6: validar token en backend + actualizar contraseña con bcrypt.
 */
export default function PaginaNuevaContrasena({ searchParams }: Props) {
  const token = searchParams.token ?? ''

  return (
    <div className="flex min-h-screen">
      {/* ── Panel izquierdo — imagen (solo ≥ lg) ─────────────────────── */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5">
        <Image
          src="/images/fondo-auth.webp"
          alt=""
          fill
          priority
          className="object-cover object-center"
          aria-hidden="true"
        />

        <div className="absolute inset-0 bg-black/30" />

        {/* Gradiente derecho — funde imagen con panel del formulario */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[var(--auth-dark)]" />

        {/* ── Texto editorial ──────────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-14 bg-white/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Red social gastronómica
            </span>
            <div className="h-px w-14 bg-white/40" />
          </div>

          <h1
            className="bg-gradient-to-r from-brand to-brand-muted bg-clip-text font-black italic leading-none tracking-tight text-transparent"
            style={{ fontSize: 'clamp(3.5rem, 6vw, 6.5rem)' }}
          >
            Cookr
          </h1>

          <div className="mt-7 flex items-center gap-4 text-white/60">
            <div className="h-px w-12 bg-white/35" />
            <p className="text-xs font-semibold uppercase tracking-[0.35em]">El arte de cocinar</p>
            <div className="h-px w-12 bg-white/35" />
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ────────────────────────────────── */}
      <main className="flex w-full flex-col items-center justify-center bg-[var(--auth-dark)] px-4 py-12 lg:w-1/2 xl:w-2/5">
        <div className="w-full max-w-md">
          <FormularioNuevaContrasena token={token} />
        </div>
      </main>
    </div>
  )
}
