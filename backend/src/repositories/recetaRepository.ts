import { Types } from "mongoose";
import { Receta } from "../models/recetaMongo";
import { Usuario } from "../models/usuarioMongo";
import {
  FiltrosFeed,
  PostFeedRespuesta,
  RecetaDetalleRespuesta,
} from "../types/receta";

type UsuarioPopulado = { _id: Types.ObjectId; nombre: string; foto?: string };

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
): PostFeedRespuesta {
  const autor = doc.autorId as UsuarioPopulado;
  const id = (doc._id as Types.ObjectId).toString();
  const likesArr = doc.likes as Types.ObjectId[];
  const comentariosArr = doc.listaComentarios as unknown[];

  const liked = usuarioId
    ? likesArr.some((lid) => lid.toString() === usuarioId)
    : false;
  const guardado = guardadasSet ? guardadasSet.has(id) : false;

  return {
    id,
    autor: {
      nombre: autor?.nombre ?? "Cookr User",
      username: autor?.nombre ? nombreAUsername(autor.nombre) : "cookruser",
      avatarUrl:
        autor?.foto ?? `https://picsum.photos/seed/av${id.slice(-5)}/80/80`,
    },
    receta: {
      titulo: doc.titulo as string,
      descripcion: doc.descripcion as string,
      imagenUrl: doc.imagenUrl as string,
      tiempo: doc.tiempo as string,
      dificultad: doc.dificultad as string,
      alergenos: (doc.alergenos as string[]) ?? [],
    },
    likes: likesArr.length,
    comentarios: comentariosArr.length,
    guardado,
    liked,
    fechaPublicacion: (doc.fechaPublicacion as Date).toISOString(),
  };
}

//Para si ahy que buscar una receta si un usuario la tiene guardada quq evaya mas rapido
async function obtenerGuardadasSet(usuarioId: string): Promise<Set<string>> {
  const usuario = await Usuario.findById(usuarioId)
    .select("recetasGuardadas")
    .lean()
    .exec();
  const ids = (usuario?.recetasGuardadas as Types.ObjectId[] | undefined) ?? [];
  return new Set(ids.map((id) => id.toString()));
}

export const recetaRepository = {
  async findAll(
    filtros: FiltrosFeed = {},
    usuarioId?: string,
  ): Promise<{ recetas: PostFeedRespuesta[]; total: number }> {
    const { q, dificultad, alergenos, pagina = 1, limite = 20 } = filtros;

    const query: Record<string, unknown> = {};

    if (q) {
      query["$or"] = [
        { titulo: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
      ];
    }
    if (dificultad && dificultad.length > 0) {
      query["dificultad"] = { $in: dificultad };
    }
    if (alergenos && alergenos.length > 0) {
      // Excluir recetas que tengan alguno de los alérgenos indicados
      query["alergenos"] = { $nin: alergenos };
    }

    // Solo traemos las recetas de la página solicitada, no todas de golpe
    const skip = (pagina - 1) * limite;

    //   Receta.find(query)           // busca recetas que cumplan los filtros
    // .populate("autorId",       // en vez de guardar solo el ID del autor,
    //    "nombre foto")          // trae su nombre y foto directamente
    // .sort({ fechaPublicacion: -1 })  // ordena de más nueva a más antigua
    // .skip(skip)                // salta las recetas de páginas anteriores
    // .limit(limite)             // coge solo las de esta página (ej: 20)
    // .lean()                    // devuelve objetos JS simples, no documentos Mongoose (más rápido)
    // .exec()                    // ejecuta la consulta

    const [docs, total] = await Promise.all([
      Receta.find(query)
        .populate("autorId", "nombre foto")
        .sort({ fechaPublicacion: -1 })
        .skip(skip)
        .limit(limite)
        .lean()
        .exec(),
      Receta.countDocuments(query), //Toatal de recetas que se devuelven
    ]);

    //Sacar en un set las recetas guardadas de un user para que sea mas rapido las consulta
    const guardadasSet = usuarioId
      ? await obtenerGuardadasSet(usuarioId)
      : undefined;

    return {
      recetas: docs.map((doc) =>
        docAPostFeed(doc as Record<string, unknown>, usuarioId, guardadasSet),
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

    const guardadasSet = usuarioId
      ? await obtenerGuardadasSet(usuarioId)
      : undefined;

    const base = docAPostFeed(
      doc as Record<string, unknown>,
      usuarioId,
      guardadasSet,
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
      docAPostFeed(s as Record<string, unknown>, usuarioId, guardadasSet),
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
      docAPostFeed(doc as Record<string, unknown>, usuarioId, guardadasSet),
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
};
