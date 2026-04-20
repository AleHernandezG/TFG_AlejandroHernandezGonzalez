'use client'

import { cn } from '@/lib/utils'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { FiltrosAvanzados } from '@/features/recetas/types/receta.types'
import { DrawerFiltros } from '@/features/recetas/components/home/drawerFiltros'

interface BuscadorFiltrosProps {
  placeholder?: string
  onBuscar: (query: string) => void
  filtrosAvanzados: FiltrosAvanzados
  onFiltrosAvanzadosChange: (filtros: FiltrosAvanzados) => void
  className?: string
}

export function BuscadorFiltros({
  placeholder = '¿Qué quieres cocinar hoy?',
  onBuscar,
  filtrosAvanzados,
  onFiltrosAvanzadosChange,
  className,
}: BuscadorFiltrosProps) {
  const totalActivos =
    filtrosAvanzados.dietas.length +
    filtrosAvanzados.dificultad.length +
    filtrosAvanzados.alergenos.length

  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-background/80 px-4 py-3 backdrop-blur-md',
        className,
      )}
    >
      {/* Barra de búsqueda */}
      <label className="flex flex-1 cursor-text items-center gap-2 rounded-full bg-muted px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <input
          type="search"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          onChange={(e) => onBuscar(e.target.value)}
        />
      </label>

      {/* Botón Filtros — siempre visible, nunca se corta */}
      <DrawerFiltros filtros={filtrosAvanzados} onChange={onFiltrosAvanzadosChange}>
        <button
          className={cn(
            'relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors',
            totalActivos > 0
              ? 'border-brand bg-brand/10 text-brand'
              : 'border-border bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
          Filtros
          {totalActivos > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
              {totalActivos}
            </span>
          )}
        </button>
      </DrawerFiltros>
    </div>
  )
}
