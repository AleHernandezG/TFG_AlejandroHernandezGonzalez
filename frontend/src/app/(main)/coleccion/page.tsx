import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContenidoColeccion } from '@/features/coleccion/components'
import { SidebarNavPc } from '@/features/recetas/components'

export const metadata: Metadata = {
  title: 'Mi colección — Cookr',
  description: 'Tus recetas guardadas y las que has publicado.',
}

export default function PaginaColeccion() {
  return (
    <>
      <SidebarNavPc />
      <div id="contenido" className="min-h-screen bg-background outline-hidden lg:pl-64">
        <div className="lg:mx-auto lg:max-w-6xl lg:py-10">
          <Suspense>
            <ContenidoColeccion />
          </Suspense>
        </div>
      </div>
    </>
  )
}
