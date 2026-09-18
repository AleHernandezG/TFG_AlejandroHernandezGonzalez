'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider, type DefaultValues, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotebookPen, Pencil, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'
import { subidasService } from '@/services/subidasService'
import { Button } from '@/components/ui/button'
import { useCrearRecetaStore, type BorradorReceta } from '@/stores/useCrearRecetaStore'
import { esquemaCrearReceta, type DatosCrearReceta } from '../../types/crearReceta.schema'
import { normalizarNombreIngrediente } from '@/features/despensa/utils/normalizadorIngredientes'
import { PopUpTutorial } from './popUpTutorial'
import { AsistenteCrearReceta, pasoConPrimerError, useAsistenteCrearReceta } from './asistente'
import { useMisRecetas } from '@/features/coleccion/hooks/useMisRecetas'

const VALORES_INICIALES: DefaultValues<DatosCrearReceta> = {
  titulo: '',
  descripcion: '',
  ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
  pasos: [{ texto: '' }],
  porciones: undefined,
  dificultad: undefined,
  tiempo: undefined,
  unidadTiempo: 'min',
  dietas: [],
}

function tieneContenido(b: BorradorReceta): boolean {
  if (b.titulo?.trim() || b.descripcion?.trim()) return true
  if (b.ingredientes?.some((i) => i.nombre?.trim())) return true
  if (b.pasos?.some((p) => p.texto?.trim())) return true
  return Boolean(b.tiempo || b.porciones || b.dificultad || b.dietas?.length)
}

function limpiarParaGuardar(valores: DatosCrearReceta): BorradorReceta {
  const { foto: _foto, ...resto } = valores
  return {
    ...resto,
    tiempo: Number.isFinite(resto.tiempo) ? resto.tiempo : undefined,
    porciones: Number.isFinite(resto.porciones) ? resto.porciones : undefined,
  }
}

