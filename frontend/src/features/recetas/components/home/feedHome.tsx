'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { SearchX, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { FiltrosAvanzados, PostFeed } from '@/features/recetas/types/receta.types'
import { useHomeFeed } from '@/features/recetas/hooks/useHomeFeed'
import { TarjetaPost } from './tarjetaPost'
import { FeedHomePc, TarjetaPostSkeletonPc } from './feedHomePc'

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
      <Sparkles size={14} className="text-brand-texto shrink-0" />
      <p className="text-xs font-semibold text-brand-texto">
        Recetas para ti — basadas en tus gustos
      </p>
    </div>
  )
}

function FeedMovil({ posts, indiceRecomendados }: { posts: PostFeed[]; indiceRecomendados: number }) {
  return (
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
    </>
  )
}

interface FeedHomeProps {
  busqueda: string
  filtrosAvanzados: FiltrosAvanzados
}

export function FeedHome({ busqueda, filtrosAvanzados }: FeedHomeProps) {
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

  if (cargando) {
    return (
      <>
        <div className="lg:hidden">
          <TarjetaPostSkeleton />
          <TarjetaPostSkeleton />
          <TarjetaPostSkeleton />
        </div>
        <div className="hidden grid-cols-3 gap-6 lg:grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <TarjetaPostSkeletonPc key={i} />
          ))}
        </div>
      </>
    )
  }

  if (esError) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-16 text-center lg:py-20">
        <p className="text-base font-semibold text-foreground">Error al cargar recetas</p>
        <p className="text-sm text-muted-foreground">Inténtalo de nuevo más tarde</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-16 text-center lg:py-20">
        <SearchX className="h-10 w-10 text-muted-foreground/40 lg:h-12 lg:w-12" strokeWidth={1.5} />
        <p className="text-base font-semibold text-foreground">Sin resultados</p>
        <p className="text-sm text-muted-foreground">
          {hayBusquedaOFiltros
            ? 'Prueba con otro término o cambia el filtro'
            : 'Aún no hay recetas para mostrar'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="lg:hidden">
        <FeedMovil posts={posts} indiceRecomendados={indiceRecomendados} />
      </div>
      <div className="hidden lg:block">
        <FeedHomePc posts={posts} indiceRecomendados={indiceRecomendados} />
      </div>

      <div ref={sentinelRef} className="h-10 lg:mt-6" />

      {isFetchingNextPage && (
        <>
          <div className="pb-8 lg:hidden">
            <TarjetaPostSkeleton />
          </div>
          <div className="hidden grid-cols-3 gap-6 lg:grid">
            <TarjetaPostSkeletonPc />
            <TarjetaPostSkeletonPc />
            <TarjetaPostSkeletonPc />
          </div>
        </>
      )}
    </>
  )
}
