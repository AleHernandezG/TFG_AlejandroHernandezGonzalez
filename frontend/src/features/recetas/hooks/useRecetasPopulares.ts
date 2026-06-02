import { useQuery } from '@tanstack/react-query'
import { recetasService } from '@/services/recetasService'

export function useRecetasPopulares() {
  return useQuery({
    queryKey: ['recetas', 'populares'],
    queryFn: () => recetasService.obtenerFeed({ sort: 'likes', limite: 5 }),
    staleTime: 5 * 60 * 1000,
  })
}
