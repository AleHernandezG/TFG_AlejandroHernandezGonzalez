'use client'

import { BuscadorFiltros } from '@/components/common/buscadorFiltros'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { useState } from 'react'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { useRecetasFeed } from '../../hooks/useRecetasFeed'
import { TarjetaPost } from './tarjetaPost'

function TarjetaPostSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function FeedHome() {
  const [busqueda, setBusqueda] = useState('')
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados>({
    dietas: [],
    alergenos: [],
    dificultad: [],
  })

  const busquedaDebounciada = useDebounce(busqueda, 300)

  const { data, isLoading, isError } = useRecetasFeed({
    q: busquedaDebounciada,
    filtrosAvanzados,
  })

  const recetas = data?.recetas ?? []
  const cargando = isLoading || busqueda !== busquedaDebounciada

  return (
    <>
      <BuscadorFiltros
        onBuscar={setBusqueda}
        filtrosAvanzados={filtrosAvanzados}
        onFiltrosAvanzadosChange={setFiltrosAvanzados}
      />

      <div>
        {cargando ? (
          <>
            <TarjetaPostSkeleton />
            <TarjetaPostSkeleton />
            <TarjetaPostSkeleton />
          </>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <p className="text-base font-semibold text-foreground">Error al cargar recetas</p>
            <p className="text-sm text-muted-foreground">Inténtalo de nuevo más tarde</p>
          </div>
        ) : recetas.length > 0 ? (
          recetas.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: 'easeOut' }}
            >
              <TarjetaPost post={post} />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
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
