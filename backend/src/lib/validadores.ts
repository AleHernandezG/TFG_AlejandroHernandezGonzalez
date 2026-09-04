import { z } from "zod";

export const esquemaUrlImagen = z
  .string()
  .regex(/^https:\/\//, "La imagen debe ser una URL https, no una imagen incrustada");

export const esquemaFirmaSubida = z.object({
  tipo: z.enum(["receta", "avatar"]),
});

export const esquemaFotoUsuario = z.object({
  fotoUrl: esquemaUrlImagen,
});

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
  idToken: z.string().trim().min(1, "Falta el id_token de Google"),
});

export const esquemaEditarDespensa = z
  .object({
    nombre: z.string().trim().min(1, "El nombre no puede estar vacío").max(80).optional(),
    cantidad: z
      .number({ invalid_type_error: "La cantidad tiene que ser un número" })
      .finite("La cantidad tiene que ser un número")
      .min(0, "La cantidad no puede ser negativa")
      .optional(),
    unidad: z.string().trim().min(1, "La unidad no puede estar vacía").max(20).optional(),
    emoji: z.string().trim().min(1, "El emoji no puede estar vacío").max(16).optional(),
  })
  .refine((cambios) => Object.keys(cambios).length > 0, {
    message: "Sin campos a actualizar",
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
  imagenUrl: esquemaUrlImagen.optional(),
  fotoFuente: z.enum(["usuario", "pexels"]).optional(),
  fotoCredito: z
    .object({
      fotografo: z.string(),
      urlFoto: z.string(),
      urlPerfil: z.string(),
    })
    .nullish(),
});
