import type { Metadata } from 'next'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'

import { TarjetaVerificacionPendiente } from '@/features/auth/components/tarjetaVerificacionPendiente'

export const metadata: Metadata = {
  title: 'Revisa tu correo — Cookr',
  description: 'Hemos enviado un enlace de verificación a tu correo electrónico.',
}

interface Props {
  searchParams: { email?: string }
}

/**
 * Página post-registro — /verificar-email/pendiente
 *
 * Muestra la instrucción de revisar el correo tras el registro con email/contraseña.
 * El email se recibe como query param (?email=...) desde formularioRegistro.tsx.
 *
 * Estado actual: mock — el envío real vía Resend se implementa en Fase 6.
 * TODO [AUTH-005] Fase 6: llamar a POST /api/auth/enviar-verificacion desde el backend.
 */
export default function PaginaVerificacionPendiente({ searchParams }: Props) {
  const email = searchParams.email ?? ''

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--auth-dark)] px-4 py-12">
      {/* Logo — enlace a home */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-brand transition-opacity hover:opacity-70"
        aria-label="Volver a Cookr"
      >
        <ChefHat className="h-6 w-6" aria-hidden />
        <span className="text-lg font-bold italic tracking-tight">Cookr</span>
      </Link>

      <TarjetaVerificacionPendiente email={email} />
    </main>
  )
}
