'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, RefreshCw, ArrowLeft, AlertCircle, FlaskConical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
// TODO [Fase 6]: eliminar esta importación cuando Resend esté integrado
import { apiClient } from '@/services/apiClient'

const COOLDOWN_SEGUNDOS = 60

interface Props {
  email: string
}

/**
 * TarjetaVerificacionPendiente
 *
 * Muestra la instrucción post-registro: el usuario debe revisar su correo.
 * El botón "Reenviar" tiene un cooldown de 60 s para evitar spam.
 *
 * Estado actual: mock — el reenvío real vía Resend se conecta en Fase 6.
 * TODO [AUTH-005] Fase 6: llamar a POST /api/auth/enviar-verificacion.
 */
export function TarjetaVerificacionPendiente({ email }: Props) {
  const router = useRouter()
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  // TODO [Fase 6]: eliminar este estado cuando Resend esté integrado
  const [verificandoDev, setVerificandoDev] = useState(false)
  const [errorDev, setErrorDev] = useState<string | null>(null)

  // Arranca el cooldown cuando se reenvía
  const iniciarCooldown = useCallback(() => {
    setSegundosRestantes(COOLDOWN_SEGUNDOS)
  }, [])

  useEffect(() => {
    if (segundosRestantes <= 0) return
    const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [segundosRestantes])

  // TODO [Fase 6]: eliminar esta función cuando Resend esté integrado
  const handleVerificarDev = async () => {
    setVerificandoDev(true)
    setErrorDev(null)
    try {
      await apiClient.post('/dev/verificar-usuario', { correo: email })
      router.push('/login')
    } catch {
      setErrorDev('No se pudo verificar. ¿Está el backend corriendo?')
      setVerificandoDev(false)
    }
  }

  const handleReenviar = async () => {
    setReenviando(true)
    // TODO [AUTH-005] Fase 6: await axios.post('/api/auth/enviar-verificacion', { email })
    await new Promise((r) => setTimeout(r, 900)) // simula latencia
    setReenviando(false)
    setReenviado(true)
    iniciarCooldown()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
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
              Hemos enviado un enlace de verificación a{' '}
              {email ? (
                <span className="font-semibold text-foreground">{email}</span>
              ) : (
                'tu dirección de correo'
              )}
              . Haz clic en el enlace para activar tu cuenta.
            </p>
          </div>

          {/* Aviso spam */}
          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2.5 text-left text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              ¿No lo ves? Revisa la carpeta de spam o correo no deseado. A veces tarda
              unos minutos.
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

          {/* TODO [Fase 6]: eliminar este bloque cuando Resend esté integrado */}
          {process.env.NODE_ENV === 'development' && (
            <div className="w-full space-y-1.5">
              <Button
                variant="outline"
                className="w-full border-dashed border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600 dark:text-yellow-400"
                onClick={handleVerificarDev}
                disabled={verificandoDev || !email}
              >
                {verificandoDev ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Verificando…
                  </>
                ) : (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4" aria-hidden />
                    [DEV] Verificar cuenta ahora
                  </>
                )}
              </Button>
              {errorDev && (
                <p className="text-center text-xs text-destructive">{errorDev}</p>
              )}
            </div>
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
                {reenviado ? 'Reenviar de nuevo' : 'Reenviar correo'}
              </>
            )}
          </Button>

          {/* Volver */}
          <Link
            href="/registro"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al registro
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
