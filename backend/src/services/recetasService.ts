import { recetaRepository } from "../repositories/recetaRepository";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { DatosCrearRecetaBody, FiltrosFeed } from "../types/receta";
import { buscarFotoPexelsCascada } from "./imagenService";

async function resolverAlergenos(
  delQuery: string[] | undefined,
  usuarioId?: string,
): Promise<string[] | undefined> {
  const delPerfil = usuarioId ? await usuarioRepository.obtenerAlergias(usuarioId) : [];
  const union = [...new Set([...delPerfil, ...(delQuery ?? [])])];
  return union.length > 0 ? union : undefined;
}

export const recetasService = {
  async obtenerFeed(filtros: FiltrosFeed, usuarioId?: string) {
    const alergenos = await resolverAlergenos(filtros.alergenos, usuarioId);
    return recetaRepository.findAll({ ...filtros, alergenos }, usuarioId);
  },

  async obtenerPorId(id: string, usuarioId?: string) {
    const alergenos = await resolverAlergenos(undefined, usuarioId);
    const receta = await recetaRepository.findById(id, usuarioId, alergenos);
    if (!receta) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }
    return receta;
  },

  async obtenerSimilares(recetaId: string, usuarioId?: string) {
    const alergenos = await resolverAlergenos(undefined, usuarioId);
    return recetaRepository.findSimilares(recetaId, usuarioId, alergenos);
  },

  async toggleLike(recetaId: string, usuarioId: string) {
    return recetaRepository.toggleLike(recetaId, usuarioId);
  },

  async toggleGuardado(recetaId: string, usuarioId: string) {
    return recetaRepository.toggleGuardado(recetaId, usuarioId);
  },

  async obtenerComentarios(id: string, pagina: number, limite: number) {
    return recetaRepository.findComentarios(id, pagina, limite);
  },

  async agregarComentario(recetaId: string, usuarioId: string, texto: string) {
    return recetaRepository.agregarComentario(recetaId, usuarioId, texto);
  },

  async obtenerGuardadas(usuarioId: string) {
    return recetaRepository.findGuardadas(usuarioId);
  },

  async obtenerMisRecetas(usuarioId: string) {
    return recetaRepository.findPorAutor(usuarioId);
  },

  async crear(datos: DatosCrearRecetaBody, autorId: string) {
    return recetaRepository.crear(datos, autorId);
  },

  async actualizar(recetaId: string, usuarioId: string, datos: Partial<DatosCrearRecetaBody>) {
    try {
      await recetaRepository.actualizar(recetaId, usuarioId, datos);
    } catch (err) {
      const e = err as Error & { status?: number };
      throw Object.assign(new Error(e.message), { status: e.status ?? 500 });
    }
  },

  async eliminar(recetaId: string, usuarioId: string) {
    try {
      await recetaRepository.eliminar(recetaId, usuarioId);
    } catch (err) {
      const e = err as Error & { status?: number };
      throw Object.assign(new Error(e.message), { status: e.status ?? 500 });
    }
  },

  async obtenerFotoPreview(query: string) {
    return buscarFotoPexelsCascada(query);
  },
};
