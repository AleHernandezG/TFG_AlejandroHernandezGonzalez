import { Types } from "mongoose";
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

interface DatosActualizarPreferencias {
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
    Usuario.findOne({ correo }).select("+contrasena nombre correo foto rol perfilCompleto cuentaVerificada"),

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

  buscarPerfilPorId: (id: string): Promise<IUsuarioDoc | null> =>
    Usuario.findById(id).select("nombre correo foto alergias preferencias proveedor"),

  actualizarPreferencias: (
    id: string,
    datos: DatosActualizarPreferencias,
  ): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(
      id,
      { alergias: datos.alergias, preferencias: datos.preferencias },
      { new: true },
    ).select("nombre correo foto alergias preferencias proveedor"),

  buscarPorIdConContrasena: (id: string): Promise<IUsuarioDoc | null> =>
    Usuario.findById(id).select("+contrasena"),

  actualizarFoto: (id: string, foto: string): Promise<IUsuarioDoc | null> =>
    Usuario.findByIdAndUpdate(id, { foto }, { new: true }).select("foto"),

  async findDestacados(
    limite: number,
    usuarioId?: string,
  ): Promise<{ id: string; nombre: string; foto: string | null; seguidores: number; siguiendo: boolean }[]> {
    const usuarios = await Usuario.find({ perfilCompleto: true })
      .select("nombre foto seguidores")
      .lean()
      .exec();

    return usuarios
      .map((u) => ({
        id: (u._id as Types.ObjectId).toString(),
        nombre: u.nombre,
        foto: (u.foto as string | undefined) ?? null,
        seguidores: ((u.seguidores as Types.ObjectId[] | undefined) ?? []).length,
        siguiendo: usuarioId
          ? ((u.seguidores as Types.ObjectId[] | undefined) ?? []).some(
              (id) => id.toString() === usuarioId,
            )
          : false,
      }))
      .filter((u) => u.id !== usuarioId)
      .sort((a, b) => b.seguidores - a.seguidores)
      .slice(0, limite);
  },

  async toggleSeguir(
    seguidorId: string,
    seguidoId: string,
  ): Promise<{ siguiendo: boolean }> {
    if (!Types.ObjectId.isValid(seguidorId) || !Types.ObjectId.isValid(seguidoId)) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }
    if (seguidorId === seguidoId) {
      throw Object.assign(new Error("No puedes seguirte a ti mismo"), { status: 400 });
    }

    const [seguidor, seguido] = await Promise.all([
      Usuario.findById(seguidorId),
      Usuario.findById(seguidoId),
    ]);

    if (!seguidor || !seguido) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }

    const seguidoObjId = new Types.ObjectId(seguidoId);
    const seguidorObjId = new Types.ObjectId(seguidorId);
    const yaSiguiendo = (seguidor.seguidos ?? []).some((id) => id.equals(seguidoObjId));

    if (yaSiguiendo) {
      seguidor.seguidos = (seguidor.seguidos ?? []).filter((id) => !id.equals(seguidoObjId));
      seguido.seguidores = (seguido.seguidores ?? []).filter((id) => !id.equals(seguidorObjId));
    } else {
      seguidor.seguidos = [...(seguidor.seguidos ?? []), seguidoObjId];
      seguido.seguidores = [...(seguido.seguidores ?? []), seguidorObjId];
    }

    await Promise.all([seguidor.save(), seguido.save()]);
    return { siguiendo: !yaSiguiendo };
  },
};

export type { IUsuario };
