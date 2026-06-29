'use client'

import { useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Trash2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SelectorChips } from '@/components/common/selectorChips'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import { esquemaCrearReceta, ETIQUETAS_DIFICULTAD, type DatosCrearReceta, type DificultadInterna } from '../../types/crearReceta.schema'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import { SeccionIngredientes } from '../crearReceta/seccionIngredientes'
import { SeccionPasos } from '../crearReceta/seccionPasos'
import { SeccionAlergenos } from '../crearReceta/seccionAlergenos'
import { PopUpError } from '../crearReceta/popUpError'
import { useEditarReceta } from '../../hooks/useEditarReceta'
import type { RecetaDetalle } from '../../types/receta.types'
import { normalizarNombreIngrediente } from '@/features/despensa/utils/normalizadorIngredientes'

const DIFICULTADES: DificultadInterna[] = ['facil', 'media', 'dificil']

const MAPA_DIFICULTAD_INVERSO: Record<string, DificultadInterna> = {
  'Fácil': 'facil',
  'Media': 'media',
  'Difícil': 'dificil',
}

function parsearTiempo(tiempoStr: string): { tiempo: number; unidadTiempo: 'min' | 'h' } {
  const partes = tiempoStr.trim().split(' ')
  const valor = parseInt(partes[0], 10) || 30
  const unidad = partes[1] === 'h' ? 'h' : 'min'
  return { tiempo: valor, unidadTiempo: unidad }
}

function extraerMensajesError(errors: ReturnType<typeof useForm>['formState']['errors']): string[] {
  const msgs: string[] = []
  if (errors.titulo) msgs.push(`Título: ${errors.titulo.message}`)
  if (errors.descripcion) msgs.push(`Descripción: ${errors.descripcion.message}`)
  if (errors.porciones) msgs.push(`Porciones: ${errors.porciones.message}`)
  if (errors.tiempo) msgs.push(`Tiempo: ${errors.tiempo.message}`)
  if (errors.dificultad) msgs.push(`Dificultad: ${errors.dificultad.message}`)
  if (errors.ingredientes) {
    if (!Array.isArray(errors.ingredientes) && errors.ingredientes.message) {
      msgs.push(`Ingredientes: ${errors.ingredientes.message}`)
    } else {
      msgs.push('Ingredientes: revisa que todos tengan nombre, cantidad y unidad')
    }
  }
  if (errors.pasos) {
    if (!Array.isArray(errors.pasos) && errors.pasos.message) {
      msgs.push(`Pasos: ${errors.pasos.message}`)
    } else {
      msgs.push('Pasos: cada paso debe tener al menos 10 caracteres')
    }
  }
  return msgs
}

interface Props {
  receta: RecetaDetalle
}

