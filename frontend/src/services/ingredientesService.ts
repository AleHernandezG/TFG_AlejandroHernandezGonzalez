import { apiClient } from './apiClient'
import type { DatoIngrediente } from '@/config/ingredientes'

export const ingredientesService = {
  async buscarEdamam(query: string): Promise<DatoIngrediente[]> {
    try {
      const { data } = await apiClient.get<string[]>('/ingredientes/buscar', {
        params: { q: query },
      })
      return (data ?? []).map((nombre) => ({
        nombre,
        aliases: [],
        alergenos: [],
        categoria: 'otros' as const,
      }))
    } catch {
      return []
    }
  },
}
