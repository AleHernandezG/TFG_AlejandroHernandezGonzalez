import { Sparkles } from 'lucide-react'
import type { EventoDestacado } from '@/features/discover/types/discover.types'

interface Props {
  evento: EventoDestacado
}

export function TarjetaDestacada({ evento }: Props) {
  return (
    <div className="relative mx-5 h-44 rounded-2xl overflow-hidden bg-[var(--warm-bg-accent)] shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.1)]">
      {/* Fondo degradado editorial */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-[var(--warm-bg-accent)] to-brand/5" />

      {/* Patrón decorativo */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand/10" />
      <div className="absolute -right-2 -bottom-4 h-20 w-20 rounded-full bg-brand/8" />

      {/* Contenido */}
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Sparkles size={11} />
            {evento.etiqueta}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-extrabold leading-tight text-foreground mb-1">
            {evento.titulo}
          </h2>
          <p className="text-xs text-muted-foreground">{evento.subtitulo}</p>
        </div>
      </div>
    </div>
  )
}
