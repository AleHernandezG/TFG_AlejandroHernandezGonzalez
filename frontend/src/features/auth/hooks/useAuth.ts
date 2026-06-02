'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import axios from 'axios'

function extraerMensaje(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) return error.response?.data?.error ?? fallback
  return fallback
}

export function useAuth() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function iniciarSesion(correo: string, contrasena: string): Promise<void> {
    setCargando(true)
    setError(null)
    const resultado = await signIn('credentials', { correo, contrasena, redirect: false })
    if (resultado?.ok) {
      const session = await getSession()
      router.push(session?.user?.perfilCompleto ? '/home' : '/completar-perfil')
      return
    }
    setError(
      resultado?.error === 'Debes verificar tu correo antes de iniciar sesión'
        ? 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.'
        : 'Correo o contraseña incorrectos. Comprueba tus datos e inténtalo de nuevo.',
    )
    setCargando(false)
  }

  async function registrar(nombre: string, correo: string, contrasena: string): Promise<void> {
    setCargando(true)
    setError(null)
    try {
      await authService.registro({ nombre, correo, contrasena })
      router.push(`/verificar-email/pendiente?email=${encodeURIComponent(correo)}`)
    } catch (e) {
      const msg = extraerMensaje(e, '')
      setError(
        msg === 'Este correo ya está registrado'
          ? 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?'
          : 'No se pudo crear la cuenta. Inténtalo de nuevo en unos segundos.',
      )
      setCargando(false)
    }
  }

  async function recuperarContrasena(correo: string): Promise<void> {
    setCargando(true)
    setError(null)
    try {
      await authService.recuperarContrasena({ correo })
      router.push(`/recuperar-contrasena/pendiente?email=${encodeURIComponent(correo)}`)
    } catch {
      setError('No se pudo enviar el correo. Inténtalo de nuevo en unos segundos.')
      setCargando(false)
    }
  }

  async function nuevaContrasena(token: string, contrasena: string): Promise<boolean> {
    setCargando(true)
    setError(null)
    try {
      await authService.nuevaContrasena({ token, contrasena })
      setCargando(false)
      return true
    } catch (e) {
      setError(
        extraerMensaje(e, 'No se pudo cambiar la contraseña. El enlace puede haber expirado.'),
      )
      setCargando(false)
      return false
    }
  }

  async function reenviarVerificacion(correo: string): Promise<void> {
    await authService.reenviarVerificacion(correo)
  }

  async function reenviarRecuperacion(correo: string): Promise<void> {
    await authService.recuperarContrasena({ correo })
  }

  return {
    iniciarSesion,
    registrar,
    recuperarContrasena,
    nuevaContrasena,
    reenviarVerificacion,
    reenviarRecuperacion,
    cargando,
    error,
  }
}
