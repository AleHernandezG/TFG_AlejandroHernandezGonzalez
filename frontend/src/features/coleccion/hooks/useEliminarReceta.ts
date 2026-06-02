'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { coleccionService } from '@/services/coleccionService'

export function useEliminarReceta() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recetaId: string) => coleccionService.eliminarReceta(recetaId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coleccion', 'mis-recetas'] })
      queryClient.invalidateQueries({ queryKey: ['recetas', 'feed'] })
    },
  })
}
