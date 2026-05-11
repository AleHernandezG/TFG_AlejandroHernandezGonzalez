'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

interface Props {
  item: ItemDespensa
  onEditar: () => void
  onEliminar: () => void
}

export function TarjetaIngrediente({ item, onEditar, onEliminar }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 32, transition: { duration: 0.18, ease: 'easeIn' } }}
      className="flex items-center gap-4 px-4 py-3.5 bg-card rounded-2xl shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.05)]"
    >
      {/* Avatar emoji */}
      <div className="h-12 w-12 rounded-full bg-[var(--warm-bg-accent)] flex-shrink-0 flex items-center justify-center text-2xl select-none">
        {item.emoji}
      </div>

      {/* Nombre + cantidad */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-tight truncate">{item.nombre}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.cantidad} {item.unidad}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEditar}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label={`Editar ${item.nombre}`}
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onEliminar}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={`Eliminar ${item.nombre}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  )
}
