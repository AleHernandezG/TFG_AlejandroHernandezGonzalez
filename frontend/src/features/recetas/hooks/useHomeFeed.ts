'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { useRecetasFeed } from './useRecetasFeed'
import type { FiltrosAvanzados, PostFeed } from '../types/receta.types'

export interface ResultadoHomeFeed {
  posts: PostFeed[]
  // Índice donde empiezan las recomendaciones dentro de posts. -1 si no hay.
  indiceRecomendados: number
  cargando: boolean
  esError: boolean
  hayBusquedaOFiltros: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function useHomeFeed(
  busqueda: string,
  filtros: FiltrosAvanzados,
): ResultadoHomeFeed {
  const busquedaDebounciada = useDebounce(busqueda, 300)
  const buscando = busqueda !== busquedaDebounciada

  const hayBusquedaOFiltros =
    !!busquedaDebounciada ||
    filtros.dietas.length > 0 ||
    filtros.alergenos.length > 0 ||
    filtros.dificultad.length > 0

  // Si buscas o filtras, se busca en todas las recetas; si no, en las de quien sigues.
  const feedBase = useRecetasFeed({
    q: busquedaDebounciada,
    filtrosAvanzados: filtros,
    excluirPropio: true,
    soloSiguiendo: !hayBusquedaOFiltros,
  })

  // Recomendaciones personalizadas. Las preferencias puntúan (sort 'score'),
  // no filtran: así un usuario con un gusto que ninguna receta tiene no se
  // queda sin nada. Los alérgenos del perfil los aplica el backend a todo el
  // feed, no hace falta mandarlos. Sirven de relleno cuando no sigues a nadie
  // o a quien sigues publica poco.
  const feedRecomendado = useRecetasFeed({
    filtrosAvanzados: {
      dietas: [],
      alergenos: [],
      dificultad: [],
    },
    sort: 'score',
    excluirPropio: true,
    enabled: !hayBusquedaOFiltros,
  })

  const recetasBase = feedBase.data?.pages.flatMap((page) => page.recetas) ?? []
  const recomendadas = feedRecomendado.data?.pages.flatMap((page) => page.recetas) ?? []

  const hasNextPage = hayBusquedaOFiltros
    ? !!feedBase.hasNextPage
    : (!!feedBase.hasNextPage || !!feedRecomendado.hasNextPage)

  const isFetchingNextPage = hayBusquedaOFiltros
    ? !!feedBase.isFetchingNextPage
    : (!!feedBase.isFetchingNextPage || !!feedRecomendado.isFetchingNextPage)

  const fetchNextPage = () => {
    if (hayBusquedaOFiltros) {
      feedBase.fetchNextPage()
    } else {
      if (feedBase.hasNextPage) {
        feedBase.fetchNextPage()
      } else if (feedRecomendado.hasNextPage) {
        feedRecomendado.fetchNextPage()
      }
    }
  }

  if (hayBusquedaOFiltros) {
    return {
      posts: recetasBase,
      indiceRecomendados: -1,
      cargando: feedBase.isLoading || buscando,
      esError: feedBase.isError,
      hayBusquedaOFiltros,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    }
  }

  const idsBase = new Set(recetasBase.map((r) => r.id))
  const recomendadasFiltradas = recomendadas.filter(
    (r) => !idsBase.has(r.id),
  )
  const posts = [...recetasBase, ...recomendadasFiltradas]

  return {
    posts,
    indiceRecomendados: recomendadasFiltradas.length > 0 ? recetasBase.length : -1,
    cargando: feedBase.isLoading || feedRecomendado.isLoading || buscando,
    esError: feedBase.isError,
    hayBusquedaOFiltros,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  }
}
