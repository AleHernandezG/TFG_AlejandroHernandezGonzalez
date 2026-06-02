import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { opcionesAuth } from '@/lib/auth'
import { recetasService } from '@/services/recetasService'
import { DetalleRecetaCliente } from '@/features/recetas/components'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const detalle = await recetasService.obtenerPorId(params.id)
  if (!detalle) return { title: 'Receta — Cookr' }
  const { receta } = detalle
  return {
    title: `${receta.titulo} — Cookr`,
    description: `${receta.descripcion} · ${receta.tiempo} · ${receta.dificultad}`,
    openGraph: {
      title: receta.titulo,
      description: receta.descripcion,
      images: receta.imagenUrl ? [{ url: receta.imagenUrl }] : [],
      type: 'article',
    },
  }
}

export default async function PaginaDetalleReceta({ params }: { params: { id: string } }) {
  const session = await getServerSession(opcionesAuth)
  const token = session?.user?.backendToken

  const receta = await recetasService.obtenerPorId(params.id, token)
  if (!receta) notFound()

  return <DetalleRecetaCliente receta={receta} />
}
