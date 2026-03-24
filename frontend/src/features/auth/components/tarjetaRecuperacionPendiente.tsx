"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COOLDOWN_SEGUNDOS = 60;

interface Props {
  email: string;
}

/**
 * TarjetaRecuperacionPendiente
 *
 * Pantalla post-solicitud de recuperación: el usuario debe revisar su correo
 * para encontrar el enlace a /nueva-contrasena?token=xxx.
 * El botón "Reenviar" tiene un cooldown de 60 s para evitar spam.
 *
 * Estado actual: mock — el reenvío real vía Resend se conecta en Fase 6.
 * TODO [AUTH-008] Fase 6: llamar a POST /api/auth/recuperar-contrasena para reenviar.
 */
export function TarjetaRecuperacionPendiente({ email }: Props) {
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  const iniciarCooldown = useCallback(() => {
    setSegundosRestantes(COOLDOWN_SEGUNDOS);
  }, []);

  useEffect(() => {
    if (segundosRestantes <= 0) return;
    const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [segundosRestantes]);

  const handleReenviar = async () => {
    setReenviando(true);
    // TODO [AUTH-008] Fase 6: await axios.post('/api/auth/recuperar-contrasena', { correo: email })
    await new Promise((r) => setTimeout(r, 900));
    setReenviando(false);
    setReenviado(true);
    iniciarCooldown();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="border-border/60 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center">
          {/* Icono */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-subtle)]">
            <Mail className="h-8 w-8 text-brand" aria-hidden />
          </div>

          {/* Título y descripción */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Revisa tu correo</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hemos enviado un enlace de recuperación a{" "}
              {email ? (
                <span className="font-semibold text-foreground">{email}</span>
              ) : (
                "tu dirección de correo"
              )}
              . Haz clic en el enlace para restablecer tu contraseña.
            </p>
          </div>

          {/* Aviso spam */}
          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2.5 text-left text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              ¿No lo ves? Revisa la carpeta de spam o correo no deseado. A veces tarda
              unos minutos. El enlace expira en 1 hora.
            </span>
          </div>

          {/* Feedback reenvío */}
          {reenviado && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-brand"
            >
              Correo reenviado correctamente.
            </motion.p>
          )}

          {/* Botón reenviar */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReenviar}
            disabled={reenviando || segundosRestantes > 0}
          >
            {reenviando ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Reenviando…
              </>
            ) : segundosRestantes > 0 ? (
              `Reenviar en ${segundosRestantes} s`
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                {reenviado ? "Reenviar de nuevo" : "Reenviar enlace"}
              </>
            )}
          </Button>

          {/* Volver */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
