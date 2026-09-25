'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'

type IngredientePreview = { nombre: string; cantidad: string; unidad: string }

export function useMacrosPreview(ingredientes: IngredientePreview[]) {
  const { data: session } = useSession()
  const token = session?.user?.backendToken

  const conNombre = ingredientes.filter((i) => i.nombre.trim())

  return useQuery({
    queryKey: ['macros-preview', conNombre],
    queryFn: () => recetasService.obtenerMacrosPreview(conNombre, token!),
    enabled: !!token && conNombre.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
