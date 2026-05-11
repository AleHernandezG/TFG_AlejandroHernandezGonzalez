'use client'

import { motion, type Variants } from 'framer-motion'
import { ChefHat } from 'lucide-react'

const puntovariante: Variants = {
  latido: (i: number) => ({
    scale: [1, 1.6, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      delay: i * 0.2,
      ease: 'easeInOut',
    },
  }),
}

export function IndicadorPensando() {
  return (
    <div className="flex w-full justify-start gap-2">
      <div className="mt-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-subtle)]">
        <ChefHat className="h-4 w-4 text-brand" />
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-border/15 bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">Pensando</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand"
              variants={puntovariante}
              animate="latido"
              custom={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
