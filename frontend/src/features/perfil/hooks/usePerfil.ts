'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { perfilService } from '@/services/perfilService'
import { subidasService } from '@/services/subidasService'

const QUERY_KEY = ['perfil'] as const

export function useMiPerfil() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => perfilService.getMiPerfil(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCambiarContrasena() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''

  return useMutation({
    mutationFn: ({
      contrasenaActual,
      contrasenaNueva,
    }: {
      contrasenaActual: string
      contrasenaNueva: string
    }) => perfilService.cambiarContrasena(token, contrasenaActual, contrasenaNueva),
  })
}

export function useActualizarPreferencias() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      dietas,
      alergenos,
    }: {
      dietas: string[]
      alergenos: string[]
    }) => perfilService.actualizarPreferencias(token, dietas, alergenos),

    onMutate: async ({ dietas, alergenos }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const prev = qc.getQueryData(QUERY_KEY)
      qc.setQueryData(QUERY_KEY, (old: ReturnType<typeof useMiPerfil>['data']) => {
        if (!old) return old
        return { ...old, preferencias: dietas, alergias: alergenos }
      })
      return { prev }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev)
    },

    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEY, data)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useSubirFoto() {
  const { data: session, update } = useSession()
  const token = session?.user?.backendToken ?? ''
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (fichero: File) => {
      const url = await subidasService.subirImagen(fichero, 'avatar', token)
      return perfilService.subirFoto(token, url)
    },
    onSuccess: async (data) => {
      qc.setQueryData(QUERY_KEY, (old: ReturnType<typeof useMiPerfil>['data']) => {
        if (!old) return old
        return { ...old, foto: data.foto }
      })
      await update({ image: data.foto })
    },
  })
}

export function extraerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? 'Error al procesar la solicitud'
  }
  return 'Error al procesar la solicitud'
}
