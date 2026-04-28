'use client'

import { useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { HeaderColeccion } from './headerColeccion'
import { GridRecetasColeccion } from './gridRecetasColeccion'
import { EstadoVacioMisRecetas } from './estadoVacioMisRecetas'
import { EstadoVacioGuardadas } from './estadoVacioGuardadas'
import { MIS_RECETAS, RECETAS_GUARDADAS } from '../data/datosColeccion'
import type { PestanaColeccion } from '../types/coleccion.types'

const variantesContenido: Variants = {
  oculto: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  salir: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
}

export function ContenidoColeccion() {
  const [pestana, setPestana] = useState<PestanaColeccion>('guardadas')

  const recetas = pestana === 'guardadas' ? RECETAS_GUARDADAS : MIS_RECETAS
  const vacio = recetas.length === 0

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
          {vacio ? (
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
