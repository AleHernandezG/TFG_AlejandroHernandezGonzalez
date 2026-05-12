'use client'

import { useQuery } from '@tanstack/react-query'
import { recetasService } from '@/services/recetasService'

export function useFotoPexelsPreview(titulo: string) {
  return useQuery({
    queryKey: ['foto-preview', titulo],
    queryFn: () => recetasService.obtenerFotoPreview(titulo),
    enabled: !!titulo.trim(),
    staleTime: 5 * 60 * 1000,
  })
}
