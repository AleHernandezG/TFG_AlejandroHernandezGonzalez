import { z } from "zod";
import { filtrarDietas } from "./dietas";
import { ALERGENOS, AlergenoId } from "./ingredientes";

const MAX_MENSAJES_CHAT = 50;
const MAX_CHARS_MENSAJE_CHAT = 2000;
const MAX_CHARS_IMAGEN_BASE64 = 7_000_000;

export const esquemaAlergeno = z.enum(ALERGENOS as [AlergenoId, ...AlergenoId[]], {
  errorMap: (_issue, ctx) => ({
    message: `"${String(ctx.data)}" no es un alérgeno del catálogo`,
  }),
});

export const esquemaUrlImagen = z
  .string()
  .regex(/^https:\/\//, "La imagen debe ser una URL https, no una imagen incrustada");

export const esquemaFirmaSubida = z.object({
  tipo: z.enum(["receta", "avatar"]),
});

export const esquemaMacrosPreview = z.object({
  ingredientes: z
    .array(
      z.object({
        nombre:   z.string().min(1, "El nombre del ingrediente es obligatorio"),
        cantidad: z.string().default(""),
        unidad:   z.string().default(""),
      }),
    )
    .min(1, "Añade al menos un ingrediente")
    .max(50, "Demasiados ingredientes para calcular los macros"),
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

const OBLIGATORIOS_DESPENSA = "nombre, cantidad, unidad y emoji son obligatorios";

const camposDespensa = {
  nombre: z
    .string({ required_error: OBLIGATORIOS_DESPENSA })
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .max(80),
  cantidad: z
    .number({ required_error: OBLIGATORIOS_DESPENSA, invalid_type_error: "La cantidad tiene que ser un número" })
    .finite("La cantidad tiene que ser un número")
    .min(0, "La cantidad no puede ser negativa"),
  unidad: z
    .string({ required_error: OBLIGATORIOS_DESPENSA })
    .trim()
    .min(1, "La unidad no puede estar vacía")
    .max(20),
  emoji: z
    .string({ required_error: OBLIGATORIOS_DESPENSA })
    .trim()
    .min(1, "El emoji no puede estar vacío")
    .max(16),
};

const esquemaItemDespensa = z.object(camposDespensa, {
  invalid_type_error: OBLIGATORIOS_DESPENSA,
});

export const esquemaAnadirDespensa = z.preprocess(
  (cuerpo) => (Array.isArray(cuerpo) ? cuerpo : [cuerpo]),
  z.array(esquemaItemDespensa),
);

export const esquemaEditarDespensa = z
  .object({
    nombre: camposDespensa.nombre.optional(),
    cantidad: camposDespensa.cantidad.optional(),
    unidad: camposDespensa.unidad.optional(),
    emoji: camposDespensa.emoji.optional(),
  })
  .refine((cambios) => Object.keys(cambios).length > 0, {
    message: "Sin campos a actualizar",
  });

export const esquemaEscanearTicket = z.object({
  imagenBase64: z
    .string({ required_error: "imagenBase64 es obligatorio", invalid_type_error: "imagenBase64 es obligatorio" })
    .min(1, "imagenBase64 es obligatorio")
    .max(MAX_CHARS_IMAGEN_BASE64, "La imagen es demasiado grande (máximo ~5 MB)")
    .startsWith("data:image/", "El archivo debe ser una imagen"),
});

export const esquemaCompletarPerfil = z.object({
  alergias: z.array(esquemaAlergeno).default([]),
  preferencias: z.array(z.string()).default([]),
});

const ARRAYS_PREFERENCIAS = "dietas y alergenos deben ser arrays";

export const esquemaPreferencias = z.object({
  dietas: z.array(z.string(), { required_error: ARRAYS_PREFERENCIAS, invalid_type_error: ARRAYS_PREFERENCIAS }),
  alergenos: z.array(esquemaAlergeno, { required_error: ARRAYS_PREFERENCIAS, invalid_type_error: ARRAYS_PREFERENCIAS }),
});

const CONTRASENAS_OBLIGATORIAS = "contrasenaActual y contrasenaNueva son obligatorios";

export const esquemaCambiarContrasena = z.object({
  contrasenaActual: z
    .string({ required_error: CONTRASENAS_OBLIGATORIAS, invalid_type_error: CONTRASENAS_OBLIGATORIAS })
    .min(1, CONTRASENAS_OBLIGATORIAS),
  contrasenaNueva: z
    .string({ required_error: CONTRASENAS_OBLIGATORIAS, invalid_type_error: CONTRASENAS_OBLIGATORIAS })
    .min(1, CONTRASENAS_OBLIGATORIAS)
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
});

const MENSAJES_OBLIGATORIOS = "mensajes es obligatorio y debe ser un array no vacío";
const TEXTO_OBLIGATORIO = "Todos los mensajes deben tener texto";

const esquemaMensajeChat = z.object({
  rol: z.enum(["user", "model"], { errorMap: () => ({ message: "Rol de mensaje no válido" }) }),
  texto: z
    .string({ required_error: TEXTO_OBLIGATORIO, invalid_type_error: TEXTO_OBLIGATORIO })
    .max(MAX_CHARS_MENSAJE_CHAT, `Cada mensaje no puede superar ${MAX_CHARS_MENSAJE_CHAT} caracteres`)
    .refine((texto) => texto.trim().length > 0, TEXTO_OBLIGATORIO),
});

export const esquemaChat = z.object({
  mensajes: z
    .array(esquemaMensajeChat, { required_error: MENSAJES_OBLIGATORIOS, invalid_type_error: MENSAJES_OBLIGATORIOS })
    .min(1, MENSAJES_OBLIGATORIOS)
    .max(MAX_MENSAJES_CHAT, `El historial no puede superar ${MAX_MENSAJES_CHAT} mensajes`)
    .refine(
      (mensajes) => mensajes.length === 0 || mensajes[mensajes.length - 1].rol === "user",
      "El último mensaje debe ser del usuario",
    ),
  imagenBase64: z
    .string({ invalid_type_error: "imagenBase64 no válida" })
    .startsWith("data:image/", "imagenBase64 no válida")
    .max(MAX_CHARS_IMAGEN_BASE64, "La imagen no puede superar 5 MB")
    .optional(),
});

export const esquemaGenerarDesdeTexto = z.object({
  descripcion: z
    .string({ required_error: "descripcion es obligatoria", invalid_type_error: "descripcion es obligatoria" })
    .min(1, "descripcion es obligatoria")
    .trim()
    .min(10, "descripcion debe tener al menos 10 caracteres")
    .max(1000, "descripcion no puede superar 1000 caracteres"),
});

export const esquemaReenviarVerificacion = z.object({
  correo: z.string().trim().toLowerCase().email("Correo no válido"),
});

export const esquemaComentario = z.object({
  texto: z
    .string({ required_error: "El campo texto es obligatorio" })
    .trim()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "El comentario no puede superar 500 caracteres"),
});

export const esquemaCrearRecetaBody = z.object({
  titulo:       z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  descripcion:  z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(300),
  tiempo:       z.number().int().min(1, "El tiempo debe ser al menos 1"),
  unidadTiempo: z.enum(["min", "h"]),
  porciones:    z.number().int().min(1, "Debe haber al menos 1 porción"),
  dificultad:   z.enum(["facil", "media", "dificil"]),
  dietas:       z.array(z.string()).default([]).transform(filtrarDietas),
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

export const esquemaEditarRecetaBody = esquemaCrearRecetaBody.partial();

export type DatosCrearReceta = z.infer<typeof esquemaCrearRecetaBody>;
export type CambiosReceta = z.infer<typeof esquemaEditarRecetaBody>;
export type ItemsDespensaNuevos = z.infer<typeof esquemaAnadirDespensa>;
export type CuerpoChat = z.infer<typeof esquemaChat>;
