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
    <div className="min-h-screen bg-background md:grid md:grid-cols-2">
      <div className="md:flex md:flex-col md:overflow-y-auto md:border-r md:border-border/40">
        <HeroReceta
          imagenUrl={receta.receta.imagenUrl}
          titulo={receta.receta.titulo}
          guardado={guardado}
          onToggleGuardado={toggleGuardado}
          fotoFuente={receta.receta.fotoFuente}
          fotoCredito={receta.receta.fotoCredito}
        />
        <div className="relative z-10 -mt-8 rounded-t-4xl bg-background">
          <CabeceraReceta receta={receta} />
          <TabsReceta
            ingredientes={receta.ingredientes}
            macros={receta.macros}
            porcionesBase={receta.porciones}
          />
        </div>
      </div>

      <div className="md:overflow-y-auto md:pt-6">
        <PasosReceta pasos={receta.pasos} />
        <ComentariosReceta recetaId={receta.id} total={receta.comentarios} />
        <CarruselSimilares recetas={receta.similares} />
      </div>
    </div>
  )
}
