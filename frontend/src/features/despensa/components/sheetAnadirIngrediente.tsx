'use client'

import { useRef, useState } from 'react'
import { Search, AlertCircle, ScanLine, Loader2, CheckCircle2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/services/apiClient'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAutocompletadoIngredientes } from '@/features/recetas/hooks/useAutocompletadoIngredientes'
import { UNIDADES_INGREDIENTE } from '@/features/recetas/types/crearReceta.schema'
import { getEmojiIngrediente } from '@/features/despensa/data/datosDespensa'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'
import { normalizarYAgruparIngredientes } from '../utils/normalizadorIngredientes'

const SUGERENCIAS_RAPIDAS = ['Tomate', 'Cebolla', 'Ajo', 'Zanahoria', 'Patata', 'Huevos']

interface Props {
  abierto: boolean
  onCerrar: () => void
  onAnadir: (item: Omit<ItemDespensa, 'id'>) => void
  ingredientesExistentes: ItemDespensa[]
}

type IngredienteEscaneado = { nombre: string; cantidad: number; unidad: string }

export function SheetAnadirIngrediente({ abierto, onCerrar, onAnadir, ingredientesExistentes }: Props) {
  const { data: session } = useSession()
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [unidad, setUnidad] = useState('g')
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false)
  const [nombreDuplicado, setNombreDuplicado] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ticketInputRef = useRef<HTMLInputElement>(null)
  const { sugerencias } = useAutocompletadoIngredientes(nombre)
  const ingredientes = ingredientesExistentes

  const [escaneando, setEscaneando] = useState(false)
  const [ingredientesEscaneados, setIngredientesEscaneados] = useState<IngredienteEscaneado[] | null>(null)
  const [errorEscaneo, setErrorEscaneo] = useState<string | null>(null)

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

  async function handleTicketChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEscaneando(true)
    setErrorEscaneo(null)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const token = session?.user?.backendToken ?? ''
        const { data } = await apiClient.post<{ ingredientes: IngredienteEscaneado[] }>(
          '/despensa/escanear-ticket',
          { imagenBase64: reader.result as string },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!data.ingredientes.length) {
          setErrorEscaneo('No se detectaron ingredientes en el ticket.')
        } else {
          const procesados = normalizarYAgruparIngredientes(data.ingredientes)
          setIngredientesEscaneados(procesados)
        }
      } catch {
        setErrorEscaneo('No se pudo procesar la imagen. Inténtalo de nuevo.')
      } finally {
        setEscaneando(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function confirmarEscaneados() {
    if (!ingredientesEscaneados) return
    ingredientesEscaneados.forEach((ing) => {
      const yaExiste = ingredientes.some(
        (e) => e.nombre.toLowerCase() === ing.nombre.toLowerCase(),
      )
      if (!yaExiste) {
        onAnadir({ nombre: ing.nombre, cantidad: ing.cantidad, unidad: ing.unidad, emoji: getEmojiIngrediente(ing.nombre) })
      }
    })
    setIngredientesEscaneados(null)
    onCerrar()
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

          {/* Escanear ticket */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <input
              ref={ticketInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleTicketChange}
            />
            <button
              type="button"
              onClick={() => { setErrorEscaneo(null); ticketInputRef.current?.click() }}
              disabled={escaneando}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:border-brand/40 hover:text-brand disabled:opacity-50"
            >
              {escaneando ? (
                <><Loader2 size={16} className="animate-spin" />Escaneando ticket…</>
              ) : (
                <><ScanLine size={16} />Escanear ticket de compra</>
              )}
            </button>
            {errorEscaneo && <p className="text-xs text-destructive mt-2 text-center">{errorEscaneo}</p>}
          </div>

          {/* Lista ingredientes escaneados para confirmar */}
          {ingredientesEscaneados && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Ingredientes detectados
              </p>
              <ul className="flex flex-col gap-1.5 mb-4">
                {ingredientesEscaneados.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 size={14} className="text-brand shrink-0" />
                    <span className="flex-1">{ing.nombre}</span>
                    <span className="text-muted-foreground text-xs">{ing.cantidad} {ing.unidad}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIngredientesEscaneados(null)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-brand text-brand-foreground font-bold" onClick={confirmarEscaneados}>
                  Añadir todos
                </Button>
              </div>
            </div>
          )}
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
