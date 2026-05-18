'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchX } from 'lucide-react'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'
import { useRecetasFeed } from '@/features/recetas/hooks/useRecetasFeed'

// Bento grid layout pattern for first 7 posts:
// [HERO col-span-2 row-span-2][SMALL]
// [HERO continues            ][SMALL]
// [SMALL][WIDE col-span-2        ]
// remaining posts → SMALL
const VARIANTES: VarianteTarjeta[] = [
  'hero', 'small', 'small', 'small', 'wide', 'small', 'small',
]

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
  const cargando = busqueda !== busquedaDebounciada

  const { data, isLoading } = useRecetasFeed({
    q: busquedaDebounciada,
    filtrosAvanzados,
    excluirPropio: true,
    soloSiguiendo: true,
  })

  const posts = data?.recetas ?? []

  return (
    <div>
      {cargando || isLoading ? (
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
              variante={VARIANTES[i] ?? 'small'}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-base font-semibold text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            Prueba con otro término o cambia el filtro
          </p>
        </div>
      )}
    </div>
  )
}
