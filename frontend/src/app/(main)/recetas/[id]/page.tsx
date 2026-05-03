import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { opcionesAuth } from '@/lib/auth'
import { recetasService } from '@/services/recetasService'
import { DetalleRecetaCliente } from '@/features/recetas/components'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Detalle de receta — Cookr',
  description: 'Ingredientes, pasos y nutrición de la receta.',
}

export default async function PaginaDetalleReceta({ params }: { params: { id: string } }) {
  const session = await getServerSession(opcionesAuth)
  const token = session?.user?.backendToken

  const receta = await recetasService.obtenerPorId(params.id, token)
  if (!receta) notFound()

  return <DetalleRecetaCliente receta={receta} />
}
