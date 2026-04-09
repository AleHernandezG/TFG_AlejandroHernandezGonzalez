'use client'

import { Fragment } from 'react'
import { Headphones } from 'lucide-react'

type Props = {
  pasos: string[]
}

export function PasosReceta({ pasos }: Props) {
  return (
    <section className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-foreground">Pasos</h2>
        {/* Modo Manos Libres — Sprint 8 */}
        <button className="flex items-center gap-1.5 bg-[var(--brand-subtle)] text-brand rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide active:scale-95 transition-transform">
          <Headphones size={14} />
          Modo manos libres
        </button>
      </div>

      {/* Lista de pasos */}
      <ol className="list-none p-0 m-0">
        {pasos.map((paso, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="h-px bg-border/40" />}
            <li className="flex gap-4 py-5">
              {/* Círculo numerado — warm amber */}
              <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-subtle)] text-brand font-black text-sm border border-brand/20">
                {i + 1}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{paso}</p>
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  )
}
