import { Types } from "mongoose";

export interface IComentario {
  recetaId: Types.ObjectId;
  autorId: Types.ObjectId;
  autorNombre: string;
  avatarUrl: string | null;
  texto: string;
  fecha: Date;
}

export interface ComentarioRespuesta {
  autorNombre: string;
  avatarUrl: string | null;
  texto: string;
  fecha: string;
}

export interface PaginaComentarios {
  comentarios: ComentarioRespuesta[];
  total: number;
  hayMas: boolean;
}
