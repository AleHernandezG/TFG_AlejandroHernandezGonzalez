'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { HeaderColeccion } from './headerColeccion'
import { GridRecetasColeccion } from './gridRecetasColeccion'
import { EstadoVacioMisRecetas } from './estadoVacioMisRecetas'
import { EstadoVacioGuardadas } from './estadoVacioGuardadas'
import { useRecetasGuardadas } from '@/features/coleccion/hooks/useRecetasGuardadas'
import { useMisRecetas } from '@/features/coleccion/hooks/useMisRecetas'
import type { PestanaColeccion } from '@/features/coleccion/types/coleccion.types'

const variantesContenido: Variants = {
  oculto: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  salir: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
}

function GridSkeletonColeccion() {
  return (
    <div className="px-5 pt-8 pb-10 grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}

export function ContenidoColeccion() {
  const searchParams = useSearchParams()
  const tabInicial: PestanaColeccion =
    searchParams.get('tab') === 'mis-recetas' ? 'mis-recetas' : 'guardadas'
  const [pestana, setPestana] = useState<PestanaColeccion>(tabInicial)

  const { data: guardadas = [], isLoading: cargandoGuardadas } = useRecetasGuardadas()
  const { data: misRecetas = [], isLoading: cargandoMisRecetas } = useMisRecetas()

  const recetas = pestana === 'guardadas' ? guardadas : misRecetas
  const cargando = pestana === 'guardadas' ? cargandoGuardadas : cargandoMisRecetas
  const vacio = !cargando && recetas.length === 0

  return (
    <div className="min-h-screen bg-background">
      <HeaderColeccion pestana={pestana} onCambiar={setPestana} total={recetas.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={pestana}
          variants={variantesContenido}
          initial="oculto"
          animate="visible"
          exit="salir"
        >
          {cargando ? (
            <GridSkeletonColeccion />
          ) : vacio ? (
            pestana === 'guardadas' ? (
              <EstadoVacioGuardadas />
            ) : (
              <EstadoVacioMisRecetas />
            )
          ) : (
            <GridRecetasColeccion recetas={recetas} pestana={pestana} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
