'use client'

import { Fragment } from 'react'
import { Headphones, ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react'
import { useModoManoLibres } from '../../hooks/useModoManoLibres'

type Props = {
  pasos: string[]
}

export function PasosReceta({ pasos }: Props) {
  const { activo, pasoActual, pausado, soportado, iniciar, pausar, reanudar, siguiente, anterior, detener } =
    useModoManoLibres()

  return (
    <section className="px-5 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-foreground">Pasos</h2>
        {soportado && !activo && (
          <button
            onClick={() => iniciar(pasos)}
            className="flex items-center gap-1.5 bg-[var(--brand-subtle)] text-brand rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide active:scale-95 transition-transform"
          >
            <Headphones size={14} />
            Modo manos libres
          </button>
        )}
      </div>

      {/* Barra de controles — solo cuando activo */}
      {activo && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 px-4 py-2.5">
          <button
            onClick={anterior}
            disabled={pasoActual === 0}
            className="p-1.5 rounded-full hover:bg-brand/20 disabled:opacity-30 transition-colors text-brand"
            aria-label="Paso anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="flex-1 text-center text-xs font-bold text-brand">
            Paso {pasoActual + 1} de {pasos.length}
          </span>

          <button
            onClick={pausado ? reanudar : pausar}
            className="p-1.5 rounded-full hover:bg-brand/20 transition-colors text-brand"
            aria-label={pausado ? 'Reanudar' : 'Pausar'}
          >
            {pausado ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <button
            onClick={siguiente}
            disabled={pasoActual === pasos.length - 1}
            className="p-1.5 rounded-full hover:bg-brand/20 disabled:opacity-30 transition-colors text-brand"
            aria-label="Siguiente paso"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={detener}
            className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors text-destructive ml-1"
            aria-label="Detener modo manos libres"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Lista de pasos */}
      <ol className="list-none p-0 m-0">
        {pasos.map((paso, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="h-px bg-border/40" />}
            <li
              className={`flex gap-4 py-5 transition-all duration-300 ${
                activo && i === pasoActual
                  ? 'bg-brand/5 -mx-2 px-2 rounded-2xl ring-1 ring-brand/30'
                  : ''
              }`}
            >
              <div
                className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full font-black text-sm border transition-colors ${
                  activo && i === pasoActual
                    ? 'bg-brand text-brand-foreground border-brand'
                    : 'bg-[var(--brand-subtle)] text-brand border-brand/20'
                }`}
              >
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
