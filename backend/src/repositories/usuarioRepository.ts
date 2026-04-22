import { IUsuario } from "../types/usuario";
import { IUsuarioDoc, Usuario } from "../models/usuarioMongo";

interface DatosCrearUsuario {
  nombre: string;
  correo: string;
  contrasena?: string;
  foto?: string;
  cuentaVerificada?: boolean;
  proveedor: "local" | "google";
  googleId?: string;
}

interface DatosCompletarPerfil {
  alergias: string[];
  preferencias: string[];
}

export const usuarioRepository = {
  crear: (datos: DatosCrearUsuario): Promise<IUsuarioDoc> =>
    Usuario.create(datos),

  buscarPorCorreo: (correo: string): Promise<IUsuarioDoc | null> =>
    Usuario.findOne({ correo }),

  buscarPorGoogleId: (googleId: string): Promise<IUsuarioDoc | null> =>
    Usuario.findOne({ googleId }),

  buscarPorCorreoConContrasena: (correo: string): Promise<IUsuarioDoc | null> =>
    Usuario.findOne({ correo }).select("+contrasena"),

  buscarPorId: (id: string): Promise<IUsuarioDoc | null> =>
    Usuario.findById(id),

  existePorCorreo: async (correo: string): Promise<boolean> =>
    !!(await Usuario.exists({ correo })),

  actualizarVerificacion: (id: string): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(id, { cuentaVerificada: true }, { new: true }),

  actualizarContrasena: (id: string, contrasenaHash: string): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(id, { contrasena: contrasenaHash }, { new: true }),

  vincularGoogle: (
    id: string,
    datos: { googleId: string; foto?: string },
  ): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(
      id,
      {
        googleId: datos.googleId,
        ...(datos.foto ? { foto: datos.foto } : {}),
      },
      { new: true },
    ),

  completarPerfil: (id: string, datos: DatosCompletarPerfil): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(
      id,
      { alergias: datos.alergias, preferencias: datos.preferencias, perfilCompleto: true },
      { new: true },
    ),
};

export type { IUsuario };
