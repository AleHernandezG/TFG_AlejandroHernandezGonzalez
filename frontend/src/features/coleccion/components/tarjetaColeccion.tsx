'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, MoreHorizontal } from 'lucide-react'
import type { PestanaColeccion, RecetaColeccion } from '../types/coleccion.types'

interface Props {
  receta: RecetaColeccion
  pestana: PestanaColeccion
}

export function TarjetaColeccion({ receta, pestana }: Props) {
  return (
    <Link href={`/recetas/${receta.id}`} className="block">
      <article className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-muted shadow-[0px_12px_32px_oklch(0.22_0.02_50_/_0.06)]">
        <Image
          src={receta.imagenUrl}
          alt={receta.titulo}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {pestana === 'guardadas' ? (
          <button
            aria-label="Guardado"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brand shadow-sm hover:scale-110 transition-transform"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            aria-label="Opciones"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute top-3 right-3 z-20 text-white/80 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 z-20">
          <h3 className="font-bold text-white text-base leading-tight mb-2 drop-shadow-sm">
            {receta.titulo}
          </h3>
          <div className="flex items-center gap-2">
            <Image
              src={receta.autor.avatarUrl}
              alt={receta.autor.nombre}
              width={20}
              height={20}
              className="rounded-full object-cover border border-white/20"
            />
            <span className="text-white/90 text-xs font-medium">{receta.autor.nombre}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
