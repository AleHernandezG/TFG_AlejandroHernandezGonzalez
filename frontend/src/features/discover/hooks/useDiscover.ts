'use client'

import { useQuery } from '@tanstack/react-query'
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

  const sort = tab === 'valorados' ? 'likes' : 'reciente'
  const soloEvento = tab === 'evento'
  // lowercase para que coincida con los valores en MongoDB ('vegano', 'pasta'…)
  const categoriaParam = categoria && categoria !== 'Todos' ? categoria.toLowerCase() : undefined

  return useQuery({
    queryKey: ['discover', q ?? '', categoria, tab, filtrosAvanzados, !!token],
    queryFn: async () => {
      const resp = await recetasService.obtenerFeed(
        {
          q: q || undefined,
          sort,
          soloEvento,
          categoria: categoriaParam,
          limite: 30,
          dietas: filtrosAvanzados?.dietas?.length ? filtrosAvanzados.dietas : undefined,
          dificultad: filtrosAvanzados?.dificultad?.length ? filtrosAvanzados.dificultad : undefined,
          alergenos: filtrosAvanzados?.alergenos?.length ? filtrosAvanzados.alergenos : undefined,
        },
        token,
      )
      return resp.recetas.map(postFeedARecetaDiscover)
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
