'use client'

import { useDebounce } from '@/hooks/useDebounce'
import { useRecetasFeed } from './useRecetasFeed'
import { useMiPerfil } from '@/features/perfil/hooks/usePerfil'
import type { FiltrosAvanzados, PostFeed } from '../types/receta.types'

export interface ResultadoHomeFeed {
  posts: PostFeed[]
  // Índice donde empiezan las recomendaciones dentro de posts. -1 si no hay.
  indiceRecomendados: number
  cargando: boolean
  esError: boolean
  hayBusquedaOFiltros: boolean
}

export function useHomeFeed(
  busqueda: string,
  filtros: FiltrosAvanzados,
): ResultadoHomeFeed {
  const busquedaDebounciada = useDebounce(busqueda, 300)
  const buscando = busqueda !== busquedaDebounciada

  const { data: perfil } = useMiPerfil()

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
  // queda sin nada. Los alérgenos sí filtran (seguridad). Sirven de relleno
  // cuando no sigues a nadie o a quien sigues publica poco.
  const feedRecomendado = useRecetasFeed({
    filtrosAvanzados: {
      dietas: [],
      alergenos: perfil?.alergias ?? [],
      dificultad: [],
    },
    sort: 'score',
    excluirPropio: true,
    enabled: !hayBusquedaOFiltros,
  })

  const recetasBase = feedBase.data?.recetas ?? []

  if (hayBusquedaOFiltros) {
    return {
      posts: recetasBase,
      indiceRecomendados: -1,
      cargando: feedBase.isLoading || buscando,
      esError: feedBase.isError,
      hayBusquedaOFiltros,
    }
  }

  const idsBase = new Set(recetasBase.map((r) => r.id))
  const recomendadas = (feedRecomendado.data?.recetas ?? []).filter(
    (r) => !idsBase.has(r.id),
  )
  const posts = [...recetasBase, ...recomendadas]

  return {
    posts,
    indiceRecomendados: recomendadas.length > 0 ? recetasBase.length : -1,
    cargando: feedBase.isLoading || feedRecomendado.isLoading || buscando,
    esError: feedBase.isError,
    hayBusquedaOFiltros,
  }
}
