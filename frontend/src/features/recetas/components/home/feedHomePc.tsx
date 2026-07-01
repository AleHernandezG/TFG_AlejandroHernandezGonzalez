'use client'

import { useEffect, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchX, Sparkles } from 'lucide-react'
import type { FiltrosAvanzados, PostFeed } from '../../types/receta.types'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'
import { useHomeFeed } from '@/features/recetas/hooks/useHomeFeed'

// Bento grid layout pattern for first 7 posts:
// [HERO col-span-2 row-span-2][SMALL]
// [HERO continues            ][SMALL]
// [SMALL][WIDE col-span-2        ]
// remaining posts → SMALL
const VARIANTES: VarianteTarjeta[] = [
  'hero', 'small', 'small', 'small', 'wide', 'small', 'small',
]

function varianteParaIndice(i: number): VarianteTarjeta {
  if (i < VARIANTES.length) return VARIANTES[i]
  const resto = (i - VARIANTES.length) % 7
  return VARIANTES[resto]
}

function TarjetaPostSkeletonPc() {
  return (
    <div className="overflow-hidden rounded-xl">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function GridBento({ posts }: { posts: PostFeed[] }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {posts.map((post, i) => (
        <TarjetaPostPc key={post.id} post={post} variante={varianteParaIndice(i)} />
      ))}
    </div>
  )
}

function BannerRecomendados() {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand/15 bg-brand/8 px-4 py-3">
      <Sparkles size={16} className="shrink-0 text-brand" />
      <p className="text-sm font-semibold text-brand">
        Recetas para ti — basadas en tus gustos
      </p>
    </div>
  )
}

interface FeedHomePcProps {
  busqueda: string
  filtrosAvanzados: FiltrosAvanzados
}

export function FeedHomePc({ busqueda, filtrosAvanzados }: FeedHomePcProps) {
  const {
    posts,
    indiceRecomendados,
    cargando,
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
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <TarjetaPostSkeletonPc key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
        <p className="text-base font-semibold text-foreground">Sin resultados</p>
        <p className="text-sm text-muted-foreground">
          {hayBusquedaOFiltros
            ? 'Prueba con otro término o cambia el filtro'
            : 'Aún no hay recetas para mostrar'}
        </p>
      </div>
    )
  }

  // Mezcla: rejilla de seguidos, divisor y rejilla de recomendados.
  if (indiceRecomendados > 0) {
    return (
      <div className="space-y-6">
        <GridBento posts={posts.slice(0, indiceRecomendados)} />
        <BannerRecomendados />
        <GridBento posts={posts.slice(indiceRecomendados)} />
        <div ref={sentinelRef} className="h-10" />
        {isFetchingNextPage && (
          <div className="grid grid-cols-3 gap-6">
            <TarjetaPostSkeletonPc />
            <TarjetaPostSkeletonPc />
            <TarjetaPostSkeletonPc />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {indiceRecomendados === 0 && <BannerRecomendados />}
      <GridBento posts={posts} />
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="grid grid-cols-3 gap-6">
          <TarjetaPostSkeletonPc />
          <TarjetaPostSkeletonPc />
          <TarjetaPostSkeletonPc />
        </div>
      )}
    </div>
  )
}
