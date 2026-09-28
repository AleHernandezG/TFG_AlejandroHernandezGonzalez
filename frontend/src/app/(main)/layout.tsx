import { EnlaceSaltoContenido } from '@/components/common/enlaceSaltoContenido'
import { NavBarInferior } from '@/components/common/navBarInferior'

export default function LayoutPrincipal({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EnlaceSaltoContenido />
      <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] outline-hidden lg:pb-0">
        {children}
      </main>
      <NavBarInferior />
    </>
  )
}
