import { Types } from "mongoose";

export interface IUsuario {
  nombre: string;
  correo: string;
  contrasena?: string;
  foto?: string;
  rol: "usuario" | "admin";
  cuentaVerificada: boolean;
  perfilCompleto: boolean;
  proveedor: "local" | "google";
  googleId?: string;
  alergias: string[];
  preferencias: string[];
  recetasGuardadas?: Types.ObjectId[];
  seguidos?: Types.ObjectId[];
  seguidores?: Types.ObjectId[];
  fechaRegistro: Date;
}
