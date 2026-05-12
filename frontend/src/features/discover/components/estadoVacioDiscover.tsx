import { SearchX, RotateCcw } from 'lucide-react'

interface Props {
  query: string
  sugerencias: string[]
  onLimpiar: () => void
  onSugerencia: (s: string) => void
}

export function EstadoVacioDiscover({ query, sugerencias, onLimpiar, onSugerencia }: Props) {
  return (
    <div className="flex flex-col items-center px-5 pt-10 pb-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--warm-bg-accent)]">
        <SearchX size={32} className="text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-xl font-extrabold text-foreground">
        Vaya, el plato está vacío
      </h2>
      <p className="mb-8 text-sm text-muted-foreground leading-relaxed max-w-xs">
        No encontramos recetas para{' '}
        <span className="font-semibold text-brand">«{query}»</span>.{' '}
        Intenta con otros ingredientes o descubre nuevas tendencias.
      </p>

      <button
        onClick={onLimpiar}
        className="mb-10 flex items-center gap-2 rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-foreground shadow-[0px_4px_16px_oklch(0.55_0.18_50_/_0.3)]"
      >
        <RotateCcw size={15} />
        Limpiar búsqueda
      </button>

      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Sugerencias populares
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {sugerencias.map((s) => (
          <button
            key={s}
            onClick={() => onSugerencia(s)}
            className="rounded-full bg-[var(--warm-bg-accent)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand/10 hover:text-brand"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
