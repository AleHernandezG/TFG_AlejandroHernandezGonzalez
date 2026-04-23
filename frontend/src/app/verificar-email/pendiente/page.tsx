import type { Metadata } from 'next'
import Image from 'next/image'
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

export default function PaginaVerificacionPendiente({ searchParams }: Props) {
  const email = searchParams.email ?? ''

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

        <TarjetaVerificacionPendiente email={email} />
      </div>
    </div>
  )
}
