import { z } from "zod";

// ─── Esquema de validación para el formulario de registro ───────────────────

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede superar los 50 caracteres")
      .trim(),

    correo: z.string().email("Introduce un correo electrónico válido").trim(),

    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Za-z]/, "La contraseña debe contener al menos una letra")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),

    confirmarContrasena: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  });

export type DatosRegistro = z.infer<typeof esquemaRegistro>;

// ─── Estados posibles del formulario ────────────────────────────────────────

export type EstadoFormulario = "idle" | "cargando" | "exito" | "error";
