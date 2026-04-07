import { RECETA_DETALLE_MOCK } from '@/features/recetas/data/datosDetalle'
import { DetalleRecetaCliente } from '@/features/recetas/components'

export const metadata = {
  title: 'Detalle de receta — Cookr',
  description: 'Ingredientes, pasos y nutrición de la receta.',
}

// Server Component — en Fase 5 se sustituye el mock por:
//   const receta = await recetasService.obtenerPorId(params.id)
//   y se añade useRecetaDetalle(id) hook. Los componentes NO cambian.
export default function PaginaDetalleReceta() {
  const receta = RECETA_DETALLE_MOCK
  return <DetalleRecetaCliente receta={receta} />
}
