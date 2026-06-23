import { ContenidoDiscover } from '@/features/discover/components'
import { SidebarNavPc } from '@/features/recetas/components'

export const metadata = {
  title: 'Discover · Cookr',
  description: 'Descubre recetas trending, eventos culinarios e inspiración gastronómica.',
}

export default function DiscoverPage() {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <ContenidoDiscover />
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarNavPc />
        <main className="min-h-screen flex-1 pl-64">
          <div className="mx-auto max-w-3xl">
            <ContenidoDiscover />
          </div>
        </main>
      </div>
    </>
  )
}
