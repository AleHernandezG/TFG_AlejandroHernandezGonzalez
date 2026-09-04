import { PipelineStage, Types } from "mongoose";
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

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function etapasScore(
  ahora: Date,
  seguidos: Types.ObjectId[],
  preferencias: string[],
): PipelineStage[] {
  const diasAntiguo = {
    $divide: [{ $subtract: [ahora, "$fechaPublicacion"] }, MS_POR_DIA],
  };

  const popularidad = {
    $add: [
      { $multiply: [{ $size: "$likes" }, 2] },
      { $multiply: [{ $size: "$listaComentarios" }, 3] },
    ],
  };

  const decay = {
    $divide: [1, { $add: [1, { $sqrt: { $max: [0, diasAntiguo] } }] }],
  };

  const followBoost = { $cond: [{ $in: ["$autorId", seguidos] }, 1.5, 0] };

  const prefBoost = {
    $multiply: [
      {
        $size: {
          $filter: { input: "$categorias", cond: { $in: ["$$this", preferencias] } },
        },
      },
      0.5,
    ],
  };

  return [
    { $addFields: { score: { $add: [{ $multiply: [popularidad, decay] }, followBoost, prefBoost] } } },
    { $sort: { score: -1, fechaPublicacion: -1 } },
  ];
}

function etapasLikes(): PipelineStage[] {
  return [
    { $addFields: { numLikes: { $size: "$likes" } } },
    { $sort: { numLikes: -1, fechaPublicacion: -1 } },
  ];
}

