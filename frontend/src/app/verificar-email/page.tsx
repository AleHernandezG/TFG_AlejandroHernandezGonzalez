'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, ChefHat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type EstadoVerificacion = 'verificando' | 'exito' | 'error'

/**
 * Página de verificación de email — /verificar-email?token=xxx
 *
 * Lee el token de la query string y simula la verificación.
 * Estados: verificando → exito | error
 *
 * Estado actual: mock — la validación real del token se implementa en Fase 4-6.
 * TODO [AUTH-006] Fase 4: llamar a POST /api/auth/verificar-email con el token.
 *                         Validar expiración y firma del token en el backend.
 */
export default function PaginaVerificarEmail() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [estado, setEstado] = useState<EstadoVerificacion>('verificando')

  useEffect(() => {
    // Mock: si hay token → éxito tras 1.5 s; si no hay token → error inmediato
    if (!token) {
      setEstado('error')
      return
    }
    const id = setTimeout(() => setEstado('exito'), 1500)
    return () => clearTimeout(id)
  }, [token])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--auth-dark)] px-4 py-12">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-brand transition-opacity hover:opacity-70"
        aria-label="Volver a Cookr"
      >
        <ChefHat className="h-6 w-6" aria-hidden />
        <span className="text-lg font-bold italic tracking-tight">Cookr</span>
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
                  <h1 className="text-2xl font-bold tracking-tight">
                    ¡Correo verificado!
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tu cuenta está activa. Ya puedes iniciar sesión y descubrir
                    recetas con la comunidad Cookr.
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
                  <h1 className="text-2xl font-bold tracking-tight">
                    Enlace no válido
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    El enlace de verificación no es válido o ha expirado. Los
                    enlaces son válidos durante 24 horas.
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
    </main>
  )
}
