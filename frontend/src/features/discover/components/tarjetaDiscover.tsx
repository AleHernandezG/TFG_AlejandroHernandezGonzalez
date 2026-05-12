'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import type { RecetaDiscover } from '@/features/discover/types/discover.types'

interface Props {
  receta: RecetaDiscover
}

export function TarjetaDiscover({ receta }: Props) {
  return (
    <Link href={`/recetas/${receta.id}`} className="block">
      <article className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
        <Image
          src={receta.imagenUrl ?? '/images/recetas/crearRecetaImagen.webp'}
          alt={receta.titulo}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-3.5 z-10">
          <h3 className="font-bold text-white text-sm leading-tight mb-2 line-clamp-2">
            {receta.titulo}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-brand/50 border border-white/20 shrink-0" />
              <span className="text-white/80 text-xs truncate max-w-[80px]">
                {receta.autorNombre}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Clock size={11} />
                {receta.tiempoMin}m
              </span>
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Heart size={11} />
                {receta.likes}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
