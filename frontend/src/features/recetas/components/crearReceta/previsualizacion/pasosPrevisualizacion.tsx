import { Fragment, type ReactNode } from 'react'
import type { PasoPrevisualizado } from './tipos'

interface Props {
  pasos: PasoPrevisualizado[]
  acciones?: ReactNode
  controles?: ReactNode
  pasoResaltado?: number | null
}

export function PasosPrevisualizacion({ pasos, acciones, controles, pasoResaltado = null }: Props) {
  return (
    <section className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-foreground">
          Pasos ({pasos.length})
        </h2>
        {acciones}
      </div>

      {controles}

      <ol className="list-none p-0 m-0">
        {pasos.map((paso, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="h-px bg-border/40" />}
            <li className={`flex gap-4 py-5 transition-all duration-300 ${i === pasoResaltado ? 'bg-brand/5 -mx-2 px-2 rounded-2xl ring-1 ring-brand/30' : ''}`}>
              <div className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full font-black text-sm border transition-colors ${i === pasoResaltado ? 'bg-brand text-brand-foreground border-brand' : 'bg-(--brand-subtle) text-brand border-brand/20'}`}>
                {i + 1}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{paso.texto}</p>
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  )
}
