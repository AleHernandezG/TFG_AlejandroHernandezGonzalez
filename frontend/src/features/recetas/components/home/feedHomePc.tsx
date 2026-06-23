'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchX, Sparkles } from 'lucide-react'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'
import { useRecetasFeed } from '@/features/recetas/hooks/useRecetasFeed'
import { useMiPerfil } from '@/features/perfil/hooks/usePerfil'

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

interface FeedHomePcProps {
  busqueda: string
  filtrosAvanzados: FiltrosAvanzados
}

export function FeedHomePc({ busqueda, filtrosAvanzados }: FeedHomePcProps) {
  const busquedaDebounciada = useDebounce(busqueda, 300)
  const buscando = busqueda !== busquedaDebounciada

  const { data: perfil } = useMiPerfil()

  const feedSiguiendo = useRecetasFeed({
    q: busquedaDebounciada,
    filtrosAvanzados,
    excluirPropio: true,
    soloSiguiendo: true,
  })

  const sinSiguiendo =
    feedSiguiendo.isSuccess &&
    (feedSiguiendo.data?.recetas.length ?? 0) === 0 &&
    !busquedaDebounciada &&
    filtrosAvanzados.dietas.length === 0 &&
    filtrosAvanzados.alergenos.length === 0 &&
    filtrosAvanzados.dificultad.length === 0

  const feedRecomendado = useRecetasFeed({
    filtrosAvanzados: {
      dietas: perfil?.preferencias ?? [],
      alergenos: perfil?.alergias ?? [],
      dificultad: [],
    },
    sort: 'likes',
    excluirPropio: true,
    enabled: sinSiguiendo,
  })

  const posts = sinSiguiendo
    ? (feedRecomendado.data?.recetas ?? [])
    : (feedSiguiendo.data?.recetas ?? [])

  const cargando =
    feedSiguiendo.isLoading ||
    (sinSiguiendo && feedRecomendado.isLoading) ||
    buscando

  const esRecomendado = sinSiguiendo && posts.length > 0

  return (
    <div>
      {esRecomendado && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand/15 bg-brand/8 px-4 py-3">
          <Sparkles size={16} className="shrink-0 text-brand" />
          <p className="text-sm font-semibold text-brand">
            Recetas para ti — basadas en tus gustos
          </p>
        </div>
      )}

      {cargando ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TarjetaPostSkeletonPc key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <TarjetaPostPc
              key={post.id}
              post={post}
              variante={varianteParaIndice(i)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-base font-semibold text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            {busquedaDebounciada
              ? 'Prueba con otro término o cambia el filtro'
              : 'Sigue a otros usuarios para ver sus recetas aquí'}
          </p>
        </div>
      )}
    </div>
  )
}
