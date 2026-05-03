import { apiClient } from "./apiClient";

export const usuariosService = {
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
