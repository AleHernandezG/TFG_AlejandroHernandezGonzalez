'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchX } from 'lucide-react'
import { POSTS_MOCK } from '../../data/datosFeed'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'

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

  const postsFiltrados = POSTS_MOCK.filter((post) => {
    if (busquedaDebounciada !== '') {
      const q = busquedaDebounciada.toLowerCase()
      if (
        !post.receta.titulo.toLowerCase().includes(q) &&
        !post.receta.descripcion.toLowerCase().includes(q) &&
        !post.autor.nombre.toLowerCase().includes(q)
      )
        return false
    }

    if (
      filtrosAvanzados.dificultad.length > 0 &&
      !filtrosAvanzados.dificultad.includes(post.receta.dificultad)
    )
      return false

    if (filtrosAvanzados.alergenos.length > 0) {
      const postAlergenos = post.receta.alergenos ?? []
      if (filtrosAvanzados.alergenos.some((a) => postAlergenos.includes(a))) return false
    }

    return true
  })

  return (
    <div>
      {cargando ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TarjetaPostSkeletonPc key={i} />
          ))}
        </div>
      ) : postsFiltrados.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {postsFiltrados.map((post, i) => (
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
