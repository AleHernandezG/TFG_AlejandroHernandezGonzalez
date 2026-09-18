'use client'

import { cn } from '@/lib/utils'
import type { PasoAsistente } from './pasos'

interface Props {
  pasos: PasoAsistente[]
  indice: number
  onIr: (indice: number) => void
  className?: string
}

export function IndicadorProgreso({ pasos, indice, onIr, className }: Props) {
  return (
    <ol aria-label="Progreso de la receta" className={cn('flex items-center gap-1.5', className)}>
      {pasos.map((paso, i) => {
        const hecho = i < indice
        const actual = i === indice
        const barra = cn(
          'block h-1.5 w-full rounded-full transition-colors',
          actual ? 'bg-brand' : hecho ? 'bg-brand/40' : 'bg-border',
        )

        return (
          <li key={paso.id} className="flex-1" aria-current={actual ? 'step' : undefined}>
            {hecho ? (
              <button
                type="button"
                onClick={() => onIr(i)}
                aria-label={`Volver a ${paso.titulo}`}
                className="flex w-full items-center py-2 hover:opacity-70"
              >
                <span className={barra} />
              </button>
            ) : (
              <span className="flex w-full items-center py-2">
                <span className={barra} />
                <span className="sr-only">{paso.titulo}</span>
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
