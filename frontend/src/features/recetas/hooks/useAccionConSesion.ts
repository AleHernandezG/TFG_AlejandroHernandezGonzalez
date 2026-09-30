'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

export function urlLoginVolviendoA(ruta: string): string {
  return `/login?callbackUrl=${encodeURIComponent(ruta)}`
}

export function useAccionConSesion() {
  const { status } = useSession()
  const router = useRouter()
  const rutaActual = usePathname()

  return function conSesion(accion: () => void) {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push(urlLoginVolviendoA(rutaActual))
      return
    }
    accion()
  }
}
