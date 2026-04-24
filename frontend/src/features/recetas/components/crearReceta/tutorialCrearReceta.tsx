'use client'

import { useState } from 'react'
import { Camera, ListOrdered, Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  onTerminar: () => void
}

const PASOS = [
  {
    icono: Camera,
    titulo: 'La foto lo es todo',
    descripcion:
      'Una buena foto aumenta el interés por tu receta. Usa buena luz natural y un fondo limpio.',
  },
  {
    icono: ListOrdered,
    titulo: 'Ingredientes claros',
    descripcion:
      'Especifica cantidades y unidades para que cualquiera pueda reproducir tu receta sin dudas.',
  },
  {
    icono: Eye,
    titulo: 'Revisa antes de publicar',
    descripcion:
      'En la pantalla de previsualización verás exactamente cómo verán tu receta el resto de usuarios.',
  },
]

export function TutorialCrearReceta({ onTerminar }: Props) {
  const [paso, setPaso] = useState(0)
  const esUltimo = paso === PASOS.length - 1
  const { icono: Icono, titulo, descripcion } = PASOS[paso]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      {/* Indicadores */}
      <div className="flex gap-1.5 mb-8">
        {PASOS.map((_, i) => (
          <div
            key={i}
            className={[
              'h-1.5 rounded-full transition-all duration-300',
              i === paso ? 'w-6 bg-brand' : 'w-1.5 bg-border',
            ].join(' ')}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={paso}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col items-center"
        >
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-brand/10 mb-6">
            <Icono size={36} className="text-brand" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-3">{titulo}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{descripcion}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex flex-col gap-2 w-full max-w-xs">
        {esUltimo ? (
          <Button
            onClick={onTerminar}
            className="w-full bg-brand text-brand-foreground font-bold rounded-xl h-12"
          >
            Entendido
          </Button>
        ) : (
          <Button
            onClick={() => setPaso((p) => p + 1)}
            className="w-full bg-brand text-brand-foreground font-bold rounded-xl h-12 flex items-center justify-center gap-2"
          >
            Siguiente
            <ChevronRight size={18} />
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onTerminar}
          className="text-muted-foreground text-sm"
        >
          Saltar tutorial
        </Button>
      </div>
    </div>
  )
}
