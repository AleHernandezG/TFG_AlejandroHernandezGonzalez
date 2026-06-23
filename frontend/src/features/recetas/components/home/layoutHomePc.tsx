'use client'

import { useState } from 'react'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { FeedHomePc } from './feedHomePc'
import { HeaderHomePc } from './headerHomePc'
import { SidebarNavPc } from './sidebarNavPc'

// Desktop-only layout wrapper (rendered only on lg+, see home/page.tsx)
export function LayoutHomePc() {
  const [busqueda, setBusqueda] = useState('')
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados>({
    dietas: [],
    alergenos: [],
    dificultad: [],
  })

  return (
    <>
      <HeaderHomePc
        busqueda={busqueda}
        onBuscar={setBusqueda}
        filtrosAvanzados={filtrosAvanzados}
        onFiltrosAvanzadosChange={setFiltrosAvanzados}
      />
      <SidebarNavPc />

      <main className="min-h-screen bg-background pb-12 pl-64 pt-28">
        <div className="mx-auto max-w-6xl px-8">
          <FeedHomePc busqueda={busqueda} filtrosAvanzados={filtrosAvanzados} />
        </div>
      </main>
    </>
  )
}
