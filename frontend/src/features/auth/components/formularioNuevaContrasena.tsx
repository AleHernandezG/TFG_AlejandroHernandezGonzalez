"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2, ChefHat, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  esquemaNuevaContrasena,
  type DatosNuevaContrasena,
  type EstadoFormulario,
} from "@/features/auth/types/autenticacion";

// ─── Variantes de animación ──────────────────────────────────────────────────

const variantesContenedor: Variants = {
  oculto: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const variantesForm: Variants = {
  oculto: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const variantesCampo: Variants = {
  oculto: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  /** Token de recuperación leído de la query string por la página padre */
  token: string;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function FormularioNuevaContrasena({ token }: Props) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoFormulario>("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosNuevaContrasena>({
    resolver: zodResolver(esquemaNuevaContrasena),
    defaultValues: { contrasena: "", confirmarContrasena: "" },
  });

  const alEnviar = async (datos: DatosNuevaContrasena) => {
    setEstadoEnvio("cargando");
    setMensajeError(null);

    try {
      // TODO [AUTH-009] Fase 4+6: llamar a POST /api/auth/nueva-contrasena
      // El backend validará el token (firma + expiración), actualizará la contraseña
      // con bcrypt e invalidará el token para que no pueda reutilizarse.
      console.log("[FormularioNuevaContrasena] Cambio de contraseña mock:", {
        token,
        longitud: datos.contrasena.length,
      });
      await new Promise((r) => setTimeout(r, 1000));
      setEstadoEnvio("exito");
    } catch {
      setMensajeError(
        "No se pudo cambiar la contraseña. El enlace puede haber expirado."
      );
      setEstadoEnvio("error");
    }
  };

  // ── Estado éxito ────────────────────────────────────────────────────────────
  if (estadoEnvio === "exito") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full"
      >
        <Card className="border-border/60 shadow-lg shadow-black/5">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <CheckCircle2 className="h-14 w-14 text-[var(--chart-3)]" aria-hidden />
            </motion.div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tu contraseña se ha cambiado correctamente. Ya puedes iniciar
                sesión con tu nueva contraseña.
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ── Formulario ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={variantesContenedor}
      initial="oculto"
      animate="visible"
      className="w-full"
    >
      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardHeader className="space-y-1 pb-5">
          <Link
            href="/"
            className="mb-1 flex w-fit items-center gap-1.5 text-brand transition-opacity hover:opacity-70"
            aria-label="Volver a Cookr"
          >
            <ChefHat className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">Cookr</span>
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Nueva contraseña
          </CardTitle>
          <CardDescription>
            Elige una contraseña segura. Debe tener al menos 8 caracteres,
            con letras y números.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Error global */}
          {estadoEnvio === "error" && mensajeError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {mensajeError}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit(alEnviar)}
            className="space-y-4"
            variants={variantesForm}
            initial="oculto"
            animate="visible"
            noValidate
          >
            {/* Campo: Nueva contraseña */}
            <motion.div variants={variantesCampo} className="space-y-1.5">
              <Label htmlFor="contrasena">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres, con letras y números"
                  autoComplete="new-password"
                  aria-invalid={!!errors.contrasena}
                  className="pr-9"
                  {...register("contrasena")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarContrasena ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.contrasena && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.contrasena.message}
                </p>
              )}
            </motion.div>

            {/* Campo: Confirmar contraseña */}
            <motion.div variants={variantesCampo} className="space-y-1.5">
              <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmarContrasena"
                  type={mostrarConfirmacion ? "text" : "password"}
                  placeholder="Repite tu nueva contraseña"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmarContrasena}
                  className="pr-9"
                  {...register("confirmarContrasena")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                  aria-label={mostrarConfirmacion ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarConfirmacion ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.confirmarContrasena && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.confirmarContrasena.message}
                </p>
              )}
            </motion.div>

            {/* Botón de envío */}
            <motion.div variants={variantesCampo}>
              <Button
                type="submit"
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={estadoEnvio === "cargando"}
              >
                {estadoEnvio === "cargando" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Guardando contraseña…
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>
            </motion.div>
          </motion.form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
