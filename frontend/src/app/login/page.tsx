import type { Metadata } from 'next'
import Image from 'next/image'
import { FormularioLogin } from '@/features/auth/components'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Cookr',
  description:
    'Accede a tu cuenta de Cookr y vuelve a conectar con tu comunidad gastronómica.',
}

const caracteristicas = [
  'Recetas personalizadas a tu gusto',
  'Comunidad gastronómica activa',
  'IA que aprende tus preferencias',
]

const textShadow = '0 1px 12px rgba(0,0,0,0.95), 0 2px 24px rgba(0,0,0,0.7)'

export default function PaginaLogin() {
  return (
    <div className="relative flex min-h-screen">
      {/* ── Imagen de fondo a pantalla completa ── */}
      <Image
        src="/images/fondo-auth.webp"
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/25" />

      {/* ── Panel izquierdo — formulario ── */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <FormularioLogin />
        </div>
      </main>

      {/* ── Panel derecho — marca + features (solo ≥ lg) ── */}
      <div className="relative z-10 hidden flex-col items-start justify-center pl-10 pr-8 lg:flex lg:w-1/2">
        <div className="w-full max-w-sm text-center">

          {/* Etiqueta */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-white/35" />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white"
              style={{ textShadow }}
            >
              Red social gastronómica
            </span>
            <div className="h-px flex-1 bg-white/35" />
          </div>

          {/* Marca — beige cálido: from-amber-100 to-amber-200 */}
          <h1
            className="bg-gradient-to-br from-amber-100 to-amber-200 bg-clip-text font-black italic leading-none tracking-tight text-transparent"
            style={{
              fontSize: 'clamp(4rem, 5.5vw, 6.5rem)',
              filter:
                'drop-shadow(0 2px 14px rgba(0,0,0,0.85)) drop-shadow(0 4px 36px rgba(0,0,0,0.55))',
            }}
          >
            Cookr
          </h1>

          {/* Tagline */}
          <p
            className="mt-4 text-base font-medium leading-relaxed text-white"
            style={{ textShadow }}
          >
            Descubre recetas, comparte lo que cocinas y conecta con quien ama la gastronomía.
          </p>

          {/* Features — solo texto, sin iconos */}
          <ul className="mt-7 space-y-2.5">
            {caracteristicas.map((texto) => (
              <li
                key={texto}
                className="text-sm font-semibold text-white"
                style={{ textShadow }}
              >
                {texto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
