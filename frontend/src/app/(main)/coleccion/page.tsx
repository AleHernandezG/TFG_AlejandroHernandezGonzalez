'use client'

import { cn } from '@/lib/utils'
import { BookMarked, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SidebarNavPc, TarjetaPost } from '@/features/recetas/components'
import { POSTS_MOCK } from '@/features/recetas/data/datosFeed'

type Pestana = 'guardadas' | 'mis-recetas'

const POSTS_GUARDADOS = POSTS_MOCK.filter((p) => p.guardado)
// Mock: primeras 2 recetas como "propias" del usuario
const POSTS_PROPIOS = [POSTS_MOCK[0], POSTS_MOCK[3]]

function EmptyState({ pestana }: { pestana: Pestana }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <BookMarked className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
      {pestana === 'guardadas' ? (
        <>
          <p className="text-base font-semibold text-foreground">Aún no has guardado recetas</p>
          <p className="text-sm text-muted-foreground">
            Toca el marcador en cualquier receta para guardarla aquí.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-foreground">Aún no has creado recetas</p>
          <p className="text-sm text-muted-foreground">
            Comparte tus creaciones con la comunidad.
          </p>
          <Link
            href="/crear-receta"
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground"
          >
            <PlusCircle className="h-4 w-4" />
            Crear receta
          </Link>
        </>
      )}
    </div>
  )
}

function ContenidoColeccion() {
  const [pestana, setPestana] = useState<Pestana>('guardadas')
  const posts = pestana === 'guardadas' ? POSTS_GUARDADOS : POSTS_PROPIOS

  return (
    <div className="px-4 pb-6 pt-6">
      {/* Cabecera */}
      <div className="mb-6 flex items-center gap-2">
        <BookMarked className="h-6 w-6 text-brand" strokeWidth={2} />
        <h1 className="text-2xl font-bold">Mi colección</h1>
      </div>

      {/* Pestañas */}
      <div className="mb-6 flex gap-2">
        {(['guardadas', 'mis-recetas'] as Pestana[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setPestana(tab)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              pestana === tab
                ? 'bg-brand text-brand-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab === 'guardadas' ? 'Guardadas' : 'Mis recetas'}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {posts.length === 0 ? (
        <EmptyState pestana={pestana} />
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <TarjetaPost key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PaginaColeccion() {
  return (
    <>
      {/* Mobile */}
      <div className="min-h-screen bg-background lg:hidden">
        <ContenidoColeccion />
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex">
        <SidebarNavPc />
        <main className="min-h-screen flex-1 bg-background pl-64 pr-8 pt-10">
          <div className="mx-auto max-w-2xl">
            <ContenidoColeccion />
          </div>
        </main>
      </div>
    </>
  )
}
