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

import { BotonGoogle } from "./botonGoogle";
import { DivisorOAuth } from "./divisorOAuth";
import {
  esquemaRegistro,
  type DatosRegistro,
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

// ─── Componente ─────────────────────────────────────────────────────────────

export function FormularioRegistro() {
  const router = useRouter();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoFormulario>("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      nombre: "",
      correo: "",
      contrasena: "",
      confirmarContrasena: "",
    },
  });

  const alEnviar = async (datos: DatosRegistro) => {
    setEstadoEnvio("cargando");
    setMensajeError(null);

    try {
      // TODO Fase 4: sustituir por llamada real a POST /api/usuarios/registro en el backend
      // const respuesta = await axios.post("/api/usuarios/registro", datos);
      console.log("[FormularioRegistro] Datos de registro (mock):", {
        nombre: datos.nombre,
        correo: datos.correo,
      });
      await new Promise((r) => setTimeout(r, 1000)); // simula latencia de red
      // Redirige a la pantalla de verificación pendiente pasando el email como query param
      // TODO [AUTH-005] Fase 6: el backend enviará el correo real vía Resend antes de esta redirección
      router.push(`/verificar-email/pendiente?email=${encodeURIComponent(datos.correo)}`);
    } catch {
      setMensajeError(
        "No se pudo crear la cuenta. Inténtalo de nuevo en unos segundos."
      );
      setEstadoEnvio("error");
    }
  };

  // ── Formulario ─────────────────────────────────────────────────────────────
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
            Crea tu cuenta
          </CardTitle>
          <CardDescription>
            Únete a la comunidad gastronómica más creativa
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Botón Google */}
          <BotonGoogle textoAccion="Registrarse con Google" />

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
            {/* Campo: Nombre */}
            <motion.div variants={variantesCampo} className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="María García"
                autoComplete="name"
                aria-invalid={!!errors.nombre}
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.nombre.message}
                </p>
              )}
            </motion.div>

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
              <Label htmlFor="contrasena">Contraseña</Label>
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
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmarContrasena}
                  className="pr-9"
                  {...register("confirmarContrasena")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                  aria-label={
                    mostrarConfirmacion ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
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
                    Creando cuenta…
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Enlace a login */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-brand hover:underline"
            >
              Inicia sesión
            </Link>
          </p>

          {/* Disclaimer legal */}
          <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
            Al crear una cuenta aceptas nuestros{" "}
            <Link
              href="/terminos"
              className="underline underline-offset-2 hover:text-foreground"
            >
              términos de uso
            </Link>{" "}
            y{" "}
            <Link
              href="/privacidad"
              className="underline underline-offset-2 hover:text-foreground"
            >
              política de privacidad
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
