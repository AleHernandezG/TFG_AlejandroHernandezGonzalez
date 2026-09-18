import type { ReactNode } from 'react'
import type { IngredientePrevisualizado } from './tipos'

interface Props {
  ingredientes: IngredientePrevisualizado[]
  meta?: ReactNode
}

export function IngredientesPrevisualizacion({ ingredientes, meta }: Props) {
  return (
    <div className="px-5 pb-6 pt-4">
      {meta}

      <h2 className="mb-4 text-xl font-extrabold text-foreground">
        Ingredientes ({ingredientes.length})
      </h2>
      <ul className="divide-border/40 divide-y">
        {ingredientes.map((ing, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span className="flex-1 text-sm font-medium text-foreground">{ing.nombre}</span>
            <span className="shrink-0 text-sm font-bold text-muted-foreground">
              {ing.cantidad} {ing.unidad}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
