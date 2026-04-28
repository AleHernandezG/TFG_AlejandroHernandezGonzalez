import type { PestanaColeccion, RecetaColeccion } from '../types/coleccion.types'
import { TarjetaColeccion } from './tarjetaColeccion'

interface Props {
  recetas: RecetaColeccion[]
  pestana: PestanaColeccion
}

export function GridRecetasColeccion({ recetas, pestana }: Props) {
  return (
    <div className="px-5 pt-8 pb-10">
      <div className="grid grid-cols-2 gap-4">
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
