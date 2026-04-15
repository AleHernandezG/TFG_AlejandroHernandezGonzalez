import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
  nombre: string;
  correo: string;
  contrasena?: string; // La ? significa que es opcional
  foto?: string;
  rol: "usuario" | "admin"; //Revisar si cambia funcionalidad por rol
  cuentaVerificada: boolean; //Se pone a true cuando el usuario verifica su correo
  proveedor: "local" | "google";
  googleId?: string;
  alergias: string[];
  preferencias: string[];
  fechaRegistro: Date;
}

const usuarioSchema = new Schema<IUsuario>({
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
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

export const Usuario = mongoose.model<IUsuario>("Usuario", usuarioSchema);
