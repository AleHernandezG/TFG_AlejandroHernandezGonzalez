import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { PestanaColeccion, RecetaColeccion } from '@/features/coleccion/types/coleccion.types'
import { TarjetaColeccion } from './tarjetaColeccion'

interface Props {
  recetas: RecetaColeccion[]
  pestana: PestanaColeccion
}

export function GridRecetasColeccion({ recetas, pestana }: Props) {
  return (
    <div className="px-5 pt-8 pb-10">
      <div className="grid grid-cols-2 gap-4">
        {pestana === 'mis-recetas' && (
          <Link href="/crear-receta" className="block">
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 flex flex-col items-center justify-center gap-2 hover:bg-brand/10 hover:border-brand/60 transition-colors">
              <div className="w-11 h-11 rounded-full bg-brand/15 flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-brand/70 text-center leading-tight px-3">
                Nueva receta
              </span>
            </div>
          </Link>
        )}
        {recetas.map((receta) => (
          <TarjetaColeccion key={receta.id} receta={receta} pestana={pestana} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-1.5 mt-8">
        <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
        <div className="w-6 h-1.5 rounded-full bg-brand" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
      </div>
    </div>
  )
}
