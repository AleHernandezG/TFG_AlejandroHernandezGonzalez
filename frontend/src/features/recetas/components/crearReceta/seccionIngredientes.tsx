'use client'

import { useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useAutocompletadoIngredientes } from '@/features/recetas/hooks/useAutocompletadoIngredientes'
import { UNIDADES_INGREDIENTE, type DatosCrearReceta } from '../../types/crearReceta.schema'

export function SeccionIngredientes() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<DatosCrearReceta>()

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredientes' })
  const [inputActivo, setInputActivo] = useState<{ idx: number; query: string } | null>(null)
  const { sugerencias } = useAutocompletadoIngredientes(inputActivo?.query ?? '')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleNombreChange(idx: number, valor: string) {
    setInputActivo(valor.length >= 2 ? { idx, query: valor } : null)
  }

  function seleccionarSugerencia(idx: number, nombre: string) {
    setValue(`ingredientes.${idx}.nombre`, nombre, { shouldValidate: true })
    setInputActivo(null)
  }

  return (
    <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
      <h2 className="text-base font-extrabold text-foreground mb-4">Ingredientes</h2>

      <div className="space-y-3">
        {fields.map((field, i) => {
          const { ref: rhfRef, onChange: rhfOnChange, onBlur: rhfOnBlur, name } = register(`ingredientes.${i}.nombre`)
          return (
            <div key={field.id} className="relative">
              {/* Card por ingrediente */}
              <div className={[
                'rounded-xl bg-background border overflow-hidden',
                (errors.ingredientes?.[i]?.nombre || errors.ingredientes?.[i]?.cantidad || errors.ingredientes?.[i]?.unidad)
                  ? 'border-destructive'
                  : 'border-border',
              ].join(' ')}>

                {/* Fila 1: Nombre + Trash */}
                <div className="flex items-center gap-2 px-4 relative">
                  <div className="flex-1 relative">
                    <input
                      name={name}
                      ref={(el) => { rhfRef(el); inputRefs.current[i] = el }}
                      onChange={(e) => { rhfOnChange(e); handleNombreChange(i, e.target.value) }}
                      onBlur={(e) => { rhfOnBlur(e); setTimeout(() => setInputActivo(null), 150) }}
                      placeholder="Ej. Harina de trigo"
                      autoComplete="off"
                      className="w-full h-12 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {sugerencias.length > 0 && inputActivo?.idx === i && (
                      <ul className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-lg mt-1 overflow-hidden">
                        {sugerencias.map((s) => (
                          <li
                            key={s.nombre}
                            onPointerDown={(e) => { e.preventDefault(); seleccionarSugerencia(i, s.nombre) }}
                            className="px-4 py-3 text-sm text-foreground hover:bg-muted cursor-pointer"
                          >
                            {s.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Eliminar ingrediente"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Separador */}
                <div className="h-px bg-border/50" />

                {/* Fila 2: Cantidad + Unidad */}
                <div className="flex divide-x divide-border/50">
                  <div className="flex-1 px-4 py-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      Cantidad
                    </span>
                    <input
                      {...register(`ingredientes.${i}.cantidad`)}
                      placeholder="100"
                      inputMode="decimal"
                      className={[
                        'w-full h-10 bg-transparent text-sm text-foreground',
                        'placeholder:text-muted-foreground focus:outline-none',
                        errors.ingredientes?.[i]?.cantidad ? 'text-destructive' : '',
                      ].join(' ')}
                    />
                  </div>
                  <div className="flex-1 px-4 py-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      Unidad
                    </span>
                    <select
                      {...register(`ingredientes.${i}.unidad`)}
                      className={[
                        'w-full h-10 bg-transparent text-sm text-foreground focus:outline-none',
                        errors.ingredientes?.[i]?.unidad ? 'text-destructive' : '',
                      ].join(' ')}
                    >
                      <option value="">–</option>
                      {UNIDADES_INGREDIENTE.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Error inline */}
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
