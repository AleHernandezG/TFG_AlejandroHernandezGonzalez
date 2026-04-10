'use client'

import { BuscadorFiltros } from '@/components/common/buscadorFiltros'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FILTROS_FEED, POSTS_MOCK } from '../../data/datosFeed'
import { TarjetaPost } from './tarjetaPost'

export function FeedHome() {
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>(['todas'])
  const [busqueda, setBusqueda] = useState('')

  function toggleFiltro(id: string) {
    setFiltrosActivos((prev) => {
      if (id === 'todas') return ['todas']
      const sinTodas = prev.filter((f) => f !== 'todas')
      if (sinTodas.includes(id)) {
        const nuevo = sinTodas.filter((f) => f !== id)
        return nuevo.length === 0 ? ['todas'] : nuevo
      }
      return [...sinTodas, id]
    })
  }

  const postsFiltrados = POSTS_MOCK.filter((post) => {
    if (busqueda === '') return true
    const q = busqueda.toLowerCase()
    return (
      post.receta.titulo.toLowerCase().includes(q) ||
      post.receta.descripcion.toLowerCase().includes(q) ||
      post.autor.nombre.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <BuscadorFiltros
        filtros={FILTROS_FEED}
        filtrosActivos={filtrosActivos}
        onFiltroChange={toggleFiltro}
        onBuscar={setBusqueda}
      />

      <div>
        {postsFiltrados.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07, ease: 'easeOut' }}
          >
            <TarjetaPost post={post} />
          </motion.div>
        ))}

        {postsFiltrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <p className="text-base font-semibold text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Prueba con otro término o cambia el filtro
            </p>
          </div>
        )}
      </div>
    </>
  )
}
