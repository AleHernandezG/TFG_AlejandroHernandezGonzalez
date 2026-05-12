'use client'

import type { CategoriaDiscover } from '@/features/discover/types/discover.types'

interface Props {
  categorias: CategoriaDiscover[]
  activa: CategoriaDiscover
  onChange: (cat: CategoriaDiscover) => void
}

export function ChipsCategoria({ categorias, activa, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
      {categorias.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={[
            'shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
            cat === activa
              ? 'bg-brand text-brand-foreground'
              : 'bg-[var(--warm-bg-accent)] text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
