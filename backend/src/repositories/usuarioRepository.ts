import { IUsuario } from "../types/usuario";
import { IUsuarioDoc, Usuario } from "../models/usuarioMongo";

interface DatosCrearUsuario {
  nombre: string;
  correo: string;
  contrasena?: string;
  proveedor: "local" | "google";
  googleId?: string;
}

export const usuarioRepository = {
  crear: (datos: DatosCrearUsuario): Promise<IUsuarioDoc> =>
    Usuario.create(datos),

  buscarPorCorreo: (correo: string): Promise<IUsuarioDoc | null> =>
    Usuario.findOne({ correo }),

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
};

export type { IUsuario };
