'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import { recetasService } from '@/services/recetasService'
import { FormularioEditarReceta } from '@/features/recetas/components/editarReceta/formularioEditarReceta'
import type { RecetaDetalle } from '@/features/recetas/types/receta.types'

export default function PaginaEditarReceta() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [receta, setReceta] = useState<RecetaDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }
    if (status !== 'authenticated') return

    async function cargar() {
      try {
        const token = session?.user?.backendToken ?? ''
        const data = await recetasService.obtenerPorId(id, token)
        if (!data) {
          setError('Receta no encontrada.')
          return
        }
        if (data.autor.id !== session?.user?.id) {
          setError('No tienes permiso para editar esta receta.')
          return
        }
        setReceta(data as RecetaDetalle)
      } catch {
        setError('No se pudo cargar la receta.')
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [id, session, status, router])

  if (cargando || status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--warm-bg)] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando receta…</p>
      </div>
    )
  }

  if (error || !receta) {
    return (
      <div className="min-h-screen bg-[var(--warm-bg)] flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-sm text-destructive text-center">{error ?? 'Error desconocido'}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--warm-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--warm-bg)] border-b border-border/40 px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 flex items-center justify-center rounded-xl bg-[var(--warm-bg-accent)] text-foreground hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-extrabold text-foreground leading-tight truncate">
          Editar receta
        </h1>
      </div>

      <div className="px-4 py-4 pb-8">
        <FormularioEditarReceta receta={receta} />
      </div>
    </div>
  )
}
