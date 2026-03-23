import type { Metadata } from 'next'
import Image from 'next/image'
import { FormularioRegistro } from '@/features/auth/components'

export const metadata: Metadata = {
  title: 'Crear cuenta — Cookr',
  description:
    'Únete a la comunidad gastronómica. Crea tu cuenta gratis y empieza a descubrir recetas personalizadas.',
}

/**
 * Página de registro — /registro
 *
 * Layout split-screen (referentes: Linear, Spotify, Netflix):
 *   - Panel izquierdo (lg+): imagen gastronómica con texto editorial centrado
 *     y gradiente derecho que funde la imagen con el panel del formulario
 *   - Panel derecho: fondo oscuro cálido (stone-950→zinc-950) para diferenciarse
 *     visualmente de la barra del navegador; Card blanca flota con contraste elegante
 *   - Móvil: imagen oculta, formulario ocupa pantalla completa
 */
export default function PaginaRegistro() {
  return (
    <div className="flex min-h-screen">
      {/* ── Panel izquierdo — imagen (solo ≥ lg) ─────────────────────── */}
      <div className="relative hidden lg:block lg:w-1/2 xl:w-3/5">
        <Image
          src="/images/fondo-auth.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          aria-hidden="true"
        />

        {/* Overlay general — mejora contraste del texto sin ahogar la imagen */}
        {/* sin equivalente en paleta Cookr: overlay semitransparente negro sobre foto */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Gradiente lateral derecho — funde la imagen con el panel del formulario
            (técnica usada por Linear, Spotify, Vercel en sus páginas de auth) */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[var(--auth-dark)]" />

        {/* ── Texto editorial centrado ────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          {/* Etiqueta decorativa superior — uniforme, sin mezcla de colores */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-14 bg-white/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
              Red social gastronómica
            </span>
            <div className="h-px w-14 bg-white/40" />
          </div>

          {/* Nombre de marca — único tratamiento: gradiente brand→brand-muted
              Patrón Linear / Stripe / Vercel: máximo impacto con un solo efecto */}
          <h1
            className="bg-gradient-to-r from-brand to-brand-muted bg-clip-text font-black italic leading-none tracking-tight text-transparent"
            style={{ fontSize: 'clamp(3.5rem, 6vw, 6.5rem)' }}
          >
            Cookr
          </h1>

          {/* Subtítulo — limpio, sin efectos extra */}
          <div className="mt-7 flex items-center gap-4 text-white/60">
            <div className="h-px w-12 bg-white/35" />
            <p className="text-xs font-semibold uppercase tracking-[0.35em]">El arte de cocinar</p>
            <div className="h-px w-12 bg-white/35" />
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ────────────────────────────────── */}
      {/* Gradiente oscuro cálido: diferencia claramente del blanco del navegador
          y crea contraste elegante con la Card blanca del formulario */}
      <main className="flex w-full flex-col items-center justify-center bg-[var(--auth-dark)] px-4 py-12 lg:w-1/2 xl:w-2/5">
        <div className="w-full max-w-md">
          <FormularioRegistro />
        </div>
      </main>
    </div>
  )
}
