import { apiClient } from "./apiClient";

export type ChefDestacado = {
  id: string
  nombre: string
  foto: string | null
  seguidores: number
  siguiendo: boolean
}

export const usuariosService = {
  async obtenerDestacados(limite = 5, token?: string): Promise<ChefDestacado[]> {
    const { data } = await apiClient.get<ChefDestacado[]>('/usuarios/destacados', {
      params: { limite },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data;
  },

  async toggleSeguir(
    usuarioId: string,
    token: string,
  ): Promise<{ siguiendo: boolean }> {
    const { data } = await apiClient.post<{ siguiendo: boolean }>(
      `/usuarios/${usuarioId}/seguir`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return data;
  },
};
