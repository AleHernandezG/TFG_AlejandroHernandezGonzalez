'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import type { RecetaDiscover } from '@/features/discover/types/discover.types'

interface Props {
  receta: RecetaDiscover
}

function formatTiempo(min: number): string {
  if (min <= 0) return ''
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const rest = min % 60
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`
}

export function TarjetaDiscover({ receta }: Props) {
  return (
    <Link href={`/recetas/${receta.id}`} className="block group">
      <article className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-[0px_8px_24px_oklch(0.22_0.02_50_/_0.10)]">
        <Image
          src={receta.imagenUrl ?? '/images/recetas/crearRecetaImagen.webp'}
          alt={receta.titulo}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Gradiente — más fuerte en la parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {/* Badge likes — esquina superior derecha */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-1">
          <Heart size={9} className="text-rose-400" fill="currentColor" />
          <span className="text-white text-[10px] font-semibold leading-none">
            {receta.likes}
          </span>
        </div>

        {/* Contenido inferior */}
        <div className="absolute bottom-0 left-0 w-full px-3 pb-3 pt-6 z-10">
          <h3 className="font-bold text-white text-[13px] leading-snug mb-2 line-clamp-2">
            {receta.titulo}
          </h3>

          <div className="flex items-center justify-between gap-1">
            {/* Autor */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="h-5 w-5 shrink-0 rounded-full bg-brand/70 border border-white/30" />
              <span className="text-white/75 text-[11px] truncate leading-none">
                {receta.autorNombre}
              </span>
            </div>

            {/* Tiempo */}
            {receta.tiempoMin > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Clock size={10} className="text-white/60" />
                <span className="text-white/70 text-[11px] leading-none">
                  {formatTiempo(receta.tiempoMin)}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
