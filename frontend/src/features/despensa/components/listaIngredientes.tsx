'use client'

import { AnimatePresence } from 'framer-motion'
import { TarjetaIngrediente } from './tarjetaIngrediente'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

interface Props {
  ingredientes: ItemDespensa[]
  onEditar: (item: ItemDespensa) => void
  onEliminar: (id: string) => void
}

export function ListaIngredientes({ ingredientes, onEditar, onEliminar }: Props) {
  return (
    <div className="px-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={false}>
        {ingredientes.map((item) => (
          <TarjetaIngrediente
            key={item.id}
            item={item}
            onEditar={() => onEditar(item)}
            onEliminar={() => onEliminar(item.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
