import { Types } from "mongoose";

// ── Interfaces de dominio (forma del documento MongoDB) ──────────────────────

export interface IIngredienteReceta {
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface IMacrosReceta {
  calorias: number;
  proteinas: number;
  carbos: number;
  grasas: number;
}

export interface IComentarioReceta {
  autorId: Types.ObjectId;
  autorNombre: string;
  avatarUrl: string | null;
  texto: string;
  fecha: Date;
}

export interface IReceta {
  autorId: Types.ObjectId;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  tiempo: string;
  dificultad: "Fácil" | "Media" | "Difícil";
  porciones: number;
  categorias: string[];
  ingredientes: IIngredienteReceta[];
  pasos: string[];
  alergenos: string[];
  macros: IMacrosReceta;
  likes: Types.ObjectId[];
  listaComentarios: IComentarioReceta[];
  fechaPublicacion: Date;
}

// ── Tipos de respuesta API (contrato con el frontend) ─────────────────────────

export interface FiltrosFeed {
  q?: string; //Texto de búsqueda -> Macarrones con tomate
  dificultad?: string[];
  alergenos?: string[];
  //Par no mostarr todas las recetas de golpe sino por paginas y cuantas por pagina
  pagina?: number;
  limite?: number;
}

interface AutorRespuesta {
  nombre: string;
  username: string;
  avatarUrl: string;
}

interface DatosRecetaRespuesta {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  tiempo: string;
  dificultad: string;
  alergenos: string[];
}

export interface PostFeedRespuesta {
  id: string;
  autor: AutorRespuesta;
  receta: DatosRecetaRespuesta;
  likes: number;
  comentarios: number;
  guardado: boolean;
  liked: boolean;
  fechaPublicacion: string;
}

export interface RecetaDetalleRespuesta extends PostFeedRespuesta {
  categorias: string[];
  pasos: string[];
  ingredientes: { nombre: string; cantidad: number; unidad: string }[];
  alergenos: string[];
  macros: {
    calorias: number;
    proteinas: number;
    carbos: number;
    grasas: number;
  };
  listaComentarios: {
    autorNombre: string;
    avatarUrl: string | null;
    texto: string;
    fecha: string;
  }[];
  similares: PostFeedRespuesta[];
  porciones: number;
}
