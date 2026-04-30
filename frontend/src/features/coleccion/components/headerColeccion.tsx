'use client'

import { cn } from '@/lib/utils'
import type { PestanaColeccion } from '@/features/coleccion/types/coleccion.types'

interface Props {
  pestana: PestanaColeccion
  onCambiar: (p: PestanaColeccion) => void
  total: number
}

export function HeaderColeccion({ pestana, onCambiar, total }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-card px-6 pt-8 pb-4 shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.02)]">
      <div className="text-center mb-5">
        {pestana === 'guardadas' ? (
          <h1 className="text-3xl font-light tracking-[0.03em] text-foreground leading-tight">
            ¡Mis recetas{' '}
            <span className="font-bold italic text-brand text-4xl block mt-1">Guardadas!</span>
          </h1>
        ) : (
          <h1 className="text-3xl tracking-tight text-foreground leading-tight">
            ¡<span className="font-bold italic text-brand">Mis Recetas</span>!
          </h1>
        )}
        <p className="text-muted-foreground text-sm mt-2 font-medium tracking-wide">
          {total} {pestana === 'guardadas' ? 'recetas guardadas' : 'recetas publicadas'}
        </p>
      </div>

      <div className="flex bg-muted rounded-full p-1 w-full max-w-[280px] mx-auto">
        <button
          onClick={() => onCambiar('guardadas')}
          className={cn(
            'flex-1 py-2.5 px-4 text-sm font-semibold rounded-full transition-all',
            pestana === 'guardadas'
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Guardadas
        </button>
        <button
          onClick={() => onCambiar('mis-recetas')}
          className={cn(
            'flex-1 py-2.5 px-4 text-sm font-semibold rounded-full transition-all',
            pestana === 'mis-recetas'
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Mis recetas
        </button>
      </div>
    </header>
  )
}
