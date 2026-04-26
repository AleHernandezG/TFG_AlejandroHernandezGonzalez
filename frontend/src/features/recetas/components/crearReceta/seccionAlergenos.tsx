'use client'

import { AlertTriangle } from 'lucide-react'
import { ChipAlergeno } from '@/components/common/chipAlergeno'

type Props = {
  alergenosDetectados: string[]
}

export function SeccionAlergenos({ alergenosDetectados }: Props) {
  return (
    <section className="bg-[var(--warm-bg-accent)] rounded-2xl p-5 shadow-[0px_4px_20px_oklch(0.1_0.02_50_/_0.4)]">
      <h2 className="text-base font-extrabold text-foreground mb-1">Alérgenos detectados</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Los alérgenos se detectan automáticamente según los ingredientes
      </p>

      {alergenosDetectados.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {alergenosDetectados.map((id) => (
            <ChipAlergeno key={id} alergenoId={id} size="md" />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mb-4 italic">
          Sin alérgenos detectados todavía
        </p>
      )}

      <div className="flex items-start gap-2 bg-destructive/10 rounded-xl px-3 py-2.5">
        <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          ⚠️ La detección de alérgenos es orientativa. Consulta siempre con un especialista ante
          cualquier duda o alergia grave.
        </p>
      </div>
    </section>
  )
}
