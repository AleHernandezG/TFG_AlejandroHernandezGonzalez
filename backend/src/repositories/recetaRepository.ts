import { Types } from "mongoose";
import { Receta } from "../models/recetaMongo";
import { Usuario } from "../models/usuarioMongo";
import {
  DatosCrearRecetaBody,
  FiltrosFeed,
  IComentarioReceta,
  IFotoCredito,
  PostFeedRespuesta,
  RecetaColeccion,
  RecetaDetalleRespuesta,
} from "../types/receta";
import { buscarFotoPexelsCascada } from "../services/imagenService";
import { calcularMacros } from "../services/nutritionService";

const MAPA_DIFICULTAD: Record<string, "Fácil" | "Media" | "Difícil"> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

type UsuarioPopulado = { _id: Types.ObjectId; nombre: string; foto?: string };

export interface RecetaCandidataDespensa {
  id: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  dificultad: string;
  imagenUrl: string;
  categorias: string[];
  ingredientes: string[];
  likes: number;
}

//Maria Isabel -> mariaisabel
function nombreAUsername(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_]/g, "");
}

function docAPostFeed(
  doc: Record<string, unknown>,
  usuarioId?: string,
  guardadasSet?: Set<string>,
  seguidosSet?: Set<string>,
): PostFeedRespuesta {
  const autor = doc.autorId as UsuarioPopulado;
  const id = (doc._id as Types.ObjectId).toString();
  const autorId = autor?._id?.toString() ?? "";
  const likesArr = doc.likes as Types.ObjectId[];
  const comentariosArr = doc.listaComentarios as unknown[];

  const liked = usuarioId
    ? likesArr.some((lid) => lid.toString() === usuarioId)
    : false;
  const guardado = guardadasSet ? guardadasSet.has(id) : false;
  const sigueAlAutor = seguidosSet ? seguidosSet.has(autorId) : false;

  return {
    id,
    autor: {
      id: autorId,
      nombre: autor?.nombre ?? "Cookr User",
      username: autor?.nombre ? nombreAUsername(autor.nombre) : "cookruser",
      avatarUrl:
        autor?.foto ?? `https://picsum.photos/seed/av${id.slice(-5)}/80/80`,
    },
    receta: {
      titulo: doc.titulo as string,
      descripcion: doc.descripcion as string,
      imagenUrl: doc.imagenUrl as string,
      fotoFuente: (doc.fotoFuente as "usuario" | "pexels" | undefined) ?? "usuario",
      fotoCredito: (doc.fotoCredito as IFotoCredito | null | undefined) ?? null,
      tiempo: doc.tiempo as string,
      dificultad: doc.dificultad as string,
      alergenos: (doc.alergenos as string[]) ?? [],
    },
    likes: likesArr.length,
    comentarios: comentariosArr.length,
    guardado,
    liked,
    sigueAlAutor,
    fechaPublicacion: (doc.fechaPublicacion as Date).toISOString(),
  };
}

async function obtenerGuardadasSet(usuarioId: string): Promise<Set<string>> {
  const usuario = await Usuario.findById(usuarioId)
    .select("recetasGuardadas")
    .lean()
    .exec();
  const ids = (usuario?.recetasGuardadas as Types.ObjectId[] | undefined) ?? [];
  return new Set(ids.map((id) => id.toString()));
}

async function obtenerSeguidosSet(usuarioId: string): Promise<Set<string>> {
  const usuario = await Usuario.findById(usuarioId)
    .select("seguidos")
    .lean()
    .exec();
  const ids = (usuario?.seguidos as Types.ObjectId[] | undefined) ?? [];
  return new Set(ids.map((id) => id.toString()));
}

async function obtenerPreferenciasUsuario(usuarioId: string): Promise<string[]> {
  const usuario = await Usuario.findById(usuarioId)
    .select("preferencias")
    .lean()
    .exec();
  return (usuario?.preferencias as string[] | undefined) ?? [];
}

