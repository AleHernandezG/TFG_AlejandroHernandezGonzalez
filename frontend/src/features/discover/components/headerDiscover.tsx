'use client'

import { Search, X } from 'lucide-react'

interface Props {
  query: string
  onChange: (q: string) => void
}

export function HeaderDiscover({ query, onChange }: Props) {
  const buscando = query.length > 0

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

      {/* Barra de búsqueda */}
      <div className="relative flex items-center">
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
    </header>
  )
}
