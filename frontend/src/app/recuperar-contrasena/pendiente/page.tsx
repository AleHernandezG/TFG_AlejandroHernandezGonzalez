import type { Metadata } from 'next'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { TarjetaRecuperacionPendiente } from '@/features/auth/components'

export const metadata: Metadata = {
  title: 'Revisa tu correo — Cookr',
  description: 'Hemos enviado un enlace de recuperación a tu correo electrónico.',
}

interface Props {
  searchParams: { email?: string }
}

/**
 * Página post-solicitud de recuperación — /recuperar-contrasena/pendiente
 *
 * Muestra la instrucción de revisar el correo tras solicitar el restablecimiento.
 * El email se recibe como query param (?email=...) desde formularioRecuperarContrasena.
 *
 * Estado actual: mock — el envío real vía Resend se implementa en Fase 6.
 * TODO [AUTH-008] Fase 6: llamar a POST /api/auth/recuperar-contrasena desde el backend.
 */
export default function PaginaRecuperacionPendiente({ searchParams }: Props) {
  const email = searchParams.email ?? ''

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

      <TarjetaRecuperacionPendiente email={email} />
    </main>
  )
}
