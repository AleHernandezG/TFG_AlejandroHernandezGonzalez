'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search } from 'lucide-react'

interface HeaderHomePcProps {
  busqueda: string
  onBuscar: (query: string) => void
}

export function HeaderHomePc({ busqueda, onBuscar }: HeaderHomePcProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 hidden h-20 items-center bg-background/80 px-8 backdrop-blur-md shadow-[0px_4px_24px_var(--foreground)_/_0.05] lg:grid lg:grid-cols-3">
      {/* Logo */}
      <span className="justify-self-start text-2xl font-black uppercase tracking-widest text-brand">
        Cookr
      </span>

      {/* Search (centrado) */}
      <div className="relative justify-self-center">
        <Search
          className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.8}
        />
        <input
          type="search"
          placeholder="Buscar recetas..."
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
          className="w-80 rounded-full bg-muted py-2 pl-5 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4 justify-self-end">
        <Avatar className="h-9 w-9">
          {/* Phase 4: replace fallback with session user avatar */}
          <AvatarFallback className="bg-brand/10 text-sm font-semibold text-brand">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
