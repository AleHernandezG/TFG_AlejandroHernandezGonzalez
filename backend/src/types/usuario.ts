export interface IUsuario {
  nombre: string;
  correo: string;
  contrasena?: string;
  foto?: string;
  rol: "usuario" | "admin";
  cuentaVerificada: boolean;
  proveedor: "local" | "google";
  googleId?: string;
  alergias: string[];
  preferencias: string[];
  fechaRegistro: Date;
}
