'use client'

import { Fragment, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Headphones, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChipAlergeno } from '@/components/common/chipAlergeno'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import { ETIQUETAS_DIFICULTAD } from '../../types/crearReceta.schema'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'
import { useCrearReceta } from '@/features/recetas/hooks/useCrearReceta'
import { useFotoPexelsPreview } from '@/features/recetas/hooks/useFotoPexelsPreview'
import { useModoManoLibres } from '@/features/recetas/hooks/useModoManoLibres'

export function PrevisualizacionReceta() {
  const router = useRouter()
  const { datos, fotoPreview } = useCrearRecetaStore()
  const { publicar, publicando, error } = useCrearReceta()
  const { activo, pasoActual, pausado, soportado, iniciar, pausar, reanudar, siguiente, anterior, detener } =
    useModoManoLibres()
  const { data: fotoPexels, isLoading: buscandoFoto } = useFotoPexelsPreview(datos?.titulo ?? '')

  // Captura el valor en el montaje para no re-disparar cuando limpiar() pone datos a null
  const datosAlMontar = useRef(datos)
  useEffect(() => {
    if (!datosAlMontar.current) router.replace('/crear-receta')
  }, [router])

  if (!datos) return null

  const alergenosDetectados = detectarAlergenos(datos.ingredientes.map((i) => i.nombre))

  const etiquetasDietas = datos.dietas
    .map((id) => DIETAS_OPCIONES.find((d) => d.id === id)?.label)
    .filter(Boolean) as string[]

  const tiempoTexto = `${datos.tiempo} ${datos.unidadTiempo}`

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {fotoPreview || fotoPexels?.url ? (
          <Image
            src={fotoPreview ?? fotoPexels!.url}
            alt={datos.titulo}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              {buscandoFoto ? 'Buscando foto…' : 'Sin foto'}
            </span>
          </div>
        )}
        {!fotoPreview && fotoPexels && (
          <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/70 px-4 z-10">
            Foto de{' '}
            <a href={fotoPexels.urlPerfil} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {fotoPexels.fotografo}
            </a>
            {' '}en{' '}
            <a href={fotoPexels.urlFoto} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Pexels
            </a>
          </p>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/25" />

        {/* Botón volver — glassmorphism igual que HeroReceta */}
        <button
          onClick={() => router.back()}
          aria-label="Volver al formulario"
          className="absolute top-4 left-4 z-10 h-10 w-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* ── Tarjeta contenido — misma estructura que DetalleRecetaCliente ── */}
      <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem]">

        {/* Cabecera — replica CabeceraReceta */}
        <div className="px-5 pt-8 pb-5">
          {/* Fila 1: Categorías (izquierda) + Alérgenos (derecha) */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-1.5">
              {etiquetasDietas.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="bg-[var(--warm-bg)] text-foreground/70 border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
                >
                  {label}
                </Badge>
              ))}
              <Badge
                variant="secondary"
                className="bg-brand/15 text-brand border-0 text-[10px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
              >
                {ETIQUETAS_DIFICULTAD[datos.dificultad]}
              </Badge>
            </div>
            {alergenosDetectados.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end shrink-0 max-w-[45%]">
                {alergenosDetectados.map((id) => (
                  <ChipAlergeno key={id} alergenoId={id} size="sm" />
                ))}
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-[1.75rem] font-extrabold text-foreground leading-tight tracking-tight mb-3">
            {datos.titulo}
          </h1>

          {/* Descripción */}
          <p className="text-sm text-foreground/70 leading-relaxed mb-5">{datos.descripcion}</p>

          {/* Fila 2: Autor placeholder + acciones sociales — replica CabeceraReceta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-10 w-10 ring-2 ring-[var(--warm-bg)]">
                <AvatarFallback className="text-xs bg-[var(--warm-bg)] text-foreground font-bold">
                  TÚ
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-sm font-bold text-foreground">Tú</span>
                <span className="text-xs text-muted-foreground">ahora</span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <Heart size={22} />
                <span className="text-[10px] font-bold">0</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <MessageCircle size={22} />
                <span className="text-[10px] font-bold">0</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                <Share2 size={22} />
                <span className="text-[10px] font-bold">Compartir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-border/40" />

        {/* Ingredientes — replica TabsReceta */}
        <div className="px-5 pb-6 pt-4">
          {/* Meta pills: "Listo en X" + porciones */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="bg-brand/10 text-brand rounded-full px-3 py-1.5 text-xs font-bold">
              ⏱ Listo en {tiempoTexto}
            </span>
            <span className="bg-[var(--warm-bg)] text-foreground/70 rounded-full px-3 py-1.5 text-xs font-bold">
              🍽 {datos.porciones} {datos.porciones === 1 ? 'porción' : 'porciones'}
            </span>
          </div>

          <h2 className="mb-4 text-xl font-extrabold text-foreground">
            Ingredientes ({datos.ingredientes.length})
          </h2>
          <ul className="divide-border/40 divide-y">
            {datos.ingredientes.map((ing, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span className="flex-1 text-sm font-medium text-foreground">{ing.nombre}</span>
                <span className="shrink-0 text-sm font-bold text-muted-foreground">
                  {ing.cantidad} {ing.unidad}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divisor */}
        <div className="h-px bg-border/40" />

        {/* Nutrición — placeholder hasta Edamam (Fase 6) */}
        <div className="px-5 pb-6 pt-4">
          <h2 className="mb-1 text-xl font-extrabold text-foreground">Información nutricional</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Se calculará automáticamente al publicar (Edamam API)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Calorías', unidad: 'kcal' },
              { label: 'Proteínas', unidad: 'g' },
              { label: 'Carbohidratos', unidad: 'g' },
              { label: 'Grasas', unidad: 'g' },
            ].map(({ label, unidad }) => (
              <div key={label} className="flex flex-col gap-0.5 rounded-2xl bg-[var(--warm-bg)] p-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
                <span className="text-2xl font-extrabold leading-none text-foreground/30">
                  — <span className="text-xs text-muted-foreground/40">{unidad}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-border/40" />

        {/* Pasos — replica PasosReceta */}
        <section className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-foreground">
              Pasos ({datos.pasos.length})
            </h2>
            {soportado && !activo && (
              <button
                onClick={() => iniciar(datos.pasos.map((p) => p.texto))}
                className="flex items-center gap-1.5 bg-[var(--brand-subtle)] text-brand rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide active:scale-95 transition-transform"
              >
                <Headphones size={14} />
                Modo manos libres
              </button>
            )}
          </div>

          {activo && (
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
          )}

          <ol className="list-none p-0 m-0">
            {datos.pasos.map((paso, i) => (
              <Fragment key={i}>
                {i > 0 && <div className="h-px bg-border/40" />}
                <li className={`flex gap-4 py-5 transition-all duration-300 ${activo && i === pasoActual ? 'bg-brand/5 -mx-2 px-2 rounded-2xl ring-1 ring-brand/30' : ''}`}>
                  <div className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full font-black text-sm border transition-colors ${activo && i === pasoActual ? 'bg-brand text-brand-foreground border-brand' : 'bg-[var(--brand-subtle)] text-brand border-brand/20'}`}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{paso.texto}</p>
                </li>
              </Fragment>
            ))}
          </ol>
        </section>

        {/* Alérgenos */}
        {alergenosDetectados.length > 0 && (
          <>
            <div className="h-px bg-border/40" />
            <section className="px-5 pt-6 pb-6">
              <h2 className="text-xl font-extrabold text-foreground mb-3">Alérgenos</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {alergenosDetectados.map((id) => (
                  <ChipAlergeno key={id} alergenoId={id} size="sm" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ⚠️ La detección de alérgenos es orientativa. Consulta siempre con un especialista
                ante cualquier duda o alergia grave.
              </p>
            </section>
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
            onClick={publicar}
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
