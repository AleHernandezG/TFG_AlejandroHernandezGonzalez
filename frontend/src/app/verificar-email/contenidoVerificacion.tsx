'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, ChefHat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authService } from '@/services/authService'

type EstadoVerificacion = 'verificando' | 'exito' | 'error'

type Props = {
  token: string | null
}

export function ContenidoVerificacion({ token }: Props) {
  const [estado, setEstado] = useState<EstadoVerificacion>('verificando')
  const [mensajeError, setMensajeError] = useState<string>(
    'El enlace de verificación no es válido o ha expirado. Los enlaces son válidos durante 24 horas.'
  )

  useEffect(() => {
    if (!token) {
      setEstado('error')
      return
    }

    authService
      .verificarEmail({ token })
      .then(() => setEstado('exito'))
      .catch((err) => {
        const msg = err?.response?.data?.error
        if (msg) setMensajeError(msg)
        setEstado('error')
      })
  }, [token])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* ── Imagen de fondo ── */}
      <Image
        src="/images/fondo-auth.webp"
        alt=""
        fill
        priority
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* ── Contenido ── */}
      <div className="relative z-10 flex w-full flex-col items-center">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-white transition-opacity hover:opacity-70"
          aria-label="Volver a Cookr"
        >
          <ChefHat className="h-6 w-6" aria-hidden />
          <span className="text-lg font-black italic tracking-tight">Cookr</span>
        </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-border/60 shadow-lg">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center">
            {/* ── Verificando ──────────────────────────────────────── */}
            {estado === 'verificando' && (
              <>
                <Loader2 className="h-14 w-14 animate-spin text-brand" aria-hidden />
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold">Verificando tu correo…</h1>
                  <p className="text-sm text-muted-foreground">
                    Solo un momento, estamos confirmando tu cuenta.
                  </p>
                </div>
              </>
            )}

            {/* ── Éxito ────────────────────────────────────────────── */}
            {estado === 'exito' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-6"
              >
                <CheckCircle2 className="h-14 w-14 text-[var(--chart-3)]" aria-hidden />
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight">¡Correo verificado!</h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tu cuenta está activa. Ya puedes iniciar sesión y completar tu perfil.
                  </p>
                </div>
                <Button asChild className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              </motion.div>
            )}

            {/* ── Error ────────────────────────────────────────────── */}
            {estado === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-6"
              >
                <XCircle className="h-14 w-14 text-destructive" aria-hidden />
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight">Enlace no válido</h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {mensajeError}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Button asChild className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                    <Link href="/registro">Crear cuenta de nuevo</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/verificar-email/pendiente">Reenviar verificación</Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  )
}
