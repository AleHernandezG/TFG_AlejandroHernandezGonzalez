'use client'

import { Plus } from 'lucide-react'

interface Props {
  onAbrir: () => void
}

export function BarraAnadirIngrediente({ onAbrir }: Props) {
  return (
    <button
      onClick={onAbrir}
      className="w-full flex items-center gap-3 bg-[var(--warm-bg)] rounded-2xl px-5 py-4 text-left hover:bg-[var(--warm-bg-accent)] transition-colors shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.12)]"
    >
      <span className="flex-1 text-sm text-muted-foreground">
        ¿Quieres añadir algún alimento?
      </span>
      <span className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
        <Plus size={18} />
      </span>
    </button>
  )
}
