'use client'

import { cn } from '@/lib/utils'
import { FILTROS_FEED, POSTS_MOCK } from '../../data/datosFeed'
import { TarjetaPostPc, type VarianteTarjeta } from './tarjetaPostPc'

// Bento grid layout pattern for first 7 posts:
// [HERO col-span-2 row-span-2][SMALL]
// [HERO continues            ][SMALL]
// [SMALL][WIDE col-span-2        ]
// remaining posts → SMALL
const VARIANTES: VarianteTarjeta[] = [
  'hero', 'small', 'small', 'small', 'wide', 'small', 'small',
]

interface FeedHomePcProps {
  busqueda: string
  filtroActivo: string
  onFiltroChange: (id: string) => void
}

export function FeedHomePc({ busqueda, filtroActivo, onFiltroChange }: FeedHomePcProps) {
  const postsFiltrados = POSTS_MOCK.filter((post) => {
    if (busqueda === '') return true
    const q = busqueda.toLowerCase()
    return (
      post.receta.titulo.toLowerCase().includes(q) ||
      post.receta.descripcion.toLowerCase().includes(q) ||
      post.autor.nombre.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      {/* ── Filter chips ──────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS_FEED.map((filtro) => {
          const activo = filtro.id === filtroActivo
          return (
            <button
              key={filtro.id}
              onClick={() => onFiltroChange(filtro.id)}
              className={cn(
                'shrink-0 rounded-full px-6 py-2 text-sm font-semibold transition-colors',
                activo
                  ? 'bg-brand text-brand-foreground shadow-md shadow-brand/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {filtro.etiqueta}
            </button>
          )
        })}
      </div>

      {/* ── Bento grid ────────────────────────────────── */}
      {postsFiltrados.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {postsFiltrados.map((post, i) => (
            <TarjetaPostPc
              key={post.id}
              post={post}
              variante={VARIANTES[i] ?? 'small'}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="text-base font-semibold text-foreground">Sin resultados</p>
          <p className="text-sm text-muted-foreground">
            Prueba con otro término o cambia el filtro
          </p>
        </div>
      )}
    </div>
  )
}
