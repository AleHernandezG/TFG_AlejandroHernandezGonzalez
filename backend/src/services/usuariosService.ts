import { usuarioRepository } from "../repositories/usuarioRepository";

export const usuariosService = {
  async toggleSeguir(seguidorId: string, seguidoId: string) {
    return usuarioRepository.toggleSeguir(seguidorId, seguidoId);
  },
};
