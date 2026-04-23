import { z } from "zod";

export const esquemaRegistro = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50).trim(),
  correo: z.string().email("Correo no válido").trim().toLowerCase(),
  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Za-z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número"),
});

export const esquemaLogin = z.object({
  correo: z.string().email("Correo no válido").trim().toLowerCase(),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export const esquemaRecuperar = z.object({
  correo: z.string().email("Correo no válido").trim().toLowerCase(),
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
  correo: z.string().email("Correo no válido").trim().toLowerCase(),
  nombre: z.string().min(1, "Nombre obligatorio").trim(),
  foto: z.string().url().optional(),
});

export const esquemaCompletarPerfil = z.object({
  alergias: z.array(z.string()).default([]),
  preferencias: z.array(z.string()).default([]),
});

export const esquemaReenviarVerificacion = z.object({
  correo: z.string().email("Correo no válido").trim().toLowerCase(),
});
