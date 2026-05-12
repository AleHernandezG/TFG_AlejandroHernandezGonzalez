'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { despensaService } from '@/services/despensaService'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

const QUERY_KEY = ['despensa']

export function useMiDespensa() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => despensaService.obtener(token),
    enabled: !!token,
    staleTime: 0,
  })
}

export function useAñadirItem() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (item: Omit<ItemDespensa, 'id'>) =>
      despensaService.añadir(token, item),
    onMutate: async (nuevoItem) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const prev = qc.getQueryData<ItemDespensa[]>(QUERY_KEY)
      const optimista: ItemDespensa = { ...nuevoItem, id: `optimista-${Date.now()}` }
      qc.setQueryData<ItemDespensa[]>(QUERY_KEY, (old) => [...(old ?? []), optimista])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(QUERY_KEY, ctx.prev)
    },
    onSuccess: (items) => {
      qc.setQueryData(QUERY_KEY, items)
    },
  })
}

export function useEditarItem() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      cambios,
    }: {
      id: string
      cambios: Partial<Omit<ItemDespensa, 'id'>>
    }) => despensaService.editar(token, id, cambios),
    onMutate: async ({ id, cambios }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const prev = qc.getQueryData<ItemDespensa[]>(QUERY_KEY)
      qc.setQueryData<ItemDespensa[]>(QUERY_KEY, (old) =>
        (old ?? []).map((item) => (item.id === id ? { ...item, ...cambios } : item)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(QUERY_KEY, ctx.prev)
    },
    onSuccess: (items) => {
      qc.setQueryData(QUERY_KEY, items)
    },
  })
}

export function useEliminarItem() {
  const { data: session } = useSession()
  const token = session?.user?.backendToken ?? ''
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => despensaService.eliminar(token, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY })
      const prev = qc.getQueryData<ItemDespensa[]>(QUERY_KEY)
      qc.setQueryData<ItemDespensa[]>(QUERY_KEY, (old) =>
        (old ?? []).filter((item) => item.id !== id),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(QUERY_KEY, ctx.prev)
    },
    onSuccess: (items) => {
      qc.setQueryData(QUERY_KEY, items)
    },
  })
}
