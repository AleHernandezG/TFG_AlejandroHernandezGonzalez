import { Suspense } from 'react'
import { ContenidoPerfil } from '@/features/perfil/components'
import { SidebarNavPc } from '@/features/recetas/components'

export default function PaginaPerfil() {
  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background lg:hidden">
        <Suspense>
          <ContenidoPerfil />
        </Suspense>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarNavPc />
        <main className="min-h-screen flex-1 bg-background pl-64">
          <div className="mx-auto max-w-lg py-10">
            <Suspense>
              <ContenidoPerfil />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  )
}
