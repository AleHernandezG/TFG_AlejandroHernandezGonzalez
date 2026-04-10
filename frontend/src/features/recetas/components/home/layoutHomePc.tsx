'use client'

import { useState } from 'react'
import { FeedHomePc } from './feedHomePc'
import { HeaderHomePc } from './headerHomePc'
import { SidebarNavPc } from './sidebarNavPc'
import { SidebarTendencias } from './sidebarTendencias'

// Desktop-only layout wrapper (rendered only on lg+, see home/page.tsx)
// Owns busqueda + filtrosActivos state and distributes them to HeaderHomePc and FeedHomePc
export function LayoutHomePc() {
  const [busqueda, setBusqueda] = useState('')
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>(['todas'])

  function toggleFiltro(id: string) {
    setFiltrosActivos((prev) => {
      if (id === 'todas') return ['todas']
      const sinTodas = prev.filter((f) => f !== 'todas')
      if (sinTodas.includes(id)) {
        const nuevo = sinTodas.filter((f) => f !== id)
        return nuevo.length === 0 ? ['todas'] : nuevo
      }
      return [...sinTodas, id]
    })
  }

  return (
    <>
      {/* Fixed top header — h-20 */}
      <HeaderHomePc busqueda={busqueda} onBuscar={setBusqueda} />

      {/* Fixed left sidebar — w-64, offset by header height */}
      <SidebarNavPc />

      {/* Scrollable main content — offset left (w-64) + right (w-80) + header (h-20) */}
      <main className="min-h-screen bg-background pb-12 pl-64 pr-80 pt-28">
        <div className="px-8">
          <FeedHomePc
            busqueda={busqueda}
            filtrosActivos={filtrosActivos}
            onFiltroChange={toggleFiltro}
          />
        </div>
      </main>

      {/* Fixed right sidebar — w-80, offset by header height */}
      <SidebarTendencias />
    </>
  )
}
