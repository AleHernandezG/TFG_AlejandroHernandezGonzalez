'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChipAlergeno } from '@/components/common/chipAlergeno'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'
import { detectarAlergenos } from '../../utils/detectarAlergenos'
import { ETIQUETAS_DIFICULTAD } from '../../types/crearReceta.schema'
import { DIETAS_OPCIONES } from '@/config/opcionesUsuario'

export function PrevisualizacionReceta() {
  const router = useRouter()
  const { datos, fotoPreview, limpiar } = useCrearRecetaStore()
  const [publicando, setPublicando] = useState(false)

  useEffect(() => {
    if (!datos) router.replace('/crear-receta')
  }, [datos, router])

  if (!datos) return null

  const alergenosDetectados = detectarAlergenos(datos.ingredientes.map((i) => i.nombre))

  const etiquetasDietas = datos.dietas
    .map((id) => DIETAS_OPCIONES.find((d) => d.id === id)?.label)
    .filter(Boolean) as string[]

  const tiempoTexto = `${datos.tiempo} ${datos.unidadTiempo}`

  function handlePublicar() {
    setPublicando(true)
    // TODO Fase 5: recetasService.crear(datos)
    setTimeout(() => {
      limpiar()
      router.push('/home')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Banner vista previa */}
      <div className="sticky top-0 z-30 flex items-center gap-2 bg-brand/10 text-brand px-5 py-3 text-sm font-bold">
        <Eye size={16} />
        Vista previa — así verán tu receta
      </div>

      {/* Imagen hero */}
      <div className="relative h-72 w-full bg-muted">
        {fotoPreview ? (
          <Image src={fotoPreview} alt={datos.titulo} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">Sin foto</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
      </div>

      {/* Tarjeta contenido */}
      <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem]">
        <div className="px-5 pt-8 pb-5">
          {/* Categorías + alérgenos */}
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

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <span>⏱ {tiempoTexto}</span>
            <span>🍽 {datos.porciones} porciones</span>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="px-5 pb-6 pt-2">
          <h2 className="mb-4 text-xl font-extrabold text-foreground">Ingredientes</h2>
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

        {/* Pasos */}
        <section className="px-5 pt-2 pb-6">
          <h2 className="text-xl font-extrabold text-foreground mb-5">Pasos</h2>
          <ol className="list-none p-0 m-0">
            {datos.pasos.map((paso, i) => (
              <li key={i} className="flex gap-4 py-5 border-t border-border/40 first:border-t-0">
                <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-subtle)] text-brand font-black text-sm border border-brand/20">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Alérgenos */}
        {alergenosDetectados.length > 0 && (
          <section className="px-5 pt-2 pb-6">
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
        )}
      </div>

      {/* Botones fixed */}
      <div className="fixed bottom-16 left-0 right-0 z-40 flex gap-3 px-5 pb-2 pt-3 bg-background/90 backdrop-blur-sm border-t border-border max-w-[390px] mx-auto">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 h-12 rounded-xl font-bold"
        >
          ← Seguir editando
        </Button>
        <Button
          onClick={handlePublicar}
          disabled={publicando}
          className="flex-1 h-12 rounded-xl bg-brand text-brand-foreground font-bold"
        >
          {publicando ? 'Publicando...' : 'Publicar receta'}
        </Button>
      </div>
    </div>
  )
}
