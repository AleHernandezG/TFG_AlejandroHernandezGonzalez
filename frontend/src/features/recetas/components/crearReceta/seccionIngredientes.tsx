'use client'

import { useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { NOMBRES_INGREDIENTES } from '../../data/datosIngredientes'
import { UNIDADES_INGREDIENTE, type DatosCrearReceta } from '../../types/crearReceta.schema'

export function SeccionIngredientes() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<DatosCrearReceta>()

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredientes' })
  const [sugerencias, setSugerencias] = useState<{ idx: number; lista: string[] } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleNombreChange(idx: number, valor: string) {
    if (valor.length < 2) {
      setSugerencias(null)
      return
    }
    const filtradas = NOMBRES_INGREDIENTES.filter((n) =>
      n.toLowerCase().includes(valor.toLowerCase())
    ).slice(0, 6)
    setSugerencias(filtradas.length > 0 ? { idx, lista: filtradas } : null)
  }

  function seleccionarSugerencia(idx: number, nombre: string) {
    setValue(`ingredientes.${idx}.nombre`, nombre, { shouldValidate: true })
    setSugerencias(null)
  }

  return (
    <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
      <h2 className="text-base font-extrabold text-foreground mb-4">Ingredientes</h2>

      {/* Cabecera columnas */}
      <div className="grid grid-cols-[1fr_80px_90px_28px] gap-2 mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nombre</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cantidad</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unidad</span>
        <span />
      </div>

      <div className="space-y-3">
        {fields.map((field, i) => {
          const { ref: rhfRef, onChange: rhfOnChange, onBlur: rhfOnBlur, name } = register(`ingredientes.${i}.nombre`)
          return (
          <div key={field.id} className="relative">
            <div className="grid grid-cols-[1fr_80px_90px_28px] gap-2 items-start">
              {/* Nombre con autocompletado */}
              <div className="relative">
                <input
                  name={name}
                  ref={(el) => { rhfRef(el); inputRefs.current[i] = el }}
                  onChange={(e) => { rhfOnChange(e); handleNombreChange(i, e.target.value) }}
                  onBlur={(e) => { rhfOnBlur(e); setTimeout(() => setSugerencias(null), 150) }}
                  placeholder="Ej. Harina"
                  autoComplete="off"
                  className={[
                    'w-full bg-background border rounded-xl px-3 py-2.5 text-sm text-foreground',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-brand/40',
                    errors.ingredientes?.[i]?.nombre ? 'border-destructive' : 'border-border',
                  ].join(' ')}
                />
                {sugerencias?.idx === i && (
                  <ul className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-lg mt-1 overflow-hidden">
                    {sugerencias.lista.map((s) => (
                      <li
                        key={s}
                        onPointerDown={(e) => { e.preventDefault(); seleccionarSugerencia(i, s) }}
                        className="px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Cantidad */}
              <input
                {...register(`ingredientes.${i}.cantidad`)}
                placeholder="100"
                inputMode="decimal"
                className={[
                  'w-full bg-background border rounded-xl px-3 py-2.5 text-sm text-foreground text-center',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.ingredientes?.[i]?.cantidad ? 'border-destructive' : 'border-border',
                ].join(' ')}
              />

              {/* Unidad */}
              <select
                {...register(`ingredientes.${i}.unidad`)}
                className={[
                  'w-full bg-background border rounded-xl px-2 py-2.5 text-sm text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.ingredientes?.[i]?.unidad ? 'border-destructive' : 'border-border',
                ].join(' ')}
              >
                <option value="">–</option>
                {UNIDADES_INGREDIENTE.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              {/* Eliminar */}
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-0.5 mt-2"
                  aria-label="Eliminar ingrediente"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Errores fila */}
            {(errors.ingredientes?.[i]?.nombre ||
              errors.ingredientes?.[i]?.cantidad ||
              errors.ingredientes?.[i]?.unidad) && (
              <p className="text-xs text-destructive mt-1 pl-1">
                {errors.ingredientes?.[i]?.nombre?.message ||
                  errors.ingredientes?.[i]?.cantidad?.message ||
                  errors.ingredientes?.[i]?.unidad?.message}
              </p>
            )}
          </div>
          )
        })}
      </div>

      {errors.ingredientes && !Array.isArray(errors.ingredientes) && (
        <p className="text-xs text-destructive mt-2">{errors.ingredientes.message}</p>
      )}

      <button
        type="button"
        onClick={() => append({ nombre: '', cantidad: '', unidad: '' })}
        className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand hover:opacity-80 transition-opacity"
      >
        <Plus size={16} />
        Añadir ingrediente
      </button>
    </section>
  )
}
