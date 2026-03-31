'use client'

import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import type { FiltroFeed } from '@/features/recetas/types/receta.types'

interface BuscadorFiltrosProps {
  placeholder?: string
  filtros: FiltroFeed[]
  filtroActivo: string
  onFiltroChange: (id: string) => void
  onBuscar: (query: string) => void
  className?: string
}

export function BuscadorFiltros({
  placeholder = '¿Qué quieres cocinar hoy?',
  filtros,
  filtroActivo,
  onFiltroChange,
  onBuscar,
  className,
}: BuscadorFiltrosProps) {
  return (
    <div
      className={cn(
        'space-y-2 bg-background/80 px-4 py-2 backdrop-blur-md',
        className,
      )}
    >
      {/* Input pill */}
      <label className="flex cursor-text items-center gap-2 rounded-full bg-muted px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <input
          type="search"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          onChange={(e) => onBuscar(e.target.value)}
        />
      </label>

      {/* Chips de filtro */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtros.map((filtro) => {
          const activo = filtro.id === filtroActivo
          return (
            <button
              key={filtro.id}
              onClick={() => onFiltroChange(filtro.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                activo
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {filtro.etiqueta}
            </button>
          )
        })}
      </div>
    </div>
  )
}