async function paginarOrdenado(
  query: Record<string, unknown>,
  etapas: PipelineStage[],
  skip: number,
  limite: number,
): Promise<{ docs: unknown[]; total: number }> {
  const [docs, total] = await Promise.all([
    Receta.aggregate([
      { $match: query },
      ...etapas,
      { $skip: skip },
      { $limit: limite },
    ]).exec(),
    Receta.countDocuments(query),
  ]);

  await Receta.populate(docs, { path: "autorId", select: "nombre foto" });

  return { docs, total };
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      const busqueda = escaparRegex(q);
      query["$or"] = [
        { titulo: { $regex: busqueda, $options: "i" } },
        { descripcion: { $regex: busqueda, $options: "i" } },
      ];
    }
    const categorias: Record<string, unknown> = {};
    if (dietas && dietas.length > 0) {
      categorias["$in"] = dietas;
    }
    if (categoria) {
      categorias["$all"] = [categoria];
    }
    if (Object.keys(categorias).length > 0) {
      query["categorias"] = categorias;
    }

    if (dificultad && dificultad.length > 0) {
      query["dificultad"] = { $in: dificultad };
    }
    if (alergenos && alergenos.length > 0) {
      query["alergenos"] = { $nin: alergenos };
    }
    if (soloEvento) {
      query["esEvento"] = true;
    }

    const autor: Record<string, unknown> = {};
    if (excluirPropio && usuarioId) {
      autor["$ne"] = new Types.ObjectId(usuarioId);
    }
    if (soloSiguiendo && usuarioId) {
      autor["$in"] = [...(await obtenerSeguidosSet(usuarioId))].map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (Object.keys(autor).length > 0) {
      query["autorId"] = autor;
    }

    const skip = (pagina - 1) * limite;

    const [guardadasSet, seguidosSet] = usuarioId
      ? await Promise.all([obtenerGuardadasSet(usuarioId), obtenerSeguidosSet(usuarioId)])
      : [undefined, undefined];

    let docs: unknown[];
    let total: number;

    if (sort === 'score') {
      const preferencias = usuarioId ? await obtenerPreferenciasUsuario(usuarioId) : [];
      const seguidos = [...(seguidosSet ?? [])].map((id) => new Types.ObjectId(id));
      ({ docs, total } = await paginarOrdenado(
        query,
        etapasScore(new Date(), seguidos, preferencias),
        skip,
        limite,
      ));
    } else if (sort === 'likes') {
      ({ docs, total } = await paginarOrdenado(query, etapasLikes(), skip, limite));
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
    alergenos?: string[],
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
      ...(alergenos && alergenos.length > 0 ? { alergenos: { $nin: alergenos } } : {}),
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
    alergenos?: string[],
  ): Promise<PostFeedRespuesta[]> {
    if (!Types.ObjectId.isValid(recetaId)) return [];

    const receta = await Receta.findById(recetaId)
      .select("categorias dificultad")
      .lean()
      .exec();

    if (!receta) return [];

    const [guardadasSet, seguidosSet] = usuarioId
      ? await Promise.all([obtenerGuardadasSet(usuarioId), obtenerSeguidosSet(usuarioId)])
      : [undefined, undefined];

    const docs = await Receta.find({
      _id: { $ne: recetaId },
      ...(alergenos && alergenos.length > 0 ? { alergenos: { $nin: alergenos } } : {}),
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
      docAPostFeed(doc as Record<string, unknown>, usuarioId, guardadasSet, seguidosSet),
    );
  },

  async toggleLike(
    recetaId: string,
    usuarioId: string,
  ): Promise<{ liked: boolean; totalLikes: number }> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const uid = new Types.ObjectId(usuarioId);
    const yaLiked = (await Receta.exists({ _id: recetaId, likes: uid })) !== null;

    const actualizada = await Receta.findByIdAndUpdate(
      recetaId,
      yaLiked ? { $pull: { likes: uid } } : { $addToSet: { likes: uid } },
      { new: true, projection: { likes: 1 } },
    )
      .lean()
      .exec();

    if (!actualizada) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    return {
      liked: !yaLiked,
      totalLikes: (actualizada.likes as Types.ObjectId[]).length,
    };
  },

  async agregarComentario(
    recetaId: string,
    usuarioId: string,
    texto: string,
  ): Promise<{ autorNombre: string; avatarUrl: string | null; texto: string; fecha: string }> {
    if (!Types.ObjectId.isValid(recetaId)) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

    const [existeReceta, usuario] = await Promise.all([
      Receta.exists({ _id: recetaId }),
      Usuario.findById(usuarioId).select("nombre foto").lean().exec(),
    ]);

    if (!existeReceta) throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    if (!usuario) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

    const fecha = new Date();
    const comentario: IComentarioReceta = {
      autorId: new Types.ObjectId(usuarioId),
      autorNombre: usuario.nombre,
      avatarUrl: usuario.foto ?? null,
      texto: texto.trim(),
      fecha,
    } as IComentarioReceta;

    const { matchedCount } = await Receta.updateOne(
      { _id: recetaId },
      { $push: { listaComentarios: comentario } },
    );

    if (matchedCount === 0) {
      throw Object.assign(new Error("Receta no encontrada"), { status: 404 });
    }

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

    const rid = new Types.ObjectId(recetaId);
    const yaGuardado =
      (await Usuario.exists({ _id: usuarioId, recetasGuardadas: rid })) !== null;

    const actualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      yaGuardado ? { $pull: { recetasGuardadas: rid } } : { $addToSet: { recetasGuardadas: rid } },
      { new: true, projection: { _id: 1 } },
    )
      .lean()
      .exec();

    if (!actualizado) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }

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

  async buscarCandidatasParaDespensa(
    alergias: string[],
    preferencias: string[] = [],
  ): Promise<RecetaCandidataDespensa[]> {
    const query: Record<string, unknown> = {};
    if (alergias.length > 0) {
      query["alergenos"] = { $nin: alergias };
    }

    const docs = await Receta.aggregate([
      { $match: query },
      {
        $addFields: {
          prefBoost: {
            $size: {
              $filter: { input: "$categorias", cond: { $in: ["$$this", preferencias] } },
            },
          },
          numLikes: { $size: "$likes" },
        },
      },
      { $sort: { prefBoost: -1, numLikes: -1, fechaPublicacion: -1 } },
      {
        $project: {
          titulo: 1, descripcion: 1, tiempo: 1, dificultad: 1,
          imagenUrl: 1, categorias: 1, ingredientes: 1, numLikes: 1,
        },
      },
    ])
      .allowDiskUse(true)
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
        likes: (doc.numLikes as number) ?? 0,
      };
    });
  },
};
