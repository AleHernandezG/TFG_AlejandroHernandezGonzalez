'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useMisRecetas() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''

  return useQuery({
    queryKey: ['coleccion', 'mis-recetas', token],
    queryFn: () => coleccionService.obtenerMisRecetas(token),
    enabled: !!token,
    staleTime: 0,
  })
}
