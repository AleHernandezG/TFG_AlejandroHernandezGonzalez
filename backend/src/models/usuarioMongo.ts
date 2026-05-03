import mongoose, { Schema, Document } from "mongoose";
import { IUsuario } from "../types/usuario";

export interface IUsuarioDoc extends IUsuario, Document {}

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
});

export const Usuario = mongoose.model<IUsuarioDoc>("Usuario", usuarioSchema);
export type { IUsuario };
