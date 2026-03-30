import { NavBarInferior } from '@/components/common/navBarInferior'

export default function LayoutPrincipal({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <NavBarInferior />
    </>
  )
}
