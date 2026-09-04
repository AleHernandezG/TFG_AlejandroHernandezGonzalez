import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { Usuario } from "../../src/models/usuarioMongo";
import { Receta } from "../../src/models/recetaMongo";
import { Token } from "../../src/models/tokenMongo";
import { firmarToken } from "../../src/lib/jwt";

export const CONTRASENA_VALIDA = "Test1234";

export async function crearUsuario(datos: Partial<{
  nombre: string;
  correo: string;
  contrasena: string;
  cuentaVerificada: boolean;
  proveedor: "local" | "google";
  googleId: string;
  alergias: string[];
  preferencias: string[];
}> = {}) {
  const contrasena = datos.contrasena ?? CONTRASENA_VALIDA;
  return Usuario.create({
    nombre: datos.nombre ?? "Usuario Test",
    correo: datos.correo ?? `test${Date.now()}${Math.random()}@cookr.dev`,
    contrasena: await bcrypt.hash(contrasena, 4),
    cuentaVerificada: datos.cuentaVerificada ?? true,
    proveedor: datos.proveedor ?? "local",
    googleId: datos.googleId,
    alergias: datos.alergias ?? [],
    preferencias: datos.preferencias ?? [],
  });
}

export function tokenDe(usuario: { _id: unknown; correo: string; rol: string }) {
  return firmarToken({
    id: String(usuario._id),
    correo: usuario.correo,
    rol: usuario.rol,
  });
}

export async function crearReceta(datos: Partial<{
  titulo: string;
  descripcion: string;
  autorId: Types.ObjectId;
  alergenos: string[];
  categorias: string[];
  dificultad: "Fácil" | "Media" | "Difícil";
  likes: Types.ObjectId[];
  comentarios: number;
  fechaPublicacion: Date;
}> = {}) {
  const autorId = datos.autorId ?? (await crearUsuario())._id as Types.ObjectId;
  return Receta.create({
    autorId,
    titulo: datos.titulo ?? "Receta de prueba",
    descripcion: datos.descripcion ?? "Una descripción suficientemente larga para el esquema.",
    imagenUrl: "https://example.com/foto.jpg",
    tiempo: "20 min",
    dificultad: datos.dificultad ?? "Fácil",
    porciones: 2,
    categorias: datos.categorias ?? [],
    ingredientes: [{ nombre: "Sal", cantidad: 1, unidad: "g" }],
    pasos: ["Un paso lo bastante largo como para valer."],
    alergenos: datos.alergenos ?? [],
    macros: { calorias: 100, proteinas: 1, carbos: 1, grasas: 1 },
    likes: datos.likes ?? [],
    listaComentarios: Array.from({ length: datos.comentarios ?? 0 }, () => ({
      autorId: autorId,
      autorNombre: "Comentarista",
      avatarUrl: null,
      texto: "Qué buena pinta.",
      fecha: new Date(),
    })),
    fechaPublicacion: datos.fechaPublicacion ?? new Date(),
  });
}

export function crearTokenVerificacion(userId: Types.ObjectId, opciones: { expira?: Date } = {}) {
  return Token.create({
    userId,
    token: `tok-verif-${Math.random().toString(16).slice(2)}`,
    tipo: "verificacion",
    expira: opciones.expira ?? new Date(Date.now() + 60_000),
  });
}

export function crearTokenRecuperacion(userId: Types.ObjectId, opciones: { expira?: Date } = {}) {
  return Token.create({
    userId,
    token: `tok-recup-${Math.random().toString(16).slice(2)}`,
    tipo: "recuperacion",
    expira: opciones.expira ?? new Date(Date.now() + 60_000),
  });
}
