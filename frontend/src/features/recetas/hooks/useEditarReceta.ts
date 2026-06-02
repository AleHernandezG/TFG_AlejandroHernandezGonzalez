'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { recetasService } from '@/services/recetasService'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'
import type { DatosCrearReceta } from '@/features/recetas/types/crearReceta.schema'

export function useEditarReceta(recetaId: string) {
  const router = useRouter()
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar(datos: DatosCrearReceta, fotoPreview: string | null) {
    const token = session?.user?.backendToken ?? ''
    const alergenos = detectarAlergenos(datos.ingredientes.map((i) => i.nombre))

    setGuardando(true)
    setError(null)
    try {
      await recetasService.actualizar(
        recetaId,
        {
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          tiempo: datos.tiempo,
          unidadTiempo: datos.unidadTiempo,
          porciones: datos.porciones,
          dificultad: datos.dificultad,
          dietas: datos.dietas,
          alergenos,
          ingredientes: datos.ingredientes,
          pasos: datos.pasos,
          imagenBase64: fotoPreview ?? undefined,
        },
        token,
      )
      await qc.invalidateQueries({ queryKey: ['coleccion', 'mis-recetas'] })
      await qc.invalidateQueries({ queryKey: ['recetas', recetaId] })
      router.push(`/recetas/${recetaId}`)
    } catch {
      setError('No se pudo guardar la receta. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return { guardar, guardando, error }
}
