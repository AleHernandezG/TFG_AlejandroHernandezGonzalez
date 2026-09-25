import { ChipAlergeno } from '@/components/common/chipAlergeno'

interface Props {
  alergenos: string[]
}

export function AlergenosPrevisualizacion({ alergenos }: Props) {
  if (alergenos.length === 0) return null

  return (
    <section className="px-5 pt-6 pb-6">
      <h2 className="text-xl font-extrabold text-foreground mb-3">Alérgenos</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {alergenos.map((id) => (
          <ChipAlergeno key={id} alergenoId={id} size="sm" />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        ⚠️ La detección de alérgenos es orientativa. Consulta siempre con un especialista
        ante cualquier duda o alergia grave.
      </p>
    </section>
  )
}
