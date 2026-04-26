import type { Metadata } from 'next'
import Image from 'next/image'
import { FormularioCrearReceta } from '@/features/recetas/components/crearReceta'

export const metadata: Metadata = {
  title: 'Nueva receta — Cookr',
}

export default function PaginaCrearReceta() {
  return (
    <div className="relative min-h-screen">
      {/* Fondo fotográfico — 1920×2880 portrait, object-top para encuadrar en móvil */}
      <Image
        src="/images/recetas/crearRecetaImagen.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* Crédito — Unsplash (buena práctica, ver rules.md §16) */}
      <p className="absolute bottom-2 right-3 z-10 text-[10px] text-white/40 leading-tight">
        Foto de{' '}
        <a
          href="https://unsplash.com/es/@robysense?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          Selah Wreck
        </a>
        {' '}en{' '}
        <a
          href="https://unsplash.com/es/fotos/frutas-variadas-en-plato-de-ceramica-blanca-gQwww2tG_LQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          Unsplash
        </a>
      </p>

      <main className="relative z-10 max-w-[390px] mx-auto px-5 pt-6 pb-8">
        <h1
          className="text-center text-[1.75rem] font-bold leading-snug tracking-tight text-white mb-6"
          style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9), 0 2px 24px rgba(0,0,0,0.6)' }}
        >
          ¿Cuál es tu nueva{' '}
          <span
            className="font-black italic text-brand relative inline-block"
            style={{ filter: 'drop-shadow(0 1px 8px rgba(0,0,0,0.7))' }}
          >
            creación
            <svg
              aria-hidden
              className="absolute -bottom-1 left-0 w-full overflow-visible"
              height="6"
              viewBox="0 0 100 6"
              preserveAspectRatio="none"
            >
              <path
                d="M0,4 Q25,1 50,4 Q75,7 100,4"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>?
        </h1>
        <FormularioCrearReceta />
      </main>
    </div>
  )
}
