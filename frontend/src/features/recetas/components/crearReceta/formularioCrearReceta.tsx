'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SelectorChips } from '@/components/common/selectorChips'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'
import { esquemaCrearReceta, ETIQUETAS_DIFICULTAD, type DatosCrearReceta, type DificultadInterna } from '../../types/crearReceta.schema'
import { detectarAlergenos } from '../../utils/detectarAlergenos'
import { SeccionIngredientes } from './seccionIngredientes'
import { SeccionPasos } from './seccionPasos'
import { SeccionAlergenos } from './seccionAlergenos'
import { PopUpTutorial } from './popUpTutorial'
import { TutorialCrearReceta } from './tutorialCrearReceta'
import { PopUpError } from './popUpError'

const MOCK_ES_PRIMER_USUARIO = false

const DIFICULTADES: DificultadInterna[] = ['facil', 'media', 'dificil']

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

export function FormularioCrearReceta() {
  const router = useRouter()
  const { setDatos, setFoto } = useCrearRecetaStore()

  const [mostrarTutorial, setMostrarTutorial] = useState(false)
  const [mostrarStepper, setMostrarStepper] = useState(false)
  const [mostrarError, setMostrarError] = useState(false)
  const [mostrarDialogSalir, setMostrarDialogSalir] = useState(false)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const inputFotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (MOCK_ES_PRIMER_USUARIO) setMostrarTutorial(true)
  }, [])

  const methods = useForm<DatosCrearReceta>({
    resolver: zodResolver(esquemaCrearReceta),
    defaultValues: {
      titulo: '',
      descripcion: '',
      ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
      pasos: [{ texto: '' }],
      porciones: undefined,
      dificultad: undefined,
      tiempo: undefined,
      unidadTiempo: 'min',
      dietas: [],
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods

  const ingredientesActuales = watch('ingredientes') ?? []
  const alergenosDetectados = detectarAlergenos(
    ingredientesActuales.map((i) => i.nombre).filter(Boolean)
  )

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFotoUrl(url)
    setFoto(url)
    setValue('foto', file)
  }

  function onSubmitValido(datos: DatosCrearReceta) {
    setDatos(datos)
    router.push('/crear-receta/revisar')
  }

  function onSubmitInvalido() {
    setMostrarError(true)
  }

  function handleCorregir() {
    setMostrarError(false)
    const primerError = document.querySelector('[data-error="true"]')
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleBorrarYSalir() {
    useCrearRecetaStore.getState().limpiar()
    router.push('/home')
  }

  if (mostrarStepper) {
    return <TutorialCrearReceta onTerminar={() => setMostrarStepper(false)} />
  }

  return (
    <>
      <PopUpTutorial
        abierto={mostrarTutorial}
        onAceptar={() => { setMostrarTutorial(false); setMostrarStepper(true) }}
        onSaltar={() => setMostrarTutorial(false)}
      />

      <PopUpError
        abierto={mostrarError}
        errores={extraerMensajesError(errors)}
        onCorregir={handleCorregir}
      />

      {/* Dialog confirmación borrar */}
      <Dialog open={mostrarDialogSalir} onOpenChange={setMostrarDialogSalir}>
        <DialogContent className="max-w-sm rounded-2xl bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-foreground">¿Borrar receta?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Perderás todos los cambios realizados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setMostrarDialogSalir(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleBorrarYSalir}
            >
              Borrar y salir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmitValido, onSubmitInvalido)}
          className="flex flex-col gap-5 pb-8"
          noValidate
        >
          {/* ── Foto ── */}
          <section className="bg-card rounded-2xl overflow-hidden shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
            {fotoUrl ? (
              <div className="relative h-52 w-full">
                <Image src={fotoUrl} alt="Preview receta" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setFotoUrl(null); setFoto(null); setValue('foto', undefined) }}
                  className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg text-white"
                >
                  <Trash2 size={16} />
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

          {/* ── Información básica ── */}
          <section className="bg-card rounded-2xl p-5 shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
            <h2 className="text-base font-extrabold text-foreground mb-4">Información básica</h2>

            {/* Título */}
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

            {/* Descripción */}
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

            {/* Tiempo + dificultad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Tiempo */}
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
                      'flex-1 bg-background border rounded-xl px-3 py-3 text-sm text-foreground',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-brand/40',
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
                {errors.tiempo && (
                  <p className="text-xs text-destructive mt-1">{errors.tiempo.message}</p>
                )}
              </div>

              {/* Porciones */}
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

            {/* Dificultad */}
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
                          : 'bg-muted text-muted-foreground hover:bg-muted/80',
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

          {/* ── Tipo de receta ── */}
          <section className="bg-card rounded-2xl p-5 shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
            <h2 className="text-base font-extrabold text-foreground mb-3">Tipo de receta</h2>
            <SelectorChips
              opciones={DIETAS_OPCIONES}
              seleccionados={watch('dietas') ?? []}
              onChange={(sel) => setValue('dietas', sel)}
            />
          </section>

          {/* ── Ingredientes ── */}
          <SeccionIngredientes />

          {/* ── Pasos ── */}
          <SeccionPasos />

          {/* ── Alérgenos ── */}
          <SeccionAlergenos alergenosDetectados={alergenosDetectados} />

          {/* ── Botones ── */}
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarDialogSalir(true)}
              className="flex-1 h-12 rounded-xl text-destructive border-destructive/40 font-bold"
            >
              Borrar y salir
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-brand text-brand-foreground font-bold"
            >
              Revisar receta
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  )
}