export function FormularioEditarReceta({ receta }: Props) {
  const router = useRouter()
  const { guardar, guardando, error } = useEditarReceta(receta.id)

  const { tiempo, unidadTiempo } = parsearTiempo(receta.receta.tiempo)
  const dificultadInterna = MAPA_DIFICULTAD_INVERSO[receta.receta.dificultad] ?? 'media'

  const [fotoUrl, setFotoUrl] = useState<string | null>(
    receta.receta.imagenUrl && !receta.receta.imagenUrl.startsWith('http') ? receta.receta.imagenUrl : null,
  )
  const [fotoExistente] = useState<string | null>(
    receta.receta.imagenUrl ?? null,
  )
  const [mostrarError, setMostrarError] = useState(false)
  const inputFotoRef = useRef<HTMLInputElement>(null)

  const methods = useForm<DatosCrearReceta>({
    resolver: zodResolver(esquemaCrearReceta),
    defaultValues: {
      titulo: receta.receta.titulo,
      descripcion: receta.receta.descripcion,
      ingredientes: receta.ingredientes.map((ing) => ({
        nombre: ing.nombre,
        cantidad: String(ing.cantidad),
        unidad: ing.unidad,
      })),
      pasos: receta.pasos.map((texto) => ({ texto })),
      porciones: receta.porciones,
      dificultad: dificultadInterna,
      tiempo,
      unidadTiempo,
      dietas: receta.categorias ?? [],
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods

  const ingredientesActuales = watch('ingredientes') ?? []
  const alergenosDetectados = detectarAlergenos(ingredientesActuales.map((i) => i.nombre).filter(Boolean))

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    setValue('foto', file)
  }

  function onSubmitValido(datos: DatosCrearReceta) {
    const ingredientesNormalizados = datos.ingredientes.map((ing) => ({
      ...ing,
      nombre: normalizarNombreIngrediente(ing.nombre),
    }))
    guardar({
      ...datos,
      ingredientes: ingredientesNormalizados,
    }, fotoUrl)
  }

  function onSubmitInvalido() {
    setMostrarError(true)
  }

  function handleCorregir() {
    setMostrarError(false)
    const primerError = document.querySelector('[data-error="true"]')
    if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const fotoMostrada = fotoUrl ?? fotoExistente

  return (
    <>
      <PopUpError
        abierto={mostrarError}
        errores={extraerMensajesError(errors)}
        onCorregir={handleCorregir}
      />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitValido, onSubmitInvalido)}
          className="flex flex-col gap-4 bg-[var(--warm-bg)] rounded-3xl p-3 pb-8"
          noValidate
        >
          {/* Foto */}
          <section className="bg-[var(--warm-bg-accent)] rounded-2xl overflow-hidden shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
            {fotoMostrada ? (
              <div className="relative h-52 w-full">
                <Image
                  src={fotoMostrada}
                  alt="Foto de la receta"
                  fill
                  className="object-cover"
                  unoptimized={fotoMostrada.startsWith('data:') || fotoMostrada.startsWith('blob:')}
                />
                <button
                  type="button"
                  onClick={() => { setFotoUrl(null); setValue('foto', undefined) }}
                  className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg text-white"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => inputFotoRef.current?.click()}
                  className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg text-white"
                >
                  <Camera size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputFotoRef.current?.click()}
                className="w-full h-44 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <Camera size={32} />
                <span className="text-sm font-medium">Añadir foto</span>
              </button>
            )}
          </section>

          {/* Información básica */}
          <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
            <h2 className="text-base font-extrabold text-foreground mb-4">Información básica</h2>

            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Título *</label>
              <input
                {...register('titulo')}
                data-error={!!errors.titulo}
                placeholder="Ej. Paella valenciana"
                className={[
                  'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.titulo ? 'border-destructive' : 'border-border',
                ].join(' ')}
              />
              {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descripción *</label>
                <span className="text-[10px] text-muted-foreground">{(watch('descripcion') ?? '').length}/300</span>
              </div>
              <textarea
                {...register('descripcion')}
                data-error={!!errors.descripcion}
                placeholder="Cuéntanos algo sobre esta receta..."
                maxLength={300}
                rows={3}
                className={[
                  'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
                  'placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand/40',
                  errors.descripcion ? 'border-destructive' : 'border-border',
                ].join(' ')}
              />
              {errors.descripcion && <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Tiempo *</label>
                <div className="flex gap-2">
                  <input
                    {...register('tiempo', { valueAsNumber: true })}
                    data-error={!!errors.tiempo}
                    type="number"
                    min={1}
                    placeholder="30"
                    className={[
                      'flex-1 bg-background border rounded-xl px-3 py-3 text-sm text-foreground',
                      'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40',
                      errors.tiempo ? 'border-destructive' : 'border-border',
                    ].join(' ')}
                  />
                  <select
                    {...register('unidadTiempo')}
                    className="w-16 bg-background border border-border rounded-xl px-2 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="min">min</option>
                    <option value="h">h</option>
                  </select>
                </div>
                {errors.tiempo && <p className="text-xs text-destructive mt-1">{errors.tiempo.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Porciones *</label>
                <input
                  {...register('porciones', { valueAsNumber: true })}
                  data-error={!!errors.porciones}
                  type="number"
                  min={1}
                  placeholder="4"
                  className={[
                    'w-full bg-background border rounded-xl px-3.5 py-3 text-sm text-foreground',
                    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40',
                    errors.porciones ? 'border-destructive' : 'border-border',
                  ].join(' ')}
                />
                {errors.porciones && <p className="text-xs text-destructive mt-1">{errors.porciones.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Dificultad *</label>
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
              {errors.dificultad && <p className="text-xs text-destructive mt-1">{errors.dificultad.message}</p>}
            </div>
          </section>

          {/* Tipo de receta */}
          <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
            <h2 className="text-base font-extrabold text-foreground mb-3">Tipo de receta</h2>
            <SelectorChips
              opciones={DIETAS_OPCIONES}
              seleccionados={watch('dietas') ?? []}
              onChange={(sel) => setValue('dietas', sel)}
            />
          </section>

          <SeccionIngredientes />
          <SeccionPasos />
          <SeccionAlergenos alergenosDetectados={alergenosDetectados} />

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={guardando}
              className="flex-1 h-12 rounded-xl bg-brand text-brand-foreground font-bold"
            >
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive text-center px-5">{error}</p>}
        </form>
      </FormProvider>
    </>
  )
}
