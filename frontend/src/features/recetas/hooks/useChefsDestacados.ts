import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { usuariosService } from '@/services/usuariosService'

export function useChefsDestacados() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken

  return useQuery({
    queryKey: ['usuarios', 'destacados'],
    queryFn: () => usuariosService.obtenerDestacados(5, token),
    staleTime: 10 * 60 * 1000,
  })
}
