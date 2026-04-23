'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { DrawerFiltros } from './drawerFiltros'

interface HeaderHomePcProps {
  busqueda: string
  onBuscar: (query: string) => void
  filtrosAvanzados: FiltrosAvanzados
  onFiltrosAvanzadosChange: (filtros: FiltrosAvanzados) => void
}

export function HeaderHomePc({
  busqueda,
  onBuscar,
  filtrosAvanzados,
  onFiltrosAvanzadosChange,
}: HeaderHomePcProps) {
  const totalActivos =
    filtrosAvanzados.dietas.length +
    filtrosAvanzados.dificultad.length +
    filtrosAvanzados.alergenos.length

  return (
    <header className="bg-background/80 fixed left-0 right-0 top-0 z-50 hidden h-20 items-center px-8 shadow-[0px_4px_24px_var(--foreground)_/_0.05] backdrop-blur-md lg:grid lg:grid-cols-3">
      {/* Logo */}
      <span className="justify-self-start text-2xl font-black uppercase tracking-widest text-brand">
        Cookr
      </span>

      {/* Search + Filtros (centrado) */}
      <div className="flex items-center gap-2 justify-self-center">
        <div className="relative">
          <Search
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            type="search"
            placeholder="Buscar recetas..."
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
            className="focus:ring-brand/20 w-64 rounded-full bg-muted py-2 pl-5 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2"
          />
        </div>

        <DrawerFiltros filtros={filtrosAvanzados} onChange={onFiltrosAvanzadosChange}>
          <button
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
              totalActivos > 0
                ? 'bg-brand/10 border-brand text-brand'
                : 'hover:bg-muted/80 border-border bg-muted text-muted-foreground'
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

      {/* Acciones */}
      <div className="flex items-center gap-3 justify-self-end">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
            U
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  )
}
