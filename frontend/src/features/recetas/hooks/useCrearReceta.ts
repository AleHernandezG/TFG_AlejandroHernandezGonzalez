'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { recetasService } from '@/services/recetasService'
import { useCrearRecetaStore } from '@/stores/useCrearRecetaStore'
import { detectarAlergenos } from '@/features/recetas/utils/detectarAlergenos'

export function useCrearReceta() {
  const router = useRouter()
  const { data: session } = useSession()
  const { datos, fotoPreview, limpiar } = useCrearRecetaStore()
  const [publicando, setPublicando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publicar(pexelsInfo?: { url: string; fotografo: string; urlFoto: string; urlPerfil: string }) {
    if (!datos) return
    const token = session?.user?.backendToken ?? ''

    const alergenosDetectados = detectarAlergenos(datos.ingredientes.map((i) => i.nombre))

    setPublicando(true)
    setError(null)
    try {
      await recetasService.crear(
        {
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          tiempo: datos.tiempo,
          unidadTiempo: datos.unidadTiempo,
          porciones: datos.porciones,
          dificultad: datos.dificultad,
          dietas: datos.dietas,
          alergenos: alergenosDetectados,
          ingredientes: datos.ingredientes,
          pasos: datos.pasos,
          imagenUrl: fotoPreview ?? pexelsInfo?.url ?? undefined,
          fotoFuente: fotoPreview ? 'usuario' : pexelsInfo ? 'pexels' : undefined,
          fotoCredito: fotoPreview ? null : pexelsInfo ? {
            fotografo: pexelsInfo.fotografo,
            urlFoto: pexelsInfo.urlFoto,
            urlPerfil: pexelsInfo.urlPerfil
          } : null,
        },
        token,
      )
      router.push('/coleccion?tab=mis-recetas')
      limpiar()
    } catch {
      setError('No se pudo publicar la receta. Inténtalo de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  return { publicar, publicando, error }
}
