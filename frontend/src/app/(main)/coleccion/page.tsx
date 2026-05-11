import { Suspense } from 'react'
import { ContenidoColeccion } from '@/features/coleccion/components'
import { SidebarNavPc } from '@/features/recetas/components'

export default function PaginaColeccion() {
  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background lg:hidden">
        <Suspense>
          <ContenidoColeccion />
        </Suspense>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarNavPc />
        <main className="min-h-screen flex-1 bg-background pl-64">
          <div className="mx-auto max-w-2xl py-10">
            <Suspense>
              <ContenidoColeccion />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  )
}
