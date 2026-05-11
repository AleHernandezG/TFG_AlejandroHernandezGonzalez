import { Suspense } from 'react'
import { ContenidoDespensa } from '@/features/despensa/components'
import { SidebarNavPc } from '@/features/recetas/components'

export default function PaginaDespensa() {
  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background lg:hidden">
        <Suspense>
          <ContenidoDespensa />
        </Suspense>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarNavPc />
        <main className="min-h-screen flex-1 bg-background pl-64">
          <div className="mx-auto max-w-2xl py-10">
            <Suspense>
              <ContenidoDespensa />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  )
}
