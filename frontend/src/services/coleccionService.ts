import { apiClient } from './apiClient'
import type { RecetaColeccion } from '@/features/coleccion/types/coleccion.types'

export const coleccionService = {
  async obtenerGuardadas(token: string): Promise<RecetaColeccion[]> {
    const { data } = await apiClient.get<RecetaColeccion[]>('/recetas/guardadas', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async obtenerMisRecetas(token: string): Promise<RecetaColeccion[]> {
    const { data } = await apiClient.get<RecetaColeccion[]>('/recetas/mis-recetas', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async eliminarReceta(recetaId: string, token: string): Promise<void> {
    await apiClient.delete(`/recetas/${recetaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}
