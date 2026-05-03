import { recetaRepository } from "../repositories/recetaRepository";
import { FiltrosFeed } from "../types/receta";

export const recetasService = {
  async obtenerFeed(filtros: FiltrosFeed, usuarioId?: string) {
    return recetaRepository.findAll(filtros, usuarioId);
  },

  async obtenerPorId(id: string, usuarioId?: string) {
    const receta = await recetaRepository.findById(id, usuarioId);
    if (!receta) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }
    return receta;
  },

  async obtenerSimilares(recetaId: string, usuarioId?: string) {
    return recetaRepository.findSimilares(recetaId, usuarioId);
  },

  async toggleLike(recetaId: string, usuarioId: string) {
    return recetaRepository.toggleLike(recetaId, usuarioId);
  },

  async toggleGuardado(recetaId: string, usuarioId: string) {
    return recetaRepository.toggleGuardado(recetaId, usuarioId);
  },

  async agregarComentario(recetaId: string, usuarioId: string, texto: string) {
    if (!texto || texto.trim().length === 0) {
      throw Object.assign(new Error("El comentario no puede estar vacío"), { status: 400 });
    }
    if (texto.trim().length > 500) {
      throw Object.assign(new Error("El comentario no puede superar 500 caracteres"), { status: 400 });
    }
    return recetaRepository.agregarComentario(recetaId, usuarioId, texto);
  },
};
