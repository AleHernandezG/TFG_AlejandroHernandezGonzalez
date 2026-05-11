'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useRecetasGuardadas() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''

  return useQuery({
    queryKey: ['coleccion', 'guardadas', token],
    queryFn: () => coleccionService.obtenerGuardadas(token),
    enabled: !!token,
    staleTime: 0,
  })
}
