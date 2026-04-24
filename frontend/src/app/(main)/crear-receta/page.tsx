import type { Metadata } from 'next'
import { FormularioCrearReceta } from '@/features/recetas/components/crearReceta'

export const metadata: Metadata = {
  title: 'Nueva receta — Cookr',
}

export default function PaginaCrearReceta() {
  return (
    <main className="max-w-[390px] mx-auto px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Nueva receta</h1>
      <FormularioCrearReceta />
    </main>
  )
}
