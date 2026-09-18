'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Headphones, ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import { useCrearReceta } from '@/features/recetas/hooks/useCrearReceta'
import { useFotoPexelsPreview } from '@/features/recetas/hooks/useFotoPexelsPreview'
import { useModoManoLibres } from '@/features/recetas/hooks/useModoManoLibres'
import {
  HeroPrevisualizacion,
  CabeceraPrevisualizacion,
  MetaPrevisualizacion,
  IngredientesPrevisualizacion,
  NutricionPrevisualizacion,
  PasosPrevisualizacion,
  AlergenosPrevisualizacion,
  DivisorPrevisualizacion,
} from './previsualizacion'

export function PrevisualizacionReceta() {
  const router = useRouter()
  const { datos, fotoPreview } = useCrearRecetaStore()
  const { publicar, publicando, error } = useCrearReceta()
  const { activo, pasoActual, pausado, soportado, iniciar, pausar, reanudar, siguiente, anterior, detener } =
    useModoManoLibres()
  const { data: fotoPexels, isLoading: buscandoFoto } = useFotoPexelsPreview(datos?.titulo ?? '', !fotoPreview)

  // Captura el valor en el montaje para no re-disparar cuando limpiar() pone datos a null
  const datosAlMontar = useRef(datos)
  useEffect(() => {
    if (!datosAlMontar.current) router.replace('/crear-receta')
  }, [router])

  if (!datos) return null

  const alergenosDetectados = detectarAlergenos(datos.ingredientes.map((i) => i.nombre))

  return (
    <div className="min-h-screen bg-background">

      <HeroPrevisualizacion
        src={fotoPreview || fotoPexels?.url || null}
        alt={datos.titulo}
        credito={!fotoPreview ? fotoPexels : null}
        textoVacio={buscandoFoto ? 'Buscando foto…' : 'Sin foto'}
      >
        {/* Botón volver — glassmorphism igual que HeroReceta */}
        <button
          onClick={() => router.back()}
          aria-label="Volver al formulario"
          className="absolute top-4 left-4 z-10 h-10 w-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
      </HeroPrevisualizacion>

      {/* ── Tarjeta contenido — misma estructura que DetalleRecetaCliente ── */}
      <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem]">

        <CabeceraPrevisualizacion
          titulo={datos.titulo}
          descripcion={datos.descripcion}
          dietas={datos.dietas}
          dificultad={datos.dificultad}
          alergenos={alergenosDetectados}
        />

        <DivisorPrevisualizacion />

        <IngredientesPrevisualizacion
          ingredientes={datos.ingredientes}
          meta={
            <MetaPrevisualizacion
              tiempo={datos.tiempo}
              unidadTiempo={datos.unidadTiempo}
              porciones={datos.porciones}
              className="mb-5"
            />
          }
        />

        <DivisorPrevisualizacion />

        <NutricionPrevisualizacion />

        <DivisorPrevisualizacion />

        <PasosPrevisualizacion
          pasos={datos.pasos}
          pasoResaltado={activo ? pasoActual : null}
          acciones={
            soportado && !activo ? (
              <button
                onClick={() => iniciar(datos.pasos.map((p) => p.texto))}
                className="flex items-center gap-1.5 bg-[var(--brand-subtle)] text-brand rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide active:scale-95 transition-transform"
              >
                <Headphones size={14} />
                Modo manos libres
              </button>
            ) : null
          }
          controles={
            activo ? (
              <div className="mb-5 flex items-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 px-4 py-2.5">
                <button onClick={anterior} disabled={pasoActual === 0} className="p-1.5 rounded-full hover:bg-brand/20 disabled:opacity-30 transition-colors text-brand" aria-label="Paso anterior">
                  <ChevronLeft size={18} />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-brand">
                  Paso {pasoActual + 1} de {datos.pasos.length}
                </span>
                <button onClick={pausado ? reanudar : pausar} className="p-1.5 rounded-full hover:bg-brand/20 transition-colors text-brand" aria-label={pausado ? 'Reanudar' : 'Pausar'}>
                  {pausado ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button onClick={siguiente} disabled={pasoActual === datos.pasos.length - 1} className="p-1.5 rounded-full hover:bg-brand/20 disabled:opacity-30 transition-colors text-brand" aria-label="Siguiente paso">
                  <ChevronRight size={18} />
                </button>
                <button onClick={detener} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors text-destructive ml-1" aria-label="Detener">
                  <X size={16} />
                </button>
              </div>
            ) : null
          }
        />

        {alergenosDetectados.length > 0 && (
          <>
            <DivisorPrevisualizacion />
            <AlergenosPrevisualizacion alergenos={alergenosDetectados} />
          </>
        )}

        {/* Botones — al final del contenido, sin fixed */}
        <div className="flex gap-3 px-5 pt-4 pb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-12 rounded-xl font-bold"
          >
            ← Seguir editando
          </Button>
          <Button
            onClick={() => {
              if (!fotoPreview && fotoPexels) {
                publicar({
                  url: fotoPexels.url,
                  fotografo: fotoPexels.fotografo,
                  urlFoto: fotoPexels.urlFoto,
                  urlPerfil: fotoPexels.urlPerfil
                })
              } else {
                publicar()
              }
            }}
            disabled={publicando}
            className="flex-1 h-12 rounded-xl bg-brand text-brand-foreground font-bold"
          >
            {publicando ? 'Publicando...' : 'Publicar receta'}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-destructive text-center px-5 pb-6">{error}</p>
        )}
      </div>
    </div>
  )
}
