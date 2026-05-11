import type { ReactNode } from 'react'

interface Props {
  titulo: string
  children: ReactNode
}

export function GrupoAjustes({ titulo, children }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground px-1">
        {titulo}
      </h3>
      <div className="bg-card rounded-2xl overflow-hidden shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
        {children}
      </div>
    </section>
  )
}
