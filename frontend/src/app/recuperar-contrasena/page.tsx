import type { Metadata } from 'next'
import Image from 'next/image'
import { FormularioRecuperarContrasena } from '@/features/auth/components'

export const metadata: Metadata = {
  title: 'Recuperar contraseña — Cookr',
  description:
    'Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
}

/**
 * Página de recuperación de contraseña — /recuperar-contrasena
 *
 * Layout split-screen idéntico a /login:
 *   - Panel izquierdo: fondo oscuro cálido con el formulario (solo campo email)
 *   - Panel derecho (lg+): imagen gastronómica con texto editorial y gradiente izquierdo
 *   - Móvil: imagen oculta, formulario a pantalla completa
 */
export default function PaginaRecuperarContrasena() {
  return (
    <div className="flex min-h-screen">
      {/* ── Panel izquierdo — formulario ─────────────────────────────────── */}
      <main className="flex w-full flex-col items-center justify-center bg-[var(--auth-dark)] px-4 py-12 lg:w-1/2 xl:w-2/5">
        <div className="w-full max-w-md">
          <FormularioRecuperarContrasena />
        </div>
      </main>

      {/* ── Panel derecho — imagen (solo ≥ lg) ───────────────────────────── */}
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

        {/* Gradiente izquierdo — funde imagen con panel del formulario */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-l from-transparent to-[var(--auth-dark)]" />

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
    </div>
  )
}
