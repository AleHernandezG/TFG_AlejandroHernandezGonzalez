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

export interface IFotoCredito {
  fotografo: string;
  urlFoto: string;
  urlPerfil: string;
}

export interface IReceta {
  autorId: Types.ObjectId;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  fotoFuente?: "usuario" | "pexels";
  fotoCredito?: IFotoCredito | null;
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
  esEvento?: boolean;
}

// ── Tipos de respuesta API (contrato con el frontend) ─────────────────────────

export interface FiltrosFeed {
  q?: string;
  dietas?: string[];
  dificultad?: string[];
  alergenos?: string[];
  pagina?: number;
  limite?: number;
  excluirPropio?: boolean;
  soloSiguiendo?: boolean;
  sort?: 'reciente' | 'likes' | 'score';
  soloEvento?: boolean;
  categoria?: string;
}

interface AutorRespuesta {
  id: string;
  nombre: string;
  username: string;
  avatarUrl: string;
}

export interface IFotoCreditoRespuesta {
  fotografo: string;
  urlFoto: string;
  urlPerfil: string;
}

interface DatosRecetaRespuesta {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  fotoFuente?: "usuario" | "pexels";
  fotoCredito?: IFotoCreditoRespuesta | null;
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
  sigueAlAutor: boolean;
  fechaPublicacion: string;
}

export interface RecetaColeccion {
  id: string
  titulo: string
  imagenUrl: string
  autor: { nombre: string; avatarUrl: string }
}

export interface DatosCrearRecetaBody {
  titulo: string
  descripcion: string
  tiempo: number
  unidadTiempo: 'min' | 'h'
  porciones: number
  dificultad: 'facil' | 'media' | 'dificil'
  dietas: string[]
  alergenos: string[]
  ingredientes: { nombre: string; cantidad: string; unidad: string }[]
  pasos: { texto: string }[]
  imagenUrl?: string
  fotoFuente?: 'usuario' | 'pexels'
  fotoCredito?: IFotoCredito | null
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
