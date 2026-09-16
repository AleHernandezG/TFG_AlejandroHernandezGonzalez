'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'

export function useFotoPexelsPreview(titulo: string, necesitaFoto = true) {
  const { data: session } = useSession()
  const token = session?.user?.backendToken

  return useQuery({
    queryKey: ['foto-preview', titulo],
    queryFn: () => recetasService.obtenerFotoPreview(titulo, token!),
    enabled: necesitaFoto && !!token && !!titulo.trim(),
    staleTime: 5 * 60 * 1000,
  })
}
