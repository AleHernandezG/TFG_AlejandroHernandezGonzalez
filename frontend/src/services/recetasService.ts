import { apiClient } from "./apiClient";
import type { PostFeed, RecetaDetalle, FiltrosAvanzados } from "@/features/recetas/types/receta.types";

export interface FiltrosFeed {
  q?: string;
  dificultad?: string[];
  alergenos?: string[];
  pagina?: number;
  limite?: number;
}

export interface RespuestaFeed {
  recetas: PostFeed[];
  total: number;
}

function serializarFiltros(filtros: FiltrosFeed): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtros.q) params.q = filtros.q;
  if (filtros.dificultad?.length) params.dificultad = filtros.dificultad.join(",");
  if (filtros.alergenos?.length) params.alergenos = filtros.alergenos.join(",");
  if (filtros.pagina) params.pagina = String(filtros.pagina);
  if (filtros.limite) params.limite = String(filtros.limite);
  return params;
}

export const recetasService = {
  async obtenerFeed(filtros: FiltrosFeed = {}, token?: string): Promise<RespuestaFeed> {
    const { data } = await apiClient.get<RespuestaFeed>("/recetas", {
      params: serializarFiltros(filtros),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  },

  async obtenerPorId(id: string, token?: string): Promise<RecetaDetalle | null> {
    try {
      const { data } = await apiClient.get<RecetaDetalle>(`/recetas/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return data;
    } catch {
      return null;
    }
  },

  async obtenerSimilares(recetaId: string, token?: string): Promise<PostFeed[]> {
    const { data } = await apiClient.get<PostFeed[]>(`/recetas/${recetaId}/similares`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  },

  async toggleLike(recetaId: string, token: string): Promise<{ liked: boolean; totalLikes: number }> {
    const { data } = await apiClient.post<{ liked: boolean; totalLikes: number }>(
      `/recetas/${recetaId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },

  async toggleGuardado(recetaId: string, token: string): Promise<{ guardado: boolean }> {
    const { data } = await apiClient.post<{ guardado: boolean }>(
      `/recetas/${recetaId}/guardar`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },
};

export type { FiltrosAvanzados };
