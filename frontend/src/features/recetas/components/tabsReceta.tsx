'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { Ingrediente, MacrosReceta } from '../types/receta.types'

type Props = {
  ingredientes: Ingrediente[]
  macros: MacrosReceta
  porcionesBase: number
}

const MACROS_CONFIG = [
  { key: 'calorias' as const, label: 'Calorías', unidad: 'kcal' },
  { key: 'proteinas' as const, label: 'Proteínas', unidad: 'g' },
  { key: 'carbos' as const, label: 'Carbohidratos', unidad: 'g' },
  { key: 'grasas' as const, label: 'Grasas', unidad: 'g' },
]

export function TabsReceta({ ingredientes, macros, porcionesBase }: Props) {
  const [porciones, setPorciones] = useState(porcionesBase)
  const factor = porciones / porcionesBase

  function escalarCantidad(cantidad: number): string {
    const resultado = cantidad * factor
    return Number.isInteger(resultado) ? String(resultado) : resultado.toFixed(1)
  }

  return (
    <div className="px-5 pb-6 pt-4">
      {/* ── Ingredientes ──────────────────────────────── */}
      <h2 className="mb-4 text-xl font-extrabold text-foreground">Ingredientes</h2>

      {/* Ajustador porciones */}
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-[var(--warm-bg)] px-4 py-3">
        <span className="text-sm font-bold text-foreground">Porciones</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPorciones((p) => Math.max(1, p - 1))}
            disabled={porciones <= 1}
            aria-label="Reducir porciones"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-opacity disabled:opacity-40"
          >
            <Minus size={16} />
          </button>
          <span className="w-5 text-center text-base font-extrabold text-foreground">
            {porciones}
          </span>
          <button
            onClick={() => setPorciones((p) => p + 1)}
            aria-label="Aumentar porciones"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-opacity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Lista ingredientes */}
      <ul className="divide-border/40 mb-4 divide-y">
        {ingredientes.map((ing, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span className="flex-1 text-sm font-medium text-foreground">
              {ing.nombre}
            </span>
            <span className="shrink-0 text-sm font-bold text-muted-foreground">
              {escalarCantidad(ing.cantidad)} {ing.unidad}
            </span>
          </li>
        ))}
      </ul>

      {/* Link Añadir a despensa */}
      <button className="mb-8 flex w-full items-center justify-center text-sm font-bold text-brand transition-opacity hover:opacity-80">
        Comparar con mi despensa
      </button>

      {/* ── Nutrición ─────────────────────────────────── */}
      <h2 className="mb-1 text-xl font-extrabold text-foreground">Información nutricional</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Total de la receta para {porciones} porciones
      </p>

      <div className="grid grid-cols-2 gap-3">
        {MACROS_CONFIG.map(({ key, label, unidad }) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 rounded-2xl bg-[var(--warm-bg)] p-4 shadow-sm"
          >
            <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
              {label}
            </span>
            <span className="text-2xl font-extrabold leading-none text-foreground">
              {Math.round(macros[key] * factor)}
              <span className="text-xs text-muted-foreground">{unidad}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
