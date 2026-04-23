"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2, ChefHat, AlertCircle } from "lucide-react";

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

import { signIn, getSession } from "next-auth/react";
import { BotonGoogle } from "./botonGoogle";
import { DivisorOAuth } from "./divisorOAuth";
import {
  esquemaLogin,
  type DatosLogin,
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

// ─── Componente ──────────────────────────────────────────────────────────────

export function FormularioLogin() {
  const router = useRouter();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoFormulario>("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: {
      correo: "",
      contrasena: "",
    },
  });

  const alEnviar = async (datos: DatosLogin) => {
    setEstadoEnvio("cargando");
    setMensajeError(null);

    const resultado = await signIn("credentials", {
      correo: datos.correo,
      contrasena: datos.contrasena,
      redirect: false,
    });

    if (resultado?.ok) {
      const session = await getSession();
      router.push(session?.user?.perfilCompleto ? "/home" : "/completar-perfil");
      return;
    }

    // resultado.error contiene el mensaje lanzado en authorize()
    if (resultado?.error === "Debes verificar tu correo antes de iniciar sesión") {
      setMensajeError(
        "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
      );
    } else {
      setMensajeError(
        "Correo o contraseña incorrectos. Comprueba tus datos e inténtalo de nuevo."
      );
    }
    setEstadoEnvio("error");
  };

  // ── Formulario ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={variantesContenedor}
      initial="oculto"
      animate="visible"
      className="w-full"
    >
      <Card className="border-border/60 shadow-lg shadow-black/5">
        {/* Cabecera */}
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
            Bienvenido de vuelta
          </CardTitle>
          <CardDescription>
            Inicia sesión para acceder a tus recetas y comunidades
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Botón Google */}
          <BotonGoogle textoAccion="Continuar con Google" />

          {/* Divisor */}
          <DivisorOAuth />

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

          {/* Formulario email + contraseña */}
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

            {/* Campo: Contraseña */}
            <motion.div variants={variantesCampo} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="contrasena">Contraseña</Label>
                {/* TODO Fase 4: enlace real a /recuperar-contrasena */}
                <Link
                  href="/recuperar-contrasena"
                  className="text-xs text-muted-foreground transition-colors hover:text-brand"
                  tabIndex={-1}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
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
                    Iniciando sesión…
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Enlace a registro */}
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="font-medium text-brand hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
