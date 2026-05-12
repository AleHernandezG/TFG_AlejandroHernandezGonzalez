'use client'

import { useRef, useState } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAutocompletadoIngredientes } from '@/features/recetas/hooks/useAutocompletadoIngredientes'
import { UNIDADES_INGREDIENTE } from '@/features/recetas/types/crearReceta.schema'
import { getEmojiIngrediente } from '@/features/despensa/data/datosDespensa'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

const SUGERENCIAS_RAPIDAS = ['Tomate', 'Cebolla', 'Ajo', 'Zanahoria', 'Patata', 'Huevos']

interface Props {
  abierto: boolean
  onCerrar: () => void
  onAnadir: (item: Omit<ItemDespensa, 'id'>) => void
  ingredientesExistentes: ItemDespensa[]
}

export function SheetAnadirIngrediente({ abierto, onCerrar, onAnadir, ingredientesExistentes }: Props) {
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('g')
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false)
  const [nombreDuplicado, setNombreDuplicado] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { sugerencias } = useAutocompletadoIngredientes(nombre)
  const ingredientes = ingredientesExistentes

  const puedeAnadir = nombre.trim().length >= 2 && Number(cantidad) > 0

  function handleSeleccionarNombre(valor: string) {
    setNombre(valor)
    setMostrandoSugerencias(false)
  }

  function handleAnadir() {
    if (!puedeAnadir) return

    const nombreTrimmed = nombre.trim()
    const yaExiste = ingredientes.some(
      (ing) => ing.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
    )

    if (yaExiste) {
      setNombreDuplicado(nombreTrimmed)
      return
    }

    onAnadir({
      nombre: nombreTrimmed,
      cantidad: Number(cantidad),
      unidad,
      emoji: getEmojiIngrediente(nombreTrimmed),
    })
    resetear()
  }

  function resetear() {
    setNombre('')
    setCantidad('')
    setUnidad('g')
    setMostrandoSugerencias(false)
  }

  function handleCerrar() {
    resetear()
    onCerrar()
  }

  return (
    <>
      <Sheet open={abierto} onOpenChange={(open) => !open && handleCerrar()}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-10 px-5 max-h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-6 pt-2">
            <SheetTitle className="text-xl font-extrabold text-foreground text-left">
              Añadir ingrediente
            </SheetTitle>
          </SheetHeader>

          {/* Nombre */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Nombre del ingrediente
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 bg-[var(--warm-bg)] rounded-2xl px-4 py-3.5">
                <Search size={16} className="text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setMostrandoSugerencias(true)
                  }}
                  onFocus={() => setMostrandoSugerencias(true)}
                  onBlur={() => setTimeout(() => setMostrandoSugerencias(false), 150)}
                  placeholder="Ej. Tomate"
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {mostrandoSugerencias && sugerencias.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {sugerencias.slice(0, 5).map((s) => (
                    <li
                      key={s.nombre}
                      onPointerDown={(e) => { e.preventDefault(); handleSeleccionarNombre(s.nombre) }}
                      className="px-4 py-3 text-sm text-foreground hover:bg-muted cursor-pointer"
                    >
                      {s.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Chips rápidas — solo cuando el input está vacío */}
            {!nombre && (
              <div className="flex flex-wrap gap-2 mt-3">
                {SUGERENCIAS_RAPIDAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSeleccionarNombre(s)}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--warm-bg)] text-xs font-medium text-foreground/80 hover:bg-[var(--warm-bg-accent)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="mb-8">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Cantidad
            </label>
            <div className="flex gap-3">
              <div className="flex-1 bg-[var(--warm-bg)] rounded-2xl px-4 py-3.5">
                <input
                  type="number"
                  inputMode="decimal"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none text-center font-medium"
                />
              </div>
              <div className="flex-[2] bg-[var(--warm-bg)] rounded-2xl px-4 py-3.5">
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground focus:outline-none appearance-none text-center font-medium cursor-pointer"
                >
                  {UNIDADES_INGREDIENTE.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botones */}
          <Button
            onClick={handleAnadir}
            disabled={!puedeAnadir}
            className="w-full h-12 rounded-2xl bg-brand text-brand-foreground font-bold text-base"
          >
            Añadir
          </Button>
          <button
            onClick={handleCerrar}
            className="w-full mt-3 py-3 text-sm font-bold text-brand hover:opacity-70 transition-opacity"
          >
            Cancelar
          </button>
        </SheetContent>
      </Sheet>

      {/* Popup ingrediente duplicado */}
      <Dialog open={!!nombreDuplicado} onOpenChange={(open) => !open && setNombreDuplicado(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--warm-bg)]">
                <AlertCircle size={20} className="text-brand" />
              </div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Ingrediente duplicado
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">«{nombreDuplicado}»</span> ya está en
            tu despensa. Si quieres modificarlo, edítalo o elimínalo directamente desde la lista.
          </p>
          <Button
            onClick={() => setNombreDuplicado(null)}
            className="mt-2 w-full h-11 rounded-xl bg-brand text-brand-foreground font-bold"
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
