'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Minus, Plus } from 'lucide-react'
import type { Ingrediente, MacrosReceta } from '../types/receta.types'

type Props = {
  ingredientes: Ingrediente[]
  macros: MacrosReceta
  porcionesBase: number
}

const MACROS_CONFIG = [
  { key: 'calorias'  as const, label: 'Calorías',      unidad: 'kcal' },
  { key: 'proteinas' as const, label: 'Proteínas',     unidad: 'g'    },
  { key: 'carbos'    as const, label: 'Carbohidratos', unidad: 'g'    },
  { key: 'grasas'    as const, label: 'Grasas',        unidad: 'g'    },
]

export function TabsReceta({ ingredientes, macros, porcionesBase }: Props) {
  const [porciones, setPorciones] = useState(porcionesBase)
  const factor = porciones / porcionesBase

  function escalarCantidad(cantidad: number): string {
    const resultado = cantidad * factor
    return Number.isInteger(resultado) ? String(resultado) : resultado.toFixed(1)
  }

  return (
    <div className="px-5 pt-4 pb-6">
      {/* ── Ingredientes ──────────────────────────────── */}
      <h2 className="text-xl font-extrabold text-foreground mb-4">Ingredientes</h2>

      {/* Ajustador porciones */}
      <div className="flex items-center justify-between mb-4 bg-[var(--warm-bg)] rounded-2xl px-4 py-3">
        <span className="text-sm font-bold text-foreground">Porciones</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPorciones((p) => Math.max(1, p - 1))}
            disabled={porciones <= 1}
            aria-label="Reducir porciones"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-background text-foreground shadow-sm disabled:opacity-40 transition-opacity"
          >
            <Minus size={16} />
          </button>
          <span className="text-base font-extrabold text-foreground w-5 text-center">
            {porciones}
          </span>
          <button
            onClick={() => setPorciones((p) => p + 1)}
            aria-label="Aumentar porciones"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-opacity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Lista ingredientes */}
      <ul className="divide-y divide-border/40 mb-4">
        {ingredientes.map((ing, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <Checkbox id={`ing-${i}`} className="shrink-0" />
            <label
              htmlFor={`ing-${i}`}
              className="flex-1 text-sm font-medium text-foreground cursor-pointer"
            >
              {ing.nombre}
            </label>
            <span className="text-sm font-bold text-muted-foreground shrink-0">
              {escalarCantidad(ing.cantidad)} {ing.unidad}
            </span>
          </li>
        ))}
      </ul>

      {/* Link Añadir a despensa */}
      <button className="text-brand text-sm font-bold hover:opacity-80 transition-opacity mb-8">
        + Añadir a mi despensa
      </button>

      {/* ── Nutrición ─────────────────────────────────── */}
      <h2 className="text-xl font-extrabold text-foreground mb-1">Información nutricional</h2>
      <p className="text-xs text-muted-foreground mb-4">Por porción</p>

      <div className="grid grid-cols-2 gap-3">
        {MACROS_CONFIG.map(({ key, label, unidad }) => (
          <div
            key={key}
            className="bg-[var(--warm-bg)] rounded-2xl p-4 flex flex-col gap-0.5 shadow-sm"
          >
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {label}
            </span>
            <span className="text-2xl font-extrabold text-foreground leading-none">
              {Math.round(macros[key] * factor)}
            </span>
            <span className="text-xs text-muted-foreground">{unidad}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
