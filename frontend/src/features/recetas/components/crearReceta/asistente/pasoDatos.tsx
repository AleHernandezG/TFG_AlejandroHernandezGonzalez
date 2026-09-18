'use client'

import { useFormContext } from 'react-hook-form'
import { SelectorChips } from '@/components/common/selectorChips'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import {
  ETIQUETAS_DIFICULTAD,
  type DatosCrearReceta,
  type DificultadInterna,
} from '@/features/recetas/types/crearReceta.schema'

const DIFICULTADES: DificultadInterna[] = ['facil', 'media', 'dificil']

export function PasoDatos() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DatosCrearReceta>()

  return (
    <>
      <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
        <h2 className="text-base font-extrabold text-foreground mb-4">Información básica</h2>

        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Título *
          </label>
          <input
            {...register('titulo')}
            data-error={!!errors.titulo}
            placeholder="Ej. Paella valenciana"
            className={[
              'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-brand/40',
              errors.titulo ? 'border-destructive' : 'border-border',
            ].join(' ')}
          />
          {errors.titulo && (
            <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Descripción *
            </label>
            <span className="text-[10px] text-muted-foreground">
              {(watch('descripcion') ?? '').length}/300
            </span>
          </div>
          <textarea
            {...register('descripcion')}
            data-error={!!errors.descripcion}
            placeholder="Cuéntanos algo sobre esta receta..."
            maxLength={300}
            rows={3}
            className={[
              'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
              'placeholder:text-muted-foreground resize-none',
              'focus:outline-none focus:ring-2 focus:ring-brand/40',
              errors.descripcion ? 'border-destructive' : 'border-border',
            ].join(' ')}
          />
          {errors.descripcion && (
            <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Tiempo *
            </label>
            <div className="flex gap-2">
              <input
                {...register('tiempo', { valueAsNumber: true })}
                data-error={!!errors.tiempo}
                type="number"
                min={1}
                placeholder="30"
                className={[
                  'flex-1 min-w-0 bg-background border rounded-xl px-3 py-3 text-sm text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.tiempo ? 'border-destructive' : 'border-border',
                ].join(' ')}
              />
              <select
                {...register('unidadTiempo')}
                aria-label="Unidad de tiempo"
                className="w-16 bg-background border border-border rounded-xl px-2 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="min">min</option>
                <option value="h">h</option>
              </select>
            </div>
            {errors.tiempo && (
              <p className="text-xs text-destructive mt-1">{errors.tiempo.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Porciones *
            </label>
            <input
              {...register('porciones', { valueAsNumber: true })}
              data-error={!!errors.porciones}
              type="number"
              min={1}
              placeholder="4"
              className={[
                'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-brand/40',
                errors.porciones ? 'border-destructive' : 'border-border',
              ].join(' ')}
            />
            {errors.porciones && (
              <p className="text-xs text-destructive mt-1">{errors.porciones.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Dificultad *
          </label>
          <div className="flex gap-2">
            {DIFICULTADES.map((d) => {
              const activo = watch('dificultad') === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue('dificultad', d, { shouldValidate: true })}
                  className={[
                    'flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors',
                    activo
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-[var(--warm-bg)] text-muted-foreground hover:bg-[var(--warm-bg)]/80',
                  ].join(' ')}
                >
                  {ETIQUETAS_DIFICULTAD[d]}
                </button>
              )
            })}
          </div>
          {errors.dificultad && (
            <p className="text-xs text-destructive mt-1">{errors.dificultad.message}</p>
          )}
        </div>
      </section>

      <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
        <h2 className="text-base font-extrabold text-foreground mb-3">Tipo de receta</h2>
        <SelectorChips
          opciones={DIETAS_OPCIONES}
          seleccionados={watch('dietas') ?? []}
          onChange={(sel) => setValue('dietas', sel)}
        />
      </section>
    </>
  )
}
