'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { HeaderDiscover } from './headerDiscover'
import { TarjetaDestacada } from './tarjetaDestacada'
import { TarjetaDiscover } from './tarjetaDiscover'
import { EstadoVacioDiscover } from './estadoVacioDiscover'
import {
  EVENTO_DESTACADO_MOCK,
  SUGERENCIAS_POPULARES,
} from '@/features/discover/data/datosDiscover'
import type { TabDiscover } from '@/features/discover/types/discover.types'
import type { FiltrosAvanzados } from '@/features/recetas/types/receta.types'
import { useDiscover } from '@/features/discover/hooks/useDiscover'

const variantesGrid: Variants = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const varianteTarjeta: Variants = {
  oculto: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

function SkeletonTarjeta() {
  return (
    <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
  )
}

export function ContenidoDiscover() {
  const [query, setQuery] = useState('')
  const [tabActiva, setTabActiva] = useState<TabDiscover>('recientes')
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados>({
    dietas: [],
    alergenos: [],
    dificultad: [],
  })

  const queryDebounced = useDebounce(query, 300)
  const buscando = queryDebounced.length > 0

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useDiscover({
    q: queryDebounced || undefined,
    tab: tabActiva,
    filtrosAvanzados,
  })

  const recetas = data?.pages.flatMap((page) => page.recetas) ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleLimpiar() {
    setQuery('')
  }

  function handleSugerencia(s: string) {
    setQuery(s)
  }

  return (
    <div className="min-h-screen bg-[var(--warm-bg)]">
      <HeaderDiscover
        query={query}
        onChange={setQuery}
        filtrosAvanzados={filtrosAvanzados}
        onFiltrosChange={setFiltrosAvanzados}
      />

      {!buscando && (
        <div className="mt-5">
          <TarjetaDestacada evento={EVENTO_DESTACADO_MOCK} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isLoading && buscando && recetas.length === 0 ? (
          <motion.div
            key="vacio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <EstadoVacioDiscover
              query={queryDebounced}
              sugerencias={SUGERENCIAS_POPULARES}
              onLimpiar={handleLimpiar}
              onSugerencia={handleSugerencia}
            />
          </motion.div>
        ) : (
          <motion.div
            key="resultados"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Cabecera / toggle de tabs */}
            <div className="mt-7 mb-4 px-5">
              {buscando ? (
                <h2 className="text-lg font-extrabold text-foreground">
                  {recetas.length} resultado{recetas.length !== 1 ? 's' : ''}
                </h2>
              ) : (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1 rounded-full bg-[var(--warm-bg-accent)] p-1">
                    {([
                      { id: 'recientes', label: 'Tendencias' },
                      { id: 'valorados', label: 'Mejor valorados' },
                      { id: 'evento', label: 'Especiales Evento' },
                    ] as { id: TabDiscover; label: string }[]).map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setTabActiva(id)}
                        className={[
                          'rounded-full px-3 py-1 text-xs font-bold transition-colors',
                          id === tabActiva
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 px-5 pb-28">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTarjeta key={i} />
                ))}
              </div>
            ) : (
              <>
                <motion.div
                  variants={variantesGrid}
                  initial="oculto"
                  animate="visible"
                  className="grid grid-cols-2 gap-3 px-5"
                >
                  {recetas.map((receta) => (
                    <motion.div key={receta.id} variants={varianteTarjeta}>
                      <TarjetaDiscover receta={receta} />
                    </motion.div>
                  ))}
                </motion.div>

                <div ref={sentinelRef} className="h-10" />

                {isFetchingNextPage && (
                  <div className="grid grid-cols-2 gap-3 px-5 pb-28">
                    <SkeletonTarjeta />
                    <SkeletonTarjeta />
                  </div>
                )}

                {!isFetchingNextPage && <div className="pb-28" />}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
