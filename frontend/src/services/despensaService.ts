import { apiClient } from './apiClient'
import type { ItemDespensa } from '@/features/despensa/types/despensa.types'

type ItemRaw = ItemDespensa & { _id?: string }

function normalizar(item: ItemRaw): ItemDespensa {
  return { ...item, id: item._id ?? item.id }
}

export const despensaService = {
  async obtener(token: string): Promise<ItemDespensa[]> {
    const { data } = await apiClient.get<ItemRaw[]>('/despensa', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.map(normalizar)
  },

  async añadir(
    token: string,
    item: Omit<ItemDespensa, 'id'>,
  ): Promise<ItemDespensa[]> {
    const { data } = await apiClient.post<ItemRaw[]>('/despensa', item, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.map(normalizar)
  },

  async editar(
    token: string,
    itemId: string,
    cambios: Partial<Omit<ItemDespensa, 'id'>>,
  ): Promise<ItemDespensa[]> {
    const { data } = await apiClient.put<ItemRaw[]>(`/despensa/${itemId}`, cambios, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.map(normalizar)
  },

  async eliminar(token: string, itemId: string): Promise<ItemDespensa[]> {
    const { data } = await apiClient.delete<ItemRaw[]>(`/despensa/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.map(normalizar)
  },
}
