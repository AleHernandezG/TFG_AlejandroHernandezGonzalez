"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ChefHat, Loader2, AlertCircle } from "lucide-react";

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
  esquemaRecuperarContrasena,
  type DatosRecuperarContrasena,
  type EstadoFormulario,
} from "@/features/auth/types/autenticacion";
import { authService } from "@/services/authService";

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

// ─── Componente ──────────────────────────────────────────────────────────────

export function FormularioRecuperarContrasena() {
  const router = useRouter();
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoFormulario>("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosRecuperarContrasena>({
    resolver: zodResolver(esquemaRecuperarContrasena),
    defaultValues: { correo: "" },
  });

  const alEnviar = async (datos: DatosRecuperarContrasena) => {
    setEstadoEnvio("cargando");
    setMensajeError(null);

    try {
      // El backend siempre devuelve 200 (nunca revela si el correo existe)
      await authService.recuperarContrasena({ correo: datos.correo });
      router.push(`/recuperar-contrasena/pendiente?email=${encodeURIComponent(datos.correo)}`);
    } catch {
      setMensajeError(
        "No se pudo enviar el correo. Inténtalo de nuevo en unos segundos."
      );
      setEstadoEnvio("error");
    }
  };

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
            ¿Olvidaste tu contraseña?
          </CardTitle>
          <CardDescription>
            Introduce tu correo y te enviaremos un enlace para restablecerla.
            El enlace será válido durante 1 hora.
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
            {/* Campo: Correo */}
            <motion.div variants={variantesCampo} className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="maria@ejemplo.com"
                autoComplete="email"
                aria-invalid={!!errors.correo}
                {...register("correo")}
              />
              {errors.correo && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.correo.message}
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
                    Enviando enlace…
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Volver al login */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Recuerdas tu contraseña?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
