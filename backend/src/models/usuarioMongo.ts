import mongoose, { Schema, Document } from "mongoose";
import { IUsuario } from "../types/usuario";

export interface IUsuarioDoc extends IUsuario, Document {}

const itemDespensaSchema = new Schema(
  {
    nombre:       { type: String, required: true, trim: true },
    cantidad:     { type: Number, required: true, min: 0 },
    unidad:       { type: String, required: true, trim: true },
    emoji:        { type: String, required: true },
    fechaAnadido: { type: Date, default: Date.now },
  },
  { _id: true },
);

const usuarioSchema = new Schema<IUsuarioDoc>({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  contrasena: {
    type: String,
    select: false, // nunca se devuelve en queries por defecto temas de seguridad
  },
  foto: {
    type: String,
  },
  rol: {
    type: String,
    enum: ["usuario", "admin"],
    default: "usuario",
  },
  cuentaVerificada: {
    type: Boolean,
    default: false,
  },
  perfilCompleto: {
    type: Boolean,
    default: false,
  },
  proveedor: {
    type: String,
    enum: ["local", "google"],
    required: true,
  },
  googleId: {
    type: String,
  },
  alergias: {
    type: [String],
    default: [],
  },
  preferencias: {
    type: [String],
    default: [],
  },
  recetasGuardadas: {
    type: [Schema.Types.ObjectId],
    ref: "Receta",
    default: [],
  },
  seguidos: {
    type: [Schema.Types.ObjectId],
    ref: "Usuario",
    default: [],
  },
  seguidores: {
    type: [Schema.Types.ObjectId],
    ref: "Usuario",
    default: [],
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
  despensa: {
    type: [itemDespensaSchema],
    default: [],
  },
});

usuarioSchema.index({ googleId: 1 }, { sparse: true });

export const Usuario = mongoose.model<IUsuarioDoc>("Usuario", usuarioSchema);
export type { IUsuario };
