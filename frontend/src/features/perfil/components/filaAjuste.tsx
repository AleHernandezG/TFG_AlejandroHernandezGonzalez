import { ChevronRight, type LucideIcon } from 'lucide-react'

interface Props {
  icono: LucideIcon
  label: string
  onClick: () => void
  separador?: boolean
}

export function FilaAjuste({ icono: Icono, label, onClick, separador = true }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-[var(--warm-bg)] transition-colors text-left${separador ? ' border-b border-border/20' : ''}`}
    >
      <div className="flex items-center gap-4">
        <Icono size={20} className="text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0" />
    </button>
  )
}
