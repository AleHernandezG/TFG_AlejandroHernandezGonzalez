import mongoose, { Schema, Document } from "mongoose";
import {
  IReceta,
  IIngredienteReceta,
  IMacrosReceta,
  IComentarioReceta,
} from "../types/receta";

export interface IRecetaDoc extends IReceta, Document {}

const ingredienteSchema = new Schema<IIngredienteReceta>(
  {
    nombre: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    unidad: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const macrosSchema = new Schema<IMacrosReceta>(
  {
    calorias: { type: Number, required: true, min: 0 },
    proteinas: { type: Number, required: true, min: 0 },
    carbos: { type: Number, required: true, min: 0 },
    grasas: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const comentarioSchema = new Schema<IComentarioReceta>({
  autorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  autorNombre: { type: String, required: true, trim: true },
  avatarUrl: { type: String, default: null },
  texto: { type: String, required: true, trim: true, maxlength: 500 },
  fecha: { type: Date, default: Date.now },
});

const recetaSchema = new Schema<IRecetaDoc>({
  autorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  titulo: { type: String, required: true, trim: true, maxlength: 120 },
  descripcion: { type: String, required: true, trim: true, maxlength: 1200 },
  imagenUrl: { type: String, required: true },
  tiempo: { type: String, required: true },
  dificultad: {
    type: String,
    enum: ["Fácil", "Media", "Difícil"],
    required: true,
  },
  porciones: { type: Number, required: true, min: 1, default: 2 },
  categorias: { type: [String], default: [] },
  ingredientes: { type: [ingredienteSchema], default: [] },
  pasos: { type: [String], default: [] },
  alergenos: { type: [String], default: [] },
  macros: { type: macrosSchema, required: true },
  likes: { type: [Schema.Types.ObjectId], ref: "Usuario", default: [] },
  listaComentarios: { type: [comentarioSchema], default: [] },
  fechaPublicacion: { type: Date, default: Date.now },
});

export const Receta = mongoose.model<IRecetaDoc>("Receta", recetaSchema);
