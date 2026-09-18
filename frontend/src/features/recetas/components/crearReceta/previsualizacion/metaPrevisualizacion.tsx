import { cn } from '@/lib/utils'

interface Props {
  tiempo: number
  unidadTiempo: 'min' | 'h'
  porciones: number
  className?: string
}

export function MetaPrevisualizacion({ tiempo, unidadTiempo, porciones, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="bg-brand/10 text-brand rounded-full px-3 py-1.5 text-xs font-bold">
        ⏱ Listo en {tiempo} {unidadTiempo}
      </span>
      <span className="bg-[var(--warm-bg)] text-foreground/70 rounded-full px-3 py-1.5 text-xs font-bold">
        🍽 {porciones} {porciones === 1 ? 'porción' : 'porciones'}
      </span>
    </div>
  )
}
