'use client'

import { BuscadorFiltros } from '@/components/common/buscadorFiltros'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { SearchX, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FiltrosAvanzados } from '@/features/recetas/types/receta.types'
import { useHomeFeed } from '@/features/recetas/hooks/useHomeFeed'
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

function BannerRecomendados() {
  return (
    <div className="mx-4 mb-2 mt-2 flex items-center gap-2 rounded-xl bg-brand/8 border border-brand/15 px-3.5 py-2.5">
      <Sparkles size={14} className="text-brand shrink-0" />
      <p className="text-xs font-semibold text-brand">
        Recetas para ti — basadas en tus gustos
      </p>
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

  const {
    posts,
    indiceRecomendados,
    cargando,
    esError,
    hayBusquedaOFiltros,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHomeFeed(busqueda, filtrosAvanzados)

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
        ) : esError ? (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <p className="text-base font-semibold text-foreground">Error al cargar recetas</p>
            <p className="text-sm text-muted-foreground">Inténtalo de nuevo más tarde</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, i) => (
              <div key={post.id}>
                {i === indiceRecomendados && <BannerRecomendados />}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 5) * 0.07, ease: 'easeOut' }}
                >
                  <TarjetaPost post={post} />
                </motion.div>
              </div>
            ))}
            
            <div ref={sentinelRef} className="h-10" />
            
            {isFetchingNextPage && (
              <div className="pb-8">
                <TarjetaPostSkeleton />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="text-base font-semibold text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              {hayBusquedaOFiltros
                ? 'Prueba con otro término o cambia el filtro'
                : 'Aún no hay recetas para mostrar'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
