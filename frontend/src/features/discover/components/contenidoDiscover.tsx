'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { HeaderDiscover } from './headerDiscover'
import { ChipsCategoria } from './chipsCategoria'
import { TarjetaDestacada } from './tarjetaDestacada'
import { TarjetaDiscover } from './tarjetaDiscover'
import { EstadoVacioDiscover } from './estadoVacioDiscover'
import {
  CATEGORIAS_DISCOVER,
  EVENTO_DESTACADO_MOCK,
  RECETAS_DISCOVER_MOCK,
  SUGERENCIAS_POPULARES,
} from '@/features/discover/data/datosDiscover'
import type { CategoriaDiscover, TabDiscover } from '@/features/discover/types/discover.types'

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

export function ContenidoDiscover() {
  const [query, setQuery] = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaDiscover>('Todos')
  const [tabActiva, setTabActiva] = useState<TabDiscover>('recientes')

  const queryDebounced = useDebounce(query, 300)
  const buscando = queryDebounced.length > 0

  const recetasFiltradas = useMemo(() => {
    let lista = RECETAS_DISCOVER_MOCK

    if (categoriaActiva !== 'Todos') {
      lista = lista.filter((r) => r.categoria === categoriaActiva)
    }

    if (queryDebounced) {
      const q = queryDebounced.toLowerCase()
      lista = lista.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          r.autorNombre.toLowerCase().includes(q)
      )
    }

    if (tabActiva === 'valorados') {
      lista = [...lista].sort((a, b) => b.likes - a.likes)
    } else if (tabActiva === 'evento') {
      lista = lista.filter((r) => r.esEvento === true)
    }

    return lista
  }, [queryDebounced, categoriaActiva, tabActiva])

  function handleLimpiar() {
    setQuery('')
    setCategoriaActiva('Todos')
  }

  function handleSugerencia(s: string) {
    setQuery(s)
  }

  return (
    <div className="min-h-screen bg-[var(--warm-bg)]">
      <HeaderDiscover query={query} onChange={setQuery} />

      {!buscando && (
        <>
          <ChipsCategoria
            categorias={CATEGORIAS_DISCOVER}
            activa={categoriaActiva}
            onChange={setCategoriaActiva}
          />

          <div className="mt-5">
            <TarjetaDestacada evento={EVENTO_DESTACADO_MOCK} />
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {buscando && recetasFiltradas.length === 0 ? (
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
          <motion.div key="resultados" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {/* Cabecera / toggle de tabs */}
            <div className="mt-7 mb-4 px-5">
              {buscando ? (
                <h2 className="text-lg font-extrabold text-foreground">
                  {recetasFiltradas.length} resultado{recetasFiltradas.length !== 1 ? 's' : ''}
                </h2>
              ) : (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1 rounded-full bg-[var(--warm-bg-accent)] p-1">
                    {([
                      { id: 'recientes', label: 'Recientes' },
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
            <motion.div
              variants={variantesGrid}
              initial="oculto"
              animate="visible"
              className="grid grid-cols-2 gap-3 px-5 pb-28"
            >
              {recetasFiltradas.map((receta) => (
                <motion.div key={receta.id} variants={varianteTarjeta}>
                  <TarjetaDiscover receta={receta} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
