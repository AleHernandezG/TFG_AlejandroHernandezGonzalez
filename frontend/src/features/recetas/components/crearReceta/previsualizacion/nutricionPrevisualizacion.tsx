const CAMPOS = [
  { label: 'Calorías', unidad: 'kcal' },
  { label: 'Proteínas', unidad: 'g' },
  { label: 'Carbohidratos', unidad: 'g' },
  { label: 'Grasas', unidad: 'g' },
]

export function NutricionPrevisualizacion() {
  return (
    <div className="px-5 pb-6 pt-4">
      <h2 className="mb-1 text-xl font-extrabold text-foreground">Información nutricional</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Se calculará automáticamente al publicar (Edamam API)
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CAMPOS.map(({ label, unidad }) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-2xl bg-[var(--warm-bg)] p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
            <span className="text-2xl font-extrabold leading-none text-foreground/30">
              — <span className="text-xs text-muted-foreground/40">{unidad}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
