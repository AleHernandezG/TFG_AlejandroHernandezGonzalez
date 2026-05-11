import { Sparkles } from 'lucide-react'
import { CHIPS_SUGERIDOS } from '@/features/chat/data/datosChat'

interface Props {
  onChipClick: (texto: string) => void
}

export function EstadoVacioChat({ onChipClick }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-xs flex-col items-center gap-8 text-center">
        {/* Icono animado */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-subtle)] shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
          <Sparkles className="h-7 w-7 text-brand" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold leading-snug tracking-wide text-foreground">
          ¿En qué te puedo{' '}
          <span className="italic text-brand">ayudar?</span>
        </h2>

        {/* Chips sugeridos */}
        <div className="flex w-full flex-col gap-3">
          {CHIPS_SUGERIDOS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => onChipClick(chip.texto)}
              className="flex items-center gap-3 rounded-xl bg-[var(--warm-bg)] px-5 py-3.5 text-left transition-colors hover:bg-[var(--warm-bg-accent)] active:scale-[0.98]"
            >
              <span className="text-xl">{chip.icono}</span>
              <span className="text-sm font-semibold text-foreground">{chip.texto}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
