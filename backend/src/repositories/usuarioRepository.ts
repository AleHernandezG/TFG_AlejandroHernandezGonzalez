import { Usuario, IUsuario } from "../models/usuario.model";

interface DatosCrearUsuario {
  nombre: string;
  correo: string;
  contrasena?: string;
  proveedor: "local" | "google";
  googleId?: string;
}

export const usuarioRepository = {
  crear: (datos: DatosCrearUsuario): Promise<IUsuario> =>
    Usuario.create(datos),

  buscarPorCorreo: (correo: string): Promise<IUsuario | null> =>
    Usuario.findOne({ correo }),

  buscarPorCorreoConContrasena: (correo: string): Promise<IUsuario | null> =>
    Usuario.findOne({ correo }).select("+contrasena"),

  buscarPorId: (id: string): Promise<IUsuario | null> =>
    Usuario.findById(id),

  existePorCorreo: async (correo: string): Promise<boolean> =>
    !!(await Usuario.exists({ correo })),

  actualizarVerificacion: (id: string): Promise<IUsuario | null> =>
    Usuario.findByIdAndUpdate(id, { cuentaVerificada: true }, { new: true }),

  actualizarContrasena: (id: string, contrasenaHash: string): Promise<IUsuario | null> =>
    Usuario.findByIdAndUpdate(id, { contrasena: contrasenaHash }, { new: true }),
};
