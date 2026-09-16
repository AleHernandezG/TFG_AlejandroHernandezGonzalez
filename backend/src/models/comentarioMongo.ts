import mongoose, { Schema, Document } from "mongoose";
import { IComentario } from "../types/comentario";

export interface IComentarioDoc extends IComentario, Document {}

const comentarioSchema = new Schema<IComentarioDoc>({
  recetaId: { type: Schema.Types.ObjectId, ref: "Receta", required: true },
  autorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  autorNombre: { type: String, required: true, trim: true },
  avatarUrl: { type: String, default: null },
  texto: { type: String, required: true, trim: true, maxlength: 500 },
  fecha: { type: Date, default: Date.now },
});

comentarioSchema.index({ recetaId: 1, fecha: -1, _id: -1 });

export const Comentario = mongoose.model<IComentarioDoc>("Comentario", comentarioSchema);
