import bcrypt from "bcryptjs";
import crypto from "crypto";
import { usuarioRepository } from "../repositories/usuarioRepository";
import { tokenRepository } from "../repositories/tokenRepository";
import { firmarToken } from "../lib/jwt";
import { Types } from "mongoose";

const SALT_ROUNDS = 10;
const EXPIRACION_VERIFICACION_MS = 24 * 60 * 60 * 1000; // 24 horas
const EXPIRACION_RECUPERACION_MS = 60 * 60 * 1000; // 1 hora

export const authService = {
  async registrarse(datos: {
    nombre: string;
    correo: string;
    contrasena: string;
  }) {
    const existe = await usuarioRepository.existePorCorreo(datos.correo);
    if (existe) {
      const error = new Error("Este correo ya está registrado") as Error & {
        status: number;
      };
      error.status = 409;
      throw error;
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, SALT_ROUNDS);

    const usuario = await usuarioRepository.crear({
      nombre: datos.nombre,
      correo: datos.correo,
      contrasena: contrasenaHash,
      proveedor: "local",
    });

    // Token de verificación — cadena aleatoria (no JWT para que no expire con la firma)
    const tokenValor = crypto.randomBytes(32).toString("hex");
    await tokenRepository.crear({
      userId: usuario._id as Types.ObjectId, // El ID del usuario creado
      token: tokenValor,
      tipo: "verificacion",
      expira: new Date(Date.now() + EXPIRACION_VERIFICACION_MS),
    });

    // TODO [Fase 6]: enviar email con Resend usando tokenValor
    return {
      mensaje:
        "Registro completado. Revisa tu correo para verificar la cuenta.",
    };
  },

  async iniciarSesion(datos: { correo: string; contrasena: string }) {
    const usuario = await usuarioRepository.buscarPorCorreoConContrasena(
      datos.correo,
    );

    if (!usuario || !usuario.contrasena) {
      const error = new Error("Credenciales incorrectas") as Error & {
        status: number;
      };
      error.status = 401;
      throw error;
    }

    const contrasenaValida = await bcrypt.compare(
      datos.contrasena,
      usuario.contrasena,
    );
    if (!contrasenaValida) {
      const error = new Error("Credenciales incorrectas") as Error & {
        status: number;
      };
      error.status = 401;
      throw error;
    }

    if (!usuario.cuentaVerificada) {
      const error = new Error(
        "Debes verificar tu correo antes de iniciar sesión",
      ) as Error & { status: number };
      error.status = 403;
      throw error;
    }

    const token = firmarToken({
      id: (usuario._id as Types.ObjectId).toString(),
      correo: usuario.correo,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        foto: usuario.foto,
        rol: usuario.rol,
      },
      perfilCompleto: usuario.perfilCompleto,
    };
  },

  async verificarEmail(datos: { token: string }) {
    const tokenDoc = await tokenRepository.buscarPorToken(datos.token);

    if (!tokenDoc || tokenDoc.tipo !== "verificacion") {
      const error = new Error(
        "Token de verificación inválido o expirado",
      ) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (tokenDoc.expira < new Date()) {
      const error = new Error(
        "El enlace de verificación ha expirado",
      ) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    await usuarioRepository.actualizarVerificacion(tokenDoc.userId.toString());
    await tokenRepository.invalidar(
      (tokenDoc._id as Types.ObjectId).toString(),
    );

    return {
      mensaje: "Email verificado correctamente. Ya puedes iniciar sesión.",
    };
  },

  async solicitarRecuperacion(datos: { correo: string }) {
    const usuario = await usuarioRepository.buscarPorCorreo(datos.correo);

    // Respuesta genérica siempre, no revela si el correo existe
    const respuesta = {
      mensaje:
        "Si existe una cuenta con ese correo, recibirás un enlace de recuperación.",
    };

    if (!usuario) return respuesta;

    const tokenValor = crypto.randomBytes(32).toString("hex");
    await tokenRepository.crear({
      userId: usuario._id as Types.ObjectId,
      token: tokenValor,
      tipo: "recuperacion",
      expira: new Date(Date.now() + EXPIRACION_RECUPERACION_MS),
    });

    // TODO [Fase 6]: enviar email con Resend usando tokenValor
    return respuesta;
  },

  async restablecerContrasena(datos: { token: string; contrasena: string }) {
    const tokenDoc = await tokenRepository.buscarPorToken(datos.token);

    if (!tokenDoc || tokenDoc.tipo !== "recuperacion") {
      const error = new Error(
        "Token de recuperación inválido o expirado",
      ) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    if (tokenDoc.expira < new Date()) {
      const error = new Error(
        "El enlace de recuperación ha expirado",
      ) as Error & { status: number };
      error.status = 400;
      throw error;
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, SALT_ROUNDS);
    await usuarioRepository.actualizarContrasena(
      tokenDoc.userId.toString(),
      contrasenaHash,
    );
    await tokenRepository.invalidar(
      (tokenDoc._id as Types.ObjectId).toString(),
    );

    return {
      mensaje:
        "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    };
  },

  async iniciarSesionGoogle(datos: {
    googleId: string;
    correo: string;
    nombre: string;
    foto?: string;
  }) {
    // Buscar primero por googleId (usuario ya vinculado), luego por correo (cuenta local preexistente)
    let usuario =
      await usuarioRepository.buscarPorGoogleId(datos.googleId) ??
      await usuarioRepository.buscarPorCorreo(datos.correo);

    if (!usuario) {
      usuario = await usuarioRepository.crear({
        nombre: datos.nombre,
        correo: datos.correo,
        foto: datos.foto,
        proveedor: "google",
        googleId: datos.googleId,
        cuentaVerificada: true,
      });
    } else if (!usuario.googleId) {
      // Cuenta local que usa el mismo correo → vincular googleId y foto si no tenía
      usuario = (await usuarioRepository.vincularGoogle(
        (usuario._id as Types.ObjectId).toString(),
        { googleId: datos.googleId, ...(datos.foto && !usuario.foto ? { foto: datos.foto } : {}) },
      ))!;
    }

    const token = firmarToken({
      id: (usuario._id as Types.ObjectId).toString(),
      correo: usuario.correo,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        foto: usuario.foto,
        rol: usuario.rol,
      },
      perfilCompleto: usuario.perfilCompleto,
    };
  },

  async completarPerfil(userId: string, datos: { alergias: string[]; preferencias: string[] }) {
    const usuario = await usuarioRepository.completarPerfil(userId, datos);
    if (!usuario) {
      const error = new Error("Usuario no encontrado") as Error & { status: number };
      error.status = 404;
      throw error;
    }
    return { mensaje: "Perfil completado correctamente." };
  },
};
