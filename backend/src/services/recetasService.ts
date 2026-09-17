import { recetaRepository } from "../repositories/recetaRepository";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { DatosCrearRecetaBody, FiltrosFeed } from "../types/receta";
import { buscarFotoPexelsCascada } from "./imagenService";
import { alergenosDeReceta } from "../lib/ingredientes";
import { canonizarDieta, esRestriccionDeAlergeno, filtrarDietas } from "../lib/dietas";
import { eliminarImagen } from "../lib/cloudinary";

async function resolverAlergenos(
  delQuery: string[] | undefined,
  usuarioId?: string,
): Promise<string[] | undefined> {
  const delPerfil = usuarioId ? await usuarioRepository.obtenerAlergias(usuarioId) : [];
  const union = [...new Set([...delPerfil, ...(delQuery ?? [])])];
  return union.length > 0 ? union : undefined;
}

async function alergenosActualizados(
  recetaId: string,
  datos: Partial<DatosCrearRecetaBody>,
): Promise<string[] | undefined> {
  if (datos.ingredientes === undefined && datos.alergenos === undefined) return undefined;

  const actual =
    datos.ingredientes !== undefined && datos.alergenos !== undefined
      ? null
      : await recetaRepository.obtenerIngredientesYAlergenos(recetaId);

  const ingredientes = datos.ingredientes?.map((ing) => ing.nombre) ?? actual?.ingredientes ?? [];
  const declarados = datos.alergenos ?? actual?.alergenos ?? [];
  return alergenosDeReceta(ingredientes, declarados);
}

async function dietasActualizadas(
  recetaId: string,
  datos: Partial<DatosCrearRecetaBody>,
): Promise<string[] | undefined> {
  if (datos.dietas === undefined) return undefined;

  const guardadas = await recetaRepository.obtenerCategorias(recetaId);
  const ajenas = guardadas.filter(
    (categoria) => !canonizarDieta(categoria) && !esRestriccionDeAlergeno(categoria),
  );
  return [...new Set([...filtrarDietas(datos.dietas), ...ajenas])];
}

async function borrarImagenSiNadieLaUsa(imagenUrl: string | null) {
  if (!imagenUrl) return;
  try {
    if ((await recetaRepository.contarConImagen(imagenUrl)) > 0) return;
    await eliminarImagen(imagenUrl);
  } catch (err) {
    console.error("[Cloudinary] No se pudo borrar la imagen:", (err as Error).message);
  }
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
    const alergenos = alergenosDeReceta(
      datos.ingredientes.map((ing) => ing.nombre),
      datos.alergenos,
    );
    const dietas = filtrarDietas(datos.dietas);
    return recetaRepository.crear({ ...datos, alergenos, dietas }, autorId);
  },

  async actualizar(recetaId: string, usuarioId: string, datos: Partial<DatosCrearRecetaBody>) {
    try {
      const alergenos = await alergenosActualizados(recetaId, datos);
      const dietas = await dietasActualizadas(recetaId, datos);
      const { imagenAnterior } = await recetaRepository.actualizar(recetaId, usuarioId, {
        ...datos,
        alergenos,
        dietas,
      });
      await borrarImagenSiNadieLaUsa(imagenAnterior);
    } catch (err) {
      const e = err as Error & { status?: number };
      throw Object.assign(new Error(e.message), { status: e.status ?? 500 });
    }
  },

  async eliminar(recetaId: string, usuarioId: string) {
    try {
      const { imagenUrl } = await recetaRepository.eliminar(recetaId, usuarioId);
      await borrarImagenSiNadieLaUsa(imagenUrl);
    } catch (err) {
      const e = err as Error & { status?: number };
      throw Object.assign(new Error(e.message), { status: e.status ?? 500 });
    }
  },

  async obtenerFotoPreview(query: string) {
    return buscarFotoPexelsCascada(query);
  },
};
