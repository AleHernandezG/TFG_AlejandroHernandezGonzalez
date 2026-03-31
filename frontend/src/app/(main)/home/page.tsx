import { FeedHome, HeaderHome } from '@/features/recetas/components'

export const metadata = {
  title: 'Inicio — Cookr',
  description: 'Tu feed personalizado de recetas. Descubre, guarda y cocina.',
}

export default function PaginaHome() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderHome />
      <FeedHome />
    </div>
  )
}
