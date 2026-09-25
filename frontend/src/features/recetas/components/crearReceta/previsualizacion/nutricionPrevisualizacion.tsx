import type { MacrosReceta } from '@/features/recetas/types/receta.types'

const CAMPOS = [
  { clave: 'calorias', label: 'Calorías', unidad: 'kcal' },
  { clave: 'proteinas', label: 'Proteínas', unidad: 'g' },
  { clave: 'carbos', label: 'Carbohidratos', unidad: 'g' },
  { clave: 'grasas', label: 'Grasas', unidad: 'g' },
] as const

interface Props {
  macros?: MacrosReceta | null
  calculando?: boolean
}

export function NutricionPrevisualizacion({ macros, calculando }: Props) {
  const hayMacros = !!macros && CAMPOS.some(({ clave }) => macros[clave] > 0)

  const subtitulo = calculando
    ? 'Calculando a partir de los ingredientes…'
    : hayMacros
      ? 'Estimación para la receta entera. Se recalcula al publicar.'
      : 'No hemos podido estimarla ahora. Se calculará al publicar.'

  return (
    <div className="px-5 pb-6 pt-4">
      <h2 className="mb-1 text-xl font-extrabold text-foreground">Información nutricional</h2>
      <p className="mb-4 text-xs text-muted-foreground">{subtitulo}</p>
      <div className="grid grid-cols-2 gap-3">
        {CAMPOS.map(({ clave, label, unidad }) => (
          <div key={clave} className="flex flex-col gap-0.5 rounded-2xl bg-(--warm-bg) p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
            {hayMacros ? (
              <span className="text-2xl font-extrabold leading-none text-foreground">
                {macros![clave]} <span className="text-xs text-muted-foreground">{unidad}</span>
              </span>
            ) : (
              <span className="text-2xl font-extrabold leading-none text-foreground/30">
                — <span className="text-xs text-muted-foreground/40">{unidad}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