export function FormularioCrearReceta() {
  const router = useRouter()
  const { data: session } = useSession()
  const { setDatos, setFoto, guardarBorrador, descartarBorrador } = useCrearRecetaStore()
  const { data: misRecetas, isLoading: cargandoRecetas } = useMisRecetas()

  const [mostrarTutorial, setMostrarTutorial] = useState(false)
  const [asistenteAbierto, setAsistenteAbierto] = useState(false)
  const [vistaAsistente, setVistaAsistente] = useState<'pasos' | 'ia'>('pasos')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [errorGeneracion, setErrorGeneracion] = useState<string | null>(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [errorFoto, setErrorFoto] = useState<string | null>(null)
  const [borradorRecuperado, setBorradorRecuperado] = useState(false)
  const temporizadorGuardado = useRef<ReturnType<typeof setTimeout>>()
  const bienvenidaResuelta = useRef(false)

  const methods = useForm<DatosCrearReceta>({
    resolver: zodResolver(esquemaCrearReceta),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: VALORES_INICIALES,
  })

  const asistente = useAsistenteCrearReceta(methods.trigger)

  useEffect(() => {
    if (cargandoRecetas || bienvenidaResuelta.current) return
    bienvenidaResuelta.current = true
    if ((misRecetas?.length ?? 1) === 0) setMostrarTutorial(true)
    else setAsistenteAbierto(true)
  }, [cargandoRecetas, misRecetas])

  useEffect(() => {
    const { borrador, fotoPreview } = useCrearRecetaStore.getState()
    if (!borrador || !tieneContenido(borrador)) return
    methods.reset({ ...VALORES_INICIALES, ...borrador })
    if (fotoPreview) setFotoUrl(fotoPreview)
    setBorradorRecuperado(true)
  }, [methods])

  useEffect(() => {
    const suscripcion = methods.watch((valores) => {
      clearTimeout(temporizadorGuardado.current)
      temporizadorGuardado.current = setTimeout(() => {
        const borrador = limpiarParaGuardar(valores as DatosCrearReceta)
        if (tieneContenido(borrador)) guardarBorrador(borrador)
      }, 600)
    })
    return () => {
      clearTimeout(temporizadorGuardado.current)
      suscripcion.unsubscribe()
    }
  }, [methods, guardarBorrador])

  function handleEmpezarDeCero() {
    clearTimeout(temporizadorGuardado.current)
    descartarBorrador()
    methods.reset(VALORES_INICIALES)
    setFotoUrl(null)
    setErrorFoto(null)
    setBorradorRecuperado(false)
    asistente.irAPaso(0)
  }

  async function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFotoUrl(URL.createObjectURL(file))
    methods.setValue('foto', file)
    setErrorFoto(null)
    setSubiendoFoto(true)

    try {
      const url = await subidasService.subirImagen(file, 'receta', session?.user?.backendToken ?? '')
      setFoto(url)
    } catch {
      setFotoUrl(null)
      setFoto(null)
      methods.setValue('foto', undefined)
      setErrorFoto('No se pudo subir la foto. Inténtalo de nuevo.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  function handleQuitarFoto() {
    setFotoUrl(null)
    setFoto(null)
    methods.setValue('foto', undefined)
    setErrorFoto(null)
  }

  function hayContenidoEscrito() {
    return tieneContenido(limpiarParaGuardar(methods.getValues()))
  }

  async function handleGenerarDesdeTexto(texto: string) {
    setGenerando(true)
    setErrorGeneracion(null)
    const token = session?.user?.backendToken ?? ''
    const generado = await recetasService.generarDesdeTexto(texto, token)
    setGenerando(false)

    if (!generado) {
      setErrorGeneracion('No se pudo generar la receta. Inténtalo con una descripción más detallada.')
      return false
    }

    if (Array.isArray(generado.ingredientes)) {
      generado.ingredientes = generado.ingredientes.map((ing) => ({
        ...ing,
        nombre: normalizarNombreIngrediente(ing.nombre),
      }))
    }

    methods.reset({ ...VALORES_INICIALES, ...generado })
    setBorradorRecuperado(false)
    asistente.irAPaso(1)
    return true
  }

  function onSubmitValido(datos: DatosCrearReceta) {
    const ingredientesNormalizados = datos.ingredientes.map((ing) => ({
      ...ing,
      nombre: normalizarNombreIngrediente(ing.nombre),
    }))
    setDatos({
      ...datos,
      ingredientes: ingredientesNormalizados,
    })
    router.push('/crear-receta/revisar')
  }

  function onSubmitInvalido(errores: FieldErrors<DatosCrearReceta>) {
    asistente.irAPaso(pasoConPrimerError(errores))
  }

  function abrirAsistente(vista: 'pasos' | 'ia' = 'pasos') {
    setVistaAsistente(vista)
    setAsistenteAbierto(true)
  }

  function handleBorrarYSalir() {
    clearTimeout(temporizadorGuardado.current)
    useCrearRecetaStore.getState().limpiar()
    router.push('/home')
  }

  const empezada = borradorRecuperado || fotoUrl !== null || hayContenidoEscrito()

  return (
    <FormProvider {...methods}>
      <PopUpTutorial
        abierto={mostrarTutorial}
        onAceptar={() => { setMostrarTutorial(false); abrirAsistente() }}
        onSaltar={() => { setMostrarTutorial(false); abrirAsistente() }}
      />

      <div className="rounded-3xl bg-[var(--warm-bg)] p-8 text-center shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
          <NotebookPen size={26} className="text-brand" />
        </div>
        <h2 className="text-lg font-extrabold text-foreground">
          {empezada ? 'Tienes una receta a medias' : 'Te lo preguntamos paso a paso'}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {empezada
            ? 'Retoma el asistente donde lo dejaste. No se ha borrado nada.'
            : 'La foto, los datos, los ingredientes y los pasos, de uno en uno. Al final la revisas antes de publicar.'}
        </p>
        <Button
          type="button"
          onClick={() => abrirAsistente()}
          className="mt-5 h-12 rounded-xl bg-brand px-8 font-bold text-brand-foreground hover:bg-brand/90"
        >
          <Pencil size={16} />
          {empezada ? 'Seguir con la receta' : 'Empezar la receta'}
        </Button>
        <button
          type="button"
          onClick={() => abrirAsistente('ia')}
          className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-bold text-brand transition-opacity hover:opacity-80"
        >
          <Sparkles size={14} />
          Crear desde descripción (IA)
        </button>
      </div>

      <AsistenteCrearReceta
        abierto={asistenteAbierto}
        vistaInicial={vistaAsistente}
        onCerrar={() => setAsistenteAbierto(false)}
        asistente={asistente}
        enviando={subiendoFoto}
        onEnviar={methods.handleSubmit(onSubmitValido, onSubmitInvalido)}
        borradorRecuperado={borradorRecuperado}
        onEmpezarDeCero={handleEmpezarDeCero}
        onBorrarYSalir={handleBorrarYSalir}
        foto={{
          url: fotoUrl,
          subiendo: subiendoFoto,
          error: errorFoto,
          onArchivo: handleFotoChange,
          onQuitar: handleQuitarFoto,
        }}
        ia={{
          generando,
          error: errorGeneracion,
          hayContenido: hayContenidoEscrito,
          onGenerar: handleGenerarDesdeTexto,
        }}
      />
    </FormProvider>
  )
}
