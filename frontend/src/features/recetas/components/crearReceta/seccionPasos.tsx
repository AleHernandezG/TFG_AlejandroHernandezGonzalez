'use client'

import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { DatosCrearReceta } from '../../types/crearReceta.schema'

export function SeccionPasos() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DatosCrearReceta>()

  const { fields, append, remove } = useFieldArray({ control, name: 'pasos' })

  function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
      <h2 className="text-base font-extrabold text-foreground mb-4">Pasos</h2>

      <div className="space-y-4">
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-3 items-start">
            {/* Drag handle visual */}
            <GripVertical size={18} className="text-muted-foreground shrink-0 mt-4 cursor-grab" />

            {/* Badge número */}
            <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-brand text-brand-foreground font-black text-xs mt-3">
              {i + 1}
            </div>

            {/* Textarea auto-resize */}
            <div className="flex-1">
              <textarea
                {...register(`pasos.${i}.texto`)}
                placeholder="Describe este paso con detalle..."
                rows={3}
                onInput={autoResize}
                className={[
                  'w-full min-h-[80px] bg-background border rounded-xl px-4 py-3.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground resize-none overflow-hidden',
                  'focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.pasos?.[i]?.texto ? 'border-destructive' : 'border-border',
                ].join(' ')}
              />
              {errors.pasos?.[i]?.texto && (
                <p className="text-xs text-destructive mt-1">
                  {errors.pasos[i]?.texto?.message}
                </p>
              )}
            </div>

            {/* Botón eliminar */}
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 mt-3.5"
                aria-label="Eliminar paso"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {errors.pasos && !Array.isArray(errors.pasos) && (
        <p className="text-xs text-destructive mt-2">{errors.pasos.message}</p>
      )}

      <button
        type="button"
        onClick={() => append({ texto: '' })}
        className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand hover:opacity-80 transition-opacity"
      >
        <Plus size={16} />
        Añadir paso
      </button>
    </section>
  )
}
