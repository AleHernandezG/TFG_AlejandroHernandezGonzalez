'use client'

import { useState } from 'react'
import { BuscadorFiltros } from '@/components/common/buscadorFiltros'
import type { FiltrosAvanzados } from '../../types/receta.types'
import { FeedHome } from './feedHome'
import { HeaderHome } from './headerHome'
import { HeaderHomePc } from './headerHomePc'
import { SidebarNavPc } from './sidebarNavPc'

export function ContenidoHome() {
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

      <div id="contenido" className="min-h-screen bg-background outline-hidden lg:pb-12 lg:pl-64 lg:pt-28">
        <h1 className="sr-only">Tu feed de recetas</h1>
        <HeaderHome />
        <BuscadorFiltros
          busqueda={busqueda}
          onBuscar={setBusqueda}
          filtrosAvanzados={filtrosAvanzados}
          onFiltrosAvanzadosChange={setFiltrosAvanzados}
          className="lg:hidden"
        />

        <div className="lg:mx-auto lg:max-w-6xl lg:px-8">
          <FeedHome busqueda={busqueda} filtrosAvanzados={filtrosAvanzados} />
        </div>
      </div>
    </>
  )
}
