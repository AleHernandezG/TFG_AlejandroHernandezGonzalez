import bcrypt from "bcryptjs";
import { usuarioRepository } from "../repositories/usuarioRepository";

const SALT_ROUNDS = 10;

export const usuariosService = {
  async toggleSeguir(seguidorId: string, seguidoId: string) {
    return usuarioRepository.toggleSeguir(seguidorId, seguidoId);
  },

  async obtenerPerfil(usuarioId: string) {
    const usuario = await usuarioRepository.buscarPerfilPorId(usuarioId);
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }
    return {
      nombre: usuario.nombre,
      correo: usuario.correo,
      foto: usuario.foto ?? null,
      alergias: usuario.alergias,
      preferencias: usuario.preferencias,
      proveedor: usuario.proveedor,
    };
  },

  async cambiarContrasena(
    usuarioId: string,
    contrasenaActual: string,
    contrasenaNueva: string,
  ) {
    const usuario = await usuarioRepository.buscarPorIdConContrasena(usuarioId);
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }
    if (usuario.proveedor !== "local" || !usuario.contrasena) {
      throw Object.assign(
        new Error("Este usuario no tiene contraseña propia"),
        { status: 400 },
      );
    }

    const coincide = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!coincide) {
      throw Object.assign(new Error("La contraseña actual es incorrecta"), {
        status: 400,
      });
    }

    const hash = await bcrypt.hash(contrasenaNueva, SALT_ROUNDS);
    await usuarioRepository.actualizarContrasena(usuarioId, hash);
  },

  async actualizarPreferencias(
    usuarioId: string,
    dietas: string[],
    alergenos: string[],
  ) {
    const usuario = await usuarioRepository.actualizarPreferencias(usuarioId, {
      preferencias: dietas,
      alergias: alergenos,
    });
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
    }
    return {
      nombre: usuario.nombre,
      correo: usuario.correo,
      foto: usuario.foto ?? null,
      alergias: usuario.alergias,
      preferencias: usuario.preferencias,
      proveedor: usuario.proveedor,
    };
  },
};
