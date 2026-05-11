'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UNIDADES_INGREDIENTE } from '@/features/recetas/types/crearReceta.schema'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

interface Props {
  item: ItemDespensa
  onCerrar: () => void
  onGuardar: (cambios: Partial<Omit<ItemDespensa, 'id'>>) => void
}

export function DialogEditarIngrediente({ item, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState(item.nombre)
  const [cantidad, setCantidad] = useState(item.cantidad.toString())
  const [unidad, setUnidad] = useState(item.unidad)

  const puedeGuardar = nombre.trim().length >= 2 && Number(cantidad) > 0

  function handleGuardar() {
    if (!puedeGuardar) return
    onGuardar({ nombre: nombre.trim(), cantidad: Number(cantidad), unidad })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <span className="text-2xl">{item.emoji}</span>
            Editar ingrediente
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Nombre */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-[var(--warm-bg)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>

          {/* Cantidad + unidad */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Cantidad
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min={0}
                className="flex-1 bg-[var(--warm-bg)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 text-center"
              />
              <select
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="flex-[2] bg-[var(--warm-bg)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none appearance-none text-center cursor-pointer"
              >
                {UNIDADES_INGREDIENTE.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-xl bg-brand text-brand-foreground"
            onClick={handleGuardar}
            disabled={!puedeGuardar}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
