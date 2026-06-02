import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { recetasService } from '@/services/recetasService'
import type { Comentario } from '../types/receta.types'

export function useComentarios(recetaId: string) {
  return useInfiniteQuery({
    queryKey: ['comentarios', recetaId],
    queryFn: ({ pageParam }) =>
      recetasService.obtenerComentarios(recetaId, pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hayMas ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 0,
  })
}

export function useInvalidarComentarios(recetaId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['comentarios', recetaId] })
}

export type { Comentario }
