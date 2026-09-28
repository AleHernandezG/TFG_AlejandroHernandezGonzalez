import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContenidoPerfil } from '@/features/perfil/components'
import { SidebarNavPc } from '@/features/recetas/components'

export const metadata: Metadata = {
  title: 'Mi perfil — Cookr',
  description: 'Tu foto, tus preferencias de dieta y tus alergias.',
}

export default function PaginaPerfil() {
  return (
    <>
      <SidebarNavPc />
      <div id="contenido" className="min-h-screen bg-background outline-hidden lg:pl-64">
        <div className="lg:mx-auto lg:max-w-5xl lg:py-10">
          <Suspense>
            <ContenidoPerfil />
          </Suspense>
        </div>
      </div>
    </>
  )
}
