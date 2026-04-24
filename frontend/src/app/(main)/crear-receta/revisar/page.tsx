import type { Metadata } from 'next'
import { PrevisualizacionReceta } from '@/features/recetas/components/crearReceta'

export const metadata: Metadata = {
  title: 'Revisar receta — Cookr',
}

export default function PaginaRevisarReceta() {
  return <PrevisualizacionReceta />
}