function calcularScoreFeed(
  doc: Record<string, unknown>,
  ahora: Date,
  seguidosSet: Set<string>,
  preferencias: string[],
): number {
  const likes = (doc.likes as unknown[]).length;
  const comentarios = (doc.listaComentarios as unknown[]).length;
  const fecha = doc.fechaPublicacion as Date;
  const diasAntiguo = (ahora.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24);

  const popularidad = likes * 2 + comentarios * 3;
  const decay = 1 / (1 + Math.sqrt(Math.max(0, diasAntiguo)));

  const autor = doc.autorId as UsuarioPopulado;
  const autorIdStr = autor?._id?.toString() ?? "";
  const followBoost = seguidosSet.has(autorIdStr) ? 1.5 : 0;

  const categorias = (doc.categorias as string[]) ?? [];
  const prefBoost = categorias.filter((c) => preferencias.includes(c)).length * 0.5;

  return popularidad * decay + followBoost + prefBoost;
}

export const recetaRepository = {
  async findAll(
    filtros: FiltrosFeed = {},
    usuarioId?: string,
  ): Promise<{ recetas: PostFeedRespuesta[]; total: number }> {
    const {
      q, dietas, dificultad, alergenos, pagina = 1, limite = 20,
      excluirPropio, soloSiguiendo, sort, soloEvento, categoria,
    } = filtros;

    const query: Record<string, unknown> = {};

    if (q) {
      query["$or"] = [
        { titulo: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
      ];
    }
    if (dietas && dietas.length > 0) {
      query["categorias"] = { $in: dietas };
    }
    if (dificultad && dificultad.length > 0) {
      query["dificultad"] = { $in: dificultad };
    }
    if (alergenos && alergenos.length > 0) {
      query["alergenos"] = { $nin: alergenos };
    }
    if (excluirPropio && usuarioId) {
      query["autorId"] = { $ne: new Types.ObjectId(usuarioId) };
    }
    if (soloEvento) {
      query["esEvento"] = true;
    }
    if (categoria) {
      query["categorias"] = { $in: [categoria] };
    }
    if (soloSiguiendo && usuarioId) {
      const seguidosArr = [...(await obtenerSeguidosSet(usuarioId))].map(
        (id) => new Types.ObjectId(id),
      );
      query["autorId"] = { $in: seguidosArr };
    }

    const skip = (pagina - 1) * limite;

    const [guardadasSet, seguidosSet] = usuarioId
      ? await Promise.all([obtenerGuardadasSet(usuarioId), obtenerSeguidosSet(usuarioId)])
      : [undefined, undefined];

    let docs: unknown[];
    let total: number;

    if (sort === 'score') {
      const [todos, preferencias] = await Promise.all([
        Receta.find(query)
          .populate("autorId", "nombre foto")
          .lean()
          .exec(),
        usuarioId ? obtenerPreferenciasUsuario(usuarioId) : Promise.resolve<string[]>([]),
      ]);

      const ahora = new Date();
      const segSet = seguidosSet ?? new Set<string>();

      todos.sort((a, b) => {
        const sa = calcularScoreFeed(a as Record<string, unknown>, ahora, segSet, preferencias);
        const sb = calcularScoreFeed(b as Record<string, unknown>, ahora, segSet, preferencias);
        return sb - sa;
      });

      total = todos.length;
      docs = todos.slice(skip, skip + limite);
    } else if (sort === 'likes') {
      const todos = await Receta.find(query)
        .populate("autorId", "nombre foto")
        .sort({ fechaPublicacion: -1 })
        .lean()
        .exec();
      todos.sort(
        (a, b) =>
          ((b as Record<string, unknown>).likes as unknown[]).length -
          ((a as Record<string, unknown>).likes as unknown[]).length,
      );
      total = todos.length;
      docs = todos.slice(skip, skip + limite);
    } else {
      [docs, total] = await Promise.all([
        Receta.find(query)
          .populate("autorId", "nombre foto")
          .sort({ fechaPublicacion: -1 })
          .skip(skip)
          .limit(limite)
          .lean()
          .exec(),
        Receta.countDocuments(query),
      ]);
    }

    return {
      recetas: docs.map((doc) =>
        docAPostFeed(doc as Record<string, unknown>, usuarioId, guardadasSet, seguidosSet),
      ),
      total,
    };
  },

  async findById(
    id: string,
    usuarioId?: string,
  ): Promise<RecetaDetalleRespuesta | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await Receta.findById(id)
      .populate("autorId", "nombre foto")
      .lean()
      .exec();

    if (!doc) return null;

    const [guardadasSet, seguidosSet] = usuarioId
      ? await Promise.all([obtenerGuardadasSet(usuarioId), obtenerSeguidosSet(usuarioId)])
      : [undefined, undefined];

    const base = docAPostFeed(
      doc as Record<string, unknown>,
      usuarioId,
      guardadasSet,
      seguidosSet,
    );

    // Recetas similares: misma dificultad o categorías compartidas
    const similaresDocs = await Receta.find({
      _id: { $ne: id },
      $or: [
        { categorias: { $in: doc.categorias as string[] } },
        { dificultad: doc.dificultad },
      ],
    })
      .populate("autorId", "nombre foto")
      .sort({ fechaPublicacion: -1 })
      .limit(6)
      .lean()
      .exec();

    const similares = similaresDocs.map((s) =>
      docAPostFeed(s as Record<string, unknown>, usuarioId, guardadasSet, seguidosSet),
    );

    type ComentarioLean = {
      autorNombre: string;
      avatarUrl: string | null;
      texto: string;
      fecha: Date;
    };

    return {
      ...base,
      categorias: doc.categorias as string[],
      pasos: doc.pasos as string[],
      ingredientes: doc.ingredientes as {
        nombre: string;
        cantidad: number;
        unidad: string;
      }[],
      alergenos: doc.alergenos as string[],
      macros: doc.macros as {
        calorias: number;
        proteinas: number;
        carbos: number;
        grasas: number;
      },
      listaComentarios: (doc.listaComentarios as ComentarioLean[]).map((c) => ({
        autorNombre: c.autorNombre,
        avatarUrl: c.avatarUrl,
        texto: c.texto,
        fecha: c.fecha.toISOString(),
      })),
      similares,
      porciones: doc.porciones as number,
    };
  },

  async findSimilares(
    recetaId: string,
    usuarioId?: string,
  ): Promise<PostFeedRespuesta[]> {
    if (!Types.ObjectId.isValid(recetaId)) return [];

    const receta = await Receta.findById(recetaId)
      .select("categorias dificultad")
      .lean()
      .exec();

    if (!receta) return [];

    const guardadasSet = usuarioId
      ? await obtenerGuardadasSet(usuarioId)
      : undefined;

    const [guardadasSet2, seguidosSet2] = usuarioId
      ? await Promise.all([obtenerGuardadasSet(usuarioId), obtenerSeguidosSet(usuarioId)])
      : [undefined, undefined];

    const docs = await Receta.find({
      _id: { $ne: recetaId },
      $or: [
        { categorias: { $in: receta.categorias as string[] } },
        { dificultad: receta.dificultad },
      ],
    })
      .populate("autorId", "nombre foto")
      .sort({ fechaPublicacion: -1 })
      .limit(6)
      .lean()
      .exec();

    return docs.map((doc) =>
      docAPostFeed(doc as Record<string, unknown>, usuarioId, guardadasSet2, seguidosSet2),
    );
  },

  async toggleLike(
    recetaId: string,
    usuarioId: string,
  ): Promise<{ liked: boolean; totalLikes: number }> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const receta = await Receta.findById(recetaId);
    if (!receta) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const uid = new Types.ObjectId(usuarioId);
    const yaLiked = receta.likes.some((id) => id.equals(uid));

    if (yaLiked) {
      receta.likes = receta.likes.filter((id) => !id.equals(uid));
    } else {
      receta.likes.push(uid);
    }

    await receta.save();
    return { liked: !yaLiked, totalLikes: receta.likes.length };
  },

  async agregarComentario(
    recetaId: string,
    usuarioId: string,
    texto: string,
  ): Promise<{ autorNombre: string; avatarUrl: string | null; texto: string; fecha: string }> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const [receta, usuario] = await Promise.all([
      Receta.findById(recetaId),
      Usuario.findById(usuarioId).select("nombre foto").lean().exec(),
    ]);

    if (!receta) throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    if (!usuario) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

    const fecha = new Date();
    const comentario = {
      autorId: new Types.ObjectId(usuarioId),
      autorNombre: usuario.nombre,
      avatarUrl: usuario.foto ?? null,
      texto: texto.trim(),
      fecha,
    };

    receta.listaComentarios.push(comentario as IComentarioReceta);
    await receta.save();

    return {
      autorNombre: comentario.autorNombre,
      avatarUrl: comentario.avatarUrl,
      texto: comentario.texto,
      fecha: fecha.toISOString(),
    };
  },

  async toggleGuardado(
    recetaId: string,
    usuarioId: string,
  ): Promise<{ guardado: boolean }> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }

    const rid = new Types.ObjectId(recetaId);
    const guardadas = usuario.recetasGuardadas ?? [];
    const yaGuardado = guardadas.some((id) => id.equals(rid));

    if (yaGuardado) {
      usuario.recetasGuardadas = guardadas.filter((id) => !id.equals(rid));
    } else {
      usuario.recetasGuardadas = [...guardadas, rid];
    }

    await usuario.save();
    return { guardado: !yaGuardado };
  },

  async findGuardadas(usuarioId: string): Promise<RecetaColeccion[]> {
    const usuario = await Usuario.findById(usuarioId)
      .select("recetasGuardadas")
      .lean()
      .exec();
    const ids = (usuario?.recetasGuardadas as Types.ObjectId[] | undefined) ?? [];
    if (ids.length === 0) return [];

    const docs = await Receta.find({ _id: { $in: ids } })
      .populate("autorId", "nombre foto")
      .select("_id titulo imagenUrl autorId")
      .lean()
      .exec();

    return docs.map((doc) => {
      const autor = doc.autorId as unknown as { _id: Types.ObjectId; nombre: string; foto?: string };
      return {
        id: (doc._id as Types.ObjectId).toString(),
        titulo: doc.titulo as string,
        imagenUrl: doc.imagenUrl as string,
        autor: {
          nombre: autor?.nombre ?? "Cookr User",
          avatarUrl: autor?.foto ?? "",
        },
      };
    });
  },

  async findPorAutor(usuarioId: string): Promise<RecetaColeccion[]> {
    const docs = await Receta.find({ autorId: new Types.ObjectId(usuarioId) })
      .populate("autorId", "nombre foto")
      .select("_id titulo imagenUrl autorId")
      .sort({ fechaPublicacion: -1 })
      .lean()
      .exec();

    return docs.map((doc) => {
      const autor = doc.autorId as unknown as { _id: Types.ObjectId; nombre: string; foto?: string };
      return {
        id: (doc._id as Types.ObjectId).toString(),
        titulo: doc.titulo as string,
        imagenUrl: doc.imagenUrl as string,
        autor: {
          nombre: autor?.nombre ?? "Cookr User",
          avatarUrl: autor?.foto ?? "",
        },
      };
    });
  },

  async crear(datos: DatosCrearRecetaBody, autorId: string): Promise<{ id: string }> {
    const tiempoStr = `${datos.tiempo} ${datos.unidadTiempo}`;
    const dificultad = MAPA_DIFICULTAD[datos.dificultad];

    let imagenUrl = datos.imagenBase64 ?? "";
    let fotoFuente: "usuario" | "pexels" = datos.fotoFuente ?? "usuario";
    let fotoCredito: IFotoCredito | null = datos.fotoCredito ?? null;

    if (!imagenUrl) {
      const fotoPexels = await buscarFotoPexelsCascada(datos.titulo, datos.dietas);
      if (fotoPexels) {
        imagenUrl = fotoPexels.url;
        fotoFuente = "pexels";
        fotoCredito = {
          fotografo: fotoPexels.fotografo,
          urlFoto: fotoPexels.urlFoto,
          urlPerfil: fotoPexels.urlPerfil,
        };
      }
    }

    const doc = await Receta.create({
      autorId: new Types.ObjectId(autorId),
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagenUrl,
      fotoFuente,
      fotoCredito,
      tiempo: tiempoStr,
      dificultad,
      porciones: datos.porciones,
      categorias: datos.dietas,
      ingredientes: datos.ingredientes.map((ing) => ({
        nombre: ing.nombre,
        cantidad: parseFloat(ing.cantidad) || 0,
        unidad: ing.unidad,
      })),
      pasos: datos.pasos.map((p) => p.texto),
      alergenos: datos.alergenos,
      macros: await calcularMacros(
        datos.ingredientes.map((ing) => ({
          nombre: ing.nombre,
          cantidad: parseFloat(ing.cantidad) || 0,
          unidad: ing.unidad,
        })),
      ),
      likes: [],
      listaComentarios: [],
      fechaPublicacion: new Date(),
    });

    return { id: doc._id.toString() };
  },

  async findComentarios(
    id: string,
    pagina: number,
    limite: number,
  ): Promise<{
    comentarios: { autorNombre: string; avatarUrl: string | null; texto: string; fecha: string }[];
    total: number;
    hayMas: boolean;
  }> {
    if (!Types.ObjectId.isValid(id)) return { comentarios: [], total: 0, hayMas: false };

    const receta = await Receta.findById(id).select("listaComentarios").lean().exec();
    if (!receta) return { comentarios: [], total: 0, hayMas: false };

    type ComentarioLean = { autorNombre: string; avatarUrl: string | null; texto: string; fecha: Date };
    const todos = (receta.listaComentarios as ComentarioLean[]).slice().reverse();
    const total = todos.length;
    const skip = (pagina - 1) * limite;
    const comentarios = todos.slice(skip, skip + limite).map((c) => ({
      autorNombre: c.autorNombre,
      avatarUrl: c.avatarUrl,
      texto: c.texto,
      fecha: c.fecha.toISOString(),
    }));

    return { comentarios, total, hayMas: skip + limite < total };
  },

  async actualizar(
    recetaId: string,
    usuarioId: string,
    datos: Partial<DatosCrearRecetaBody>,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const receta = await Receta.findById(recetaId).select("autorId").lean().exec();
    if (!receta) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    if ((receta.autorId as Types.ObjectId).toString() !== usuarioId) {
      throw Object.assign(new Error("No tienes permiso para editar esta receta"), { status: 403 });
    }

    const update: Record<string, unknown> = {};

    if (datos.titulo !== undefined) update.titulo = datos.titulo;
    if (datos.descripcion !== undefined) update.descripcion = datos.descripcion;
    if (datos.tiempo !== undefined && datos.unidadTiempo !== undefined) {
      update.tiempo = `${datos.tiempo} ${datos.unidadTiempo}`;
    }
    if (datos.dificultad !== undefined) update.dificultad = MAPA_DIFICULTAD[datos.dificultad];
    if (datos.porciones !== undefined) update.porciones = datos.porciones;
    if (datos.dietas !== undefined) update.categorias = datos.dietas;
    if (datos.alergenos !== undefined) update.alergenos = datos.alergenos;
    if (datos.ingredientes !== undefined) {
      update.ingredientes = datos.ingredientes.map((ing) => ({
        nombre: ing.nombre,
        cantidad: parseFloat(ing.cantidad) || 0,
        unidad: ing.unidad,
      }));
    }
    if (datos.pasos !== undefined) update.pasos = datos.pasos.map((p) => p.texto);
    if (datos.imagenBase64 !== undefined) {
      update.imagenUrl = datos.imagenBase64;
      update.fotoFuente = datos.fotoFuente ?? "usuario";
      update.fotoCredito = datos.fotoCredito ?? null;
    }

    await Receta.findByIdAndUpdate(recetaId, { $set: update });
  },

  async eliminar(recetaId: string, usuarioId: string): Promise<void> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const receta = await Receta.findById(recetaId).select("autorId").lean().exec();
    if (!receta) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const autorIdStr = (receta.autorId as Types.ObjectId).toString();
    if (autorIdStr !== usuarioId) {
      throw Object.assign(new Error("No tienes permiso para eliminar esta receta"), { status: 403 });
    }

    await Receta.deleteOne({ _id: recetaId });
  },

  async buscarCandidatasParaDespensa(alergias: string[]): Promise<RecetaCandidataDespensa[]> {
    const query: Record<string, unknown> = {};
    if (alergias.length > 0) {
      query["alergenos"] = { $nin: alergias };
    }

    const docs = await Receta.find(query)
      .select("titulo descripcion tiempo dificultad imagenUrl categorias ingredientes likes")
      .lean()
      .exec();

    return docs.map((d) => {
      const doc = d as Record<string, unknown>;
      return {
        id: (doc._id as Types.ObjectId).toString(),
        titulo: doc.titulo as string,
        descripcion: doc.descripcion as string,
        tiempo: doc.tiempo as string,
        dificultad: doc.dificultad as string,
        imagenUrl: doc.imagenUrl as string,
        categorias: (doc.categorias as string[]) ?? [],
        ingredientes: ((doc.ingredientes as Array<{ nombre: string }>) ?? []).map((i) => i.nombre),
        likes: ((doc.likes as unknown[]) ?? []).length,
      };
    });
  },
};
