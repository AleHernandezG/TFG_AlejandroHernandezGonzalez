import { FeedHome, HeaderHome, LayoutHomePc } from '@/features/recetas/components'

export const metadata = {
  title: 'Inicio — Cookr',
  description: 'Tu feed personalizado de recetas. Descubre, guarda y cocina.',
}

export default function PaginaHome() {
  return (
    <>
      {/* ── Mobile layout (< lg) ─────────────────────── */}
      <div className="min-h-screen bg-background lg:hidden">
        <HeaderHome />
        <FeedHome />
      </div>

      {/* ── Desktop layout (lg+) ─────────────────────── */}
      <div className="hidden lg:block">
        <LayoutHomePc />
      </div>
    </>
  )
}
