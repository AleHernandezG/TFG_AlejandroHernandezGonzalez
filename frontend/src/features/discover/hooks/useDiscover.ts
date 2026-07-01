'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'
import type { CategoriaDiscover, TabDiscover } from '../types/discover.types'
import type { FiltrosAvanzados, PostFeed } from '@/features/recetas/types/receta.types'

interface UseDiscoverParams {
  q?: string
  categoria?: CategoriaDiscover
  tab?: TabDiscover
  filtrosAvanzados?: FiltrosAvanzados
}

function parseTiempoMin(tiempo: string): number {
  if (tiempo.includes('h')) return Math.round(parseFloat(tiempo) * 60)
  return parseInt(tiempo) || 0
}

export function postFeedARecetaDiscover(post: PostFeed) {
  return {
    id: post.id,
    titulo: post.receta.titulo,
    autorNombre: post.autor.nombre,
    imagenUrl: post.receta.imagenUrl,
    tiempoMin: parseTiempoMin(post.receta.tiempo),
    likes: post.likes,
  }
}

export function useDiscover({
  q,
  categoria,
  tab = 'recientes',
  filtrosAvanzados,
}: UseDiscoverParams = {}) {
  const { data: session } = useSession()
  const token = session?.user?.backendToken

  const sort = tab === 'valorados' ? 'likes' : tab === 'recientes' ? 'score' : 'reciente'
  const soloEvento = tab === 'evento'
  // lowercase para que coincida con los valores en MongoDB ('vegano', 'pasta'…)
  const categoriaParam = categoria && categoria !== 'Todos' ? categoria.toLowerCase() : undefined

  return useInfiniteQuery({
    queryKey: ['discover', q ?? '', categoria, tab, filtrosAvanzados, !!token],
    queryFn: async ({ pageParam = 1 }) => {
      const resp = await recetasService.obtenerFeed(
        {
          q: q || undefined,
          sort,
          soloEvento,
          categoria: categoriaParam,
          limite: 12,
          pagina: pageParam as number,
          dietas: filtrosAvanzados?.dietas?.length ? filtrosAvanzados.dietas : undefined,
          dificultad: filtrosAvanzados?.dificultad?.length ? filtrosAvanzados.dificultad : undefined,
          alergenos: filtrosAvanzados?.alergenos?.length ? filtrosAvanzados.alergenos : undefined,
        },
        token,
      )
      return {
        recetas: resp.recetas.map(postFeedARecetaDiscover),
        total: resp.total,
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalCargadas = allPages.reduce((acc, page) => acc + page.recetas.length, 0);
      return totalCargadas < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
