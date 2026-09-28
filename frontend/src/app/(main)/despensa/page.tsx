import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContenidoDespensa } from '@/features/despensa/components'
import { SidebarNavPc } from '@/features/recetas/components'

export const metadata: Metadata = {
  title: 'Mi despensa — Cookr',
  description: 'Los ingredientes que tienes en casa, listos para buscar recetas con ellos.',
}

export default function PaginaDespensa() {
  return (
    <>
      <SidebarNavPc />
      <div id="contenido" className="min-h-screen bg-background outline-hidden lg:pl-64">
        <div className="lg:mx-auto lg:max-w-6xl lg:py-10">
          <Suspense>
            <ContenidoDespensa />
          </Suspense>
        </div>
      </div>
    </>
  )
}
