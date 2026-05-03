'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroReceta } from './heroReceta'
import { CabeceraReceta } from './cabeceraReceta'
import { TabsReceta } from './tabsReceta'
import { PasosReceta } from './pasosReceta'
import { ComentariosReceta } from './comentariosReceta'
import { CarruselSimilares } from './carruselSimilares'
import { useToggleGuardado } from '@/features/recetas/hooks/useToggleGuardado'
import type { RecetaDetalle } from '@/features/recetas/types/receta.types'

type Props = {
  receta: RecetaDetalle
}

export function DetalleRecetaCliente({ receta }: Props) {
  const router = useRouter()
  const [guardado, setGuardado] = useState(receta.guardado)
  const { mutate: mutarGuardado } = useToggleGuardado(receta.id)

  function toggleGuardado() {
    setGuardado((prev) => !prev)
    mutarGuardado(undefined, {
      onSuccess: () => router.refresh(),
      onError: () => setGuardado((prev) => !prev),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Mobile layout (< md) — scroll único vertical ─── */}
      <div className="md:hidden">
        <HeroReceta
          imagenUrl={receta.receta.imagenUrl}
          titulo={receta.receta.titulo}
          guardado={guardado}
          onToggleGuardado={toggleGuardado}
        />
        {/* Tarjeta de contenido que sube sobre el hero con esquinas redondeadas */}
        <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem]">
          <CabeceraReceta receta={receta} />
          <TabsReceta
            ingredientes={receta.ingredientes}
            macros={receta.macros}
            porcionesBase={receta.porciones}
          />
          <PasosReceta pasos={receta.pasos} />
          <ComentariosReceta recetaId={receta.id} comentarios={receta.listaComentarios} total={receta.comentarios} />
          <CarruselSimilares recetas={receta.similares} />
        </div>
      </div>

      {/* ── Desktop layout (≥ md) — bento grid dos columnas ─ */}
      <div className="hidden md:grid md:grid-cols-2 md:min-h-screen">
        {/* Columna izquierda: hero + cabecera + tabs */}
        <div className="flex flex-col border-r border-border/40 overflow-y-auto">
          <HeroReceta
            imagenUrl={receta.receta.imagenUrl}
            titulo={receta.receta.titulo}
            guardado={guardado}
            onToggleGuardado={toggleGuardado}
          />
          <div className="-mt-8 relative z-10 bg-background rounded-t-[2rem]">
            <CabeceraReceta receta={receta} />
            <TabsReceta
              ingredientes={receta.ingredientes}
              macros={receta.macros}
              porcionesBase={receta.porciones}
            />
          </div>
        </div>

        {/* Columna derecha: pasos + comentarios + similares */}
        <div className="overflow-y-auto pt-6">
          <PasosReceta pasos={receta.pasos} />
          <ComentariosReceta recetaId={receta.id} comentarios={receta.listaComentarios} total={receta.comentarios} />
          <CarruselSimilares recetas={receta.similares} />
        </div>
      </div>
    </div>
  )
}
