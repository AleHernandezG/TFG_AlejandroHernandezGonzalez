import { ContenidoDiscover } from '@/features/discover/components'
import { SidebarNavPc } from '@/features/recetas/components'

export const metadata = {
  title: 'Discover · Cookr',
  description: 'Descubre recetas trending, eventos culinarios e inspiración gastronómica.',
}

export default function DiscoverPage() {
  return (
    <>
      <SidebarNavPc />
      <div id="contenido" className="min-h-screen outline-hidden lg:pl-64">
        <div className="lg:mx-auto lg:max-w-6xl">
          <ContenidoDiscover />
        </div>
      </div>
    </>
  )
}
