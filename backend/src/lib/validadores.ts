import { z } from "zod";

export const esquemaRegistro = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50).trim(),
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Za-z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export const esquemaLogin = z.object({
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export const esquemaRecuperar = z.object({
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
});

export const esquemaNuevaContrasena = z.object({
  token: z.string().min(1, "Token obligatorio"),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Za-z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export const esquemaVerificarEmail = z.object({
  token: z.string().min(1, "Token obligatorio"),
});

export const esquemaGoogleOAuth = z.object({
  googleId: z.string().min(1, "Google ID obligatorio"),
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
  nombre: z.string().trim().min(1).catch("Usuario"),
  foto: z.string().url().optional().catch(undefined),
});

export const esquemaCompletarPerfil = z.object({
  alergias: z.array(z.string()).default([]),
  preferencias: z.array(z.string()).default([]),
});

export const esquemaReenviarVerificacion = z.object({
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
});

export const esquemaCrearRecetaBody = z.object({
  titulo:       z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  descripcion:  z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(300),
  tiempo:       z.number().int().min(1, "El tiempo debe ser al menos 1"),
  unidadTiempo: z.enum(["min", "h"]),
  porciones:    z.number().int().min(1, "Debe haber al menos 1 porción"),
  dificultad:   z.enum(["facil", "media", "dificil"]),
  dietas:       z.array(z.string()).default([]),
  alergenos:    z.array(z.string()).default([]),
  ingredientes: z
    .array(
      z.object({
        nombre:   z.string().min(1, "El nombre del ingrediente es obligatorio"),
        cantidad: z.string().min(1, "La cantidad es obligatoria"),
        unidad:   z.string(),
      }),
    )
    .min(1, "Añade al menos un ingrediente"),
  pasos: z
    .array(z.object({ texto: z.string().min(10, "El paso debe tener al menos 10 caracteres") }))
    .min(1, "Añade al menos un paso"),
  imagenBase64: z.string().optional(),
  fotoFuente: z.enum(["usuario", "pexels"]).optional(),
  fotoCredito: z
    .object({
      fotografo: z.string(),
      urlFoto: z.string(),
      urlPerfil: z.string(),
    })
    .nullish(),
});
