'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DrawerFiltros } from '@/features/recetas/components/home/drawerFiltros'
import type { FiltrosAvanzados } from '@/features/recetas/types/receta.types'

interface Props {
  query: string
  onChange: (q: string) => void
  filtrosAvanzados: FiltrosAvanzados
  onFiltrosChange: (f: FiltrosAvanzados) => void
}

export function HeaderDiscover({ query, onChange, filtrosAvanzados, onFiltrosChange }: Props) {
  const buscando = query.length > 0
  const totalActivos =
    filtrosAvanzados.dietas.length +
    filtrosAvanzados.dificultad.length +
    filtrosAvanzados.alergenos.length

  return (
    <header className="px-5 pt-6 pb-4">
      {buscando ? (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg font-extrabold text-brand">Cookr</span>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold leading-tight text-foreground text-center">
            Descubre lo que está{' '}
            <span className="italic text-brand">trending?</span>
          </h1>
        </div>
      )}

      {/* Barra de búsqueda + botón Filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center">
          <Search
            size={16}
            className="absolute left-4 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Busca recetas, chefs, ingredientes…"
            className="w-full rounded-full bg-[var(--warm-bg-accent)] py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {buscando && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Botón Filtros */}
        <DrawerFiltros filtros={filtrosAvanzados} onChange={onFiltrosChange}>
          <button
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-3 text-xs font-semibold transition-colors',
              totalActivos > 0
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border bg-[var(--warm-bg-accent)] text-muted-foreground',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
            {totalActivos > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                {totalActivos}
              </span>
            )}
          </button>
        </DrawerFiltros>
      </div>
    </header>
  )
}
